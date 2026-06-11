import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';

export enum AuctionPhase {
  WAITING = 'WAITING',
  PLAYER_REVEAL = 'PLAYER_REVEAL',
  BIDDING = 'BIDDING',
  GOING_ONCE = 'GOING_ONCE',
  GOING_TWICE = 'GOING_TWICE',
  SOLD = 'SOLD',
  UNSOLD = 'UNSOLD',
  NEXT_PLAYER = 'NEXT_PLAYER',
  ROUND_BREAK = 'ROUND_BREAK',
  PAUSED = 'PAUSED',
  COMPLETE = 'COMPLETE',
}

export interface AuctionPlayer {
  id: string;
  playerId: string;
  name: string;
  role: string;
  subRole: string;
  country: string;
  nationality: 'INDIAN' | 'OVERSEAS' | 'ASSOCIATE';
  basePrice: number;
  overallRating: number;
  battingRating: number;
  bowlingRating: number;
  isMarquee: boolean;
  isCapped: boolean;
  setNumber: number;
  imageUrl?: string;
  stats: Record<string, number>;
}

export interface AuctionBid {
  participantId: string;
  teamName: string;
  amount: number;
  timestamp: number;
  isRTM: boolean;
}

export interface AuctionParticipant {
  id: string;
  userId: string | null;
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamColor: string;
  isAI: boolean;
  budget: number;
  initialBudget: number;
  players: AuctionPlayer[];
  overseasCount: number;
  isReady: boolean;
  isConnected: boolean;
  rtmCards: number;
}

export interface AuctionConfig {
  mode: 'MEGA' | 'MINI' | 'QUICK';
  purseAmount: number;
  maxSquadSize: number;
  minSquadSize: number;
  maxOverseas: number;
  timerSeconds: number;
  antiSnipeSeconds: number;
  enableAI: boolean;
  aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
}

export interface AuctionState {
  roomId: string;
  phase: AuctionPhase;
  config: AuctionConfig;
  participants: Map<string, AuctionParticipant>;
  currentPlayer: AuctionPlayer | null;
  currentBid: number;
  currentBidder: string | null;
  currentBidderName: string | null;
  bidHistory: AuctionBid[];
  timer: number;
  currentSet: number;
  totalSets: number;
  soldPlayers: { player: AuctionPlayer; buyer: string; price: number }[];
  unsoldPlayers: AuctionPlayer[];
  remainingPlayers: AuctionPlayer[];
  isPaused: boolean;
}

export class AuctionEngine extends EventEmitter {
  private state: AuctionState;
  private timerInterval: NodeJS.Timeout | null = null;
  private playerPool: AuctionPlayer[][] = [];

  constructor(roomId: string, config: AuctionConfig) {
    super();
    this.state = {
      roomId,
      phase: AuctionPhase.WAITING,
      config,
      participants: new Map(),
      currentPlayer: null,
      currentBid: 0,
      currentBidder: null,
      currentBidderName: null,
      bidHistory: [],
      timer: config.timerSeconds,
      currentSet: 0,
      totalSets: 0,
      soldPlayers: [],
      unsoldPlayers: [],
      remainingPlayers: [],
      isPaused: false,
    };
  }

  addParticipant(participant: AuctionParticipant): void {
    this.state.participants.set(participant.id, participant);
    this.emit('participantJoined', participant);
    logger.info(`Participant ${participant.teamName} joined auction ${this.state.roomId}`);
  }

  removeParticipant(participantId: string): void {
    const participant = this.state.participants.get(participantId);
    if (participant) {
      this.state.participants.delete(participantId);
      this.emit('participantLeft', participant);
    }
  }

  setPlayerPool(players: AuctionPlayer[]): void {
    this.playerPool = this.organizeIntoSets(players);
    this.state.totalSets = this.playerPool.length;
    this.state.remainingPlayers = players;
    logger.info(`Player pool set: ${players.length} players in ${this.playerPool.length} sets`);
  }

