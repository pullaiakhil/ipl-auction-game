import { Server, Socket } from 'socket.io';
import { AuctionEngine, AuctionPhase, AuctionParticipant, AuctionPlayer } from '../../engine/auction/AuctionEngine';
import { AIManager, AIPersonality } from '../../engine/ai/AIManager';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { activeAuctions } from '../index';
import { rooms } from './room.handler';

const aiManagers = new Map<string, AIManager>();

const AI_PERSONALITIES: AIPersonality[] = ['AGGRESSIVE', 'BALANCED', 'VALUE_SEEKER', 'SQUAD_FILLER', 'MONEYBALL'];

export function handleAuctionEvents(io: Server, socket: Socket): void {
  const userId = (socket as any).userId;
  const userName = (socket as any).userName;

  socket.on('auction:start', async (data: { roomId: string }, callback: (response: any) => void) => {
    try {
      const roomData = rooms.get(data.roomId);
      if (!roomData) return callback({ success: false, error: 'Room not found' });

      const host = roomData.participants.get(socket.id);
      if (!host?.isHost) return callback({ success: false, error: 'Only host can start' });

      // Check all human participants are ready
      const humanParticipants = Array.from(roomData.participants.values());
      const allReady = humanParticipants.every(p => p.isReady || p.isHost);
      if (!allReady) return callback({ success: false, error: 'Not all players are ready' });

      // Fetch auction room config
      const room = await prisma.auctionRoom.findUnique({
        where: { id: data.roomId },
      });
      if (!room) return callback({ success: false, error: 'Room not found in database' });

      // Create auction engine
      const engine = new AuctionEngine(data.roomId, {
        mode: room.mode as 'MEGA' | 'MINI' | 'QUICK',
        purseAmount: Number(room.purseAmount),
        maxSquadSize: room.maxSquadSize,
        minSquadSize: room.minSquadSize,
        maxOverseas: room.maxOverseas,
        timerSeconds: room.timerSeconds,
        antiSnipeSeconds: 5,
        enableAI: room.enableAI,
        aiDifficulty: room.aiDifficulty as any,
      });

      // Add human participants
      const teams = await prisma.team.findMany();
      for (const [, p] of roomData.participants) {
        const team = teams.find(t => t.id === p.teamId);
        if (team) {
          engine.addParticipant({
            id: p.userId,
            userId: p.userId,
            teamId: team.id,
            teamName: team.name,
            teamShortName: team.shortName,
            teamColor: team.primaryColor,
            isAI: false,
            budget: Number(room.purseAmount) * 100, // Convert Cr to Lakhs
            initialBudget: Number(room.purseAmount) * 100,
            players: [],
            overseasCount: 0,
            isReady: true,
            isConnected: true,
            rtmCards: room.mode === 'MINI' ? 3 : 0,
          });
        }
      }

      // Add AI teams if enabled
      const aiManager = new AIManager();
      if (room.enableAI) {
        const usedTeamIds = new Set(humanParticipants.map(p => p.teamId).filter(Boolean));
        const availableTeams = teams.filter(t => !usedTeamIds.has(t.id));
        const aiCount = Math.min(10 - humanParticipants.length, availableTeams.length);

        for (let i = 0; i < aiCount; i++) {
          const team = availableTeams[i];
          const personality = AI_PERSONALITIES[i % AI_PERSONALITIES.length];
          const aiId = `ai_${team.shortName}_${i}`;

          engine.addParticipant({
            id: aiId,
            userId: null,
            teamId: team.id,
            teamName: team.name,
            teamShortName: team.shortName,
            teamColor: team.primaryColor,
            isAI: true,
            budget: Number(room.purseAmount) * 100,
            initialBudget: Number(room.purseAmount) * 100,
            players: [],
            overseasCount: 0,
            isReady: true,
            isConnected: true,
            rtmCards: room.mode === 'MINI' ? 3 : 0,
          });

          aiManager.registerAI(aiId, personality);
        }
      }
      aiManagers.set(data.roomId, aiManager);

      // Fetch and set player pool
      const players = await prisma.player.findMany({
        orderBy: [{ isMarquee: 'desc' }, { overallRating: 'desc' }],
      });

      const auctionPlayers: AuctionPlayer[] = players.map((p, idx) => ({
        id: p.id,
        playerId: p.id,
        name: p.name,
        role: p.role,
        subRole: p.subRole || p.role,
        country: p.country,
        nationality: p.nationality as 'INDIAN' | 'OVERSEAS',
        basePrice: Number(p.basePrice),
        overallRating: p.overallRating,
        battingRating: p.battingRating,
        bowlingRating: p.bowlingRating,
        isMarquee: p.isMarquee,
        isCapped: p.isCapped,
        setNumber: 0,
        imageUrl: p.imageUrl || undefined,
        stats: {
          matches: p.matches,
          runs: p.runs,
          wickets: p.wickets,
          strikeRate: Number(p.strikeRate),
          economy: Number(p.economy),
        },
      }));

      // Limit pool based on mode
      let poolSize = auctionPlayers.length;
      if (room.mode === 'QUICK') poolSize = Math.min(80, poolSize);
      else if (room.mode === 'MINI') poolSize = Math.min(200, poolSize);

      engine.setPlayerPool(auctionPlayers.slice(0, poolSize));

      // Wire engine events to socket broadcasts
      wireEngineEvents(io, engine, data.roomId, aiManager);

      // Store engine
      activeAuctions.set(data.roomId, engine);

      // Update room status
      await prisma.auctionRoom.update({
        where: { id: data.roomId },
        data: { status: 'LIVE', startedAt: new Date() },
      });

      // Start!
      engine.start();

      callback({ success: true });
      logger.info(`Auction started in room ${data.roomId}`);
    } catch (error: any) {
      logger.error('Auction start failed:', error);
      callback({ success: false, error: error.message });
    }
  });

  socket.on('auction:bid', (data: { roomId: string; amount: number }, callback: (response: any) => void) => {
    const engine = activeAuctions.get(data.roomId) as AuctionEngine | undefined;
    if (!engine) return callback({ success: false, error: 'No active auction' });

    const result = engine.placeBid((socket as any).userId, data.amount);
    callback(result);
  });

  socket.on('auction:rtm', (data: { roomId: string }, callback: (response: any) => void) => {
    const engine = activeAuctions.get(data.roomId) as AuctionEngine | undefined;
    if (!engine) return callback({ success: false, error: 'No active auction' });

    const result = engine.useRTM((socket as any).userId);
    callback(result);
  });

  socket.on('auction:pause', async (data: { roomId: string }, callback: (response: any) => void) => {
    try {
      const room = await prisma.auctionRoom.findUnique({ where: { id: data.roomId } });
      if (!room) return callback({ success: false, error: 'Room not found' });

      if (room.hostId !== (socket as any).userId) {
        return callback({ success: false, error: 'Only host can pause' });
      }

      const engine = activeAuctions.get(data.roomId) as AuctionEngine | undefined;
      if (!engine) return callback({ success: false, error: 'No active auction' });

      engine.pause();
      callback({ success: true });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  socket.on('auction:resume', async (data: { roomId: string }, callback: (response: any) => void) => {
    try {
      const room = await prisma.auctionRoom.findUnique({ where: { id: data.roomId } });
      if (!room) return callback({ success: false, error: 'Room not found' });

      if (room.hostId !== (socket as any).userId) {
        return callback({ success: false, error: 'Only host can resume' });
      }

      const engine = activeAuctions.get(data.roomId) as AuctionEngine | undefined;
      if (!engine) return callback({ success: false, error: 'No active auction' });

      engine.resume();
      callback({ success: true });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  socket.on('auction:getState', (data: { roomId: string }, callback: (response: any) => void) => {
    const engine = activeAuctions.get(data.roomId) as AuctionEngine | undefined;
    if (!engine) return callback({ success: false, error: 'No active auction' });

    socket.join(data.roomId);
    callback({ success: true, state: engine.getPublicState() });
  });
}

function wireEngineEvents(io: Server, engine: AuctionEngine, roomId: string, aiManager: AIManager): void {
  engine.on('auctionStarted', (data) => {
    io.to(roomId).emit('auction:started', data);
  });

  engine.on('playerRevealed', (data) => {
    io.to(roomId).emit('auction:playerRevealed', data);
  });

  engine.on('biddingStarted', (data) => {
    io.to(roomId).emit('auction:biddingStarted', data);
    // Trigger AI bidding
    triggerAIBids(io, engine, roomId, aiManager);
  });

  engine.on('bidPlaced', (data) => {
    io.to(roomId).emit('auction:bidPlaced', data);
    // Trigger AI response to bid
    triggerAIBids(io, engine, roomId, aiManager);
  });

  engine.on('goingOnce', (data) => {
    io.to(roomId).emit('auction:goingOnce', data);
    // Last chance for AI
    triggerAIBids(io, engine, roomId, aiManager);
  });

  engine.on('goingTwice', (data) => {
    io.to(roomId).emit('auction:goingTwice', data);
    triggerAIBids(io, engine, roomId, aiManager);
  });

  engine.on('playerSold', (data) => {
    io.to(roomId).emit('auction:playerSold', data);
  });

  engine.on('playerUnsold', (data) => {
    io.to(roomId).emit('auction:playerUnsold', data);
  });

  engine.on('timerTick', (data) => {
    io.to(roomId).emit('auction:timerTick', data);
  });

  engine.on('setBreak', (data) => {
    io.to(roomId).emit('auction:setBreak', data);
  });

  engine.on('auctionComplete', async (data) => {
    io.to(roomId).emit('auction:complete', data);

    // Save results to database
    try {
      await prisma.auctionRoom.update({
        where: { id: roomId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    } catch (err) {
      logger.error('Failed to save auction results:', err);
    }

    // Cleanup
    activeAuctions.delete(roomId);
    aiManagers.delete(roomId);
  });

  engine.on('auctionPaused', () => {
    io.to(roomId).emit('auction:paused', {});
  });

  engine.on('auctionResumed', () => {
    io.to(roomId).emit('auction:resumed', {});
  });

  engine.on('rtmUsed', (data) => {
    io.to(roomId).emit('auction:rtmUsed', data);
  });
}

function triggerAIBids(io: Server, engine: AuctionEngine, roomId: string, aiManager: AIManager): void {
  const state = engine.getPublicState();
  if (!state.currentPlayer) return;

  const phase = engine.getCurrentPhase();
  if (phase !== AuctionPhase.BIDDING &&
      phase !== AuctionPhase.GOING_ONCE &&
      phase !== AuctionPhase.GOING_TWICE) return;

  const aiIds = aiManager.getAIIds();

  for (const aiId of aiIds) {
    const participant = engine.getParticipant(aiId);
    if (!participant) continue;

    const decision = aiManager.shouldBid(
      aiId,
      participant,
      state.currentPlayer,
      state.currentBid,
      state.currentBidder,
      engine.getMinBidAmount()
    );

    if (decision.shouldBid) {
      setTimeout(() => {
        // Check if still in active bidding phase
        const currentPhase = engine.getCurrentPhase();
        if (currentPhase === AuctionPhase.BIDDING ||
            currentPhase === AuctionPhase.GOING_ONCE ||
            currentPhase === AuctionPhase.GOING_TWICE) {
          
          // Re-evaluate bid at execution time to prevent race conditions and stale lower bids
          const currentState = engine.getPublicState();
          const currentMinBid = engine.getMinBidAmount();
          
          if (currentState.currentBidder === aiId) return;

          const updatedDecision = aiManager.shouldBid(
            aiId,
            participant,
            currentState.currentPlayer!,
            currentState.currentBid,
            currentState.currentBidder,
            currentMinBid
          );

          if (updatedDecision.shouldBid) {
            const result = engine.placeBid(aiId, updatedDecision.amount);
            if (result.success) {
              logger.info(`AI ${participant.teamShortName} bid ₹${updatedDecision.amount}L`);
            }
          }
        }
      }, decision.delay);
    }
  }
}
