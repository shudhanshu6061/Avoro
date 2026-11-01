import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  FileText,
  Tags,
  Settings,
  LogOut,
  Globe,
  X,
  Mail,
  Inbox,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/subscribers', icon: Mail, label: 'Subscribers' },
  { to: '/messages', icon: Inbox, label: 'Messages' },
  { to: '/reviews', icon: MessageSquare, label: 'Reviews' },
  { to: '/articles', icon: FileText, label: 'Journal' },
  { to: '/seo', icon: Globe, label: 'SEO Manager' },
  { to: '/discounts', icon: Tags, label: 'Discounts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  // Fetch unread messages count
  const { data: messageStats } = useQuery({
    queryKey: ['admin-messages-unread-count'],
    queryFn: () => api.get('/admin/messages/stats').then((r) => r.data),
    refetchInterval: 15000,
  });
  const unreadCount = messageStats?.newCount || 0;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-[260px] bg-white border-r border-border flex flex-col z-50 transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="h-[72px] flex items-center justify-between px-7 border-b border-border">
        <div className="flex items-center">
          <span className="text-xl font-display font-bold text-text tracking-[0.15em]">AVORO</span>
          <span className="ml-2 text-[9px] font-medium text-gold-dark bg-gold-pale px-2 py-0.5 rounded-full uppercase tracking-wider">
            Admin
          </span>
        </div>
        <button type="button" onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-bg-hover transition" aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.15em] px-3 mb-3">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-gold-pale to-gold-pale/40 text-gold-dark shadow-[0_1px_3px_rgba(201,169,110,0.1)]'
                  : 'text-text-mid hover:bg-bg-hover hover:text-text'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
            <span className="flex-1">{label}</span>
            {label === 'Messages' && unreadCount > 0 && (
              <span className="bg-gold text-[#090806] text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-white text-xs font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-danger/80 hover:bg-danger/5 hover:text-danger w-full transition-all"
        >
          <LogOut className="w-[16px] h-[16px]" strokeWidth={1.8} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}