import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth.middleware';

export const auctionRouter = Router();

// POST /auctions - Create room
auctionRouter.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, mode, purseAmount, maxSquadSize, maxOverseas, timerSeconds, enableAI, isPublic } = req.body;
    const code = generateCode();

    const room = await prisma.auctionRoom.create({
      data: {
        code,
        name: name || 'Auction Room',
        hostId: (req as any).userId,
        mode: mode || 'MEGA',
        purseAmount: purseAmount || 120,
        maxSquadSize: maxSquadSize || 25,
        minSquadSize: 18,
        maxOverseas: maxOverseas || 8,
        timerSeconds: timerSeconds || 15,
        enableAI: enableAI ?? true,
        isPublic: isPublic ?? true,
        maxParticipants: 10,
        status: 'WAITING',
      },
    });

    res.json({ success: true, data: room });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create auction room' });
  }
});

// GET /auctions - List public rooms
auctionRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const rooms = await prisma.auctionRoom.findMany({
      where: { isPublic: true, status: 'WAITING' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { _count: { select: { participants: true } } },
    });
    res.json({ success: true, data: rooms });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch rooms' });
  }
});

// GET /auctions/:id
auctionRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const room = await prisma.auctionRoom.findUnique({
      where: { id: req.params.id },
      include: {
        participants: true,
        _count: { select: { auctionPlayers: true } },
      },
    });
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch room' });
  }
});

// GET /auctions/:id/results
auctionRouter.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const results = await prisma.auctionPlayer.findMany({
      where: { auctionRoomId: req.params.id, status: 'SOLD' },
      include: { player: true },
      orderBy: { soldPrice: 'desc' },
    });
    res.json({ success: true, data: results });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch results' });
  }
});

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}
