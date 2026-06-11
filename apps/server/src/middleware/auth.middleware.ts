import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  userId: string;
  email?: string;
  name?: string;
  role: string;
  isGuest?: boolean;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.AUTH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
    return;
  }

  (req as any).userId = decoded.userId;
  (req as any).userRole = decoded.role;
  (req as any).userName = decoded.name;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if ((req as any).userRole !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      (req as any).userId = decoded.userId;
      (req as any).userRole = decoded.role;
      (req as any).userName = decoded.name;
    }
  }
  next();
}
