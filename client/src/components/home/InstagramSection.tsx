'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Play, Heart, MessageCircle } from 'lucide-react';
import type { InstagramPost } from '@/app/api/instagram/route';

function InstagramIcon({ size = 16, color = 'currentColor', style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark, #b8924a)',
};

export default function InstagramSection() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Initialize Embla Carousel with Autoplay (4s delay, pause on mouse enter)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
      skipSnaps: false,
    },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Fetch Instagram posts from backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchPosts() {
      try {
        const res = await fetch('/api/instagram');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.posts) {
            setPosts(data.posts);
          }
        }
      } catch (err) {
        console.error('Failed to load Instagram posts:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      style={{
        background: '#faf8f5',
        paddingBlock: 'clamp(2rem, 4vw, 3.5rem)',
        borderTop: '1px solid rgba(184, 146, 74, 0.12)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div className="lumina-container" style={{ paddingInline: 'clamp(1rem, 4vw, 2.5rem)' }}>
        {/* Header section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem',
            marginBottom: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          }}
        >
          <div style={{ maxWidth: '750px', marginInline: 'auto' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.4rem, 3vw, 2.25rem)',
                fontWeight: 700,
                color: 'var(--text, #1a1815)',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Catch the AVORO energy on Instagram!
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(0.825rem, 1.3vw, 0.98rem)',
                color: 'var(--text-soft, #666)',
                marginTop: '0.35rem',
                fontWeight: 300,
                marginBottom: 0,
              }}
            >
              A curated feed of aroma, artistry, and allure—join the fragrance journey.
            </p>
          </div>

          {/* Action Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
            className="avoro-ig-header-controls"
          >
            <a
              href="https://www.instagram.com/avoro.official/"
              target="_blank"
              rel="noopener noreferrer"
              className="avoro-ig-follow-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                background: '#1a1815',
                color: '#ffffff',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: '30px',
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                whiteSpace: 'nowrap',
              }}
            >
              <InstagramIcon size={15} color="#d4af88" />
              <span>Follow @avoro.official</span>
            </a>
          </div>
        </div>

        {/* Carousel Container */}
        {isLoading ? (
          <div className="avoro-ig-grid-skeleton">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="avoro-ig-skeleton-card" />
            ))}
          </div>
        ) : (
          <div
            className="embla-ig-viewport"
            ref={emblaRef}
            style={{
              overflow: 'hidden',
              cursor: 'grab',
              touchAction: 'pan-y pinch-zoom',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
          >
            <div
              className="embla-ig-container"
              style={{
                display: 'flex',
                marginLeft: '-0.5rem',
                marginRight: '-0.5rem',
              }}
            >
              {posts.map((post) => (
                <div key={post.id} className="embla-ig-slide">
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="avoro-ig-card"
                    style={{
                      display: 'block',
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      aspectRatio: '4 / 5',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.06)',
                      background: 'linear-gradient(135deg, #f3ece4 0%, #e6dcd0 100%)',
                      textDecoration: 'none',
                    }}
                  >
                    {/* Main Post Image / Reel Thumbnail */}
                    <Image
                      src={post.mediaUrl}
                      alt={post.caption || 'AVORO Instagram Post'}
                      fill
                      loading="lazy"
                      unoptimized
                      sizes="(max-width: 480px) 78vw, (max-width: 640px) 65vw, (max-width: 1024px) 33vw, 20vw"
                      style={{
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      }}
                      className="avoro-ig-card-img"
                    />

                    {/* Top-Right Instagram Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(15, 14, 12, 0.6)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 2,
                      }}
                    >
                      {post.type === 'REEL' ? <Play size={14} fill="#ffffff" /> : <InstagramIcon size={15} color="#ffffff" />}
                    </div>

                    {/* Hover & Touch Gradient Overlay */}
                    <div className="avoro-ig-card-overlay">
                      <div className="avoro-ig-card-info">
                        {post.likesCount !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600 }}>
                              <Heart size={13} fill="#ffffff" color="#ffffff" />
                              {post.likesCount.toLocaleString()}
                            </span>
                            {post.commentsCount !== undefined && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600 }}>
                                <MessageCircle size={13} fill="#ffffff" color="#ffffff" />
                                {post.commentsCount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="avoro-ig-card-caption">
                          {post.caption}
                        </p>
                        <span className="avoro-ig-view-link">View on Instagram →</span>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Embedded CSS for Embla Mobile Breakpoints, Smooth Swipe, Touch Actions */}
      <style jsx global>{`
        /* Mobile first slide calculations */
        .embla-ig-slide {
          flex: 0 0 78%; /* Shows 1.25 to 1.5 cards on mobile screens */
          padding-left: 0.5rem;
          padding-right: 0.5rem;
          min-width: 0;
        }

        @media (min-width: 480px) {
          .embla-ig-slide {
            flex: 0 0 65%; /* 1.5 cards on larger smartphones */
          }
        }

        @media (min-width: 640px) {
          .embla-ig-slide {
            flex: 0 0 33.333%; /* 3 cards on tablets */
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }

        @media (min-width: 1024px) {
          .embla-ig-slide {
            flex: 0 0 20%; /* 5 cards on desktop */
          }
        }

        /* Active touch state & hover feedback */
        .avoro-ig-card {
          transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
        }
        .avoro-ig-card:hover,
        .avoro-ig-card:active {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12) !important;
        }
        .avoro-ig-card:hover .avoro-ig-card-img,
        .avoro-ig-card:active .avoro-ig-card-img {
          transform: scale(1.06);
        }
        .avoro-ig-card:hover .avoro-ig-card-overlay,
        .avoro-ig-card:active .avoro-ig-card-overlay {
          opacity: 1;
        }

        /* Overlay styling */
        .avoro-ig-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 13, 10, 0.85) 0%, rgba(15, 13, 10, 0.2) 60%, transparent 100%);
          opacity: 0;
          transition: opacity 0.35s ease;
          display: flex;
          align-items: flex-end;
          padding: 1rem;
          z-index: 1;
        }
        .avoro-ig-card-info {
          color: #ffffff;
          width: 100%;
        }
        .avoro-ig-card-caption {
          font-family: var(--font-ui), sans-serif;
          font-size: 0.75rem;
          line-height: 1.35;
          color: rgba(255, 255, 255, 0.92);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0 0 0.4rem 0;
          font-weight: 300;
        }
        .avoro-ig-view-link {
          font-family: var(--font-ui), sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #d4af88;
        }

        /* Buttons Touch & Hover Effects */
        .avoro-ig-follow-btn:hover,
        .avoro-ig-follow-btn:active {
          background: #d4af88 !important;
          color: #1a1815 !important;
          box-shadow: 0 6px 20px rgba(212, 175, 136, 0.4) !important;
        }
        .avoro-ig-follow-btn:hover svg,
        .avoro-ig-follow-btn:active svg {
          stroke: #1a1815 !important;
        }
        .avoro-carousel-nav:hover,
        .avoro-carousel-nav:active {
          background: #1a1815 !important;
          color: #ffffff !important;
          border-color: #1a1815 !important;
        }

        /* Mobile Header Controls Wrapping */
        @media (max-width: 580px) {
          .avoro-ig-header-controls {
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        /* Skeleton Loading Grid */
        .avoro-ig-grid-skeleton {
          display: flex;
          gap: 1rem;
          overflow: hidden;
        }
        .avoro-ig-skeleton-card {
          flex: 0 0 78%;
          aspect-ratio: 4 / 5;
          border-radius: 16px;
          background: linear-gradient(90deg, #ede7df 25%, #f7f3ed 50%, #ede7df 75%);
          background-size: 200% 100%;
          animation: avoroSkeletonShimmer 1.8s infinite;
        }
        @media (min-width: 480px) {
          .avoro-ig-skeleton-card {
            flex: 0 0 65%;
          }
        }
        @media (min-width: 640px) {
          .avoro-ig-skeleton-card {
            flex: 0 0 33.333%;
          }
        }
        @media (min-width: 1024px) {
          .avoro-ig-skeleton-card {
            flex: 0 0 20%;
          }
        }
        @keyframes avoroSkeletonShimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </section>
  );
}
