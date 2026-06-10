import type { AuctionState, AuctionConfig, Bid, AuctionPlayer } from "./auction";
import type { IPLTeamId, TeamBudget } from "./team";

export interface ServerToClientEvents {
  "auction:state": (state: AuctionState) => void;
  "auction:player-presented": (player: AuctionPlayer) => void;
  "auction:bid-placed": (bid: Bid) => void;
  "auction:bid-rejected": (data: { reason: string; teamId: IPLTeamId }) => void;
  "auction:timer-tick": (seconds: number) => void;
  "auction:player-sold": (data: {
    player: AuctionPlayer;
    teamId: IPLTeamId;
    price: number;
  }) => void;
  "auction:player-unsold": (player: AuctionPlayer) => void;
  "auction:phase-changed": (phase: string) => void;
  "auction:paused": () => void;
  "auction:resumed": () => void;
  "auction:completed": (data: {
    summary: Record<IPLTeamId, { players: AuctionPlayer[]; spent: number; remaining: number }>;
  }) => void;
  "auction:rtm-used": (data: {
    teamId: IPLTeamId;
    player: AuctionPlayer;
    price: number;
  }) => void;
  "room:team-joined": (data: {
    teamId: IPLTeamId;
    userId: string;
    displayName: string;
  }) => void;
  "room:team-left": (data: { teamId: IPLTeamId; userId: string }) => void;
  "room:team-ready": (data: { teamId: IPLTeamId; isReady: boolean }) => void;
  "room:spectator-joined": (data: {
    userId: string;
    displayName: string;
  }) => void;
  "room:spectator-left": (data: { userId: string }) => void;
  "room:budget-updated": (data: {
    teamId: IPLTeamId;
    budget: TeamBudget;
  }) => void;
  "room:chat-message": (data: {
    userId: string;
    displayName: string;
    message: string;
    timestamp: number;
  }) => void;
  "room:error": (data: { code: string; message: string }) => void;
  "connection:authenticated": (data: { userId: string }) => void;
  "connection:error": (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  "auction:place-bid": (data: {
    roomId: string;
    amount: number;
  }) => void;
  "auction:use-rtm": (data: {
    roomId: string;
    playerId: string;
  }) => void;
  "auction:skip-player": (data: { roomId: string }) => void;
  "auction:pause": (data: { roomId: string }) => void;
  "auction:resume": (data: { roomId: string }) => void;
  "auction:next-player": (data: { roomId: string }) => void;
  "auction:start": (data: { roomId: string }) => void;
  "room:join": (data: {
    roomId: string;
    teamId: IPLTeamId;
    displayName: string;
  }) => void;
  "room:join-spectator": (data: {
    roomId: string;
    displayName: string;
  }) => void;
  "room:leave": (data: { roomId: string }) => void;
  "room:ready": (data: { roomId: string; isReady: boolean }) => void;
  "room:chat": (data: { roomId: string; message: string }) => void;
  "room:create": (
    data: { config: Partial<AuctionConfig> },
    callback: (response: { roomId: string; roomCode: string } | { error: string }) => void
  ) => void;
  "connection:authenticate": (data: { token: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
  "sync:auction-state": (data: {
    roomId: string;
    state: AuctionState;
  }) => void;
}

export interface SocketData {
  userId: string;
  displayName: string;
  roomId: string | null;
  teamId: IPLTeamId | null;
  isHost: boolean;
  isSpectator: boolean;
  authenticatedAt: number;
}
