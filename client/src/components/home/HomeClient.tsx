'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';
import type { JournalArticle } from '@/types/article';
import { useCartStore } from '@/store/cartStore';
import { FALLBACK_PRODUCTS } from '@/lib/api';
import PriceTag from '@/components/ui/PriceTag';

import Perfume3DParallax from './Perfume3DParallax';
import PromoAdSection from './PromoAdSection';

interface Props { featured: Product[]; products: Product[]; }

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
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

function estimateReadTime(html?: string): string {
  if (!html) return '1 min read';
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

const FALLBACK_ARTICLES: Partial<JournalArticle>[] = [
  {
    id: 'fb-1',
    title: 'The Feeling Behind Every Fragrance',
    excerpt: 'Discover the inspiration and emotion behind the AVORO collection.',
    slug: 'the-feeling-behind-every-fragrance',
    category: { name: 'Craft', slug: 'craft' },
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    body: 'Discover the inspiration and emotion behind the AVORO collection.',
  },
  {
    id: 'fb-2',
    title: 'Why Certain Fragrances Stay in Memory',
    excerpt: 'How scent becomes connected to moments and people.',
    slug: 'why-certain-fragrances-stay-in-memory',
    category: { name: 'Lifestyle', slug: 'lifestyle' },
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    body: 'How scent becomes connected to moments and people.',
  },
  {
    id: 'fb-3',
    title: 'Everyday Luxury Starts with Small Rituals',
    excerpt: 'Simple moments that make everyday life feel timeless.',
    slug: 'everyday-luxury-starts-with-small-rituals',
    category: { name: 'Guide', slug: 'guide' },
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    body: 'Simple moments that make everyday life feel timeless.',
  },
];

/* ─── Product card (for API products) ──── */
function ProductCard({ p, index }: { p: Product; index: number }) {
  const { addItem } = useCartStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);
  const [hover, setHover] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const minVar = p.variants.length ? p.variants.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), p.variants[0]) : undefined;
  const price = minVar ? minVar.price : 0;
  const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const isOutOfStock = totalStock === 0;

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p.variants.length || isOutOfStock) return;
    const inStock = p.variants.find(v => (v.stock || 0) > 0) || p.variants[0];
    addItem({ productId: p.id, slug: p.slug, name: p.name, image: p.images?.[0] ?? '', size: inStock.size, price: inStock.price, originalPrice: inStock.originalPrice, sku: inStock.sku });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [p, addItem, isOutOfStock]);

  const sizeText = minVar?.size ? (minVar.size.toLowerCase().includes('ml') ? minVar.size : `${minVar.size}ml`) : '50ml';

  return (
    <div ref={cardRef}
      className="home-product-card"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid var(--border-soft)',
        transition: 'transform 0.4s ease, box-shadow 0.4s ease',
        transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hover ? '0 16px 40px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.03)',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
      }}>
      <Link href={`/product/${p.slug}`} style={{ display: 'block', height: '100%', textDecoration: 'none', color: 'inherit' }}>
        {/* Full-bleed Image Container (0 margin/padding, 100% fill) */}
        <div className="home-card-img" style={{
          position: 'relative', width: '100%', height: '320px',
          overflow: 'hidden', background: '#f8f8f8',
        }}>
          {p.images?.[0] ? (
            <Image
              src={p.images[0]}
              alt={p.name}
              fill
              sizes="(max-width: 768px) 100vw, 30vw"
              priority={index < 3}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                transition: 'transform 0.5s ease',
                transform: hover ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '2rem' }}>
              ◈
            </div>
          )}

          {/* Category Pill Badge (Top Left) */}
          <div style={{
            position: 'absolute', top: '0.85rem', left: '0.85rem', zIndex: 2,
            background: '#18181b', color: '#ffffff',
            padding: '0.25rem 0.65rem', borderRadius: '20px',
            fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600,
            letterSpacing: '0.03em', textTransform: 'capitalize',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {p.category || 'Women'}
          </div>

          {/* Out of Stock Badge (Top Right) */}
          {isOutOfStock && (
            <div style={{
              position: 'absolute', top: '0.85rem', right: '0.85rem', zIndex: 2,
              background: 'rgba(217, 68, 54, 0.95)', color: '#fff',
              padding: '0.25rem 0.65rem', borderRadius: '20px',
              fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Out of Stock
            </div>
          )}

          {/* ADD TO CART Button Overlay (Bottom of Image) */}
          <div style={{
            position: 'absolute', bottom: '0.85rem', left: '0.85rem', right: '0.85rem', zIndex: 3,
          }}>
            <button type="button" disabled={isOutOfStock} onClick={handleAdd}
              onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
              style={{
                width: '100%', padding: '0.65rem 0.5rem',
                background: isOutOfStock ? '#e5e7eb' : added ? '#16a34a' : btnHover ? '#d94436' : '#ffffff',
                color: isOutOfStock ? '#9ca3af' : added ? '#ffffff' : btnHover ? '#ffffff' : '#d94436',
                border: isOutOfStock ? '1px solid #d1d5db' : added ? '1.5px solid #16a34a' : '1.5px solid #d94436',
                fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                borderRadius: '10px', cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              }}>
              {isOutOfStock ? 'Out of Stock' : added ? '✓ Added' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info Section (Original AVORO design) */}
        <div style={{ padding: '1.25rem 1.25rem 1.5rem', background: '#fff' }}>
          <div style={{ ...EB, marginBottom: '0.4rem' }}>
            {p.category}
          </div>

          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1.2,
            marginBottom: '0.4rem',
          }}>
            {p.name}
          </h3>

          {p.notes.length > 0 && (
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.78rem',
              color: 'var(--text-soft)',
              marginBottom: '0.75rem',
              letterSpacing: '0.02em',
            }}>
              {p.notes.slice(0, 3).join(' · ')}
            </p>
          )}

          <div style={{ marginBottom: '0.35rem' }}>
            <PriceTag price={price} originalPrice={minVar?.originalPrice} size="sm" showDecimals={true} />
          </div>

          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.72rem',
            color: 'var(--text-soft)',
            letterSpacing: '0.04em',
          }}>
            {sizeText} EDP
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Main ──────────────────────────────────── */
export default function HomeClient({ featured, products }: Props) {
  const displayProducts = (featured && featured.length > 0)
    ? featured
    : (products && products.length > 0)
    ? products
    : FALLBACK_PRODUCTS;

  const [articles, setArticles] = useState<JournalArticle[]>([]);

  useEffect(() => {
    fetch('/api/articles?limit=3')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch articles');
        return res.json();
      })
      .then((data) => {
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ══ 1 · HERO ══════════════════════════════════════ */}
      <section className="avoro-hero-section" style={{
        minHeight: 'clamp(460px, 72vh, 680px)',
        position: 'relative',
        backgroundImage: "url('/images/hero-stone-bottles.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 'clamp(2rem, 4vw, 4rem)',
        paddingBottom: 'clamp(1.75rem, 3.5vw, 3rem)',
        overflow: 'hidden',
      }}>
        {/* Responsive overlay gradient ensuring high text legibility on all devices */}
        <div
          className="avoro-hero-overlay"
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(245,243,239,0.85) 0%, rgba(245,243,239,0.45) 50%, transparent 80%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <div className="lumina-container" style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>

          {/* ── HEADLINE TYPOGRAPHY ── */}
          <div className="fade-up avoro-hero-text-block" style={{ maxWidth: '540px', marginTop: 'clamp(0.5rem, 2vw, 2rem)' }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.78rem, 1.4vw, 1.1rem)',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#18181b',
              display: 'block',
              marginBottom: '0.35rem',
            }}>
              FRAGRANCES THAT
            </span>

            <h1 className="avoro-hero-title" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.1rem, 5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              color: '#09090b',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              MOVE WITH CERTAINTY
            </h1>
          </div>

          {/* ── ACTION BUTTONS CONTAINER (Mobile & Desktop Responsive) ── */}
          <div
            className="fade-up-2 avoro-hero-buttons-wrapper"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: 'auto',
              paddingTop: '1.5rem',
              zIndex: 5,
            }}
          >
            <Link
              href="/collection"
              className="lumina-btn-gold"
              style={{
                padding: '0.85rem 2.2rem',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(184,146,74,0.40)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              Explore Collection
            </Link>

            <Link
              href="/about"
              className="lumina-btn-ghost"
              style={{
                padding: '0.85rem 2rem',
                background: '#18181b',
                color: '#ffffff',
                border: '1.5px solid #27272a',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              Discover AVORO
            </Link>
          </div>

        </div>
      </section>



      {/* ══ 3 · ALSO AVAILABLE ═══════════════════════════ */}
      {displayProducts.length > 0 && (
        <section style={{
          paddingTop: 'clamp(1.25rem, 2.5vw, 2.25rem)',
          paddingBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
          background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%)',
          position: 'relative',
        }}>
          <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(184,146,74,0.12), transparent)' }} />
          <div className="lumina-container">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(1.25rem, 2.5vw, 2rem)' }}>
              <div style={{ ...EB, marginBottom: '0.5rem' }}>Shop Now</div>
              <h2 style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                fontWeight: 600,
                color: 'var(--text)',
                lineHeight: 1.1,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 0,
              }}>
                Our Fragrances
              </h2>
            </div>

            {/* Mobile swipe hint */}
            <div className="avoro-mobile-swipe-hint">
              <span>Swipe to explore</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>

            {/* Product grid */}
            <div className="avoro-home-product-grid">
              {displayProducts.slice(0, 4).map((p, i) => <ProductCard key={p.id || i} p={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ CUSTOMER REVIEWS ═══════════════════════════════ */}
      <section style={{ paddingTop: 'clamp(1.5rem, 3vw, 2.5rem)', paddingBottom: 'clamp(3.5rem, 7vw, 5rem)', background: 'var(--bg-soft)' }}>
        <div className="lumina-container">
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem,5vw,3.5rem)' }}>
            <div style={{ ...EB, fontSize: 'clamp(1.3rem, 2.8vw, 1.85rem)', marginBottom: '0.75rem' }}>From Our Community</div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '1rem', color: '#000', fontWeight: 400, maxWidth: '480px', marginInline: 'auto' }}>
              Real stories from those who have made AVORO part of their every day.
            </p>
          </div>

          <div className="avoro-home-product-grid" style={{ gap: '1.5rem' }}>
            {[
              {
                quote: "Velvet Oud is unlike anything I've worn. It lingers in the most elegant way — people always ask what I'm wearing.",
                name: "Aarav Menon",
                detail: "Verified Buyer · Delhi",
                product: "Velvet Oud",
                rating: 5,
              },
              {
                quote: "Vanilla Ember feels like a warm memory. It's soft, never overwhelming, and perfect for daily wear. My new signature scent.",
                name: "Meher Sharma",
                detail: "Verified Buyer · Bangalore",
                product: "Vanilla Ember",
                rating: 5,
              },
              {
                quote: "Blue Amber is fresh without being sharp. I wear it to work and it lasts beautifully through long days. Very refined.",
                name: "Kabir Rao",
                detail: "Verified Buyer · Hyderabad",
                product: "Blue Amber",
                rating: 5,
              },
              {
                quote: "The packaging, the scent, the whole experience feels truly luxurious. AVORO has become my go-to for gifting as well.",
                name: "Saanvi Patel",
                detail: "Verified Buyer · Mumbai",
                product: "Velvet Oud",
                rating: 5,
              },
            ].map((r, idx) => (
              <div key={idx} style={{
                background: '#fff',
                border: '1px solid var(--border-soft)',
                borderRadius: '14px',
                padding: '1.75rem 1.5rem 1.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--shadow-sm)'; }}>
                {/* Stars */}
                <div style={{ color: 'var(--gold-dark)', letterSpacing: '0.1em' }}>
                  {'★★★★★'.slice(0, r.rating)}
                </div>

                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  lineHeight: 1.75,
                  fontWeight: 400,
                  flex: 1,
                }}>
                  “{r.quote}”
                </p>

                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                    {r.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {r.detail}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--gold-dark)', marginTop: '0.35rem', letterSpacing: '0.05em' }}>
                    {r.product}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5 · JOURNAL ═══════════════════════════════════ */}
      <section style={{ paddingBlock: 'clamp(5rem,10vw,8rem)', background: 'var(--bg)' }}>
        <div className="lumina-container">
          <div className="avoro-journal-header">
            <div>
              <div style={{ ...EB, marginBottom: '0.75rem' }}>Stories & Inspiration</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                Journal
              </h2>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--text-soft)', marginTop: '0.65rem', fontWeight: 300 }}>
                Stories inspired by fragrance, emotion, and modern luxury.
              </p>
            </div>
            <Link href="/journal" className="lumina-btn-ghost" style={{ flexShrink: 0 }}>All Stories</Link>
          </div>
          <div className="avoro-journal-grid">
            {(articles.length > 0 ? articles : FALLBACK_ARTICLES).slice(0, 3).map((a, i) => {
              const catName = a.category?.name || 'Journal';
              const dateStr = formatDate(a.publishedAt || a.createdAt || null);
              const articleUrl = a.slug ? `/journal/${a.slug}` : '/journal';
              const bgStyle = a.featuredImage ? `url(${a.featuredImage}) center/cover` : articleBg(a.slug || `article-${i}`);
              const readTime = estimateReadTime(a.body || '');

              return (
                <Link key={a.id || i} href={articleUrl}
                  style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', transition: 'box-shadow 0.3s,transform 0.3s', boxShadow: 'var(--shadow-sm)', textDecoration: 'none' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-lg)'; el.style.transform = 'translateY(-5px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-sm)'; el.style.transform = ''; }}>
                  <div style={{ height: '190px', background: bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {!a.featuredImage && (
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', opacity: 0.2 }}>✦</span>
                    )}
                    <div style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '0.25rem 0.7rem' }}>
                      <span style={{ ...EB }}>{catName}</span>
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                      {dateStr && <span>{dateStr}</span>}
                      {dateStr && readTime && <span>·</span>}
                      {readTime && <span>{readTime}</span>}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: '0.5rem' }}>{a.title}</h3>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--text-soft)', lineHeight: 1.7, fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{a.excerpt || a.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
