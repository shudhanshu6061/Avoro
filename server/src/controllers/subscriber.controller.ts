import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// POST /api/subscribers
export const subscribeEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, source } = req.body;

    if (!email && !phone) {
      res.status(400).json({ message: 'Email address or phone number is required' });
      return;
    }

    let cleanEmail = '';
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Please enter a valid email address' });
        return;
      }
      cleanEmail = email.trim().toLowerCase();
    } else if (phone) {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      cleanEmail = `lead_${cleanPhone.replace('+', '')}@vip.avoro.in`;
    }

    const cleanPhone = phone ? String(phone).trim() : undefined;

    // Check if subscriber exists
    const existing = await prisma.subscriber.findUnique({
      where: { email: cleanEmail },
    });

    const metadataObj: any = (existing?.metadata as any) || {};
    if (cleanPhone) {
      metadataObj.phone = cleanPhone;
    }

    if (existing) {
      const updated = await prisma.subscriber.update({
        where: { email: cleanEmail },
        data: {
          status: 'ACTIVE',
          source: source || existing.source,
          notes: cleanPhone ? `Phone: ${cleanPhone}` : existing.notes,
          metadata: metadataObj,
        },
      });

      res.status(200).json({
        message: "You're on the exclusive AVORO VIP list. We will notify you when we launch.",
        alreadySubscribed: existing.status === 'ACTIVE',
        subscriber: updated,
      });
      return;
    }

    // Create new subscriber
    const newSubscriber = await prisma.subscriber.create({
      data: {
        email: cleanEmail,
        source: source || 'Pre-Launch Landing Page',
        status: 'ACTIVE',
        notes: cleanPhone ? `Phone: ${cleanPhone}` : null,
        metadata: metadataObj,
      },
    });

    res.status(201).json({
      message: "You're on the exclusive AVORO VIP list. We will notify you first at launch.",
      alreadySubscribed: false,
      subscriber: newSubscriber,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
