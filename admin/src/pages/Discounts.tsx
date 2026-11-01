import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const empty = { code: '', description: '', type: 'PERCENTAGE' as const, value: 0, minOrderValue: '', maxUses: '', isActive: true, startsAt: '', expiresAt: '' };

export default function Discounts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: () => api.get('/admin/discounts').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editId ? api.put(`/admin/discounts/${editId}`, data) : api.post('/admin/discounts', data),
    onSuccess: () => {
      toast.success(editId ? 'Updated' : 'Created');
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
      setShowForm(false); setEditId(null); setForm(empty);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/discounts/${id}`),
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['admin-discounts'] }); },
  });

  const openEdit = (d: any) => {
    setEditId(d.id);
    setForm({
      code: d.code, description: d.description || '', type: d.type, value: d.value,
      minOrderValue: d.minOrderValue?.toString() || '', maxUses: d.maxUses?.toString() || '',
      isActive: d.isActive, startsAt: d.startsAt?.slice(0, 10) || '', expiresAt: d.expiresAt?.slice(0, 10) || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...form,
      minOrderValue: form.minOrderValue ? +form.minOrderValue : null,
      maxUses: form.maxUses ? +form.maxUses : null,
      startsAt: form.startsAt || undefined,
      expiresAt: form.expiresAt || undefined,
    });
  };

  const inputClass = "w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition";

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">Discounts</h1>
          <p className="text-[13px] text-text-muted mt-1">Create and manage promo codes</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }}
          className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-sm hover:shadow-md">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> New Code
        </button>
      </div>

      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-[#FAFAF7]">
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Code</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Type</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Value</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Usage</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Status</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Expires</th>
              <th className="text-right px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(3)].map((_, i) => <tr key={i} className="border-b border-border/30"><td colSpan={7} className="px-6 py-5"><div className="h-4 bg-bg-soft rounded-lg animate-pulse" /></td></tr>)
            ) : !discounts?.length ? (
              <tr><td colSpan={7} className="py-16 text-center text-text-muted text-[13px]">No discount codes</td></tr>
            ) : (
              discounts.map((d: any) => (
                <tr key={d.id} className="border-b border-border/30 last:border-0 hover:bg-[#FDFCFA] transition-colors duration-200">
                  <td className="px-6 py-4"><code className="text-[12px] font-mono font-bold text-text bg-bg-soft px-2.5 py-1 rounded-lg tracking-wider">{d.code}</code></td>
                  <td className="px-4 py-4 text-[12px] font-medium text-text-mid capitalize">{d.type.toLowerCase()}</td>
                  <td className="px-4 py-4 text-[13px] font-semibold text-text">{d.type === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`}</td>
                  <td className="px-4 py-4 text-[12px] text-text-mid">{d.usedCount}{d.maxUses ? `/${d.maxUses}` : ''}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${d.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${d.isActive ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                      {d.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[12px] text-text-muted">{d.expiresAt ? format(new Date(d.expiresAt), 'dd MMM yyyy') : '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(d)} className="p-2 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text transition" title="Edit"><Edit2 className="w-4 h-4" strokeWidth={1.8} /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(d.id); }}
                        className="p-2 hover:bg-rose-50 rounded-lg text-text-muted hover:text-rose-600 transition" title="Delete"><Trash2 className="w-4 h-4" strokeWidth={1.8} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-border rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <h2 className="text-[16px] font-display font-semibold text-text">{editId ? 'Edit' : 'New'} Discount</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text transition"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. WELCOME20"
                  className={`${inputClass} uppercase tracking-wider`} required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description"
                  className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className={inputClass}>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Value</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })} placeholder="10" className={inputClass} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Min Order (₹)</label>
                  <input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} placeholder="0" className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Max Uses</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Unlimited" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Starts</label>
                  <input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Expires</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={inputClass} />
                </div>
              </div>
              <label className="flex items-center gap-2.5 text-[13px] cursor-pointer py-1">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-gold w-4 h-4 rounded" />
                <span className="font-medium text-text">Active</span>
              </label>
              <button type="submit" disabled={saveMutation.isPending}
                className="w-full bg-gold hover:bg-gold-dark text-white py-3 rounded-xl text-[13px] font-semibold transition disabled:opacity-50 shadow-sm hover:shadow-md mt-2">
                {saveMutation.isPending ? 'Saving...' : editId ? 'Update Discount' : 'Create Discount'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
