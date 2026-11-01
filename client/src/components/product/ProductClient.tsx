'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatSizeLabel, type Product, type ProductVariant } from '@/types/product';
import { getApprovedReviews, getProducts, getReviewStats, submitReview, type Review, type ReviewStats } from '@/lib/api';
import ProductDescription from './ProductDescription';
import PincodeChecker from './PincodeChecker';
import { resolveProductPageContent } from '@/lib/productPageContent';
import PriceTag from '@/components/ui/PriceTag';
import ProductGallery from './ProductGallery';
import { ShieldCheck, Leaf, Truck } from 'lucide-react';

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark)',
};

interface Props { product: Product; }

export default function ProductClient({ product }: Props) {
  const router = useRouter();
  const [variant, setVariant] = useState<ProductVariant>(product.variants[0] ?? { sku: '', size: '', price: 0, stock: 0 });
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { addItem } = useCartStore();
  const { user, isLoggedIn } = useAuthStore();
  const outOfStock = variant.stock === 0;
  const descContent = resolveProductPageContent(product);

  /* ─── Reviews state ─── */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ count: 0, average: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    body: '',
    guestName: '',
    guestEmail: '',
  });

  // Set document title from custom SEO meta title or product name
  useEffect(() => {
    const seo = (product.seo || {}) as { seoTitle?: string; title?: string };
    const metaTitle = seo.seoTitle?.trim() || seo.title?.trim() || product.name;
    if (metaTitle) {
      document.title = metaTitle;
    }
  }, [product]);

  // Fetch approved reviews & stats
  useEffect(() => {
    let mounted = true;
    setReviewsLoading(true);
    Promise.all([
      getApprovedReviews(product.id),
      getReviewStats(product.id),
    ])
      .then(([revs, st]) => {
        if (mounted) {
          setReviews(revs);
          setStats(st);
        }
      })
      .catch(() => {
        if (mounted) {
          setReviews([]);
          setStats({ count: 0, average: 0 });
        }
      })
      .finally(() => mounted && setReviewsLoading(false));
    return () => { mounted = false; };
  }, [product.id]);

  const refreshReviews = async () => {
    try {
      const [revs, st] = await Promise.all([
        getApprovedReviews(product.id),
        getReviewStats(product.id),
      ]);
      setReviews(revs);
      setStats(st);
    } catch {}
  };

  const handleAdd = () => {
    addItem({ productId: product.id, slug: product.slug, name: product.name, image: product.images?.[0] ?? '', size: variant.size, price: variant.price, originalPrice: variant.originalPrice, sku: variant.sku }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push('/checkout');
  };

  const openReviewModal = () => {
    setReviewForm({
      rating: 5,
      title: '',
      body: '',
      guestName: !isLoggedIn ? '' : (user?.firstName + ' ' + user?.lastName || ''),
      guestEmail: !isLoggedIn ? '' : (user?.email || ''),
    });
    setReviewSuccess(false);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.body.trim()) return;

    setSubmitting(true);
    try {
      await submitReview({
        productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || undefined,
        body: reviewForm.body.trim(),
        guestName: !isLoggedIn ? reviewForm.guestName.trim() || undefined : undefined,
        guestEmail: !isLoggedIn ? reviewForm.guestEmail.trim() || undefined : undefined,
      });
      setReviewSuccess(true);
      // Refresh list after short delay
      setTimeout(async () => {
        await refreshReviews();
        setShowReviewModal(false);
        setReviewSuccess(false);
      }, 1400);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const images = product.images?.length ? product.images : [];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ══ HERO SECTION ══════════════════════════════════ */}
      <section className="pdp-hero" style={{
        position: 'relative',
        background: 'var(--bg)',
        paddingBlock: '0.75rem 2.5rem',
      }}>
        <div className="pdp-hero-container" style={{
          maxWidth: '1360px',
          marginInline: 'auto',
          paddingInline: 'var(--page-pad)',
          display: 'grid',
          gridTemplateColumns: '45% 55%',
          gap: 'clamp(2rem, 4vw, 4rem)',
          alignItems: 'flex-start',
        }}>
          {/* LEFT: Product Image Gallery */}
          <div className="pdp-hero-gallery" style={{ width: '100%' }}>
            <ProductGallery
              images={images}
              productName={product.name}
              activeImg={activeImg}
              onSelectImage={setActiveImg}
              badgeNumber={descContent ? descContent.badge.split('·')[0].replace('No. ', '') : '01'}
            />
          </div>

          {/* RIGHT: Product Info */}
          <div className="pdp-hero-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0', position: 'relative', background: 'var(--bg)' }}>

          {/* Breadcrumb */}
          <div className="pdp-breadcrumb" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-soft)' }}>Home</Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>›</span>
            <Link href="/collection" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-soft)' }}>Collection</Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>›</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-mid)' }}>{product.name}</span>
          </div>

          {/* Badge */}
          {descContent && (
            <div style={{ display: 'inline-flex', alignSelf: 'flex-start', background: 'rgba(184,146,74,0.06)', border: '1px solid rgba(184,146,74,0.18)', borderRadius: '30px', padding: '0.4rem 1.25rem', marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--gold-dark)', letterSpacing: '0.1em' }}>{descContent.badge}</span>
            </div>
          )}

          {/* Name */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            {product.name}
          </h1>

          {/* Tagline */}
          {descContent && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '1.25rem', fontWeight: 500 }}>
              {descContent.tagline}
            </p>
          )}



          {/* Price */}
          <div style={{ marginBottom: '1.75rem' }}>
            <PriceTag price={variant.price} originalPrice={variant.originalPrice} size="lg" showDecimals={true} />
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: '0.4rem' }}>
              {formatSizeLabel(variant.size)} · Eau de Parfum
            </div>
          </div>

          {/* Size selector */}
          {product.variants.length > 1 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ ...EB, marginBottom: '0.75rem' }}>Select Size</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.variants.map(v => {
                  const on = v.sku === variant.sku;
                  const oos = v.stock === 0;
                  return (
                    <button key={v.sku} type="button" disabled={oos} onClick={() => setVariant(v)}
                      style={{
                        padding: '0.6rem 1.5rem', borderRadius: '30px',
                        border: `1.5px solid ${on ? 'var(--gold-dark)' : 'var(--border)'}`,
                        background: on ? 'var(--gold-pale)' : 'transparent',
                        color: on ? 'var(--gold-dark)' : oos ? 'var(--text-muted)' : 'var(--text-mid)',
                        fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: on ? 600 : 400,
                        cursor: oos ? 'not-allowed' : 'pointer',
                        opacity: oos ? 0.45 : 1,
                        textDecoration: oos ? 'line-through' : 'none',
                        transition: 'all 0.3s',
                      }}>
                      {formatSizeLabel(v.size)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Qty + Actions */}
          <div className="pdp-actions" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            {/* Qty */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E2DCD5', borderRadius: '10px', overflow: 'hidden', background: '#FAF8F5', height: '52px' }}>
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: '44px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-mid)', fontSize: '1.2rem', cursor: 'pointer', background: 'none', border: 'none', borderRight: '1px solid #E2DCD5' }}>−</button>
              <span style={{ width: '44px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>{qty}</span>
              <button type="button" onClick={() => setQty(q => Math.min(variant.stock || 10, q + 1))}
                style={{ width: '44px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-mid)', fontSize: '1.2rem', cursor: 'pointer', background: 'none', border: 'none', borderLeft: '1px solid #E2DCD5' }}>+</button>
            </div>

            {/* Add to cart */}
            <button type="button" onClick={handleAdd} disabled={outOfStock} style={{
              flex: 1, height: '52px', padding: '0 2rem',
              background: added ? '#2d7a4f' : outOfStock ? 'var(--bg-soft)' : 'linear-gradient(135deg, #B88A44 0%, #C0904D 100%)',
              color: outOfStock ? 'var(--text-muted)' : '#fff',
              fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              border: 'none',
              borderRadius: '10px',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              boxShadow: (!outOfStock && !added) ? '0 6px 20px rgba(184,138,68,0.3)' : 'none',
              transition: 'all 0.3s',
            }}>
              {added ? '✓ Added to Cart' : outOfStock ? 'Out of Stock' : `Add to Cart — ₹${(variant.price * qty).toLocaleString('en-IN')}`}
            </button>
          </div>

          {/* Buy Now */}
          <button type="button" onClick={handleBuyNow} disabled={outOfStock} style={{
            display: 'block', width: '100%', textAlign: 'center', padding: '0.85rem',
            border: '1.5px solid var(--text)', borderRadius: '10px',
            fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)',
            marginBottom: '1.5rem', transition: 'all 0.3s', cursor: 'pointer', background: 'none',
          }}>
            Buy Now
          </button>

          {/* Luxury 3-Column Trust Icons Row */}
          <div className="pdp-trust-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginTop: '1.25rem',
            marginBottom: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(212,175,136,0.2)',
          }}>
            <div className="pdp-trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="pdp-trust-icon" style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#FAF6F0', border: '1px solid rgba(184,146,74,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B88A44', flexShrink: 0
              }}>
                <ShieldCheck size={20} strokeWidth={1.75} />
              </div>
              <div>
                <div className="pdp-trust-title" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>Long Lasting</div>
                <div className="pdp-trust-sub" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--text-soft)', marginTop: '0.15rem' }}>8+ Hours</div>
              </div>
            </div>

            <div className="pdp-trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="pdp-trust-icon" style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#FAF6F0', border: '1px solid rgba(184,146,74,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B88A44', flexShrink: 0
              }}>
                <Leaf size={19} strokeWidth={1.75} />
              </div>
              <div>
                <div className="pdp-trust-title" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>Premium Ingredients</div>
                <div className="pdp-trust-sub" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--text-soft)', marginTop: '0.15rem' }}>Sourced Globally</div>
              </div>
            </div>

            <div className="pdp-trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="pdp-trust-icon" style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#FAF6F0', border: '1px solid rgba(184,146,74,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B88A44', flexShrink: 0
              }}>
                <Truck size={20} strokeWidth={1.75} />
              </div>
              <div>
                <div className="pdp-trust-title" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>Free Shipping</div>
                <div className="pdp-trust-sub" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--text-soft)', marginTop: '0.15rem' }}>Pan India</div>
              </div>
            </div>
          </div>

          {/* Shiprocket Delivery Pincode Checker */}
          <PincodeChecker />
        </div>
      </div>
    </section>

      {/* ══ QUICK INFO BAR ════════════════════════════════ */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)' }}>
        <div className="pdp-info-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', maxWidth: '1100px', marginInline: 'auto', padding: '0 var(--page-pad)' }}>
          {[
            { label: 'Longevity', value: descContent?.details.find(d => d.label === 'Longevity')?.value ?? '8-10 hours' },
            { label: 'Projection', value: descContent?.details.find(d => d.label === 'Sillage (Projection)')?.value?.split('—')[0]?.trim() ?? 'Strong' },
            { label: 'Fragrance Type', value: 'Eau de Parfum' },
            { label: 'Season', value: descContent?.details.find(d => d.label === 'Season')?.value?.split('·')[0]?.trim() ?? 'All seasons' },
          ].map((item, i) => (
            <div key={item.label} style={{ padding: '1.75rem 1.5rem', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border-soft)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '0.5rem' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FULL DESCRIPTION ══════════════════════════════ */}
      <ProductDescription product={product} />

      {/* ══ CUSTOMER REVIEWS ═══════════════════════════════ */}
      <section style={{ paddingBlock: 'clamp(4rem,8vw,6rem)', background: 'var(--bg)' }}>
        <div className="pdp-info-bar" style={{ maxWidth: '1100px', marginInline: 'auto', padding: '0 var(--page-pad)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ ...EB, marginBottom: '0.5rem' }}>Community</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.05 }}>
                Customer Reviews
              </h3>
            </div>
            <button
              type="button"
              onClick={openReviewModal}
              style={{
                padding: '0.65rem 1.5rem',
                background: 'var(--gold-dark)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                cursor: 'pointer',
              }}
            >
              Write a Review
            </button>
          </div>

          {/* Stats summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 700, color: 'var(--gold-dark)', lineHeight: 1 }}>
              {stats.average ? stats.average.toFixed(1) : '—'}
            </div>
            <div>
              <div style={{ color: 'var(--gold-dark)', fontSize: '1.1rem', letterSpacing: '0.1em' }}>
                {'★'.repeat(Math.round(stats.average || 0))}
                <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - Math.round(stats.average || 0))}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {stats.count} {stats.count === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>

          {/* Reviews list */}
          {reviewsLoading ? (
            <div style={{ padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading reviews…</div>
          ) : reviews.length === 0 ? (
            <div style={{
              padding: '2.5rem',
              border: '1px dashed var(--border)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'var(--text-mid)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No reviews yet</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)' }}>Be the first to share your experience with this fragrance.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {reviews.map((r) => (
                <div key={r.id} style={{
                  background: '#fff',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '14px',
                  padding: '1.5rem 1.75rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ color: 'var(--gold-dark)', fontSize: '1.05rem', letterSpacing: '0.08em' }}>
                      {'★'.repeat(r.rating)}<span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - r.rating)}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {r.title && (
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.35rem' }}>
                      {r.title}
                    </div>
                  )}
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
                    {r.body}
                  </p>
                  <div style={{ marginTop: '0.85rem', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                    — {r.author}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ OTHER LISTED PRODUCTS ═════════════════════════ */}
      <OtherProductsSection currentProduct={product} />

      {/* ─── REVIEW SUBMISSION MODAL ───────────────────────────── */}
      {showReviewModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div className="avoro-review-modal" style={{
            background: '#fff', width: '100%', maxWidth: '460px',
            borderRadius: '16px', padding: '2rem', border: '1px solid var(--border-soft)',
          }}>
            {reviewSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>✦</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)' }}>Thank you!</div>
                <p style={{ color: 'var(--text-mid)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Your review has been submitted and will appear once approved.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)' }}>
                    Write a Review
                  </div>
                  <button onClick={() => setShowReviewModal(false)} style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>✕</button>
                </div>

                <form onSubmit={handleReviewSubmit}>
                  {/* Rating */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ ...EB, marginBottom: '0.5rem' }}>Your Rating</div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {[1,2,3,4,5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                          style={{
                            fontSize: '1.6rem',
                            color: n <= reviewForm.rating ? 'var(--gold-dark)' : 'var(--border)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title (optional) */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ ...EB, marginBottom: '0.4rem' }}>Title (optional)</div>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="One line summary"
                      style={{
                        width: '100%', padding: '0.65rem 0.85rem',
                        border: '1px solid var(--border)', borderRadius: '8px',
                        fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--text)',
                      }}
                    />
                  </div>

                  {/* Body */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ ...EB, marginBottom: '0.4rem' }}>Your Review</div>
                    <textarea
                      required
                      rows={4}
                      value={reviewForm.body}
                      onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                      placeholder="Share your experience with this fragrance…"
                      style={{
                        width: '100%', padding: '0.75rem 0.9rem',
                        border: '1px solid var(--border)', borderRadius: '8px',
                        fontFamily: 'var(--font-ui)', fontSize: '0.92rem', color: 'var(--text)',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Guest fields */}
                  {!isLoggedIn && (
                    <div className="avoro-form-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <div style={{ ...EB, marginBottom: '0.4rem' }}>Your Name</div>
                        <input
                          required
                          type="text"
                          value={reviewForm.guestName}
                          onChange={e => setReviewForm(f => ({ ...f, guestName: e.target.value }))}
                          style={{
                            width: '100%', padding: '0.6rem 0.85rem',
                            border: '1px solid var(--border)', borderRadius: '8px',
                            fontFamily: 'var(--font-ui)', fontSize: '0.9rem',
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ ...EB, marginBottom: '0.4rem' }}>Email</div>
                        <input
                          required
                          type="email"
                          value={reviewForm.guestEmail}
                          onChange={e => setReviewForm(f => ({ ...f, guestEmail: e.target.value }))}
                          style={{
                            width: '100%', padding: '0.6rem 0.85rem',
                            border: '1px solid var(--border)', borderRadius: '8px',
                            fontFamily: 'var(--font-ui)', fontSize: '0.9rem',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !reviewForm.body.trim()}
                    style={{
                      width: '100%', padding: '0.85rem',
                      background: submitting ? '#ccc' : 'var(--gold-dark)',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 700,
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>

                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.85rem', textAlign: 'center' }}>
                    Reviews are moderated and will appear once approved.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .pdp-hero { background: var(--bg); }
        .other-product-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(184,146,74,0.15) !important; }
        @media (max-width: 900px) {
          .pdp-hero-container { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .pdp-info-bar { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .pdp-hero-container { gap: 2rem !important; }
          .pdp-info-bar { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </div>
  );
}

/* ─── Other Listed Products Section ─────────────────── */
function OtherProductsSection({ currentProduct }: { currentProduct: Product }) {
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    getProducts()
      .then((prods) => {
        if (mounted) {
          const filtered = prods.filter(
            (p) => p.id !== currentProduct.id && p.slug !== currentProduct.slug
          );
          setOtherProducts(filtered);
        }
      })
      .catch(() => {
        if (mounted) setOtherProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [currentProduct.id, currentProduct.slug]);

  const handleQuickAdd = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const v = p.variants.find((variant) => (variant.stock || 0) > 0) || p.variants[0];
    if (!v) return;
    addItem(
      {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image: p.images?.[0] ?? '',
        size: v.size,
        price: v.price,
        sku: v.sku,
      },
      1
    );
    setAddedMap((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [p.id]: false }));
    }, 2000);
  };

  if (!loading && otherProducts.length === 0) return null;

  return (
    <section
      style={{
        paddingBlock: 'clamp(4rem, 8vw, 6rem)',
        background: 'var(--bg-soft)',
        borderTop: '1px solid var(--border-soft)',
      }}
    >
      <div style={{ maxWidth: '1100px', marginInline: 'auto', padding: '0 var(--page-pad)' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ ...EB, marginBottom: '0.5rem' }}>EXPLORE COLLECTION</div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.1,
              marginBottom: '0.75rem',
            }}
          >
            Other Listed Fragrances
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.9rem',
              color: 'var(--text-mid)',
              maxWidth: '540px',
              marginInline: 'auto',
              lineHeight: 1.6,
            }}
          >
            Discover our other handcrafted signature perfumes crafted for distinct moods and unforgettable impressions.
          </p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Loading fragrances…
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {otherProducts.map((p) => {
              const minVariant = p.variants.length
                ? p.variants.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), p.variants[0])
                : undefined;
              const minPrice = minVariant ? minVariant.price : 0;
              const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
              const isOos = totalStock === 0;
              const isAdded = !!addedMap[p.id];

              return (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                  }}
                  className="other-product-card"
                >
                  <Link href={`/product/${p.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    {/* Image Area */}
                    <div
                      style={{
                        position: 'relative',
                        height: '260px',
                        background: 'linear-gradient(135deg, var(--bg-soft) 0%, #ede5da 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {p.images?.[0] ? (
                        <div style={{ position: 'relative', width: '65%', height: '85%' }}>
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            sizes="300px"
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '45%',
                            aspectRatio: '1/2.5',
                            background:
                              'linear-gradient(160deg,rgba(212,175,136,0.15),rgba(201,149,138,0.08))',
                            borderRadius: '30% 30% 20% 20%',
                          }}
                        />
                      )}

                      {/* Category Badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          left: '1rem',
                          background: 'rgba(255,255,255,0.85)',
                          backdropFilter: 'blur(4px)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '20px',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--gold-dark)',
                          border: '1px solid rgba(184,146,74,0.2)',
                        }}
                      >
                        {p.category}
                      </span>

                      {isOos && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(200,60,50,0.9)',
                            color: '#fff',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.58rem',
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                          }}
                        >
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                      <h4
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.35rem',
                          fontWeight: 600,
                          color: 'var(--text)',
                          lineHeight: 1.2,
                          marginBottom: '0.4rem',
                        }}
                      >
                        {p.name}
                      </h4>
                      {p.notes && p.notes.length > 0 && (
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.78rem',
                            color: 'var(--text-soft)',
                            marginBottom: '1rem',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {p.notes.slice(0, 3).join(' · ')}
                        </p>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '1rem',
                        }}
                      >
                        <PriceTag price={minPrice} originalPrice={minVariant?.originalPrice} size="sm" showDecimals={true} />
                        <span
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.72rem',
                            color: 'var(--text-soft)',
                          }}
                        >
                          50ml EDP
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Actions */}
                  <div
                    style={{
                      padding: '0 1.5rem 1.5rem',
                      display: 'flex',
                      gap: '0.6rem',
                    }}
                  >
                    <button
                      type="button"
                      disabled={isOos}
                      onClick={(e) => handleQuickAdd(e, p)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.75rem',
                        background: isOos ? '#eee' : isAdded ? '#2d7a4f' : 'var(--gold-dark)',
                        color: isOos ? '#999' : '#fff',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isOos ? 'not-allowed' : 'pointer',
                        transition: 'background 0.3s',
                      }}
                    >
                      {isOos ? 'Out of Stock' : isAdded ? '✓ Added' : 'Quick Add'}
                    </button>
                    <Link
                      href={`/product/${p.slug}`}
                      style={{
                        padding: '0.65rem 1rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--text-mid)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
