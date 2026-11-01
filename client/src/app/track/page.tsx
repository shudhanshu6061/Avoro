'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.62rem',
  fontWeight: 500,
  letterSpacing: '0.25em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark)',
};

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('orderId') || searchParams.get('order') || searchParams.get('awb') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  const fetchTracking = async (searchStr: string) => {
    const q = searchStr.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch(`/api/shipping/orders/${encodeURIComponent(q)}/track`);
      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || 'Order or tracking information not found.');
      }

      setData(resData);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch tracking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(query);
  };

  // Calculate status step
  const getStatusStep = (status?: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED') return 4;
    if (s === 'SHIPPED' || s === 'IN TRANSIT' || s === 'DISPATCHED') return 3;
    if (s === 'PROCESSING' || s === 'READY_TO_SHIP' || s === 'PICKUP GENERATED') return 2;
    if (s === 'PENDING' || s === 'PLACED') return 1;
    return 1;
  };

  const currentStep = getStatusStep(data?.order?.status || data?.status);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '85vh', paddingBlock: 'clamp(3rem, 6vw, 5rem)' }}>
      <div className="lumina-container" style={{ maxWidth: '800px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ ...EB, marginBottom: '0.5rem' }}>Shipment Status</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: 'var(--text)', lineHeight: 1.15, marginBottom: '0.75rem' }}>
            Track Your Order
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--text-soft)', fontWeight: 300, maxWidth: '480px', marginInline: 'auto' }}>
            Enter your AVORO Order Number (e.g. AVO260717001) or AWB Tracking Code below to check real-time delivery status.
          </p>
        </div>

        {/* Search Form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', marginBottom: '2.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              required
              placeholder="Enter Order Number or AWB Code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '0.85rem 1.15rem',
                background: 'var(--bg)',
                border: '1.5px solid var(--border-dark)',
                borderRadius: '6px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem',
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--gold-dark)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-dark)'; }}
            />
            <button
              type="submit"
              disabled={loading}
              className="lumina-btn-gold"
              style={{ padding: '0.85rem 2rem', fontSize: '0.7rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? 'Searching...' : 'Track Package'}
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ background: 'rgba(200, 74, 60, 0.06)', border: '1px solid rgba(200, 74, 60, 0.2)', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: '#c84a3c', fontWeight: 500, marginBottom: '0.35rem' }}>
              {error}
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
              Need help? Check your email for the order confirmation or <Link href="/contact" style={{ color: 'var(--gold-dark)', textDecoration: 'underline' }}>contact support</Link>.
            </p>
          </div>
        )}

        {/* Tracking Details */}
        {data && data.order && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            
            {/* Header info */}
            <div style={{ padding: '1.75rem', background: 'linear-gradient(135deg, var(--bg-soft) 0%, #ede5da 100%)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ ...EB, marginBottom: '0.25rem' }}>Order Details</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--text)' }}>
                  {data.order.orderNumber}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Placed on {new Date(data.order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.35rem 0.9rem',
                  borderRadius: '20px',
                  background: data.order.status === 'DELIVERED' ? 'rgba(45,122,79,0.15)' : 'rgba(184,146,74,0.18)',
                  color: data.order.status === 'DELIVERED' ? '#2d7a4f' : 'var(--gold-dark)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                }}>
                  {data.order.status}
                </span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gold-dark)', marginTop: '0.4rem' }}>
                  ₹{data.order.totalPrice?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Visual Timeline Bar */}
            <div style={{ padding: '2rem 1.75rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Connecting Line */}
                <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '3px', background: 'var(--border)', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '14px', left: '10%', width: `${(Math.max(1, currentStep) - 1) * 33.33}%`, height: '3px', background: 'var(--gold-dark)', zIndex: 1, transition: 'width 0.5s ease' }} />

                {[
                  { step: 1, title: 'Order Confirmed', sub: 'Received' },
                  { step: 2, title: 'Processing',      sub: 'Packed' },
                  { step: 3, title: 'Out For Delivery', sub: 'In Transit' },
                  { step: 4, title: 'Delivered',        sub: 'Handed Over' },
                ].map((st) => {
                  const isActive = currentStep >= st.step;
                  return (
                    <div key={st.step} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: isActive ? 'var(--gold-dark)' : 'var(--bg-card)',
                        border: `2px solid ${isActive ? 'var(--gold-dark)' : 'var(--border-dark)'}`,
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600,
                        boxShadow: isActive ? '0 0 10px rgba(184,146,74,0.3)' : 'none',
                        transition: 'all 0.3s ease',
                      }}>
                        {isActive ? '✓' : st.step}
                      </div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text)' : 'var(--text-muted)', marginTop: '0.6rem' }}>
                        {st.title}
                      </div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--text-soft)' }}>
                        {st.sub}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier & Shipping Link Box */}
            <div style={{ padding: '1.5rem 1.75rem', background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                  Courier Details
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500, marginTop: '0.2rem' }}>
                  {data.order.shiprocketCourierName || 'Shiprocket Courier Partner'}
                </div>
                {data.order.shiprocketAwbCode && (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '0.1rem' }}>
                    AWB Code: <strong style={{ color: 'var(--text)' }}>{data.order.shiprocketAwbCode}</strong>
                  </div>
                )}
              </div>

              {data.order.shiprocketTrackingUrl && (
                <a
                  href={data.order.shiprocketTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lumina-btn-gold"
                  style={{ fontSize: '0.65rem', padding: '0.6rem 1.25rem' }}
                >
                  Live Courier Tracking ↗
                </a>
              )}
            </div>

            {/* Items Summary */}
            <div style={{ padding: '1.5rem 1.75rem' }}>
              <div style={{ ...EB, marginBottom: '0.75rem' }}>Items in Package</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.order.items?.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: '0.5rem', borderBottom: idx < data.order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Size: {item.size} · Quantity: {item.quantity}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Back Link */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link href="/account/profile?tab=orders" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--text-soft)', textDecoration: 'none' }}>
            ← View All Orders in Account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div style={{ background: 'var(--bg)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
        Loading tracking...
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
