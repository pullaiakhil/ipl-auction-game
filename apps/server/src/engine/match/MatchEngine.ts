import { logger } from '../../utils/logger';
import { getCommentary } from './Commentary';

export type DismissalType = 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket' | 'caught_behind';
export type ExtraType = 'wide' | 'no_ball' | 'bye' | 'leg_bye';
export type MatchPhase = 'POWERPLAY' | 'MIDDLE' | 'DEATH';
export type PitchType = 'BATTING' | 'BOWLING' | 'BALANCED' | 'SPIN_FRIENDLY';
export type TossDecision = 'BAT' | 'BOWL';

export interface MatchPlayer {
  id: string;
  name: string;
  role: string;
  battingRating: number;
  bowlingRating: number;
  fieldingRating: number;
  strikeRate: number;
  economy: number;
  battingAverage: number;
  bowlingAverage: number;
  isKeeper: boolean;
}

export interface MatchTeam {
  id: string;
  name: string;
  shortName: string;
  color: string;
  playingXI: MatchPlayer[];
}

export interface BallOutcome {
  runs: number;
  isWicket: boolean;
  wicketType?: DismissalType;
  isExtra: boolean;
  extraType?: ExtraType;
  extraRuns: number;
  isBoundary: boolean;
  isSix: boolean;
  batsmanId: string;
  bowlerId: string;
  dismissedId?: string;
  fielderId?: string;
  commentary: string;
}

export interface BatterInnings {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: string;
  bowlerName?: string;
  fielderName?: string;
}

export interface BowlerFigures {
  playerId: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
  wides: number;
  noBalls: number;
}

export interface InningsResult {
  battingTeam: string;
  bowlingTeam: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: { total: number; wides: number; noBalls: number; byes: number; legByes: number };
  runRate: number;
  fours: number;
  sixes: number;
  dotBalls: number;
  batters: BatterInnings[];
  bowlers: BowlerFigures[];
  fallOfWickets: { wicket: number; runs: number; overs: number; batsmanName: string }[];
  overByOver: { over: number; runs: number; wickets: number; cumulative: number }[];
  ballByBall: BallOutcome[];
  partnerships: { batter1: string; batter2: string; runs: number; balls: number }[];
}

export interface MatchResult {
  team1: string;
  team2: string;
  venue: string;
  tossWinner: string;
  tossDecision: TossDecision;
  innings1: InningsResult;
  innings2: InningsResult;
  winner: string | null;
  resultText: string;
  playerOfMatch: { id: string; name: string; performance: string };
  pitchType: PitchType;
}

export class MatchEngine {
  private pitchType: PitchType;

  constructor(pitchType: PitchType = 'BALANCED') {
    this.pitchType = pitchType;
  }

  simulateMatch(team1: MatchTeam, team2: MatchTeam, venue: string = 'Default Stadium'): MatchResult {
    // Toss
    const tossWinner = Math.random() > 0.5 ? team1 : team2;
    const tossDecision: TossDecision = this.decideToss(tossWinner);

    const battingFirst = tossDecision === 'BAT' ? tossWinner : (tossWinner === team1 ? team2 : team1);
    const bowlingFirst = battingFirst === team1 ? team2 : team1;

    logger.info(`Match: ${team1.name} vs ${team2.name} at ${venue}`);
    logger.info(`Toss: ${tossWinner.name} won and chose to ${tossDecision}`);

    // First innings
    const innings1 = this.simulateInnings(battingFirst, bowlingFirst);

    // Second innings (with target)
    const target = innings1.totalRuns + 1;
    const innings2 = this.simulateInnings(bowlingFirst, battingFirst, target);

    // Determine result
    const { winner, resultText } = this.determineResult(battingFirst, bowlingFirst, innings1, innings2);
    const pom = this.selectPlayerOfMatch(innings1, innings2, battingFirst, bowlingFirst);

    return {
      team1: team1.name,
      team2: team2.name,
      venue,
      tossWinner: tossWinner.name,
      tossDecision,
      innings1,
      innings2,
      winner,
      resultText,
      playerOfMatch: pom,
      pitchType: this.pitchType,
    };
  }

