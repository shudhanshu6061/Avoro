import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const listArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = ((req.query.search as string) || '').trim();
    const categoryId = (req.query.categoryId as string) || '';
    const status = (req.query.status as string) || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    const [articles, total, totalCount, draftCount, publishedCount, scheduledCount] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { category: true, author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
      prisma.article.count(),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'SCHEDULED' } }),
    ]);

    res.json({
      articles,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      stats: {
        total: totalCount,
        published: publishedCount,
        draft: draftCount,
        scheduled: scheduledCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { category: true, author: { select: { firstName: true, lastName: true } } },
    });
    if (!article) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.json(article);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, slug, body, excerpt, featuredImage, categoryId, status, scheduledAt, seo, seoTitle, seoDescription, seoKeyword, ogImage } = req.body;

    const finalSlug = slug && slug.trim() ? slugify(slug) : slugify(title);
    const seoObj = seo && typeof seo === 'object' ? seo : {};

    const finalSeoTitle = seoTitle || seoObj.seoTitle || seoObj.title || null;
    const finalSeoDescription = seoDescription || seoObj.seoDescription || seoObj.description || null;
    const finalSeoKeyword = seoKeyword || seoObj.focusKeyword || seoObj.keyword || null;
    const finalOgImage = ogImage || seoObj.ogImage || null;

    const data: any = {
      title,
      slug: finalSlug,
      body: body || '',
      excerpt: excerpt || null,
      featuredImage: featuredImage || null,
      categoryId: categoryId || null,
      authorId: req.userId!,
      status: status || 'DRAFT',
      seo: {
        ...seoObj,
        seoTitle: finalSeoTitle,
        seoDescription: finalSeoDescription,
        focusKeyword: finalSeoKeyword,
        ogImage: finalOgImage,
      },
      seoTitle: finalSeoTitle,
      seoDescription: finalSeoDescription,
      seoKeyword: finalSeoKeyword,
      ogImage: finalOgImage,
    };

    if (status === 'PUBLISHED') data.publishedAt = new Date();
    if (status === 'SCHEDULED' && scheduledAt) data.scheduledAt = new Date(scheduledAt);

    const article = await prisma.article.create({ data });
    res.status(201).json(article);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Slug already exists. Please use a unique title or slug.' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = { ...req.body };

    if (data.slug) {
      data.slug = slugify(data.slug);
    } else if (data.title) {
      data.slug = slugify(data.title);
    }

    const seoObj = data.seo && typeof data.seo === 'object' ? data.seo : {};
    const finalSeoTitle = data.seoTitle !== undefined ? data.seoTitle : (seoObj.seoTitle || seoObj.title);
    const finalSeoDescription = data.seoDescription !== undefined ? data.seoDescription : (seoObj.seoDescription || seoObj.description);
    const finalSeoKeyword = data.seoKeyword !== undefined ? data.seoKeyword : (seoObj.focusKeyword || seoObj.keyword);
    const finalOgImage = data.ogImage !== undefined ? data.ogImage : seoObj.ogImage;

    if (data.seo !== undefined || data.seoTitle !== undefined || data.seoDescription !== undefined) {
      data.seo = {
        ...seoObj,
        ...(finalSeoTitle !== undefined && { seoTitle: finalSeoTitle }),
        ...(finalSeoDescription !== undefined && { seoDescription: finalSeoDescription }),
        ...(finalSeoKeyword !== undefined && { focusKeyword: finalSeoKeyword }),
        ...(finalOgImage !== undefined && { ogImage: finalOgImage }),
      };
      if (finalSeoTitle !== undefined) data.seoTitle = finalSeoTitle || null;
      if (finalSeoDescription !== undefined) data.seoDescription = finalSeoDescription || null;
      if (finalSeoKeyword !== undefined) data.seoKeyword = finalSeoKeyword || null;
      if (finalOgImage !== undefined) data.ogImage = finalOgImage || null;
    }

    if (data.status === 'PUBLISHED') {
      const current = await prisma.article.findUnique({ where: { id }, select: { publishedAt: true } });
      if (current && !current.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    if (data.scheduledAt) {
      data.scheduledAt = new Date(data.scheduledAt);
    } else if (data.status !== 'SCHEDULED' && data.status !== undefined) {
      data.scheduledAt = null;
    }

    const article = await prisma.article.update({ where: { id }, data });
    res.json(article);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Slug already exists. Please use a unique title or slug.' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateArticleStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const updateData: any = { status };
    if (status === 'PUBLISHED') {
      const current = await prisma.article.findUnique({ where: { id }, select: { publishedAt: true } });
      if (current && !current.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
    });
    res.json(article);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.article.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const bulkDeleteArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'No article IDs provided' });
      return;
    }

    await prisma.article.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ message: `Successfully deleted ${ids.length} articles` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkUpdateArticlesStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'No article IDs provided' });
      return;
    }
    if (!['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const updateData: any = { status };
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    res.json({ message: `Successfully updated ${ids.length} articles to ${status}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Journal Categories ──────────────────────────────────────────────

export const listCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.journalCategory.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    const finalSlug = slug && slug.trim() ? slugify(slug) : slugify(name);

    const category = await prisma.journalCategory.create({
      data: { name: name.trim(), slug: finalSlug },
    });
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Category name or slug already exists' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, slug } = req.body;

    const data: any = {};
    if (name) data.name = name.trim();
    if (slug) data.slug = slugify(slug);
    else if (name) data.slug = slugify(name);

    const category = await prisma.journalCategory.update({
      where: { id },
      data,
    });
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Category name or slug already exists' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Disconnect articles first to avoid orphan or foreign key constraint error
    await prisma.article.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await prisma.journalCategory.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
