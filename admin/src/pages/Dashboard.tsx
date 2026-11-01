import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, Users, IndianRupee, TrendingUp, ArrowRight, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { format } from 'date-fns';

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
  ordersByStatus: { status: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PROCESSING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  SHIPPED: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  PENDING: { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' },
};

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data),
  });

  const { data: messageStats } = useQuery({
    queryKey: ['admin-messages-unread-count'],
    queryFn: () => api.get('/admin/messages/stats').then((r) => r.data),
  });
  const unreadMessagesCount = messageStats?.newCount || 0;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-border-soft rounded-xl w-72 animate-pulse" />
        <div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-white rounded-[20px] animate-pulse" />)}</div>
        <div className="grid grid-cols-3 gap-6"><div className="col-span-2 h-[380px] bg-white rounded-[20px] animate-pulse" /><div className="h-[380px] bg-white rounded-[20px] animate-pulse" /></div>
      </div>
    );
  }
  if (!data) return null;

  const stats = [
    { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString()}`, desc: 'Lifetime earnings', icon: IndianRupee, color: '#C9A96E' },
    { label: 'Total Orders', value: data.totalOrders, desc: 'Orders placed', icon: ShoppingCart, color: '#8B7355' },
    { label: 'Products', value: data.totalProducts, desc: 'Active in store', icon: Package, color: '#A08060' },
    { label: 'Customers', value: data.totalUsers, desc: 'Registered accounts', icon: Users, color: '#7C6A4F' },
  ];

  const statusCounts = data.ordersByStatus || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-text-muted mt-1">Your store at a glance</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-[12px] font-medium text-text-mid">{format(new Date(), 'EEE, dd MMM yyyy')}</span>
        </div>
      </div>

      {/* New Message Indicator */}
      {unreadMessagesCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gold-pale/30 border border-gold/20 rounded-xl px-5 py-3.5 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
            </span>
            <span className="text-[13.5px] font-medium text-gold-dark">
              You have {unreadMessagesCount} new message{unreadMessagesCount > 1 ? 's' : ''} in your inbox.
            </span>
          </div>
          <Link to="/messages" className="text-[12px] font-semibold text-gold-dark hover:underline flex items-center gap-1">
            Go to Inbox <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="relative bg-white rounded-[18px] p-6 border border-border/50 overflow-hidden group hover:border-border transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04] -translate-y-1/2 translate-x-1/2" style={{ background: s.color }} />
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon className="w-[18px] h-[18px]" style={{ color: s.color }} strokeWidth={2} />
              </div>
            </div>
            <p className="text-[26px] font-bold text-text leading-none tracking-tight">{s.value}</p>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-[18px] border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-[#C9A96E15] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gold-dark" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-text">Revenue Trend</h2>
                <p className="text-[11px] text-text-muted">Monthly performance</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-bg-soft rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-[10px] font-medium text-text-muted">Revenue</span>
            </div>
          </div>
          <div className="px-2 pb-3 pt-1">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyRevenue} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A96E" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#C9A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F0EBE3" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9C9488', fontSize: 10, fontWeight: 500 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9C9488', fontSize: 10 }} tickFormatter={(v) => v === 0 ? '₹0' : `₹${(v/1000).toFixed(0)}k`} width={48} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E8E2D9', borderRadius: 12, fontSize: 12, padding: '10px 14px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} labelStyle={{ color: '#6B6259', fontWeight: 600, marginBottom: 2 }} formatter={(v: any) => [`₹${Number(v || 0).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#C9A96E" fill="url(#goldFill)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#C9A96E', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-[18px] border border-border/50 p-6 flex flex-col">
          <h2 className="text-[14px] font-semibold text-text mb-1">Order Status</h2>
          <p className="text-[11px] text-text-muted mb-6">Current breakdown</p>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {statusCounts.length > 0 ? statusCounts.map((s) => {
              const cfg = statusConfig[s.status] || statusConfig.PENDING;
              const pct = data.totalOrders > 0 ? Math.round((s.count / data.totalOrders) * 100) : 0;
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-[12px] font-medium text-text capitalize">{s.status.toLowerCase()}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-text-mid">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-bg-soft rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.dot} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-text-muted text-center py-6">No order data</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[14px] font-semibold text-text">Recent Orders</h2>
          <Link to="/orders" className="flex items-center gap-1 text-[11px] font-semibold text-gold-dark hover:text-gold uppercase tracking-wider transition">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-t border-b border-border/50 bg-[#FAFAF7]">
              <th className="text-left px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Order</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Customer</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Status</th>
              <th className="text-right px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.recentOrders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.PENDING;
              return (
                <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-[#FDFCFA] transition">
                  <td className="px-6 py-4"><code className="text-[11px] text-text-mid bg-bg-soft px-2 py-1 rounded font-mono">#{order.id.slice(0, 8).toUpperCase()}</code></td>
                  <td className="px-4 py-4 text-[13px] font-medium text-text">{order.user?.firstName ?? 'Guest'} {order.user?.lastName ?? ''}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[14px] font-bold text-text">₹{order.totalPrice.toLocaleString()}</td>
                </tr>
              );
            })}
            {data.recentOrders.length === 0 && (
              <tr><td colSpan={4} className="py-16 text-center text-text-muted text-[13px]">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
