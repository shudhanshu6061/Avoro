'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';
import PriceTag from '@/components/ui/PriceTag';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  floral:   'rgba(232, 160, 200, 0.12)',
  woody:    'rgba(200, 120, 12, 0.12)',
  fresh:    'rgba(126, 200, 232, 0.12)',
  oriental: 'rgba(200, 80, 160, 0.12)',
  default:  'rgba(200, 160, 60, 0.12)',
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const minVariant = product.variants.length
    ? product.variants.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), product.variants[0])
    : undefined;
  const minPrice = minVariant ? minVariant.price : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -12;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 12;
    setTilt({ x: rx, y: ry });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const accentColor = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.default;

  return (
    <Link href={`/product/${product.slug}`} style={{ display: 'block' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          background: hovered ? 'var(--black-surface)' : 'var(--black-card)',
          border: `1px solid ${hovered ? 'var(--gold-border)' : 'rgba(255,255,255,0.04)'}`,
          borderRadius: '4px',
          overflow: 'hidden',
          cursor: 'pointer',
          transform: hovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)',
          transition: hovered
            ? 'transform 0.12s ease, border-color 0.3s ease, background 0.3s ease'
            : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, background 0.3s ease',
          boxShadow: hovered
            ? `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${accentColor}`
            : '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Image area */}
        <div
          style={{
            position: 'relative',
            paddingBottom: '120%',
            background: `radial-gradient(ellipse at center, ${accentColor} 0%, var(--black-card) 70%)`,
            overflow: 'hidden',
          }}
        >
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={priority}
              style={{
                objectFit: 'cover',
                transition: 'transform 0.6s ease',
                transform: hovered ? 'scale(1.04)' : 'scale(1)',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '4rem',
                  fontWeight: 300,
                  letterSpacing: '0.2em',
                  color: 'rgba(200,160,60,0.15)',
                  textTransform: 'uppercase',
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.5s ease',
                }}
              >
                ◈
              </div>
            </div>
          )}

          {/* Gold shimmer overlay on hover */}
          {hovered && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
                opacity: 0.4,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Category badge */}
          <div
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              background: 'rgba(6,6,6,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '2px',
              padding: '0.25rem 0.5rem',
            }}
          >
            <span className="label-text" style={{ fontSize: '0.55rem' }}>
              {product.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '1.25rem 1.25rem 1.5rem' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 300,
              color: 'var(--white)',
              marginBottom: '0.3rem',
              letterSpacing: '0.02em',
            }}
          >
            {product.name}
          </h3>

          {product.notes.length > 0 && (
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.68rem',
                color: 'var(--white-dim)',
                letterSpacing: '0.08em',
                marginBottom: '1rem',
              }}
            >
              {product.notes.slice(0, 3).join(' · ')}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <PriceTag
              price={minPrice}
              originalPrice={minVariant?.originalPrice}
              size="sm"
              theme="dark"
              prefix="from "
              showDecimals={true}
            />
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: hovered ? 'var(--gold)' : 'var(--white-dim)',
                transition: 'color 0.3s ease',
              }}
            >
              {hovered ? 'Explore →' : `${product.variants.length} sizes`}
            </span>
          </div>
        </div>

        {/* Bottom gold line reveal */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 0.4s ease',
          }}
        />
      </div>
    </Link>
  );
}
