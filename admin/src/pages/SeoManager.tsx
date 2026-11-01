import { useState, useEffect } from 'react';
import {
  Map, FileText, ArrowLeftRight, Activity, BarChart3, Copy,
  Plus, Download, ExternalLink, RefreshCw, CheckCircle,
  AlertTriangle, Globe, Trash2, Edit3, Search, X, Layers,
  FileCheck, Eye, Share2, Check
} from 'lucide-react';
import { useSeoConfig, type SeoConfig, type SeoRedirect, type PageSeoConfig } from '@/hooks/useSeoConfig';
import SerpPreview from '@/components/seo/SerpPreview';
import SocialPreview from '@/components/seo/SocialPreview';

type Tab = 'pages' | 'sitemap' | 'robots' | 'redirects' | 'cwv' | 'gsc' | 'duplicate';

const TABS: { key: Tab; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string }[] = [
  { key: 'pages', icon: Globe, label: 'Page-by-Page SEO' },
  { key: 'sitemap', icon: Map, label: 'Sitemap Manager' },
  { key: 'robots', icon: FileText, label: 'Robots.txt Editor' },
  { key: 'redirects', icon: ArrowLeftRight, label: 'Redirects' },
  { key: 'cwv', icon: Activity, label: 'Core Web Vitals' },
  { key: 'gsc', icon: BarChart3, label: 'GSC Integration' },
  { key: 'duplicate', icon: Copy, label: 'Duplicate Content' },
];

const ic = 'w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition';

