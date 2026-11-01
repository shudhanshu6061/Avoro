import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Public: Submit a new review (pending approval)
export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, rating, title, body, guestName, guestEmail } = req.body;

    if (!productId || !rating || !body) {
      res.status(400).json({ message: 'productId, rating and body are required' });
      return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5' });
      return;
    }

    // Optional: if user is logged in, attach it (future auth integration)
    const userId = (req as any).user?.id || null;

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: Math.round(rating),
        title: title?.trim() || null,
        body: body.trim(),
        guestName: guestName?.trim() || null,
        guestEmail: guestEmail?.trim() || null,
        isApproved: false,
      },
    });

    res.status(201).json({ message: 'Review submitted for approval', review });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Public: Get approved reviews for a product
export const getApprovedReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.query.productId as string;
    if (!productId) {
      res.status(400).json({ message: 'productId is required' });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    // Normalize display name
    const formatted = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt,
      author: r.user
        ? `${r.user.firstName} ${r.user.lastName}`
        : r.guestName || 'Verified Customer',
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Public: Get average rating + count for a product (approved only)
export const getReviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.query.productId as string;
    if (!productId) {
      res.status(400).json({ message: 'productId is required' });
      return;
    }

    const [count, agg] = await Promise.all([
      prisma.review.count({ where: { productId, isApproved: true } }),
      prisma.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true },
      }),
    ]);

    res.json({
      count,
      average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
