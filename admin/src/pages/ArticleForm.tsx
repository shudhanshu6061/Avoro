import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Wand2,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Plus,
  List,
  ListOrdered,
  Quote,
  Minus,
  Strikethrough,
  Code,
  Undo,
  Redo,
  Clock,
  BookOpen,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Upload,
  Loader2,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import SeoPanel, { defaultSeoData } from '@/components/seo/SeoPanel';
import type { SeoFormData } from '@/components/seo/SeoPanel';
import SeoScore from '@/components/seo/SeoScore';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function ArticleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    featuredImage: '',
    categoryId: '',
    status: 'DRAFT',
    scheduledAt: '',
  });
  const [seo, setSeo] = useState<SeoFormData>(defaultSeoData());

  // Upload States
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const [editorImageUploading, setEditorImageUploading] = useState(false);
  const [imageModalMode, setImageModalMode] = useState<'upload' | 'url'>('upload');

  // Link & Image Modals
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Quick Category Modal
  const [quickCategoryModalOpen, setQuickCategoryModalOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');

  // File Input References
  const featuredFileInputRef = useRef<HTMLInputElement>(null);
  const editorFileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ImageExt.configure({ inline: false, allowBase64: true }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder: 'Write your story or blog post content here...' }),
    ],
    content: '',
    editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[350px] p-5 text-text' } },
  });

  const { data: existing } = useQuery({
    queryKey: ['admin-article', id],
    queryFn: () => api.get(`/admin/articles/${id}`).then((r) => r.data),
    enabled: !!isEdit,
  });

  const { data: categories } = useQuery({
    queryKey: ['article-categories'],
    queryFn: () => api.get('/admin/articles/categories').then((r) => r.data),
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        slug: existing.slug || '',
        excerpt: existing.excerpt || '',
        featuredImage: existing.featuredImage || '',
        categoryId: existing.categoryId || '',
        status: existing.status || 'DRAFT',
        scheduledAt: existing.scheduledAt
          ? new Date(existing.scheduledAt).toISOString().slice(0, 16)
          : '',
      });
      const seoObj = typeof existing.seo === 'object' && existing.seo ? existing.seo : {};
      setSeo({
        ...defaultSeoData(),
        ...seoObj,
        seoTitle: seoObj.seoTitle || seoObj.title || existing.seoTitle || '',
        seoDescription: seoObj.seoDescription || seoObj.description || existing.seoDescription || '',
        focusKeyword: seoObj.focusKeyword || seoObj.keyword || existing.seoKeyword || '',
        ogImage: seoObj.ogImage || existing.ogImage || '',
        slug: seoObj.slug || existing.slug || '',
      });
      editor?.commands.setContent(existing.body || '');
    }
  }, [existing, editor]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? api.put(`/admin/articles/${id}`, data) : api.post('/admin/articles', data),
    onSuccess: () => {
      toast.success(isEdit ? 'Article updated successfully' : 'Article created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      navigate('/articles');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save article'),
  });

  const quickCatMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => api.post('/admin/articles/categories', data),
    onSuccess: (res: any) => {
      toast.success('Category created');
      queryClient.invalidateQueries({ queryKey: ['article-categories'] });
      setForm((f) => ({ ...f, categoryId: res.data.id }));
      setQuickCategoryModalOpen(false);
      setQuickCatName('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create category'),
  });

  // Direct Image Upload Handler
  const uploadImageFile = async (file: File): Promise<string | null> => {
    if (!file) return null;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return null;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return null;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.url || null;
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast.error(err.response?.data?.message || 'Image upload failed');
      return null;
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeaturedUploading(true);
    const toastId = toast.loading('Uploading featured image...');
    const url = await uploadImageFile(file);
    setFeaturedUploading(false);

    if (url) {
      setForm((f) => ({ ...f, featuredImage: url }));
      toast.success('Featured image uploaded!', { id: toastId });
    } else {
      toast.dismiss(toastId);
    }
    if (e.target) e.target.value = '';
  };

  const handleEditorImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditorImageUploading(true);
    const toastId = toast.loading('Uploading image...');
    const url = await uploadImageFile(file);
    setEditorImageUploading(false);

    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
      toast.success('Image inserted!', { id: toastId });
      setImageModalOpen(false);
    } else {
      toast.dismiss(toastId);
    }
    if (e.target) e.target.value = '';
  };

  const handleAutoSlug = () => {
    if (!form.title.trim()) {
      toast.error('Please enter a title first');
      return;
    }
    setForm((f) => ({ ...f, slug: slugify(f.title) }));
    toast.success('Slug generated');
  };

  const handleQuickCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;
    quickCatMutation.mutate({ name: quickCatName.trim(), slug: slugify(quickCatName) });
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
    setLinkUrl('');
    setLinkModalOpen(false);
  };

  const handleInsertImageFromUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    editor?.chain().focus().setImage({ src: imageUrlInput.trim() }).run();
    setImageUrlInput('');
    setImageModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Article title is required');
      return;
    }
    const htmlBody = editor?.getHTML() || '';
    mutation.mutate({
      ...form,
      body: htmlBody,
      seo: {
        ...seo,
        seoTitle: seo.seoTitle,
        seoDescription: seo.seoDescription,
        focusKeyword: seo.focusKeyword,
      },
      seoTitle: seo.seoTitle || null,
      seoDescription: seo.seoDescription || null,
      seoKeyword: seo.focusKeyword || null,
      ogImage: seo.ogImage || null,
    });
  };

  // Word count & read time calculation
  const editorText = editor?.getText() || '';
  const wordCount = useMemo(() => {
    return editorText.trim() ? editorText.trim().split(/\s+/).length : 0;
  }, [editorText]);

  const readTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const inputClass =
    'w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition';

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="p-2 hover:bg-white rounded-xl text-text-muted hover:text-text border border-transparent hover:border-border transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">
              {isEdit ? 'Edit Article' : 'New Article'}
            </h1>
            <p className="text-[13px] text-text-muted mt-0.5">
              {isEdit ? 'Update your journal post content & settings' : 'Write and publish a new story or blog post'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {form.slug && (
            <a
              href={`/journal/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-text-mid border border-border hover:bg-bg-hover transition"
            >
              <Eye className="w-4 h-4" /> Preview
            </a>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="bg-gold hover:bg-gold-dark text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold transition disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer"
          >
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Article' : 'Save Article'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Article Info */}
        <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-border/50 bg-[#FAFAF7]">
            <h2 className="text-[14px] font-semibold text-text">Article Details</h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f,
                      title,
                      ...(!isEdit && !f.slug ? { slug: slugify(title) } : {}),
                    }));
                  }}
                  placeholder="Enter article title"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="text-[11px] font-semibold text-gold-dark hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" /> Auto Slug
                  </button>
                </div>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  placeholder="e.g. art-of-perfumery"
                  className={`${inputClass} font-mono`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                Short Excerpt
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                placeholder="A brief summary or teaser for cards and meta descriptions..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Category</label>
                  <button
                    type="button"
                    onClick={() => setQuickCategoryModalOpen(true)}
                    className="text-[11px] font-semibold text-gold-dark hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">None (Uncategorized)</option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputClass}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
              </div>

              {form.status === 'SCHEDULED' && (
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                    Scheduled Publish Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              )}
            </div>

            {/* Direct Featured Image Upload Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Featured Image
              </label>

              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <input
                  type="file"
                  ref={featuredFileInputRef}
                  onChange={handleFeaturedImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={featuredUploading}
                  onClick={() => featuredFileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold/20 text-gold-dark px-4 py-2.5 rounded-xl text-[13px] font-semibold transition border border-gold/30 cursor-pointer disabled:opacity-50"
                >
                  {featuredUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {featuredUploading ? 'Uploading...' : 'Direct Image Upload'}
                </button>

                <input
                  type="text"
                  value={form.featuredImage}
                  onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                  placeholder="Or paste image URL (https://...)"
                  className={`${inputClass} flex-1`}
                />
              </div>
            </div>

            {/* Featured Image Live Preview */}
            {form.featuredImage && (
              <div className="relative rounded-xl border border-border overflow-hidden bg-bg-soft w-full max-h-48 flex items-center justify-center p-2">
                <img
                  src={form.featuredImage}
                  alt="Featured preview"
                  className="max-h-44 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featuredImage: '' })}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Article Body Editor */}
        <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden shadow-xs tiptap-editor">
          <div className="px-6 py-3.5 border-b border-border/50 bg-[#FAFAF7] flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-[14px] font-semibold text-text">Article Content</h2>
            <div className="flex items-center gap-4 text-[12px] text-text-muted font-medium">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-gold" /> {wordCount} words
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gold" /> {readTimeMinutes} min read
              </span>
            </div>
          </div>

          {/* Expanded Tiptap Toolbar with Text Align & Direct Image Upload */}
          <div className="flex items-center gap-1 px-4 py-2.5 border-b border-border/50 bg-white flex-wrap">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg text-[13px] font-bold transition cursor-pointer ${
                editor?.isActive('bold') ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg text-[13px] font-serif italic transition cursor-pointer ${
                editor?.isActive('italic') ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={`p-2 rounded-lg text-[13px] transition cursor-pointer ${
                editor?.isActive('strike') ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleCode().run()}
              className={`p-2 rounded-lg text-[13px] transition cursor-pointer ${
                editor?.isActive('code') ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            {/* Text Alignment Controls */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded-lg transition cursor-pointer ${
                editor?.isActive({ textAlign: 'left' }) ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded-lg transition cursor-pointer ${
                editor?.isActive({ textAlign: 'center' }) ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded-lg transition cursor-pointer ${
                editor?.isActive({ textAlign: 'right' }) ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded-lg transition cursor-pointer ${
                editor?.isActive({ textAlign: 'justify' }) ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Align Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition cursor-pointer ${
                editor?.isActive('heading', { level: 1 }) ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition cursor-pointer ${
                editor?.isActive('heading', { level: 2 }) ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition cursor-pointer ${
                editor?.isActive('heading', { level: 3 }) ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Heading 3"
            >
              H3
            </button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition cursor-pointer ${
                editor?.isActive('bulletList') ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition cursor-pointer ${
                editor?.isActive('orderedList') ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-lg transition cursor-pointer ${
                editor?.isActive('blockquote') ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              className="p-2 rounded-lg text-text-muted hover:bg-bg-soft hover:text-text transition cursor-pointer"
              title="Horizontal Divider"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <button
              type="button"
              onClick={() => setLinkModalOpen(true)}
              className={`p-2 rounded-lg transition cursor-pointer ${
                editor?.isActive('link') ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`}
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setImageModalMode('upload');
                setImageModalOpen(true);
              }}
              className="p-2 rounded-lg text-text-muted hover:bg-bg-soft hover:text-text transition cursor-pointer flex items-center gap-1"
              title="Upload / Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <button
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
              className="p-2 rounded-lg text-text-muted hover:bg-bg-soft hover:text-text disabled:opacity-30 transition cursor-pointer"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
              className="p-2 rounded-lg text-text-muted hover:bg-bg-soft hover:text-text disabled:opacity-30 transition cursor-pointer"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <EditorContent editor={editor} />
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-border/50 bg-[#FAFAF7]">
            <h2 className="text-[14px] font-semibold text-text">SEO Settings</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={seo.seoTitle}
                  onChange={(e) => setSeo({ ...seo, seoTitle: e.target.value })}
                  placeholder="Meta title for Google search..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  value={seo.focusKeyword}
                  onChange={(e) => setSeo({ ...seo, focusKeyword: e.target.value })}
                  placeholder="e.g. perfume guide"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                SEO Meta Description
              </label>
              <textarea
                value={seo.seoDescription}
                onChange={(e) => setSeo({ ...seo, seoDescription: e.target.value })}
                rows={2}
                placeholder="Meta description snippet for search engines..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-xl text-[13px] font-semibold transition disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer"
          >
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Article' : 'Publish Article'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="px-6 py-3 rounded-xl text-[13px] font-semibold text-text-mid border border-border hover:bg-bg-hover transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* SEO Analysis & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        <SeoPanel
          data={seo}
          onChange={setSeo}
          content={editor?.getHTML() || ''}
          pageType="article"
          articleData={{
            title: form.title,
            description: form.excerpt,
            image: form.featuredImage,
          }}
        />
        <SeoScore
          data={{
            seoTitle: seo.seoTitle,
            seoDescription: seo.seoDescription,
            focusKeyword: seo.focusKeyword,
            slug: seo.slug || form.slug,
            content: editor?.getHTML() || '',
            ogTitle: seo.ogTitle,
            ogDescription: seo.ogDescription,
            ogImage: seo.ogImage,
            canonical: seo.canonical,
            noIndex: seo.noIndex,
            schema: seo.schemaType,
            images: [],
            imageAlts: [],
          }}
        />
      </div>

      {/* Quick Category Modal */}
      {quickCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] border border-border max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-base font-semibold text-text">New Category</h3>
              <button
                type="button"
                onClick={() => setQuickCategoryModalOpen(false)}
                className="p-1 text-text-muted hover:text-text rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleQuickCatSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fragrance Trends"
                  value={quickCatName}
                  onChange={(e) => setQuickCatName(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold transition"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-text-mid hover:bg-bg-soft transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickCatMutation.isPending}
                  className="bg-gold hover:bg-gold-dark text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition disabled:opacity-50"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Insert Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] border border-border max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-base font-semibold text-text">Insert Link</h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="p-1 text-text-muted hover:text-text rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInsertLink} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  URL Endpoint
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold transition"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-text-mid hover:bg-bg-soft transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold-dark text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Image Upload / Link Modal for Editor */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] border border-border max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-base font-semibold text-text">Insert / Upload Image</h3>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="p-1 text-text-muted hover:text-text rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-border/60">
              <button
                type="button"
                onClick={() => setImageModalMode('upload')}
                className={`flex-1 py-2 text-[12px] font-semibold border-b-2 -mb-px transition cursor-pointer ${
                  imageModalMode === 'upload'
                    ? 'border-gold text-gold-dark'
                    : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                Direct File Upload
              </button>
              <button
                type="button"
                onClick={() => setImageModalMode('url')}
                className={`flex-1 py-2 text-[12px] font-semibold border-b-2 -mb-px transition cursor-pointer ${
                  imageModalMode === 'url'
                    ? 'border-gold text-gold-dark'
                    : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                Paste Image URL
              </button>
            </div>

            {imageModalMode === 'upload' ? (
              <div className="space-y-4 pt-2">
                <input
                  type="file"
                  ref={editorFileInputRef}
                  onChange={handleEditorImageFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onClick={() => editorFileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-gold/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-bg-soft/50 hover:bg-gold/5 transition group text-center"
                >
                  {editorImageUploading ? (
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-text-muted group-hover:text-gold transition" />
                  )}
                  <p className="text-[13px] font-semibold text-text">
                    {editorImageUploading ? 'Uploading Image...' : 'Click to select image file'}
                  </p>
                  <p className="text-[11px] text-text-muted">Supports JPG, PNG, WEBP, GIF (Max 10MB)</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setImageModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium text-text-mid hover:bg-bg-soft transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInsertImageFromUrl} className="space-y-4 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                    Image Web Address (URL)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold transition"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setImageModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium text-text-mid hover:bg-bg-soft transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gold hover:bg-gold-dark text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition"
                  >
                    Insert Image
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
