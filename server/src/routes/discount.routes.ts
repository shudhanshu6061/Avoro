import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) { res.status(400).json({ message: 'Code is required' }); return; }

    const discount = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount || !discount.isActive) {
      res.status(404).json({ message: 'Invalid or expired discount code' });
      return;
    }

    const now = new Date();
    if (discount.startsAt && now < discount.startsAt) {
      res.status(400).json({ message: 'This code is not active yet' });
      return;
    }
    if (discount.expiresAt && now > discount.expiresAt) {
      res.status(400).json({ message: 'This code has expired' });
      return;
    }
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      res.status(400).json({ message: 'This code has reached its usage limit' });
      return;
    }
    if (discount.minOrderValue && orderTotal < discount.minOrderValue) {
      res.status(400).json({ message: `Minimum order of ₹${discount.minOrderValue} required` });
      return;
    }

    const discountAmount = discount.type === 'PERCENTAGE'
      ? Math.round((orderTotal * discount.value) / 100)
      : Math.min(discount.value, orderTotal);

    res.json({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discountAmount,
      description: discount.description,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