function Toggle({ value, onToggle, label }: { value: boolean; onToggle: () => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
      <span className="text-[13px] text-text-mid">{label}</span>
      <button type="button" onClick={onToggle} className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-gold' : 'bg-border'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="text-[14px] font-semibold text-text">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

const DEFAULT_PAGES_FALLBACK: PageSeoConfig[] = [
  {
    id: 'page-home',
    path: '/',
    pageName: 'Home Page',
    seoTitle: 'AVORO — Luxury Perfumes & Artisanal Fragrances',
    seoDescription: 'Discover exquisite luxury perfumes and artisanal fragrances crafted with premium ingredients and memorable notes at AVORO.',
    focusKeyword: 'luxury perfumes india',
    canonical: 'https://avoro.in/',
    ogTitle: 'AVORO — Luxury Perfumes & Artisanal Fragrances',
    ogDescription: 'Discover exquisite luxury perfumes and artisanal fragrances crafted with premium ingredients.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-collection',
    path: '/collection',
    pageName: 'Collections / Shop',
    seoTitle: 'Fragrance Collections — AVORO',
    seoDescription: 'Explore our exclusive collection of luxury perfumes, eau de parfums, signature scents, and gift sets.',
    focusKeyword: 'luxury perfume collection',
    canonical: 'https://avoro.in/collection',
    ogTitle: 'Fragrance Collections — AVORO',
    ogDescription: 'Explore our exclusive collection of luxury perfumes and signature scents.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-journal',
    path: '/journal',
    pageName: 'Journal & Stories',
    seoTitle: 'The Journal — AVORO Fragrance Guides & Scent Stories',
    seoDescription: 'Read fragrance guides, perfume scent notes breakdown, and behind-the-scenes stories of luxury perfume creations.',
    focusKeyword: 'perfume guide scent notes',
    canonical: 'https://avoro.in/journal',
    ogTitle: 'The Journal — AVORO Fragrance Guides & Stories',
    ogDescription: 'Read fragrance guides and stories behind our luxury perfume creations.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-about',
    path: '/about',
    pageName: 'About Us',
    seoTitle: 'About AVORO — Heritage & Perfumery Craftsmanship',
    seoDescription: 'Learn about AVORO\'s history, heritage, artisanal craft, and dedication to rare fragrance notes.',
    focusKeyword: 'avoro luxury perfumery about',
    canonical: 'https://avoro.in/about',
    ogTitle: 'About AVORO — Heritage & Craftsmanship',
    ogDescription: 'Learn about AVORO\'s history and dedication to rare fragrance notes.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-contact',
    path: '/contact',
    pageName: 'Contact Us',
    seoTitle: 'Contact Us — AVORO Concierge & Support',
    seoDescription: 'Get in touch with the AVORO concierge team for order inquiries, fragrance recommendations, and support.',
    focusKeyword: 'avoro customer support contact',
    canonical: 'https://avoro.in/contact',
    ogTitle: 'Contact Us — AVORO Concierge',
    ogDescription: 'Get in touch with the AVORO concierge team.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'WebPage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-faq',
    path: '/faq',
    pageName: 'FAQ Page',
    seoTitle: 'Frequently Asked Questions — AVORO',
    seoDescription: 'Find answers to common questions regarding shipping, returns, perfume application, longevity, and orders.',
    focusKeyword: 'avoro perfume faq shipping returns',
    canonical: 'https://avoro.in/faq',
    ogTitle: 'Frequently Asked Questions — AVORO',
    ogDescription: 'Find answers to common questions regarding shipping, returns, and orders.',
    ogImage: '',
    noIndex: false,
    noFollow: false,
    schemaType: 'FAQPage',
    updatedAt: new Date().toISOString(),
  },
];

const CORE_PAGE_PATHS = ['/', '/collection', '/journal', '/about', '/contact', '/faq'];

function PagesTab({ config, onSave }: { config: SeoConfig; onSave: (patch: Partial<SeoConfig>) => Promise<void> }) {
  const [pages, setPages] = useState<PageSeoConfig[]>(() => {
    return config.pages && config.pages.length > 0 ? config.pages : DEFAULT_PAGES_FALLBACK;
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'index' | 'noindex'>('all');
  const [editingPage, setEditingPage] = useState<PageSeoConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'serp' | 'social'>('serp');

  useEffect(() => {
    if (config.pages && config.pages.length > 0) {
      setPages(config.pages);
    }
  }, [config.pages]);

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    let updated: PageSeoConfig[];
    const exists = pages.some((p) => p.id === editingPage.id);
    const cleanPage = {
      ...editingPage,
      path: editingPage.path.startsWith('/') ? editingPage.path : `/${editingPage.path}`,
      updatedAt: new Date().toISOString(),
    };

    if (exists) {
      updated = pages.map((p) => (p.id === editingPage.id ? cleanPage : p));
    } else {
      updated = [...pages, cleanPage];
    }

    setPages(updated);
    setIsModalOpen(false);
    setEditingPage(null);
    await onSave({ pages: updated });
  };

  const handleDeletePage = async (id: string) => {
    const updated = pages.filter((p) => p.id !== id);
    setPages(updated);
    await onSave({ pages: updated });
  };

  const handleAddNewPage = () => {
    const newPage: PageSeoConfig = {
      id: `page-custom-${Date.now()}`,
      path: '/new-page',
      pageName: 'Custom Page',
      seoTitle: '',
      seoDescription: '',
      focusKeyword: '',
      canonical: 'https://avoro.in/new-page',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      noIndex: false,
      noFollow: false,
      schemaType: 'WebPage',
    };
    setEditingPage(newPage);
    setIsModalOpen(true);
  };

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.pageName.toLowerCase().includes(search.toLowerCase()) ||
      p.path.toLowerCase().includes(search.toLowerCase()) ||
      p.seoTitle.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'index') return matchesSearch && !p.noIndex;
    if (statusFilter === 'noindex') return matchesSearch && p.noIndex;
    return matchesSearch;
  });

  const totalPages = pages.length;
  const indexablePages = pages.filter((p) => !p.noIndex).length;
  const noIndexPages = pages.filter((p) => p.noIndex).length;
  const missingMetaDesc = pages.filter((p) => !p.seoDescription.trim()).length;

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border/50 p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Managed Pages</p>
            <p className="text-[22px] font-display font-semibold text-text mt-1">{totalPages}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-pale/50 flex items-center justify-center text-gold-dark">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Indexable Pages</p>
            <p className="text-[22px] font-display font-semibold text-success mt-1">{indexablePages}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">NoIndex Pages</p>
            <p className="text-[22px] font-display font-semibold text-warning mt-1">{noIndexPages}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Missing Meta Description</p>
            <p className={`text-[22px] font-display font-semibold mt-1 ${missingMetaDesc > 0 ? 'text-danger' : 'text-text-muted'}`}>{missingMetaDesc}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-bg-soft flex items-center justify-center text-text-muted">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <Card title="Page-by-Page SEO Metadata">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search page name, path, or title..."
                className="w-full bg-bg border border-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold transition"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-bg border border-border rounded-xl px-3 py-2.5 text-[12px] font-medium text-text focus:outline-none focus:border-gold"
            >
              <option value="all">All Pages</option>
              <option value="index">Indexable Only</option>
              <option value="noindex">NoIndex Only</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddNewPage}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gold text-white rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Page SEO
          </button>
        </div>

        {/* Table of Pages */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/50">
                {['Page Name & Path', 'SEO Title', 'Meta Description', 'Focus Keyword', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No pages matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPages.map((p) => (
                  <tr key={p.id} className="hover:bg-bg-soft/50 transition">
                    <td className="py-3.5 pr-4 font-medium text-text">
                      <div className="font-semibold text-text">{p.pageName}</div>
                      <div className="text-[11px] font-mono text-gold-dark">{p.path}</div>
                    </td>
                    <td className="py-3.5 pr-4 max-w-[200px]">
                      <div className="truncate font-medium text-text" title={p.seoTitle}>{p.seoTitle || <span className="text-text-muted italic">Not set</span>}</div>
                      <div className="text-[10px] text-text-muted">{p.seoTitle.length}/60 chars</div>
                    </td>
                    <td className="py-3.5 pr-4 max-w-[260px]">
                      <div className="truncate text-text-mid" title={p.seoDescription}>{p.seoDescription || <span className="text-text-muted italic">Not set</span>}</div>
                      <div className="text-[10px] text-text-muted">{p.seoDescription.length}/160 chars</div>
                    </td>
                    <td className="py-3.5 pr-4">
                      {p.focusKeyword ? (
                        <span className="px-2 py-0.5 rounded-md bg-gold-pale text-gold-dark text-[10px] font-medium border border-gold/20">
                          {p.focusKeyword}
                        </span>
                      ) : (
                        <span className="text-text-muted italic text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      {p.noIndex ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-danger/10 text-danger">
                          NoIndex
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success">
                          Index, Follow
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPage({ ...p });
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-bg hover:bg-gold-pale border border-border hover:border-gold/40 text-text hover:text-gold-dark rounded-lg font-medium transition flex items-center gap-1 text-[11px]"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        {!CORE_PAGE_PATHS.includes(p.path) && (
                          <button
                            type="button"
                            onClick={() => handleDeletePage(p.id)}
                            className="p-1.5 text-text-muted hover:text-danger transition rounded-lg hover:bg-danger/10"
                            title="Delete custom page SEO"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Page Modal */}
      {isModalOpen && editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h2 className="text-[18px] font-semibold text-text">Edit Page SEO — {editingPage.pageName}</h2>
                <p className="text-[12px] text-text-muted">Configure SEO meta tags, OpenGraph previews, and indexing settings for path <span className="font-mono text-gold-dark">{editingPage.path}</span>.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPage(null);
                }}
                className="p-2 text-text-muted hover:text-text rounded-full hover:bg-bg-soft transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Page Display Name</label>
                  <input
                    type="text"
                    value={editingPage.pageName}
                    onChange={(e) => setEditingPage({ ...editingPage, pageName: e.target.value })}
                    required
                    placeholder="e.g. About Us"
                    className={ic}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">URL Path</label>
                  <input
                    type="text"
                    value={editingPage.path}
                    onChange={(e) => setEditingPage({ ...editingPage, path: e.target.value })}
                    required
                    placeholder="e.g. /about"
                    className={ic}
                  />
                </div>
              </div>

              {/* SEO Title & Description */}
              <div className="space-y-4 bg-bg-soft/40 rounded-2xl p-4 border border-border/40">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">SEO Title (Title Tag)</label>
                    <span className={`text-[10px] font-semibold ${editingPage.seoTitle.length > 60 ? 'text-danger' : editingPage.seoTitle.length >= 50 ? 'text-success' : 'text-warning'}`}>
                      {editingPage.seoTitle.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editingPage.seoTitle}
                    onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                    placeholder="Enter page SEO title..."
                    maxLength={70}
                    className={ic}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Meta Description</label>
                    <span className={`text-[10px] font-semibold ${editingPage.seoDescription.length > 160 ? 'text-danger' : editingPage.seoDescription.length >= 120 ? 'text-success' : 'text-warning'}`}>
                      {editingPage.seoDescription.length}/160
                    </span>
                  </div>
                  <textarea
                    value={editingPage.seoDescription}
                    onChange={(e) => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                    rows={3}
                    maxLength={180}
                    placeholder="Enter page meta description..."
                    className={`${ic} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Focus Keyword</label>
                    <input
                      type="text"
                      value={editingPage.focusKeyword || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, focusKeyword: e.target.value })}
                      placeholder="e.g. artisanal perfumes india"
                      className={ic}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Canonical URL</label>
                      <button
                        type="button"
                        onClick={() => setEditingPage({ ...editingPage, canonical: `https://avoro.in${editingPage.path.startsWith('/') ? editingPage.path : `/${editingPage.path}`}` })}
                        className="text-[10px] text-gold-dark hover:underline font-medium"
                      >
                        Set Default
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editingPage.canonical || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, canonical: e.target.value })}
                      placeholder="https://avoro.in/page-path"
                      className={ic}
                    />
                  </div>
                </div>
              </div>

              {/* Social / OG Settings */}
              <div className="space-y-4 bg-bg-soft/40 rounded-2xl p-4 border border-border/40">
                <h4 className="text-[12px] font-bold text-text uppercase tracking-wider">Social / OpenGraph Meta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">OG Title</label>
                    <input
                      type="text"
                      value={editingPage.ogTitle || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, ogTitle: e.target.value })}
                      placeholder="Defaults to SEO title if blank"
                      className={ic}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">OG Image URL</label>
                    <input
                      type="text"
                      value={editingPage.ogImage || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, ogImage: e.target.value })}
                      placeholder="https://avoro.in/og-image.jpg"
                      className={ic}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">OG Description</label>
                  <textarea
                    value={editingPage.ogDescription || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, ogDescription: e.target.value })}
                    rows={2}
                    placeholder="Defaults to Meta Description if blank"
                    className={`${ic} resize-none`}
                  />
                </div>
              </div>

              {/* Indexing & Schema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 bg-bg-soft/40 rounded-2xl p-4 border border-border/40">
                  <h4 className="text-[12px] font-bold text-text uppercase tracking-wider">Robots Indexing</h4>
                  <Toggle
                    value={!editingPage.noIndex}
                    onToggle={() => setEditingPage({ ...editingPage, noIndex: !editingPage.noIndex })}
                    label="Allow search engine indexing (index)"
                  />
                  <Toggle
                    value={!editingPage.noFollow}
                    onToggle={() => setEditingPage({ ...editingPage, noFollow: !editingPage.noFollow })}
                    label="Allow link following (follow)"
                  />
                </div>

                <div className="space-y-3 bg-bg-soft/40 rounded-2xl p-4 border border-border/40">
                  <h4 className="text-[12px] font-bold text-text uppercase tracking-wider">Schema Type</h4>
                  <select
                    value={editingPage.schemaType || 'WebPage'}
                    onChange={(e) => setEditingPage({ ...editingPage, schemaType: e.target.value })}
                    className={ic}
                  >
                    <option value="WebPage">WebPage Schema</option>
                    <option value="FAQPage">FAQPage Schema</option>
                    <option value="Article">Article Schema</option>
                    <option value="Product">Product Schema</option>
                    <option value="Organization">Organization Schema</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="space-y-3 border border-border/60 rounded-2xl p-4 bg-white">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="text-[12px] font-bold text-text uppercase tracking-wider">Live SERP & Social Preview</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('serp')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                        previewMode === 'serp' ? 'bg-gold-pale text-gold-dark' : 'text-text-muted hover:bg-bg-soft'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Google SERP
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('social')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                        previewMode === 'social' ? 'bg-gold-pale text-gold-dark' : 'text-text-muted hover:bg-bg-soft'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" /> Social Media
                    </button>
                  </div>
                </div>

                {previewMode === 'serp' ? (
                  <SerpPreview
                    title={editingPage.seoTitle}
                    description={editingPage.seoDescription}
                    slug={editingPage.path.replace(/^\//, '')}
                  />
                ) : (
                  <SocialPreview
                    ogTitle={editingPage.ogTitle || editingPage.seoTitle}
                    ogDescription={editingPage.ogDescription || editingPage.seoDescription}
                    ogImage={editingPage.ogImage || ''}
                    twitterCard="summary_large_image"
                  />
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPage(null);
                  }}
                  className="px-4 py-2.5 bg-bg border border-border rounded-xl text-[13px] font-medium text-text-mid hover:border-gold/40 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition shadow-sm"
                >
                  <Check className="w-4 h-4" /> Save Page SEO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SitemapTab({ config, onSave, onRegenerate, regenerating }: {
  config: SeoConfig;
  onSave: (patch: Partial<SeoConfig>) => Promise<void>;
  onRegenerate: () => Promise<void>;
  regenerating: boolean;
}) {
  const [sitemap, setSitemap] = useState(config.sitemap);
  const freqOptions = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

  useEffect(() => { setSitemap(config.sitemap); }, [config.sitemap]);

  return (
    <div className="space-y-6">
      <Card title="Sitemap Settings">
        <Toggle value={sitemap.autoGenerate} onToggle={() => setSitemap((s) => ({ ...s, autoGenerate: !s.autoGenerate }))} label="Auto-generate XML sitemap" />
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Sitemap URL</label>
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-4 py-2.5">
            <span className="text-[13px] text-text-mid flex-1">https://avoro.in/sitemap.xml</span>
            <a href="https://avoro.in/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:text-gold transition">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Card>

      <Card title="Per-Type Settings">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/50">
                {['Type', 'Include', 'Change Frequency', 'Priority'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sitemap.types.map((t, i) => (
                <tr key={t.label}>
                  <td className="py-3 pr-4 font-medium text-text">{t.label}</td>
                  <td className="py-3 pr-4">
                    <button type="button" onClick={() => { const u = [...sitemap.types]; u[i] = { ...u[i], include: !u[i].include }; setSitemap({ ...sitemap, types: u }); }}
                      className={`w-9 h-5 rounded-full relative transition-colors ${t.include ? 'bg-gold' : 'bg-border'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${t.include ? 'translate-x-4' : ''}`} />
                    </button>
                  </td>
                  <td className="py-3 pr-4">
                    <select value={t.freq} onChange={(e) => { const u = [...sitemap.types]; u[i] = { ...u[i], freq: e.target.value }; setSitemap({ ...sitemap, types: u }); }}
                      className="bg-bg border border-border rounded-lg px-2 py-1.5 text-[12px] text-text focus:outline-none focus:border-gold appearance-none pr-6">
                      {freqOptions.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </td>
                  <td className="py-3">
                    <select value={t.priority} onChange={(e) => { const u = [...sitemap.types]; u[i] = { ...u[i], priority: e.target.value }; setSitemap({ ...sitemap, types: u }); }}
                      className="bg-bg border border-border rounded-lg px-2 py-1.5 text-[12px] text-text focus:outline-none focus:border-gold">
                      {['1.0','0.9','0.8','0.7','0.6','0.5','0.4','0.3','0.2','0.1'].map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Actions">
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={regenerating} onClick={async () => { await onSave({ sitemap }); await onRegenerate(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition shadow-sm disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} /> Regenerate Sitemap
          </button>
          <button type="button" onClick={() => onSave({ sitemap })}
            className="px-4 py-2.5 bg-bg border border-border rounded-xl text-[13px] font-medium text-text-mid hover:border-gold/40 transition">
            Save Settings
          </button>
        </div>
        {sitemap.lastRegen && (
          <div className="flex items-center gap-2 text-[12px] text-success">
            <CheckCircle className="w-3.5 h-3.5" /> Last regenerated: {new Date(sitemap.lastRegen).toLocaleString()}
          </div>
        )}
      </Card>
    </div>
  );
}

function RobotsTab({ config, onSave }: { config: SeoConfig; onSave: (patch: Partial<SeoConfig>) => Promise<void> }) {
  const [robots, setRobots] = useState(config.robots);
  const [disallowPath, setDisallowPath] = useState('');
  const [crawlDelay, setCrawlDelay] = useState('');

  useEffect(() => { setRobots(config.robots); }, [config.robots]);

  const addDisallow = () => {
    if (!disallowPath) return;
    setRobots((r) => `${r}\nDisallow: ${disallowPath}`);
    setDisallowPath('');
  };

  const applyCrawlDelay = () => {
    if (!crawlDelay) return;
    setRobots((r) => `${r}\nCrawl-delay: ${crawlDelay}`);
    setCrawlDelay('');
  };

  return (
    <div className="space-y-6">
      <Card title="Quick Rules">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Disallow Path</label>
            <div className="flex gap-2">
              <input value={disallowPath} onChange={(e) => setDisallowPath(e.target.value)} placeholder="/private/" className={ic} />
              <button type="button" onClick={addDisallow} className="px-3 py-2 bg-bg border border-border rounded-xl text-text-muted hover:text-text hover:border-gold/30 transition"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Crawl Delay (seconds)</label>
            <div className="flex gap-2">
              <input value={crawlDelay} onChange={(e) => setCrawlDelay(e.target.value)} type="number" placeholder="10" className={ic} />
              <button type="button" onClick={applyCrawlDelay} className="px-3 py-2 bg-bg border border-border rounded-xl text-[12px] text-text-mid hover:border-gold/30 transition">Add</button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Editor">
          <textarea value={robots} onChange={(e) => setRobots(e.target.value)} rows={14}
            className="w-full bg-[#1e1e1e] text-[#d4d4d4] rounded-xl px-4 py-3 text-[12px] font-mono resize-none focus:outline-none focus:ring-1 focus:ring-gold/20" />
          <div className="flex gap-3 flex-wrap">
            <button type="button" onClick={() => onSave({ robots })}
              className="flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition shadow-sm">
              Save & Publish
            </button>
            <button type="button" onClick={() => setRobots(config.robots)}
              className="px-4 py-2.5 bg-bg border border-border rounded-xl text-[13px] font-medium text-text-mid hover:border-gold/40 transition">
              Reset
            </button>
          </div>
        </Card>
        <Card title="Preview (Read-only)">
          <pre className="bg-bg-soft rounded-xl p-4 text-[12px] font-mono text-text-mid whitespace-pre-wrap leading-relaxed">{robots}</pre>
        </Card>
      </div>
    </div>
  );
}

function RedirectsTab({ config, onSave }: { config: SeoConfig; onSave: (patch: Partial<SeoConfig>) => Promise<void> }) {
  const [redirects, setRedirects] = useState<SeoRedirect[]>(config.redirects);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState<'301' | '302' | '410'>('301');

  useEffect(() => { setRedirects(config.redirects); }, [config.redirects]);

  const add = () => {
    if (!from || !to) return;
    const next = [...redirects, { id: Date.now().toString(), from, to, type, date: new Date().toLocaleDateString(), hits: 0 }];
    setRedirects(next);
    setFrom('');
    setTo('');
    onSave({ redirects: next });
  };

  const remove = (id: string) => {
    const next = redirects.filter((r) => r.id !== id);
    setRedirects(next);
    onSave({ redirects: next });
  };

  const exportCsv = () => {
    const csv = ['from,to,type', ...redirects.map((r) => `${r.from},${r.to},${r.type}`)].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv]));
    a.download = 'redirects.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card title="Add Redirect">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">From URL</label>
            <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="/old-url" className={ic} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">To URL</label>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="/new-url" className={ic} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as '301' | '302' | '410')} className={ic}>
              <option>301</option><option>302</option><option>410</option>
            </select>
          </div>
          <button type="button" onClick={add}
            className="px-4 py-2.5 bg-gold text-white rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition shadow-sm">
            Add
          </button>
        </div>
        <button type="button" onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 bg-bg border border-border rounded-xl text-[12px] text-text-mid hover:border-gold/30 transition">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </Card>

      <Card title={`Redirects (${redirects.length})`}>
        {redirects.length === 0 ? (
          <p className="text-[13px] text-text-muted">No redirects configured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border/50">
                  {['From', 'To', 'Type', 'Date', ''].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {redirects.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-4 font-mono text-text-mid">{r.from}</td>
                    <td className="py-2.5 pr-4 font-mono text-text-mid">{r.to}</td>
                    <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-pale text-gold-dark">{r.type}</span></td>
                    <td className="py-2.5 pr-4 text-text-muted">{r.date}</td>
                    <td className="py-2.5">
                      <button type="button" onClick={() => remove(r.id)} className="text-text-muted hover:text-danger transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function CwvTab({ config, onSave }: { config: SeoConfig; onSave: (patch: Partial<SeoConfig>) => Promise<void> }) {
  const [cwv, setCwv] = useState(config.cwv);

  useEffect(() => { setCwv(config.cwv); }, [config.cwv]);

  const getStatus = (val: string, good: number, poor: number) => {
    const n = parseFloat(val);
    if (isNaN(n)) return null;
    if (n <= good) return { label: 'Good', cls: 'text-success bg-success/10' };
    if (n <= poor) return { label: 'Needs Improvement', cls: 'text-warning bg-warning/10' };
    return { label: 'Poor', cls: 'text-danger bg-danger/10' };
  };

  const thresholds = [
    { good: 2.5, poor: 4.0, hint: 'Target: under 2.5s' },
    { good: 200, poor: 500, hint: 'Target: under 200ms' },
    { good: 0.1, poor: 0.25, hint: 'Target: under 0.1' },
  ];

  return (
    <div className="space-y-6">
      <Card title="Core Web Vitals">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cwv.metrics.map((m, i) => {
            const status = getStatus(m.value, thresholds[i].good, thresholds[i].poor);
            return (
              <div key={m.label} className="bg-bg rounded-xl p-4 space-y-3">
                <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{m.label}</div>
                <input value={m.value} onChange={(e) => { const u = [...cwv.metrics]; u[i] = { ...u[i], value: e.target.value }; setCwv({ ...cwv, metrics: u }); }}
                  placeholder={`e.g. ${thresholds[i].good}`}
                  className="w-full bg-white border border-border rounded-xl px-3 py-2 text-[13px] text-text focus:outline-none focus:border-gold transition" />
                {status && <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${status.cls}`}>{status.label}</span>}
                <div className="text-[10px] text-text-muted">{thresholds[i].hint}</div>
              </div>
            );
          })}
        </div>
        <input type="date" value={cwv.lastTested} onChange={(e) => setCwv({ ...cwv, lastTested: e.target.value })} className={ic} />
        <textarea value={cwv.notes} onChange={(e) => setCwv({ ...cwv, notes: e.target.value })} rows={3} placeholder="Log what you tested and fixed..." className={`${ic} resize-none`} />
        <button type="button" onClick={() => onSave({ cwv })}
          className="px-4 py-2.5 bg-gold text-white rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition shadow-sm">
          Save Metrics
        </button>
      </Card>
    </div>
  );
}

function GscTab({ config, onSave }: { config: SeoConfig; onSave: (patch: Partial<SeoConfig>) => Promise<void> }) {
  const [gsc, setGsc] = useState(config.gsc);
  useEffect(() => { setGsc(config.gsc); }, [config.gsc]);

  return (
    <div className="space-y-6">
      <Card title="Verification">
        <input value={gsc.verificationCode} onChange={(e) => setGsc({ verificationCode: e.target.value })} placeholder="google-site-verification=..." className={ic} />
        <p className="text-[11px] text-text-muted">Saved to your site metadata after you click Save.</p>
        <button type="button" onClick={() => onSave({ gsc })}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition shadow-sm">
          <Globe className="w-4 h-4" /> Save Verification Code
        </button>
      </Card>
      <Card title="Search Performance">
        <div className="text-[12px] text-text-muted bg-bg-soft rounded-xl px-4 py-3">
          Live Google Search Console data requires OAuth integration. Use the verification code above and view performance directly in GSC.
        </div>
      </Card>
    </div>
  );
}

function DuplicateTab({ config, onSave, onScan, scanResult, scanning }: {
  config: SeoConfig;
  onSave: (patch: Partial<SeoConfig>) => Promise<void>;
  onScan: () => Promise<void>;
  scanResult?: { duplicateTitles: { title: string; paths: string[] }[]; duplicateDescriptions: { description: string; paths: string[] }[]; thinContent: string[] };
  scanning: boolean;
}) {
  const [duplicate, setDuplicate] = useState(config.duplicate);
  useEffect(() => { setDuplicate(config.duplicate); }, [config.duplicate]);

  return (
    <div className="space-y-6">
      <Card title="Domain Settings">
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            {(['non-www', 'www'] as const).map((d) => (
              <button key={d} type="button" onClick={() => setDuplicate({ ...duplicate, preferredDomain: d })}
                className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition ${duplicate.preferredDomain === d ? 'bg-gold-pale border-gold/40 text-gold-dark' : 'bg-bg border-border text-text-mid hover:border-gold/30'}`}>
                {d === 'www' ? 'www.avoro.in' : 'avoro.in'}
              </button>
            ))}
          </div>
          <Toggle value={duplicate.forceHttps} onToggle={() => setDuplicate({ ...duplicate, forceHttps: !duplicate.forceHttps })} label="Force HTTPS redirect" />
          <button type="button" onClick={() => onSave({ duplicate })}
            className="px-4 py-2.5 bg-gold text-white rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition shadow-sm">
            Save Domain Settings
          </button>
        </div>
      </Card>

      <Card title="Content Scanner">
        <button type="button" onClick={onScan} disabled={scanning}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-xl text-[13px] font-semibold hover:bg-gold-dark transition shadow-sm disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Scan for Duplicate Content'}
        </button>

        {scanResult && (
          <div className="space-y-4 mt-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {scanResult.duplicateTitles.length === 0 ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                <span className="text-[12px] font-semibold">Duplicate Titles: {scanResult.duplicateTitles.length === 0 ? 'None found' : `${scanResult.duplicateTitles.length} group(s)`}</span>
              </div>
              {scanResult.duplicateTitles.map((item) => (
                <div key={item.title} className="pl-5 text-[12px] text-text-muted font-mono">{item.title} → {item.paths.join(', ')}</div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                {scanResult.duplicateDescriptions.length === 0 ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                <span className="text-[12px] font-semibold">Duplicate Meta Descriptions: {scanResult.duplicateDescriptions.length === 0 ? 'None found' : `${scanResult.duplicateDescriptions.length} group(s)`}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                {scanResult.thinContent.length === 0 ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                <span className="text-[12px] font-semibold">Thin Content: {scanResult.thinContent.length === 0 ? 'None found' : `${scanResult.thinContent.length} page(s)`}</span>
              </div>
              {scanResult.thinContent.map((item) => (
                <div key={item} className="pl-5 text-[12px] text-text-muted font-mono">{item}</div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function SeoManager() {
  const [tab, setTab] = useState<Tab>('pages');
  const { config, isLoading, save, regenerate, regenerating, scan, scanResult, scanning } = useSeoConfig();

  useEffect(() => {
    document.title = 'SEO Manager — Avoro Admin';
    return () => {
      document.title = 'AVORO Admin';
    };
  }, []);

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">SEO Manager</h1>
        <p className="text-[13px] text-text-muted mt-0.5">Manage page-by-page SEO, sitemaps, robots.txt, redirects, and search performance.</p>
      </div>

      <div className="flex gap-1 bg-white border border-border/50 rounded-2xl p-1.5 flex-wrap">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition whitespace-nowrap ${
              tab === key ? 'bg-gradient-to-r from-gold-pale to-gold-pale/40 text-gold-dark shadow-sm' : 'text-text-mid hover:bg-bg-hover hover:text-text'
            }`}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'pages' && <PagesTab config={config} onSave={save} />}
      {tab === 'sitemap' && <SitemapTab config={config} onSave={save} onRegenerate={regenerate} regenerating={regenerating} />}
      {tab === 'robots' && <RobotsTab config={config} onSave={save} />}
      {tab === 'redirects' && <RedirectsTab config={config} onSave={save} />}
      {tab === 'cwv' && <CwvTab config={config} onSave={save} />}
      {tab === 'gsc' && <GscTab config={config} onSave={save} />}
      {tab === 'duplicate' && <DuplicateTab config={config} onSave={save} onScan={scan} scanResult={scanResult} scanning={scanning} />}
    </div>
  );
}