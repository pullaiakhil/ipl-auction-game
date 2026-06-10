import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
  country: string;
  basePrice: number;
  rating: number;
  battingRating: number;
  bowlingRating: number;
  fieldingRating: number;
  fitnessRating: number;
  formRating: number;
  imageUrl?: string;
  isCapped: boolean;
  specialization?: string;
}

export interface Bid {
  id: string;
  teamId: string;
  amount: number;
  timestamp: number;
  playerName?: string;
}

export interface TeamState {
  id: string;
  name: string;
  short: string;
  color: string;
  budget: number;
  maxBudget: number;
  players: Player[];
  isCurrentBidder: boolean;
}

export interface AuctionState {
  roomId: string | null;
  status: 'waiting' | 'active' | 'paused' | 'sold' | 'unsold' | 'completed';
  currentPlayer: Player | null;
  currentBid: number;
  currentBidder: string | null;
  timer: number;
  maxTimer: number;
  teams: TeamState[];
  myTeamId: string | null;
  bidHistory: Bid[];
  soldPlayers: Array<{ player: Player; teamId: string; amount: number }>;
  unsoldPlayers: Player[];
  playerPool: Player[];
  currentIndex: number;
  totalPlayers: number;
  isConnected: boolean;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  teamId?: string;
  message: string;
  timestamp: number;
  type: 'user' | 'system' | 'emote';
}

interface AuctionActions {
  setRoomId: (id: string) => void;
  setStatus: (status: AuctionState['status']) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setCurrentBid: (amount: number) => void;
  setCurrentBidder: (teamId: string | null) => void;
  setTimer: (time: number) => void;
  setTeams: (teams: TeamState[]) => void;
  updateTeamBudget: (teamId: string, budget: number) => void;
  addPlayerToTeam: (teamId: string, player: Player) => void;
  setMyTeamId: (teamId: string) => void;
  addBid: (bid: Bid) => void;
  markSold: (player: Player, teamId: string, amount: number) => void;
  markUnsold: (player: Player) => void;
  setPlayerPool: (players: Player[]) => void;
  setCurrentIndex: (index: number) => void;
  setConnected: (connected: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
}

const initialState: AuctionState = {
  roomId: null,
  status: 'waiting',
  currentPlayer: null,
  currentBid: 0,
  currentBidder: null,
  timer: 30,
  maxTimer: 30,
  teams: [],
  myTeamId: null,
  bidHistory: [],
  soldPlayers: [],
  unsoldPlayers: [],
  playerPool: [],
  currentIndex: 0,
  totalPlayers: 0,
  isConnected: false,
  messages: [],
};

export const useAuctionStore = create<AuctionState & AuctionActions>((set) => ({
  ...initialState,

  setRoomId: (id) => set({ roomId: id }),
  setStatus: (status) => set({ status }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setCurrentBid: (amount) => set({ currentBid: amount }),
  setCurrentBidder: (teamId) => set({ currentBidder: teamId }),
  setTimer: (time) => set({ timer: time }),

  setTeams: (teams) => set({ teams }),

  updateTeamBudget: (teamId, budget) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, budget } : t
      ),
    })),

  addPlayerToTeam: (teamId, player) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, players: [...t.players, player] } : t
      ),
    })),

  setMyTeamId: (teamId) => set({ myTeamId: teamId }),

  addBid: (bid) =>
    set((state) => ({
      bidHistory: [bid, ...state.bidHistory].slice(0, 50),
      currentBid: bid.amount,
      currentBidder: bid.teamId,
    })),

  markSold: (player, teamId, amount) =>
    set((state) => ({
      soldPlayers: [...state.soldPlayers, { player, teamId, amount }],
      status: 'sold' as const,
    })),

  markUnsold: (player) =>
    set((state) => ({
      unsoldPlayers: [...state.unsoldPlayers, player],
      status: 'unsold' as const,
    })),

  setPlayerPool: (players) =>
    set({ playerPool: players, totalPlayers: players.length }),

  setCurrentIndex: (index) => set({ currentIndex: index }),
  setConnected: (connected) => set({ isConnected: connected }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message].slice(-100),
    })),

  reset: () => set(initialState),
}));