  private organizeIntoSets(players: AuctionPlayer[]): AuctionPlayer[][] {
    const sets: AuctionPlayer[][] = [];

    // Set 1: Marquee players
    const marquee = players.filter(p => p.isMarquee);
    if (marquee.length > 0) sets.push(this.shuffleArray(marquee));

    // Set 2: Capped overseas
    const cappedOverseas = players.filter(p => !p.isMarquee && p.isCapped && p.nationality === 'OVERSEAS');
    if (cappedOverseas.length > 0) sets.push(this.shuffleArray(cappedOverseas));

    // Set 3: Capped Indian batsmen
    const cappedIndianBat = players.filter(p => !p.isMarquee && p.isCapped && p.nationality === 'INDIAN' && ['BATSMAN', 'WICKET_KEEPER'].includes(p.role));
    if (cappedIndianBat.length > 0) sets.push(this.shuffleArray(cappedIndianBat));

    // Set 4: Capped Indian bowlers
    const cappedIndianBowl = players.filter(p => !p.isMarquee && p.isCapped && p.nationality === 'INDIAN' && ['BOWLER'].includes(p.role));
    if (cappedIndianBowl.length > 0) sets.push(this.shuffleArray(cappedIndianBowl));

    // Set 5: Capped Indian all-rounders
    const cappedIndianAR = players.filter(p => !p.isMarquee && p.isCapped && p.nationality === 'INDIAN' && p.role === 'ALL_ROUNDER');
    if (cappedIndianAR.length > 0) sets.push(this.shuffleArray(cappedIndianAR));

    // Set 6: Uncapped players
    const uncapped = players.filter(p => !p.isCapped);
    if (uncapped.length > 0) sets.push(this.shuffleArray(uncapped));

    return sets;
  }

  start(): void {
    logger.info(`[Engine] start() called for room ${this.state.roomId}. Phase: ${this.state.phase}, Participants: ${this.state.participants.size}`);
    if (this.state.phase !== AuctionPhase.WAITING) {
      throw new Error('Auction already started');
    }
    if (this.state.participants.size < 2) {
      throw new Error('Need at least 2 participants');
    }
    if (this.playerPool.length === 0) {
      throw new Error('No players in pool');
    }

    this.state.currentSet = 0;
    this.state.phase = AuctionPhase.NEXT_PLAYER;
    this.emit('auctionStarted', this.getPublicState());
    logger.info(`[Engine] Auction ${this.state.roomId} transitioned to NEXT_PLAYER`);
    this.presentNextPlayer();
  }

  presentNextPlayer(): void {
    logger.info(`[Engine] presentNextPlayer() called. Current Set Index: ${this.state.currentSet}`);
    // Find next player from current set
    while (this.state.currentSet < this.playerPool.length) {
      const currentSetPlayers = this.playerPool[this.state.currentSet];
      const nextPlayer = currentSetPlayers.shift();

      if (nextPlayer) {
        logger.info(`[Engine] Found next player: ${nextPlayer.name} (Base Price: ₹${nextPlayer.basePrice}L)`);
        this.state.currentPlayer = nextPlayer;
        this.state.currentBid = nextPlayer.basePrice;
        this.state.currentBidder = null;
        this.state.currentBidderName = null;
        this.state.bidHistory = [];
        this.state.phase = AuctionPhase.PLAYER_REVEAL;

        this.emit('playerRevealed', {
          player: nextPlayer,
          setNumber: this.state.currentSet + 1,
          totalSets: this.state.totalSets,
        });

        // After 3 second reveal, start bidding
        logger.info(`[Engine] Scheduling 3s reveal timer for ${nextPlayer.name}`);
        setTimeout(() => {
          logger.info(`[Engine] 3s reveal timer completed for ${nextPlayer.name}. Current phase: ${this.state.phase}`);
          if (this.state.phase === AuctionPhase.PLAYER_REVEAL) {
            this.startBidding();
          }
        }, 3000);
        return;
      }

      logger.info(`[Engine] Current Set Index ${this.state.currentSet} exhausted. Moving to next set...`);
      this.state.currentSet++;
      if (this.state.currentSet < this.playerPool.length) {
        this.emit('setBreak', { nextSet: this.state.currentSet + 1 });
      }
    }

    // All sets exhausted
    logger.info(`[Engine] All sets exhausted. Completing auction.`);
    this.complete();
  }

