import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// Admin: List all reviews (with optional filters)
export const listReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string; // 'pending', 'approved', or ''
    const productId = req.query.productId as string;

    const where: any = {};
    if (status === 'pending') where.isApproved = false;
    if (status === 'approved') where.isApproved = true;
    if (productId) where.productId = productId;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: { select: { name: true, slug: true } },
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    const formatted = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      product: r.product,
      rating: r.rating,
      title: r.title,
      body: r.body,
      guestName: r.guestName,
      guestEmail: r.guestEmail,
      author: r.user ? `${r.user.firstName} ${r.user.lastName}` : r.guestName || 'Guest',
      email: r.user?.email || r.guestEmail,
      isApproved: r.isApproved,
      createdAt: r.createdAt,
    }));

    res.json({ reviews: formatted, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve or reject a review
export const updateReviewApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { isApproved } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    res.json(review);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete a review
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Review deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get single review
export const getReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!review) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
