import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Copy,
  Download,
  Check,
  X,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

interface Subscriber {
  id: string;
  email: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED';
  source: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  unsubscribed: number;
  newThisMonth: number;
}

export default function Subscribers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [detailStatus, setDetailStatus] = useState<'ACTIVE' | 'UNSUBSCRIBED'>('ACTIVE');
  const [detailNotes, setDetailNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Queries
  const { data: statsData } = useQuery<Stats>({
    queryKey: ['admin-subscriber-stats'],
    queryFn: () => api.get('/admin/subscribers/stats').then((r) => r.data),
  });

  const { data: listData, isLoading } = useQuery<{ subscribers: Subscriber[]; total: number; pages: number }>({
    queryKey: ['admin-subscribers', page, search, sort],
    queryFn: () =>
      api
        .get(`/admin/subscribers?page=${page}&search=${search}&sort=${sort}`)
        .then((r) => r.data),
  });

  const { data: detailData } = useQuery<Subscriber>({
    queryKey: ['admin-subscriber', selectedId],
    queryFn: () =>
      api.get(`/admin/subscribers/${selectedId}`).then((r) => {
        const sub = r.data;
        setDetailStatus(sub.status);
        setDetailNotes(sub.notes || '');
        setSaveSuccess(false);
        return sub;
      }),
    enabled: !!selectedId,
  });

  const subscribers = listData?.subscribers || [];
  const totalPages = listData?.pages || 1;

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: 'ACTIVE' | 'UNSUBSCRIBED'; notes: string }) =>
      api.patch(`/admin/subscribers/${id}`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscriber-stats'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/subscribers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscriber-stats'] });
      setSelectedId(null);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'ACTIVE' | 'UNSUBSCRIBED' }) =>
      api.patch('/admin/subscribers', { ids, status }),
    onSuccess: () => {
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ['admin-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscriber-stats'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.delete('/admin/subscribers', { data: { ids } }),
    onSuccess: () => {
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ['admin-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscriber-stats'] });
    },
  });

  // Actions
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaveDetail = () => {
    if (selectedId) {
      updateMutation.mutate({
        id: selectedId,
        status: detailStatus,
        notes: detailNotes,
      });
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === subscribers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(subscribers.map((s) => s.id));
    }
  };

  // CSV Export utility
  const exportToCSV = (dataToExport: Subscriber[], filename: string) => {
    const headers = ['Email', 'Status', 'Source', 'Subscription Date'];
    const rows = dataToExport.map((s) => [
      s.email,
      s.status,
      s.source,
      new Date(s.createdAt).toLocaleString('en-IN'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSelected = () => {
    const selectedSubs = subscribers.filter((s) => selectedRows.includes(s.id));
    exportToCSV(selectedSubs, 'avoro_selected_subscribers.csv');
  };

  const handleExportAll = async () => {
    try {
      const res = await api.get('/admin/subscribers?limit=100000');
      const allSubs = res.data.subscribers || [];
      exportToCSV(allSubs, 'avoro_all_subscribers.csv');
    } catch (err) {
      alert('Failed to fetch subscribers for export');
    }
  };

  const handleBulkStatusChange = (status: 'ACTIVE' | 'UNSUBSCRIBED') => {
    bulkStatusMutation.mutate({ ids: selectedRows, status });
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} subscribers?`)) {
      bulkDeleteMutation.mutate(selectedRows);
    }
  };

  // Stats Card data
  const statCards = [
    {
      label: 'Total Subscribers',
      value: statsData?.total ?? 0,
      desc: 'All signups',
      icon: Mail,
      color: '#C9A96E', // Gold
    },
    {
      label: 'Active Subscribers',
      value: statsData?.active ?? 0,
      desc: 'Receiving emails',
      icon: UserCheck,
      color: '#10B981', // Green
    },
    {
      label: 'Unsubscribed',
      value: statsData?.unsubscribed ?? 0,
      desc: 'Opted out',
      icon: UserX,
      color: '#EF4444', // Red
    },
    {
      label: 'New This Month',
      value: statsData?.newThisMonth ?? 0,
      desc: 'Current calendar month',
      icon: Calendar,
      color: '#3B82F6', // Blue
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">Subscribers</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Manage your newsletter list and subscriptions</p>
        </div>
        <button
          onClick={handleExportAll}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-[13px] font-medium text-text hover:bg-bg-hover transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <Download className="w-4 h-4 text-text-muted" />
          <span>Export All CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="relative bg-white rounded-[18px] p-6 border border-border/50 overflow-hidden group hover:border-border transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.03] -translate-y-1/2 translate-x-1/2"
              style={{ background: s.color }}
            />
            <div className="flex items-center justify-between mb-6">
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{ background: `${s.color}15` }}
              >
                <s.icon className="w-[18px] h-[18px]" style={{ color: s.color }} strokeWidth={2} />
              </div>
            </div>
            <p className="text-[26px] font-bold text-text leading-none tracking-tight">{s.value}</p>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mt-2">
              {s.label}
            </p>
            <p className="text-[11px] text-text-muted/80 mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border/50">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search subscribers by email..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border/80 rounded-xl text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-text-muted flex-shrink-0" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-[160px] bg-bg border border-border/80 rounded-xl px-3 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedRows.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gold-pale/30 border border-gold/20 rounded-xl px-5 py-3.5 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gold-dark" />
            <span className="text-[13px] font-medium text-gold-dark">
              {selectedRows.length} subscriber{selectedRows.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('ACTIVE')}
              className="px-3.5 py-1.5 bg-white border border-border text-[12px] font-medium text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
            >
              Mark Active
            </button>
            <button
              onClick={() => handleBulkStatusChange('UNSUBSCRIBED')}
              className="px-3.5 py-1.5 bg-white border border-border text-[12px] font-medium text-rose-600 rounded-lg hover:bg-rose-50 transition"
            >
              Mark Unsubscribed
            </button>
            <button
              onClick={handleExportSelected}
              className="px-3.5 py-1.5 bg-white border border-border text-[12px] font-medium text-text rounded-lg hover:bg-bg-hover transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-[12px] font-medium text-rose-600 rounded-lg hover:bg-rose-100 transition"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border/50 bg-bg/20">
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={subscribers.length > 0 && selectedRows.length === subscribers.length}
                    onChange={handleSelectAll}
                    className="rounded border-border/60 text-gold focus:ring-gold focus:ring-opacity-20 cursor-pointer"
                  />
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Email
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Source
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Subscribed On
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Last Updated
                </th>
                <th className="text-right text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[13px] text-text-muted">
                    Loading subscribers...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[13px] text-text-muted italic">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-border/30 last:border-0 hover:bg-bg-hover/30 transition ${
                      selectedRows.includes(s.id) ? 'bg-gold-pale/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(s.id)}
                        onChange={() => handleSelectRow(s.id)}
                        className="rounded border-border/60 text-gold focus:ring-gold focus:ring-opacity-20 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group">
                        <span className="text-[13.5px] font-medium text-text">{s.email}</span>
                        <button
                          onClick={() => handleCopyEmail(s.email)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg rounded text-text-muted hover:text-gold transition-all"
                          title="Copy email"
                        >
                          {copiedEmail === s.email ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-text-mid">{s.source}</td>
                    <td className="px-6 py-4 text-[12.5px] text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-text-muted/65" />
                        <span>
                          {new Date(s.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[12.5px] text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-text-muted/65" />
                        <span>
                          {new Date(s.updatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedId(s.id)}
                          className="p-1.5 hover:bg-bg rounded-lg text-text-muted hover:text-gold transition"
                          title="View subscriber details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 hover:bg-bg rounded-lg text-text-muted hover:text-rose-600 transition"
                          title="Delete subscriber"
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-border text-text-muted hover:text-text disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-[13px] text-text-mid font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-border text-text-muted hover:text-text disabled:opacity-30 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Details Drawer/Modal */}
      {selectedId && detailData && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="bg-white rounded-2xl border border-border/50 w-full max-w-lg shadow-2xl overflow-hidden scale-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-bg/5">
              <div>
                <h2 className="text-base font-display font-semibold text-text">Subscriber Details</h2>
                <p className="text-[11.5px] text-text-muted mt-0.5">ID: {detailData.id}</p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 hover:bg-bg border border-border/40 rounded-xl text-text-muted hover:text-text transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Email Section */}
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center justify-between bg-bg/40 px-3.5 py-2.5 rounded-xl border border-border/40">
                  <span className="text-[13.5px] font-semibold text-text">{detailData.email}</span>
                  <button
                    onClick={() => handleCopyEmail(detailData.email)}
                    className="p-1.5 hover:bg-white rounded-lg text-text-muted hover:text-gold transition border border-transparent hover:border-border/30"
                    title="Copy email"
                  >
                    {copiedEmail === detailData.email ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status Section */}
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Subscription Status
                </label>
                <select
                  value={detailStatus}
                  onChange={(e) => setDetailStatus(e.target.value as 'ACTIVE' | 'UNSUBSCRIBED')}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UNSUBSCRIBED">UNSUBSCRIBED</option>
                </select>
              </div>

              {/* Readonly details */}
              <div className="grid grid-cols-2 gap-4 bg-bg/25 p-4 rounded-xl border border-border/20">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                    Source
                  </span>
                  <span className="text-[12.5px] font-medium text-text mt-0.5 block">
                    {detailData.source}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                    Subscribed On
                  </span>
                  <span className="text-[12.5px] font-medium text-text mt-0.5 block">
                    {new Date(detailData.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="col-span-2 border-t border-border/20 pt-2.5 mt-0.5">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                    Last Updated
                  </span>
                  <span className="text-[12.5px] font-medium text-text mt-0.5 block">
                    {new Date(detailData.updatedAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Notes (editable) */}
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                  placeholder="Add notes about this subscriber..."
                  rows={3}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4.5 border-t border-border/50 bg-bg/5">
              <div className="flex items-center gap-1.5">
                {saveSuccess && (
                  <span className="text-[11.5px] font-medium text-emerald-600 flex items-center gap-1 animate-fadeIn">
                    <Check className="w-3.5 h-3.5" /> Saved successfully
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedId(null)}
                  className="px-4 py-2 border border-border text-[12.5px] font-medium text-text-mid rounded-xl hover:bg-bg-hover hover:text-text transition"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveDetail}
                  disabled={updateMutation.isPending}
                  className="px-4.5 py-2 bg-gold-dark hover:bg-gold text-[12.5px] font-semibold text-[#090806] rounded-xl transition shadow-[0_2px_4px_rgba(201,169,110,0.15)] disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
