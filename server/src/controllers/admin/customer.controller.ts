import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const listCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', search } = req.query;
    const limit = 20;
    const skip = (Number(page) - 1) * limit;

    const where: any = { role: 'CUSTOMER' };
    if (search && typeof search === 'string') {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            select: { totalPrice: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const data = customers.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: (c as any).phone || '',
      createdAt: c.createdAt,
      totalOrders: c._count.orders,
      totalSpent: c.orders.reduce((sum, o) => sum + o.totalPrice, 0),
    }));

    res.json({ customers: data, total, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: { orderItems: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const { password, twoFactorSecret, ...safe } = customer;
    res.json({
      ...safe,
      totalOrders: customer.orders.length,
      totalSpent: customer.orders.reduce((sum: number, o) => sum + o.totalPrice, 0),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    if (customer.role !== 'CUSTOMER') {
      res.status(403).json({ message: 'Cannot delete admin or superadmin user' });
      return;
    }

    if (customer._count.articles > 0) {
      res.status(400).json({ message: 'Cannot delete user with articles' });
      return;
    }

    await prisma.$transaction([
      prisma.order.updateMany({
        where: { userId: id },
        data: { userId: null },
      }),
      prisma.review.updateMany({
        where: { userId: id },
        data: { userId: null },
      }),
      prisma.user.delete({
        where: { id },
      }),
    ]);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

