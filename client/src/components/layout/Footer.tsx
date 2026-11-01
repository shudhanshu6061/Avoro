'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: 'rgba(212,175,136,0.95)',
};

const DEFAULT_COLLECTION_LINKS = [
  { label: 'Velvet Oud',      href: '/product/velvet-oud' },
  { label: 'Vanilla Ember',   href: '/product/vanilla-ember' },
  { label: 'Blue Amber',      href: '/product/blue-amber' },
];

const STATIC_COLS = [
  { title: 'About', links: [
    { label: 'Story',           href: '/about' },
    { label: 'Journal',         href: '/journal' },
    { label: 'Contact',         href: '/contact' },
    { label: 'FAQ',             href: '/faq' },
  ]},
  { title: 'Support', links: [
    { label: 'Track Order',     href: '/track' },
    { label: 'Shipping',        href: '/shipping' },
    { label: 'Returns',         href: '/refund' },
    { label: 'Privacy',         href: '/privacy' },
    { label: 'Terms',           href: '/terms' },
  ]},
];

export default function Footer() {
  const [settings, setSettings] = useState({ store_name: 'AVORO', store_email: '' });
  const [collectionLinks, setCollectionLinks] = useState(DEFAULT_COLLECTION_LINKS);
  const [openCols, setOpenCols] = useState<Record<string, boolean>>({});
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribedMessage, setSubscribedMessage] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscribeEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail, source: 'Footer Newsletter' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribedMessage(data.message || 'Thank you for subscribing to AVORO.');
        setSubscribeEmail('');
      } else {
        alert(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to subscription service.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const toggleCol = (title: string) => {
    setOpenCols(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  useEffect(() => {
    fetch('/api/settings/public').then(r => r.json()).then(data => {
      setSettings(prev => ({
        store_name: data.store_name || prev.store_name,
        store_email: data.store_email || prev.store_email,
      }));
    }).catch(() => {});

    fetch('/api/products')
      .then(r => (r.ok ? r.json() : null))
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const activeProducts = data
            .filter((p: any) => p && p.isActive !== false && p.slug && p.name)
            .map((p: any) => ({
              label: p.name.replace(/^AVORO\s+/i, '').trim(),
              href: `/product/${p.slug}`,
            }));
          if (activeProducts.length > 0) {
            setCollectionLinks(activeProducts);
          }
        }
      })
      .catch(() => {});
  }, []);

  const cols = [
    { title: 'Collection', links: collectionLinks },
    ...STATIC_COLS,
  ];

  return (
    <footer style={{ background: '#090806', borderTop: '1px solid rgba(184,146,74,0.08)' }}>

      {/* ── Main footer grid ───────────────────── */}
      <div className="lumina-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr repeat(3, 1fr) 1.5fr',
          gap: '3.5rem 2rem',
          paddingBlock: 'clamp(4rem, 8vw, 6.5rem)',
          borderBottom: '1px solid rgba(184,146,74,0.06)',
        }} className="lum-footer-grid">

          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: '1rem',
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: '#f5ede2',
              textDecoration: 'none',
            }}>
              AVORO
            </Link>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.92rem',
              fontStyle: 'italic',
              color: 'rgba(245,237,226,0.65)',
              lineHeight: 1.7,
              marginBottom: '0.85rem',
              maxWidth: '240px',
            }}>
              The memory of your presence.
            </p>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.78rem',
              color: 'rgba(245,237,226,0.42)',
              lineHeight: 1.8,
              maxWidth: '250px',
              marginBottom: '1.75rem',
            }}>
              Artisanal fragrances crafted in India.<br />
              Timeless, elegant, unforgettable.
            </p>

            {/* Contact email — always shown */}
            <a href="mailto:contact@avoro.in" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 500,
              color: 'rgba(245,237,226,0.5)', marginBottom: '1.5rem',
              textDecoration: 'none', transition: 'color 0.25s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--gold-dark)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(245,237,226,0.5)'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
              contact@avoro.in
            </a>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {[
                {
                  href: 'https://www.instagram.com/avoro.official/',
                  label: 'Instagram',
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
                },
                {
                  href: 'https://wa.me/917607090101',
                  label: 'WhatsApp',
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
                },
                {
                  href: 'https://www.facebook.com/profile.php?id=61560738237010',
                  label: 'Facebook',
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
                },
                {
                  href: 'https://www.linkedin.com/company/avoro-luxury/',
                  label: 'LinkedIn',
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
                },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{
                  width: '34px', height: '34px',
                  borderRadius: '50%',
                  border: '1px solid rgba(245,237,226,0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(245,237,226,0.5)',
                  transition: 'all 0.25s var(--ease)',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='var(--gold-dark)'; el.style.color='var(--gold-dark)'; el.style.background='rgba(184,146,74,0.06)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='rgba(245,237,226,0.14)'; el.style.color='rgba(245,237,226,0.5)'; el.style.background='transparent'; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => {
            const isOpen = !!openCols[col.title];
            return (
              <div key={col.title} className="lum-footer-col">
                <button
                  onClick={() => toggleCol(col.title)}
                  aria-expanded={isOpen}
                  aria-controls={`footer-col-${col.title.toLowerCase()}`}
                  className="lum-footer-col-header"
                  style={{
                    ...EB,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    cursor: 'pointer',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span>{col.title}</span>
                  <span className="lum-footer-chevron">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </button>

                <div 
                  id={`footer-col-${col.title.toLowerCase()}`}
                  className={`lum-footer-links-list ${isOpen ? 'is-open' : ''}`}
                >
                  <div className="lum-footer-links-list-inner">
                    {col.links.map(l => (
                      <Link key={l.label} href={l.href} className="lum-footer-link">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Newsletter column */}
          <div className="lum-footer-col lum-footer-newsletter-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h3 style={{
              ...EB,
              color: '#fff',
              marginBottom: '1.25rem',
            }}>
              Stay Close
            </h3>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.78rem',
              color: 'rgba(245,237,226,0.52)',
              lineHeight: 1.6,
              marginBottom: '1.25rem',
              maxWidth: '280px',
            }}>
              Be the first to discover new launches, exclusive collections, and stories from AVORO.
            </p>

            {subscribedMessage ? (
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.92rem',
                fontStyle: 'italic',
                color: 'var(--gold-dark)',
                marginTop: '0.5rem',
                lineHeight: 1.5,
                maxWidth: '280px',
              }}>
                {subscribedMessage} ✦
              </p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="email"
                  required
                  disabled={isSubscribing}
                  placeholder="Enter your email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(245, 237, 226, 0.15)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.8rem',
                    color: '#fff',
                    outline: 'none',
                    borderRadius: '2px',
                    transition: 'border-color 0.25s, box-shadow 0.25s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold-dark)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(184, 146, 74, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 237, 226, 0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: isSubscribing ? 'rgba(184, 146, 74, 0.5)' : 'var(--gold-dark)',
                    color: '#090806',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: isSubscribing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.25s var(--ease)',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubscribing) {
                      e.currentTarget.style.background = 'var(--gold-light)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(184, 146, 74, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubscribing) {
                      e.currentTarget.style.background = 'var(--gold-dark)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────── */}
        <div className="avoro-footer-bottom" style={{ paddingBlock: '1.75rem' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'rgba(245,237,226,0.35)', lineHeight: 1.6 }}>
            © {new Date().getFullYear()} {settings.store_name}. Crafted through memory, emotion, and timeless elegance.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }} className="lum-footer-bottom-links">
            {['Privacy Policy', 'Terms & Conditions', 'Refund & Returns', 'Shipping Policy'].map((l, idx) => {
              const hrefs = ['/privacy', '/terms', '/refund', '/shipping'];
              return (
                <Link key={l} href={hrefs[idx]} style={{ fontFamily:'var(--font-ui)',fontSize:'0.72rem',color:'rgba(245,237,226,0.35)',transition:'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--gold-dark)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(245,237,226,0.35)'}>
                  {l}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .lum-footer-logo-container {
          transition: transform 0.3s var(--ease);
        }
        .lum-footer-logo-container:hover {
          transform: translateY(-2px);
        }

        /* Default link columns setup (Desktop/Tablet) */
        .lum-footer-col-header {
          pointer-events: none;
        }
        .lum-footer-chevron {
          display: none;
        }
        .lum-footer-links-list {
          display: block !important;
          height: auto !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        .lum-footer-link {
          display: block;
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: rgba(245,237,226,0.52);
          margin-bottom: 0.7rem;
          transition: color 0.2s;
          text-decoration: none;
        }
        .lum-footer-link:hover {
          color: var(--gold-dark) !important;
        }

        @media (max-width: 900px) {
          .lum-footer-grid { grid-template-columns: 1fr 1fr !important; }
          .lum-footer-grid > div:first-child {
            grid-column: span 2;
            padding-bottom: 2.25rem;
            border-bottom: 1px solid rgba(184,146,74,0.06);
            margin-bottom: 1.5rem;
          }
        }
        @media (max-width: 768px) {
          .lum-footer-logo { height: 60px !important; }
          
          .lum-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }

          .lum-footer-grid > div:first-child {
            grid-column: span 1 !important;
            padding-bottom: 1.75rem !important;
            margin-bottom: 0.5rem !important;
            border-bottom: 1px solid rgba(184,146,74,0.06);
          }

          /* Accordion Mobile setup */
          .lum-footer-col {
            border-bottom: 1px solid rgba(184,146,74,0.08);
            padding-bottom: 1rem;
          }
          .lum-footer-newsletter-col {
            border-bottom: none !important;
            padding-bottom: 0 !important;
            margin-top: 1rem;
          }

          .lum-footer-col-header {
            pointer-events: auto !important;
            margin-bottom: 0 !important;
          }

          .lum-footer-chevron {
            display: flex !important;
            transition: transform 0.3s ease;
          }

          .lum-footer-col-header[aria-expanded="true"] .lum-footer-chevron {
            transform: rotate(180deg);
          }

          .lum-footer-links-list {
            display: grid !important;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.3s ease-out, opacity 0.25s ease;
            opacity: 0 !important;
            visibility: hidden !important;
          }

          .lum-footer-links-list.is-open {
            grid-template-rows: 1fr !important;
            opacity: 1 !important;
            visibility: visible !important;
            margin-top: 1rem;
          }

          .lum-footer-links-list-inner {
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
          }

          .lum-footer-link {
            font-size: 0.88rem !important;
            margin-bottom: 0 !important;
            padding-block: 0.2rem;
          }

          /* 2x2 Grid Layout for Utility Links at the bottom */
          .lum-footer-bottom-links {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 1rem 2rem !important;
            width: 100%;
            margin-top: 1.25rem;
          }

          .lum-footer-bottom-links a {
            font-size: 0.8rem !important;
            padding-block: 0.4rem;
          }
        }
      ` }} />
    </footer>
  );
}
