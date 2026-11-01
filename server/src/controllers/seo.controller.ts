import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const SEO_KEY = 'seo_config';
const SITE_URL = process.env.SITE_URL || 'https://avoro.in';

export interface SeoRedirect {
  id: string;
  from: string;
  to: string;
  type: '301' | '302' | '410';
  date: string;
  hits: number;
}

export interface PageSeoConfig {
  id: string;
  path: string;
  pageName: string;
  seoTitle: string;
  seoDescription: string;
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

export interface SeoConfig {
  robots: string;
  sitemap: {
    autoGenerate: boolean;
    types: { label: string; include: boolean; freq: string; priority: string }[];
    lastRegen: string | null;
  };
  redirects: SeoRedirect[];
  cwv: {
    metrics: { label: string; value: string; unit: string }[];
    lastTested: string;
    notes: string;
  };
  gsc: { verificationCode: string };
  duplicate: { preferredDomain: 'www' | 'non-www'; forceHttps: boolean };
  pages: PageSeoConfig[];
}

export const defaultPageSeoConfigs = (): PageSeoConfig[] => [
  {
    id: 'page-home',
    path: '/',
    pageName: 'Home Page',
    seoTitle: 'AVORO — Luxury Perfumes & Artisanal Fragrances',
    seoDescription: 'Discover exquisite luxury perfumes and artisanal fragrances crafted with premium ingredients and memorable notes at AVORO.',
    focusKeyword: 'luxury perfumes india',
    canonical: `${SITE_URL}/`,
    ogTitle: 'AVORO — Luxury Perfumes & Artisanal Fragrances',
    ogDescription: 'Discover exquisite luxury perfumes and artisanal fragrances crafted with premium ingredients.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-collection',
    path: '/collection',
    pageName: 'Collections / Shop',
    seoTitle: 'Fragrance Collections — AVORO',
    seoDescription: 'Explore our exclusive collection of luxury perfumes, eau de parfums, signature scents, and gift sets.',
    focusKeyword: 'luxury perfume collection',
    canonical: `${SITE_URL}/collection`,
    ogTitle: 'Fragrance Collections — AVORO',
    ogDescription: 'Explore our exclusive collection of luxury perfumes and signature scents.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-journal',
    path: '/journal',
    pageName: 'Journal & Stories',
    seoTitle: 'The Journal — AVORO Fragrance Guides & Scent Stories',
    seoDescription: 'Read fragrance guides, perfume scent notes breakdown, and behind-the-scenes stories of luxury perfume creations.',
    focusKeyword: 'perfume guide scent notes',
    canonical: `${SITE_URL}/journal`,
    ogTitle: 'The Journal — AVORO Fragrance Guides & Stories',
    ogDescription: 'Read fragrance guides and stories behind our luxury perfume creations.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-about',
    path: '/about',
    pageName: 'About Us',
    seoTitle: 'About AVORO — Heritage & Perfumery Craftsmanship',
    seoDescription: 'Learn about AVORO\'s history, heritage, artisanal craft, and dedication to rare fragrance notes.',
    focusKeyword: 'avoro luxury perfumery about',
    canonical: `${SITE_URL}/about`,
    ogTitle: 'About AVORO — Heritage & Craftsmanship',
    ogDescription: 'Learn about AVORO\'s history and dedication to rare fragrance notes.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-contact',
    path: '/contact',
    pageName: 'Contact Us',
    seoTitle: 'Contact Us — AVORO Concierge & Support',
    seoDescription: 'Get in touch with the AVORO concierge team for order inquiries, fragrance recommendations, and support.',
    focusKeyword: 'avoro customer support contact',
    canonical: `${SITE_URL}/contact`,
    ogTitle: 'Contact Us — AVORO Concierge',
    ogDescription: 'Get in touch with the AVORO concierge team.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-faq',
    path: '/faq',
    pageName: 'FAQ Page',
    seoTitle: 'Frequently Asked Questions — AVORO',
    seoDescription: 'Find answers to common questions regarding shipping, returns, perfume application, longevity, and orders.',
    focusKeyword: 'avoro perfume faq shipping returns',
    canonical: `${SITE_URL}/faq`,
    ogTitle: 'Frequently Asked Questions — AVORO',
    ogDescription: 'Find answers to common questions regarding shipping, returns, and orders.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'FAQPage',
    updatedAt: new Date().toISOString(),
  },
];

export const defaultSeoConfig = (): SeoConfig => ({
  robots: `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`,
  sitemap: {
    autoGenerate: true,
    types: [
      { label: 'Products', include: true, freq: 'weekly', priority: '0.8' },
      { label: 'Collections', include: true, freq: 'weekly', priority: '0.7' },
      { label: 'Blog Posts', include: true, freq: 'daily', priority: '0.6' },
      { label: 'Static Pages', include: true, freq: 'monthly', priority: '0.5' },
    ],
    lastRegen: null,
  },
  redirects: [],
  cwv: {
    metrics: [
      { label: 'LCP', value: '', unit: 's' },
      { label: 'INP', value: '', unit: 'ms' },
      { label: 'CLS', value: '', unit: '' },
    ],
    lastTested: '',
    notes: '',
  },
  gsc: { verificationCode: '' },
  duplicate: { preferredDomain: 'non-www', forceHttps: true },
  pages: defaultPageSeoConfigs(),
});

async function loadSeoConfig(): Promise<SeoConfig> {
  const row = await prisma.storeSetting.findUnique({ where: { key: SEO_KEY } });
  const defaults = defaultSeoConfig();
  if (!row?.value) return defaults;
  try {
    const parsed = JSON.parse(row.value);
    const savedPages: PageSeoConfig[] = Array.isArray(parsed.pages) ? parsed.pages : [];
    const savedPaths = new Set(savedPages.map((p) => p.path));
    const mergedPages = [
      ...savedPages,
      ...defaults.pages.filter((dp) => !savedPaths.has(dp.path)),
    ];
    return { ...defaults, ...parsed, pages: mergedPages };
  } catch {
    return defaults;
  }
}

async function saveSeoConfig(config: SeoConfig): Promise<void> {
  await prisma.storeSetting.upsert({
    where: { key: SEO_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: SEO_KEY, value: JSON.stringify(config) },
  });
}

export async function generateSitemapXml(config: SeoConfig): Promise<string> {
  const urls: { loc: string; changefreq: string; priority: string }[] = [];
  const typeMap = Object.fromEntries(config.sitemap.types.map((t) => [t.label, t]));

  const staticPages = [
    { path: '/', label: 'Static Pages' },
    { path: '/collection', label: 'Collections' },
    { path: '/journal', label: 'Static Pages' },
    { path: '/about', label: 'Static Pages' },
    { path: '/contact', label: 'Static Pages' },
    { path: '/faq', label: 'Static Pages' },
  ];

  for (const page of staticPages) {
    const settings = typeMap[page.label];
    if (settings?.include) {
      urls.push({
        loc: `${SITE_URL}${page.path}`,
        changefreq: settings.freq,
        priority: settings.priority,
      });
    }
  }

  if (typeMap.Products?.include) {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    for (const product of products) {
      urls.push({
        loc: `${SITE_URL}/product/${product.slug}`,
        changefreq: typeMap.Products.freq,
        priority: typeMap.Products.priority,
      });
    }
  }

  if (typeMap['Blog Posts']?.include) {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    for (const article of articles) {
      urls.push({
        loc: `${SITE_URL}/journal/${article.slug}`,
        changefreq: typeMap['Blog Posts'].freq,
        priority: typeMap['Blog Posts'].priority,
      });
    }
  }

  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export const getAdminSeo = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await loadSeoConfig());
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load SEO config';
    res.status(500).json({ message });
  }
};