  private startBidding(): void {
    this.state.phase = AuctionPhase.BIDDING;
    this.state.timer = this.state.config.timerSeconds;
    logger.info(`[Engine] startBidding() called for ${this.state.currentPlayer?.name}. Timer set to ${this.state.timer}s`);
    this.emit('biddingStarted', {
      player: this.state.currentPlayer,
      basePrice: this.state.currentBid,
      timer: this.state.timer,
    });
    this.startTimer();
  }

  placeBid(participantId: string, amount: number): { success: boolean; error?: string } {
    logger.info(`[Engine] placeBid() called. Participant: ${participantId}, Amount: ₹${amount}L, Current Bid: ₹${this.state.currentBid}L, Phase: ${this.state.phase}`);
    
    // Strict server-side validation rules
    if (typeof amount !== 'number' || isNaN(amount)) {
      logger.warn(`[Engine] Bid rejected: Amount is NaN or not a number`);
      return { success: false, error: 'Invalid bid amount' };
    }

    if (this.state.phase !== AuctionPhase.BIDDING &&
        this.state.phase !== AuctionPhase.GOING_ONCE &&
        this.state.phase !== AuctionPhase.GOING_TWICE) {
      logger.warn(`[Engine] Bid rejected: Not in active bidding phase (Phase: ${this.state.phase})`);
      return { success: false, error: 'Not in bidding phase' };
    }

    // Explicit validation: new bid must be strictly greater than current bid (unless first bid equals base price)
    if (this.state.currentBidder !== null && amount <= this.state.currentBid) {
      logger.warn(`[Engine] Bid rejected: Bid amount ₹${amount}L is less than or equal to current highest bid ₹${this.state.currentBid}L`);
      return { success: false, error: `Bid must be greater than current bid (₹${this.state.currentBid}L)` };
    }
    if (amount < this.state.currentBid) {
      logger.warn(`[Engine] Bid rejected: Bid amount ₹${amount}L is less than base price ₹${this.state.currentBid}L`);
      return { success: false, error: `Bid must be at least base price (₹${this.state.currentBid}L)` };
    }

    const participant = this.state.participants.get(participantId);
    if (!participant) {
      logger.warn(`[Engine] Bid rejected: Participant ${participantId} not found`);
      return { success: false, error: 'Participant not found' };
    }

    // Duplicate bid prevention
    if (participant.id === this.state.currentBidder) {
      logger.warn(`[Engine] Bid rejected: Team ${participant.teamShortName} is already the highest bidder`);
      return { success: false, error: 'You are already the highest bidder' };
    }

    // Validate bid details (purse, squad limits, overseas limits)
    const validation = this.validateBid(participant, amount);
    if (!validation.valid) {
      logger.warn(`[Engine] Bid validation failed: ${validation.error}`);
      return { success: false, error: validation.error };
    }

    // Place bid
    this.state.currentBid = amount;
    this.state.currentBidder = participantId;
    this.state.currentBidderName = participant.teamName;

    const bid: AuctionBid = {
      participantId,
      teamName: participant.teamName,
      amount,
      timestamp: Date.now(),
      isRTM: false,
    };
    this.state.bidHistory.push(bid);

    // Reset timer (anti-snipe)
    if (this.state.timer <= this.state.config.antiSnipeSeconds) {
      this.state.timer = this.state.config.antiSnipeSeconds + 2;
    } else {
      this.state.timer = Math.max(this.state.timer, this.state.config.timerSeconds);
    }

    // Reset phase to BIDDING if was going once/twice
    this.state.phase = AuctionPhase.BIDDING;

    this.emit('bidPlaced', {
      bid,
      currentBid: this.state.currentBid,
      currentBidder: participant.teamName,
      currentBidderName: participant.teamName,
      timer: this.state.timer,
    });

    logger.info(`[Engine] Successful Bid: ${participant.teamName} bid ₹${amount}L on ${this.state.currentPlayer?.name}`);
    return { success: true };
  }

