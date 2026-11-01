import type { Product } from '@/types/product';
import type { JournalArticle, JournalListResponse } from '@/types/article';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
}

export const FALLBACK_PRODUCTS: Product[] = [
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

export async function getProducts(category?: string): Promise<Product[]> {
  const query = category && category !== 'all' ? `?category=${category}` : '';
  try {
    return await fetchJson<Product[]>(`/api/products${query}`);
  } catch (err) {
    console.warn('Failed to fetch products from API, returning fallback list:', err);
    if (category && category !== 'all') {
      const filtered = FALLBACK_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
      return filtered.length > 0 ? filtered : FALLBACK_PRODUCTS;
    }
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    return await fetchJson<Product>(`/api/products/${slug}`);
  } catch (err) {
    console.warn(`Failed to fetch product ${slug} from API, returning fallback:`, err);
    const fallback = FALLBACK_PRODUCTS.find(p => p.slug === slug) || FALLBACK_PRODUCTS[0];
    return fallback;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    return await fetchJson<Product[]>('/api/products/featured');
  } catch (err) {
    console.warn('Failed to fetch featured products from API, returning fallback list:', err);
    return FALLBACK_PRODUCTS.filter(p => p.isFeatured);
  }
}

/* ─── Reviews ──────────────────────────────────────────────── */

export interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  author: string;
  createdAt: string;
}

export interface ReviewStats {
  count: number;
  average: number;
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  return fetchJson<ReviewStats>(`/api/reviews/stats?productId=${productId}`);
}

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  return fetchJson<Review[]>(`/api/reviews?productId=${productId}`);
}

/* ─── Journal ──────────────────────────────────────────────── */

export async function getJournalArticles(page = 1, limit = 20): Promise<JournalListResponse> {
  return fetchJson<JournalListResponse>(`/api/articles?page=${page}&limit=${limit}`);
}

export async function getJournalArticleBySlug(slug: string): Promise<JournalArticle> {
  return fetchJson<JournalArticle>(`/api/articles/${slug}`);
}

export async function submitReview(payload: {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  guestName?: string;
  guestEmail?: string;
}): Promise<{ message: string; review: any }> {
  return fetchJson('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitContactForm(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ message: string }> {
  return fetchJson('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}


