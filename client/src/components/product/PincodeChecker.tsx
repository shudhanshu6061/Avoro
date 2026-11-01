'use client';

import { useState } from 'react';
import { Truck, CheckCircle2, XCircle, Loader2, MapPin, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

export default function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [result, setResult] = useState<{
    available: boolean;
    edd?: string;
    courier?: string;
    message?: string;
    pincodeChecked?: string;
  } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPincode = pincode.trim();
    if (!cleanPincode || cleanPincode.length !== 6 || !/^\d{6}$/.test(cleanPincode)) {
      setResult({
        available: false,
        message: 'Please enter a valid 6-digit PIN code.',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/shipping/serviceability?pincode=${cleanPincode}`);
      const data = await response.json();

      if (response.ok && data?.status === 200 && data?.data?.available_courier_companies?.length > 0) {
        const couriers = data.data.available_courier_companies;
        const fastest = couriers.sort((a: any, b: any) => (a.etd || 99) - (b.etd || 99))[0];
        const eddDate = fastest?.etd ? `${fastest.etd} Business Days` : '3–5 Business Days';

        setResult({
          available: true,
          edd: eddDate,
          courier: fastest?.courier_name || 'Express Air Courier',
          message: `Delivery available to PIN code ${cleanPincode}`,
          pincodeChecked: cleanPincode,
        });
      } else if (response.ok && data?.status === 200) {
        setResult({
          available: true,
          edd: '3–5 Business Days',
          courier: 'Standard Courier',
          message: `Delivery available to PIN code ${cleanPincode}`,
          pincodeChecked: cleanPincode,
        });
      } else {
        setResult({
          available: false,
          message: data?.message || `Delivery is currently not available for PIN code ${cleanPincode}.`,
          pincodeChecked: cleanPincode,
        });
      }
    } catch (err) {
      console.error('Pincode check error:', err);
      // Fallback for local development or API offline
      setResult({
        available: true,
        edd: '3–5 Business Days',
        courier: 'Express Air Courier',
        message: `Standard delivery available to PIN code ${cleanPincode}`,
        pincodeChecked: cleanPincode,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPincode('');
  };

  return (
    <div
      style={{
        background: 'var(--bg-soft)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.15rem 1.25rem',
        margin: '1.25rem 0',
        boxShadow: '0 2px 10px rgba(180, 150, 120, 0.05)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--gold-pale)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-dark)',
            }}
          >
            <Truck size={15} />
          </div>
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text)',
                lineHeight: 1.2,
              }}
            >
              Check Delivery & EDD
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.68rem',
                color: 'var(--text-soft)',
                marginTop: '1px',
              }}
            >
              Enter PIN code for delivery estimate & COD availability
            </p>
          </div>
        </div>

        {result && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'none',
              border: 'none',
              fontSize: '0.68rem',
              color: 'var(--gold-dark)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <RefreshCw size={11} /> Change
          </button>
        )}
      </div>

      {/* Input Form */}
      {!result ? (
        <form onSubmit={handleCheck} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <MapPin
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isFocused ? 'var(--gold-dark)' : 'var(--text-muted)',
                transition: 'color 0.2s ease',
              }}
            />
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit Pincode"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-ui)',
                color: 'var(--text)',
                background: 'var(--bg-card)',
                border: isFocused ? '1.5px solid var(--gold-dark)' : '1.5px solid var(--border)',
                borderRadius: '8px',
                outline: 'none',
                boxShadow: isFocused ? '0 0 0 3px rgba(212, 175, 136, 0.2)' : 'none',
                transition: 'all 0.2s ease',
                letterSpacing: '0.06em',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || pincode.length !== 6}
            style={{
              padding: '0 1.25rem',
              height: '42px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: pincode.length === 6 ? 'var(--text)' : 'rgba(15,15,15,0.3)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: loading || pincode.length !== 6 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'CHECK'}
          </button>
        </form>
      ) : (
        /* Result View */
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: result.available ? 'rgba(235, 247, 240, 0.85)' : 'rgba(254, 242, 242, 0.85)',
            border: result.available ? '1px solid rgba(45, 122, 79, 0.25)' : '1px solid rgba(225, 29, 72, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            transition: 'all 0.3s ease',
          }}
        >
          {result.available ? (
            <CheckCircle2 size={18} style={{ color: '#2d7a4f', flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <XCircle size={18} style={{ color: '#e11d48', flexShrink: 0, marginTop: '2px' }} />
          )}

          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: result.available ? '#1e5335' : '#9f1239',
                lineHeight: 1.3,
              }}
            >
              {result.message}
            </p>

            {result.available && result.edd && (
              <div
                style={{
                  marginTop: '0.5rem',
                  paddingTop: '0.4rem',
                  borderTop: '1px dashed rgba(45, 122, 79, 0.2)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  fontSize: '0.72rem',
                  color: '#266742',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} />
                  <span>
                    Est. Delivery: <strong>{result.edd}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={13} />
                  <span>COD Available</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Highlights / Badges when no check active */}
      {!result && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-soft)',
            fontSize: '0.68rem',
            color: 'var(--text-soft)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>✓</span> Free Shipping &gt; ₹999
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>✓</span> 7 Days Returns
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>✓</span> 100% Authentic
          </span>
        </div>
      )}
    </div>
  );
}

