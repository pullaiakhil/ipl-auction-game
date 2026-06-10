'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/constants';
import { useAuctionStore } from '@/store/auctionStore';

export function useSocket(roomId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const store = useAuctionStore();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      store.setConnected(true);
      if (roomId) {
        socket.emit('join-room', { roomId });
      }
    });

    socket.on('disconnect', () => {
      store.setConnected(false);
    });

    socket.on('auction:state', (state) => {
      if (state.currentPlayer) store.setCurrentPlayer(state.currentPlayer);
      if (state.currentBid !== undefined) store.setCurrentBid(state.currentBid);
      if (state.currentBidder) store.setCurrentBidder(state.currentBidder);
      if (state.timer !== undefined) store.setTimer(state.timer);
      if (state.teams) store.setTeams(state.teams);
      if (state.status) store.setStatus(state.status);
      if (state.playerPool) store.setPlayerPool(state.playerPool);
      if (state.currentIndex !== undefined) store.setCurrentIndex(state.currentIndex);
    });

    socket.on('auction:new-bid', (bid) => {
      store.addBid(bid);
    });

    socket.on('auction:timer', (time: number) => {
      store.setTimer(time);
    });

    socket.on('auction:sold', ({ player, teamId, amount }) => {
      store.markSold(player, teamId, amount);
    });

    socket.on('auction:unsold', ({ player }) => {
      store.markUnsold(player);
    });

    socket.on('auction:next-player', ({ player, index }) => {
      store.setCurrentPlayer(player);
      store.setCurrentIndex(index);
      store.setCurrentBid(player.basePrice);
      store.setCurrentBidder(null);
      store.setStatus('active');
    });

    socket.on('chat:message', (message) => {
      store.addMessage(message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const placeBid = useCallback((amount: number) => {
    socketRef.current?.emit('auction:bid', {
      roomId: store.roomId,
      teamId: store.myTeamId,
      amount,
    });
  }, [store.roomId, store.myTeamId]);

  const sendMessage = useCallback((message: string) => {
    socketRef.current?.emit('chat:send', {
      roomId: store.roomId,
      message,
    });
  }, [store.roomId]);

  const passBid = useCallback(() => {
    socketRef.current?.emit('auction:pass', {
      roomId: store.roomId,
      teamId: store.myTeamId,
    });
  }, [store.roomId, store.myTeamId]);

  return {
    socket: socketRef.current,
    isConnected: store.isConnected,
    emit,
    placeBid,
    sendMessage,
    passBid,
  };
}
