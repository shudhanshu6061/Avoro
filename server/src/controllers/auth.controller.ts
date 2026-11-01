import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { sendBulkBlasterOtp } from '../services/otp.service';

// In-memory store for OTPs (phone -> { code, expiresAt })
const otpStore = new Map<string, { code: string; expiresAt: number }>();

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ message: 'Mobile phone number is required.' });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    // Generate 6-digit OTP code (always between 100000 and 999999)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Store OTP in memory
    otpStore.set(cleanPhone, { code: otpCode, expiresAt });

    // Send via BulkBlaster OTP service
    const result = await sendBulkBlasterOtp({
      phone: cleanPhone,
      otpCode,
    });

    if (!result.success) {
      console.error(`BulkBlaster API Error: ${result.error}. Phone: ${cleanPhone}`);
      res.status(500).json({
        message: result.error || 'Failed to deliver OTP via BulkBlaster SMS. Please verify server API key configuration.',
        devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
      });
      return;
    }

    res.status(200).json({
      message: 'OTP sent successfully to your mobile number via SMS.',
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to send OTP.' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ message: 'Phone number and OTP code are required.' });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const stored = otpStore.get(cleanPhone);

    if (!stored) {
      res.status(400).json({ message: 'No OTP requested for this phone number or it has expired.' });
      return;
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanPhone);
      res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
      return;
    }

    if (stored.code !== otp.trim()) {
      res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
      return;
    }

    // OTP Verified! Clear stored record
    otpStore.delete(cleanPhone);

    // Normalize phone number (strip non-digits, remove 91 prefix if 12-digit)
    const normalizedPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91')
      ? cleanPhone.slice(2)
      : cleanPhone;

    const phoneVariants = Array.from(
      new Set([
        cleanPhone,
        normalizedPhone,
        `91${normalizedPhone}`,
        `+91${normalizedPhone}`,
      ])
    );

    // Find user by phone number or phone-derived synthetic email
    const syntheticEmail = `user_${normalizedPhone}@avoro.in`;
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: { in: phoneVariants } },
          { email: syntheticEmail },
          { email: { startsWith: `user_${cleanPhone}` } },
          { email: { startsWith: `user_${normalizedPhone}` } },
        ],
      },
    });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`avoro_otp_${normalizedPhone}_${Date.now()}`, salt);
      user = await prisma.user.create({
        data: {
          firstName: 'Customer',
          lastName: normalizedPhone.slice(-4),
          email: syntheticEmail,
          phone: normalizedPhone,
          password: hashedPassword,
          role: 'CUSTOMER',
        },
      });
    } else if (!(user as any).phone) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phone: normalizedPhone },
      });
    }

    const token = generateToken(user.id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const isDefaultEmail = user.email.startsWith('user_') && user.email.endsWith('@avoro.in');
    const isDefaultName = user.firstName === 'Customer';
    const isProfileComplete = !isDefaultEmail && !isDefaultName && Boolean(user.firstName && user.email);

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: (user as any).phone || normalizedPhone,
      role: user.role,
      isProfileComplete,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'OTP verification failed.' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized. Please log in.' });
      return;
    }

    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !email) {
      res.status(400).json({ message: 'First name and email are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing && existing.id !== userId) {
      res.status(400).json({ message: 'Email address is already registered to another user.' });
      return;
    }

    const rawPhone = phone ? phone.replace(/\D/g, '') : undefined;
    const normalizedPhone = rawPhone && rawPhone.length === 12 && rawPhone.startsWith('91')
      ? rawPhone.slice(2)
      : rawPhone;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName.trim(),
        lastName: (lastName || '').trim(),
        email: cleanEmail,
        ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      },
    });

    res.status(200).json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: (updatedUser as any).phone || normalizedPhone,
      role: updatedUser.role,
      isProfileComplete: true,
      message: 'Profile updated successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update profile.' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isDefaultEmail = user.email.startsWith('user_') && user.email.endsWith('@avoro.in');
    const isDefaultName = user.firstName === 'Customer';
    const isProfileComplete = !isDefaultEmail && !isDefaultName && Boolean(user.firstName && user.email);

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: (user as any).phone || null,
      role: user.role,
      isProfileComplete,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch user profile.' });
  }
};


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    if (user) {
      const token = generateToken(user.id);
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: (user as any).phone || null,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: (user as any).phone || null,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};


