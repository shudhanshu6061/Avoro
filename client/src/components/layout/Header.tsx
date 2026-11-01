'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Montserrat, Cormorant_Garamond } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-montserrat',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-cormorant-garamond',
});

const NAV = [
  { href: '/collection', label: 'Collections' },
  { href: '/journal',    label: 'Journal' },
  { href: '/about',      label: 'About' },
];

export default function Header() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { toggleCart, count } = useCartStore();
  const { user, isLoggedIn, logout } = useAuthStore();
  const cartCount = count();
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [search,     setSearch]     = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenu,   setUserMenu]   = useState(false);

  const [mounted, setMounted] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; slug: string; images: string[]; variants: { price: number }[] }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch('/api/settings/public').then(r => r.json()).then(data => {
      if (data.announcement_bar) setAnnouncement(data.announcement_bar);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); setUserMenu(false); setSearch(''); setSearchResults([]); }, [pathname]);

  useEffect(() => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/', { scroll: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (search.trim().length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(search.trim())}`)
        .then(r => r.json())
        .then(data => { setSearchResults(Array.isArray(data) ? data.slice(0, 6) : []); })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="premium-announcement-bar" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 'calc(var(--z-header) + 1)' as any,
        background: '#0F0F0F',
        color: '#F8F6F2',
        height: 'var(--announcement-h)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        fontFamily: 'var(--font-ui)',
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="premium-marquee-track">
          <div className="premium-marquee-content">
            <span className="premium-marquee-item">FREE SHIPPING</span>
            <span className="premium-marquee-item">LONG LASTING</span>
            <span className="premium-marquee-item">MADE IN INDIA</span>
            <span className="premium-marquee-item">PREMIUM FRAGRANCES</span>
            <span className="premium-marquee-item">FREE SHIPPING</span>
            <span className="premium-marquee-item">LONG LASTING</span>
            <span className="premium-marquee-item">MADE IN INDIA</span>
            <span className="premium-marquee-item">PREMIUM FRAGRANCES</span>
            <span className="premium-marquee-item">FREE SHIPPING</span>
            <span className="premium-marquee-item">LONG LASTING</span>
            <span className="premium-marquee-item">MADE IN INDIA</span>
            <span className="premium-marquee-item">PREMIUM FRAGRANCES</span>
          </div>
          <div className="premium-marquee-content" aria-hidden="true">
            <span className="premium-marquee-item">FREE SHIPPING</span>
            <span className="premium-marquee-item">LONG LASTING</span>
            <span className="premium-marquee-item">MADE IN INDIA</span>
            <span className="premium-marquee-item">PREMIUM FRAGRANCES</span>
            <span className="premium-marquee-item">FREE SHIPPING</span>
            <span className="premium-marquee-item">LONG LASTING</span>
            <span className="premium-marquee-item">MADE IN INDIA</span>
            <span className="premium-marquee-item">PREMIUM FRAGRANCES</span>
            <span className="premium-marquee-item">FREE SHIPPING</span>
            <span className="premium-marquee-item">LONG LASTING</span>
            <span className="premium-marquee-item">MADE IN INDIA</span>
            <span className="premium-marquee-item">PREMIUM FRAGRANCES</span>
          </div>
        </div>
      </div>

      <header
        className={`lum-header-bar ${scrolled ? 'scrolled' : ''} ${announcement ? 'has-announcement' : ''} ${montserrat.variable} ${cormorantGaramond.variable}`}
        style={{ 
          '--font-montserrat': montserrat.style.fontFamily,
          '--font-cormorant-garamond': cormorantGaramond.style.fontFamily,
        } as any}
      >

        {/* Logo */}
        <Link href="/" onClick={handleLogoClick} className="avoro-logo-wordmark">
          AVORO
        </Link>

        {/* Desktop nav */}
        <nav style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '42px' }} className="lum-nav">
          {NAV.map(({ href, label }, i) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={i} href={href} className={`lum-nav-link ${active ? 'active' : ''}`}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

          {/* Desktop actions */}
          <div className="lum-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Search */}
          {searchOpen ? (
            <div className="lum-icon" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--gold-dark)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,136,0.7)" strokeWidth="1.4">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search fragrances..."
                  style={{ background: 'transparent', border: 'none', width: '200px', fontSize: '0.82rem', color: '#1a1209', padding: '0.25rem 0', outline: 'none' }} />
                <button type="button" onClick={() => { setSearchOpen(false); setSearch(''); setSearchResults([]); }} style={{ color: 'rgba(58,42,31,0.7)', lineHeight: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              {/* Results dropdown */}
              {search.trim().length >= 2 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: '320px', maxHeight: '400px', overflowY: 'auto',
                  background: 'var(--bg-card)', border: '1px solid var(--border-soft)',
                  borderRadius: '8px', boxShadow: 'var(--shadow-lg)', zIndex: 200,
                }}>
                  {searchLoading ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>No products found for &ldquo;{search}&rdquo;</div>
                  ) : (
                    <>
                      {searchResults.map(p => (
                        <Link key={p.slug} href={`/product/${p.slug}`} onClick={() => { setSearchOpen(false); setSearch(''); setSearchResults([]); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem', transition: 'background 0.15s', borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-soft)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                          <div style={{
                            width: '44px', height: '56px', borderRadius: '4px', flexShrink: 0, overflow: 'hidden',
                            background: 'var(--bg-soft)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', opacity: 0.2 }}>✦</span>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--gold-dark)', marginTop: '0.15rem' }}>
                              ₹{p.variants?.[0]?.price ? p.variants[0].price.toLocaleString('en-IN') : '—'}
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link href={`/collection?search=${encodeURIComponent(search)}`} onClick={() => { setSearchOpen(false); setSearch(''); setSearchResults([]); }}
                        style={{ display: 'block', padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--gold-dark)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                        View all results →
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => setSearchOpen(true)} className="lum-icon" style={{ color: 'rgba(58,42,31,0.7)', lineHeight: 0, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--gold-dark)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(58,42,31,0.7)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          )}

          {/* Account / User */}
          <div style={{ position: 'relative' }} className="lum-icon">
            {mounted && isLoggedIn && user ? (
              <>
                <button type="button" onClick={() => setUserMenu(o => !o)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--gold-dark),var(--gold-light))',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                    fontWeight: 600, color: '#fff', letterSpacing: '0.05em',
                    flexShrink: 0, transition: 'box-shadow 0.2s',
                    boxShadow: userMenu ? '0 0 0 3px rgba(184,146,74,0.25)' : 'none',
                  }}>
                  {user.firstName[0]}{user.lastName[0]}
                </button>
                {userMenu && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border-soft)',
                    borderRadius: '6px', boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem', minWidth: '200px', zIndex: 200,
                    animation: 'fadeIn 0.15s ease both',
                  }} onMouseLeave={() => setUserMenu(false)}>
                    {/* User info row */}
                    <div style={{ padding: '0.6rem 0.85rem 0.85rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{user.email}</div>
                    </div>
                    {/* Menu items */}
                    {[
                      { label: 'My Profile',   href: '/account/profile' },
                      { label: 'My Orders',    href: '/account/profile' },
                      { label: 'Settings',     href: '/account/profile' },
                    ].map(item => (
                      <Link key={item.label} href={item.href} onClick={() => setUserMenu(false)}
                        style={{ display: 'block', padding: '0.6rem 0.85rem', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text-mid)', borderRadius: '4px', transition: 'background 0.15s, color 0.15s' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--bg-soft)'; el.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = ''; el.style.color = 'var(--text-mid)'; }}>
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                      <button type="button" onClick={async () => { setUserMenu(false); await logout(); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.85rem', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#c84a3c', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(200,74,60,0.06)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link href="/account" style={{ color: 'rgba(58,42,31,0.7)', lineHeight: 0, transition: 'color 0.2s' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            )}
          </div>

          {/* Cart */}
          <button type="button" onClick={toggleCart} aria-label={mounted ? `Cart (${cartCount})` : 'Cart (0)'}
            style={{ position: 'relative', color: 'rgba(58,42,31,0.7)', lineHeight: 0, transition: 'color 0.2s' }}
            className="lum-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {mounted && cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-6px',
                background: 'var(--gold-dark)', color: '#fff',
                fontSize: '0.52rem', fontWeight: 600,
                width: '14px', height: '14px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 2px #FAF8F3',
                fontFamily: 'var(--font-ui)',
              }}>{cartCount}</span>
            )}
          </button>
          </div>

          {/* Mobile: Search + Cart + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="lum-mobile-actions">

            {/* Mobile search toggle */}
            <button type="button" onClick={() => setSearchOpen(o => !o)} style={{ color: 'rgba(58,42,31,0.75)', lineHeight: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Mobile cart */}
            <button type="button" onClick={toggleCart} aria-label={mounted ? `Cart (${cartCount})` : 'Cart (0)'}
              style={{ position: 'relative', color: 'rgba(58,42,31,0.75)', lineHeight: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {mounted && cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-6px',
                  background: 'var(--gold-dark)', color: '#fff',
                  fontSize: '0.52rem', fontWeight: 600,
                  width: '14px', height: '14px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 2px #FAF8F3',
                }}>{cartCount}</span>
              )}
            </button>

            {/* Hamburger (Clean symmetrical 3-line menu) */}
            <button type="button" onClick={() => setMenuOpen(o => !o)} className="lum-hamburger"
              style={{
                color: 'rgba(58,42,31,0.75)',
                lineHeight: 0,
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="18" x2="20" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Search Bar ──────────────────────────────── */}
      {searchOpen && (
        <div className="lum-mobile-search" style={{
          position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, zIndex: 90,
          background: 'rgba(250,248,243,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(184,146,74,0.2)',
          padding: '0.85rem clamp(1.25rem,4vw,2rem)',
          display: 'none', alignItems: 'center', gap: '0.75rem',
          animation: 'slideDown 0.25s ease both',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.6">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search fragrances..."
            style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.95rem', color: 'var(--text)', outline: 'none' }} />
          <button type="button" onClick={() => { setSearchOpen(false); setSearch(''); setSearchResults([]); }}
            style={{ color: 'var(--text-muted)', lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          {/* Mobile search results */}
          {search.trim().length >= 2 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)', maxHeight: '60vh', overflowY: 'auto',
            }}>
              {searchLoading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Searching...</div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>No products found</div>
              ) : (
                <>
                  {searchResults.map(p => (
                    <Link key={p.slug} href={`/product/${p.slug}`} onClick={() => { setSearchOpen(false); setSearch(''); setSearchResults([]); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: '44px', height: '56px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-soft)', flexShrink: 0, border: '1px solid var(--border)' }}>
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--gold-dark)', marginTop: '0.15rem' }}>
                          ₹{p.variants?.[0]?.price ? p.variants[0].price.toLocaleString('en-IN') : '—'}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link href={`/collection?search=${encodeURIComponent(search)}`}
                    onClick={() => { setSearchOpen(false); setSearch(''); setSearchResults([]); }}
                    style={{ display: 'block', padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold-dark)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    View all results →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Premium Mobile Drawer ──────────────────────────── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 'var(--z-drawer)' as string,
            background: 'rgba(10,8,5,0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.4s ease both',
          }} />

          {/* Drawer panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(88vw, 380px)',
            zIndex: 'calc(var(--z-drawer) + 1)' as string,
            background: '#FAF8F5',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.4s cubic-bezier(0.25,1,0.5,1) both',
            boxShadow: '-20px 0 60px rgba(10,8,5,0.12)',
            borderLeft: '1px solid rgba(184,146,74,0.15)',
          }}>

            {/* Drawer top bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.5rem 1.75rem',
              borderBottom: '1px solid rgba(184,146,74,0.12)',
              background: '#FAF8F5',
            }}>
              <div>
                <Link href="/" onClick={(e) => { setMenuOpen(false); handleLogoClick(e); }} style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  letterSpacing: '0.22em',
                  color: 'var(--gold-dark)',
                  textDecoration: 'none',
                  lineHeight: 1.2,
                  display: 'inline-block',
                }}>
                  AVORO
                </Link>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.2em', color: 'var(--gold-dark)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Universe
                </div>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} style={{
                width: '38px', height: '38px', borderRadius: '50%',
                border: '1px solid rgba(184,146,74,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-mid)', background: 'transparent',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 1.75rem 1rem' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.25em', color: 'var(--gold-dark)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Navigation
              </div>

              {[{ href: '/', label: 'Home' }, ...NAV, { href: '/contact', label: 'Contact' }].map(({ href, label }, i) => {
                const active = pathname === href;
                const numberStr = String(i + 1).padStart(2, '0');
                return (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingBlock: '1.2rem',
                    borderBottom: '1px solid rgba(184,146,74,0.08)',
                    animation: `fadeUp 0.4s ${0.04 * i + 0.08}s ease both`,
                  }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: '#C8A96A', fontWeight: 600 }}>
                        {numberStr}
                      </span>
                      <span className={`lum-mobile-nav-link ${active ? 'active' : ''}`}>
                        {label}
                      </span>
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="1.6" style={{ opacity: active ? 1 : 0.3 }}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                );
              })}

              {/* Curated highlight showcase */}
              <div style={{
                marginTop: '2.5rem',
                padding: '1.25rem',
                borderRadius: '8px',
                background: 'rgba(184,146,74,0.04)',
                border: '1.5px solid rgba(184,146,74,0.12)',
              }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.22em', color: 'var(--gold-dark)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  Signature Scent
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '60px', borderRadius: '4px', background: '#fff', border: '1px solid rgba(184,146,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Image src="/images/perfume-1.png" alt="Velvet Oud" width={40} height={40} style={{ objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontStyle: 'italic', fontWeight: 500, color: 'var(--text)' }}>Velvet Oud</h4>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: '0.15rem' }}>Mysterious, dark, eternal presence.</p>
                    <Link href="/product/velvet-oud" onClick={() => setMenuOpen(false)} style={{ display: 'inline-block', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--gold-dark)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.4rem', textDecoration: 'underline' }}>
                      Discover Scent
                    </Link>
                  </div>
                </div>
              </div>

              {/* Account section */}
              <div style={{ marginTop: '2rem' }}>
                {mounted && isLoggedIn && user ? (
                  <div style={{
                    background: 'rgba(184,146,74,0.06)', border: '1px solid rgba(184,146,74,0.15)',
                    borderRadius: '10px', padding: '1rem 1.25rem',
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                  }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,var(--gold-dark),var(--gold-light))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600, color: '#fff',
                    }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{user.firstName} {user.lastName}</div>
                      <Link href="/account/profile" onClick={() => setMenuOpen(false)}
                        style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--gold-dark)', letterSpacing: '0.08em' }}>
                        View Profile →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link href="/account" onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    padding: '0.9rem', borderRadius: '8px',
                    border: '1.5px solid rgba(184,146,74,0.35)',
                    fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 600,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--gold-dark)',
                    background: 'rgba(184,146,74,0.04)',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Sign In / Register
                  </Link>
                )}
              </div>
            </nav>

            {/* Drawer footer */}
            <div style={{
              padding: '1.5rem 1.75rem 2rem',
              borderTop: '1px solid rgba(184,146,74,0.15)',
              background: '#FAF8F5',
            }}>
              <a href="mailto:contact@avoro.in" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--text-soft)',
                marginBottom: '1.25rem', textDecoration: 'none', fontWeight: 500,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                contact@avoro.in
              </a>
              {/* Social row */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { href: 'https://www.instagram.com/avoro.official/', label: 'Instagram', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
                  { href: 'https://wa.me/917607090101', label: 'WhatsApp', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
                  { href: 'https://www.facebook.com/profile.php?id=61560738237010', label: 'Facebook', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { href: 'https://www.linkedin.com/company/avoro-luxury/', label: 'LinkedIn', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    border: '1px solid rgba(184,146,74,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(58,42,31,0.5)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='var(--gold-dark)'; el.style.color='var(--gold-dark)'; el.style.background='rgba(184,146,74,0.06)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='rgba(184,146,74,0.22)'; el.style.color='rgba(58,42,31,0.5)'; el.style.background=''; }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

        .avoro-logo-wordmark {
          font-family: var(--font-cormorant-garamond), serif;
          font-weight: 600;
          letter-spacing: 5px;
          color: #111111 !important;
          text-decoration: none;
          transition: color 0.3s ease;
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          line-height: 1;
        }

        .avoro-logo-wordmark:hover {
          color: #C8A96A !important;
        }

        /* Desktop: 34-40px */
        @media (min-width: 1024px) {
          .avoro-logo-wordmark {
            font-size: 36px !important;
          }
        }

        /* Tablet: 30-34px */
        @media (min-width: 769px) and (max-width: 1023px) {
          .avoro-logo-wordmark {
            font-size: 32px !important;
          }
        }

        /* Mobile: 24-28px */
        @media (max-width: 768px) {
          .avoro-logo-wordmark {
            font-size: 26px !important;
          }
        }

        .lum-nav-link {
          font-family: var(--font-montserrat), sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #1A1A1A !important;
          padding-bottom: 6px;
          position: relative;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .lum-nav-link::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: 0;
          left: 0;
          background-color: #C8A96A;
          transform-origin: center;
          transition: transform 0.3s ease;
        }

        header a.lum-nav-link:hover,
        .lum-nav-link:hover {
          color: #C8A96A !important;
        }

        .lum-nav-link:hover::after {
          transform: scaleX(1);
        }

        header a.lum-nav-link.active,
        .lum-nav-link.active {
          color: #C8A96A !important;
        }

        .lum-nav-link.active::after {
          transform: scaleX(1);
        }

        .lum-mobile-nav-link {
          font-family: var(--font-montserrat), sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #1A1A1A !important;
          padding-bottom: 6px;
          position: relative;
          text-decoration: none;
          transition: color 0.3s ease;
          display: inline-block;
        }

        .lum-mobile-nav-link::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: 0;
          left: 0;
          background-color: #C8A96A;
          transform-origin: center;
          transition: transform 0.3s ease;
        }

        header a.lum-mobile-nav-link:hover,
        .lum-mobile-nav-link:hover {
          color: #C8A96A !important;
        }

        .lum-mobile-nav-link:hover::after {
          transform: scaleX(1);
        }

        header a.lum-mobile-nav-link.active,
        .lum-mobile-nav-link.active {
          color: #C8A96A !important;
        }

        .lum-mobile-nav-link.active::after {
          transform: scaleX(1);
        }

        .lum-header-bar {
          position: fixed;
          left: 0;
          right: 0;
          top: var(--announcement-h);
          height: var(--nav-h);
          z-index: var(--z-header);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-inline: clamp(1.5rem, 4vw, 4rem);
          transition: all 0.4s var(--ease);
          background: rgba(250, 248, 243, 0.95);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(184, 146, 74, 0.08);
          box-shadow: none;
        }
        .lum-header-bar.scrolled {
          background: rgba(250, 248, 243, 0.88);
          box-shadow: 0 4px 30px rgba(10, 8, 5, 0.03);
        }

        /* Desktop: show full nav + icons, hide mobile actions */
        .lum-mobile-actions { display: none !important; }
        .lum-desktop-actions { display: flex !important; }
        .lum-nav { display: flex !important; }
        .lum-hamburger { display: none !important; }

        /* Mobile breakpoint: Floating Capsule Menu */
        @media (max-width: 768px) {
          .lum-header-bar {
            top: calc(var(--announcement-h) + 10px) !important;
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
            height: var(--nav-h) !important;
            border-radius: 999px !important;
            background: rgba(250, 248, 243, 0.92) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(184, 146, 74, 0.15) !important;
            box-shadow: 0 8px 32px rgba(10, 8, 5, 0.08) !important;
            padding-inline: 1rem !important;
          }
          .lum-header-bar.scrolled {
            background: rgba(250, 248, 243, 0.98) !important;
            border-color: rgba(184, 146, 74, 0.25) !important;
          }

          .lum-nav { display: none !important; }
          .lum-desktop-actions { display: none !important; }
          .lum-mobile-actions { display: flex !important; }
          .lum-hamburger { display: flex !important; }
          .lum-mobile-search {
            display: flex !important;
            top: calc(var(--header-offset) - 8px) !important;
            left: 12px !important;
            right: 12px !important;
            border-radius: 16px !important;
            border: 1px solid rgba(184, 146, 74, 0.15) !important;
            box-shadow: 0 10px 30px rgba(10, 8, 5, 0.08) !important;
            background: #FAF8F5 !important;
          }
        }

        .lum-icon:hover, header a:hover { color: var(--gold-dark) !important; }

        @keyframes premiumMarquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .premium-marquee-track {
          display: flex;
          width: max-content;
        }
        .premium-marquee-content {
          display: flex;
          white-space: nowrap;
          animation: premiumMarquee 25s linear infinite;
          will-change: transform;
        }
        .premium-marquee-item {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
        }
        .premium-marquee-item::after {
          content: "•";
          margin-left: 2rem;
          margin-right: 2rem;
          color: #F8F6F2;
        }
        .premium-announcement-bar:hover .premium-marquee-content {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .premium-marquee-content {
            animation: none;
            overflow-x: auto;
            width: 100%;
            justify-content: center;
          }
        }
      ` }} />
    </>
  );
}

