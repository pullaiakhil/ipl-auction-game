import { AuctionPlayer, AuctionParticipant } from '../auction/AuctionEngine';
import { logger } from '../../utils/logger';

export type AIPersonality = 'AGGRESSIVE' | 'BALANCED' | 'VALUE_SEEKER' | 'SQUAD_FILLER' | 'MONEYBALL';

interface AIProfile {
  personality: AIPersonality;
  aggression: number;      // 0-1: how readily they bid
  patience: number;        // 0-1: willingness to wait for bargains
  riskTolerance: number;   // 0-1: willingness to overpay for targets
  analyticalLevel: number; // 0-1: how data-driven decisions are
  bluffFrequency: number;  // 0-1: chance of bluff bids
}

interface BudgetAllocation {
  marqueeOverseas: number;
  indianCore: number;
  allRounders: number;
  bowlers: number;
  reserves: number;
}

interface SquadNeeds {
  needBatsman: number;
  needBowler: number;
  needAllRounder: number;
  needWicketKeeper: number;
  needOverseas: boolean;
  needIndian: boolean;
  urgency: number; // 0-1
}

const AI_PROFILES: Record<AIPersonality, Omit<AIProfile, 'personality'>> = {
  AGGRESSIVE: { aggression: 0.85, patience: 0.2, riskTolerance: 0.8, analyticalLevel: 0.5, bluffFrequency: 0.15 },
  BALANCED: { aggression: 0.55, patience: 0.5, riskTolerance: 0.5, analyticalLevel: 0.7, bluffFrequency: 0.08 },
  VALUE_SEEKER: { aggression: 0.3, patience: 0.85, riskTolerance: 0.25, analyticalLevel: 0.9, bluffFrequency: 0.05 },
  SQUAD_FILLER: { aggression: 0.5, patience: 0.6, riskTolerance: 0.4, analyticalLevel: 0.6, bluffFrequency: 0.03 },
  MONEYBALL: { aggression: 0.4, patience: 0.7, riskTolerance: 0.3, analyticalLevel: 0.95, bluffFrequency: 0.02 },
};

export class AIManager {
  private aiParticipants: Map<string, AIProfile> = new Map();
  private budgetAllocations: Map<string, BudgetAllocation> = new Map();

  registerAI(participantId: string, personality: AIPersonality): void {
    const profile: AIProfile = {
      personality,
      ...AI_PROFILES[personality],
    };
    this.aiParticipants.set(participantId, profile);
    this.budgetAllocations.set(participantId, this.calculateBudgetAllocation(personality));
    logger.info(`AI registered: ${participantId} with personality ${personality}`);
  }

  private calculateBudgetAllocation(personality: AIPersonality): BudgetAllocation {
    switch (personality) {
      case 'AGGRESSIVE':
        return { marqueeOverseas: 0.40, indianCore: 0.25, allRounders: 0.15, bowlers: 0.12, reserves: 0.08 };
      case 'BALANCED':
        return { marqueeOverseas: 0.30, indianCore: 0.28, allRounders: 0.18, bowlers: 0.14, reserves: 0.10 };
      case 'VALUE_SEEKER':
        return { marqueeOverseas: 0.20, indianCore: 0.30, allRounders: 0.20, bowlers: 0.18, reserves: 0.12 };
      case 'SQUAD_FILLER':
        return { marqueeOverseas: 0.25, indianCore: 0.30, allRounders: 0.20, bowlers: 0.15, reserves: 0.10 };
      case 'MONEYBALL':
        return { marqueeOverseas: 0.22, indianCore: 0.28, allRounders: 0.22, bowlers: 0.18, reserves: 0.10 };
    }
  }

  shouldBid(
    participantId: string,
    participant: AuctionParticipant,
    player: AuctionPlayer,
    currentBid: number,
    currentBidderId: string | null,
    minBid: number,
  ): { shouldBid: boolean; amount: number; delay: number } {
    const profile = this.aiParticipants.get(participantId);
    if (!profile) return { shouldBid: false, amount: 0, delay: 0 };

    // Don't bid against self
    if (currentBidderId === participantId) {
      return { shouldBid: false, amount: 0, delay: 0 };
    }

    // Check basic constraints
    if (participant.players.length >= 25) {
      return { shouldBid: false, amount: 0, delay: 0 };
    }
    if (player.nationality === 'OVERSEAS' && participant.overseasCount >= 8) {
      return { shouldBid: false, amount: 0, delay: 0 };
    }

    // Evaluate player value to this AI
    const squadNeeds = this.analyzeSquadNeeds(participant);
    const playerValue = this.evaluatePlayerValue(player, squadNeeds, profile);
    const maxBid = this.calculateMaxBid(participant, player, profile, squadNeeds);

    if (minBid > maxBid) {
      return { shouldBid: false, amount: 0, delay: 0 };
    }

    // Decision probability
    const bidProbability = this.calculateBidProbability(
      playerValue, currentBid, maxBid, profile, squadNeeds
    );

    // Bluff check
    const isBluff = Math.random() < profile.bluffFrequency && currentBid < maxBid * 0.6;

    const shouldMakeBid = Math.random() < bidProbability || isBluff;

    if (!shouldMakeBid) {
      return { shouldBid: false, amount: 0, delay: 0 };
    }

    // Calculate bid amount
    let bidAmount = minBid;
    if (profile.aggression > 0.7 && Math.random() < 0.3) {
      // Aggressive: sometimes jump bid
      const jumpMultiplier = 1 + (Math.random() * 0.3);
      bidAmount = Math.min(Math.ceil(minBid * jumpMultiplier / 5) * 5, maxBid);
    }

    // Ensure bid is within valid range
    bidAmount = Math.max(minBid, Math.min(bidAmount, maxBid));

    // Response delay (simulate thinking time)
    const baseDelay = 1500;
    const varianceDelay = Math.random() * 3500;
    const patienceDelay = profile.patience * 2000;
    const delay = baseDelay + varianceDelay + patienceDelay;

    return { shouldBid: true, amount: bidAmount, delay: Math.round(delay) };
  }