export const updateAdminSeo = async (req: Request, res: Response): Promise<void> => {
  try {
    const current = await loadSeoConfig();
    const next = { ...current, ...req.body.config };
    await saveSeoConfig(next);
    res.json(next);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save SEO config';
    res.status(500).json({ message });
  }
};

export const regenerateSitemap = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await loadSeoConfig();
    config.sitemap.lastRegen = new Date().toISOString();
    await saveSeoConfig(config);
    const xml = await generateSitemapXml(config);
    res.json({ lastRegen: config.sitemap.lastRegen, urlCount: (xml.match(/<url>/g) || []).length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to regenerate sitemap';
    res.status(500).json({ message });
  }
};

export const scanDuplicateContent = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [products, articles] = await Promise.all([
      prisma.product.findMany({ select: { slug: true, name: true, description: true, seo: true } }),
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, title: true, body: true, seoTitle: true, seoDescription: true, seo: true, excerpt: true },
      }),
    ]);

    const titles = new Map<string, string[]>();
    const descriptions = new Map<string, string[]>();
    const thinContent: string[] = [];

    const addDup = (map: Map<string, string[]>, value: string | null | undefined, path: string) => {
      if (!value?.trim()) return;
      const key = value.trim().toLowerCase();
      const list = map.get(key) || [];
      list.push(path);
      map.set(key, list);
    };

    for (const product of products) {
      const path = `/product/${product.slug}`;
      const seo = (product.seo || {}) as { title?: string; description?: string; seoTitle?: string; seoDescription?: string };
      addDup(titles, seo.seoTitle || seo.title || product.name, path);
      addDup(descriptions, seo.seoDescription || seo.description || product.description, path);
      const words = product.description.split(/\s+/).filter(Boolean).length;
      if (words < 300) thinContent.push(path);
    }

    for (const article of articles) {
      const path = `/journal/${article.slug}`;
      const seo = (article.seo || {}) as { title?: string; description?: string; seoTitle?: string; seoDescription?: string };
      addDup(titles, article.seoTitle || seo.seoTitle || seo.title || article.title, path);
      addDup(descriptions, article.seoDescription || seo.seoDescription || seo.description || article.excerpt || '', path);
      const text = article.body.replace(/<[^>]+>/g, ' ');
      const words = text.split(/\s+/).filter(Boolean).length;
      if (words < 300) thinContent.push(path);
    }

    const duplicateTitles = [...titles.entries()]
      .filter(([, paths]) => paths.length > 1)
      .map(([title, paths]) => ({ title, paths }));
    const duplicateDescriptions = [...descriptions.entries()]
      .filter(([, paths]) => paths.length > 1)
      .map(([description, paths]) => ({ description, paths }));

    res.json({
      duplicateTitles,
      duplicateDescriptions,
      thinContent: [...new Set(thinContent)],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scan failed';
    res.status(500).json({ message });
  }
};

