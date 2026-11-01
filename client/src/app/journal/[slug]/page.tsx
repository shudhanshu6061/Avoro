import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJournalArticleBySlug } from '@/lib/api';

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.62rem',
  fontWeight: 500,
  letterSpacing: '0.25em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark)',
};

function estimateReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

import { parseKeywords } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await getJournalArticleBySlug(slug);
    const seoObj = typeof article.seo === 'object' && article.seo ? article.seo : {};
    const title = article.seoTitle || seoObj.seoTitle || seoObj.title || article.title;
    const description = article.seoDescription || seoObj.seoDescription || seoObj.description || article.excerpt || undefined;
    const rawKeywords = article.seoKeyword || seoObj.focusKeyword || seoObj.keyword || seoObj.keywords || undefined;
    const keywords = parseKeywords(rawKeywords);
    const ogImg = article.ogImage || seoObj.ogImage || article.featuredImage || undefined;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: ogImg ? [{ url: ogImg }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImg ? [ogImg] : undefined,
      },
    };
  } catch {
    return { title: 'Journal' };
  }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;

  let article;
  try {
    article = await getJournalArticleBySlug(slug);
  } catch {
    notFound();
  }

  const readTime = estimateReadTime(article.body);
  const date = formatDate(article.publishedAt || article.createdAt);
  const authorName = `${article.author.firstName} ${article.author.lastName}`.trim();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="lumina-container" style={{ paddingBlock: 'clamp(3rem,7vw,5rem)', maxWidth: '820px' }}>
        <Link href="/journal" style={{ ...EB, display: 'inline-block', marginBottom: '2rem', textDecoration: 'none' }}>
          ← Back to Journal
        </Link>

        <div style={{ ...EB, marginBottom: '1rem' }}>
          {article.category?.name || 'Journal'}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem,5vw,3.5rem)',
          fontWeight: 700,
          color: 'var(--text)',
          lineHeight: 1.1,
          marginBottom: '1.25rem',
        }}>
          {article.title}
        </h1>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem' }}>
          {date && <span>{date}</span>}
          {date && <span>·</span>}
          <span>{readTime}</span>
          {authorName && (
            <>
              <span>·</span>
              <span>{authorName}</span>
            </>
          )}
        </div>

        {article.featuredImage && (
          <img
            src={article.featuredImage}
            alt={article.title}
            style={{ width: '100%', borderRadius: '8px', marginBottom: '2.5rem', objectFit: 'cover', maxHeight: '420px' }}
          />
        )}

        <article
          className="avoro-article-body"
          style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-mid)', lineHeight: 1.9, fontSize: '1rem' }}
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .avoro-article-body h1 {
          font-family: inherit;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: var(--text);
          margin: 2.2rem 0 1rem;
          line-height: 1.25;
        }
        .avoro-article-body h2 {
          font-family: inherit;
          font-size: clamp(1.4rem, 3vw, 1.85rem);
          font-weight: 600;
          color: var(--text);
          margin: 2rem 0 1rem;
          line-height: 1.3;
        }
        .avoro-article-body h3 {
          font-family: inherit;
          font-size: clamp(1.15rem, 2.5vw, 1.4rem);
          font-weight: 600;
          color: var(--text);
          margin: 1.75rem 0 0.75rem;
          line-height: 1.4;
        }
        .avoro-article-body p { margin-bottom: 1.25rem; }
        .avoro-article-body ul {
          list-style-type: disc !important;
          padding-left: 1.75rem !important;
          margin: 1.25rem 0 !important;
        }
        .avoro-article-body ol {
          list-style-type: decimal !important;
          padding-left: 1.75rem !important;
          margin: 1.25rem 0 !important;
        }
        .avoro-article-body li {
          margin: 0.4rem 0 !important;
        }
        .avoro-article-body blockquote {
          border-left: 3px solid var(--gold);
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          color: var(--text-mid);
          font-style: italic;
        }
        .avoro-article-body a { color: var(--gold-dark); text-decoration: underline; }
        .avoro-article-body img { max-width: 100%; border-radius: 8px; margin: 1.5rem 0; }
      ` }} />
    </div>
  );
}