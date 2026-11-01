'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { JournalArticle } from '@/types/article';

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.62rem',
  fontWeight: 500,
  letterSpacing: '0.25em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark)',
};

const BG_PALETTE = ['#f0e8df', '#e8f0e8', '#e8e8f0', '#f0ece4', '#ece4f0', '#e4f0ec', '#f0e4e8'];

function articleBg(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash + slug.charCodeAt(i) * (i + 1)) % BG_PALETTE.length;
  return BG_PALETTE[hash];
}

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function estimateReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export default function JournalClient() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/articles?limit=50')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load articles');
        return res.json();
      })
      .then((data) => setArticles(data.articles || []))
      .catch((err) => setError(err.message || 'Failed to load articles'))
      .finally(() => setLoading(false));
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <div style={{
        background: 'linear-gradient(135deg, var(--bg-soft) 0%, #ede5da 100%)',
        paddingBlock: 'clamp(4rem,8vw,7rem)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="lumina-container">
          <div style={{ ...EB, marginBottom: '1rem' }}>Stories & Craft</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem,7vw,6rem)',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            marginBottom: '1.25rem',
          }}>
            The Journal
          </h1>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '1rem',
            color: 'var(--text-mid)',
            maxWidth: '520px',
            lineHeight: 1.85,
            fontWeight: 300,
          }}>
            Fragrance philosophy, ingredient deep-dives, layering guides,
            and the stories behind every AVORO creation.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="lumina-container" style={{ paddingBlock: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          Loading stories...
        </div>
      ) : error ? (
        <div className="lumina-container" style={{ paddingBlock: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          {error}
        </div>
      ) : articles.length === 0 ? (
        <div className="lumina-container" style={{ paddingBlock: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          New stories are on the way. Check back soon.
        </div>
      ) : (
        <>
          {featured && (
            <div className="lumina-container" style={{ paddingBlock: 'clamp(3.5rem,7vw,6rem)' }}>
              <div style={{ ...EB, marginBottom: '1.5rem' }}>Featured</div>
              <Link href={`/journal/${featured.slug}`} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                alignItems: 'center',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s, transform 0.3s',
                boxShadow: 'var(--shadow-sm)',
                textDecoration: 'none',
              }} className="avoro-featured-card">

                <div style={{
                  height: 'clamp(240px,35vw,420px)',
                  background: featured.featuredImage ? `url(${featured.featuredImage}) center/cover` : articleBg(featured.slug),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  {!featured.featuredImage && (
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', opacity: 0.2 }}>✦</span>
                  )}
                  <div style={{
                    position: 'absolute', top: '1.25rem', left: '1.25rem',
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                    borderRadius: '20px', padding: '0.3rem 0.85rem',
                  }}>
                    <span style={{ ...EB }}>{featured.category?.name || 'Journal'}</span>
                  </div>
                </div>

                <div style={{ padding: 'clamp(1.5rem,3vw,2.5rem)' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(featured.publishedAt || featured.createdAt)}
                    </span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {estimateReadTime(featured.body)}
                    </span>
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.5rem,2.5vw,2.2rem)',
                    fontWeight: 600, color: 'var(--text)',
                    lineHeight: 1.2, marginBottom: '1rem',
                  }}>
                    {featured.title}
                  </h2>
                  <p style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.9rem',
                    color: 'var(--text-mid)', lineHeight: 1.85,
                    fontWeight: 300, marginBottom: '1.75rem',
                  }}>
                    {featured.excerpt || featured.title}
                  </p>
                  <span style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 500,
                    color: 'var(--gold-dark)', letterSpacing: '0.1em',
                    borderBottom: '1px solid var(--gold-light)', paddingBottom: '2px',
                  }}>
                    Read Article →
                  </span>
                </div>
              </Link>
            </div>
          )}

          {rest.length > 0 && (
            <div className="lumina-container" style={{ paddingBottom: 'clamp(5rem,10vw,8rem)' }}>
              <div style={{ ...EB, marginBottom: '1.5rem' }}>All Stories</div>
              <div className="avoro-journal-grid">
                {rest.map((a) => (
                  <Link key={a.id} href={`/journal/${a.slug}`} style={{
                    display: 'block',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: '6px', overflow: 'hidden',
                    transition: 'box-shadow 0.3s, transform 0.3s',
                    boxShadow: 'var(--shadow-sm)',
                    textDecoration: 'none',
                  }} className="avoro-journal-card">

                    <div style={{
                      height: '180px',
                      background: a.featuredImage ? `url(${a.featuredImage}) center/cover` : articleBg(a.slug),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                    }}>
                      {!a.featuredImage && (
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', opacity: 0.18 }}>✦</span>
                      )}
                      <div style={{
                        position: 'absolute', top: '0.85rem', left: '0.85rem',
                        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
                        borderRadius: '20px', padding: '0.25rem 0.7rem',
                      }}>
                        <span style={{ ...EB }}>{a.category?.name || 'Journal'}</span>
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatDate(a.publishedAt || a.createdAt)}
                        </span>
                        <span style={{ color: 'var(--border)' }}>·</span>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {estimateReadTime(a.body)}
                        </span>
                      </div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1.05rem',
                        fontWeight: 600, color: 'var(--text)',
                        lineHeight: 1.3, marginBottom: '0.6rem',
                      }}>
                        {a.title}
                      </h3>
                      <p style={{
                        fontFamily: 'var(--font-ui)', fontSize: '0.82rem',
                        color: 'var(--text-soft)', lineHeight: 1.75, fontWeight: 300,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical' as const,
                        overflow: 'hidden',
                      }}>
                        {a.excerpt || a.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--border)', paddingBlock: 'clamp(3.5rem,7vw,5rem)' }}>
        <div className="lumina-container" style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ ...EB, marginBottom: '1rem' }}>Stay Informed</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem' }}>
            New stories, every month.
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--text-soft)', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 300 }}>
            Ingredient guides, perfumer interviews, and seasonal fragrance
            advice — delivered to your inbox.
          </p>
          {subscribed ? (
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--gold-dark)' }}>
              You are on the list. ✦
            </p>
          ) : (
            <form style={{ display: 'flex', maxWidth: '420px', margin: '0 auto', border: '1.5px solid var(--border)', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-card)' }}
              onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true); }}>
              <input type="email" required placeholder="Your email address"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, padding: '0.9rem 1.25rem', background: 'transparent', border: 'none', fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text)', outline: 'none' }} />
              <button type="submit" className="lumina-btn-gold" style={{ borderRadius: '0', flexShrink: 0, padding: '0.9rem 1.5rem', fontSize: '0.65rem' }}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .avoro-featured-card:hover { box-shadow: var(--shadow-lg) !important; transform: translateY(-3px); }
        .avoro-journal-card:hover  { box-shadow: var(--shadow-md) !important; transform: translateY(-4px); }
        @media (max-width: 768px) {
          .avoro-featured-card { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </div>
  );
}