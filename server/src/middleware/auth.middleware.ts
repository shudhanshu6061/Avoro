import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.jwt;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
      req.userId = decoded.id;
    }
  } catch (_) {}
  next();
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.jwt;
    if (!token) { res.status(401).json({ message: 'Not authenticated' }); return; }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
    req.userId = decoded.id;
    next();
  } catch (_) {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
};
