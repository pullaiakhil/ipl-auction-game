import type { IPLTeamId } from "./team";

export interface BallEvent {
  ballNumber: number;
  overNumber: number;
  batsmanId: string;
  bowlerId: string;
  runs: number;
  extras: number;
  extraType: "wide" | "no-ball" | "bye" | "leg-bye" | null;
  isWicket: boolean;
  wicketType:
    | "bowled"
    | "caught"
    | "lbw"
    | "run-out"
    | "stumped"
    | "hit-wicket"
    | "retired-hurt"
    | null;
  fielderId: string | null;
  isFour: boolean;
  isSix: boolean;
  isDot: boolean;
  shotType: string | null;
  commentary: string;
  timestamp: number;
}

export interface Over {
  overNumber: number;
  bowlerId: string;
  balls: BallEvent[];
  runs: number;
  wickets: number;
  extras: number;
  isMaiden: boolean;
}

export interface BatterStats {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal: string | null;
  isOnStrike: boolean;
}

export interface BowlerStats {
  playerId: string;
  playerName: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
  wides: number;
  noBalls: number;
}

export interface Innings {
  battingTeam: IPLTeamId;
  bowlingTeam: IPLTeamId;
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  totalBalls: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    total: number;
  };
  currentRunRate: number;
  requiredRunRate: number | null;
  target: number | null;
  overs: Over[];
  batters: BatterStats[];
  bowlers: BowlerStats[];
  fallOfWickets: Array<{
    wicketNumber: number;
    score: number;
    overs: number;
    playerId: string;
    playerName: string;
  }>;
  partnerships: Array<{
    batter1Id: string;
    batter2Id: string;
    runs: number;
    balls: number;
  }>;
}

export interface MatchResult {
  winnerId: IPLTeamId;
  loserId: IPLTeamId;
  margin: number;
  marginType: "runs" | "wickets";
  playerOfMatch: string;
  summary: string;
}

export interface Commentary {
  id: string;
  matchId: string;
  ballNumber: number;
  overNumber: number;
  text: string;
  type: "normal" | "wicket" | "four" | "six" | "milestone" | "strategic";
  timestamp: number;
}

export interface Match {
  id: string;
  seasonId: string;
  matchNumber: number;
  matchType: "league" | "qualifier-1" | "eliminator" | "qualifier-2" | "final";
  team1: IPLTeamId;
  team2: IPLTeamId;
  tossWinner: IPLTeamId | null;
  tossDecision: "bat" | "bowl" | null;
  venue: string;
  date: Date;
  innings1: Innings | null;
  innings2: Innings | null;
  result: MatchResult | null;
  status: "scheduled" | "in-progress" | "completed" | "abandoned";
  commentary: Commentary[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeagueTableEntry {
  teamId: IPLTeamId;
  played: number;
  won: number;
  lost: number;
  noResult: number;
  points: number;
  netRunRate: number;
  forRuns: number;
  forOvers: number;
  againstRuns: number;
  againstOvers: number;
  lastFive: Array<"W" | "L" | "NR">;
  position: number;
  isQualified: boolean;
}

export interface Season {
  id: string;
  name: string;
  year: number;
  userId: string;
  matches: Match[];
  leagueTable: LeagueTableEntry[];
  status: "auction" | "league" | "playoffs" | "completed";
  currentMatchIndex: number;
  createdAt: Date;
  updatedAt: Date;
}
