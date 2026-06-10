import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

export const teamRouter = Router();

// GET /teams
teamRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: teams });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch teams' });
  }
});

// GET /teams/:id
teamRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = await prisma.team.findUnique({ where: { id: req.params.id } });
    if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch team' });
  }
});
