import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getPageContentPreset, type ProductPageContent } from '../../lib/productPageContent';

function resolvePageContent(slug: string, pageContent: unknown): ProductPageContent | null {
  if (pageContent && typeof pageContent === 'object') {
    return pageContent as ProductPageContent;
  }
  return getPageContentPreset(slug);
}

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) { res.status(404).json({ message: 'Not found' }); return; }
    res.json({
      ...product,
      pageContent: resolvePageContent(product.slug, product.pageContent),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, notes, images, category, variants, isFeatured, isActive, seo, pageContent } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        notes: notes || [],
        images: images || [],
        category,
        variants: variants || [],
        isFeatured: isFeatured || false,
        isActive: isActive !== false,
        seo: seo || {},
        pageContent: pageContent || getPageContentPreset(slug) || undefined,
      },
    });
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'A product with this slug already exists' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const {
      name, slug, description, notes, images, category, variants,
      isFeatured, isActive, seo, pageContent,
    } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name, slug, description, notes, images, category, variants,
        isFeatured, isActive, seo, pageContent,
      },
    });
    res.json(product);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    // Delete related order items first to avoid foreign key constraint
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    if (error.code === 'P2003') {
      res.status(400).json({ message: 'Cannot delete: product is referenced by existing orders' });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