  simulateInnings(
    battingTeam: MatchTeam,
    bowlingTeam: MatchTeam,
    target?: number
  ): InningsResult {
    const batters = [...battingTeam.playingXI];
    const bowlers = bowlingTeam.playingXI.filter(p =>
      p.role === 'BOWLER' || p.role === 'ALL_ROUNDER' || p.bowlingRating > 40
    );

    const batterInnings: Map<string, BatterInnings> = new Map();
    const bowlerFigures: Map<string, BowlerFigures> = new Map();
    const fallOfWickets: InningsResult['fallOfWickets'] = [];
    const overByOver: InningsResult['overByOver'] = [];
    const ballByBall: BallOutcome[] = [];
    const partnerships: InningsResult['partnerships'] = [];

    let totalRuns = 0;
    let wickets = 0;
    let totalBalls = 0;
    let fours = 0;
    let sixes = 0;
    let dotBalls = 0;
    const extras = { total: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 };

    let strikerIdx = 0;
    let nonStrikerIdx = 1;
    let nextBatterIdx = 2;

    // Initialize opening batters
    const initBatter = (player: MatchPlayer): BatterInnings => ({
      playerId: player.id,
      name: player.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
    });

    batterInnings.set(batters[0].id, initBatter(batters[0]));
    batterInnings.set(batters[1].id, initBatter(batters[1]));

    let partnershipRuns = 0;
    let partnershipBalls = 0;
    const bowlerOvers: Map<string, number> = new Map();

    for (let over = 0; over < 20 && wickets < 10; over++) {
      const bowler = this.selectBowler(bowlers, bowlerOvers, over);
      const currentOvers = bowlerOvers.get(bowler.id) || 0;
      bowlerOvers.set(bowler.id, currentOvers + 1);

      if (!bowlerFigures.has(bowler.id)) {
        bowlerFigures.set(bowler.id, {
          playerId: bowler.id,
          name: bowler.name,
          overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, dots: 0, wides: 0, noBalls: 0,
        });
      }

      let overRuns = 0;
      let overWickets = 0;
      let ballsInOver = 0;
      let overDots = 0;

      for (let ball = 0; ball < 6 && wickets < 10; ) {
        const striker = batters[strikerIdx];
        const phase = this.getPhase(over);

        const outcome = this.simulateBall(striker, bowler, phase, target, totalRuns, over * 6 + ball, wickets);
        ballByBall.push(outcome);

        const bf = bowlerFigures.get(bowler.id)!;

        if (outcome.isExtra) {
          extras.total += outcome.extraRuns;
          totalRuns += outcome.extraRuns;
          overRuns += outcome.extraRuns;
          bf.runs += outcome.extraRuns;

          if (outcome.extraType === 'wide') {
            extras.wides++;
            bf.wides++;
          } else if (outcome.extraType === 'no_ball') {
            extras.noBalls++;
            bf.noBalls++;
          }

          if (outcome.extraType === 'wide' || outcome.extraType === 'no_ball') {
            // Don't count as a legal ball
            continue;
          }
        }

        // Legal delivery
        ball++;
        ballsInOver++;
        totalBalls++;

        const batter = batterInnings.get(striker.id)!;
        batter.balls++;

        if (outcome.runs > 0) {
          batter.runs += outcome.runs;
          totalRuns += outcome.runs;
          overRuns += outcome.runs;
          partnershipRuns += outcome.runs;
          bf.runs += outcome.runs;
        }

        if (outcome.runs === 0 && !outcome.isExtra) {
          dotBalls++;
          overDots++;
          bf.dots++;
        }

        if (outcome.isBoundary) {
          batter.fours++;
          fours++;
        }
        if (outcome.isSix) {
          batter.sixes++;
          sixes++;
        }

        partnershipBalls++;

        if (outcome.isWicket) {
          wickets++;
          overWickets++;
          bf.wickets++;
          batter.isOut = true;
          batter.dismissal = outcome.wicketType || 'unknown';
          batter.bowlerName = bowler.name;
          batter.strikeRate = batter.balls > 0 ? (batter.runs / batter.balls) * 100 : 0;

          fallOfWickets.push({
            wicket: wickets,
            runs: totalRuns,
            overs: Math.floor(totalBalls / 6) + (totalBalls % 6) / 10,
            batsmanName: batter.name,
          });

          // Record partnership
          partnerships.push({
            batter1: batters[strikerIdx].name,
            batter2: batters[nonStrikerIdx].name,
            runs: partnershipRuns,
            balls: partnershipBalls,
          });
          partnershipRuns = 0;
          partnershipBalls = 0;

          if (wickets < 10 && nextBatterIdx < batters.length) {
            batterInnings.set(batters[nextBatterIdx].id, initBatter(batters[nextBatterIdx]));
            strikerIdx = nextBatterIdx;
            nextBatterIdx++;
          }
        } else {
          // Rotate strike on odd runs
          if (outcome.runs % 2 === 1) {
            [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
          }
        }

        // Check if target reached
        if (target && totalRuns >= target) break;
      }

      // End of over - update bowler figures
      const bf = bowlerFigures.get(bowler.id)!;
      bf.overs = bowlerOvers.get(bowler.id) || 0;
      bf.economy = bf.overs > 0 ? bf.runs / bf.overs : 0;
      if (overRuns === 0 && ballsInOver === 6) bf.maidens++;

      overByOver.push({
        over: over + 1,
        runs: overRuns,
        wickets: overWickets,
        cumulative: totalRuns,
      });

      // Rotate strike at end of over
      [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];

      if (target && totalRuns >= target) break;
    }

    // Final partnership
    if (wickets < 10) {
      partnerships.push({
        batter1: batters[strikerIdx].name,
        batter2: batters[nonStrikerIdx].name,
        runs: partnershipRuns,
        balls: partnershipBalls,
      });
    }

    // Update strike rates for not-out batters
    batterInnings.forEach(b => {
      b.strikeRate = b.balls > 0 ? (b.runs / b.balls) * 100 : 0;
    });

    const oversCompleted = Math.floor(totalBalls / 6);
    const remainingBalls = totalBalls % 6;
    const overs = oversCompleted + remainingBalls / 10;

    return {
      battingTeam: battingTeam.name,
      bowlingTeam: bowlingTeam.name,
      totalRuns,
      wickets,
      overs,
      balls: totalBalls,
      extras,
      runRate: totalBalls > 0 ? (totalRuns / totalBalls) * 6 : 0,
      fours,
      sixes,
      dotBalls,
      batters: Array.from(batterInnings.values()),
      bowlers: Array.from(bowlerFigures.values()),
      fallOfWickets,
      overByOver,
      ballByBall,
      partnerships,
    };
  }

  private simulateBall(
    batsman: MatchPlayer,
    bowler: MatchPlayer,
    phase: MatchPhase,
    target: number | undefined,
    currentScore: number,
    _ballNumber: number,
    _wickets: number
  ): BallOutcome {
    // Base probabilities
    const battingSkill = (batsman.battingRating || 50) / 100;
    const bowlingSkill = (bowler.bowlingRating || 50) / 100;
    const phaseMod = this.getPhaseModifiers(phase);

    // Extra probability
    const extraChance = 0.04 - (bowlingSkill * 0.02);
    if (Math.random() < extraChance) {
      const extraType: ExtraType = Math.random() < 0.6 ? 'wide' : 'no_ball';
      const extraRuns = extraType === 'wide' ? 1 : 1;
      return {
        runs: 0, isWicket: false, isExtra: true, extraType, extraRuns,
        isBoundary: false, isSix: false,
        batsmanId: batsman.id, bowlerId: bowler.id,
        commentary: getCommentary('extra', { extraType, bowlerName: bowler.name }),
      };
    }

    // Wicket probability
    let wicketProb = 0.05 * (1 - battingSkill * 0.4) * (1 + bowlingSkill * 0.6);
    wicketProb *= phaseMod.wicketMod;

    // Pitch modifications
    if (this.pitchType === 'BOWLING') wicketProb *= 1.3;
    if (this.pitchType === 'BATTING') wicketProb *= 0.7;

    // Pressure in chase
    if (target) {
      const required = target - currentScore;
      const ballsLeft = 120 - ballNumber;
      const requiredRate = ballsLeft > 0 ? (required / ballsLeft) * 6 : 99;
      if (requiredRate > 12) wicketProb *= 1.5;
      else if (requiredRate > 10) wicketProb *= 1.2;
    }

    if (Math.random() < wicketProb) {
      const wicketType = this.getWicketType(bowler);
      return {
        runs: 0, isWicket: true, wicketType, isExtra: false, extraRuns: 0,
        isBoundary: false, isSix: false,
        batsmanId: batsman.id, bowlerId: bowler.id, dismissedId: batsman.id,
        commentary: getCommentary('wicket', {
          batsmanName: batsman.name, bowlerName: bowler.name, wicketType,
        }),
      };
    }

    // Run scoring
    const runProbs = this.getRunProbabilities(battingSkill, bowlingSkill, phaseMod);
    const rand = Math.random();
    let cumulative = 0;
    let runs = 0;

    for (const [r, p] of runProbs) {
      cumulative += p;
      if (rand < cumulative) {
        runs = r;
        break;
      }
    }

    const isBoundary = runs === 4;
    const isSix = runs === 6;

    let commentaryType = 'dot';
    if (isSix) commentaryType = 'six';
    else if (isBoundary) commentaryType = 'four';
    else if (runs > 0) commentaryType = 'runs';

    return {
      runs, isWicket: false, isExtra: false, extraRuns: 0,
      isBoundary, isSix,
      batsmanId: batsman.id, bowlerId: bowler.id,
      commentary: getCommentary(commentaryType, {
        batsmanName: batsman.name, bowlerName: bowler.name, runs,
      }),
    };
  }

  private getRunProbabilities(
    bat: number, bowl: number, phase: { boundaryMod: number; sixMod: number; dotMod: number }
  ): [number, number][] {
    const skill = (bat - bowl + 1) / 2; // 0-1 normalized

    return [
      [0, (0.35 + (1 - skill) * 0.15) * phase.dotMod],  // Dot
      [1, 0.28 + skill * 0.05],                            // Single
      [2, 0.12 + skill * 0.03],                            // Double
      [3, 0.02],                                            // Triple
      [4, (0.12 + skill * 0.08) * phase.boundaryMod],     // Four
      [6, (0.06 + skill * 0.06) * phase.sixMod],          // Six
    ];
  }

  private getPhaseModifiers(phase: MatchPhase) {
    switch (phase) {
      case 'POWERPLAY':
        return { wicketMod: 1.1, boundaryMod: 1.2, sixMod: 0.9, dotMod: 0.85 };
      case 'MIDDLE':
        return { wicketMod: 0.9, boundaryMod: 0.85, sixMod: 0.85, dotMod: 1.15 };
      case 'DEATH':
        return { wicketMod: 1.3, boundaryMod: 1.3, sixMod: 1.5, dotMod: 0.7 };
    }
  }

  private getPhase(over: number): MatchPhase {
    if (over < 6) return 'POWERPLAY';
    if (over < 15) return 'MIDDLE';
    return 'DEATH';
  }

  private getWicketType(bowler: MatchPlayer): DismissalType {
    const rand = Math.random();
    const isSpin = bowler.bowlingRating > 60 && bowler.role !== 'BOWLER';

    if (isSpin) {
      if (rand < 0.15) return 'bowled';
      if (rand < 0.55) return 'caught';
      if (rand < 0.70) return 'lbw';
      if (rand < 0.85) return 'stumped';
      return 'run_out';
    }

    if (rand < 0.20) return 'bowled';
    if (rand < 0.60) return 'caught';
    if (rand < 0.75) return 'caught_behind';
    if (rand < 0.88) return 'lbw';
    return 'run_out';
  }

  private selectBowler(
    bowlers: MatchPlayer[],
    bowlerOvers: Map<string, number>,
    currentOver: number
  ): MatchPlayer {
    const available = bowlers.filter(b => (bowlerOvers.get(b.id) || 0) < 4);

    if (available.length === 0) {
      return bowlers[Math.floor(Math.random() * bowlers.length)];
    }

    // Prefer best bowlers in powerplay and death
    const phase = this.getPhase(currentOver);
    if (phase === 'POWERPLAY' || phase === 'DEATH') {
      available.sort((a, b) => b.bowlingRating - a.bowlingRating);
      // Top 2 bowlers more likely
      if (available.length >= 2 && Math.random() < 0.6) {
        return available[Math.floor(Math.random() * 2)];
      }
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  private decideToss(_team: MatchTeam): TossDecision {
    // Most T20 teams prefer chasing
    return Math.random() < 0.65 ? 'BOWL' : 'BAT';
  }

  private determineResult(
    battingFirst: MatchTeam,
    bowlingFirst: MatchTeam,
    innings1: InningsResult,
    innings2: InningsResult
  ): { winner: string | null; resultText: string } {
    if (innings2.totalRuns > innings1.totalRuns) {
      const wicketsLeft = 10 - innings2.wickets;
      return {
        winner: bowlingFirst.name,
        resultText: `${bowlingFirst.name} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`,
      };
    } else if (innings1.totalRuns > innings2.totalRuns) {
      const runDiff = innings1.totalRuns - innings2.totalRuns;
      return {
        winner: battingFirst.name,
        resultText: `${battingFirst.name} won by ${runDiff} run${runDiff !== 1 ? 's' : ''}`,
      };
    }
    return { winner: null, resultText: 'Match tied' };
  }

  private selectPlayerOfMatch(
    innings1: InningsResult,
    innings2: InningsResult,
    _team1: MatchTeam,
    _team2: MatchTeam
  ): { id: string; name: string; performance: string } {
    let bestScore = 0;
    let best = { id: '', name: '', performance: '' };

    const evaluatePerformance = (batters: BatterInnings[], bowlers: BowlerFigures[]) => {
      for (const b of batters) {
        const score = b.runs * 1.5 + (b.strikeRate > 150 ? 20 : 0) + b.fours * 2 + b.sixes * 3;
        if (score > bestScore) {
          bestScore = score;
          best = { id: b.playerId, name: b.name, performance: `${b.runs}(${b.balls})` };
        }
      }
      for (const b of bowlers) {
        const score = b.wickets * 30 + (b.economy < 6 ? 20 : 0) + b.maidens * 10;
        if (score > bestScore) {
          bestScore = score;
          best = { id: b.playerId, name: b.name, performance: `${b.wickets}/${b.runs}` };
        }
      }
    };

    evaluatePerformance(innings1.batters, innings1.bowlers);
    evaluatePerformance(innings2.batters, innings2.bowlers);

    return best;
  }
}
