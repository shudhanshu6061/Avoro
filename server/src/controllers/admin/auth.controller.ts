import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

const generateToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

const setTokenCookie = (res: Response, token: string) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: user.id, pending2FA: true },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '5m' },
      );
      res.cookie('jwt_2fa', tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 5 * 60 * 1000,
      });
      res.json({ requires2FA: true });
      return;
    }

    const token = generateToken(user.id);
    setTokenCookie(res, token);

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const tempToken = req.cookies?.jwt_2fa;

    if (!tempToken) {
      res.status(401).json({ message: 'No pending 2FA session' });
      return;
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback_secret') as {
      id: string;
      pending2FA: boolean;
    };

    if (!decoded.pending2FA) {
      res.status(401).json({ message: 'Invalid 2FA session' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.twoFactorSecret) {
      res.status(401).json({ message: 'Invalid session' });
      return;
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'AVORO Admin',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
      res.status(401).json({ message: 'Invalid 2FA code' });
      return;
    }

    res.cookie('jwt_2fa', '', { httpOnly: true, expires: new Date(0) });
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const setup2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }

    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: 'AVORO Admin',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 },
    });

    const uri = totp.toString();
    const qrCode = await QRCode.toDataURL(uri);

    res.json({ qrCode, secret: secret.base32 });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const enable2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !user.twoFactorSecret) {
      res.status(400).json({ message: 'Setup 2FA first' });
      return;
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'AVORO Admin',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
      res.status(401).json({ message: 'Invalid code' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    res.json({ message: '2FA enabled' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const adminMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Both current and new password are required' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ message: 'New password must be at least 8 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const adminLogout = (_req: Request, res: Response): void => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('jwt_2fa', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out' });
};
