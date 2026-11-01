import { useState } from 'react';
import {
  ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle,
  Link2, Globe, Image, Code2, Zap, Search, Share2, FileJson, Eye
} from 'lucide-react';
import SerpPreview from './SerpPreview';
import SocialPreview from './SocialPreview';
import SchemaBuilder from './SchemaBuilder';
import HeadingTree from './HeadingTree';

export type SeoFormData = {
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  slug: string;
  canonical: string;
  autoRedirect301: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  schemaType: 'Product' | 'Article' | 'FAQPage' | 'WebPage' | 'BreadcrumbList';
  noIndex: boolean;
  noFollow: boolean;
  lazyLoadImages: boolean;
  deferJs: boolean;
  preloadHeroImage: boolean;
  inlineCriticalCss: boolean;
  minifyHtml: boolean;
  enableCaching: boolean;
  headCode: string;
  bodyStartCode: string;
  bodyEndCode: string;
}

export const defaultSeoData = (): SeoFormData => ({
  seoTitle: '', seoDescription: '', focusKeyword: '',
  slug: '', canonical: '', autoRedirect301: true,
  ogTitle: '', ogDescription: '', ogImage: '', ogType: 'website', twitterCard: 'summary_large_image',
  schemaType: 'Product',
  noIndex: false, noFollow: false,
  lazyLoadImages: true, deferJs: true, preloadHeroImage: false,
  inlineCriticalCss: false, minifyHtml: false, enableCaching: true,
  headCode: '', bodyStartCode: '', bodyEndCode: '',
});

interface Props {
  data: SeoFormData;
  onChange: (data: SeoFormData) => void;
  content?: string; // HTML body content for analysis
  images?: { url: string; alt: string }[];
  onImagesChange?: (images: { url: string; alt: string }[]) => void;
  pageType?: 'product' | 'article';
  productData?: { name: string; description: string; price: number; sku: string; image: string; brand?: string };
  articleData?: { title: string; description: string; author?: string; publishedAt?: string; image?: string };
}

type SectionKey = 'title' | 'keyword' | 'serp' | 'url' | 'social' | 'schema' | 'robots' | 'speed' | 'headings' | 'links' | 'code' | 'alttext';

const sections: { key: SectionKey; icon: React.ComponentType<any>; label: string }[] = [
  { key: 'title',    icon: Search,    label: 'SEO Title & Meta Description' },
  { key: 'keyword',  icon: Search,    label: 'Focus Keyword & Analysis' },
  { key: 'serp',     icon: Eye,       label: 'SERP Preview' },
  { key: 'url',      icon: Link2,     label: 'URL Slug & Canonical' },
  { key: 'social',   icon: Share2,    label: 'OG / Social Tags' },
  { key: 'schema',   icon: FileJson,  label: 'Schema Markup' },
  { key: 'robots',   icon: Globe,     label: 'Robots Meta' },
  { key: 'speed',    icon: Zap,       label: 'Page Speed Toggles' },
  { key: 'headings', icon: FileJson,  label: 'Heading Structure' },
  { key: 'links',    icon: Link2,     label: 'Internal Link Checker' },
  { key: 'alttext',  icon: Image,     label: 'Image Alt Text' },
  { key: 'code',     icon: Code2,     label: 'Header Code Injection' },
];

