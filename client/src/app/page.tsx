import type { Metadata } from 'next';
import { getFeaturedProducts, getProducts } from '@/lib/api';
import type { Product } from '@/types/product';
import HomeClient from '@/components/home/HomeClient';
import PreLaunchLanding from '@/components/launch/PreLaunchLanding';

import { getPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const isLaunchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true';
  if (isLaunchMode) {
    return {
      title: 'AVORO | The Wait Is Almost Over | Haute Parfumerie',
      description: 'Artisanal fragrances crafted with rare essences. Reserve your VIP early access before the official launch.',
      keywords: ['AVORO', 'luxury perfume', 'pre-launch', 'early access', 'artisanal scent'],
    };
  }

  return getPageMetadata('/', {
    title: 'AVORO | Fragrances That Become Memories',
    description: 'Some moments fade. Some remain forever. Discover fragrances designed to stay with you.',
    keywords: ['AVORO', 'luxury perfume', 'fragrance', 'artisanal scent', 'rose gold'],
    canonical: 'https://avoro.in',
  });
}

export default async function HomePage() {
  const isLaunchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true';

  if (isLaunchMode) {
    return <PreLaunchLanding />;
  }

  let featured: Product[] = [];
  let products: Product[] = [];
  try {
    [featured, products] = await Promise.all([getFeaturedProducts(), getProducts()]);
  } catch {
    featured = [];
    products = [];
  }

  return <HomeClient featured={featured} products={products} />;
}

