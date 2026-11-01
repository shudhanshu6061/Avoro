import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, Upload, PackagePlus } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import SeoPanel, { defaultSeoData } from '@/components/seo/SeoPanel';
import type { SeoFormData } from '@/components/seo/SeoPanel';
import SeoScore from '@/components/seo/SeoScore';
import ProductPageContentForm from '@/components/product/ProductPageContentForm';
import { emptyPageContent, getPageContentPreset, type ProductPageContent } from '@/lib/productPageContentData';
import PriceTag from '@/components/PriceTag';

interface Variant { size: string; price: number; originalPrice?: number; stock: number; sku: string }

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '', slug: '', description: '', category: '', isFeatured: false, isActive: true,
  });
  const [notes, setNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [variants, setVariants] = useState<Variant[]>([{ size: '50ml', price: 1299, stock: 0, sku: '' }]);
  const [seo, setSeo] = useState<SeoFormData>(defaultSeoData());
  const [imageAlts, setImageAlts] = useState<string[]>([]);
  const [pageContent, setPageContent] = useState<ProductPageContent>(emptyPageContent());

  const { data: existing } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => api.get(`/admin/products/${id}`).then((r) => r.data),
    enabled: !!isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name, slug: existing.slug, description: existing.description,
        category: existing.category, isFeatured: existing.isFeatured, isActive: existing.isActive,
      });
      setNotes(existing.notes || []);
      setImages(existing.images || []);
      setVariants(existing.variants?.length ? existing.variants : [{ size: '50ml', price: 1299, stock: 0, sku: '' }]);
      if (existing.seo) {
        const existingSeo = existing.seo as Record<string, any>;
        setSeo({
          ...defaultSeoData(),
          ...existingSeo,
          seoTitle: existingSeo.seoTitle || existingSeo.title || '',
          seoDescription: existingSeo.seoDescription || existingSeo.description || '',
        });
      }
      if (existing.images) setImageAlts(existing.images.map(() => ''));
      if (existing.pageContent) {
        setPageContent(existing.pageContent);
      } else {
        setPageContent(getPageContentPreset(existing.slug) || emptyPageContent(existing.name));
      }
    }
  }, [existing]);

  useEffect(() => {
    if (!isEdit && form.slug) {
      const preset = getPageContentPreset(form.slug);
      if (preset) setPageContent(preset);
    }
  }, [form.slug, isEdit]);

  useEffect(() => {
    if (form.name) {
      setPageContent((prev) => ({
        ...prev,
        storyHeading: prev.storyHeading || `What Makes ${form.name} Special`,
        howToWearHeading: prev.howToWearHeading || `How to Get the Most Out of ${form.name}`,
        whoIsThisForHeading: prev.whoIsThisForHeading || `Is ${form.name} for You?`,
        ctaSubtext: prev.ctaSubtext || `${form.name}. 50ml Eau de Parfum. ₹${variants[0]?.price?.toLocaleString('en-IN') || '1,299'}.`,
      }));
    }
  }, [form.name, variants]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => isEdit ? api.put(`/admin/products/${id}`, data) : api.post('/admin/products', data),
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      navigate('/products');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageContent.badge.trim() || !pageContent.tagline.trim() || !pageContent.oneLiner.trim()) {
      toast.error('Please fill in storefront hero fields (badge, tagline, one-liner)');
      return;
    }
    mutation.mutate({
      ...form,
      notes,
      images,
      variants,
      seo: {
        ...seo,
        title: seo.seoTitle,
        description: seo.seoDescription,
      },
      pageContent: {
        ...pageContent,
        oneLiner: pageContent.oneLiner || form.description,
      },
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const addNote = () => { if (noteInput.trim()) { setNotes([...notes, noteInput.trim()]); setNoteInput(''); } };
  const addImage = () => { if (imageInput.trim()) { setImages([...images, imageInput.trim()]); setImageInput(''); } };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': undefined } });
      setImages([...images, res.data.url]);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateVariant = (i: number, key: keyof Variant, value: any) => {
    const v = [...variants];
    (v[i] as any)[key] = value;
    setVariants(v);
  };

  const updateDiscountPercent = (i: number, percent: number) => {
    const v = [...variants];
    const orig = v[i].originalPrice;
    if (orig && orig > 0) {
      const discountAmount = (orig * percent) / 100;
      v[i].price = Math.max(0, Math.round(orig - discountAmount));
    }
    setVariants(v);
  };

  const inputClass = 'w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition';

  const loadTemplate = () => {
    const preset = getPageContentPreset(form.slug);
    if (preset) {
      setPageContent(preset);
      toast.success('Loaded template for this slug');
    } else {
      setPageContent(emptyPageContent(form.name));
      toast.success('Loaded blank storefront template');
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="p-2 hover:bg-white rounded-xl text-text-muted hover:text-text border border-transparent hover:border-border transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          <p className="text-[13px] text-text-muted mt-0.5">{isEdit ? 'Update catalogue and storefront page content' : 'Add a fragrance with full detail page content'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50"><h2 className="text-[14px] font-semibold text-text">Basic Information</h2></div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required /></div>
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} required />
                <button type="button" onClick={loadTemplate} className="mt-2 text-[11px] font-semibold text-gold-dark hover:text-gold transition">Load storefront template for slug</button>
              </div>
            </div>
            <div><label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Short Description (API / fallback)</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} required /></div>
              <div className="flex items-end gap-6 pb-1">
                <label className="flex items-center gap-2.5 text-[13px] cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-gold w-4 h-4 rounded" /><span className="font-medium text-text">Featured</span></label>
                <label className="flex items-center gap-2.5 text-[13px] cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-gold w-4 h-4 rounded" /><span className="font-medium text-text">Active</span></label>
              </div>
            </div>
          </div>
        </div>

        <ProductPageContentForm value={pageContent} onChange={setPageContent} productName={form.name} />

        <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50"><h2 className="text-[14px] font-semibold text-text">Scent Notes (tags)</h2></div>
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <input value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="e.g. Bergamot" className={`flex-1 ${inputClass}`}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNote(); } }} />
              <button type="button" onClick={addNote} className="px-4 py-2.5 bg-bg border border-border rounded-xl text-text-muted hover:text-text hover:border-gold/30 transition"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {notes.map((n, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-bg-soft px-3 py-1.5 rounded-lg text-[12px] font-medium text-text-mid">
                  {n} <button type="button" onClick={() => setNotes(notes.filter((_, j) => j !== i))} className="text-text-muted hover:text-rose-500 transition"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50"><h2 className="text-[14px] font-semibold text-text">Images</h2></div>
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Paste image URL..." className={`flex-1 ${inputClass}`}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }} />
              <button type="button" onClick={addImage} className="px-4 py-2.5 bg-bg border border-border rounded-xl text-text-muted hover:text-text hover:border-gold/30 transition"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border rounded-xl text-[13px] text-text-muted hover:text-text hover:border-gold/30 transition disabled:opacity-50">
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload from device'}
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-20 h-20 rounded-xl object-cover border border-border/50" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow-sm"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-text">Variants & Stock</h2>
              {isEdit && (
                <span className="text-[11px] text-text-muted">
                  Total stock: <strong>{variants.reduce((s, v) => s + v.stock, 0)}</strong>
                </span>
              )}
            </div>
          </div>
          <div className="p-6 space-y-4">
            {variants.map((v, i) => {
              const discountPct = (v.originalPrice && v.originalPrice > v.price)
                ? Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100)
                : 0;

              return (
                <div key={i} className="bg-bg rounded-xl p-4 space-y-4 border border-border/40">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Size</label>
                      <input value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} className={inputClass} placeholder="50ml" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Original MRP (₹)</label>
                      <input
                        type="number"
                        value={v.originalPrice ?? ''}
                        onChange={(e) => updateVariant(i, 'originalPrice', e.target.value ? +e.target.value : undefined)}
                        className={inputClass}
                        placeholder="999"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Selling Price (₹)</label>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariant(i, 'price', +e.target.value)}
                        className={inputClass}
                        placeholder="559"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1.5">Discount (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountPct || ''}
                          onChange={(e) => updateDiscountPercent(i, +e.target.value)}
                          className={`${inputClass} pr-7 text-emerald-700 font-semibold`}
                          placeholder="45"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-emerald-600">%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">SKU</label>
                        <input value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className={inputClass} />
                      </div>
                      <button type="button" onClick={() => setVariants(variants.filter((_, j) => j !== i))} className="p-2.5 text-text-muted hover:text-rose-500 transition self-end" disabled={variants.length <= 1}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Live Display Preview */}
                  <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-border/50">
                    <span className="text-[11px] font-semibold text-text-muted">Storefront Display Preview:</span>
                    <PriceTag price={v.price} originalPrice={v.originalPrice} size="sm" showDecimals={true} />
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Current Stock</label>
                      <input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', +e.target.value)} className={inputClass} min={0} />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1.5"><PackagePlus className="w-3 h-3 inline mr-1" />Add Incoming Stock</label>
                      <div className="flex gap-2">
                        <input type="number" min={0} placeholder="Qty to add" id={`add-stock-${i}`} className={inputClass} />
                        <button type="button" onClick={() => {
                          const el = document.getElementById(`add-stock-${i}`) as HTMLInputElement;
                          const qty = parseInt(el?.value || '0');
                          if (qty > 0) { updateVariant(i, 'stock', v.stock + qty); el.value = ''; toast.success(`+${qty} added to ${v.size || 'variant'}`); }
                        }} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-semibold transition whitespace-nowrap">+ Add</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setVariants([...variants, { size: '', price: 0, stock: 0, sku: '' }])}
              className="text-[12px] font-semibold text-gold-dark hover:text-gold transition">+ Add variant</button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
          <SeoPanel
            data={seo}
            onChange={setSeo}
            content={form.description}
            images={images.map((url, i) => ({ url, alt: imageAlts[i] || '' }))}
            onImagesChange={(imgs) => {
              setImages(imgs.map((i) => i.url));
              setImageAlts(imgs.map((i) => i.alt));
            }}
            pageType="product"
            productData={{
              name: form.name,
              description: form.description,
              price: variants[0]?.price || 0,
              sku: variants[0]?.sku || '',
              image: images[0] || '',
              brand: 'Avoro',
            }}
          />
          <SeoScore
            data={{
              seoTitle: seo.seoTitle,
              seoDescription: seo.seoDescription,
              focusKeyword: seo.focusKeyword,
              slug: seo.slug || form.slug,
              content: form.description,
              ogTitle: seo.ogTitle,
              ogDescription: seo.ogDescription,
              ogImage: seo.ogImage,
              canonical: seo.canonical,
              noIndex: seo.noIndex,
              schema: seo.schemaType,
              images,
              imageAlts,
            }}
          />
        </div>

        <div className="flex gap-3 pt-2 sticky bottom-0 bg-bg/90 backdrop-blur py-4 border-t border-border/40 -mx-2 px-2">
          <button type="submit" disabled={mutation.isPending}
            className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-xl text-[13px] font-semibold transition disabled:opacity-50 shadow-sm hover:shadow-md">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/products')}
            className="px-6 py-3 rounded-xl text-[13px] font-semibold text-text-mid border border-border hover:bg-bg-hover transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}