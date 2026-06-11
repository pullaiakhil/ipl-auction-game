import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

export const playerRouter = Router();

// GET /players - Paginated, filterable
playerRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 24, 100);
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || 'overallRating';
    const sortDir = (req.query.sortDir as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.nationality) where.nationality = req.query.nationality;
    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search as string, mode: 'insensitive' } },
        { fullName: { contains: req.query.search as string, mode: 'insensitive' } },
        { country: { contains: req.query.search as string, mode: 'insensitive' } },
      ];
    }

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortDir },
        select: {
          id: true, name: true, fullName: true, country: true, nationality: true,
          role: true, subRole: true, age: true, overallRating: true,
          battingRating: true, bowlingRating: true, fieldingRating: true,
          basePrice: true, isMarquee: true, isCapped: true,
          matches: true, runs: true, wickets: true, strikeRate: true,
          battingAverage: true, economy: true,
        },
      }),
      prisma.player.count({ where }),
    ]);

    return res.json({
      success: true,
      data: players,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to fetch players' });
  }
});

// GET /players/top
playerRouter.get('/top', async (req: Request, res: Response) => {
  try {
    const metric = (req.query.metric as string) || 'overallRating';
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const players = await prisma.player.findMany({
      orderBy: { [metric]: 'desc' },
      take: limit,
      select: {
        id: true, name: true, role: true, country: true,
        overallRating: true, runs: true, wickets: true, basePrice: true,
      },
    });

    return res.json({ success: true, data: players });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to fetch top players' });
  }
});

// GET /players/:id
playerRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const player = await prisma.player.findUnique({ where: { id: req.params.id as string } });
    if (!player) return res.status(404).json({ success: false, error: 'Player not found' });
    return res.json({ success: true, data: player });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to fetch player' });
  }
});
