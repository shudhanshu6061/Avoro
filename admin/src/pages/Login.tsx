import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, verify2FA } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [code, setCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requires2FA) {
        setNeeds2FA(true);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verify2FA(code);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gold-pale/40 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-gold-light/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-border shadow-sm mb-5">
            <ShieldCheck className="w-7 h-7 text-gold" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-[0.2em] text-text">AVORO</h1>
          <p className="text-text-muted text-xs mt-2 tracking-[0.15em] uppercase">Admin Console</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          {!needs2FA ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-[11px] text-text-muted font-medium mb-2 block uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted font-medium mb-2 block uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-200 pr-11"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-mid transition"
                  >
                    {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 disabled:opacity-50 shadow-[0_4px_16px_rgba(201,169,110,0.25)] hover:shadow-[0_4px_20px_rgba(201,169,110,0.35)] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FA} className="space-y-5">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-3">
                  <Lock className="w-5 h-5 text-gold" />
                </div>
                <h2 className="text-sm font-medium text-text">Two-Factor Authentication</h2>
                <p className="text-xs text-text-muted mt-1">Enter the code from your authenticator app</p>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-4 text-center text-xl tracking-[0.6em] font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-200"
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 disabled:opacity-50 shadow-[0_4px_16px_rgba(201,169,110,0.25)]"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setNeeds2FA(false); setCode(''); }}
                className="w-full text-xs text-text-muted hover:text-text-mid transition text-center py-1"
              >
                Back to login
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-text-muted/40 mt-6 tracking-wider">
          AVORO PERFUMES &mdash; ADMIN
        </p>
      </div>
    </div>
  );
}
