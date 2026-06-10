'use client';

import { useAuctionStore } from '@/store/auctionStore';

export function useAuction() {
  const state = useAuctionStore();

  const myTeam = state.teams.find(t => t.id === state.myTeamId) ?? null;
  const currentBidderTeam = state.teams.find(t => t.id === state.currentBidder) ?? null;
  const isMyBid = state.currentBidder === state.myTeamId;
  const canBid = state.status === 'active' && !isMyBid && myTeam !== null && myTeam.budget >= state.currentBid;
  const progress = state.totalPlayers > 0 ? (state.currentIndex / state.totalPlayers) * 100 : 0;

  const sortedTeamsByBudget = [...state.teams].sort((a, b) => b.budget - a.budget);
  const sortedSoldPlayers = [...state.soldPlayers].sort((a, b) => b.amount - a.amount);

  return {
    ...state,
    myTeam,
    currentBidderTeam,
    isMyBid,
    canBid,
    progress,
    sortedTeamsByBudget,
    sortedSoldPlayers,
  };
}
