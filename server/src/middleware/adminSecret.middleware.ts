import { Request, Response, NextFunction } from 'express';

export function requireAdminSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    res.status(503).json({ message: 'ADMIN_SECRET is not configured on the server' });
    return;
  }

  const provided =
    req.headers['x-admin-secret'] ||
    req.body?.secret ||
    req.query?.secret;

  if (provided !== secret) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  next();
}