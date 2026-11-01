'use client';

import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section
      className="section"
      style={{
        background: 'var(--black-card)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(200,160,60,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="label-text" style={{ marginBottom: '1.5rem' }}>
          Join the Inner Circle
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 300,
            color: 'var(--white)',
            letterSpacing: '0.02em',
            marginBottom: '0.75rem',
          }}
        >
          Stay close to the feeling.
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8rem',
            fontWeight: 300,
            color: 'var(--white-dim)',
            letterSpacing: '0.06em',
            lineHeight: 1.9,
            marginBottom: '2.5rem',
            maxWidth: '480px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          New launches, private events, and exclusive early access —
          for those who know that scent is memory.
        </p>

        {submitted ? (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontStyle: 'italic',
              color: 'var(--gold)',
              letterSpacing: '0.05em',
            }}
          >
            Welcome to AVORO. Your story has begun.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: '0',
              maxWidth: '480px',
              margin: '0 auto',
              border: '1px solid var(--glass-border)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: 'none',
                outline: 'none',
                padding: '0.9rem 1.25rem',
                color: 'var(--white)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8rem',
                fontWeight: 300,
                letterSpacing: '0.05em',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--gold)',
                color: '#060606',
                border: 'none',
                padding: '0.9rem 1.5rem',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Subscribe
            </button>
          </form>
        )}

        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.6rem',
            color: 'var(--white-dim)',
            marginTop: '1rem',
            letterSpacing: '0.08em',
            opacity: 0.5,
          }}
        >
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
