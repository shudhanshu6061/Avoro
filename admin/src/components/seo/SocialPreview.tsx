import { useState } from 'react';

interface SocialPreviewProps {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
}

export default function SocialPreview({ ogTitle, ogDescription, ogImage, twitterCard }: SocialPreviewProps) {
  const [tab, setTab] = useState<'og' | 'twitter'>('og');

  const title = ogTitle || 'Page Title';
  const desc = ogDescription || 'Page description will appear here when shared on social media.';

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {[
          { id: 'og', label: 'Facebook / WhatsApp' },
          { id: 'twitter', label: 'X / Twitter' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as 'og' | 'twitter')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
              tab === t.id ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'og' ? (
        <div className="border border-border rounded-xl overflow-hidden max-w-[400px] bg-white">
          <div className="bg-bg-soft border-b border-border h-[160px] flex items-center justify-center overflow-hidden">
            {ogImage ? (
              <img src={ogImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-text-muted">
                <div className="w-10 h-10 border-2 border-dashed border-border rounded-lg mx-auto mb-2 flex items-center justify-center text-[18px]">🖼</div>
                <p className="text-[10px]">OG Image (1200×630)</p>
              </div>
            )}
          </div>
          <div className="p-3 bg-[#f2f3f4]">
            <p className="text-[10px] text-[#606770] uppercase mb-0.5">avoro.in</p>
            <p className="text-[13px] font-semibold text-[#1d2129] line-clamp-2">{title}</p>
            <p className="text-[11px] text-[#606770] line-clamp-2 mt-0.5">{desc}</p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden max-w-[400px] bg-white">
          {twitterCard === 'summary' ? (
            <div className="flex gap-3 p-3">
              <div className="w-[120px] h-[120px] bg-bg-soft flex-shrink-0 rounded-lg flex items-center justify-center overflow-hidden border border-border">
                {ogImage ? <img src={ogImage} alt="" className="w-full h-full object-cover" /> : <span className="text-[22px]">🖼</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#0f1419] line-clamp-2">{title}</p>
                <p className="text-[11px] text-[#536471] line-clamp-3 mt-0.5">{desc}</p>
                <div className="flex items-center gap-1 mt-1">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current text-[#536471]"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <p className="text-[10px] text-[#536471]">avoro.in</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-bg-soft h-[180px] flex items-center justify-center overflow-hidden">
                {ogImage ? <img src={ogImage} alt="" className="w-full h-full object-cover" /> : <span className="text-[28px]">🖼</span>}
              </div>
              <div className="p-3">
                <p className="text-[12px] font-semibold text-[#0f1419] line-clamp-2">{title}</p>
                <p className="text-[11px] text-[#536471] line-clamp-2 mt-0.5">{desc}</p>
                <div className="flex items-center gap-1 mt-1">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current text-[#536471]"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <p className="text-[10px] text-[#536471]">avoro.in</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
