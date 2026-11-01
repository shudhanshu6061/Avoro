import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// GET /api/admin/subscribers
export const listSubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', search, sort = 'newest', limit: queryLimit } = req.query;
    const limit = queryLimit ? Number(queryLimit) : 20;
    const skip = (Number(page) - 1) * limit;

    const where: any = {};
    if (search && typeof search === 'string') {
      where.email = { contains: search.trim(), mode: 'insensitive' };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.subscriber.count({ where }),
    ]);

    res.json({
      subscribers,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/subscribers/stats
export const getSubscribersStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, unsubscribed, newThisMonth] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { status: 'ACTIVE' } }),
      prisma.subscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
      prisma.subscriber.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    res.json({
      total,
      active,
      unsubscribed,
      newThisMonth,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/subscribers/:id
export const getSubscriber = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const subscriber = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      res.status(404).json({ message: 'Subscriber not found' });
      return;
    }

    res.json(subscriber);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/subscribers/:id
export const updateSubscriber = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    const subscriber = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      res.status(404).json({ message: 'Subscriber not found' });
      return;
    }

    const updated = await prisma.subscriber.update({
      where: { id },
      data: {
        status: status !== undefined ? status : subscriber.status,
        notes: notes !== undefined ? notes : subscriber.notes,
      },
    });

    res.json({ message: 'Subscriber updated successfully', subscriber: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/subscribers/:id
export const deleteSubscriber = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const subscriber = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      res.status(404).json({ message: 'Subscriber not found' });
      return;
    }

    await prisma.subscriber.delete({
      where: { id },
    });

    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/subscribers (Bulk Update Status)
export const bulkUpdateSubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'Subscriber IDs are required' });
      return;
    }

    if (!status || !['ACTIVE', 'UNSUBSCRIBED'].includes(status)) {
      res.status(400).json({ message: 'Valid status is required' });
      return;
    }

    await prisma.subscriber.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    res.json({ message: `Successfully updated ${ids.length} subscribers` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/subscribers (Bulk Delete)
export const bulkDeleteSubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'Subscriber IDs are required' });
      return;
    }

    await prisma.subscriber.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ message: `Successfully deleted ${ids.length} subscribers` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
