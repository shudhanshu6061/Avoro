import type { MetadataRoute } from 'next';

export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    const base = process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const targetUrl = new URL('api/seo/robots.txt', base.endsWith('/') ? base : `${base}/`).toString();
    const res = await fetch(targetUrl, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error('robots fetch failed');
    const text = await res.text();

    const disallow: string[] = [];
    const allow: string[] = [];
    let sitemap: string | undefined;

    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith('disallow:')) {
        const path = trimmed.slice(9).trim();
        if (path) disallow.push(path);
      } else if (trimmed.toLowerCase().startsWith('allow:')) {
        const path = trimmed.slice(6).trim();
        if (path) allow.push(path);
      } else if (trimmed.toLowerCase().startsWith('sitemap:')) {
        sitemap = trimmed.slice(8).trim();
      }
    }

    return {
      rules: {
        userAgent: '*',
        allow: allow.length ? allow : ['/'],
        disallow: disallow.length ? disallow : undefined,
      },
      sitemap: sitemap || 'https://avoro.in/sitemap.xml',
    };
  } catch {
    return {
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://avoro.in/sitemap.xml',
    };
  }
}