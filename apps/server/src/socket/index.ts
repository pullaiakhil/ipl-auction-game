import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { handleRoomEvents } from './handlers/room.handler';
import { handleAuctionEvents } from './handlers/auction.handler';
import { handleChatEvents } from './handlers/chat.handler';
import { AuctionEngine } from '../engine/auction/AuctionEngine';

export const activeAuctions = new Map<string, AuctionEngine>();

export function initializeSocketHandlers(io: SocketIOServer) {
  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        (socket as any).userId = decoded.userId;
        (socket as any).userName = decoded.name || 'Guest';
        (socket as any).userRole = decoded.role;
        return next();
      }
    }
    // Allow guest connections
    (socket as any).userId = `guest_${socket.id}`;
    (socket as any).userName = `Guest_${socket.id.slice(0, 5)}`;
    (socket as any).userRole = 'USER';
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const userName = (socket as any).userName;
    logger.info(`🔌 Client connected: ${userName} (${userId})`);

    // Register modular handlers
    handleRoomEvents(io, socket);
    handleAuctionEvents(io, socket);
    handleChatEvents(io, socket);

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${userName} (${userId})`);
    });
  });
}
