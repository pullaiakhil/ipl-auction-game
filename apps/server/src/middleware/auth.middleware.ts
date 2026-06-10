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

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }

  (req as any).userId = decoded.userId;
  (req as any).userRole = decoded.role;
  (req as any).userName = decoded.name;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req as any).userRole !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
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
