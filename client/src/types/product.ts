export interface ProductVariant {
  id?: string;
  size: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
}

export function formatSizeLabel(s?: string): string {
  if (!s) return '';
  const trimmed = s.trim();
  if (/ml$/i.test(trimmed) || /oz$/i.test(trimmed)) return trimmed;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}ml`;
  return trimmed;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  notes: string[];
  images: string[];
  category: string;
  variants: ProductVariant[];
  isFeatured: boolean;
  isActive: boolean;
  pageContent?: Record<string, unknown> | null;
  seo?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type CategoryFilter = 'all' | 'floral' | 'woody' | 'fresh';

export type CosmosView =
  | 'home'
  | 'collection'
  | 'product'
  | 'discovery'
  | 'static'
  | 'checkout';
