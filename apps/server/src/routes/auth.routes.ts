import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { authenticateToken } from '../middleware/auth.middleware';

export const authRouter = Router();

function generateToken(user: { id: string; email?: string | null; name?: string | null; role: string; isGuest?: boolean }) {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role, isGuest: !!user.isGuest },
    env.AUTH_SECRET,
    { expiresIn: '7d' }
  );
}

// Register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, hashedPassword, name: name || email.split('@')[0], role: 'USER' },
    });

    const token = generateToken(user);
    return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, totalAuctions: 0, totalWins: 0, rating: 1000 } });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.hashedPassword) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, totalAuctions: user.totalAuctions, totalWins: user.totalWins, rating: user.rating } });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Guest login
authRouter.post('/guest', async (_req: Request, res: Response) => {
  try {
    const guestId = uuid();
    const user = await prisma.user.create({
      data: {
        email: `guest_${guestId}@ipl-auction.local`,
        name: `Player_${guestId.slice(0, 6)}`,
        role: 'USER',
        guestId,
      },
    });

    const token = generateToken({ ...user, isGuest: true });
    return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, totalAuctions: 0, totalWins: 0, rating: 1000 } });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Guest login failed' });
  }
});

// Get current user
authRouter.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: (req as any).userId } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, totalAuctions: user.totalAuctions, totalWins: user.totalWins, rating: user.rating } });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});