  useRTM(participantId: string): { success: boolean; error?: string } {
    logger.info(`[Engine] useRTM() called by participant: ${participantId}`);
    if (this.state.phase !== AuctionPhase.GOING_ONCE &&
        this.state.phase !== AuctionPhase.GOING_TWICE) {
      return { success: false, error: 'RTM only available during going once/twice' };
    }

    const participant = this.state.participants.get(participantId);
    if (!participant) return { success: false, error: 'Participant not found' };
    if (participant.rtmCards <= 0) return { success: false, error: 'No RTM cards remaining' };

    const currentBid = this.state.currentBid;
    if (participant.budget < currentBid) {
      return { success: false, error: 'Insufficient budget for RTM' };
    }

    participant.rtmCards--;
    this.state.currentBidder = participantId;
    this.state.currentBidderName = participant.teamName;

    const bid: AuctionBid = {
      participantId,
      teamName: participant.teamName,
      amount: currentBid,
      timestamp: Date.now(),
      isRTM: true,
    };
    this.state.bidHistory.push(bid);

    this.state.timer = this.state.config.timerSeconds;
    this.state.phase = AuctionPhase.BIDDING;

    this.emit('rtmUsed', {
      participant: participant.teamName,
      amount: currentBid,
      player: this.state.currentPlayer?.name,
    });

    logger.info(`[Engine] RTM used: ${participant.teamName} claimed ${this.state.currentPlayer?.name} for ₹${currentBid}L`);
    return { success: true };
  }

  private validateBid(participant: AuctionParticipant, amount: number): { valid: boolean; error?: string } {
    // Check minimum bid increment
    const minBid = this.getMinBid();
    if (amount < minBid) {
      return { valid: false, error: `Minimum bid is ₹${minBid}L` };
    }

    // Check budget
    const remainingBudget = participant.budget;
    const minRequiredForRemaining = this.getMinBudgetRequired(participant);
    if (amount > remainingBudget - minRequiredForRemaining) {
      return { valid: false, error: 'Insufficient budget (must reserve for minimum squad)' };
    }

    // Check squad size
    if (participant.players.length >= this.state.config.maxSquadSize) {
      return { valid: false, error: 'Squad is full' };
    }

    // Check overseas limit
    if (this.state.currentPlayer?.nationality === 'OVERSEAS' &&
        participant.overseasCount >= this.state.config.maxOverseas) {
      return { valid: false, error: 'Overseas player limit reached' };
    }

    return { valid: true };
  }

  private getMinBid(): number {
    if (!this.state.currentBidder) {
      return this.state.currentBid; // Base price, no increment needed
    }

    const current = this.state.currentBid;
    let increment: number;

    if (current < 100) increment = 5;        // Under 1Cr: +5L
    else if (current < 200) increment = 10;   // 1-2Cr: +10L
    else if (current < 500) increment = 10;   // 2-5Cr: +10L
    else if (current < 1000) increment = 20;  // 5-10Cr: +20L
    else increment = 25;                       // 10+Cr: +25L

    return current + increment;
  }

  private getMinBudgetRequired(participant: AuctionParticipant): number {
    const slotsNeeded = Math.max(0, this.state.config.minSquadSize - participant.players.length - 1);
    return slotsNeeded * 20; // Minimum 20L per remaining slot
  }

