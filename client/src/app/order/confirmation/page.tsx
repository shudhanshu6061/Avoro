import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Order Confirmed — AVORO',
  description: 'Your AVORO order has been placed. Thank you.',
};

const STEPS = [
  { icon: '✓', label: 'Order Placed',      sub: 'Just now' },
  { icon: '◎', label: 'Being Prepared',    sub: '1–2 days' },
  { icon: '⬡', label: 'Out for Delivery',  sub: '3–5 days' },
  { icon: '⌂', label: 'Delivered',         sub: '5–7 days' },
];

export default function OrderConfirmationPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center' }}>
      <div className="lumina-container" style={{ paddingBlock: 'clamp(3rem,8vw,6rem)' }}>
        <div style={{ maxWidth: '640px', marginInline: 'auto', textAlign: 'center' }}>

          {/* Checkmark */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--gold-dark),var(--gold-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginInline: 'auto', marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(184,146,74,0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          {/* Eyebrow */}
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '1rem' }}>
            Order Confirmed
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Thank you for your order.
          </h1>

          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--gold-dark)', marginBottom: '1.5rem' }}>
            The memory of your presence begins here.
          </p>

          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--text-soft)', lineHeight: 1.9, marginBottom: '3rem', fontWeight: 300 }}>
            A confirmation has been sent to your email. Our team will carefully prepare your fragrance and dispatch it within 1–2 business days.
          </p>

          {/* Order tracking visual */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '2rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '1.75rem' }}>
              Estimated Delivery Timeline
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
              {/* Connector line */}
              <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '1.5px', background: 'linear-gradient(to right,var(--gold-dark) 25%,var(--border) 25%)' }} />
              {STEPS.map((step, i) => (
                <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', flex: 1, position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: i === 0 ? 'var(--gold-dark)' : 'var(--bg-soft)',
                    border: `2px solid ${i === 0 ? 'var(--gold-dark)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-ui)', fontSize: i === 0 ? '0.75rem' : '0.85rem',
                    color: i === 0 ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: i === 0 ? 600 : 400, color: i === 0 ? 'var(--text)' : 'var(--text-muted)' }}>{step.label}</div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/collection" className="lumina-btn-gold">Continue Shopping</Link>
            <Link href="/account/profile" className="lumina-btn-ghost">View My Account</Link>
          </div>

          {/* Bottom note */}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2.5rem', lineHeight: 1.8 }}>
            Questions about your order? <Link href="/contact" style={{ color: 'var(--gold-dark)' }}>Contact our team</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
