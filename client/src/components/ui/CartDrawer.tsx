'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import PriceTag from '@/components/ui/PriceTag';
import { formatSizeLabel } from '@/types/product';

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark)',
};

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
  const itemCount = items.reduce((s, i) => s + (Number(i.quantity) || 1), 0);

  return (
    <>
      {/* Backdrop */}
      <div onClick={closeCart} aria-hidden="true" style={{
        position: 'fixed', inset: 0,
        zIndex: 'var(--z-drawer)' as string,
        background: 'rgba(26,26,26,0.35)',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.4s',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
      }} />

      {/* Drawer */}
      <aside aria-label="Shopping cart" className="avoro-cart-drawer" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(460px, 100vw)',
        zIndex: 'calc(var(--z-drawer) + 1)' as string,
        background: 'var(--bg)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s cubic-bezier(0.25,1,0.5,1)',
        boxShadow: '-20px 0 60px rgba(180,150,120,0.15)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid var(--border-soft)',
          background: 'var(--bg-card)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.4">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <div>
              <div style={{ ...EB, marginBottom:'0.15rem' }}>Your Bag</div>
              <p style={{ fontFamily:'var(--font-display)',fontSize:'1.4rem',fontWeight:500,color:'var(--text)',lineHeight:1 }}>
                {itemCount === 0 ? 'Empty' : `${itemCount} item${itemCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button type="button" onClick={closeCart} aria-label="Close cart" style={{
            width:'36px',height:'36px',borderRadius:'50%',
            display:'flex',alignItems:'center',justifyContent:'center',
            background:'var(--bg-soft)',border:'1px solid var(--border-soft)',
            color:'var(--text-mid)',transition:'all 0.2s',cursor:'pointer',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='var(--gold-pale)'; el.style.borderColor='var(--gold-dark)'; el.style.color='var(--gold-dark)'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='var(--bg-soft)'; el.style.borderColor='var(--border-soft)'; el.style.color='var(--text-mid)'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (() => {
          const t = subtotal;
          const threshold = 2999;
          const pct = Math.min((t / threshold) * 100, 100);
          return (
            <div style={{ padding:'0.85rem 1.75rem', background:'var(--bg-soft)', borderBottom:'1px solid var(--border-soft)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                <span style={{ fontFamily:'var(--font-ui)',fontSize:'0.72rem',color:'var(--text-soft)' }}>
                  {pct >= 100 ? '🎉 Free shipping unlocked!' : `Add ₹${(threshold - t).toLocaleString('en-IN')} more for free shipping`}
                </span>
              </div>
              <div style={{ height:'3px',background:'var(--border)',borderRadius:'2px',overflow:'hidden' }}>
                <div style={{ height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,var(--gold-dark),var(--gold))',borderRadius:'2px',transition:'width 0.5s var(--ease)' }} />
              </div>
            </div>
          );
        })()}

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1.75rem' }}>
          {items.length === 0 ? (
            <div style={{ height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1.5rem',paddingBlock:'4rem',textAlign:'center' }}>
              <div style={{ width:'64px',height:'64px',borderRadius:'50%',background:'var(--bg-soft)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily:'var(--font-display)',fontSize:'1.35rem',fontStyle:'italic',color:'var(--text-mid)',marginBottom:'0.5rem' }}>
                  Your bag is empty
                </p>
                <p style={{ fontFamily:'var(--font-ui)',fontSize:'0.8rem',color:'var(--text-soft)' }}>
                  Discover our fragrances
                </p>
              </div>
              <Link href="/collection" onClick={closeCart} className="lumina-btn-gold"
                style={{ fontSize:'0.68rem',letterSpacing:'0.18em',padding:'0.75rem 2rem' }}>
                Explore Collection
              </Link>
            </div>
          ) : (
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'1rem' }}>
              {items.map(item => (
                <li key={item.sku} style={{
                  display:'grid', gridTemplateColumns:'76px 1fr',
                  gap:'1rem', alignItems:'start',
                  background:'var(--bg-card)',
                  border:'1px solid var(--border-soft)',
                  borderRadius:'6px',
                  padding:'1rem',
                }}>
                  {/* Thumbnail */}
                  <div style={{ width:'76px',height:'96px',position:'relative',background:'var(--bg-soft)',borderRadius:'4px',overflow:'hidden',flexShrink:0 }}>
                    {item.image
                      ? <Image src={item.image} alt={item.name} fill sizes="76px" style={{ objectFit:'cover' }} />
                      : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
                          <div style={{ width:'40%',aspectRatio:'1/2.5',background:'linear-gradient(160deg,rgba(212,175,136,0.3),rgba(201,149,138,0.2))',borderRadius:'30% 30% 20% 20%' }} />
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ fontFamily:'var(--font-display)',fontSize:'0.95rem',fontWeight:500,color:'var(--text)',lineHeight:1.25,marginBottom:'0.2rem' }}>
                      {item.name}
                    </div>
                    <div style={{ ...EB, color:'var(--text-muted)', marginBottom:'0.75rem' }}>{formatSizeLabel(item.size)}</div>

                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      {/* Qty control */}
                      <div style={{ display:'flex',alignItems:'center',border:'1px solid var(--border)',borderRadius:'4px',overflow:'hidden' }}>
                        <button type="button" onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          style={{ width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-mid)',borderRight:'1px solid var(--border)',fontSize:'1rem',cursor:'pointer',transition:'all 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='var(--bg-soft)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                          −
                        </button>
                        <span style={{ width:'30px',textAlign:'center',fontFamily:'var(--font-ui)',fontSize:'0.85rem',fontWeight:500,color:'var(--text)',display:'flex',alignItems:'center',justifyContent:'center',height:'28px' }}>
                          {item.quantity}
                        </span>
                        <button type="button" onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          style={{ width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-mid)',borderLeft:'1px solid var(--border)',fontSize:'1rem',cursor:'pointer',transition:'all 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='var(--bg-soft)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                          +
                        </button>
                      </div>

                      {/* Price & remove */}
                      <div style={{ textAlign:'right' }}>
                        <div style={{ marginBottom: '0.2rem' }}>
                          <PriceTag
                            price={item.price * item.quantity}
                            originalPrice={item.originalPrice ? item.originalPrice * item.quantity : undefined}
                            size="xs"
                            showDecimals={true}
                          />
                        </div>
                        <button type="button" onClick={() => removeItem(item.sku)}
                          style={{ fontFamily:'var(--font-ui)',fontSize:'0.65rem',color:'var(--text-muted)',letterSpacing:'0.08em',cursor:'pointer',transition:'color 0.2s',border:'none',background:'none',padding:0 }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#c05050'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='var(--text-muted)'}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding:'1.5rem 1.75rem', borderTop:'1px solid var(--border)', background:'var(--bg-card)' }}>
            {/* Subtotal */}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem' }}>
              <span style={{ fontFamily:'var(--font-ui)',fontSize:'0.82rem',color:'var(--text-soft)' }}>Subtotal</span>
              <span style={{ fontFamily:'var(--font-ui)',fontSize:'1.4rem',fontWeight:600,color:'var(--text)' }}>
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p style={{ fontFamily:'var(--font-ui)',fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:'1.25rem' }}>
              Taxes & shipping calculated at checkout
            </p>

            <Link href="/checkout" onClick={closeCart} className="lumina-btn-gold"
              style={{ display:'flex',width:'100%',justifyContent:'center',marginBottom:'0.75rem',borderRadius:'4px' }}>
              Proceed to Checkout →
            </Link>
            <Link href="/collection" onClick={closeCart} className="lumina-btn-ghost"
              style={{ display:'flex',width:'100%',justifyContent:'center',borderRadius:'4px',fontSize:'0.68rem' }}>
              Continue Shopping
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
