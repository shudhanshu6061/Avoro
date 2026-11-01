'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';

function InstagramIcon({ size = 16, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none" />
    </svg>
  );
}

export default function PreLaunchLanding() {
  const [inputType, setInputType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredEmailOrPhone, setRegisteredEmailOrPhone] = useState('');

  // Check if user already registered on this device
  useEffect(() => {
    try {
      const saved = localStorage.getItem('avoro_vip_registered');
      if (saved) {
        setSubmitted(true);
        setRegisteredEmailOrPhone(saved);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (inputType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    } else {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        setErrorMessage('Please enter a valid 10-digit phone number.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload: { email?: string; phone?: string; source: string } = {
        source: 'Pre-Launch VIP Page',
      };

      if (inputType === 'email') {
        payload.email = email.trim();
        if (phone.trim()) payload.phone = phone.trim();
      } else {
        payload.phone = phone.trim();
        if (email.trim()) payload.email = email.trim();
      }

      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const identifier = email.trim() || phone.trim();
        setSubmitted(true);
        setRegisteredEmailOrPhone(identifier);
        try {
          localStorage.setItem('avoro_vip_registered', identifier);
        } catch {}
      } else {
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Unable to connect right now. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        backgroundColor: '#070605',
        color: '#F3EDE2',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ── Ambient Background Lighting ── */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {/* Top radial ambient glow */}
        <div 
          style={{
            position: 'absolute',
            top: '-15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            maxWidth: '100vw',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,136,0.22) 0%, rgba(125,87,38,0.12) 45%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        {/* Center bottle spotlight */}
        <div 
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            maxWidth: '90vw',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,213,183,0.18) 0%, rgba(166,124,82,0.10) 40%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Bottom deep vignette */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '350px',
            background: 'linear-gradient(to top, #070605 30%, transparent 100%)',
          }}
        />
      </div>

      {/* ── Main Layout Wrapper ── */}
      <div 
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 1.25rem',
          boxSizing: 'border-box',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        
        {/* ── Top Header: Brand Logo ── */}
        <header 
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '1rem',
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            {/* AVORO Brand Typography */}
            <h1 
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 700,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                background: 'linear-gradient(180deg, #FFF8ED 0%, #E8D5B7 45%, #B8924A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                filter: 'drop-shadow(0 2px 14px rgba(212,175,136,0.3))',
              }}
            >
              AVORO
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
              <span style={{ height: '1px', width: '28px', background: 'linear-gradient(to right, transparent, rgba(212,175,136,0.6))' }} />
              <p 
                style={{
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.36em',
                  fontWeight: 500,
                  color: 'rgba(200,184,158,0.85)',
                  margin: 0,
                }}
              >
                Haute Parfumerie
              </p>
              <span style={{ height: '1px', width: '28px', background: 'linear-gradient(to left, transparent, rgba(212,175,136,0.6))' }} />
            </div>
          </motion.div>
        </header>

        {/* ── Center Content: Hero, Teaser Visual & Form ── */}
        <main 
          style={{
            width: '100%',
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            margin: 'auto 0',
            padding: '2rem 0',
          }}
        >
          
          {/* Status Badge: LAUNCHING SOON */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.4rem 1.1rem',
              borderRadius: '9999px',
              border: '1px solid rgba(212,175,136,0.35)',
              backgroundColor: 'rgba(21,18,14,0.85)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 24px rgba(212,175,136,0.14)',
              marginBottom: '1.25rem',
            }}
          >
            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#D4AF88', boxShadow: '0 0 8px #D4AF88' }} />
            <span 
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: '#E8D5B7',
              }}
            >
              Launching Soon
            </span>
          </motion.div>

          {/* Hero Headline: THE WAIT IS ALMOST OVER */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 5.5vw, 4rem)',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              lineHeight: 1.15,
              color: '#FAF6F0',
              margin: '0 0 0.75rem 0',
            }}
          >
            The Wait Is <br />
            <span 
              style={{
                background: 'linear-gradient(90deg, #FFF0D4 0%, #D4AF88 50%, #E3BE98 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              Almost Over
            </span>
          </motion.h2>

          {/* Short Brand Statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.35 }}
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              color: 'rgba(200,184,158,0.92)',
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: '560px',
              margin: '0 0 2rem 0',
              letterSpacing: '0.015em',
            }}
          >
            Artisanal fragrances crafted with rare essences, designed to leave an indelible impression. An intimate olfactory awakening is about to arrive.
          </motion.p>

          {/* ── Mysterious Abstract / Blurred Visual Section (No Product Reveal) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.45 }}
            style={{
              position: 'relative',
              width: '260px',
              height: '310px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0.5rem 0 2rem 0',
            }}
          >
            {/* Outer golden halo circle */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1px solid rgba(212,175,136,0.22)',
                background: 'radial-gradient(circle, rgba(212,175,136,0.08) 0%, transparent 70%)',
              }} 
            />

            {/* Glowing Amber Liquid Atmosphere */}
            <div 
              style={{
                position: 'absolute',
                width: '180px',
                height: '220px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(184,146,74,0.45) 0%, rgba(212,175,136,0.25) 45%, transparent 75%)',
                filter: 'blur(28px)',
              }} 
            />

            {/* Abstract Perfume Silhouette Container (Heavily Blurred & Mystical) */}
            <div 
              style={{
                position: 'relative',
                width: '190px',
                height: '260px',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                border: '1px solid rgba(212,175,136,0.25)',
                background: 'linear-gradient(180deg, rgba(24,20,15,0.85) 0%, rgba(12,10,8,0.92) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 20px 48px rgba(0,0,0,0.8)',
              }}
            >
              {/* Abstract Glass Flacon Silhouette */}
              <div 
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.92,
                }}
              >
                {/* Cap Silhouette */}
                <div 
                  style={{
                    width: '46px',
                    height: '34px',
                    borderRadius: '4px 4px 0 0',
                    background: 'linear-gradient(180deg, rgba(232,213,183,0.7) 0%, rgba(184,146,74,0.45) 50%, rgba(74,56,26,0.85) 100%)',
                    border: '1px solid rgba(212,175,136,0.45)',
                    borderBottom: 'none',
                    filter: 'blur(1.5px)',
                  }} 
                />
                {/* Neck Ring */}
                <div 
                  style={{
                    width: '54px',
                    height: '6px',
                    backgroundColor: 'rgba(212,175,136,0.75)',
                    borderRadius: '9999px',
                    margin: '2px 0',
                    filter: 'blur(0.8px)',
                  }} 
                />
                {/* Bottle Body Silhouette with Amber Liquid Core */}
                <div 
                  style={{
                    position: 'relative',
                    width: '130px',
                    height: '170px',
                    borderRadius: '4px 4px 18px 18px',
                    overflow: 'hidden',
                    background: 'linear-gradient(180deg, rgba(42,32,22,0.95) 0%, rgba(66,44,23,0.85) 45%, rgba(18,13,8,0.98) 100%)',
                    border: '1px solid rgba(212,175,136,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 0 24px rgba(212,175,136,0.3)',
                  }}
                >
                  {/* Internal Warm Amber Core Liquid */}
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '10px',
                      right: '10px',
                      height: '110px',
                      borderRadius: '0 0 14px 14px',
                      background: 'linear-gradient(to top, rgba(212,175,136,0.45) 0%, rgba(160,112,56,0.35) 60%, transparent 100%)',
                      filter: 'blur(8px)',
                    }} 
                  />
                  
                  {/* Mystery Badge */}
                  <div 
                    style={{
                      position: 'relative',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '8px',
                    }}
                  >
                    <Sparkles style={{ width: '20px', height: '20px', color: '#E8D5B7', marginBottom: '6px' }} />
                    <span 
                      style={{
                        fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                        fontSize: '0.68rem',
                        letterSpacing: '0.28em',
                        textTransform: 'uppercase',
                        color: 'rgba(232,213,183,0.9)',
                      }}
                    >
                      Private Blend
                    </span>
                    <span 
                      style={{
                        fontSize: '0.55rem',
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: '#A6947D',
                        marginTop: '3px',
                      }}
                    >
                      Confidential
                    </span>
                  </div>
                </div>
              </div>

              {/* Frosted Glass Distortion Lens (Keeps product mystique) */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(10,8,6,0.3)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderRadius: '24px',
                  pointerEvents: 'none',
                }} 
              />
            </div>

            {/* Teaser label pill */}
            <div 
              style={{
                position: 'absolute',
                bottom: '-12px',
                padding: '0.3rem 0.9rem',
                borderRadius: '9999px',
                backgroundColor: '#0F0D0A',
                border: '1px solid rgba(212,175,136,0.45)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              <p 
                style={{
                  fontSize: '0.62rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.24em',
                  fontWeight: 600,
                  color: '#D4AF88',
                  margin: 0,
                }}
              >
                First Edition • 2026
              </p>
            </div>
          </motion.div>

          {/* ── Form Section: Dual Email / Phone Notify Me ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.55 }}
            style={{
              width: '100%',
              maxWidth: '440px',
              marginTop: '0.5rem',
            }}
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    backgroundColor: 'rgba(18,15,12,0.92)',
                    border: '1px solid rgba(212,175,136,0.28)',
                    borderRadius: '18px',
                    padding: '1.5rem',
                    boxShadow: '0 16px 44px rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                  }}
                >
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <span 
                      style={{
                        fontSize: '0.74rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        color: '#E8D5B7',
                      }}
                    >
                      Request VIP Access
                    </span>
                    
                    {/* Toggle between Email & Phone */}
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                        borderRadius: '8px',
                        backgroundColor: '#0A0806',
                        border: '1px solid rgba(212,175,136,0.2)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => { setInputType('email'); setErrorMessage(''); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: inputType === 'email' ? 600 : 400,
                          backgroundColor: inputType === 'email' ? '#D4AF88' : 'transparent',
                          color: inputType === 'email' ? '#0A0806' : '#A6947D',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Mail size={12} />
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => { setInputType('phone'); setErrorMessage(''); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: inputType === 'phone' ? 600 : 400,
                          backgroundColor: inputType === 'phone' ? '#D4AF88' : 'transparent',
                          color: inputType === 'phone' ? '#0A0806' : '#A6947D',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Phone size={12} />
                        WhatsApp / SMS
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {inputType === 'email' ? (
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          style={{
                            width: '100%',
                            height: '48px',
                            padding: '0 1rem',
                            borderRadius: '12px',
                            backgroundColor: '#090705',
                            border: '1px solid rgba(212,175,136,0.3)',
                            color: '#FAF6F0',
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s',
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div 
                          style={{
                            position: 'absolute',
                            left: '14px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#D4AF88',
                            borderRight: '1px solid rgba(212,175,136,0.3)',
                            paddingRight: '8px',
                            pointerEvents: 'none',
                          }}
                        >
                          +91
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter 10-digit mobile number"
                          style={{
                            width: '100%',
                            height: '48px',
                            paddingLeft: '56px',
                            paddingRight: '1rem',
                            borderRadius: '12px',
                            backgroundColor: '#090705',
                            border: '1px solid rgba(212,175,136,0.3)',
                            color: '#FAF6F0',
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s',
                          }}
                        />
                      </div>
                    )}

                    {errorMessage && (
                      <p style={{ fontSize: '0.75rem', color: '#E57373', textAlign: 'left', margin: '2px 0 0 4px' }}>
                        {errorMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(90deg, #D4AF88 0%, #E8D5B7 50%, #B8924A 100%)',
                        color: '#0D0B0A',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 20px rgba(212,175,136,0.35)',
                        transition: 'transform 0.2s, filter 0.2s',
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        <span>Reserving Access...</span>
                      ) : (
                        <>
                          <span>Notify Me At Launch</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>

                  <div 
                    style={{
                      marginTop: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                      fontSize: '0.68rem',
                      color: '#A6947D',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={12} style={{ color: '#D4AF88' }} />
                      Strictly No Spam
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Flame size={12} style={{ color: '#D4AF88' }} />
                      VIP Launch Privileges
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    backgroundColor: 'rgba(18,15,12,0.96)',
                    border: '1px solid rgba(212,175,136,0.45)',
                    borderRadius: '18px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    boxShadow: '0 16px 44px rgba(212,175,136,0.18)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                  }}
                >
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(212,175,136,0.15)',
                      border: '1px solid rgba(212,175,136,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem auto',
                      color: '#D4AF88',
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 
                    style={{
                      fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#FAF6F0',
                      margin: 0,
                      letterSpacing: '0.04em',
                    }}
                  >
                    VIP Early Access Confirmed
                  </h3>
                  <p 
                    style={{
                      fontSize: '0.82rem',
                      color: '#C8B89E',
                      lineHeight: 1.6,
                      margin: '0.6rem 0 0 0',
                    }}
                  >
                    You have reserved priority access for <strong style={{ color: '#D4AF88' }}>{registeredEmailOrPhone}</strong>.
                    You will receive private notification prior to the public drop.
                  </p>
                  <div 
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(212,175,136,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span 
                      style={{
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.24em',
                        color: '#D4AF88',
                        fontWeight: 600,
                      }}
                    >
                      ✦ Private Allocation Reserved ✦
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Instagram Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <a
              href="https://www.instagram.com/avoro.official/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '9999px',
                border: '1px solid rgba(212,175,136,0.25)',
                backgroundColor: 'rgba(18,15,12,0.7)',
                color: '#C8B89E',
                textDecoration: 'none',
                transition: 'all 0.3s',
              }}
            >
              <InstagramIcon size={15} color="#D4AF88" />
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                Follow our journey <strong style={{ color: '#E8D5B7', fontWeight: 600 }}>@avoro.official</strong>
              </span>
              <ArrowRight size={12} style={{ color: '#D4AF88' }} />
            </a>
          </motion.div>
        </main>

        {/* ── Footer / Bottom Seal: MADE IN INDIA • PREMIUM FRAGRANCES ── */}
        <footer 
          style={{
            width: '100%',
            maxWidth: '1000px',
            paddingTop: '2rem',
            paddingBottom: '0.5rem',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderTop: '1px solid rgba(212,175,136,0.15)',
            fontSize: '0.72rem',
            color: '#A6947D',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF88' }} />
            <span style={{ letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, color: '#E8D5B7' }}>
              MADE IN INDIA
            </span>
            <span style={{ color: 'rgba(212,175,136,0.5)' }}>•</span>
            <span style={{ letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(200,184,158,0.85)' }}>
              PREMIUM FRAGRANCES
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', letterSpacing: '0.08em', fontSize: '0.68rem', color: '#736655' }}>
            <span>© 2026 AVORO. ALL RIGHTS RESERVED.</span>
            
            {/* Store preview link */}
            <Link 
              href="/collection" 
              style={{
                color: '#D4AF88',
                textDecoration: 'none',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                opacity: 0.6,
                transition: 'opacity 0.2s',
              }}
            >
              Store Preview →
            </Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
