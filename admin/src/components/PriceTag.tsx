import React from 'react';

export interface PriceTagProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showDecimals?: boolean;
  prefix?: string;
  className?: string;
  style?: React.CSSProperties;
}

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
}: PriceTagProps) {
  const validOriginal =
    typeof originalPrice === 'number' && originalPrice > price;
  const discountPercent = validOriginal
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const fontSizes = {
    sm: { selling: '0.9rem', original: '0.8rem', discount: '0.8rem' },
    md: { selling: '1.15rem', original: '0.95rem', discount: '0.95rem' },
    lg: { selling: '1.5rem', original: '1.15rem', discount: '1.15rem' },
  }[size];

  return (
    <div
      className={`inline-flex items-baseline gap-2 flex-wrap ${className}`}
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        lineHeight: 1.2,
        ...style,
      }}
    >
      {prefix && (
        <span style={{ fontSize: fontSizes.original, color: '#71717a' }}>
          {prefix}
        </span>
      )}

      {/* Selling Price */}
      <span
        style={{
          fontSize: fontSizes.selling,
          fontWeight: 700,
          color: '#0f0f0f',
          letterSpacing: '-0.01em',
        }}
      >
        ₹{formatPrice(price, showDecimals)}
      </span>

      {/* Original MRP & Discount Tag */}
      {validOriginal && discountPercent > 0 && (
        <>
          <span
            style={{
              fontSize: fontSizes.original,
              fontWeight: 400,
              color: '#71717a',
              textDecoration: 'line-through',
              letterSpacing: '-0.01em',
            }}
          >
            MRP ₹{formatPrice(originalPrice, showDecimals)}
          </span>

          <span
            style={{
              fontSize: fontSizes.discount,
              fontWeight: 600,
              color: '#0d7a5b',
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
