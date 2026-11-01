import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listPublishedArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const where = { status: 'PUBLISHED' as const };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: true,
          author: { select: { firstName: true, lastName: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    res.json({ articles, total, page, pages: Math.ceil(total / limit) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load articles';
    res.status(500).json({ message });
  }
};

export const getPublishedArticleBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;

    const article = await prisma.article.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        category: true,
        author: { select: { firstName: true, lastName: true } },
      },
    });

    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    res.json(article);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load article';
    res.status(500).json({ message });
  }
};