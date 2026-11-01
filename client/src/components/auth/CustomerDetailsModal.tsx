'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, AuthUser } from '@/store/authStore';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: (updatedUser: AuthUser) => void;
  initialPhone?: string;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  backgroundColor: '#1c150e',
  border: '1.5px solid rgba(212, 175, 136, 0.3)',
  borderRadius: '4px',
  fontFamily: 'var(--font-ui)',
  fontSize: '0.88rem',
  color: '#f5ede2',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function CustomerDetailsModal({
  isOpen,
  onClose,
  onSuccess,
  initialPhone = '',
}: CustomerDetailsModalProps) {
  const { user, updateUser } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      const isDefaultName = user?.firstName === 'Customer';
      const isDefaultEmail = user?.email?.startsWith('user_') && user?.email?.endsWith('@avoro.in');

      setFirstName(isDefaultName ? '' : user?.firstName || '');
      setLastName(user?.lastName && !isDefaultName ? user.lastName : '');
      setEmail(isDefaultEmail ? '' : user?.email || '');
      setPhone(user?.phone || initialPhone || '');
    }
  }, [isOpen, user, initialPhone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstName) {
      setError('Please enter your first name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          email: trimmedEmail,
          phone: trimmedPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update customer details.');
      }

      const updatedData: Partial<AuthUser> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      };

      updateUser(updatedData);

      if (onSuccess) {
        onSuccess({
          ...user!,
          ...updatedData,
        });
      }

      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to save customer details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#120d08',
          border: '1px solid rgba(212, 175, 136, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          padding: '2.25rem 2rem',
          color: '#f5ede2',
          position: 'relative',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Header / Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              border: '1px solid rgba(212, 175, 136, 0.4)',
              borderRadius: '20px',
              padding: '0.3rem 0.9rem',
              marginBottom: '0.8rem',
            }}
          >
            Welcome to AVORO
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.65rem',
              fontWeight: 600,
              color: '#f5ede2',
              margin: 0,
            }}
          >
            Customer Details
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.82rem',
              color: '#a89d91',
              marginTop: '0.4rem',
              lineHeight: 1.4,
            }}
          >
            Please enter your details to complete your account profile.
          </p>
        </div>

        {/* Error Message Banner */}
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.82rem',
              color: '#fca5a5',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.72rem',
                  color: '#c5b8aa',
                  marginBottom: '0.35rem',
                }}
              >
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.72rem',
                  color: '#c5b8aa',
                  marginBottom: '0.35rem',
                }}
              >
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                color: '#c5b8aa',
                marginBottom: '0.35rem',
              }}
            >
              Mobile Number *
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                backgroundColor: '#1c150e',
                border: '1.5px solid rgba(212, 175, 136, 0.3)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 0.9rem',
                  backgroundColor: '#271d14',
                  borderRight: '1px solid rgba(212, 175, 136, 0.3)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.88rem',
                  color: '#d4af37',
                  fontWeight: 600,
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit phone number"
                style={{
                  flex: 1,
                  width: '100%',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.88rem',
                  color: '#f5ede2',
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                color: '#c5b8aa',
                marginBottom: '0.35rem',
              }}
            >
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={INPUT_STYLE}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.95rem 1rem',
              marginTop: '0.5rem',
              backgroundColor: '#d4af37',
              backgroundImage: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#120d08',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.25)',
            }}
          >
            {loading ? 'Saving Details...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
