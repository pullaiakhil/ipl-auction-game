import { Server, Socket } from 'socket.io';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { generateRoomCode } from '../../utils/helpers';

interface RoomData {
  participants: Map<string, {
    socketId: string;
    userId: string;
    userName: string;
    teamId: string | null;
    teamName: string | null;
    isReady: boolean;
    isHost: boolean;
  }>;
}

const rooms = new Map<string, RoomData>();

export function handleRoomEvents(io: Server, socket: Socket): void {
  const userId = (socket as any).userId;
  const userName = (socket as any).userName;

  socket.on('room:create', async (data: {
    name: string;
    mode: 'MEGA' | 'MINI' | 'QUICK';
    purseAmount: number;
    maxParticipants: number;
    timerSeconds: number;
    isPublic: boolean;
    enableAI: boolean;
    aiDifficulty: string;
  }, callback: (response: any) => void) => {
    try {
      const code = generateRoomCode();

      const room = await prisma.auctionRoom.create({
        data: {
          code,
          name: data.name,
          hostId: userId,
          mode: data.mode,
          purseAmount: data.purseAmount,
          maxParticipants: data.maxParticipants || 10,
          timerSeconds: data.timerSeconds || 15,
          isPublic: data.isPublic ?? true,
          enableAI: data.enableAI ?? true,
          aiDifficulty: data.aiDifficulty || 'MEDIUM',
          status: 'WAITING',
        },
      });

      socket.join(room.id);

      rooms.set(room.id, {
        participants: new Map([[socket.id, {
          socketId: socket.id,
          userId,
          userName,
          teamId: null,
          teamName: null,
          isReady: false,
          isHost: true,
        }]]),
      });

      logger.info(`Room created: ${room.code} by ${userName}`);

      callback({
        success: true,
        room: {
          id: room.id,
          code: room.code,
          name: room.name,
          mode: room.mode,
          purseAmount: room.purseAmount,
          maxParticipants: room.maxParticipants,
          timerSeconds: room.timerSeconds,
          isPublic: room.isPublic,
        },
      });
    } catch (error: any) {
      logger.error('Room creation failed:', error);
      callback({ success: false, error: error.message });
    }
  });

  socket.on('room:join', async (data: { code: string }, callback: (response: any) => void) => {
    try {
      const room = await prisma.auctionRoom.findUnique({
        where: { code: data.code.toUpperCase() },
      });

      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }
      if (room.status !== 'WAITING') {
        return callback({ success: false, error: 'Auction already in progress' });
      }

      const roomData = rooms.get(room.id);
      if (roomData && roomData.participants.size >= room.maxParticipants) {
        return callback({ success: false, error: 'Room is full' });
      }

      socket.join(room.id);

      if (!rooms.has(room.id)) {
        rooms.set(room.id, { participants: new Map() });
      }

      const existingParticipantKey = Array.from(rooms.get(room.id)!.participants.entries())
        .find(([_, p]) => p.userId === userId)?.[0];

      let isHost = room.hostId === userId;
      let teamId = null;
      let teamName = null;
      let isReady = false;

      if (existingParticipantKey) {
        const prev = rooms.get(room.id)!.participants.get(existingParticipantKey)!;
        isHost = prev.isHost || isHost;
        teamId = prev.teamId;
        teamName = prev.teamName;
        isReady = prev.isReady;
        rooms.get(room.id)!.participants.delete(existingParticipantKey);
      }

      rooms.get(room.id)!.participants.set(socket.id, {
        socketId: socket.id,
        userId,
        userName,
        teamId,
        teamName,
        isReady,
        isHost,
      });

      // Notify others
      socket.to(room.id).emit('room:playerJoined', {
        userId,
        userName,
        timestamp: Date.now(),
      });

      const participants = Array.from(rooms.get(room.id)!.participants.values());

      callback({
        success: true,
        room: {
          id: room.id,
          code: room.code,
          name: room.name,
          mode: room.mode,
          purseAmount: room.purseAmount,
          participants,
        },
      });

      logger.info(`${userName} joined room ${room.code}`);
    } catch (error: any) {
      logger.error('Room join failed:', error);
      callback({ success: false, error: error.message });
    }
  });

  socket.on('room:selectTeam', async (data: { roomId: string; teamId: string; teamName: string }, callback: (response: any) => void) => {
    try {
      const roomData = rooms.get(data.roomId);
      if (!roomData) return callback({ success: false, error: 'Room not found' });

      const participant = roomData.participants.get(socket.id);
      if (!participant) return callback({ success: false, error: 'Not in room' });

      // Check if team is taken
      const teamTaken = Array.from(roomData.participants.values())
        .some(p => p.teamId === data.teamId && p.socketId !== socket.id);

      if (teamTaken) {
        return callback({ success: false, error: 'Team already selected by another player' });
      }

      participant.teamId = data.teamId;
      participant.teamName = data.teamName;

      io.to(data.roomId).emit('room:teamSelected', {
        userId,
        userName,
        teamId: data.teamId,
        teamName: data.teamName,
      });

      callback({ success: true });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  socket.on('room:toggleReady', (data: { roomId: string }, callback: (response: any) => void) => {
    const roomData = rooms.get(data.roomId);
    if (!roomData) return callback({ success: false, error: 'Room not found' });

    const participant = roomData.participants.get(socket.id);
    if (!participant) return callback({ success: false, error: 'Not in room' });

    if (!participant.teamId) {
      return callback({ success: false, error: 'Select a team first' });
    }

    participant.isReady = !participant.isReady;

    io.to(data.roomId).emit('room:readyStateChanged', {
      userId,
      isReady: participant.isReady,
    });

    callback({ success: true, isReady: participant.isReady });
  });

  socket.on('room:leave', (data: { roomId: string }) => {
    const roomData = rooms.get(data.roomId);
    if (!roomData) return;

    roomData.participants.delete(socket.id);
    socket.leave(data.roomId);

    io.to(data.roomId).emit('room:playerLeft', {
      userId,
      userName,
      timestamp: Date.now(),
    });

    // Clean up empty rooms
    if (roomData.participants.size === 0) {
      rooms.delete(data.roomId);
    }

    logger.info(`${userName} left room ${data.roomId}`);
  });

  socket.on('room:kick', (data: { roomId: string; targetSocketId: string }, callback: (response: any) => void) => {
    const roomData = rooms.get(data.roomId);
    if (!roomData) return callback({ success: false, error: 'Room not found' });

    const requester = roomData.participants.get(socket.id);
    if (!requester?.isHost) return callback({ success: false, error: 'Only host can kick players' });

    const target = roomData.participants.get(data.targetSocketId);
    if (!target) return callback({ success: false, error: 'Player not found' });

    roomData.participants.delete(data.targetSocketId);
    io.to(data.targetSocketId).emit('room:kicked', { reason: 'Kicked by host' });
    io.sockets.sockets.get(data.targetSocketId)?.leave(data.roomId);

    io.to(data.roomId).emit('room:playerLeft', {
      userId: target.userId,
      userName: target.userName,
      reason: 'kicked',
    });

    callback({ success: true });
  });

  socket.on('room:getParticipants', (data: { roomId: string }, callback: (response: any) => void) => {
    const roomData = rooms.get(data.roomId);
    if (!roomData) return callback({ success: false, error: 'Room not found' });

    callback({
      success: true,
      participants: Array.from(roomData.participants.values()),
    });
  });
}

export { rooms };
