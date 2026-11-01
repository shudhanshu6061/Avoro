import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://avoro.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const base = process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const targetUrl = new URL('api/seo/sitemap.xml', base.endsWith('/') ? base : `${base}/`).toString();
    const res = await fetch(targetUrl, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('sitemap fetch failed');
    const xml = await res.text();

    const entries: MetadataRoute.Sitemap = [];
    const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];

    for (const block of urlBlocks) {
      const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
      if (!loc) continue;
      const changefreq = block.match(/<changefreq>(.*?)<\/changefreq>/)?.[1] as MetadataRoute.Sitemap[number]['changeFrequency'];
      const priority = parseFloat(block.match(/<priority>(.*?)<\/priority>/)?.[1] || '0.5');
      entries.push({
        url: loc,
        changeFrequency: changefreq || 'weekly',
        priority,
      });
    }

    if (entries.length) return entries;
  } catch {
    // fall through to defaults
  }

  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/collection`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/journal`, changeFrequency: 'daily', priority: 0.7 },
  ];
}