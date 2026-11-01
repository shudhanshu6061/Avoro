'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';

interface Fragrance {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  price: number;
  size: string;
  notes: string[];
  color: string;
  bgGlow: string;
  sku: string;
}

const FRAGRANCES: Fragrance[] = [
  {
    id: 'prod_vanilla_ember',
    name: 'Vanilla Ember',
    slug: 'vanilla-ember',
    subtitle: 'Warm Vanilla & Amber',
    price: 899,
    size: '50ml',
    notes: ['Vanilla', 'Tonka Bean', 'Amber', 'Soft Musk'],
    color: '#d97706',
    bgGlow: 'rgba(217, 119, 6, 0.2)',
    sku: 'VE-50',
  },
  {
    id: 'prod_blue_amber',
    name: 'Blue Amber',
    slug: 'blue-amber',
    subtitle: 'Aquatic Breeze & Marine Musk',
    price: 849,
    size: '50ml',
    notes: ['Bergamot', 'Marine Notes', 'White Musk', 'Amber'],
    color: '#2563eb',
    bgGlow: 'rgba(37, 99, 235, 0.2)',
    sku: 'BA-50',
  },
  {
    id: 'prod_velvet_oud',
    name: 'Velvet Oud',
    slug: 'velvet-oud',
    subtitle: 'Smoky Oud & Damask Rose',
    price: 799,
    size: '50ml',
    notes: ['Smoky Woods', 'Oud', 'Leather', 'Amber'],
    color: '#b45309',
    bgGlow: 'rgba(180, 83, 9, 0.2)',
    sku: 'VO-50',
  },
  {
    id: 'prod_crimson_bloom',
    name: 'Crimson Bloom',
    slug: 'crimson-bloom',
    subtitle: 'Blooming Rose & Honey Spices',
    price: 899,
    size: '50ml',
    notes: ['Blooming Rose', 'Crimson Spices', 'Golden Honey'],
    color: '#dc2626',
    bgGlow: 'rgba(220, 38, 38, 0.2)',
    sku: 'CB-50',
  },
];

export default function Perfume3DParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();
  const [activeIdx, setActiveIdx] = useState<number>(2); // Default to Velvet Oud
  const [addedSku, setAddedSku] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hoverColumn = Math.min(3, Math.max(0, Math.floor((x / rect.width) * 4)));
    setActiveIdx(hoverColumn);
  };

  const handleAddToCart = useCallback((e: React.MouseEvent, frag: Fragrance) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: frag.id,
      slug: frag.slug,
      name: frag.name,
      image: `/images/bottles/${frag.slug}.webp`,
      size: frag.size,
      price: frag.price,
      sku: frag.sku,
    });
    setAddedSku(frag.sku);
    setTimeout(() => setAddedSku(null), 2200);
  }, [addItem]);

  const activeFrag = FRAGRANCES[activeIdx] || FRAGRANCES[0];

  return (
    <div
      ref={containerRef}
      className="avoro-span-hero-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Soft Ambient Glow under bottles ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '10%',
          left: `${12.5 + activeIdx * 25}%`,
          transform: 'translateX(-50%)',
          width: '45%',
          height: '70%',
          background: `radial-gradient(circle, ${activeFrag.bgGlow} 0%, transparent 70%)`,
          filter: 'blur(45px)',
          transition: 'all 0.5s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Full-Span Frameless 4-Bottle Image Display ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2500 / 860',
          maxHeight: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Image
          src="/images/hero-span-banner.webp"
          alt="AVORO Signature Fragrance Collection - Vanilla Ember, Blue Amber, Velvet Oud, Crimson Bloom"
          fill
          sizes="100vw"
          priority
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
            transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          }}
        />

        {/* Interactive Column Hover Highlight */}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            bottom: '5%',
            left: `${activeIdx * 25}%`,
            width: '25%',
            background: 'linear-gradient(180deg, rgba(212,175,136,0.12) 0%, rgba(212,175,136,0.03) 100%)',
            borderRadius: '16px',
            borderLeft: '1px solid rgba(212,175,136,0.25)',
            borderRight: '1px solid rgba(212,175,136,0.25)',
            transition: 'left 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
            pointerEvents: 'none',
            opacity: isHovered ? 1 : 0.6,
            zIndex: 2,
          }}
        />
      </div>

      {/* ── Sleek Interactive Fragrance Controls & Info ── */}
      <div
        style={{
          width: '100%',
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.85rem',
          zIndex: 3,
        }}
      >
        {/* Fragrance Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            width: '100%',
            maxWidth: '650px',
          }}
        >
          {FRAGRANCES.map((frag, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={frag.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
                style={{
                  padding: '0.5rem 0.35rem',
                  background: isActive ? '#18181b' : 'rgba(255, 255, 255, 0.85)',
                  color: isActive ? '#ffffff' : '#3f3f46',
                  border: isActive ? `1.5px solid ${frag.color}` : '1px solid var(--border-soft)',
                  borderRadius: '20px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? `0 4px 14px ${frag.bgGlow}` : '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: frag.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {frag.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Fragrance Active Detail Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '0.65rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-soft)',
            borderRadius: '40px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
            maxWidth: '650px',
            width: '100%',
          }}
        >
          <div style={{ flex: 1, minWidth: '180px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
              {activeFrag.name}
            </span>
            <span style={{ marginLeft: '0.5rem', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--text-soft)' }}>
              {activeFrag.size} EDP · <strong style={{ color: 'var(--text)' }}>₹{activeFrag.price}</strong>
            </span>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--gold-dark)', marginTop: '0.1rem' }}>
              {activeFrag.notes.join(' · ')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={(e) => handleAddToCart(e, activeFrag)}
              style={{
                padding: '0.5rem 1rem',
                background: addedSku === activeFrag.sku ? '#16a34a' : 'var(--gold-dark)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {addedSku === activeFrag.sku ? '✓ Added to Cart' : '+ Add to Cart'}
            </button>

            <Link
              href={`/product/${activeFrag.slug}`}
              style={{
                padding: '0.5rem 0.85rem',
                background: '#18181b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Explore →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


