export type PlayerRole = "batsman" | "bowler" | "all-rounder" | "wicket-keeper";

export type PlayerSubRole =
  | "opening-batsman"
  | "top-order-batsman"
  | "middle-order-batsman"
  | "finisher"
  | "wicket-keeper-batsman"
  | "fast-bowler"
  | "medium-fast-bowler"
  | "spin-bowler"
  | "left-arm-spinner"
  | "leg-spinner"
  | "off-spinner"
  | "batting-all-rounder"
  | "bowling-all-rounder";

export type PlayerNationality =
  | "indian"
  | "overseas"
  | "uncapped-indian"
  | "uncapped-overseas";

export interface PlayerStats {
  matches: number;
  runs: number;
  battingAverage: number;
  strikeRate: number;
  fifties: number;
  hundreds: number;
  highScore: number;
  wickets: number;
  bowlingAverage: number;
  economyRate: number;
  bowlingStrikeRate: number;
  bestBowling: string;
  catches: number;
  stumpings: number;
  runOuts: number;
}

export interface PlayerRating {
  overall: number;
  batting: number;
  bowling: number;
  fielding: number;
  fitness: number;
  experience: number;
  form: number;
  t20Specialist: number;
}

export interface PlayerBase {
  id: string;
  name: string;
  age: number;
  role: PlayerRole;
  subRole: PlayerSubRole;
  nationality: PlayerNationality;
  country: string;
  imageUrl: string;
  battingStyle: "right-hand" | "left-hand";
  bowlingStyle:
    | "right-arm-fast"
    | "right-arm-medium"
    | "left-arm-fast"
    | "left-arm-medium"
    | "right-arm-off-break"
    | "right-arm-leg-break"
    | "left-arm-orthodox"
    | "left-arm-chinaman"
    | "none";
  basePrice: number;
  isCapped: boolean;
  isRetained: boolean;
  previousTeam: string | null;
}

export interface Player extends PlayerBase {
  stats: PlayerStats;
  rating: PlayerRating;
  iplCareer: {
    seasons: number;
    totalRuns: number;
    totalWickets: number;
    bestSeason: string;
    auctionHistory: Array<{
      year: number;
      team: string;
      price: number;
    }>;
  };
}

export interface PlayerWithStats extends PlayerBase {
  stats: PlayerStats;
  rating: PlayerRating;
}
