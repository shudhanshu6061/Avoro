'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import PriceTag from '@/components/ui/PriceTag';
import { formatSizeLabel } from '@/types/product';

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.62rem',
  fontWeight: 500,
  letterSpacing: '0.25em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark)',
};

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '0.9rem 1.1rem',
  background: 'var(--bg)',
  border: '1.5px solid var(--border-dark)',
  borderRadius: '4px',
  fontFamily: 'var(--font-ui)',
  fontSize: '0.88rem',
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { user, isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [discount, setDiscount] = useState<{ code: string; type: string; value: number; discountAmount: number; description?: string } | null>(null);
  const [promoError, setPromoError] = useState('');

  const [deliverySettings, setDeliverySettings] = useState({
    freeShippingEnabled: true,
    freeThreshold: 2999,
    standardPrice: 299,
    standardDays: '5–7 business days',
    expressEnabled: true,
    expressPrice: 599,
    expressDays: '2–3 business days',
    codEnabled: false,
    codCharge: 0,
    taxRate: 0,
  });
  const [selectedShipping, setSelectedShipping] = useState('standard');

  useEffect(() => {
    fetch('/api/settings/public').then(r => r.json()).then(data => {
      setDeliverySettings({
        freeShippingEnabled: data.free_shipping_enabled !== 'false',
        freeThreshold: Number(data.free_shipping_threshold) || 2999,
        standardPrice: Number(data.standard_shipping_price) || 299,
        standardDays: data.standard_shipping_days || '5–7 business days',
        expressEnabled: data.express_enabled === 'true',
        expressPrice: Number(data.express_shipping_price) || 599,
        expressDays: data.express_shipping_days || '2–3 business days',
        codEnabled: data.cod_enabled === 'true',
        codCharge: Number(data.cod_charge) || 0,
        taxRate: Number(data.tax_rate) || 0,
      });
    }).catch(() => {});
  }, []);

  const cartTotal = total();
  const freeShipping = deliverySettings.freeShippingEnabled && cartTotal >= deliverySettings.freeThreshold;
  const shippingPrice = selectedShipping === 'express' ? deliverySettings.expressPrice : deliverySettings.standardPrice;
  const shipping = (selectedShipping === 'standard' && freeShipping) ? 0 : shippingPrice;
  const discountAmount = discount?.discountAmount || 0;
  const taxAmount = deliverySettings.taxRate > 0 ? Math.round((cartTotal - discountAmount) * deliverySettings.taxRate / 100) : 0;
  const grandTotal = cartTotal + shipping - discountAmount + taxAmount;

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: promoCode, orderTotal: cartTotal }),
      });
      const data = await res.json();
      if (!res.ok) { setPromoError(data.message); setDiscount(null); }
      else { setDiscount(data); setPromoError(''); }
    } catch { setPromoError('Failed to validate code'); }
    finally { setPromoLoading(false); }
  };

  const removePromo = () => { setDiscount(null); setPromoCode(''); setPromoError(''); };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = 'var(--gold-dark)';
    (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(184,146,74,0.1)';
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = 'var(--border-dark)';
    (e.target as HTMLElement).style.boxShadow = 'none';
  };

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise(resolve => {
      if (document.getElementById('razorpay-script')) { resolve(true); return; }
      const s = document.createElement('script');
      s.id  = 'razorpay-script';
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const [savedAddress, setSavedAddress] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // capture before any await — React nullifies after sync return
    if (step === 'shipping') {
      // Save address values before switching steps (fields will unmount)
      setSavedAddress({
        fullName:   (form.querySelector('[name="name"]')    as HTMLInputElement)?.value ?? '',
        email:      (form.querySelector('[name="email"]')   as HTMLInputElement)?.value ?? '',
        phone:      (form.querySelector('[name="phone"]')   as HTMLInputElement)?.value ?? '',
        address:    (form.querySelector('[name="address"]') as HTMLInputElement)?.value ?? '',
        city:       (form.querySelector('[name="city"]')    as HTMLInputElement)?.value ?? '',
        postalCode: (form.querySelector('[name="postal"]')  as HTMLInputElement)?.value ?? '',
        state:      (form.querySelector('[name="state"]')   as HTMLSelectElement)?.value ?? '',
      });
      setStep('payment');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Razorpay order on server
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: grandTotal }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create order');

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay failed to load. Check your connection.');

      // 4. Open Razorpay checkout modal
      const options = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'AVORO',
        description: 'Luxury Fragrance Order',
        order_id:    orderData.orderId,
        prefill: {
          name:    savedAddress.fullName || '',
          email:   savedAddress.email || '',
          contact: savedAddress.phone || '',
        },
        theme: { color: '#B8924A' },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify payment signature on server
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.verified) {
            throw new Error('Payment verification failed. Please contact support.');
          }

          const saveRes = await fetch('/api/orders/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id:   response.razorpay_order_id,
              items: items.map(i => ({
                productId: i.productId,
                name:      i.name,
                size:      i.size,
                quantity:  i.quantity,
                price:     i.price,
              })),
              shippingAddress: savedAddress,
              itemsPrice:   cartTotal,
              shippingPrice: shipping,
              taxPrice:     taxAmount,
              totalPrice:   grandTotal,
            }),
          });

          clearCart();
          router.push('/order/confirmation');
        },
      };

      // @ts-expect-error Razorpay loaded via CDN script
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(false);
    }
  };

  // Gate: require login before checkout (like Flipkart/Amazon)
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px', padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--border-soft)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
            Login Required
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Please login or create an account to proceed with your order. This helps us track your orders and provide a better experience.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/account?redirect=/checkout" className="lumina-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.75rem' }}>
              Login to Continue
            </Link>
            <Link href="/account?redirect=/checkout" className="lumina-btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.75rem' }}>
              Create an Account
            </Link>
          </div>
          <Link href="/collection" style={{ display: 'inline-block', marginTop: '1.5rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '1.25rem', opacity: 0.2 }}>🛍</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem' }}>Your cart is empty</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--text-soft)', marginBottom: '2rem', lineHeight: 1.8 }}>
            Add a fragrance to your cart before checking out.
          </p>
          <Link href="/collection" className="lumina-btn-gold">Explore Collection</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top bar ───────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-soft)', paddingBlock: '1rem' }}>
        <div className="lumina-container avoro-checkout-topbar-inner">
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 600, letterSpacing: '0.18em', color: 'var(--text)' }}>AVORO</Link>
          {/* Step indicator */}
          <div className="avoro-checkout-steps" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {(['shipping', 'payment'] as const).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {i > 0 && <div style={{ width: '32px', height: '1px', background: step === 'payment' ? 'var(--gold-dark)' : 'var(--border)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: step === s || (s === 'shipping' && step === 'payment') ? 'var(--gold-dark)' : 'var(--border)',
                    color: step === s || (s === 'shipping' && step === 'payment') ? '#fff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 600,
                    transition: 'all 0.3s',
                  }}>{i + 1}</div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: step === s ? 500 : 400, color: step === s ? 'var(--text)' : 'var(--text-muted)', textTransform: 'capitalize' as const }}>{s}</span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/collection" className="avoro-checkout-back" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>← Continue shopping</Link>
        </div>
      </div>

      {/* ── Main split layout ─────────────────────── */}
      <div className="lumina-container" style={{ paddingBlock: 'clamp(2.5rem,5vw,4rem)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '2rem',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          Checkout
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '3.5rem', alignItems: 'start' }} className="avoro-checkout-grid">

          {/* ── LEFT: Form ── */}
          <div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {step === 'shipping' && (
                <>
                  <div>
                    <div style={{ ...EB, marginBottom: '1.25rem' }}>Contact Information</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <Field label="Full Name">
                        <input required name="name" defaultValue={user ? `${user.firstName} ${user.lastName}` : ''} placeholder="Aryan Sharma" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                      </Field>
                      <Field label="Email Address">
                        <input required type="email" name="email" defaultValue={user?.email ?? ''} placeholder="you@example.com" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                      </Field>
                      <Field label="Phone Number">
                        <input required type="tel" name="phone" placeholder="+91 98765 43210" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                      </Field>
                    </div>
                  </div>

                  <div>
                    <div style={{ ...EB, marginBottom: '1.25rem' }}>Shipping Address</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <Field label="Street Address">
                        <input required name="address" placeholder="123, MG Road, Flat 4B" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                      </Field>
                      <div className="avoro-form-grid-2">
                        <Field label="City">
                          <input required name="city" placeholder="Mumbai" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                        </Field>
                        <Field label="Postal Code">
                          <input required name="postal" placeholder="400001" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                        </Field>
                      </div>
                      <Field label="State">
                        <select required name="state" style={{ ...INPUT, appearance: 'none' }} onFocus={focusStyle} onBlur={blurStyle}>
                          <option value="">Select state</option>
                          {['Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat','Rajasthan','West Bengal','Telangana','Kerala','Uttar Pradesh','Punjab','Haryana'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>

                  {/* Shipping method */}
                  <div>
                    <div style={{ ...EB, marginBottom: '1.25rem' }}>Delivery Method</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { id: 'standard', label: 'Standard Delivery', sub: deliverySettings.standardDays, price: freeShipping ? 'Free' : `₹${deliverySettings.standardPrice}`, show: true },
                        { id: 'express',  label: 'Express Delivery',  sub: deliverySettings.expressDays, price: `₹${deliverySettings.expressPrice}`, show: deliverySettings.expressEnabled },
                      ].filter(o => o.show).map(opt => (
                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', border: `1.5px solid ${selectedShipping === opt.id ? 'var(--gold-dark)' : 'var(--border-soft)'}`, borderRadius: '6px', cursor: 'pointer', transition: 'border-color 0.2s', background: 'var(--bg-card)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-dark)'}
                          onMouseLeave={e => { if (selectedShipping !== opt.id) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)'; }}>
                          <input type="radio" name="shipping" value={opt.id} checked={selectedShipping === opt.id} onChange={() => setSelectedShipping(opt.id)} style={{ accentColor: 'var(--gold-dark)', width: '16px', height: '16px' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)' }}>{opt.label}</div>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{opt.sub}</div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: opt.id === 'standard' && freeShipping ? '#2d7a4f' : 'var(--gold-dark)', fontWeight: 500 }}>{opt.price}</div>
                        </label>
                      ))}
                    </div>
                    {freeShipping && selectedShipping === 'standard' && (
                      <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(45,122,79,0.06)', borderRadius: '4px', border: '1px solid rgba(45,122,79,0.15)' }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: '#2d7a4f' }}>🎉 Your order qualifies for free standard delivery!</span>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="lumina-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '0.72rem' }}>
                    Continue to Payment →
                  </button>
                </>
              )}

              {step === 'payment' && (
                <>
                  {/* Back */}
                  <button type="button" onClick={() => setStep('shipping')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-soft)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '0.5rem' }}>
                    ← Back to Shipping
                  </button>

                  <div>
                    <div style={{ ...EB, marginBottom: '1.25rem' }}>Payment Details</div>

                    {/* Razorpay info box */}
                    <div style={{ background: 'linear-gradient(135deg,#1a1209 0%,#2a1c0e 100%)', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%,rgba(212,175,136,0.12) 0%,transparent 65%)' }} />
                      <div style={{ position: 'relative' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#f5ede2', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>AVORO</div>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(245,237,226,0.55)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                          Powered by <strong style={{ color: 'rgba(245,237,226,0.75)' }}>Razorpay</strong> — India&apos;s most trusted payment gateway.
                          <br />Pay via Card · UPI · Net Banking · Wallets.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                          {['💳 Cards', '⚡ UPI', '🏦 Net Banking', '📱 Wallets'].map(m => (
                            <span key={m} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'rgba(245,237,226,0.45)', padding: '0.3rem 0.75rem', border: '1px solid rgba(212,175,136,0.2)', borderRadius: '20px' }}>{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security note */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', background: 'var(--bg-soft)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '1rem' }}>🔒</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>
                      Your payment information is encrypted and secure. We never store card details.
                    </span>
                  </div>

                  <button type="submit" disabled={loading} className="lumina-btn-gold"
                    style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '0.72rem', opacity: loading ? 0.75 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                    {loading ? 'Processing…' : `Place Order · ₹${grandTotal.toLocaleString('en-IN')}`}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* ── RIGHT: Order summary ── */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 5rem)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>

              {/* Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...EB }}>Order Summary</div>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s,i) => s+i.quantity,0) !== 1 ? 's' : ''}</span>
              </div>

              {/* Items */}
              <div style={{ padding: '0.75rem 1.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                {items.map(item => (
                  <div key={item.sku} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBlock: '0.85rem', borderBottom: '1px solid var(--border)' }}>
                    {/* Product thumb */}
                    <div style={{ width: '52px', height: '68px', borderRadius: '4px', background: 'var(--bg-soft)', flexShrink: 0, border: '1px solid var(--border-soft)', position: 'relative' }}>
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="52px"
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--bg-soft),#ede5da)', borderRadius: '4px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', opacity: 0.3 }}>✦</span>
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gold-dark)', color: '#fff', fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>{item.quantity}</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{formatSizeLabel(item.size)}</div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <PriceTag
                        price={item.price * item.quantity}
                        originalPrice={item.originalPrice ? item.originalPrice * item.quantity : undefined}
                        size="xs"
                        showDecimals={true}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
                {discount ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(45,122,79,0.06)', borderRadius: '4px', border: '1px solid rgba(45,122,79,0.15)' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 600, color: '#2d7a4f' }}>🎉 {discount.code}</span>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: '#2d7a4f', marginLeft: '0.5rem' }}>
                        {discount.type === 'PERCENTAGE' ? `${discount.value}% off` : `₹${discount.value} off`}
                      </span>
                    </div>
                    <button onClick={removePromo} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}>✕</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Promo code"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } }}
                        style={{ ...INPUT, padding: '0.65rem 0.85rem', fontSize: '0.8rem', flex: 1 }}
                      />
                      <button type="button" onClick={applyPromo} disabled={promoLoading}
                        style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '0.65rem 1rem', background: 'var(--gold-dark)', color: '#fff', border: 'none', borderRadius: '4px', cursor: promoLoading ? 'wait' : 'pointer', opacity: promoLoading ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                        {promoLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: '#c0392b', marginTop: '0.4rem' }}>{promoError}</p>}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text-soft)' }}>Subtotal</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text-soft)' }}>
                    Shipping {selectedShipping === 'express' ? '(Express)' : '(Standard)'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: shipping === 0 ? '#2d7a4f' : 'var(--text)' }}>
                    {shipping === 0 ? 'Free' : `₹${shipping}`}
                  </span>
                </div>
                {discount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#2d7a4f' }}>Discount ({discount.code})</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#2d7a4f', fontWeight: 500 }}>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text-soft)' }}>Tax ({deliverySettings.taxRate}%)</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text)' }}>₹{taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {deliverySettings.freeShippingEnabled && !freeShipping && selectedShipping === 'standard' && (
                  <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(45,122,79,0.06)', borderRadius: '4px', border: '1px solid rgba(45,122,79,0.15)' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: '#2d7a4f' }}>
                      Add ₹{(deliverySettings.freeThreshold - cartTotal).toLocaleString('en-IN')} more for free shipping
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', marginTop: '0.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                {['🔒 Secure', '📦 Tracked', '↩ Easy Returns'].map(b => (
                  <span key={b} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .avoro-checkout-grid { grid-template-columns: 1fr !important; }
          .avoro-checkout-grid > div:last-child { position: static !important; }
        }
      ` }} />
    </div>
  );
}
