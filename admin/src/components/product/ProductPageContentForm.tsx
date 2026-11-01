import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProductPageContent, NoteCategory, PerformanceTip, FaqItem } from '@/lib/productPageContentData';

const inputClass =
  'w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition';

function Section({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-4 border-b border-border/50 flex items-center justify-between text-left hover:bg-bg-soft/40 transition"
      >
        <div>
          <h2 className="text-[14px] font-semibold text-text">{title}</h2>
          {description && <p className="text-[11px] text-text-muted mt-0.5">{description}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="p-6 space-y-5">{children}</div>}
    </div>
  );
}

interface Props {
  value: ProductPageContent;
  onChange: (next: ProductPageContent) => void;
  productName: string;
}

export default function ProductPageContentForm({ value, onChange, productName }: Props) {
  const set = <K extends keyof ProductPageContent>(key: K, val: ProductPageContent[K]) => {
    onChange({ ...value, [key]: val });
  };

  const updateListItem = (key: 'storyParagraphs' | 'whoIsThisForList', index: number, text: string) => {
    const list = [...value[key]];
    list[index] = text;
    set(key, list);
  };

  const addListItem = (key: 'storyParagraphs' | 'whoIsThisForList') => {
    set(key, [...value[key], '']);
  };

  const removeListItem = (key: 'storyParagraphs' | 'whoIsThisForList', index: number) => {
    set(key, value[key].filter((_, i) => i !== index));
  };

  const updateNoteCategory = (catIndex: number, patch: Partial<NoteCategory>) => {
    const cats = value.noteCategories.map((c, i) => (i === catIndex ? { ...c, ...patch } : c));
    set('noteCategories', cats);
  };

  // Performance helpers
  const updatePerformanceField = (key: 'longevity' | 'sillage' | 'intensity' | 'concentration', val: string) => {
    const perf = value.performance || {
      longevity: '8 to 10 hours',
      sillage: 'Strong',
      intensity: 'Strong',
      concentration: '18% pure fragrance oils (Eau de Parfum)',
      tips: [],
    };
    set('performance', { ...perf, [key]: val });
  };

  const updatePerformanceTip = (index: number, patch: Partial<PerformanceTip>) => {
    const tips = [...(value.performance?.tips || [])];
    tips[index] = { ...tips[index], ...patch };
    set('performance', {
      ...(value.performance || { longevity: '', sillage: '', intensity: '', concentration: '', tips: [] }),
      tips,
    });
  };

  const addPerformanceTip = () => {
    const tips = [...(value.performance?.tips || []), { title: '', text: '' }];
    set('performance', {
      ...(value.performance || { longevity: '', sillage: '', intensity: '', concentration: '', tips: [] }),
      tips,
    });
  };

  const removePerformanceTip = (index: number) => {
    const tips = (value.performance?.tips || []).filter((_, i) => i !== index);
    set('performance', {
      ...(value.performance || { longevity: '', sillage: '', intensity: '', concentration: '', tips: [] }),
      tips,
    });
  };

  // FAQ helpers
  const updateFaq = (index: number, patch: Partial<FaqItem>) => {
    const faqs = [...(value.faqs || [])];
    faqs[index] = { ...faqs[index], ...patch };
    set('faqs', faqs);
  };

  const addFaq = () => {
    const faqs = [...(value.faqs || []), { q: '', a: '' }];
    set('faqs', faqs);
  };

  const removeFaq = (index: number) => {
    const faqs = (value.faqs || []).filter((_, i) => i !== index);
    set('faqs', faqs);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gold/20 bg-gold-pale/30 px-4 py-3">
        <p className="text-[12px] text-text-mid">
          These fields power the full product detail page on the storefront — hero, story, notes, ingredients, performance, usage, FAQs, comparison, guarantees, and final CTA.
        </p>
      </div>

      <Section title="Storefront Hero" description="Badge, tagline, one-liner, trust line" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Badge</label>
            <input value={value.badge} onChange={(e) => set('badge', e.target.value)} placeholder="No. 01 · Signature Fragrance" className={inputClass} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Tagline</label>
            <input value={value.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Deep. Smoky. Magnetic." className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">One-line Description (hero)</label>
          <textarea value={value.oneLiner} onChange={(e) => set('oneLiner', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Trust Line</label>
          <input value={value.trustLine} onChange={(e) => set('trustLine', e.target.value)} className={inputClass} />
        </div>
      </Section>

      <Section title="Description & Story" description="About this fragrance section">
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Section Heading</label>
          <input value={value.storyHeading} onChange={(e) => set('storyHeading', e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Story Paragraphs</label>
          {value.storyParagraphs.map((p, i) => (
            <div key={i} className="flex gap-2">
              <textarea value={p} onChange={(e) => updateListItem('storyParagraphs', i, e.target.value)} rows={3} className={`flex-1 ${inputClass} resize-none`} />
              <button type="button" onClick={() => removeListItem('storyParagraphs', i)} className="p-2 text-text-muted hover:text-rose-500 self-start"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => addListItem('storyParagraphs')} className="text-[12px] font-semibold text-gold-dark hover:text-gold transition">+ Add paragraph</button>
        </div>
      </Section>

      <Section title="Fragrance Notes" description="Top, heart, and base note breakdown">
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Intro Line</label>
          <textarea value={value.notesIntro} onChange={(e) => set('notesIntro', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
        </div>
        {value.noteCategories.map((cat, catIndex) => (
          <div key={catIndex} className="bg-bg rounded-xl p-4 space-y-3 border border-border/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={cat.label} onChange={(e) => updateNoteCategory(catIndex, { label: e.target.value })} placeholder="Top Notes" className={inputClass} />
              <input value={cat.sublabel} onChange={(e) => updateNoteCategory(catIndex, { sublabel: e.target.value })} placeholder="Duration hint" className={inputClass} />
            </div>
            {cat.notes.map((note, noteIndex) => (
              <div key={noteIndex} className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-2 items-start">
                <input
                  value={note.name}
                  onChange={(e) => {
                    const notes = cat.notes.map((n, i) => (i === noteIndex ? { ...n, name: e.target.value } : n));
                    updateNoteCategory(catIndex, { notes });
                  }}
                  placeholder="Note name"
                  className={inputClass}
                />
                <textarea
                  value={note.description}
                  onChange={(e) => {
                    const notes = cat.notes.map((n, i) => (i === noteIndex ? { ...n, description: e.target.value } : n));
                    updateNoteCategory(catIndex, { notes });
                  }}
                  rows={2}
                  placeholder="Description"
                  className={`${inputClass} resize-none`}
                />
                <button
                  type="button"
                  onClick={() => updateNoteCategory(catIndex, { notes: cat.notes.filter((_, i) => i !== noteIndex) })}
                  className="p-2 text-text-muted hover:text-rose-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateNoteCategory(catIndex, { notes: [...cat.notes, { name: '', description: '' }] })}
              className="text-[12px] font-semibold text-gold-dark"
            >
              + Add note
            </button>
          </div>
        ))}
      </Section>

      <Section title="Ingredients" description="Full ingredients list and formulation notes">
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Ingredients List (INCI format)</label>
          <textarea
            value={value.ingredientsText || ''}
            onChange={(e) => set('ingredientsText', e.target.value)}
            rows={3}
            placeholder="Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene..."
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Formulation & Vegan Safety Note</label>
          <textarea
            value={value.ingredientsNote || ''}
            onChange={(e) => set('ingredientsNote', e.target.value)}
            rows={3}
            placeholder="All AVORO fragrances are formulated using the highest quality..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </Section>

      <Section title="How to Use" description="Application guide and pulse points">
        <input value={value.howToWearHeading} onChange={(e) => set('howToWearHeading', e.target.value)} className={inputClass} />
        {value.howToWearItems.map((item, i) => (
          <div key={i} className="bg-bg rounded-xl p-4 space-y-2 border border-border/40">
            <div className="flex gap-2">
              <input value={item.label} onChange={(e) => {
                const items = value.howToWearItems.map((it, j) => j === i ? { ...it, label: e.target.value } : it);
                set('howToWearItems', items);
              }} placeholder="Label" className={inputClass} />
              <button type="button" onClick={() => set('howToWearItems', value.howToWearItems.filter((_, j) => j !== i))} className="p-2 text-text-muted hover:text-rose-500"><X className="w-4 h-4" /></button>
            </div>
            <textarea value={item.text} onChange={(e) => {
              const items = value.howToWearItems.map((it, j) => j === i ? { ...it, text: e.target.value } : it);
              set('howToWearItems', items);
            }} rows={3} className={`${inputClass} resize-none`} />
          </div>
        ))}
        <button type="button" onClick={() => set('howToWearItems', [...value.howToWearItems, { label: '', text: '' }])} className="text-[12px] font-semibold text-gold-dark">+ Add tip</button>
      </Section>

      <Section title="Longevity & Performance" description="Longevity hours, sillage, intensity, and performance tips">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Longevity</label>
            <input
              value={value.performance?.longevity || ''}
              onChange={(e) => updatePerformanceField('longevity', e.target.value)}
              placeholder="8 to 10 hours"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Projection / Sillage</label>
            <input
              value={value.performance?.sillage || ''}
              onChange={(e) => updatePerformanceField('sillage', e.target.value)}
              placeholder="Strong — noticeable from a distance"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Intensity</label>
            <input
              value={value.performance?.intensity || ''}
              onChange={(e) => updatePerformanceField('intensity', e.target.value)}
              placeholder="Strong"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Concentration</label>
            <input
              value={value.performance?.concentration || ''}
              onChange={(e) => updatePerformanceField('concentration', e.target.value)}
              placeholder="18% pure fragrance oils (Eau de Parfum)"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">How to Maximize Performance (Tips)</label>
          {(value.performance?.tips || []).map((tip, i) => (
            <div key={i} className="bg-bg rounded-xl p-4 space-y-2 border border-border/40">
              <div className="flex gap-2">
                <input
                  value={tip.title}
                  onChange={(e) => updatePerformanceTip(i, { title: e.target.value })}
                  placeholder="Tip Title (e.g. Hydrate Skin)"
                  className={inputClass}
                />
                <button type="button" onClick={() => removePerformanceTip(i)} className="p-2 text-text-muted hover:text-rose-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={tip.text}
                onChange={(e) => updatePerformanceTip(i, { text: e.target.value })}
                rows={2}
                placeholder="Tip details..."
                className={`${inputClass} resize-none`}
              />
            </div>
          ))}
          <button type="button" onClick={addPerformanceTip} className="text-[12px] font-semibold text-gold-dark">
            + Add performance tip
          </button>
        </div>
      </Section>

      <Section title="Product Details / Specifications" description="What's in the bottle specifications table">
        <input value={value.detailsHeading} onChange={(e) => set('detailsHeading', e.target.value)} className={inputClass} />
        {value.details.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2 items-center">
            <input value={row.label} onChange={(e) => {
              const details = value.details.map((d, j) => j === i ? { ...d, label: e.target.value } : d);
              set('details', details);
            }} placeholder="Detail" className={inputClass} />
            <input value={row.value} onChange={(e) => {
              const details = value.details.map((d, j) => j === i ? { ...d, value: e.target.value } : d);
              set('details', details);
            }} placeholder="Info" className={inputClass} />
            <button type="button" onClick={() => set('details', value.details.filter((_, j) => j !== i))} className="p-2 text-text-muted hover:text-rose-500"><X className="w-4 h-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => set('details', [...value.details, { label: '', value: '' }])} className="text-[12px] font-semibold text-gold-dark">+ Add detail row</button>
      </Section>

      <Section title="Frequently Asked Questions (FAQs)" description="Product-specific FAQs">
        <div className="space-y-3">
          {(value.faqs || []).map((faq, i) => (
            <div key={i} className="bg-bg rounded-xl p-4 space-y-2 border border-border/40">
              <div className="flex gap-2">
                <input
                  value={faq.q}
                  onChange={(e) => updateFaq(i, { q: e.target.value })}
                  placeholder="Question (e.g. How should I store my fragrance?)"
                  className={inputClass}
                />
                <button type="button" onClick={() => removeFaq(i)} className="p-2 text-text-muted hover:text-rose-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={faq.a}
                onChange={(e) => updateFaq(i, { a: e.target.value })}
                rows={3}
                placeholder="Answer..."
                className={`${inputClass} resize-none`}
              />
            </div>
          ))}
          <button type="button" onClick={addFaq} className="text-[12px] font-semibold text-gold-dark">
            + Add FAQ
          </button>
        </div>
      </Section>

      <Section title="Who Is This For" description="Target audience section">
        <input value={value.whoIsThisForHeading} onChange={(e) => set('whoIsThisForHeading', e.target.value)} className={inputClass} />
        <textarea value={value.whoIsThisForIntro} onChange={(e) => set('whoIsThisForIntro', e.target.value)} rows={4} className={`${inputClass} resize-none`} />
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Great choice if you...</label>
          {value.whoIsThisForList.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input value={item} onChange={(e) => updateListItem('whoIsThisForList', i, e.target.value)} className={inputClass} />
              <button type="button" onClick={() => removeListItem('whoIsThisForList', i)} className="p-2 text-text-muted hover:text-rose-500"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => addListItem('whoIsThisForList')} className="text-[12px] font-semibold text-gold-dark">+ Add bullet</button>
        </div>
        <textarea value={value.whoIsThisForClosing} onChange={(e) => set('whoIsThisForClosing', e.target.value)} rows={2} placeholder="Not the right fit if..." className={`${inputClass} resize-none`} />
      </Section>

      <Section title="Scent Comparison" description="Compare with other AVORO fragrances">
        {value.comparison.map((row, i) => (
          <div key={i} className="bg-bg rounded-xl p-4 space-y-2 border border-border/40">
            <div className="flex gap-2">
              <input value={row.label} onChange={(e) => {
                const comparison = value.comparison.map((r, j) => j === i ? { ...r, label: e.target.value } : r);
                set('comparison', comparison);
              }} placeholder="Row label (e.g. Vibe)" className={inputClass} />
              <button type="button" onClick={() => set('comparison', value.comparison.filter((_, j) => j !== i))} className="p-2 text-text-muted hover:text-rose-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={row.velvetOud} onChange={(e) => {
                const comparison = value.comparison.map((r, j) => j === i ? { ...r, velvetOud: e.target.value } : r);
                set('comparison', comparison);
              }} placeholder="Velvet Oud" className={inputClass} />
              <input value={row.vanillaEmber} onChange={(e) => {
                const comparison = value.comparison.map((r, j) => j === i ? { ...r, vanillaEmber: e.target.value } : r);
                set('comparison', comparison);
              }} placeholder="Vanilla Ember" className={inputClass} />
              <input value={row.blueAmber} onChange={(e) => {
                const comparison = value.comparison.map((r, j) => j === i ? { ...r, blueAmber: e.target.value } : r);
                set('comparison', comparison);
              }} placeholder="Blue Amber" className={inputClass} />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => set('comparison', [...value.comparison, { label: '', velvetOud: '', vanillaEmber: '', blueAmber: '' }])} className="text-[12px] font-semibold text-gold-dark">+ Add comparison row</button>
      </Section>

      <Section title="Guarantee & Shipping" description="Our Promise section">
        <input value={value.promiseHeading} onChange={(e) => set('promiseHeading', e.target.value)} className={inputClass} />
        {value.promises.map((p, i) => (
          <div key={i} className="bg-bg rounded-xl p-4 space-y-2 border border-border/40">
            <div className="flex gap-2">
              <input value={p.title} onChange={(e) => {
                const promises = value.promises.map((pr, j) => j === i ? { ...pr, title: e.target.value } : pr);
                set('promises', promises);
              }} placeholder="Title" className={inputClass} />
              <button type="button" onClick={() => set('promises', value.promises.filter((_, j) => j !== i))} className="p-2 text-text-muted hover:text-rose-500"><X className="w-4 h-4" /></button>
            </div>
            <textarea value={p.text} onChange={(e) => {
              const promises = value.promises.map((pr, j) => j === i ? { ...pr, text: e.target.value } : pr);
              set('promises', promises);
            }} rows={3} className={`${inputClass} resize-none`} />
          </div>
        ))}
        <button type="button" onClick={() => set('promises', [...value.promises, { title: '', text: '' }])} className="text-[12px] font-semibold text-gold-dark">+ Add promise</button>
      </Section>

      <Section title="Final CTA" description="Bottom call-to-action block" defaultOpen>
        <input value={value.ctaHeading} onChange={(e) => set('ctaHeading', e.target.value)} placeholder="Ready to Make Your Mark?" className={inputClass} />
        <input value={value.ctaSubtext} onChange={(e) => set('ctaSubtext', e.target.value)} placeholder={`${productName || 'Product'}. 50ml Eau de Parfum. ₹1,299.`} className={inputClass} />
        <input value={value.ctaSmallText} onChange={(e) => set('ctaSmallText', e.target.value)} placeholder="Small text below button" className={inputClass} />
      </Section>
    </div>
  );
}