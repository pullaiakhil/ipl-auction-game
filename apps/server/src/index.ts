import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/error.middleware';
import { initializeSocketHandlers } from './socket';
import { authRouter } from './routes/auth.routes';
import { playerRouter } from './routes/player.routes';
import { teamRouter } from './routes/team.routes';
import { auctionRouter } from './routes/auction.routes';
import { matchRouter } from './routes/match.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { adminRouter } from './routes/admin.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/players', playerRouter);
app.use('/api/teams', teamRouter);
app.use('/api/auctions', auctionRouter);
app.use('/api/matches', matchRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);

// Socket.IO
initializeSocketHandlers(io);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  io.close(() => logger.info('Socket.IO server closed'));
  
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    await prisma.$disconnect();
    logger.info('Database disconnected');
    await redis.quit();
    logger.info('Redis disconnected');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

const PORT = env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 IPL Auction Server running on port ${PORT}`);
  logger.info(`📡 Socket.IO ready for connections`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});

export { io, app, httpServer };
