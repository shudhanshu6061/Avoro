import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// GET /api/admin/messages
export const listMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', search, status, sort = 'newest', limit: queryLimit } = req.query;
    const limit = queryLimit ? Number(queryLimit) : 20;
    const skip = (Number(page) - 1) * limit;

    const where: any = {};

    // Filter by status if provided and not "ALL"
    if (status && typeof status === 'string' && status.toUpperCase() !== 'ALL') {
      where.status = status.toUpperCase();
    }

    // Search by name, email, or subject
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerms = search.trim();
      where.OR = [
        { name: { contains: searchTerms, mode: 'insensitive' } },
        { email: { contains: searchTerms, mode: 'insensitive' } },
        { subject: { contains: searchTerms, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    res.json({
      messages,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/messages/stats
export const getMessagesStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, newCount, readCount, repliedCount] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: 'NEW' } }),
      prisma.contactMessage.count({ where: { status: 'READ' } }),
      prisma.contactMessage.count({ where: { status: 'REPLIED' } }),
    ]);

    res.json({
      total,
      newCount,
      readCount,
      repliedCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/messages/:id
export const getMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Auto mark as READ when viewed, if it is currently NEW
    if (message.status === 'NEW') {
      const updated = await prisma.contactMessage.update({
        where: { id },
        data: { status: 'READ' },
      });
      res.json(updated);
      return;
    }

    res.json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/messages/:id
export const updateMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, assignedToId, internalNotes, tags, isSpam, replyEmailSent } = req.body;

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: status !== undefined ? status : message.status,
        assignedToId: assignedToId !== undefined ? assignedToId : message.assignedToId,
        internalNotes: internalNotes !== undefined ? internalNotes : message.internalNotes,
        tags: tags !== undefined ? tags : message.tags,
        isSpam: isSpam !== undefined ? isSpam : message.isSpam,
        replyEmailSent: replyEmailSent !== undefined ? replyEmailSent : message.replyEmailSent,
      },
    });

    res.json({ message: 'Message updated successfully', messageData: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/messages/:id
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/messages (Bulk Update)
export const bulkUpdateMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'Message IDs are required' });
      return;
    }

    if (!status || !['NEW', 'READ', 'REPLIED', 'ARCHIVED'].includes(status)) {
      res.status(400).json({ message: 'Valid status is required' });
      return;
    }

    await prisma.contactMessage.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    res.json({ message: `Successfully updated ${ids.length} messages` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/messages (Bulk Delete)
export const bulkDeleteMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'Message IDs are required' });
      return;
    }

    await prisma.contactMessage.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ message: `Successfully deleted ${ids.length} messages` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
