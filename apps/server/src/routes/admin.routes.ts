import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { prisma } from '../config/database';

export const adminRouter = Router();

adminRouter.use(authenticateToken);
adminRouter.use(requireAdmin);

adminRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [users, players, teams, auctions] = await Promise.all([
      prisma.user.count(),
      prisma.player.count(),
      prisma.team.count(),
      prisma.auctionRoom.count(),
    ]);
    res.json({ success: true, data: { users, players, teams, auctions } });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

adminRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, totalAuctions: true, totalWins: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, data: users });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});
