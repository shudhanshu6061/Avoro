'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import CustomerDetailsModal from '@/components/auth/CustomerDetailsModal';

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.62rem',
  fontWeight: 500,
  letterSpacing: '0.25em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark)',
};

const QUICK_LINKS = [
  { icon: '🛍', label: 'Shop Collection',    href: '/collection' },
  { icon: '📖', label: 'Read the Journal',   href: '/journal' },
  { icon: '📦', label: 'Track Your Order',   href: '/track' },
  { icon: '✉️', label: 'Contact Support',    href: '/contact' },
];

export default function ProfilePage() {
  const router   = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, logout, updateUser } = useAuthStore();
  const { items, total, count }      = useCartStore();
  const cartCount = count();
  const cartTotal = total();

  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab,  setActiveTab]  = useState<'overview' | 'orders' | 'settings'>(() => {
    const tab = searchParams.get('tab') as 'overview' | 'orders' | 'settings';
    return tab || 'overview';
  });
  const [orders,     setOrders]     = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Customer Details Modal for first-time / incomplete profile users
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Profile Settings form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName]   = useState(user?.lastName || '');
  const [email, setEmail]         = useState(user?.email || '');
  const [phone, setPhone]         = useState(user?.phone || '');
  const [saving, setSaving]       = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError]     = useState('');

  // Synchronize user profile from backend on mount
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/auth/me', { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.id) {
            updateUser({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
            });
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn, updateUser]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');

      const isDefaultEmail = user.email?.startsWith('user_') && user.email?.endsWith('@avoro.in');
      const isDefaultName = user.firstName === 'Customer';
      if (isDefaultEmail || isDefaultName) {
        setShowDetailsModal(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) router.replace('/account');
  }, [isLoggedIn, router]);

  useEffect(() => {
    const tab = searchParams.get('tab') as 'overview' | 'orders' | 'settings';
    if (tab && ['overview', 'orders', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'orders' && isLoggedIn) {
      setOrdersLoading(true);
      fetch('/api/orders/my', { credentials: 'include' })
        .then(r => r.json())
        .then(data => { setOrders(Array.isArray(data) ? data : []); })
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, isLoggedIn]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setSaveError('Please enter your first name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSaveError('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile details.');

      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      });

      setSaveSuccess('Profile updated successfully!');
    } catch (err: any) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const fullName  = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';


  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Profile hero bar ──────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,var(--bg-soft) 0%,#ede5da 100%)',
        borderBottom: '1px solid var(--border)',
        paddingBlock: 'clamp(2.5rem,5vw,4rem)',
      }}>
        <div className="lumina-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--gold-dark),var(--gold-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 20px rgba(184,146,74,0.3)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, color: '#fff' }}>{initials}</span>
            </div>

            {/* Name & email */}
            <div style={{ flex: 1 }}>
              <div style={{ ...EB, marginBottom: '0.4rem' }}>My Account</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '0.35rem' }}>
                {fullName}
              </h1>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text-soft)', fontWeight: 300 }}>{user.email}</p>
              {user.role === 'ADMIN' && (
                <span style={{ ...EB, marginTop: '0.5rem', display: 'inline-block', background: 'var(--gold-pale)', padding: '0.2rem 0.6rem', borderRadius: '20px', color: 'var(--gold-dark)' }}>Admin</span>
              )}
            </div>

            {/* Logout */}
            <button type="button" onClick={handleLogout} disabled={loggingOut}
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                color: 'var(--text-soft)', background: 'var(--bg-card)',
                border: '1.5px solid var(--border-dark)', borderRadius: '4px',
                padding: '0.65rem 1.5rem', cursor: loggingOut ? 'wait' : 'pointer',
                transition: 'all 0.2s', opacity: loggingOut ? 0.6 : 1,
                flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#c84a3c'; (e.currentTarget as HTMLElement).style.color = '#c84a3c'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-dark)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-soft)'; }}>
              {loggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab navigation ────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="lumina-container" style={{ display: 'flex', gap: '0' }}>
          {(['overview', 'orders', 'settings'] as const).map(tab => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: activeTab === tab ? 500 : 400,
                letterSpacing: '0.08em', textTransform: 'capitalize' as const,
                color: activeTab === tab ? 'var(--gold-dark)' : 'var(--text-soft)',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '1.1rem 1.75rem 1rem',
                borderBottom: activeTab === tab ? '2px solid var(--gold-dark)' : '2px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
                marginBottom: '-1px',
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ───────────────────────────── */}
      <div className="lumina-container" style={{ paddingBlock: 'clamp(2.5rem,5vw,4.5rem)' }}>

        {/* ─ Overview tab ─ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

            {/* Welcome card */}
            <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg,#1a1209 0%,#2a1c0e 100%)', borderRadius: '8px', padding: 'clamp(2rem,4vw,3rem)', position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%,rgba(212,175,136,0.12) 0%,transparent 65%)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'var(--gold)', letterSpacing: '0.25em', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>Welcome back</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.4rem)', fontWeight: 600, color: '#f5ede2', lineHeight: 1.1, marginBottom: '0.65rem' }}>
                  Good to see you, {user.firstName}.
                </h2>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'rgba(245,237,226,0.5)', fontWeight: 300, lineHeight: 1.8 }}>
                  Your AVORO account is active. Explore new arrivals or check your cart.
                </p>
              </div>
            </div>

            {/* Cart summary card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ ...EB, marginBottom: '1rem' }}>Cart Summary</div>
              {cartCount === 0 ? (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '1.25rem' }}>Your cart is empty.</p>
              ) : (
                <div style={{ marginBottom: '1.25rem' }}>
                  {items.map(item => (
                    <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text)', fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.size} · qty {item.quantity}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--gold-dark)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--gold-dark)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
              <Link href="/collection" className="lumina-btn-gold" style={{ display: 'block', textAlign: 'center', fontSize: '0.65rem' }}>
                {cartCount > 0 ? 'Continue Shopping' : 'Explore Fragrances'}
              </Link>
            </div>

            {/* Account info card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ ...EB, marginBottom: '1rem' }}>Account Details</div>
              {[
                { label: 'Full Name',  value: fullName },
                { label: 'Email',      value: user.email },
                { label: 'Role',       value: user.role === 'ADMIN' ? 'Administrator' : 'Member' },
                { label: 'Member ID',  value: `#${user.id.slice(0, 8).toUpperCase()}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBlock: '0.6rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-soft)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
              <button type="button" onClick={() => setActiveTab('settings')}
                style={{ marginTop: '1.25rem', width: '100%', padding: '0.7rem', background: 'transparent', border: '1.5px solid var(--border-dark)', borderRadius: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-soft)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-dark)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold-dark)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-dark)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-soft)'; }}>
                Edit Details
              </button>
            </div>

            {/* Quick links card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ ...EB, marginBottom: '1rem' }}>Quick Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {QUICK_LINKS.map(ql => (
                  <Link key={ql.label} href={ql.href}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 0.85rem', borderRadius: '4px', background: 'var(--bg-soft)', transition: 'background 0.2s, transform 0.2s', cursor: 'pointer', textDecoration: 'none' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'var(--gold-pale)'; el.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'var(--bg-soft)'; el.style.transform = ''; }}>
                    <span style={{ fontSize: '1.1rem' }}>{ql.icon}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text)', fontWeight: 400 }}>{ql.label}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--gold-dark)', fontSize: '0.8rem' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─ Orders tab ─ */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ ...EB, marginBottom: '2rem' }}>Order History</div>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>Loading orders…</div>
            ) : orders.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: 'clamp(3rem,6vw,5rem)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '1.25rem', opacity: 0.25 }}>📦</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.65rem' }}>No orders yet</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'var(--text-soft)', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 300, maxWidth: '360px', marginInline: 'auto' }}>Your order history will appear here after your first purchase.</p>
                <Link href="/collection" className="lumina-btn-gold" style={{ display: 'inline-block', fontSize: '0.65rem' }}>Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {orders.map((order: any) => (
                  <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    {/* Order header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ ...EB, marginBottom: '0.25rem' }}>Order {order.orderNumber || `#${order.id.slice(0,8).toUpperCase()}`}</div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 500, padding: '0.25rem 0.75rem', borderRadius: '20px', background: order.status === 'DELIVERED' ? 'rgba(45,122,79,0.1)' : 'rgba(184,146,74,0.12)', color: order.status === 'DELIVERED' ? '#2d7a4f' : 'var(--gold-dark)', letterSpacing: '0.08em' }}>
                          {order.status}
                        </span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--gold-dark)' }}>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    {/* Order items */}
                    <div style={{ padding: '0.75rem 1.5rem' }}>
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500 }}>{item.name}</div>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.size} · qty {item.quantity}</div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: 'var(--text)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>
                    {/* Shipping & Tracking */}
                    <div style={{ padding: '0.85rem 1.5rem', background: 'var(--bg-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div><span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ship to: </span><span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text)' }}>{(order.shippingAddress as any)?.fullName}, {(order.shippingAddress as any)?.city}</span></div>
                        <div><span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payment: </span><span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#2d7a4f' }}>{order.isPaid ? 'Paid ✓' : 'Pending'}</span></div>
                        {order.shiprocketAwbCode && (
                          <div><span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>AWB: </span><span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 500 }}>{order.shiprocketAwbCode}</span></div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link href={`/track?orderId=${encodeURIComponent(order.orderNumber || order.id)}`} className="lumina-btn-gold" style={{ fontSize: '0.62rem', padding: '0.45rem 1rem' }}>
                          Track Package 📦
                        </Link>
                        {order.shiprocketTrackingUrl && (
                          <a href={order.shiprocketTrackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--gold-dark)', textDecoration: 'underline', fontWeight: 500 }}>
                            Live Courier ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─ Settings tab ─ */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '520px' }}>
            <div style={{ ...EB, marginBottom: '2rem' }}>Account Settings</div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '2rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 500, color: 'var(--text)', marginBottom: '1.25rem' }}>Profile Information</div>

              {saveSuccess && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(45,122,79,0.08)', border: '1px solid rgba(45,122,79,0.2)', borderRadius: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#2d7a4f' }}>
                  {saveSuccess}
                </div>
              )}

              {saveError && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(200,80,60,0.08)', border: '1px solid rgba(200,80,60,0.2)', borderRadius: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#c84a3c' }}>
                  {saveError}
                </div>
              )}

              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                onSubmit={handleSaveProfile}>
                <div className="avoro-form-grid-2">
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.4rem' }}>First Name</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} required
                      style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg)', border: '1.5px solid var(--border-dark)', borderRadius: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'var(--text)', outline: 'none' }}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--gold-dark)'; }}
                      onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-dark)'; }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.4rem' }}>Last Name</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg)', border: '1.5px solid var(--border-dark)', borderRadius: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'var(--text)', outline: 'none' }}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--gold-dark)'; }}
                      onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-dark)'; }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.4rem' }}>Email Address</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
                    style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg)', border: '1.5px solid var(--border-dark)', borderRadius: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'var(--text)', outline: 'none' }}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--gold-dark)'; }}
                    onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-dark)'; }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.4rem' }}>Mobile Number</label>
                  <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} type="tel" maxLength={10} required
                    style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg)', border: '1.5px solid var(--border-dark)', borderRadius: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'var(--text)', outline: 'none' }}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--gold-dark)'; }}
                    onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-dark)'; }} />
                </div>
                <button type="submit" disabled={saving} className="lumina-btn-gold" style={{ alignSelf: 'flex-start', fontSize: '0.65rem', opacity: saving ? 0.7 : 1, cursor: saving ? 'wait' : 'pointer' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Danger zone */}
            <div style={{ background: 'rgba(200,74,60,0.04)', border: '1px solid rgba(200,74,60,0.15)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 500, color: '#c84a3c', marginBottom: '0.5rem' }}>Sign Out</div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text-soft)', marginBottom: '1.25rem', fontWeight: 300 }}>
                You will be signed out of your account on this device.
              </p>
              <button type="button" onClick={handleLogout} disabled={loggingOut}
                style={{ padding: '0.65rem 1.5rem', background: '#c84a3c', color: '#fff', border: 'none', borderRadius: '4px', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: loggingOut ? 'wait' : 'pointer', opacity: loggingOut ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Profile Details Modal (Popup for incomplete profile) */}
      <CustomerDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSuccess={() => setShowDetailsModal(false)}
      />
    </div>
  );
}

