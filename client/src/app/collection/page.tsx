import type { Metadata } from 'next';
import CollectionClient from './CollectionClient';
import { getProducts } from '@/lib/api';
import type { Product } from '@/types/product';

import { getPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/collection', {
    title: 'AVORO Collection | Timeless Fragrances, Lasting Memories',
    description: "Explore AVORO's luxury fragrance collection, where every scent becomes part of your story.",
    keywords: ['luxury perfume collection', 'eau de parfum', 'perfume online', 'AVORO fragrances'],
    canonical: 'https://avoro.in/collection',
  });
}

export default async function CollectionPage() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch {
    products = [];
  }

  return <CollectionClient initialProducts={products} />;
}
