import { create } from 'zustand';
import api from '@/lib/api';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'SUPERADMIN';
  twoFactorEnabled: boolean;
}

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean }>;
  verify2FA: (code: string) => Promise<void>;
  setup2FA: () => Promise<{ qrCode: string; secret: string }>;
  enable2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const { data } = await api.post('/admin/auth/login', { email, password });
    if (data.requires2FA) {
      return { requires2FA: true };
    }
    set({ user: data.user });
    return {};
  },

  verify2FA: async (code) => {
    const { data } = await api.post('/admin/auth/verify-2fa', { code });
    set({ user: data.user });
  },

  setup2FA: async () => {
    const { data } = await api.post('/admin/auth/setup-2fa');
    return { qrCode: data.qrCode, secret: data.secret };
  },

  enable2FA: async (code) => {
    await api.post('/admin/auth/enable-2fa', { code });
    set((s) => s.user ? { user: { ...s.user, twoFactorEnabled: true } } : {});
  },

  logout: async () => {
    await api.post('/admin/auth/logout');
    set({ user: null });
  },

  checkSession: async () => {
    try {
      const { data } = await api.get('/admin/auth/me');
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
