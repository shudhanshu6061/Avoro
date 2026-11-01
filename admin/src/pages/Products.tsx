import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Star, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

import PriceTag from '@/components/PriceTag';

export default function Products() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => api.get('/admin/products', { params: { page, search, limit: 20 } }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => { toast.success('Product deleted'); queryClient.invalidateQueries({ queryKey: ['admin-products'] }); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">Products</h1>
          <p className="text-[13px] text-text-muted mt-1">Manage your fragrance catalogue</p>
        </div>
        <Link to="/products/new" className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-sm hover:shadow-md">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-[#FAFAF7]">
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Product</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Category</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Price Tag</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Variants</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Stock</th>
              <th className="text-center px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Featured</th>
              <th className="text-center px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Status</th>
              <th className="text-right px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="px-6 py-4"><div className="h-10 bg-bg-soft rounded-lg w-48 animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-bg-soft rounded w-20 animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-bg-soft rounded w-14 animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-bg-soft rounded w-6 mx-auto animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-5 bg-bg-soft rounded-lg w-14 mx-auto animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-bg-soft rounded w-16 ml-auto animate-pulse" /></td>
                </tr>
              ))
            ) : data?.products?.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-text-muted text-[13px]">No products found</td></tr>
            ) : (
              data?.products?.map((p: any) => (
                <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-[#FDFCFA] transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-11 h-11 rounded-xl object-cover border border-border/50" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-bg-soft border border-border/50" />
                      )}
                      <div>
                        <p className="text-[13px] font-semibold text-text">{p.name}</p>
                        <p className="text-[11px] text-text-muted mt-0.5">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[12px] font-medium text-text-mid bg-bg-soft px-2.5 py-1 rounded-lg">{p.category}</span>
                  </td>
                  <td className="px-4 py-4">
                    {(() => {
                      const v = (p.variants as any[])?.[0];
                      if (!v) return <span className="text-[12px] text-text-muted">—</span>;
                      return <PriceTag price={v.price} originalPrice={v.originalPrice} size="sm" showDecimals={true} />;
                    })()}
                  </td>
                  <td className="px-4 py-4 text-[12px] font-medium text-text-mid">{(p.variants as any[])?.length || 0} sizes</td>
                  <td className="px-4 py-4">
                    {(() => {
                      const variants = (p.variants as any[]) || [];
                      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
                      const allOut = totalStock === 0;
                      const low = totalStock > 0 && totalStock <= 10;
                      return (
                        <div className="flex items-center gap-1.5">
                          {allOut && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                          <span className={`text-[12px] font-semibold ${
                            allOut ? 'text-rose-600' : low ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {totalStock}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            allOut ? 'bg-rose-50 text-rose-600' : low ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {allOut ? 'Out' : low ? 'Low' : 'OK'}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {p.isFeatured && <Star className="w-4 h-4 text-gold mx-auto fill-gold" />}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                      {p.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/products/${p.id}`} className="p-2 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text transition" title="Edit">
                        <Edit2 className="w-4 h-4" strokeWidth={1.8} />
                      </Link>
                      <button
                        onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id); }}
                        className="p-2 hover:bg-rose-50 rounded-lg text-text-muted hover:text-rose-600 transition" title="Delete"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-[#FAFAF7]">
            <p className="text-[11px] text-text-muted font-medium">{data.total} products total</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted disabled:opacity-30 transition"><ChevronLeft className="w-4 h-4" /></button>
              {[...Array(data.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition ${page === i + 1 ? 'bg-gold text-white shadow-sm' : 'text-text-mid hover:bg-bg-hover'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(Math.min(data.pages, page + 1))} disabled={page === data.pages} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted disabled:opacity-30 transition"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
