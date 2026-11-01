'use client';

import { useState } from 'react';
import { submitContactForm } from '@/lib/api';

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.62rem',
  fontWeight: 500,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
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

const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  (e.target as HTMLElement).style.borderColor = 'var(--gold-dark)';
  (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(184,146,74,0.1)';
};
const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  (e.target as HTMLElement).style.borderColor = 'var(--border-dark)';
  (e.target as HTMLElement).style.boxShadow = 'none';
};

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const messageContent = formData.get('message') as string;

    if (!name || !name.trim()) {
      setError('Please enter your name.');
      setLoading(false);
      return;
    }
    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!subject || !subject.trim()) {
      setError('Please enter a subject.');
      setLoading(false);
      return;
    }
    if (!messageContent || !messageContent.trim()) {
      setError('Please enter your message.');
      setLoading(false);
      return;
    }

    try {
      const res = await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: messageContent.trim(),
      });
      setMessage(res.message || "Thank you for contacting AVORO. We'll get back to you soon.");
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="lumina-container" style={{ paddingBlock: 'clamp(3rem,8vw,6rem)' }}>
        <div style={{ maxWidth: '680px', marginInline: 'auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ ...EB, marginBottom: '0.75rem' }}>Get in Touch</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '1rem' }}>
              We'd love to hear from you
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', color: 'var(--text-soft)', lineHeight: 1.8, fontWeight: 300 }}>
              Whether you have questions about our fragrances, need help with an order, or just want to share your experience — our team is here for you.
            </p>
          </div>

          {/* Contact info cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              { icon: '📧', label: 'Email', value: 'contact@avoro.in', href: 'mailto:contact@avoro.in' },
              { icon: '💬', label: 'WhatsApp', value: '+91 76070 90101', href: 'https://wa.me/917607090101' },
              { icon: '🕐', label: 'Hours', value: '10am–7pm IST, Mon–Sat' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '1.25rem', marginBottom: '0.6rem', display: 'block' }}>{c.icon}</span>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.label}</div>
                {c.href ? (
                  <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--gold-dark)', textDecoration: 'none', fontWeight: 500 }}>{c.value}</a>
                ) : (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--text)' }}>{c.value}</div>
                )}
              </div>
            ))}
          </div>

          {/* Social links */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ ...EB, marginBottom: '1.25rem' }}>Follow Us</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Instagram', href: 'https://www.instagram.com/avoro.official/', icon: '📸', color: '#E1306C' },
                { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61560738237010', icon: '📘', color: '#1877F2' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/company/avoro-luxury/', icon: '💼', color: '#0A66C2' },
                { label: 'WhatsApp', href: 'https://wa.me/917607090101', icon: '💬', color: '#25D366' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.1rem',
                  background: 'var(--bg-card)', border: '1px solid var(--border-soft)',
                  borderRadius: '999px', textDecoration: 'none',
                  fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 500,
                  color: 'var(--text-mid)', transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = s.color; el.style.color = s.color; el.style.background = `${s.color}08`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border-soft)'; el.style.color = 'var(--text-mid)'; el.style.background = 'var(--bg-card)'; }}>
                  <span style={{ fontSize: '1rem' }}>{s.icon}</span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="avoro-contact-form-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ ...EB, marginBottom: '1.75rem' }}>Send us a message</div>

            {message ? (
              <div style={{ padding: '2rem', background: 'rgba(45,122,79,0.08)', border: '1px solid rgba(45,122,79,0.2)', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}>✓</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#2d7a4f', marginBottom: '0.5rem' }}>Message sent</div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.7 }}>{message}</p>
                <button type="button" onClick={() => setMessage('')} style={{ marginTop: '1.25rem', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--gold-dark)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {error && (
                  <div style={{ padding: '0.8rem 1.1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#EF4444' }}>
                    {error}
                  </div>
                )}
                <div className="avoro-form-grid-2">
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Your name</label>
                    <input required name="name" placeholder="Aryan Sharma" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Email address</label>
                    <input required type="email" name="email" placeholder="you@example.com" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Subject</label>
                  <input required name="subject" placeholder="How can we help?" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Message</label>
                  <textarea required name="message" rows={5} placeholder="Tell us more about your inquiry..." style={{ ...INPUT, resize: 'vertical', minHeight: '120px' }} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <button type="submit" disabled={loading} className="lumina-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.72rem', opacity: loading ? 0.75 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
