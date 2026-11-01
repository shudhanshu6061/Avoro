import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Eye, X, ShoppingCart, IndianRupee, Phone, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

interface CustomerDetail extends Customer {
  orders: {
    id: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    orderItems: { name: string; size: string; quantity: number; price: number }[];
  }[];
}

export default function Customers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => api.get(`/admin/customers?page=${page}&search=${search}`).then((r) => r.data),
  });

  const { data: detail } = useQuery({
    queryKey: ['admin-customer', selectedId],
    queryFn: () => api.get(`/admin/customers/${selectedId}`).then((r) => r.data as CustomerDetail),
    enabled: !!selectedId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      if (selectedId && deleteTarget && selectedId === deleteTarget.id) {
        setSelectedId(null);
      }
      setDeleteTarget(null);
    },
  });

  const customers: Customer[] = data?.customers || [];
  const totalPages = data?.pages || 1;

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    PROCESSING: 'bg-blue-50 text-blue-700',
    SHIPPED: 'bg-indigo-50 text-indigo-700',
    DELIVERED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">Customers</h1>
        <p className="text-[13px] text-text-muted mt-0.5">View customer information and order history</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Customer</th>
              <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Mobile Number</th>
              <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Email</th>
              <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Orders</th>
              <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Total Spent</th>
              <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Joined</th>
              <th className="text-right text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-[13px] text-text-muted">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-[13px] text-text-muted italic">No customers found</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-bg-hover/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.firstName?.[0] || 'C'}{c.lastName?.[0] || ''}
                      </div>
                      <span className="text-[13px] font-medium text-text">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-text-mid">
                    {c.phone ? (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[12px]">
                        <Phone className="w-3 h-3 text-gold" />
                        +91 {c.phone}
                      </span>
                    ) : (
                      <span className="text-text-muted italic">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-text-mid">{c.email}</td>
                  <td className="px-6 py-4 text-[13px] text-text-mid">{c.totalOrders}</td>
                  <td className="px-6 py-4 text-[13px] font-medium text-text">₹{c.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[13px] text-text-muted">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedId(c.id)}
                        title="View Customer Details"
                        className="p-2 hover:bg-bg rounded-lg text-text-muted hover:text-gold transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: c.id, name: `${c.firstName} ${c.lastName}`.trim() || c.email })}
                        title="Delete Customer"
                        className="p-2 hover:bg-rose-50 rounded-lg text-text-muted hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="p-2 rounded-lg border border-border text-text-muted hover:text-text disabled:opacity-30 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-[13px] text-text-mid">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg border border-border text-text-muted hover:text-text disabled:opacity-30 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedId && detail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedId(null)}>
          <div className="bg-white rounded-2xl border border-border/50 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div>
                <h2 className="text-lg font-display font-semibold text-text">{detail.firstName} {detail.lastName}</h2>
                <div className="flex items-center gap-3 mt-1 text-[12px] text-text-muted">
                  <span>{detail.email}</span>
                  {detail.phone && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-gold font-medium">+91 {detail.phone}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteTarget({ id: detail.id, name: `${detail.firstName} ${detail.lastName}`.trim() || detail.email })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                <button onClick={() => setSelectedId(null)} className="p-2 hover:bg-bg rounded-xl text-text-muted hover:text-text transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 border-b border-border/50">
              <div className="bg-bg rounded-xl p-4 text-center">
                <ShoppingCart className="w-5 h-5 text-gold mx-auto mb-1.5" />
                <p className="text-lg font-semibold text-text">{detail.totalOrders}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Orders</p>
              </div>
              <div className="bg-bg rounded-xl p-4 text-center">
                <IndianRupee className="w-5 h-5 text-gold mx-auto mb-1.5" />
                <p className="text-lg font-semibold text-text">₹{detail.totalSpent.toLocaleString()}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Total Spent</p>
              </div>
              <div className="bg-bg rounded-xl p-4 text-center">
                <p className="text-lg font-semibold text-text mt-6">{new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Joined</p>
              </div>
            </div>

            {/* Orders */}
            <div className="px-6 py-5">
              <h3 className="text-[14px] font-semibold text-text mb-4">Order History</h3>
              {detail.orders.length === 0 ? (
                <p className="text-[13px] text-text-muted italic text-center py-6">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {detail.orders.map((order) => (
                    <div key={order.id} className="bg-bg rounded-xl p-4 border border-border/30">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] text-text-muted font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusColor[order.status] || 'bg-gray-50 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-text-mid">
                          {order.orderItems.map((i) => `${i.name} (${i.size} × ${i.quantity})`).join(', ')}
                        </span>
                        <span className="text-[13px] font-semibold text-text">₹{order.totalPrice.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border/50 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text text-base">Delete Customer</h3>
                <p className="text-xs text-text-muted">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-[13px] text-text-mid leading-relaxed">
              Are you sure you want to delete customer <strong className="text-text font-semibold">{deleteTarget.name}</strong>?
              Their account record will be removed. Order history will be preserved as unlinked records.
            </p>
            {deleteMutation.isError && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-600 text-xs">
                {(deleteMutation.error as any)?.response?.data?.message || 'Failed to delete customer.'}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-xs font-medium text-text-mid hover:text-text bg-bg hover:bg-border/40 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Customer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