export default function SeoPanel({ data, onChange, content = '', images = [], onImagesChange, productData, articleData }: Props) {
  const [open, setOpen] = useState<Set<SectionKey>>(new Set(['title']));
  const [linkSearch, setLinkSearch] = useState('');

  const set = (patch: Partial<SeoFormData>) => onChange({ ...data, ...patch });
  const toggle = (key: SectionKey) => setOpen((prev) => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });

  const ic = "w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-[12px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition";
  const Toggle = ({ value, onToggle, label }: { value: boolean; onToggle: () => void; label: string }) => (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none py-1">
      <span className="text-[12px] text-text-mid">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-9 h-5 rounded-full transition-colors ${value ? 'bg-gold' : 'bg-border'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : ''}`} />
      </button>
    </label>
  );

  // Keyword analysis checks
  const kw = data.focusKeyword.toLowerCase().trim();
  const contentText = content.toLowerCase().replace(/<[^>]+>/g, '');
  const kwChecks = [
    { label: 'In SEO title', pass: kw.length > 0 && data.seoTitle.toLowerCase().includes(kw) },
    { label: 'In meta description', pass: kw.length > 0 && data.seoDescription.toLowerCase().includes(kw) },
    { label: 'In URL slug', pass: kw.length > 0 && data.slug.toLowerCase().includes(kw.replace(/\s+/g, '-')) },
    { label: 'In H1 tag', pass: kw.length > 0 && /<h1[^>]*>.*?<\/h1>/i.test(content) && content.toLowerCase().includes(kw) },
    { label: 'In first paragraph', pass: kw.length > 0 && (() => { const m = /<p[^>]*>(.*?)<\/p>/i.exec(content); return m ? m[1].toLowerCase().includes(kw) : false; })() },
    { label: 'In image alt texts', pass: kw.length > 0 && images.some((img) => img.alt.toLowerCase().includes(kw)) },
  ];

  const words = contentText.split(/\s+/).filter(Boolean);
  const kwOccurrences = kw.length > 0 ? words.filter((w) => w.includes(kw.split(' ')[0])).length : 0;
  const kwDensity = words.length > 0 ? ((kwOccurrences / words.length) * 100).toFixed(1) : '0.0';

  const internalLinks = (content.match(/href=["'][/][^"']/g) || []).length;

  const renderSection = (key: SectionKey) => {
    const isOpen = open.has(key);
    const section = sections.find((s) => s.key === key)!;
    const Icon = section.icon;

    return (
      <div key={key} className="border border-border/60 rounded-[14px] overflow-hidden">
        <button
          type="button"
          onClick={() => toggle(key)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-bg-soft/50 transition"
        >
          <div className="flex items-center gap-2.5">
            <Icon className="w-3.5 h-3.5 text-gold-dark" />
            <span className="text-[13px] font-semibold text-text">{section.label}</span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </button>

        {isOpen && (
          <div className="px-5 pb-5 pt-3 bg-white border-t border-border/40 space-y-4">
            {/* ── TITLE & META ── */}
            {key === 'title' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">SEO Title</label>
                    <span className={`text-[10px] font-semibold ${data.seoTitle.length > 60 ? 'text-danger' : data.seoTitle.length >= 50 ? 'text-success' : 'text-warning'}`}>
                      {data.seoTitle.length}/60
                    </span>
                  </div>
                  <input value={data.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} maxLength={70} placeholder="Enter SEO title..." className={ic} />
                  <div className="mt-1.5 h-1 bg-bg-soft rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${data.seoTitle.length > 60 ? 'bg-danger' : data.seoTitle.length >= 50 ? 'bg-success' : 'bg-warning'}`}
                      style={{ width: `${Math.min(100, (data.seoTitle.length / 60) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Meta Description</label>
                    <span className={`text-[10px] font-semibold ${data.seoDescription.length > 160 ? 'text-danger' : data.seoDescription.length >= 120 ? 'text-success' : 'text-warning'}`}>
                      {data.seoDescription.length}/160
                    </span>
                  </div>
                  <textarea value={data.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} maxLength={180} rows={3} placeholder="Enter meta description..." className={`${ic} resize-none`} />
                  <div className="mt-1.5 h-1 bg-bg-soft rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${data.seoDescription.length > 160 ? 'bg-danger' : data.seoDescription.length >= 120 ? 'bg-success' : 'bg-warning'}`}
                      style={{ width: `${Math.min(100, (data.seoDescription.length / 160) * 100)}%` }} />
                  </div>
                </div>
              </>
            )}

            {/* ── FOCUS KEYWORD ── */}
            {key === 'keyword' && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Focus Keyword</label>
                  <input value={data.focusKeyword} onChange={(e) => set({ focusKeyword: e.target.value })} placeholder="e.g. luxury perfume india" className={ic} />
                </div>
                {kw.length > 0 && (
                  <div className="space-y-1.5">
                    {kwChecks.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {c.pass
                          ? <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-danger/60 flex-shrink-0" />}
                        <span className={`text-[12px] ${c.pass ? 'text-text-mid' : 'text-text-muted'}`}>{c.label}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-1 border-t border-border/40 mt-2">
                      <span className="text-[11px] text-text-muted">Keyword density:</span>
                      <span className={`text-[11px] font-semibold ${parseFloat(kwDensity) > 3 ? 'text-danger' : parseFloat(kwDensity) >= 0.5 ? 'text-success' : 'text-warning'}`}>
                        {kwDensity}%
                      </span>
                      <span className="text-[10px] text-text-muted">(target: 0.5%–3%)</span>
                    </div>
                  </div>
                )}
                {kw.length === 0 && (
                  <p className="text-[11px] text-text-muted">Enter a focus keyword above to see SEO analysis checks.</p>
                )}
              </>
            )}

            {/* ── SERP PREVIEW ── */}
            {key === 'serp' && (
              <SerpPreview title={data.seoTitle} description={data.seoDescription} slug={data.slug} />
            )}

            {/* ── URL + CANONICAL ── */}
            {key === 'url' && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">URL Slug</label>
                  <div className="flex items-center gap-2 bg-bg border border-border rounded-xl overflow-hidden px-3">
                    <span className="text-[11px] text-text-muted py-2.5 whitespace-nowrap">avoro.in/</span>
                    <input value={data.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="page-slug" className="flex-1 bg-transparent py-2.5 text-[12px] text-text focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Canonical URL</label>
                  <input value={data.canonical} onChange={(e) => set({ canonical: e.target.value })} placeholder="https://avoro.in/page-slug" className={ic} />
                </div>
                <Toggle value={data.autoRedirect301} onToggle={() => set({ autoRedirect301: !data.autoRedirect301 })} label="Auto 301 redirect when slug is changed" />
              </>
            )}

            {/* ── OG / SOCIAL ── */}
            {key === 'social' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">OG Title</label>
                    <input value={data.ogTitle || data.seoTitle} onChange={(e) => set({ ogTitle: e.target.value })} placeholder="Auto-filled from SEO title" className={ic} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">OG Type</label>
                    <select value={data.ogType} onChange={(e) => set({ ogType: e.target.value })} className={ic}>
                      <option value="website">website</option>
                      <option value="product">product</option>
                      <option value="article">article</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">OG Description</label>
                  <textarea value={data.ogDescription || data.seoDescription} onChange={(e) => set({ ogDescription: e.target.value })} rows={2} placeholder="Auto-filled from meta description" className={`${ic} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">OG Image URL <span className="normal-case font-normal text-text-muted">(1200×630)</span></label>
                    <input value={data.ogImage} onChange={(e) => set({ ogImage: e.target.value })} placeholder="https://..." className={ic} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Twitter Card</label>
                    <select value={data.twitterCard} onChange={(e) => set({ twitterCard: e.target.value })} className={ic}>
                      <option value="summary_large_image">summary_large_image</option>
                      <option value="summary">summary</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Social Preview</p>
                  <SocialPreview
                    ogTitle={data.ogTitle || data.seoTitle}
                    ogDescription={data.ogDescription || data.seoDescription}
                    ogImage={data.ogImage}
                    twitterCard={data.twitterCard}
                  />
                </div>
              </>
            )}

            {/* ── SCHEMA ── */}
            {key === 'schema' && (
              <SchemaBuilder
                schemaType={data.schemaType}
                onSchemaTypeChange={(t) => set({ schemaType: t })}
                productData={productData}
                articleData={articleData}
              />
            )}

            {/* ── ROBOTS ── */}
            {key === 'robots' && (
              <>
                <div className="space-y-1">
                  <Toggle value={!data.noIndex} onToggle={() => set({ noIndex: !data.noIndex })} label="Allow search engine indexing (index)" />
                  <Toggle value={!data.noFollow} onToggle={() => set({ noFollow: !data.noFollow })} label="Allow link following (follow)" />
                </div>
                <div className="bg-bg rounded-xl px-4 py-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Combined value: </span>
                  <code className="text-[12px] font-mono text-text ml-2">{data.noIndex ? 'noindex' : 'index'}, {data.noFollow ? 'nofollow' : 'follow'}</code>
                </div>
                {data.noIndex && (
                  <div className="flex items-start gap-2 text-[11px] text-danger bg-danger/5 border border-danger/20 rounded-xl px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Warning: This page is set to Noindex. Search engines will not index this page.
                  </div>
                )}
              </>
            )}

            {/* ── PAGE SPEED ── */}
            {key === 'speed' && (
              <div className="space-y-1">
                <Toggle value={data.lazyLoadImages} onToggle={() => set({ lazyLoadImages: !data.lazyLoadImages })} label="Lazy Load Images" />
                <Toggle value={data.deferJs} onToggle={() => set({ deferJs: !data.deferJs })} label="Defer JavaScript" />
                <Toggle value={data.preloadHeroImage} onToggle={() => set({ preloadHeroImage: !data.preloadHeroImage })} label="Preload Hero / LCP Image" />
                <Toggle value={data.inlineCriticalCss} onToggle={() => set({ inlineCriticalCss: !data.inlineCriticalCss })} label="Inline Critical CSS" />
                <Toggle value={data.minifyHtml} onToggle={() => set({ minifyHtml: !data.minifyHtml })} label="Minify HTML" />
                <Toggle value={data.enableCaching} onToggle={() => set({ enableCaching: !data.enableCaching })} label="Enable Browser Caching" />
              </div>
            )}

            {/* ── HEADINGS ── */}
            {key === 'headings' && <HeadingTree content={content} />}

            {/* ── INTERNAL LINKS ── */}
            {key === 'links' && (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${internalLinks === 0 ? 'bg-warning/5 border border-warning/20' : 'bg-success/5 border border-success/20'}`}>
                  {internalLinks === 0
                    ? <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                    : <CheckCircle className="w-3.5 h-3.5 text-success" />}
                  <span className={`text-[12px] font-medium ${internalLinks === 0 ? 'text-warning' : 'text-success'}`}>
                    {internalLinks} internal link{internalLinks !== 1 ? 's' : ''} detected
                    {internalLinks === 0 ? ' — add at least one internal link.' : ''}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Search Internal Pages</label>
                  <input value={linkSearch} onChange={(e) => setLinkSearch(e.target.value)} placeholder="Search pages to link..." className={ic} />
                </div>
                {linkSearch.length >= 2 && (
                  <div className="text-[11px] text-text-muted bg-bg rounded-xl px-3 py-2">
                    Type a page path (e.g. /collection) and copy the URL to insert as an internal link in your content.
                  </div>
                )}
              </div>
            )}

            {/* ── IMAGE ALT TEXT ── */}
            {key === 'alttext' && (
              <div className="space-y-3">
                {images.length === 0 ? (
                  <p className="text-[12px] text-text-muted">No images added yet. Alt text fields will appear here when images are uploaded.</p>
                ) : (
                  images.map((img, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <img src={img.url} alt="" className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <input
                          value={img.alt}
                          onChange={(e) => {
                            if (!onImagesChange) return;
                            const updated = images.map((im, j) => j === i ? { ...im, alt: e.target.value } : im);
                            onImagesChange(updated);
                          }}
                          placeholder="Describe this image..."
                          className={ic}
                        />
                        <div className="flex items-center gap-2 mt-1">
                          {img.alt.trim().length === 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-warning">
                              <AlertTriangle className="w-3 h-3" /> Missing alt text
                            </span>
                          )}
                          {img.url.match(/IMG\d+/i) && (
                            <span className="flex items-center gap-1 text-[10px] text-warning">
                              <AlertTriangle className="w-3 h-3" /> Generic filename
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── CODE INJECTION ── */}
            {key === 'code' && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-[11px] text-warning bg-warning/5 border border-warning/20 rounded-xl px-3 py-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Developer warning: Incorrect code can break page rendering. Use with caution.
                </div>
                {[
                  { label: 'Custom Head Code', key: 'headCode' as const, placeholder: '<!-- Injected into <head> tag -->' },
                  { label: 'Body Start Code', key: 'bodyStartCode' as const, placeholder: '<!-- Injected after <body> tag -->' },
                  { label: 'Body End Code', key: 'bodyEndCode' as const, placeholder: '<!-- Injected before </body> tag -->' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">{field.label}</label>
                    <textarea
                      value={data[field.key]}
                      onChange={(e) => set({ [field.key]: e.target.value })}
                      rows={3}
                      placeholder={field.placeholder}
                      className="w-full bg-[#1e1e1e] text-[#d4d4d4] rounded-xl px-3 py-2.5 text-[11px] font-mono resize-none focus:outline-none focus:ring-1 focus:ring-gold/20 transition"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1 mb-3">
        <Globe className="w-4 h-4 text-gold-dark" />
        <h2 className="text-[15px] font-semibold text-text">SEO Settings</h2>
      </div>
      {sections.map((s) => renderSection(s.key))}
    </div>
  );
}
