'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import CustomerDetailsModal from '@/components/auth/CustomerDetailsModal';

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

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account/profile';
  const { isLoggedIn, login, user } = useAuthStore();

  const [mode, setMode] = useState<'otp' | 'login' | 'register'>('otp');
  
  // OTP state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
  const [countdown, setCountdown] = useState(0);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile Details Modal State after OTP Login
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Already logged in → check if profile details missing or redirect to destination
  useEffect(() => {
    if (isLoggedIn && !showDetailsModal) {
      const isDefaultEmail = user?.email?.startsWith('user_') && user?.email?.endsWith('@avoro.in');
      const isDefaultName = user?.firstName === 'Customer';
      if (isDefaultEmail || isDefaultName) {
        setShowDetailsModal(true);
      } else {
        router.replace(redirectTo);
      }
    }
  }, [isLoggedIn, showDetailsModal, user, router, redirectTo]);


  // Resend OTP countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const resetFormState = () => {
    setError('');
    setMessage('');
    setLoading(false);
  };

  // Handle OTP Send Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phone.replace(/\D/g, '') }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');

      setOtpStep('code');
      setCountdown(30);
      setMessage(data.message || `Verification code sent to +91 ${phone}`);
      if (data.devOtp) {
        console.log(`[AVORO Dev Mode] Test OTP Code: ${data.devOtp}`);
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg === 'Failed to fetch' ? 'Could not connect to authentication server.' : msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verify Request
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the verification code sent to your phone.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP Verification failed.');

      login({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || phone.replace(/\D/g, ''),
        role: data.role,
      });

      if (!data.isProfileComplete || data.firstName === 'Customer' || data.email.includes('@avoro.in')) {
        setShowDetailsModal(true);
      } else {
        router.push(redirectTo);
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Password Login / Registration

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const form = new FormData(e.currentTarget);
    const body =
      mode === 'register'
        ? {
            firstName: form.get('firstName') as string,
            lastName: form.get('lastName') as string,
            email: form.get('email') as string,
            password: form.get('password') as string,
          }
        : {
            email: form.get('email') as string,
            password: form.get('password') as string,
          };

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      });
      router.push(redirectTo);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg === 'Failed to fetch' ? 'Could not reach the server.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
      className="avoro-account-grid"
    >
      {/* ── Left: Branding panel ────────────────── */}
      <div
        style={{
          background: 'linear-gradient(150deg,#1a1209 0%,#2a1c0e 60%,#1f170a 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 'clamp(3rem,8vw,7rem)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 'calc(100dvh - var(--header-offset))',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 30% 50%,rgba(212,175,136,0.12) 0%,transparent 65%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem,6vw,5.5rem)',
              fontWeight: 700,
              color: '#f5ede2',
              letterSpacing: '-0.02em',
              lineHeight: 0.95,
              marginBottom: '1.5rem',
            }}
          >
            AVORO
          </div>

          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem,1.8vw,1.35rem)',
              fontStyle: 'italic',
              color: 'var(--gold)',
              marginBottom: '2rem',
            }}
          >
            The memory of your presence.
          </p>

          <div
            style={{
              width: '40px',
              height: '1.5px',
              background: 'var(--gold-dark)',
              marginBottom: '2rem',
            }}
          />

          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.88rem',
              color: 'rgba(245,237,226,0.5)',
              lineHeight: 1.9,
              maxWidth: '320px',
              fontWeight: 300,
            }}
          >
            Sign in via WhatsApp / SMS OTP to access your orders, track shipments, and experience luxury.
          </p>

          <div
            style={{
              marginTop: '4rem',
              padding: '1.5rem',
              borderLeft: '2px solid rgba(212,175,136,0.25)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontStyle: 'italic',
                color: 'rgba(245,237,226,0.4)',
                lineHeight: 1.75,
              }}
            >
              "Luxury is not about having more.<br />It is about feeling more."
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ───────────────────── */}
      <div
        className="avoro-account-form-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'clamp(2.5rem,6vw,5rem)',
          background: 'var(--bg)',
          minHeight: 'calc(100dvh - var(--header-offset))',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.62rem',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--gold-dark)',
              marginBottom: '1.5rem',
            }}
          >
            {mode === 'otp' ? 'Instant Access' : mode === 'login' ? 'Welcome back' : 'New here'}
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem,3vw,2.6rem)',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '0.6rem',
            }}
          >
            {mode === 'otp' ? 'OTP Sign In' : mode === 'login' ? 'Email Sign In' : 'Create Account'}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.85rem',
              color: 'var(--text-soft)',
              marginBottom: '2rem',
              fontWeight: 300,
            }}
          >
            {mode === 'otp'
              ? 'Receive a 6-digit OTP code directly on WhatsApp / SMS.'
              : mode === 'login'
              ? 'Enter your details to access your account.'
              : 'Join AVORO and be part of something timeless.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div
            className="avoro-account-mode-toggle"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              border: '1.5px solid var(--border-dark)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '2rem',
            }}
          >
            {(['otp', 'login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setOtpStep('phone');
                  resetFormState();
                }}
                style={{
                  padding: '0.75rem 0.25rem',
                  background: mode === m ? 'var(--text)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--text-soft)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.25s, color 0.25s',
                  textAlign: 'center',
                }}
              >
                {m === 'otp' ? 'OTP Login' : m === 'login' ? 'Email' : 'Register'}
              </button>
            ))}
          </div>

          {/* ── Mode 1: BulkBlaster OTP Login ── */}
          {mode === 'otp' && (
            <div>
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.72rem',
                        color: 'var(--text-soft)',
                        marginBottom: '0.4rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Mobile Phone Number
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'stretch',
                        background: 'var(--bg)',
                        border: '1.5px solid var(--border-dark)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 0.9rem',
                          background: 'var(--bg-soft)',
                          borderRight: '1.5px solid var(--border-dark)',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.88rem',
                          color: 'var(--gold-dark)',
                          fontWeight: 600,
                          userSelect: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="Enter 10-digit number"
                        style={{
                          flex: 1,
                          width: '100%',
                          padding: '0.85rem 1.1rem',
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.88rem',
                          color: 'var(--text)',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.style.borderColor = 'var(--gold-dark)';
                            parent.style.boxShadow = '0 0 0 3px rgba(184,146,74,0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.style.borderColor = 'var(--border-dark)';
                            parent.style.boxShadow = 'none';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Error / success messages */}
                  {error && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(200,80,60,0.08)',
                        border: '1px solid rgba(200,80,60,0.2)',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.82rem',
                        color: '#c84a3c',
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="lumina-btn-gold"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    {loading ? 'Sending Code...' : 'Get OTP Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(184,146,74,0.08)',
                      border: '1px solid rgba(184,146,74,0.2)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--text)' }}>
                      OTP sent to: <strong>+91 {phone}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('phone');
                        resetFormState();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--gold-dark)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Edit
                    </button>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.72rem',
                        color: 'var(--text-soft)',
                        marginBottom: '0.4rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      placeholder="••••••"
                      style={{
                        ...INPUT,
                        letterSpacing: '0.35em',
                        fontSize: '1.2rem',
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--gold-dark)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(184,146,74,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-dark)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Resend button */}
                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: countdown > 0 ? 'var(--text-muted)' : 'var(--gold-dark)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.78rem',
                        fontWeight: 500,
                        cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP Code'}
                    </button>
                  </div>

                  {/* Error / success messages */}
                  {error && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(200,80,60,0.08)',
                        border: '1px solid rgba(200,80,60,0.2)',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.82rem',
                        color: '#c84a3c',
                      }}
                    >
                      {error}
                    </div>
                  )}
                  {message && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(45,122,79,0.08)',
                        border: '1px solid rgba(45,122,79,0.2)',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.82rem',
                        color: '#2d7a4f',
                      }}
                    >
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="lumina-btn-gold"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Mode 2 & 3: Email Login & Register ── */}
          {mode !== 'otp' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mode === 'register' && (
                <div className="avoro-form-grid-2">
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.72rem',
                        color: 'var(--text-soft)',
                        marginBottom: '0.4rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      First Name
                    </label>
                    <input
                      name="firstName"
                      required
                      placeholder="e.g. Aryan"
                      style={INPUT}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--gold-dark)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(184,146,74,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-dark)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.72rem',
                        color: 'var(--text-soft)',
                        marginBottom: '0.4rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      required
                      placeholder="e.g. Sharma"
                      style={INPUT}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--gold-dark)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(184,146,74,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-dark)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.72rem',
                    color: 'var(--text-soft)',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  style={INPUT}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--gold-dark)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184,146,74,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-dark)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                  }}
                >
                  <label
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.72rem',
                      color: 'var(--text-soft)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <Link
                      href="#"
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.72rem',
                        color: 'var(--gold-dark)',
                      }}
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  style={INPUT}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--gold-dark)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184,146,74,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-dark)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Error / success messages */}
              {error && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(200,80,60,0.08)',
                    border: '1px solid rgba(200,80,60,0.2)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.82rem',
                    color: '#c84a3c',
                  }}
                >
                  {error}
                </div>
              )}
              {message && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(45,122,79,0.08)',
                    border: '1px solid rgba(45,122,79,0.2)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.82rem',
                    color: '#2d7a4f',
                  }}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="lumina-btn-gold"
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  justifyContent: 'center',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBlock: '1.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}
            >
              OR
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Quick toggle between OTP and Email */}
          <p
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.82rem',
              color: 'var(--text-soft)',
            }}
          >
            {mode === 'otp' ? (
              <>
                Prefer password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetFormState();
                  }}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.82rem',
                    color: 'var(--gold-dark)',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Sign in with Email
                </button>
              </>
            ) : (
              <>
                Want instant login?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('otp');
                    setOtpStep('phone');
                    resetFormState();
                  }}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.82rem',
                    color: 'var(--gold-dark)',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Login with Mobile OTP
                </button>
              </>
            )}
          </p>

          {/* Back to shop */}
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}
            >
              ← Back to AVORO
            </Link>
          </p>
        </div>
      </div>

      {/* ── Customer Profile Details Modal (After OTP Verification) ── */}
      <CustomerDetailsModal
        isOpen={showDetailsModal}
        initialPhone={phone.replace(/\D/g, '')}
        onClose={() => {
          setShowDetailsModal(false);
          router.push(redirectTo);
        }}
        onSuccess={() => {
          setShowDetailsModal(false);
          router.push(redirectTo);
        }}
      />
    </div>
  );
}


