'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import PriceTag from '@/components/ui/PriceTag';

type Filter = 'All' | 'Floral' | 'Woody' | 'Fresh' | 'Oriental' | 'Gourmand';
const SCENT_FAMILIES: Filter[] = ['All', 'Floral', 'Woody', 'Fresh', 'Oriental', 'Gourmand'];
const NOTES = ['Rose', 'Jasmine', 'Oud', 'Sandalwood', 'Bergamot', 'Vanilla', 'Musk'];

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark)',
};

const SIGNATURES = [
  {
    name: 'AVORO Velvet Oud',
    tagline: 'Deep. Smoky. Magnetic.',
    description: 'A rich oud woody fragrance with warm amber and soft leather designed for unforgettable evenings.',
    notes: ['Oud', 'Amber', 'Leather', 'Smoky Woods'],
    size: '50ml Eau De Parfum',
    cta: 'Discover Velvet Oud',
    slug: 'velvet-oud',
    image: '/images/bottle-noir.png',
    accent: '#3d2415',
    bg: 'linear-gradient(135deg,#1a1209 0%,#2a1c0e 100%)',
  },
  {
    name: 'AVORO Vanilla Ember',
    tagline: 'Warm. Soft. Addictive.',
    description: 'Creamy vanilla blended with amber and musk for a comforting and luxurious everyday fragrance.',
    notes: ['Vanilla', 'Tonka Bean', 'Amber', 'Soft Musk'],
    size: '50ml Eau De Parfum',
    cta: 'Discover Vanilla Ember',
    slug: 'vanilla-ember',
    image: '/images/bottle-ete.png',
    accent: '#7a4a1a',
    bg: 'linear-gradient(135deg,#2a1c0e 0%,#1a1209 100%)',
  },
  {
    name: 'AVORO Blue Amber',
    tagline: 'Fresh. Clean. Refined.',
    description: 'Fresh aquatic notes balanced with smooth amber for an effortless and modern fragrance experience.',
    notes: ['Bergamot', 'Marine Notes', 'White Musk', 'Amber'],
    size: '50ml Eau De Parfum',
    cta: 'Discover Blue Amber',
    slug: 'blue-amber',
    image: '/images/bottle-sukoon.png',
    accent: '#1a3d5a',
    bg: 'linear-gradient(135deg,#0f1a2e 0%,#1a2a3d 100%)',
  },
];

interface Props { initialProducts: Product[]; }

/* ─── Modern Product Card ────────────────────────── */
function ProductCard({ p, index }: { p: Product; index: number }) {
  const { addItem } = useCartStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [added, setAdded] = useState(false);
  const minVar = p.variants.length
    ? p.variants.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), p.variants[0])
    : undefined;
  const price = minVar ? minVar.price : 0;
  const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const isOutOfStock = totalStock === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p.variants.length || isOutOfStock) return;
    const inStock = p.variants.find(v => (v.stock || 0) > 0) || p.variants[0];
    addItem({ productId: p.id, slug: p.slug, name: p.name, image: p.images?.[0] ?? '', size: inStock.size, price: inStock.price, originalPrice: inStock.originalPrice, sku: inStock.sku });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const sizeText = minVar?.size ? (minVar.size.toLowerCase().includes('ml') ? minVar.size : `${minVar.size}ml`) : '50ml';

  return (
    <div ref={cardRef} className="col-product-card home-product-card" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#fff',
        border: '1px solid var(--border-soft)',
        transition: 'transform 0.4s ease, box-shadow 0.4s ease',
        transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hover ? '0 16px 40px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.03)',
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
      }}>
      <Link href={`/product/${p.slug}`} style={{ display: 'block', height: '100%', textDecoration: 'none', color: 'inherit' }}>
        {/* Full-bleed Image Container (0 margin/padding) */}
        <div className="col-card-img home-card-img" style={{
          position: 'relative', width: '100%', height: '320px', overflow: 'hidden', background: '#f8f8f8',
        }}>
          {p.images?.[0] ? (
            <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 768px) 100vw, 30vw" priority={index < 4}
              style={{ objectFit: 'cover', width: '100%', height: '100%', transition: 'transform 0.5s ease', transform: hover ? 'scale(1.05)' : 'scale(1)' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '2rem' }}>
              ◈
            </div>
          )}

          {/* Category Pill Tag (Top Left) */}
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

          {/* Out of stock badge (Top Right) */}
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

        {/* Content (Original AVORO design) */}
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

