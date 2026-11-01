import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductClient from '@/components/product/ProductClient';
import { getProductBySlug } from '@/lib/api';

import { parseKeywords } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    const seo = (product.seo || {}) as {
      seoTitle?: string;
      title?: string;
      seoDescription?: string;
      description?: string;
      focusKeyword?: string;
      keyword?: string;
      keywords?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      canonical?: string;
      noIndex?: boolean;
    };

    const title = seo.seoTitle?.trim() || seo.title?.trim() || product.name;
    const description = seo.seoDescription?.trim() || seo.description?.trim() || product.description;
    const rawKeywords = seo.focusKeyword || seo.keyword || seo.keywords || `${product.name}, luxury perfume, artisanal fragrance, AVORO`;
    const keywords = parseKeywords(rawKeywords);
    const ogTitle = seo.ogTitle?.trim() || title;
    const ogDescription = seo.ogDescription?.trim() || description;
    const ogImage = seo.ogImage?.trim() || (product.images && product.images[0]) || undefined;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      robots: seo.noIndex ? { index: false, follow: false } : undefined,
      alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    };
  } catch {
    return { title: 'Fragrance Not Found' };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }
  return <ProductClient product={product} />;
}
