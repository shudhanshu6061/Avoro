import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    let where: any = {};
    if (status) {
      where.status = status as any;
    }

    if (search && search.trim() !== '') {
      const cleanSearch = search.trim();
      where = {
        ...where,
        OR: [
          { orderNumber: { contains: cleanSearch, mode: 'insensitive' } },
          { id: { contains: cleanSearch, mode: 'insensitive' } },
          { guestEmail: { contains: cleanSearch, mode: 'insensitive' } },
          { user: { email: { contains: cleanSearch, mode: 'insensitive' } } },
          { user: { firstName: { contains: cleanSearch, mode: 'insensitive' } } },
          { user: { lastName: { contains: cleanSearch, mode: 'insensitive' } } },
        ],
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { orderItems: { include: { product: true } }, user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } }, user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!order) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const data: any = { status };
    if (status === 'DELIVERED') data.isDelivered = true;
    if (status === 'DELIVERED') data.deliveredAt = new Date();

    const order = await prisma.order.update({
      where: { id },
      data,
    });
    res.json(order);
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ message: 'Not found' }); return; }
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    // Delete related order items first
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });
    res.json({ message: 'Order deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ message: 'Order not found' }); return; }
    res.status(500).json({ message: error.message });
  }
};