/* ─── Signature Card ─────────────────────────────── */
function SignatureCard({ frag }: { frag: typeof SIGNATURES[0] }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: frag.bg, borderRadius: '12px', overflow: 'hidden',
        transition: 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.4s',
        transform: hover ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hover ? '0 20px 60px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
      {/* Image area */}
      <div style={{ height: '280px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 60%, rgba(184,146,74,0.15) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', width: '60%', height: '85%' }}>
          <Image src={frag.image} alt={frag.name} fill sizes="25vw" style={{ objectFit: 'contain', transition: 'transform 0.5s', transform: hover ? 'scale(1.08)' : 'scale(1)' }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'rgba(184,146,74,0.8)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          {frag.tagline}
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: '#f5ede2', lineHeight: 1.2, marginBottom: '0.85rem' }}>
          {frag.name}
        </h3>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'rgba(245,237,226,0.55)', lineHeight: 1.8, fontWeight: 300, marginBottom: '1.25rem', flex: 1 }}>
          {frag.description}
        </p>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'rgba(245,237,226,0.4)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
          {frag.notes.join(' • ')}
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'rgba(245,237,226,0.35)', marginBottom: '1.5rem' }}>
          {frag.size}
        </div>
        <Link href={`/product/${frag.slug}`} style={{
          display: 'block', textAlign: 'center', padding: '0.85rem 1.5rem',
          background: 'rgba(184,146,74,0.15)', border: '1px solid rgba(184,146,74,0.3)',
          borderRadius: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.65rem',
          fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--gold-dark)', transition: 'all 0.3s',
        }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'var(--gold-dark)'; el.style.color = '#0a0a0a'; }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(184,146,74,0.15)'; el.style.color = 'var(--gold-dark)'; }}>
          {frag.cta}
        </Link>
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────── */
export default function CollectionClient({ initialProducts }: Props) {
  const [scentFilter,  setScentFilter]  = useState<Filter>('All');
  const [sort,         setSort]         = useState<'default'|'price-asc'|'price-desc'>('default');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [priceMax,     setPriceMax]     = useState(50000);

  const filtered = useMemo(() => {
    let list = scentFilter === 'All'
      ? initialProducts
      : initialProducts.filter(p => p.category.toLowerCase() === scentFilter.toLowerCase());
    list = list.filter(p => Math.min(...(p.variants.length ? p.variants.map(v=>v.price) : [0])) <= priceMax);
    if (sort === 'price-asc')  list = [...list].sort((a,b) => Math.min(...a.variants.map(v=>v.price)) - Math.min(...b.variants.map(v=>v.price)));
    if (sort === 'price-desc') list = [...list].sort((a,b) => Math.min(...b.variants.map(v=>v.price)) - Math.min(...a.variants.map(v=>v.price)));
    return list;
  }, [initialProducts, scentFilter, sort, priceMax]);

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>

      

      {/* ══ ALL PRODUCTS ═══════════════════════════════════ */}
      {initialProducts.length > 0 && (
        <section style={{ paddingBlock: 'clamp(4rem, 8vw, 6rem)', background: 'var(--bg)', position: 'relative' }}>
          <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(184,146,74,0.15), transparent)' }} />
          <div className="lumina-container">

            {/* Header + modern filter bar */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ ...EB, marginBottom: '0.85rem' }}>Shop the Collection</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
                Choose Your Signature
              </h1>
              {/* Glassy filter bar */}
              <div className="avoro-filter-bar" style={{
                maxWidth: '980px', margin: '0 auto',
                padding: '1rem', borderRadius: '16px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.55))',
                border: '1px solid var(--border-soft)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                backdropFilter: 'blur(8px) saturate(120%)',
                WebkitBackdropFilter: 'blur(8px) saturate(120%)',
              }}>
                {/* Filter chips */}
                <div className="avoro-filter-chips" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.9rem' }}>
                  {SCENT_FAMILIES.map(f => {
                    const active = scentFilter === f;
                    return (
                      <button key={f} type="button" onClick={() => setScentFilter(f)}
                        style={{
                          padding: '0.6rem 1.1rem', borderRadius: '999px',
                          border: `1.25px solid ${active ? 'rgba(184,146,74,0.55)' : 'rgba(0,0,0,0.08)'}`,
                          background: active
                            ? 'linear-gradient(180deg, rgba(212,175,136,0.22), rgba(212,175,136,0.12))'
                            : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.75))',
                          color: active ? 'var(--gold-dark)' : 'var(--text-mid)',
                          fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                          letterSpacing: '0.04em', cursor: 'pointer',
                          boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 16px rgba(212,175,136,0.18)' : 'inset 0 1px 0 rgba(255,255,255,0.6)',
                          transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        }}
                      >{f}</button>
                    );
                  })}
                </div>
                {/* Sort */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                    {filtered.length} {filtered.length === 1 ? 'fragrance' : 'fragrances'}
                  </span>
                  <div style={{ position: 'relative' }}>
                    <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
                      style={{
                        appearance: 'none' as any,
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        background: 'linear-gradient(180deg, #ffffff, #f7f3ec)',
                        border: '1px solid var(--border-soft)',
                        color: 'var(--text-mid)',
                        fontFamily: 'var(--font-ui)', fontSize: '0.82rem',
                        padding: '0.6rem 2.2rem 0.6rem 0.9rem',
                        borderRadius: '999px', cursor: 'pointer',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 16px rgba(0,0,0,0.06)'
                      }}>
                      <option value="default">Featured</option>
                      <option value="price-asc">Price: Low → High</option>
                      <option value="price-desc">Price: High → Low</option>
                    </select>
                    <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-soft)', fontSize: '0.9rem' }}>▾</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontStyle: 'italic', color: 'var(--text-soft)', marginBottom: '1.25rem' }}>No fragrances found</p>
                <button type="button" onClick={() => { setScentFilter('All'); setPriceMax(50000); }} style={{ padding: '0.75rem 2rem', background: 'var(--gold-pale)', border: '1px solid rgba(184,146,74,0.25)', borderRadius: '4px', color: 'var(--gold-dark)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>Clear Filters</button>
              </div>
            ) : (
              <div className="col-modern-grid">
                {filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══ INTRO ══════════════════════════════════════════ */}
      <section style={{ paddingBlock: 'clamp(4rem, 8vw, 6rem)', background: 'var(--bg)' }}>
        <div className="lumina-container" style={{ maxWidth: '800px', marginInline: 'auto', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '2px', background: 'var(--gold-dark)', margin: '0 auto 2rem' }} />
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '1.05rem', color: 'var(--text-mid)',
            lineHeight: 2, fontWeight: 400,
          }}>
            Fragrance is never just one thing. It shifts with your mood, changes with the season, and means something different depending on the moment you are in. That is why the AVORO Collection was never designed to be a single scent for everyone — it was designed to be the right scent for every version of you. From the deep warmth of oud and amber to the soft comfort of vanilla and musk, and the clean confidence of fresh aquatic notes, every AVORO fragrance carries its own character. Each one is personal. Each one is timeless. And each one is crafted to leave behind something unforgettable.
          </p>
        </div>
      </section>

      {/* ══ DISCOVERY SECTION ══════════════════════════════ */}
      <section style={{
        paddingBlock: 'clamp(5rem, 10vw, 7rem)',
        background: 'linear-gradient(135deg, #f8f6f2 0%, #ede5da 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{ position: 'absolute', top: '20%', right: '10%', width: '200px', height: '200px', border: '1px solid rgba(184,146,74,0.08)', borderRadius: '50%' }} />
        <div className="lumina-container" style={{ textAlign: 'center', maxWidth: '700px', marginInline: 'auto', position: 'relative' }}>
          <div style={{ ...EB, marginBottom: '1.25rem' }}>Discovery</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.02em',
            marginBottom: '1.25rem',
          }}>
            Discover Every Mood
          </h2>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.95rem', color: 'var(--text-mid)',
            lineHeight: 2, fontWeight: 300, marginBottom: '1.5rem',
          }}>
            Explore all three fragrances through the AVORO Discovery Collection.
          </p>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-soft)',
            letterSpacing: '0.1em', marginBottom: '2.5rem',
          }}>
            Includes: Velvet Oud • Vanilla Ember • Blue Amber
          </p>
          <Link href="/collection" className="lumina-btn-gold" style={{ fontSize: '0.65rem' }}>
            Explore Discovery Set
          </Link>
        </div>
      </section>


      <style dangerouslySetInnerHTML={{ __html: `
        .col-fade-in { animation: colFade 1s cubic-bezier(0.2,0.8,0.2,1) both; }
        @keyframes colFade { from { opacity:0; transform:translateY(25px); } to { opacity:1; transform:translateY(0); } }
        .col-modern-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        @media (max-width: 1024px) {
          .col-modern-grid { grid-template-columns: repeat(2, 1fr); }
        }
      ` }} />
    </div>
  );
}
