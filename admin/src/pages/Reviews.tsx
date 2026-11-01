import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Check, X, Trash2, Eye } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
];

export default function Reviews() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, statusFilter],
    queryFn: () =>
      api
        .get('/admin/reviews', {
          params: { page, limit: 20, status: statusFilter || undefined },
        })
        .then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      api.patch(`/admin/reviews/${id}/approve`, { isApproved }),
    onSuccess: () => {
      toast.success('Review updated');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setSelectedReview(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const handleApprove = (id: string, current: boolean) => {
    approveMutation.mutate({ id, isApproved: !current });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this review permanently?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">
          Customer Reviews
        </h1>
        <p className="text-[13px] text-text-muted mt-1">
          Moderate reviews before they appear on the site
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatusFilter(f.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
              statusFilter === f.value
                ? 'bg-gold text-white shadow-sm'
                : 'bg-white border border-border text-text-mid hover:border-gold/30 hover:text-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-[#FAFAF7]">
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
                Date
              </th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
                Product
              </th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
                Customer
              </th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
                Rating
              </th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
                Review
              </th>
              <th className="text-center px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
                Status
              </th>
              <th className="text-right px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td colSpan={7} className="px-6 py-5">
                    <div className="h-4 bg-bg-soft rounded-lg w-full animate-pulse" />
                  </td>
                </tr>
              ))
            ) : data?.reviews?.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-text-muted text-[13px]">
                  No reviews found
                </td>
              </tr>
            ) : (
              data?.reviews?.map((r: any) => (
                <tr
                  key={r.id}
                  className="border-b border-border/30 last:border-0 hover:bg-[#FDFCFA] transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-[12px] text-text-muted">
                    {format(new Date(r.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-[13px] font-medium text-text">
                      {r.product?.name}
                    </div>
                    <code className="text-[10px] text-text-muted">/{r.product?.slug}</code>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-[13px] font-medium text-text">{r.author}</div>
                    <div className="text-[11px] text-text-muted">{r.email || '—'}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-gold-dark font-semibold">
                      {'★'.repeat(r.rating)}
                      <span className="text-border">{'★'.repeat(5 - r.rating)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4 max-w-[320px]">
                    {r.title && (
                      <div className="text-[13px] font-medium text-text mb-0.5">
                        {r.title}
                      </div>
                    )}
                    <div className="text-[12px] text-text-mid line-clamp-2">{r.body}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                        r.isApproved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {r.isApproved ? 'LIVE' : 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedReview(r)}
                        className="p-2 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text"
                        title="View full"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                      <button
                        onClick={() => handleApprove(r.id, r.isApproved)}
                        className={`p-2 rounded-lg transition ${
                          r.isApproved
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={r.isApproved ? 'Unpublish' : 'Approve & Publish'}
                      >
                        {r.isApproved ? (
                          <X className="w-4 h-4" strokeWidth={1.8} />
                        ) : (
                          <Check className="w-4 h-4" strokeWidth={1.8} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-2 hover:bg-rose-50 rounded-lg text-rose-600"
                        title="Delete"
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
      </div>

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex items-center justify-between text-[12px] text-text-muted px-1">
          <div>
            Page {page} of {data.pages}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-border shadow-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-text-muted mb-1">
                  {selectedReview.product?.name}
                </div>
                <div className="text-xl font-display text-text">{selectedReview.author}</div>
              </div>
              <button onClick={() => setSelectedReview(null)} className="text-text-muted">
                ✕
              </button>
            </div>

            <div className="text-gold-dark text-lg mb-3">
              {'★'.repeat(selectedReview.rating)}
              <span className="text-border">{'★'.repeat(5 - selectedReview.rating)}</span>
            </div>

            {selectedReview.title && (
              <div className="font-medium text-[15px] mb-2 text-text">
                {selectedReview.title}
              </div>
            )}
            <p className="text-[14px] text-text-mid whitespace-pre-wrap">
              {selectedReview.body}
            </p>

            <div className="mt-6 pt-4 border-t border-border text-[11px] text-text-muted flex justify-between items-center">
              <span>
                {format(new Date(selectedReview.createdAt), 'dd MMM yyyy, hh:mm a')}
              </span>
              <span className={selectedReview.isApproved ? 'text-emerald-600' : 'text-amber-600'}>
                {selectedReview.isApproved ? 'PUBLISHED' : 'PENDING MODERATION'}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  handleApprove(selectedReview.id, selectedReview.isApproved);
                  setSelectedReview(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gold text-gold-dark font-medium text-[13px]"
              >
                {selectedReview.isApproved ? 'Unpublish' : 'Approve & Publish'}
              </button>
              <button
                onClick={() => handleDelete(selectedReview.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-medium text-[13px]"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
