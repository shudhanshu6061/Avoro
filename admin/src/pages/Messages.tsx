import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Inbox,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Copy,
  Check,
  X,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  ArrowUpDown,
  AlertCircle,
  Archive,
  ShieldAlert,
  Reply,
  Tag,
  UserCheck
} from 'lucide-react';
import api from '@/lib/api';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  source: string;
  assignedToId: string | null;
  internalNotes: string | null;
  tags: string[];
  isSpam: boolean;
  replyEmailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  newCount: number;
  readCount: number;
  repliedCount: number;
}

const statusBadgeStyles: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700 border border-blue-200/50',
  READ: 'bg-stone-50 text-stone-700 border border-stone-200/50',
  REPLIED: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  ARCHIVED: 'bg-stone-100 text-stone-500 border border-stone-200/50',
};

// Mock support team members for assignment
const supportTeam = [
  { id: 'agent-1', name: 'Aarav Mehta' },
  { id: 'agent-2', name: 'Priya Sharma' },
  { id: 'agent-3', name: 'Kabir Singh' },
];

export default function Messages() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sort, setSort] = useState('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Future Ready / Detail Editable States
  const [detailStatus, setDetailStatus] = useState<ContactMessage['status']>('NEW');
  const [detailNotes, setDetailNotes] = useState('');
  const [detailAssignedTo, setDetailAssignedTo] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState('');
  const [detailTags, setDetailTags] = useState<string[]>([]);
  const [detailIsSpam, setDetailIsSpam] = useState(false);
  
  // Quick reply text box state
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedId]);

  // Queries
  const { data: statsData } = useQuery<Stats>({
    queryKey: ['admin-messages-stats'],
    queryFn: () => api.get('/admin/messages/stats').then((r) => r.data),
  });

  const { data: listData, isLoading } = useQuery<{ messages: ContactMessage[]; total: number; pages: number }>({
    queryKey: ['admin-messages', page, search, statusFilter, sort],
    queryFn: () =>
      api
        .get(`/admin/messages?page=${page}&search=${search}&status=${statusFilter}&sort=${sort}`)
        .then((r) => r.data),
  });

  const { data: detailData } = useQuery<ContactMessage>({
    queryKey: ['admin-message', selectedId],
    queryFn: () =>
      api.get(`/admin/messages/${selectedId}`).then((r) => {
        const msg = r.data;
        setDetailStatus(msg.status);
        setDetailNotes(msg.internalNotes || '');
        setDetailAssignedTo(msg.assignedToId || '');
        setDetailTags(msg.tags || []);
        setDetailIsSpam(msg.isSpam || false);
        setSaveSuccess(false);
        setReplyText('');
        setReplySuccess(false);
        
        // Auto invalidate lists since GET message marks it as READ if it was NEW
        if (msg.status === 'NEW') {
          queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
          queryClient.invalidateQueries({ queryKey: ['admin-messages-stats'] });
          queryClient.invalidateQueries({ queryKey: ['admin-messages-unread-count'] });
        }
        return msg;
      }),
    enabled: !!selectedId,
  });

  const messages = listData?.messages || [];
  const totalPages = listData?.pages || 1;

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      internalNotes,
      assignedToId,
      tags,
      isSpam,
      replyEmailSent,
    }: {
      id: string;
      status?: ContactMessage['status'];
      internalNotes?: string;
      assignedToId?: string | null;
      tags?: string[];
      isSpam?: boolean;
      replyEmailSent?: boolean;
    }) =>
      api.patch(`/api/admin/messages/${id}`, {
        status,
        internalNotes,
        assignedToId,
        tags,
        isSpam,
        replyEmailSent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-message', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-unread-count'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-unread-count'] });
      setSelectedId(null);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: ContactMessage['status'] }) =>
      api.patch('/api/admin/messages', { ids, status }),
    onSuccess: () => {
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-unread-count'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.delete('/api/admin/messages', { data: { ids } }),
    onSuccess: () => {
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-unread-count'] });
    },
  });

  // Actions
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleQuickStatus = (id: string, status: ContactMessage['status']) => {
    updateMutation.mutate({ id, status });
  };

  const handleSaveDetail = () => {
    if (selectedId) {
      updateMutation.mutate({
        id: selectedId,
        status: detailStatus,
        internalNotes: detailNotes,
        assignedToId: detailAssignedTo || null,
        tags: detailTags,
        isSpam: detailIsSpam,
      });
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedId) return;
    
    // Simulate direct email reply sending
    setReplySuccess(true);
    updateMutation.mutate({
      id: selectedId,
      status: 'REPLIED',
      replyEmailSent: true,
      internalNotes: detailNotes + `\n[Sent Email Reply: "${replyText.substring(0, 50)}..."]`
    });
    setReplyText('');
    setTimeout(() => setReplySuccess(false), 4000);
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !detailTags.includes(newTagInput.trim())) {
      setDetailTags([...detailTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDetailTags(detailTags.filter((t) => t !== tagToRemove));
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === messages.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(messages.map((m) => m.id));
    }
  };

  const handleBulkStatusChange = (status: ContactMessage['status']) => {
    bulkStatusMutation.mutate({ ids: selectedRows, status });
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} messages?`)) {
      bulkDeleteMutation.mutate(selectedRows);
    }
  };

  // Stats Card Data
  const statCards = [
    {
      label: 'Total Messages',
      value: statsData?.total ?? 0,
      desc: 'All inquiries received',
      icon: Inbox,
      color: '#C9A96E', // Gold
    },
    {
      label: 'New Messages',
      value: statsData?.newCount ?? 0,
      desc: 'Requires review',
      icon: Mail,
      color: '#3B82F6', // Blue
    },
    {
      label: 'Read Messages',
      value: statsData?.readCount ?? 0,
      desc: 'Reviewed inquiries',
      icon: Eye,
      color: '#7C6A4F', // Soft Brown
    },
    {
      label: 'Replied Messages',
      value: statsData?.repliedCount ?? 0,
      desc: 'Responded requests',
      icon: MessageSquare,
      color: '#10B981', // Green
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">Messages</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Manage customer support requests and submissions</p>
        </div>
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
            placeholder="Search by name, email, or subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border/80 rounded-xl text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-text-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-bg border border-border/80 rounded-xl px-3 py-2 text-[13px] text-text focus:outline-none focus:border-gold transition"
            >
              <option value="ALL">All Messages</option>
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-text-muted flex-shrink-0" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-bg border border-border/80 rounded-xl px-3 py-2 text-[13px] text-text focus:outline-none focus:border-gold transition"
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
              {selectedRows.length} message{selectedRows.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('READ')}
              className="px-3.5 py-1.5 bg-white border border-border text-[12px] font-medium text-stone-700 rounded-lg hover:bg-bg transition"
            >
              Mark Read
            </button>
            <button
              onClick={() => handleBulkStatusChange('REPLIED')}
              className="px-3.5 py-1.5 bg-white border border-border text-[12px] font-medium text-emerald-700 rounded-lg hover:bg-emerald-50 transition"
            >
              Mark Replied
            </button>
            <button
              onClick={() => handleBulkStatusChange('ARCHIVED')}
              className="px-3.5 py-1.5 bg-white border border-border text-[12px] font-medium text-stone-500 rounded-lg hover:bg-bg transition"
            >
              Archive
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

      {/* Inbox Table */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border/50 bg-bg/20">
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={messages.length > 0 && selectedRows.length === messages.length}
                    onChange={handleSelectAll}
                    className="rounded border-border/60 text-gold focus:ring-gold focus:ring-opacity-20 cursor-pointer"
                  />
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Customer Name
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Email
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Subject
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">
                  Received On
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
                    Loading messages...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[13px] text-text-muted italic">
                    No messages found
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr
                    key={m.id}
                    className={`border-b border-border/30 last:border-0 hover:bg-bg-hover/30 transition ${
                      selectedRows.includes(m.id) ? 'bg-gold-pale/10' : ''
                    } ${m.status === 'NEW' ? 'font-semibold bg-bg-soft/10' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(m.id)}
                        onChange={() => handleSelectRow(m.id)}
                        className="rounded border-border/60 text-gold focus:ring-gold focus:ring-opacity-20 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-[13.5px] text-text">{m.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group">
                        <span className="text-[13px] text-text-mid">{m.email}</span>
                        <button
                          onClick={() => handleCopyEmail(m.email)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg rounded text-text-muted hover:text-gold transition-all"
                          title="Copy email"
                        >
                          {copiedEmail === m.email ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-text-mid max-w-[200px] truncate" title={m.subject}>
                      {m.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          statusBadgeStyles[m.status] || 'bg-stone-50'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12.5px] text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-text-muted/65" />
                        <span>
                          {new Date(m.createdAt).toLocaleDateString('en-IN', {
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
                          onClick={() => setSelectedId(m.id)}
                          className="p-1.5 hover:bg-bg rounded-lg text-text-muted hover:text-gold transition"
                          title="View message details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {m.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleQuickStatus(m.id, 'ARCHIVED')}
                            className="p-1.5 hover:bg-bg rounded-lg text-text-muted hover:text-stone-700 transition"
                            title="Archive message"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 hover:bg-bg rounded-lg text-text-muted hover:text-rose-600 transition"
                          title="Delete message"
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

      {/* Details Modal / Drawer */}
      {selectedId && detailData && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-start p-4 animate-fadeIn"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="relative bg-white rounded-2xl border border-border/50 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col scale-100 transition-all"
            style={{ top: '24px', maxHeight: 'calc(100vh - 48px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-bg/5 flex-shrink-0">
              <div>
                <h2 className="text-base font-display font-semibold text-text">Customer Message</h2>
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
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Top Quick Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg/25 p-4 rounded-xl border border-border/20">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">Customer Details</span>
                  <span className="text-[13.5px] font-semibold text-text mt-0.5 block">{detailData.name}</span>
                  <div className="flex items-center gap-1.5 mt-1 text-[12.5px] text-text-muted">
                    <span>{detailData.email}</span>
                    <button
                      onClick={() => handleCopyEmail(detailData.email)}
                      className="p-0.5 hover:bg-white rounded border border-transparent hover:border-border/30 text-text-muted hover:text-gold transition"
                      title="Copy email"
                    >
                      {copiedEmail === detailData.email ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">Metadata</span>
                  <div className="mt-1 space-y-1 text-[12.5px] text-text-mid">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(detailData.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Source: {detailData.source}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject & Message Content */}
              <div className="space-y-2.5">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">Subject</span>
                  <p className="text-[14px] font-bold text-text mt-0.5">{detailData.subject}</p>
                </div>
                <div className="border-t border-border/40 pt-3">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Message Content</span>
                  <div className="bg-bg/40 border border-border/35 rounded-xl p-4 text-[13px] text-text leading-relaxed whitespace-pre-wrap font-sans">
                    {detailData.message}
                  </div>
                </div>
              </div>

              {/* CRM Options (Future Ready Properties) */}
              <div className="border-t border-border/40 pt-4 space-y-4">
                <h3 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-gold-dark" />
                  <span>Support CRM Controls</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                      Message Status
                    </label>
                    <select
                      value={detailStatus}
                      onChange={(e) => setDetailStatus(e.target.value as ContactMessage['status'])}
                      className="w-full bg-white border border-border rounded-xl px-3 py-2 text-[13px] text-text focus:outline-none focus:border-gold transition"
                    >
                      <option value="NEW">NEW</option>
                      <option value="READ">READ</option>
                      <option value="REPLIED">REPLIED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>

                  {/* Assignee Dropdown (Future Ready) */}
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <span>Assigned To (Future Ready)</span>
                    </label>
                    <select
                      value={detailAssignedTo}
                      onChange={(e) => setDetailAssignedTo(e.target.value)}
                      className="w-full bg-white border border-border rounded-xl px-3 py-2 text-[13px] text-text focus:outline-none focus:border-gold transition"
                    >
                      <option value="">Unassigned</option>
                      {supportTeam.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Spam and email status indicators */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Flags
                    </label>
                    <div className="flex items-center gap-4 mt-1">
                      <label className="flex items-center gap-2 text-[13px] text-text-mid cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={detailIsSpam}
                          onChange={(e) => setDetailIsSpam(e.target.checked)}
                          className="rounded border-border/60 text-gold focus:ring-gold focus:ring-opacity-20 cursor-pointer"
                        />
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 inline" />
                        <span>Is Spam</span>
                      </label>
                      <div className="text-[12.5px] text-text-muted flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${detailData.replyEmailSent ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                        <span>{detailData.replyEmailSent ? 'Reply Sent' : 'No Reply Sent'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags (Future Ready) */}
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-gold-dark" />
                      <span>Message Tags</span>
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add tag (press Enter)..."
                        className="flex-1 px-3 py-1.5 bg-white border border-border rounded-lg text-[12px] text-text focus:outline-none focus:border-gold transition"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-2.5 py-1.5 bg-bg-soft hover:bg-bg border border-border text-[11px] font-semibold text-text rounded-lg transition"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {detailTags.length === 0 ? (
                        <span className="text-[11px] text-text-muted/70 italic">No tags applied</span>
                      ) : (
                        detailTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-pale/45 text-gold-dark rounded text-[10px] font-bold uppercase border border-gold-pale"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-gold-dark/60 hover:text-gold-dark"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                    Internal Support Notes
                  </label>
                  <textarea
                    value={detailNotes}
                    onChange={(e) => setDetailNotes(e.target.value)}
                    placeholder="Add internal notes about this message..."
                    rows={3}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold transition resize-none font-sans"
                  />
                </div>
              </div>

              {/* Send Quick Reply Box (Future Ready Integration) */}
              <div className="border-t border-border/40 pt-5 space-y-3">
                <h3 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <Reply className="w-4 h-4 text-gold-dark" />
                  <span>Send Email Reply</span>
                </h3>
                
                {replySuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-xl text-[12.5px] text-emerald-700 animate-fadeIn">
                    ✓ Mock reply logged successfully. Customer email marked as Replied.
                  </div>
                )}

                <div className="space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Write a reply to ${detailData.name}...`}
                    rows={4}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold transition resize-none font-sans"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-text-muted italic">
                      This will simulate sending an email to {detailData.email}.
                    </span>
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || updateMutation.isPending}
                      className="px-4 py-1.5 bg-gold-dark hover:bg-gold text-[12px] font-semibold text-[#090806] rounded-lg transition disabled:opacity-40"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4.5 border-t border-border/50 bg-bg/5 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                {saveSuccess && (
                  <span className="text-[11.5px] font-medium text-emerald-600 flex items-center gap-1 animate-fadeIn">
                    <Check className="w-3.5 h-3.5" /> Changes saved successfully
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedId(null)}
                  className="px-4 py-2 border border-border text-[12.5px] font-medium text-text-mid rounded-xl hover:bg-bg-hover hover:text-text transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDetail}
                  disabled={updateMutation.isPending}
                  className="px-4.5 py-2 bg-gold-dark hover:bg-gold text-[12.5px] font-semibold text-[#090806] rounded-xl transition shadow-[0_2px_4px_rgba(201,169,110,0.15)] disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
