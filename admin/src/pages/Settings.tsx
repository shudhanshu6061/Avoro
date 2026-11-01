import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Shield, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STORE_KEYS = [
  { key: 'store_name', label: 'Store Name', type: 'text' },
  { key: 'store_email', label: 'Contact Email', type: 'email' },
  { key: 'tax_rate', label: 'Tax Rate (%)', type: 'number' },
  { key: 'announcement_bar', label: 'Announcement Bar Text', type: 'text' },
];

// Delivery settings are rendered inline with toggles

export default function Settings() {
  const queryClient = useQueryClient();
  const { user, setup2FA, enable2FA } = useAuthStore();

  const [values, setValues] = useState<Record<string, string>>({});
  const [qrCode, setQrCode] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const { data } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings').then((r) => r.data),
  });

  useEffect(() => { if (data) setValues(data); }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => api.put('/admin/settings', {
      settings: Object.entries(values).map(([key, value]) => ({ key, value })),
    }),
    onSuccess: () => { toast.success('Settings saved'); queryClient.invalidateQueries({ queryKey: ['admin-settings'] }); },
    onError: () => toast.error('Failed to save'),
  });

  const handleSetup2FA = async () => {
    try {
      const { qrCode } = await setup2FA();
      setQrCode(qrCode);
    } catch {
      toast.error('Failed to setup 2FA');
    }
  };

  const handleEnable2FA = async () => {
    try {
      await enable2FA(tfaCode);
      toast.success('2FA enabled!');
      setQrCode(''); setTfaCode('');
    } catch {
      toast.error('Invalid code');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error('Fill in all fields'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      await api.post('/admin/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  const inputClass = "w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">Settings</h1>
        <p className="text-[13px] text-text-muted mt-1">Configure your store and security</p>
      </div>

      {/* Store Settings */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50">
          <h2 className="text-[14px] font-semibold text-text">Store Configuration</h2>
          <p className="text-[11px] text-text-muted mt-0.5">General store settings and preferences</p>
        </div>
        <div className="p-6 space-y-5">
          {STORE_KEYS.map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">{label}</label>
              <input type={type} value={values[key] || ''} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50">
          <h2 className="text-[14px] font-semibold text-text">Delivery Settings</h2>
          <p className="text-[11px] text-text-muted mt-0.5">Configure shipping options, prices, and delivery times</p>
        </div>
        <div className="p-6 space-y-6">

          {/* Free Shipping */}
          <div className="bg-bg rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-text">Free Shipping</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Offer free delivery above a certain order value</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={values.free_shipping_enabled === 'true'} onChange={(e) => setValues({ ...values, free_shipping_enabled: e.target.checked ? 'true' : 'false' })} className="sr-only peer" />
                <div className="w-10 h-5 bg-border rounded-full peer peer-checked:bg-gold after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
            {values.free_shipping_enabled === 'true' && (
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Minimum Order Value (₹)</label>
                <input type="number" value={values.free_shipping_threshold || ''} placeholder="e.g. 2999" onChange={(e) => setValues({ ...values, free_shipping_threshold: e.target.value })} className={inputClass} />
                <p className="text-[10px] text-text-muted mt-1.5">Orders above this amount qualify for free standard delivery</p>
              </div>
            )}
          </div>

          {/* Standard Delivery */}
          <div className="bg-bg rounded-xl p-5 space-y-4">
            <h3 className="text-[13px] font-semibold text-text">Standard Delivery</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Price (₹)</label>
                <input type="number" value={values.standard_shipping_price || ''} placeholder="e.g. 99" onChange={(e) => setValues({ ...values, standard_shipping_price: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Delivery Time</label>
                <input type="text" value={values.standard_shipping_days || ''} placeholder="e.g. 5–7 business days" onChange={(e) => setValues({ ...values, standard_shipping_days: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Express Delivery */}
          <div className="bg-bg rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-text">Express Delivery</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Offer faster delivery at a premium</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={values.express_enabled === 'true'} onChange={(e) => setValues({ ...values, express_enabled: e.target.checked ? 'true' : 'false' })} className="sr-only peer" />
                <div className="w-10 h-5 bg-border rounded-full peer peer-checked:bg-gold after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
            {values.express_enabled === 'true' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Price (₹)</label>
                  <input type="number" value={values.express_shipping_price || ''} placeholder="e.g. 599" onChange={(e) => setValues({ ...values, express_shipping_price: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Delivery Time</label>
                  <input type="text" value={values.express_shipping_days || ''} placeholder="e.g. 2–3 business days" onChange={(e) => setValues({ ...values, express_shipping_days: e.target.value })} className={inputClass} />
                </div>
              </div>
            )}
          </div>

          {/* COD */}
          <div className="bg-bg rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-text">Cash on Delivery (COD)</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Allow customers to pay at the time of delivery</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={values.cod_enabled === 'true'} onChange={(e) => setValues({ ...values, cod_enabled: e.target.checked ? 'true' : 'false' })} className="sr-only peer" />
                <div className="w-10 h-5 bg-border rounded-full peer peer-checked:bg-gold after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
            {values.cod_enabled === 'true' && (
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Extra COD Charge (₹)</label>
                <input type="number" value={values.cod_charge || ''} placeholder="e.g. 49 (0 for no extra charge)" onChange={(e) => setValues({ ...values, cod_charge: e.target.value })} className={inputClass} />
                <p className="text-[10px] text-text-muted mt-1.5">Additional charge for COD orders (enter 0 for free)</p>
              </div>
            )}
          </div>

          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition disabled:opacity-50 shadow-sm hover:shadow-md">
            <Save className="w-4 h-4" strokeWidth={2} /> {saveMutation.isPending ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#C9A96E15] flex items-center justify-center">
              <Lock className="w-4 h-4 text-gold-dark" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-text">Change Password</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Update your admin account password</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className={inputClass} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" className={inputClass} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className={inputClass} />
          </div>
          <button onClick={handleChangePassword} disabled={pwLoading}
            className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition disabled:opacity-50 shadow-sm hover:shadow-md">
            <Lock className="w-4 h-4" strokeWidth={2} /> {pwLoading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#C9A96E15] flex items-center justify-center">
              <Shield className="w-4 h-4 text-gold-dark" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-text">Two-Factor Authentication</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Extra layer of security for your account</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {user?.twoFactorEnabled ? (
            <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-[13px] font-semibold">2FA is enabled on your account</p>
            </div>
          ) : !qrCode ? (
            <div>
              <p className="text-[13px] text-text-muted mb-4">Protect your admin account with time-based one-time passwords.</p>
              <button onClick={handleSetup2FA}
                className="px-5 py-2.5 bg-bg border border-border rounded-xl text-[13px] font-semibold text-text-mid hover:text-text hover:border-gold/30 transition">
                Setup 2FA
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] text-text-muted">Scan this QR code with your authenticator app:</p>
              <img src={qrCode} alt="2FA QR" className="w-48 h-48 rounded-xl border border-border p-2 bg-white" />
              <div className="flex gap-3 max-w-xs">
                <input value={tfaCode} onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code" className={`flex-1 ${inputClass} text-center tracking-[0.3em] font-mono`} maxLength={6} />
                <button onClick={handleEnable2FA} disabled={tfaCode.length !== 6}
                  className="px-5 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-[13px] font-semibold transition disabled:opacity-50 shadow-sm">
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