  private startTimer(): void {
    this.stopTimer();
    logger.info(`[Engine] startTimer() started. Current timer value: ${this.state.timer}s`);
    this.timerInterval = setInterval(() => {
      if (this.state.isPaused) return;

      this.state.timer--;
      // Emit tick event
      this.emit('timerTick', { timer: this.state.timer });

      if (this.state.timer <= 0) {
        logger.info(`[Engine] Timer reached 0. Triggering handleTimerExpiry()`);
        this.handleTimerExpiry();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      logger.info(`[Engine] stopTimer() called, clearing interval`);
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private handleTimerExpiry(): void {
    this.stopTimer();
    logger.info(`[Engine] handleTimerExpiry called. Phase: ${this.state.phase}, Bidder: ${this.state.currentBidder}`);

    if (this.state.phase === AuctionPhase.BIDDING) {
      if (this.state.currentBidder) {
        this.markSold();
      } else {
        this.markUnsold();
      }
    }
  }

  private markSold(): void {
    if (!this.state.currentPlayer || !this.state.currentBidder) return;

    const buyer = this.state.participants.get(this.state.currentBidder)!;
    const player = this.state.currentPlayer;
    const price = this.state.currentBid;

    // Update buyer's state
    buyer.budget -= price;
    buyer.players.push(player);
    if (player.nationality === 'OVERSEAS') {
      buyer.overseasCount++;
    }

    // Record sale
    this.state.soldPlayers.push({ player, buyer: buyer.id, price });

    // Remove from remaining
    this.state.remainingPlayers = this.state.remainingPlayers.filter(p => p.id !== player.id);

    this.state.phase = AuctionPhase.SOLD;
    this.emit('playerSold', {
      player,
      buyer: {
        id: buyer.id,
        teamName: buyer.teamName,
        teamShortName: buyer.teamShortName,
        teamColor: buyer.teamColor,
      },
      price,
      buyerBudgetRemaining: buyer.budget,
      buyerPlayerCount: buyer.players.length,
    });

    logger.info(`SOLD: ${player.name} to ${buyer.teamName} for ₹${price}L`);

    // Move to next player after celebration
    setTimeout(() => {
      if (this.state.phase === AuctionPhase.SOLD) {
        this.state.phase = AuctionPhase.NEXT_PLAYER;
        this.presentNextPlayer();
      }
    }, 5000);
  }

  private markUnsold(): void {
    if (!this.state.currentPlayer) return;

    const player = this.state.currentPlayer;
    this.state.unsoldPlayers.push(player);
    this.state.remainingPlayers = this.state.remainingPlayers.filter(p => p.id !== player.id);

    this.state.phase = AuctionPhase.UNSOLD;
    this.emit('playerUnsold', { player });

    logger.info(`UNSOLD: ${player.name}`);

    setTimeout(() => {
      if (this.state.phase === AuctionPhase.UNSOLD) {
        this.state.phase = AuctionPhase.NEXT_PLAYER;
        this.presentNextPlayer();
      }
    }, 3000);
  }

  pause(): void {
    this.state.isPaused = true;
    this.state.phase = AuctionPhase.PAUSED;
    this.emit('auctionPaused', {});
  }

  resume(): void {
    this.state.isPaused = false;
    this.state.phase = AuctionPhase.BIDDING;
    this.emit('auctionResumed', {});
    this.startTimer();
  }

  private complete(): void {
    this.stopTimer();
    this.state.phase = AuctionPhase.COMPLETE;

    const results = Array.from(this.state.participants.values()).map(p => ({
      teamName: p.teamName,
      teamShortName: p.teamShortName,
      players: p.players,
      totalSpent: p.initialBudget - p.budget,
      budgetRemaining: p.budget,
      playerCount: p.players.length,
      overseasCount: p.overseasCount,
    }));

    this.emit('auctionComplete', { results });
    logger.info(`Auction ${this.state.roomId} completed. ${this.state.soldPlayers.length} sold, ${this.state.unsoldPlayers.length} unsold.`);
  }

  getPublicState(): Omit<AuctionState, 'participants'> & { participants: AuctionParticipant[] } {
    return {
      ...this.state,
      participants: Array.from(this.state.participants.values()),
    };
  }

  getParticipant(id: string): AuctionParticipant | undefined {
    return this.state.participants.get(id);
  }

  getCurrentPhase(): AuctionPhase {
    return this.state.phase;
  }

  getMinBidAmount(): number {
    return this.getMinBid();
  }

  destroy(): void {
    this.stopTimer();
    this.removeAllListeners();
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
