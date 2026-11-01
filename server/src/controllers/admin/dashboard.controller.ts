import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalRevenue, recentOrders, ordersByStatus] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({ _sum: { totalPrice: true }, where: { isPaid: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await prisma.order.findMany({
      where: { isPaid: true, createdAt: { gte: sixMonthsAgo } },
      select: { totalPrice: true, createdAt: true },
    });

    const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      const monthOrders = monthlyOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });
      monthlyRevenue.push({
        month: monthStr,
        revenue: monthOrders.reduce((sum, o) => sum + o.totalPrice, 0),
        orders: monthOrders.length,
      });
    }

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      recentOrders,
      ordersByStatus: ordersByStatus.map(s => ({ status: s.status, count: s._count.id })),
      monthlyRevenue,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
