import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  FileEdit,
  X,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  ExternalLink,
  RotateCcw,
  Tag,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const statusCfg: Record<string, { bg: string; text: string; dot: string }> = {
  PUBLISHED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'PUBLISHED', dot: 'bg-emerald-500' },
  SCHEDULED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'SCHEDULED', dot: 'bg-amber-500' },
  DRAFT: { bg: 'bg-stone-100 text-stone-600 border-stone-200', text: 'DRAFT', dot: 'bg-stone-400' },
};

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function Articles() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');

  // Articles state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');

  // Queries
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['admin-articles', page, limit, search, selectedCategory, selectedStatus],
    queryFn: () =>
      api
        .get('/admin/articles', {
          params: { page, limit, search, categoryId: selectedCategory, status: selectedStatus },
        })
        .then((r) => r.data),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['article-categories'],
    queryFn: () => api.get('/admin/articles/categories').then((r) => r.data),
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/articles/${id}`),
    onSuccess: (_, deletedId) => {
      toast.success('Article deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setSelectedIds((prev) => prev.filter((i) => i !== deletedId));
    },
    onError: () => toast.error('Failed to delete article'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/articles/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.delete('/admin/articles/bulk', { data: { ids } }),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'Articles deleted');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => toast.error('Failed bulk delete'),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      api.patch('/admin/articles/bulk-status', { ids, status }),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'Status updated');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => toast.error('Failed bulk status update'),
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => api.post('/admin/articles/categories', data),
    onSuccess: () => {
      toast.success('Category created');
      setCategoryModalOpen(false);
      setCatName('');
      setCatSlug('');
      queryClient.invalidateQueries({ queryKey: ['article-categories'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create category'),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; slug: string } }) =>
      api.put(`/admin/articles/categories/${id}`, data),
    onSuccess: () => {
      toast.success('Category updated');
      setCategoryModalOpen(false);
      setEditingCategory(null);
      setCatName('');
      setCatSlug('');
      queryClient.invalidateQueries({ queryKey: ['article-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update category'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/articles/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['article-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => toast.error('Failed to delete category'),
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && articlesData?.articles) {
      setSelectedIds(articlesData.articles.map((a: any) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: any) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const data = { name: catName.trim(), slug: catSlug.trim() ? slugify(catSlug) : slugify(catName) };
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const stats = articlesData?.stats || { total: 0, published: 0, draft: 0, scheduled: 0 };
  const allSelected =
    articlesData?.articles?.length > 0 && selectedIds.length === articlesData?.articles?.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">Journal</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Manage blog articles, publishing schedules, and categories</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'categories' ? (
            <button
              onClick={openCreateCategoryModal}
              className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-sm hover:shadow-md cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" /> New Category
            </button>
          ) : (
            <Link
              to="/articles/new"
              className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-sm hover:shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> New Article
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-5 py-3 text-[13px] font-semibold transition border-b-2 -mb-px cursor-pointer ${
            activeTab === 'articles'
              ? 'border-gold text-gold-dark'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <FileText className="w-4 h-4" /> Articles
          <span className="ml-1 bg-bg-soft text-text-mid px-2 py-0.5 rounded-full text-[11px] font-medium">
            {stats.total || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-3 text-[13px] font-semibold transition border-b-2 -mb-px cursor-pointer ${
            activeTab === 'categories'
              ? 'border-gold text-gold-dark'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Tag className="w-4 h-4" /> Categories
          <span className="ml-1 bg-bg-soft text-text-mid px-2 py-0.5 rounded-full text-[11px] font-medium">
            {categories?.length || 0}
          </span>
        </button>
      </div>

      {activeTab === 'articles' && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-border/50 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold-dark flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Total Articles</p>
                <p className="text-xl font-bold text-text mt-0.5">{stats.total || 0}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-border/50 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Published</p>
                <p className="text-xl font-bold text-text mt-0.5">{stats.published || 0}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-border/50 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
                <FileEdit className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Drafts</p>
                <p className="text-xl font-bold text-text mt-0.5">{stats.draft || 0}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-border/50 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Scheduled</p>
                <p className="text-xl font-bold text-text mt-0.5">{stats.scheduled || 0}</p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-[18px] border border-border/50 space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search articles by title, excerpt or slug..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-bg border border-border rounded-xl pl-10 pr-9 py-2 text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold transition"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="bg-bg border border-border rounded-xl px-3 py-2 text-[13px] text-text focus:outline-none focus:border-gold transition min-w-[150px]"
                >
                  <option value="">All Categories</option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="bg-bg border border-border rounded-xl px-3 py-2 text-[13px] text-text focus:outline-none focus:border-gold transition min-w-[140px]"
                >
                  <option value="">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>

                {(search || selectedCategory || selectedStatus) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('');
                      setSelectedStatus('');
                      setPage(1);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-[12px] text-text-muted hover:text-text hover:bg-bg-soft rounded-xl transition border border-border/40"
                    title="Reset filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between bg-gold-pale/50 border border-gold/30 rounded-xl px-4 py-2.5 animate-fadeIn">
                <span className="text-[12px] font-semibold text-gold-dark">
                  {selectedIds.length} article{selectedIds.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: 'PUBLISHED' })}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[12px] font-semibold transition"
                  >
                    Publish Selected
                  </button>
                  <button
                    onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: 'DRAFT' })}
                    className="px-3 py-1 bg-stone-600 hover:bg-stone-700 text-white rounded-lg text-[12px] font-semibold transition"
                  >
                    Draft Selected
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${selectedIds.length} selected article(s)?`)) {
                        bulkDeleteMutation.mutate(selectedIds);
                      }
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[12px] font-semibold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-text-muted hover:text-text text-[12px] underline ml-2"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-[#FAFAF7]">
                    <th className="px-4 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="rounded border-border text-gold focus:ring-gold"
                      />
                    </th>
                    <th className="px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Article</th>
                    <th className="px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Author</th>
                    <th className="px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Category</th>
                    <th className="px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Status</th>
                    <th className="px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Date</th>
                    <th className="text-right px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articlesLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td colSpan={7} className="px-6 py-5">
                          <div className="h-5 bg-bg-soft rounded-lg animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : articlesData?.articles?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-text-muted text-[13px]">
                        No articles found. Try adjusting your filters or create a new article.
                      </td>
                    </tr>
                  ) : (
                    articlesData?.articles?.map((a: any) => {
                      const cfg = statusCfg[a.status] || statusCfg.DRAFT;
                      const isSelected = selectedIds.includes(a.id);
                      return (
                        <tr
                          key={a.id}
                          className={`border-b border-border/30 last:border-0 hover:bg-[#FDFCFA] transition-colors ${
                            isSelected ? 'bg-gold/5' : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(a.id)}
                              className="rounded border-border text-gold focus:ring-gold"
                            />
                          </td>
                          <td className="px-4 py-4 min-w-[240px]">
                            <div className="flex items-center gap-3">
                              {a.featuredImage ? (
                                <img
                                  src={a.featuredImage}
                                  alt={a.title}
                                  className="w-11 h-11 rounded-lg object-cover border border-border/60 flex-shrink-0 bg-bg-soft"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-bg-soft border border-border/60 flex items-center justify-center text-text-muted flex-shrink-0">
                                  <FileText className="w-5 h-5 stroke-1" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <Link
                                  to={`/articles/${a.id}`}
                                  className="text-[13px] font-semibold text-text hover:text-gold transition line-clamp-1"
                                >
                                  {a.title}
                                </Link>
                                <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                                  {a.excerpt || a.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[12px] font-medium text-text-mid whitespace-nowrap">
                            {a.author?.firstName} {a.author?.lastName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-[11px] font-medium text-text-mid bg-bg-soft px-2.5 py-1 rounded-md border border-border/40">
                              {a.category?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <select
                              value={a.status}
                              onChange={(e) => statusMutation.mutate({ id: a.id, status: e.target.value })}
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border focus:outline-none cursor-pointer ${cfg.bg}`}
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="PUBLISHED">Published</option>
                              <option value="SCHEDULED">Scheduled</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-[12px] text-text-muted whitespace-nowrap">
                            {a.status === 'SCHEDULED' && a.scheduledAt ? (
                              <span className="flex items-center gap-1 text-amber-700" title="Scheduled Date">
                                <Calendar className="w-3 h-3" /> {format(new Date(a.scheduledAt), 'dd MMM, HH:mm')}
                              </span>
                            ) : (
                              format(new Date(a.publishedAt || a.createdAt), 'dd MMM yyyy')
                            )}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-[11px] text-text-muted mr-2 flex items-center gap-1" title="Views">
                                <Eye className="w-3 h-3" /> {a.views || 0}
                              </span>

                              {a.status === 'PUBLISHED' && (
                                <a
                                  href={`/journal/${a.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text transition"
                                  title="View on site"
                                >
                                  <ExternalLink className="w-4 h-4" strokeWidth={1.8} />
                                </a>
                              )}

                              <Link
                                to={`/articles/${a.id}`}
                                className="p-1.5 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text transition"
                                title="Edit article"
                              >
                                <Edit2 className="w-4 h-4" strokeWidth={1.8} />
                              </Link>

                              <button
                                onClick={() => {
                                  if (confirm('Delete this article?')) deleteMutation.mutate(a.id);
                                }}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-text-muted hover:text-rose-600 transition"
                                title="Delete article"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {articlesData && articlesData.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/50 bg-[#FAFAF7]">
                <div className="text-[12px] text-text-muted">
                  Showing <span className="font-semibold text-text">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-semibold text-text">
                    {Math.min(page * limit, articlesData.total)}
                  </span>{' '}
                  of <span className="font-semibold text-text">{articlesData.total}</span> articles
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-white border border-border rounded-lg px-2.5 py-1 text-[12px] text-text focus:outline-none focus:border-gold"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-soft transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[12px] font-medium px-2">
                      Page {page} of {articlesData.pages}
                    </span>
                    <button
                      disabled={page >= articlesData.pages}
                      onClick={() => setPage((p) => Math.min(articlesData.pages, p + 1))}
                      className="p-1.5 rounded-lg border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-soft transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-[#FAFAF7]">
              <div>
                <h2 className="text-[14px] font-semibold text-text">Journal Categories</h2>
                <p className="text-[12px] text-text-muted">Organize your blog content with custom categories</p>
              </div>
              <button
                onClick={openCreateCategoryModal}
                className="flex items-center gap-1.5 bg-gold hover:bg-gold-dark text-white px-3.5 py-2 rounded-xl text-[12px] font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50 bg-[#FAFAF7]">
                  <th className="px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Name</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Slug</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Articles</th>
                  <th className="text-right px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoriesLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-4 bg-bg-soft rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : categories?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-text-muted text-[13px]">
                      No categories created yet. Click "Add Category" to create one.
                    </td>
                  </tr>
                ) : (
                  categories?.map((c: any) => (
                    <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-[#FDFCFA] transition">
                      <td className="px-6 py-4 text-[13px] font-semibold text-text">{c.name}</td>
                      <td className="px-6 py-4 text-[12px] font-mono text-text-muted">{c.slug}</td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-medium bg-bg-soft px-2.5 py-1 rounded-md text-text-mid border border-border/40">
                          {c._count?.articles || 0} article{(c._count?.articles || 0) === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditCategoryModal(c)}
                            className="p-1.5 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text transition"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" strokeWidth={1.8} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete category "${c.name}"? Articles will remain uncategorized.`)) {
                                deleteCategoryMutation.mutate(c.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-text-muted hover:text-rose-600 transition"
                            title="Delete Category"
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
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] border border-border max-w-md w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-base font-semibold text-text">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 text-text-muted hover:text-text rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fragrance Guides"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCategory) setCatSlug(slugify(e.target.value));
                  }}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. fragrance-guides"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] font-mono text-text focus:outline-none focus:border-gold transition"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-text-mid hover:bg-bg-soft transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="bg-gold hover:bg-gold-dark text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition disabled:opacity-50"
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
