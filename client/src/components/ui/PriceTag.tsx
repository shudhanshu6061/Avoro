'use client';

import React from 'react';

export interface PriceTagProps {
  price: number;
  originalPrice?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showDecimals?: boolean;
  prefix?: string;
  className?: string;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark' | 'inherit';
}

const SIZE_CONFIGS = {
  xs: {
    selling: { fontSize: '0.8rem', fontWeight: 700 },
    original: { fontSize: '0.72rem', fontWeight: 400 },
    discount: { fontSize: '0.72rem', fontWeight: 600 },
    gap: '0.35rem',
  },
  sm: {
    selling: { fontSize: '0.95rem', fontWeight: 700 },
    original: { fontSize: '0.85rem', fontWeight: 400 },
    discount: { fontSize: '0.85rem', fontWeight: 600 },
    gap: '0.45rem',
  },
  md: {
    selling: { fontSize: '1.25rem', fontWeight: 700 },
    original: { fontSize: '1.05rem', fontWeight: 400 },
    discount: { fontSize: '1.05rem', fontWeight: 600 },
    gap: '0.6rem',
  },
  lg: {
    selling: { fontSize: '1.8rem', fontWeight: 700 },
    original: { fontSize: '1.4rem', fontWeight: 400 },
    discount: { fontSize: '1.4rem', fontWeight: 600 },
    gap: '0.75rem',
  },
  xl: {
    selling: { fontSize: '2.5rem', fontWeight: 700 },
    original: { fontSize: '1.6rem', fontWeight: 400 },
    discount: { fontSize: '1.6rem', fontWeight: 600 },
    gap: '0.85rem',
  },
};

export function formatPrice(val: number, showDecimals: boolean = true): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const hasDecimals = val % 1 !== 0;
  if (showDecimals || hasDecimals) {
    return val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return val.toLocaleString('en-IN');
}

export default function PriceTag({
  price,
  originalPrice,
  size = 'md',
  showDecimals = true,
  prefix = '',
  className = '',
  style = {},
  theme = 'inherit',
}: PriceTagProps) {
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  const validOriginal =
    typeof originalPrice === 'number' && originalPrice > price;
  const discountPercent = validOriginal
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Determine colors based on theme
  const sellingColor =
    theme === 'dark'
      ? '#ffffff'
      : theme === 'light'
      ? '#0f0f0f'
      : 'inherit';

  const originalColor =
    theme === 'dark'
      ? 'rgba(255, 255, 255, 0.45)'
      : '#71717a';

  const discountColor =
    theme === 'dark'
      ? '#10b981' // Vibrant green on dark
      : '#0d7a5b'; // Elegant dark emerald green on light

  return (
    <div
      className={`price-tag-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: config.gap,
        fontFamily: "var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif",
        lineHeight: 1.2,
        flexWrap: 'wrap',
        ...style,
      }}
    >
      {prefix && (
        <span
          style={{
            fontSize: config.original.fontSize,
            color: originalColor,
            fontWeight: 400,
            marginRight: '0.1rem',
          }}
        >
          {prefix}
        </span>
      )}

      {/* Selling Price */}
      <span
        style={{
          fontSize: config.selling.fontSize,
          fontWeight: config.selling.fontWeight,
          color: sellingColor,
          letterSpacing: '-0.01em',
        }}
      >
        ₹{formatPrice(price, showDecimals)}
      </span>

      {/* Original MRP with strikethrough & Discount % badge */}
      {validOriginal && discountPercent > 0 && (
        <>
          <span
            style={{
              fontSize: config.original.fontSize,
              fontWeight: config.original.fontWeight,
              color: originalColor,
              textDecoration: 'line-through',
              letterSpacing: '-0.01em',
            }}
          >
            MRP ₹{formatPrice(originalPrice, showDecimals)}
          </span>

          <span
            style={{
              fontSize: config.discount.fontSize,
              fontWeight: config.discount.fontWeight,
              color: discountColor,
              letterSpacing: '-0.01em',
            }}
          >
            ({discountPercent}% OFF)
          </span>
        </>
      )}
    </div>
  );
}
