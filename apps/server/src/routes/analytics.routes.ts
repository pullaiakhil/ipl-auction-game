import { Router, Request, Response } from 'express';
export const analyticsRouter = Router();

analyticsRouter.get('/auction/:auctionId', async (req: Request, res: Response) => {
  res.json({ success: true, data: { auctionId: req.params.auctionId, totalSpent: 0, teams: [] } });
});

analyticsRouter.get('/overview', async (_req: Request, res: Response) => {
  res.json({ success: true, data: { totalAuctions: 0, totalPlayers: 500, totalUsers: 0 } });
});
