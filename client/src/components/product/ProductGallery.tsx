'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  activeImg: number;
  onSelectImage: (index: number) => void;
  badgeNumber?: string;
}

export default function ProductGallery({
  images,
  productName,
  activeImg,
  onSelectImage,
  badgeNumber = '01',
}: ProductGalleryProps) {
  const [direction, setDirection] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalImages = images.length;

  const handleNext = useCallback(() => {
    if (totalImages <= 1) return;
    setDirection(1);
    onSelectImage((activeImg + 1) % totalImages);
  }, [activeImg, totalImages, onSelectImage]);

  const handlePrev = useCallback(() => {
    if (totalImages <= 1) return;
    setDirection(-1);
    onSelectImage((activeImg - 1 + totalImages) % totalImages);
  }, [activeImg, totalImages, onSelectImage]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses when typing in input or textareas
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Preload adjacent images to avoid flickering
  useEffect(() => {
    if (totalImages <= 1) return;

    const nextIdx = (activeImg + 1) % totalImages;
    const prevIdx = (activeImg - 1 + totalImages) % totalImages;

    [nextIdx, prevIdx].forEach((idx) => {
      if (images[idx]) {
        const img = new window.Image();
        img.src = images[idx];
      }
    });
  }, [activeImg, images, totalImages]);

  // Slide & Fade Animation Variants (300ms duration)
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 32, duration: 0.3 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      transition: {
        x: { duration: 0.2 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  const activeSrc = images[activeImg] ?? '';

  return (
    <div
      ref={containerRef}
      className="pdp-gallery-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
      }}
    >
      {/* ══ MAIN IMAGE CONTAINER ══════════════════════════════ */}
      <div
        className="pdp-main-image-card"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3.4',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #F7F3EE 0%, #EFE9E0 100%)',
          border: '1px solid rgba(212, 175, 136, 0.25)',
          boxShadow: '0 10px 32px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ambient background glow & rings */}
        <div
          className="pdp-ambient-glow"
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 55%, rgba(184,146,74,0.08) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* Decorative number badge */}
        <div
          className="pdp-badge-num"
          aria-hidden
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1.25rem',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 200,
            color: 'rgba(184,146,74,0.08)',
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {badgeNumber}
        </div>

        {/* Main Image Display area */}
        <div
          className="pdp-image-wrapper"
          style={{
            position: 'relative',
            width: '96%',
            height: '96%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {activeSrc ? (
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeImg}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                drag={totalImages > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  const swipeThreshold = 40;
                  if (info.offset.x < -swipeThreshold) {
                    handleNext();
                  } else if (info.offset.x > swipeThreshold) {
                    handlePrev();
                  }
                }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  cursor: totalImages > 1 ? 'grab' : 'default',
                  touchAction: 'pan-y',
                }}
                whileTap={{ cursor: totalImages > 1 ? 'grabbing' : 'default' }}
              >
                <Image
                  src={activeSrc}
                  alt={`${productName} - Image ${activeImg + 1}`}
                  fill
                  sizes="(max-width: 900px) 100vw, 45vw"
                  priority
                  style={{
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 14px 30px rgba(0, 0, 0, 0.09))',
                  }}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div
              style={{
                width: '60%',
                height: '80%',
                background:
                  'linear-gradient(160deg, rgba(184,146,74,0.12), rgba(184,146,74,0.04))',
                borderRadius: '30% 30% 20% 20%',
              }}
            />
          )}
        </div>

        {/* Desktop Circular Navigation Arrows */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="pdp-nav-btn pdp-nav-btn-prev"
              style={{
                position: 'absolute',
                left: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                color: '#000000',
                transition: 'all 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="pdp-nav-btn pdp-nav-btn-next"
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                color: '#000000',
                transition: 'all 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <ChevronRight size={22} strokeWidth={2} />
            </button>
          </>
        )}
      </div>

      {/* Mobile Slide Dots Indicator (Mobile Only) */}
      {totalImages > 1 && (
        <div
          className="pdp-mobile-dots"
          style={{
            display: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '0.5rem',
            width: '100%',
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setDirection(i > activeImg ? 1 : -1);
                onSelectImage(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: activeImg === i ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: activeImg === i ? 'var(--gold-dark, #B88A44)' : 'rgba(0, 0, 0, 0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            />
          ))}
        </div>
      )}

      {/* ══ THUMBNAIL STRIP BELOW IMAGE (5-COLUMN GRID) ══════════════════════ */}
      {totalImages > 1 && (
        <div
          className="pdp-thumbnails-strip"
          role="tablist"
          aria-label="Product images gallery"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(totalImages, 5)}, 1fr)`,
            gap: '0.75rem',
            width: '100%',
          }}
        >
          {images.slice(0, 5).map((img, i) => {
            const isActive = activeImg === i;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`View image ${i + 1} of ${totalImages}`}
                onClick={() => {
                  setDirection(i > activeImg ? 1 : -1);
                  onSelectImage(i);
                }}
                className="pdp-thumb-btn"
                style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #F7F3EE 0%, #EFE9E0 100%)',
                  border: isActive
                    ? '2.5px solid var(--gold-dark)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isActive
                    ? '0 6px 18px rgba(184, 146, 74, 0.35)'
                    : '0 2px 8px rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  outline: 'none',
                }}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${i + 1}`}
                  fill
                  sizes="100px"
                  style={{
                    objectFit: 'contain',
                    padding: '6px',
                    opacity: isActive ? 1 : 0.8,
                    transition: 'opacity 0.3s ease',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Embedded CSS for hover states & focus rings */}
      <style dangerouslySetInnerHTML={{ __html: `
        .pdp-nav-btn:hover {
          transform: translateY(-50%) scale(1.08) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
          background: #ffffff !important;
        }
        .pdp-nav-btn:focus-visible {
          outline: 2px solid var(--gold-dark);
          outline-offset: 2px;
        }
        .pdp-thumb-btn:hover {
          border-color: var(--gold-dark) !important;
          opacity: 1;
        }
        .pdp-thumb-btn:focus-visible {
          outline: 2px solid var(--gold-dark);
          outline-offset: 2px;
        }
        .pdp-thumbnails-strip::-webkit-scrollbar {
          height: 3px;
        }
        .pdp-thumbnails-strip::-webkit-scrollbar-thumb {
          background: var(--gold-light);
          border-radius: 4px;
        }
        @media (max-width: 768px) {
          .pdp-gallery-root {
            gap: 0 !important;
          }
          .pdp-main-image-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            aspect-ratio: 1 / 1 !important;
            overflow: visible !important;
          }
          .pdp-image-wrapper {
            width: 100% !important;
            height: 100% !important;
          }
          .pdp-nav-btn {
            display: none !important;
          }
          .pdp-thumbnails-strip {
            display: none !important;
          }
          .pdp-badge-num {
            display: none !important;
          }
          .pdp-ambient-glow {
            display: none !important;
          }
          .pdp-mobile-dots {
            display: flex !important;
          }
        }
      ` }} />
    </div>
  );
}
