import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth } from './auth.middleware';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  requireAuth(req, res, async () => {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
        res.status(403).json({ message: 'Access denied. Admin only.' });
        return;
      }
      next();
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  });
};
