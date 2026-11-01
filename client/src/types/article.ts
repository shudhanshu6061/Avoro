export interface JournalArticle {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  views: number;
  category: { name: string; slug: string } | null;
  author: { firstName: string; lastName: string };
  seo?: Record<string, any> | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeyword?: string | null;
  ogImage?: string | null;
}

export interface JournalListResponse {
  articles: JournalArticle[];
  total: number;
  page: number;
  pages: number;
}