import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://avoro.in';

export interface PageSeoMeta {
  id?: string;
  path?: string;
  pageName?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  schemaType?: string;
  updatedAt?: string;
}

export interface SeoFallbackOptions {
  title: string;
  description: string;
  keywords?: string | string[];
  canonical?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
}

/**
 * Parses focus keywords from a comma-separated string or array into a clean array of keyword strings.
 */
export function parseKeywords(rawKeywords?: string | string[] | null): string[] | undefined {
  if (!rawKeywords) return undefined;
  if (Array.isArray(rawKeywords)) {
    const cleaned = rawKeywords.map((k) => k.trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (typeof rawKeywords === 'string') {
    const cleaned = rawKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  return undefined;
}

function getInternalApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return new URL(cleanPath, base.endsWith('/') ? base : `${base}/`).toString();
}

/**
 * Fetches page-by-page SEO metadata from the backend API.
 */
export async function fetchPageSeo(path: string): Promise<PageSeoMeta | null> {
  try {
    const url = getInternalApiUrl(`api/seo/page-meta?path=${encodeURIComponent(path)}`);
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Generates dynamic Next.js Metadata for any managed page, incorporating SEO title,
 * meta description, focus keywords, open graph, twitter card, and robot index directives.
 */
export async function getPageMetadata(
  path: string,
  fallback: SeoFallbackOptions
): Promise<Metadata> {
  const seo = await fetchPageSeo(path);

  const title = seo?.seoTitle?.trim() || fallback.title;
  const description = seo?.seoDescription?.trim() || fallback.description;

  const dynamicKeywords = parseKeywords(seo?.focusKeyword);
  const fallbackKeywords = parseKeywords(fallback.keywords);
  const keywords = dynamicKeywords && dynamicKeywords.length > 0 ? dynamicKeywords : fallbackKeywords;

  const ogTitle = seo?.ogTitle?.trim() || seo?.seoTitle?.trim() || fallback.ogTitle || fallback.title;
  const ogDescription =
    seo?.ogDescription?.trim() || seo?.seoDescription?.trim() || fallback.ogDescription || fallback.description;
  const ogImage = seo?.ogImage?.trim() || fallback.ogImage;
  const canonical = seo?.canonical?.trim() || fallback.canonical || `${SITE_URL}${path === '/' ? '' : path}`;

  const isNoIndex = Boolean(seo?.noIndex);
  const isNoFollow = Boolean(seo?.noFollow);

  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: !isNoIndex,
      follow: !isNoFollow,
    },
    alternates: canonical ? { canonical } : undefined,
  };
}
