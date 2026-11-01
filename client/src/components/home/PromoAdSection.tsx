'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';

const MARQUEE_ITEMS = [
  'Authentic EDP concentration',
  '7-day easy returns',
  'Crafted in India',
  'Gift-ready packaging',
  'Long-lasting wear',
];

function displayName(name: string) {
  return name.replace(/^AVORO\s*/i, '').trim();
}

interface Props {
  products: Product[];
  featured?: Product[];
}

export default function PromoAdSection({ products, featured = [] }: Props) {
  const { addItem } = useCartStore();
  const [hoverCta, setHoverCta] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [addedHero, setAddedHero] = useState(false);

  if (!products.length) return null;

  const featuredInCatalog = featured.filter((p) => products.some((c) => c.id === p.id));
  const defaultHero = featuredInCatalog[0] ?? products[0];
  const heroProduct = products.find((p) => p.slug === activeSlug) ?? defaultHero;
  const heroImage = heroProduct.images?.[0];

  const handleAddHero = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!heroProduct || !heroProduct.variants.length) return;
    const inStock = heroProduct.variants.find(v => (v.stock || 0) > 0) || heroProduct.variants[0];
    addItem({
      productId: heroProduct.id,
      slug: heroProduct.slug,
      name: heroProduct.name,
      image: heroProduct.images?.[0] ?? '',
      size: inStock.size,
      price: inStock.price,
      originalPrice: inStock.originalPrice,
      sku: inStock.sku
    });
    setAddedHero(true);
    setTimeout(() => setAddedHero(false), 2000);
  };

  const prices = products.flatMap((p) => p.variants.map((v) => v.price));
  const fromPrice = prices.length ? Math.min(...prices) : null;

  const marqueeItems = [
    ...products.map((p) => displayName(p.name).toUpperCase()),
    ...MARQUEE_ITEMS,
  ];

  const scentCount = products.length;
  const scentLabel = scentCount === 1 ? 'Signature scent' : 'Signature scents';

  return (
    <section className="avoro-promo-ad">
      <div className="lumina-container">
        <div className="avoro-promo-ad__frame">
          <span aria-hidden className="avoro-promo-ad__corner avoro-promo-ad__corner--tl" />
          <span aria-hidden className="avoro-promo-ad__corner avoro-promo-ad__corner--tr" />
          <span aria-hidden className="avoro-promo-ad__corner avoro-promo-ad__corner--bl" />
          <span aria-hidden className="avoro-promo-ad__corner avoro-promo-ad__corner--br" />

          <div className="avoro-promo-ad__panel">
            <div aria-hidden className="avoro-promo-ad__glow" />
            <div aria-hidden className="avoro-promo-ad__grid" />
            <div aria-hidden className="avoro-promo-ad__grain" />

            <div className="avoro-promo-ad__inner">
              <div className="avoro-promo-ad__copy">
                <div className="avoro-promo-ad__pill">
                  <span className="avoro-promo-ad__pill-dot" />
                  Limited introduction · Signature line
                </div>

                <p className="avoro-promo-ad__eyebrow">The Art of Wearing Identity</p>

                <h2 className="avoro-promo-ad__headline">
                  Find the scent
                  <em>that defines you.</em>
                </h2>

                <p className="avoro-promo-ad__sub">
                  Artisanal Eau de Parfum with rich projection and hours of lasting wear —
                  luxury you can feel from the first spray.
                </p>

                {fromPrice !== null && (
                  <div className="avoro-promo-ad__offer">
                    <span className="avoro-promo-ad__offer-label">Starting at</span>
                    <span className="avoro-promo-ad__offer-price">₹{fromPrice.toLocaleString('en-IN')}</span>
                    <span className="avoro-promo-ad__offer-note">50ml EDP</span>
                  </div>
                )}

                <div className="avoro-promo-ad__stats">
                  {[
                    { value: '8–10h', label: 'Longevity' },
                    { value: 'EDP', label: 'Concentration' },
                    { value: String(scentCount), label: scentLabel },
                  ].map((s) => (
                    <div key={s.label} className="avoro-promo-ad__stat">
                      <div className="avoro-promo-ad__stat-value">{s.value}</div>
                      <div className="avoro-promo-ad__stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {products.length > 0 && (
                  <div className="avoro-promo-ad__chips">
                    {products.map((p) => {
                      const isActive = p.slug === heroProduct.slug;
                      return (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          className={`avoro-promo-ad__chip${isActive ? ' is-active' : ''}`}
                          onMouseEnter={() => setActiveSlug(p.slug)}
                          onFocus={() => setActiveSlug(p.slug)}
                          onMouseLeave={() => setActiveSlug(null)}
                          onBlur={() => setActiveSlug(null)}
                        >
                          {displayName(p.name)}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div className="avoro-promo-ad__actions">
                  <button
                    type="button"
                    onClick={handleAddHero}
                    className="avoro-promo-ad__cta-primary"
                    style={{
                      cursor: 'pointer',
                      background: addedHero ? '#2d7a4f' : undefined,
                      borderColor: addedHero ? '#2d7a4f' : undefined,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {addedHero ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>
                  <Link href={`/product/${heroProduct.slug}`} className="avoro-promo-ad__cta-secondary">
                    Explore {displayName(heroProduct.name)}
                  </Link>
                </div>
              </div>

              <div className="avoro-promo-ad__visual">
                <div className="avoro-promo-ad__stage">
                  <div aria-hidden className="avoro-promo-ad__spotlight" />
                  <div aria-hidden className="avoro-promo-ad__arch" />
                  <div aria-hidden className="avoro-promo-ad__ring avoro-promo-ad__ring--1" />
                  <div aria-hidden className="avoro-promo-ad__ring avoro-promo-ad__ring--2" />

                  <Link href={`/product/${heroProduct.slug}`} className="avoro-promo-ad__bottle">
                    {heroImage ? (
                      <Image
                        src={heroImage}
                        alt={heroProduct.name}
                        fill
                        sizes="(max-width: 900px) 75vw, 420px"
                        style={{ objectFit: 'contain' }}
                        priority
                      />
                    ) : (
                      <div className="avoro-promo-ad__bottle-placeholder" aria-hidden />
                    )}
                  </Link>

                  <div className="avoro-promo-ad__badge">
                    <span className="avoro-promo-ad__badge-star">✦</span>
                    <div>
                      <div className="avoro-promo-ad__badge-title">Bestseller</div>
                      <div className="avoro-promo-ad__badge-sub">{displayName(heroProduct.name)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="avoro-promo-ad__marquee-wrap">
              <div className="avoro-promo-ad__marquee">
                {[...marqueeItems, ...marqueeItems].map((item, i) => (
                  <span key={`${item}-${i}`} className="avoro-promo-ad__marquee-item">
                    <span className="avoro-promo-ad__marquee-dot">✦</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .avoro-promo-ad {
          padding-block: clamp(4rem, 9vw, 7rem);
          background: linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);
        }

        .avoro-promo-ad__frame {
          position: relative;
          padding: clamp(0.35rem, 1vw, 0.65rem);
        }

        .avoro-promo-ad__corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: rgba(184, 146, 74, 0.45);
          border-style: solid;
          pointer-events: none;
          z-index: 2;
        }
        .avoro-promo-ad__corner--tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
        .avoro-promo-ad__corner--tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
        .avoro-promo-ad__corner--bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
        .avoro-promo-ad__corner--br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

        .avoro-promo-ad__panel {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          background:
            radial-gradient(ellipse 80% 60% at 85% 35%, rgba(201, 169, 110, 0.14) 0%, transparent 55%),
            linear-gradient(145deg, #080808 0%, #16100a 42%, #0c0c0c 100%);
          border: 1px solid rgba(201, 169, 110, 0.22);
          box-shadow:
            0 32px 100px rgba(0, 0, 0, 0.22),
            0 8px 32px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .avoro-promo-ad__glow {
          position: absolute;
          top: -25%;
          right: -8%;
          width: 58%;
          height: 85%;
          background: radial-gradient(ellipse, rgba(201, 169, 110, 0.28) 0%, transparent 68%);
          pointer-events: none;
        }

        .avoro-promo-ad__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201, 169, 110, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 110, 0.035) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 85%);
          pointer-events: none;
        }

        .avoro-promo-ad__grain {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .avoro-promo-ad__inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(1.5rem, 3vw, 2.5rem);
          align-items: center;
          padding: clamp(2.25rem, 5vw, 4rem) clamp(2rem, 4.5vw, 4rem) 1.75rem;
        }

        .avoro-promo-ad__pill {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.5rem 1.1rem 0.5rem 0.8rem;
          border-radius: 999px;
          border: 1px solid rgba(201, 169, 110, 0.32);
          background: rgba(201, 169, 110, 0.07);
          font-family: var(--font-ui);
          font-size: 0.64rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(245, 237, 226, 0.72);
          margin-bottom: 1.35rem;
        }

        .avoro-promo-ad__pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 14px rgba(201, 169, 110, 0.9);
          animation: promoPulse 2.2s ease-in-out infinite;
        }

        .avoro-promo-ad__eyebrow {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(201, 169, 110, 0.88);
          margin-bottom: 1.1rem;
        }

        .avoro-promo-ad__headline {
          font-family: var(--font-display);
          font-size: clamp(2.6rem, 5.8vw, 4.5rem);
          font-weight: 700;
          line-height: 1.04;
          letter-spacing: -0.03em;
          color: #f5ede2;
          margin-bottom: 1.35rem;
        }

        .avoro-promo-ad__headline em {
          display: block;
          font-style: italic;
          font-weight: 500;
          color: var(--gold);
          margin-top: 0.1em;
        }

        .avoro-promo-ad__sub {
          font-family: var(--font-ui);
          font-size: clamp(0.9rem, 1.5vw, 1.02rem);
          line-height: 1.9;
          color: rgba(245, 237, 226, 0.55);
          font-weight: 300;
          max-width: 36rem;
          margin-bottom: 1.85rem;
        }

        .avoro-promo-ad__offer {
          display: inline-flex;
          align-items: baseline;
          gap: 0.7rem;
          flex-wrap: wrap;
          padding: 0.9rem 1.25rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(201, 169, 110, 0.18);
          margin-bottom: 1.85rem;
        }

        .avoro-promo-ad__offer-label {
          font-family: var(--font-ui);
          font-size: 0.68rem;
          color: rgba(245, 237, 226, 0.42);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .avoro-promo-ad__offer-price {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 3vw, 1.9rem);
          font-weight: 700;
          color: var(--gold);
        }

        .avoro-promo-ad__offer-note {
          font-family: var(--font-ui);
          font-size: 0.72rem;
          color: rgba(245, 237, 226, 0.38);
          letter-spacing: 0.06em;
        }

        .avoro-promo-ad__stats {
          display: flex;
          gap: clamp(1.25rem, 3vw, 2.25rem);
          flex-wrap: wrap;
          margin-bottom: 1.35rem;
        }

        .avoro-promo-ad__stat-value {
          font-family: var(--font-display);
          font-size: clamp(1.2rem, 2.2vw, 1.45rem);
          font-weight: 600;
          color: #f5ede2;
        }

        .avoro-promo-ad__stat-label {
          font-family: var(--font-ui);
          font-size: 0.64rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(245, 237, 226, 0.36);
          margin-top: 0.25rem;
        }

        .avoro-promo-ad__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin-bottom: 2rem;
        }

        .avoro-promo-ad__chip {
          display: inline-flex;
          align-items: center;
          padding: 0.45rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(201, 169, 110, 0.24);
          background: rgba(255, 255, 255, 0.025);
          color: rgba(245, 237, 226, 0.62);
          font-family: var(--font-ui);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.3s, border-color 0.3s, color 0.3s, box-shadow 0.3s;
        }

        .avoro-promo-ad__chip.is-active,
        .avoro-promo-ad__chip:hover {
          background: rgba(201, 169, 110, 0.14);
          border-color: rgba(201, 169, 110, 0.5);
          color: #f5ede2;
          box-shadow: 0 0 20px rgba(201, 169, 110, 0.15);
        }

        .avoro-promo-ad__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
        }

        .avoro-promo-ad__cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 1rem 1.85rem;
          border-radius: 10px;
          background: linear-gradient(135deg, #a8843f 0%, #d4b070 50%, #c9a96e 100%);
          color: #0a0a0a;
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 10px 32px rgba(201, 169, 110, 0.38);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .avoro-promo-ad__cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(201, 169, 110, 0.48);
        }

        .avoro-promo-ad__cta-secondary {
          display: inline-flex;
          align-items: center;
          padding: 1rem 1.6rem;
          border-radius: 10px;
          border: 1px solid rgba(201, 169, 110, 0.38);
          color: rgba(245, 237, 226, 0.88);
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.3s, border-color 0.3s;
        }

        .avoro-promo-ad__cta-secondary:hover {
          background: rgba(201, 169, 110, 0.1);
          border-color: rgba(201, 169, 110, 0.58);
        }

        .avoro-promo-ad__visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 420px;
        }

        .avoro-promo-ad__stage {
          position: relative;
          width: 100%;
          max-width: 420px;
          aspect-ratio: 4 / 5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avoro-promo-ad__spotlight {
          position: absolute;
          inset: 8% 5%;
          border-radius: 50%;
          background: radial-gradient(ellipse at 50% 40%, rgba(201, 169, 110, 0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        .avoro-promo-ad__arch {
          position: absolute;
          bottom: 6%;
          left: 50%;
          transform: translateX(-50%);
          width: 78%;
          height: 72%;
          border: 1px solid rgba(201, 169, 110, 0.14);
          border-bottom: none;
          border-radius: 50% 50% 0 0 / 42% 42% 0 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 40%);
          pointer-events: none;
        }

        .avoro-promo-ad__ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(201, 169, 110, 0.1);
          pointer-events: none;
        }

        .avoro-promo-ad__ring--1 {
          width: 72%;
          height: 72%;
          top: 14%;
          left: 14%;
          animation: promoSpin 28s linear infinite;
        }

        .avoro-promo-ad__ring--2 {
          width: 88%;
          height: 88%;
          top: 6%;
          left: 6%;
          border-style: dashed;
          opacity: 0.45;
          animation: promoSpin 40s linear infinite reverse;
        }

        .avoro-promo-ad__bottle {
          position: relative;
          z-index: 2;
          width: 88%;
          height: 88%;
          display: block;
          animation: promoFloat 5.5s ease-in-out infinite;
          filter: drop-shadow(0 28px 56px rgba(0, 0, 0, 0.5));
          transition: transform 0.5s ease;
        }

        .avoro-promo-ad__bottle:hover {
          transform: scale(1.02);
        }

        .avoro-promo-ad__bottle-placeholder {
          width: 50%;
          height: 80%;
          margin: 0 auto;
          background: linear-gradient(160deg, rgba(212, 175, 136, 0.25), rgba(201, 149, 138, 0.1));
          border-radius: 30% 30% 20% 20%;
        }

        .avoro-promo-ad__badge {
          position: absolute;
          z-index: 3;
          bottom: 10%;
          left: 2%;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.8rem 1.05rem;
          border-radius: 14px;
          background: rgba(8, 8, 8, 0.78);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(201, 169, 110, 0.22);
        }

        .avoro-promo-ad__badge-star {
          color: var(--gold);
          font-size: 1rem;
          line-height: 1;
        }

        .avoro-promo-ad__badge-title {
          font-family: var(--font-ui);
          font-size: 0.58rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(245, 237, 226, 0.48);
        }

        .avoro-promo-ad__badge-sub {
          font-family: var(--font-display);
          font-size: 0.92rem;
          font-weight: 600;
          color: #f5ede2;
        }

        .avoro-promo-ad__marquee-wrap {
          position: relative;
          z-index: 1;
          overflow: hidden;
          border-top: 1px solid rgba(201, 169, 110, 0.14);
          padding: 0.9rem 0;
          background: rgba(0, 0, 0, 0.32);
        }

        .avoro-promo-ad__marquee {
          display: flex;
          gap: 2.75rem;
          width: max-content;
          animation: promoMarquee 32s linear infinite;
        }

        .avoro-promo-ad__marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          font-family: var(--font-ui);
          font-size: 0.64rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(245, 237, 226, 0.38);
          white-space: nowrap;
        }

        .avoro-promo-ad__marquee-dot {
          color: rgba(184, 146, 74, 0.7);
          font-size: 0.5rem;
        }

        @keyframes promoPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.85); }
        }

        @keyframes promoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes promoSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes promoMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (max-width: 900px) {
          .avoro-promo-ad__inner {
            grid-template-columns: 1fr;
            text-align: center;
            padding: clamp(2rem, 5vw, 2.75rem) clamp(1.5rem, 4vw, 2rem) 1.5rem;
          }
          .avoro-promo-ad__sub { margin-inline: auto; }
          .avoro-promo-ad__offer { justify-content: center; }
          .avoro-promo-ad__stats { justify-content: center; }
          .avoro-promo-ad__chips { justify-content: center; }
          .avoro-promo-ad__actions { justify-content: center; }
          .avoro-promo-ad__visual {
            min-height: 340px;
            order: -1;
          }
          .avoro-promo-ad__stage {
            max-width: 320px;
          }
          .avoro-promo-ad__badge {
            left: 50%;
            transform: translateX(-50%);
          }
          .avoro-promo-ad__corner { width: 20px; height: 20px; }
        }
      ` }} />
    </section>
  );
}