export const getPublicRobots = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await loadSeoConfig();
    res.type('text/plain').send(config.robots);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load robots.txt';
    res.status(500).type('text/plain').send(message);
  }
};

export const getPublicSitemap = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await loadSeoConfig();
    const xml = await generateSitemapXml(config);
    res.type('application/xml').send(xml);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate sitemap';
    res.status(500).type('text/plain').send(message);
  }
};

export const getPublicRedirects = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await loadSeoConfig();
    res.json(config.redirects);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load redirects';
    res.status(500).json({ message });
  }
};

export const getPublicGsc = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await loadSeoConfig();
    res.json({ verificationCode: config.gsc.verificationCode || '' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load GSC config';
    res.status(500).json({ message });
  }
};

export const getPublicPagesSeo = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await loadSeoConfig();
    res.json(config.pages || []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load pages SEO';
    res.status(500).json({ message });
  }
};

export const getPublicPageSeoByPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await loadSeoConfig();
    const rawPath = ((req.query.path as string) || '/').trim();
    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    const normalized = cleanPath.length > 1 && cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;

    const pageSeo = (config.pages || []).find((p) => {
      const pNorm = p.path.length > 1 && p.path.endsWith('/') ? p.path.slice(0, -1) : p.path;
      return p.path === cleanPath || pNorm === normalized || pNorm.toLowerCase() === normalized.toLowerCase();
    });

    if (pageSeo) {
      res.json(pageSeo);
    } else {
      res.status(404).json({ message: 'Page SEO configuration not found' });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load page SEO';
    res.status(500).json({ message });
  }
};