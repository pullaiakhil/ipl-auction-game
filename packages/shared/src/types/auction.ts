import type { Player } from "./player";
import type { IPLTeamId, TeamBudget } from "./team";

export enum AuctionPhase {
  WAITING = "waiting",
  MARQUEE = "marquee",
  ACCELERATED = "accelerated",
  SET_1_BATSMEN = "set_1_batsmen",
  SET_2_BOWLERS = "set_2_bowlers",
  SET_3_ALL_ROUNDERS = "set_3_all_rounders",
  SET_4_WICKET_KEEPERS = "set_4_wicket_keepers",
  SET_5_OVERSEAS = "set_5_overseas",
  SET_6_UNCAPPED = "set_6_uncapped",
  RTM_ROUND = "rtm_round",
  COMPLETED = "completed",
  PAUSED = "paused",
}

export interface Bid {
  id: string;
  teamId: IPLTeamId;
  userId: string;
  playerId: string;
  amount: number;
  timestamp: number;
  isRTM: boolean;
}

export interface AuctionPlayer {
  player: Player;
  status: "unsold" | "sold" | "in-auction" | "retained" | "rtm";
  currentBid: number;
  currentBidder: IPLTeamId | null;
  bidHistory: Bid[];
  soldTo: IPLTeamId | null;
  soldPrice: number | null;
  setNumber: number;
  orderInSet: number;
}

export interface AuctionConfig {
  id: string;
  name: string;
  type: "mega" | "mini";
  totalPurse: number;
  timerSeconds: number;
  maxPlayers: number;
  enableRTM: boolean;
  enableAccelerated: boolean;
  hostUserId: string;
  maxTeams: number;
  isPrivate: boolean;
  roomCode: string;
  createdAt: Date;
}

export interface AuctionState {
  currentPlayer: AuctionPlayer | null;
  currentPhase: AuctionPhase;
  timer: number;
  isTimerRunning: boolean;
  currentBid: number;
  currentBidder: IPLTeamId | null;
  bidHistory: Bid[];
  playerQueue: AuctionPlayer[];
  soldPlayers: AuctionPlayer[];
  unsoldPlayers: AuctionPlayer[];
  currentSetIndex: number;
  currentPlayerIndex: number;
  totalPlayersAuctioned: number;
  isPaused: boolean;
}

export interface AuctionRoom {
  config: AuctionConfig;
  state: AuctionState;
  teams: Map<
    IPLTeamId,
    {
      userId: string;
      displayName: string;
      budget: TeamBudget;
      playersWon: AuctionPlayer[];
      isConnected: boolean;
      isReady: boolean;
    }
  >;
  spectators: Array<{
    userId: string;
    displayName: string;
  }>;
  startedAt: Date | null;
  endedAt: Date | null;
}
