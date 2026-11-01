import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const listDiscounts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const discounts = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(discounts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, description, type, value, minOrderValue, maxUses, isActive, startsAt, expiresAt } = req.body;
    const discount = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        type: type || 'PERCENTAGE',
        value,
        minOrderValue: minOrderValue || null,
        maxUses: maxUses || null,
        isActive: isActive ?? true,
        startsAt: startsAt ? new Date(startsAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    res.status(201).json(discount);
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(400).json({ message: 'Code already exists' }); return; }
    res.status(500).json({ message: error.message });
  }
};

export const updateDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (data.code) data.code = data.code.toUpperCase();
    if (data.startsAt) data.startsAt = new Date(data.startsAt);
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);

    const id = req.params.id as string;
    const discount = await prisma.discountCode.update({ where: { id }, data });
    res.json(discount);
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ message: 'Not found' }); return; }
    res.status(500).json({ message: error.message });
  }
};

export const deleteDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.discountCode.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ message: 'Not found' }); return; }
    res.status(500).json({ message: error.message });
  }
};
