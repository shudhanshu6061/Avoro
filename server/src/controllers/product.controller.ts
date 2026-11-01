import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const FALLBACK_PRODUCTS: any[] = [
  {
    id: 'prod_velvet_oud',
    name: 'Velvet Oud',
    slug: 'velvet-oud',
    description: 'A rich oud woody fragrance with warm amber and soft leather — designed for unforgettable evenings.',
    category: 'woody',
    images: ['/images/bottle-noir.png'],
    notes: ['Smoky Woods', 'Oud', 'Leather', 'Amber'],
    variants: [
      { id: 'v1', size: '50ml', price: 799, stock: 100, sku: 'VO-50' },
      { id: 'v2', size: '20ml', price: 399, stock: 50, sku: 'VO-20' },
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_vanilla_ember',
    name: 'Vanilla Ember',
    slug: 'vanilla-ember',
    description: 'Creamy vanilla blended with amber and musk — a comforting, luxurious fragrance you will want to wear every single day.',
    category: 'oriental',
    images: ['/images/bottle-ete.png'],
    notes: ['Vanilla', 'Tonka Bean', 'Amber', 'Soft Musk'],
    variants: [
      { id: 'v3', size: '50ml', price: 899, stock: 80, sku: 'VE-50' },
      { id: 'v4', size: '20ml', price: 449, stock: 30, sku: 'VE-20' },
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_blue_amber',
    name: 'Blue Amber',
    slug: 'blue-amber',
    description: 'Fresh aquatic notes balanced with smooth amber — an effortless, modern fragrance for every day and every season.',
    category: 'fresh',
    images: ['/images/bottle-sukoon.png'],
    notes: ['Bergamot', 'Marine Notes', 'White Musk', 'Amber'],
    variants: [
      { id: 'v5', size: '50ml', price: 849, stock: 90, sku: 'BA-50' },
      { id: 'v6', size: '20ml', price: 429, stock: 40, sku: 'BA-20' },
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    const where: any = { isActive: true };
    if (category && typeof category === 'string') {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (search && typeof search === 'string' && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { category: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error: unknown) {
    console.warn('Prisma query failed in getProducts, serving fallback products:', (error as Error)?.message);
    const { category } = req.query;
    if (category && typeof category === 'string' && category !== 'all') {
      const filtered = FALLBACK_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
      res.json(filtered.length > 0 ? filtered : FALLBACK_PRODUCTS);
    } else {
      res.json(FALLBACK_PRODUCTS);
    }
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const product = await prisma.product.findUnique({ where: { slug } });

    if (!product || !product.isActive) {
      const fallback = FALLBACK_PRODUCTS.find(p => p.slug === slug);
      if (fallback) {
        res.json(fallback);
        return;
      }
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error: unknown) {
    console.warn('Prisma query failed in getProductBySlug, serving fallback product:', (error as Error)?.message);
    const slug = req.params.slug as string;
    const fallback = FALLBACK_PRODUCTS.find(p => p.slug === slug) || FALLBACK_PRODUCTS[0];
    res.json(fallback);
  }
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    res.json(products);
  } catch (error: unknown) {
    console.warn('Prisma query failed in getFeaturedProducts, serving fallback products:', (error as Error)?.message);
    res.json(FALLBACK_PRODUCTS.filter(p => p.isFeatured));
  }
};