  private evaluatePlayerValue(
    player: AuctionPlayer,
    needs: SquadNeeds,
    profile: AIProfile
  ): number {
    let value = player.overallRating; // Base value 0-100

    // Role need multiplier
    let needMultiplier = 1.0;
    switch (player.role) {
      case 'BATSMAN':
        needMultiplier = needs.needBatsman > 0 ? 1.3 : 0.7;
        break;
      case 'BOWLER':
        needMultiplier = needs.needBowler > 0 ? 1.3 : 0.7;
        break;
      case 'ALL_ROUNDER':
        needMultiplier = needs.needAllRounder > 0 ? 1.4 : 0.8;
        break;
      case 'WICKET_KEEPER':
        needMultiplier = needs.needWicketKeeper > 0 ? 1.5 : 0.5;
        break;
    }
    value *= needMultiplier;

    // Star player premium
    if (player.isMarquee) {
      value *= 1 + (profile.aggression * 0.3);
    }

    // Analytical bonus for underrated players
    if (profile.analyticalLevel > 0.7 && player.overallRating > 70 && !player.isMarquee) {
      value *= 1.15; // Hidden gem bonus
    }

    // Urgency multiplier
    value *= 1 + (needs.urgency * 0.3);

    return Math.min(value, 150);
  }

  private calculateMaxBid(
    participant: AuctionParticipant,
    player: AuctionPlayer,
    profile: AIProfile,
    needs: SquadNeeds
  ): number {
    const slotsRemaining = 25 - participant.players.length;
    const minNeeded = Math.max(0, 18 - participant.players.length);
    const budgetForMinSlots = minNeeded * 20; // Reserve 20L per remaining min slot
    const availableBudget = Math.max(0, participant.budget - budgetForMinSlots);

    // Base max is percentage of available budget
    let maxPercentage = 0.4 + (profile.riskTolerance * 0.3);

    // Increase max for needed roles
    if (needs.urgency > 0.7) {
      maxPercentage += 0.15;
    }

    // Marquee players can attract higher bids
    if (player.isMarquee) {
      maxPercentage += 0.1;
    }

    const baseMax = availableBudget * maxPercentage;

    // Rating-based cap: don't overpay for low-rated players
    const ratingCap = player.overallRating * (profile.riskTolerance > 0.5 ? 25 : 18);

    return Math.max(player.basePrice, Math.min(baseMax, ratingCap));
  }

  private calculateBidProbability(
    playerValue: number,
    currentBid: number,
    maxBid: number,
    profile: AIProfile,
    needs: SquadNeeds
  ): number {
    // How much of max budget has been used
    const bidRatio = currentBid / maxBid;

    // Higher value = higher probability
    let probability = (playerValue / 100) * profile.aggression;

    // Reduce probability as bid approaches max
    if (bidRatio > 0.8) probability *= 0.3;
    else if (bidRatio > 0.6) probability *= 0.6;
    else if (bidRatio > 0.4) probability *= 0.85;

    // Patience: patient AIs drop out earlier
    probability *= (1 - profile.patience * bidRatio);

    // Urgency boosts probability
    probability *= (1 + needs.urgency * 0.5);

    return Math.max(0, Math.min(1, probability));
  }

  private analyzeSquadNeeds(participant: AuctionParticipant): SquadNeeds {
    const players = participant.players;
    const batsmen = players.filter(p => p.role === 'BATSMAN').length;
    const bowlers = players.filter(p => p.role === 'BOWLER').length;
    const allRounders = players.filter(p => p.role === 'ALL_ROUNDER').length;
    const keepers = players.filter(p => p.role === 'WICKET_KEEPER').length;
    const totalPlayers = players.length;

    const needBatsman = Math.max(0, 5 - batsmen);
    const needBowler = Math.max(0, 5 - bowlers);
    const needAllRounder = Math.max(0, 3 - allRounders);
    const needWicketKeeper = Math.max(0, 1 - keepers);

    // Urgency increases as we approach min squad size without filling roles
    const totalNeeds = needBatsman + needBowler + needAllRounder + needWicketKeeper;
    const slotsRemaining = 25 - totalPlayers;
    const urgency = slotsRemaining > 0 ? Math.min(1, totalNeeds / slotsRemaining) : 1;

    return {
      needBatsman,
      needBowler,
      needAllRounder,
      needWicketKeeper,
      needOverseas: participant.overseasCount < 6,
      needIndian: (totalPlayers - participant.overseasCount) < 12,
      urgency,
    };
  }

  getAIIds(): string[] {
    return Array.from(this.aiParticipants.keys());
  }

  isAI(participantId: string): boolean {
    return this.aiParticipants.has(participantId);
  }
}
