import { IPLTeam } from "../types/team";
import type { IPLTeamId } from "../types/team";

// ================================
// IPL Auction Rules
// ================================
export const IPL_RULES = {
  MAX_SQUAD_SIZE: 25,
  MIN_SQUAD_SIZE: 18,
  MAX_OVERSEAS: 8,
  MAX_OVERSEAS_PLAYING_XI: 4,
  MEGA_AUCTION_PURSE: 120,
  MINI_AUCTION_PURSE: 75,
  MAX_RETAIN_MEGA: 6,
  MAX_RETAIN_MINI: 5,
  AUCTION_TIMER_SECONDS: 15,
  RTM_CARDS_MEGA: 6,
  RTM_CARDS_MINI: 3,
  MIN_BASE_PRICE: 0.2,
  MAX_BASE_PRICE: 2.0,
  UNCAPPED_BASE_PRICE: 0.2,
  MIN_BATSMEN: 2,
  MIN_BOWLERS: 2,
  MIN_ALL_ROUNDERS: 1,
  MIN_WICKET_KEEPERS: 1,
  PLAYING_XI_SIZE: 11,
  OVERS_PER_INNINGS: 20,
  MAX_OVERS_PER_BOWLER: 4,
  POWERPLAY_OVERS: 6,
  DEATH_OVERS_START: 16,
} as const;

// ================================
// Bid Increments (in Crores)
// ================================
export const BID_INCREMENTS: Record<string, number> = {
  "0-1": 0.05,
  "1-2": 0.1,
  "2-5": 0.2,
  "5-10": 0.25,
  "10-15": 0.5,
  "15-20": 0.5,
  "20+": 1.0,
};

export function getBidIncrement(currentBid: number): number {
  if (currentBid < 1) return 0.05;
  if (currentBid < 2) return 0.1;
  if (currentBid < 5) return 0.2;
  if (currentBid < 10) return 0.25;
  if (currentBid < 20) return 0.5;
  return 1.0;
}

// ================================
// Team Colors
// ================================
export const TEAM_COLORS: Record<IPLTeamId, { primary: string; secondary: string; gradient: string }> = {
  [IPLTeam.CSK]: {
    primary: "#FDB913",
    secondary: "#0081E9",
    gradient: "linear-gradient(135deg, #FDB913 0%, #0081E9 100%)",
  },
  [IPLTeam.MI]: {
    primary: "#004BA0",
    secondary: "#D4A843",
    gradient: "linear-gradient(135deg, #004BA0 0%, #D4A843 100%)",
  },
  [IPLTeam.RCB]: {
    primary: "#EC1C24",
    secondary: "#2B2A29",
    gradient: "linear-gradient(135deg, #EC1C24 0%, #D4A843 100%)",
  },
  [IPLTeam.DC]: {
    primary: "#17479E",
    secondary: "#EF1B23",
    gradient: "linear-gradient(135deg, #17479E 0%, #EF1B23 100%)",
  },
  [IPLTeam.KKR]: {
    primary: "#3A225D",
    secondary: "#D4A843",
    gradient: "linear-gradient(135deg, #3A225D 0%, #D4A843 100%)",
  },
  [IPLTeam.PBKS]: {
    primary: "#ED1B24",
    secondary: "#A7A9AC",
    gradient: "linear-gradient(135deg, #ED1B24 0%, #DCDDDF 100%)",
  },
  [IPLTeam.RR]: {
    primary: "#EA1A85",
    secondary: "#254AA5",
    gradient: "linear-gradient(135deg, #EA1A85 0%, #254AA5 100%)",
  },
  [IPLTeam.GT]: {
    primary: "#1C1C1C",
    secondary: "#A0D2F0",
    gradient: "linear-gradient(135deg, #1C1C1C 0%, #A0D2F0 100%)",
  },
  [IPLTeam.LSG]: {
    primary: "#A72056",
    secondary: "#FFCC00",
    gradient: "linear-gradient(135deg, #A72056 0%, #FFCC00 100%)",
  },
  [IPLTeam.SRH]: {
    primary: "#FF822A",
    secondary: "#000000",
    gradient: "linear-gradient(135deg, #FF822A 0%, #E03A3E 100%)",
  },
};

// ================================
// Team Short Names
// ================================
export const TEAM_SHORT_NAMES: Record<IPLTeamId, string> = {
  [IPLTeam.CSK]: "CSK",
  [IPLTeam.MI]: "MI",
  [IPLTeam.RCB]: "RCB",
  [IPLTeam.DC]: "DC",
  [IPLTeam.KKR]: "KKR",
  [IPLTeam.PBKS]: "PBKS",
  [IPLTeam.RR]: "RR",
  [IPLTeam.GT]: "GT",
  [IPLTeam.LSG]: "LSG",
  [IPLTeam.SRH]: "SRH",
};

// ================================
// Team Full Names
// ================================
export const TEAM_FULL_NAMES: Record<IPLTeamId, string> = {
  [IPLTeam.CSK]: "Chennai Super Kings",
  [IPLTeam.MI]: "Mumbai Indians",
  [IPLTeam.RCB]: "Royal Challengers Bengaluru",
  [IPLTeam.DC]: "Delhi Capitals",
  [IPLTeam.KKR]: "Kolkata Knight Riders",
  [IPLTeam.PBKS]: "Punjab Kings",
  [IPLTeam.RR]: "Rajasthan Royals",
  [IPLTeam.GT]: "Gujarat Titans",
  [IPLTeam.LSG]: "Lucknow Super Giants",
  [IPLTeam.SRH]: "Sunrisers Hyderabad",
};

// ================================
// Player Roles Display
// ================================
export const PLAYER_ROLES = {
  batsman: { label: "Batsman", emoji: "🏏", color: "#3B82F6" },
  bowler: { label: "Bowler", emoji: "🎯", color: "#EF4444" },
  "all-rounder": { label: "All-Rounder", emoji: "⚡", color: "#8B5CF6" },
  "wicket-keeper": { label: "Wicket-Keeper", emoji: "🧤", color: "#10B981" },
} as const;

// ================================
// Auction Phase Labels
// ================================
export const AUCTION_PHASES = {
  waiting: { label: "Waiting to Start", color: "#6B7280" },
  marquee: { label: "Marquee Set", color: "#F59E0B" },
  accelerated: { label: "Accelerated Auction", color: "#EF4444" },
  set_1_batsmen: { label: "Set 1 - Batsmen", color: "#3B82F6" },
  set_2_bowlers: { label: "Set 2 - Bowlers", color: "#EF4444" },
  set_3_all_rounders: { label: "Set 3 - All-Rounders", color: "#8B5CF6" },
  set_4_wicket_keepers: { label: "Set 4 - Wicket-Keepers", color: "#10B981" },
  set_5_overseas: { label: "Set 5 - Overseas", color: "#F97316" },
  set_6_uncapped: { label: "Set 6 - Uncapped", color: "#6366F1" },
  rtm_round: { label: "RTM Round", color: "#EC4899" },
  completed: { label: "Auction Complete", color: "#22C55E" },
  paused: { label: "Paused", color: "#F59E0B" },
} as const;
