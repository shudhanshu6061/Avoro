import { useState } from 'react';
import { ChevronDown, Eye, ExternalLink } from 'lucide-react';

type SchemaType = 'Product' | 'Article' | 'FAQPage' | 'WebPage' | 'BreadcrumbList';

interface SchemaBuilderProps {
  schemaType: SchemaType;
  onSchemaTypeChange: (t: SchemaType) => void;
  productData?: {
    name: string;
    description: string;
    price: number;
    sku: string;
    image: string;
    brand?: string;
  };
  articleData?: {
    title: string;
    description: string;
    author?: string;
    publishedAt?: string;
    image?: string;
  };
}

interface FaqItem { q: string; a: string }

export default function SchemaBuilder({ schemaType, onSchemaTypeChange, productData, articleData }: SchemaBuilderProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>([{ q: '', a: '' }]);
  const [showJson, setShowJson] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'Home', url: 'https://avoro.in' }, { name: '', url: '' }]);

  const buildJsonLd = (): object => {
    switch (schemaType) {
      case 'Product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: productData?.name || 'Product Name',
          description: productData?.description || '',
          image: productData?.image || '',
          sku: productData?.sku || '',
          brand: { '@type': 'Brand', name: productData?.brand || 'Avoro' },
          offers: {
            '@type': 'Offer',
            price: productData?.price || 0,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Avoro' },
          },
        };
      case 'Article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: articleData?.title || 'Article Headline',
          description: articleData?.description || '',
          image: articleData?.image || '',
          author: { '@type': 'Person', name: articleData?.author || 'Avoro Team' },
          publisher: { '@type': 'Organization', name: 'Avoro', logo: { '@type': 'ImageObject', url: 'https://avoro.in/logo.jpeg' } },
          datePublished: articleData?.publishedAt || new Date().toISOString(),
          dateModified: new Date().toISOString(),
        };
      case 'FAQPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.filter((f) => f.q && f.a).map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        };
      case 'BreadcrumbList':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.filter((b) => b.name).map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: b.name,
            item: b.url,
          })),
        };
      default:
        return { '@context': 'https://schema.org', '@type': 'WebPage', name: productData?.name || articleData?.title || 'Page' };
    }
  };

  const ic = "w-full bg-bg border border-border rounded-xl px-3 py-2 text-[12px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Schema Type</label>
        <div className="relative">
          <select
            value={schemaType}
            onChange={(e) => onSchemaTypeChange(e.target.value as SchemaType)}
            className={`${ic} appearance-none pr-8`}
          >
            <option value="Product">Product</option>
            <option value="Article">Article</option>
            <option value="FAQPage">FAQ Page</option>
            <option value="WebPage">Web Page</option>
            <option value="BreadcrumbList">Breadcrumb</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>
      </div>

      {schemaType === 'FAQPage' && (
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">FAQ Items</label>
          {faqs.map((faq, i) => (
            <div key={i} className="bg-bg rounded-xl p-3 space-y-2">
              <input value={faq.q} onChange={(e) => { const f = [...faqs]; f[i].q = e.target.value; setFaqs(f); }} placeholder={`Question ${i + 1}`} className={ic} />
              <textarea value={faq.a} onChange={(e) => { const f = [...faqs]; f[i].a = e.target.value; setFaqs(f); }} placeholder="Answer..." rows={2} className={`${ic} resize-none`} />
              {faqs.length > 1 && (
                <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="text-[11px] text-danger/70 hover:text-danger transition">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setFaqs([...faqs, { q: '', a: '' }])} className="text-[12px] font-semibold text-gold-dark hover:text-gold transition">
            + Add FAQ Item
          </button>
        </div>
      )}

      {schemaType === 'BreadcrumbList' && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Breadcrumb Items</label>
          {breadcrumbs.map((b, i) => (
            <div key={i} className="flex gap-2">
              <input value={b.name} onChange={(e) => { const bc = [...breadcrumbs]; bc[i].name = e.target.value; setBreadcrumbs(bc); }} placeholder="Name" className={`flex-1 ${ic}`} />
              <input value={b.url} onChange={(e) => { const bc = [...breadcrumbs]; bc[i].url = e.target.value; setBreadcrumbs(bc); }} placeholder="URL" className={`flex-1 ${ic}`} />
              {i > 0 && (
                <button type="button" onClick={() => setBreadcrumbs(breadcrumbs.filter((_, j) => j !== i))} className="text-danger/70 hover:text-danger text-[12px] transition">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setBreadcrumbs([...breadcrumbs, { name: '', url: '' }])} className="text-[12px] font-semibold text-gold-dark hover:text-gold transition">
            + Add Level
          </button>
        </div>
      )}

      {(schemaType === 'Product' || schemaType === 'Article') && (
        <div className="text-[11px] text-text-muted bg-bg-soft rounded-xl px-3 py-2">
          Schema is auto-generated from the product/article data above. Review the JSON-LD preview below.
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setShowJson((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-bg border border-border rounded-xl text-[12px] text-text-mid hover:border-gold/40 hover:text-text transition"
        >
          <Eye className="w-3.5 h-3.5" />
          {showJson ? 'Hide' : 'View'} Generated JSON-LD
        </button>
        <a
          href="https://search.google.com/test/rich-results"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-bg border border-border rounded-xl text-[12px] text-text-mid hover:border-gold/40 hover:text-text transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Validate with Google
        </a>
      </div>

      {showJson && (
        <pre className="bg-[#1e1e1e] text-[#d4d4d4] rounded-xl p-4 text-[11px] overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
          {JSON.stringify(buildJsonLd(), null, 2)}
        </pre>
      )}
    </div>
  );
}
