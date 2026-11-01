import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface SerpPreviewProps {
  title: string;
  description: string;
  slug: string;
}

export default function SerpPreview({ title, description, slug }: SerpPreviewProps) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');

  const displayTitle = title || 'Page Title — Avoro';
  const displayDesc = description || 'No meta description provided. Search engines will auto-generate a snippet from page content.';
  const displayUrl = `avoro.in/${slug || 'page-url'}`;

  const truncateTitle = (t: string, max: number) => t.length > max ? t.slice(0, max) + '...' : t;
  const truncateDesc = (d: string, max: number) => d.length > max ? d.slice(0, max) + '...' : d;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {(['desktop', 'mobile'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
              mode === m ? 'bg-gold/15 text-gold-dark' : 'text-text-muted hover:bg-bg-soft hover:text-text'
            }`}
          >
            {m === 'desktop' ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div className={`bg-white border border-border rounded-xl p-4 ${mode === 'mobile' ? 'max-w-[370px]' : 'max-w-full'}`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-1">
          <div className="w-4 h-4 rounded-full bg-bg-soft flex-shrink-0" />
          <span className="text-[11px] text-[#202124] font-medium truncate">avoro.in</span>
          <span className="text-[11px] text-[#5f6368]">›</span>
          <span className="text-[11px] text-[#5f6368] truncate">{slug || 'page'}</span>
        </div>
        <div className="text-[11px] text-[#5f6368] mb-0.5">{displayUrl}</div>
        {/* Title */}
        <a className="text-[#1a0dab] hover:underline cursor-pointer" style={{ fontSize: mode === 'mobile' ? '17px' : '20px', lineHeight: 1.3, display: 'block', fontFamily: 'Arial, sans-serif', fontWeight: 400 }}>
          {truncateTitle(displayTitle, mode === 'mobile' ? 55 : 60)}
        </a>
        {/* Description */}
        <p className="text-[#4d5156] mt-1" style={{ fontSize: '13px', lineHeight: 1.5, fontFamily: 'Arial, sans-serif' }}>
          {truncateDesc(displayDesc, mode === 'mobile' ? 120 : 160)}
        </p>
      </div>

      <div className="flex gap-4 mt-2">
        <span className={`text-[10px] font-medium ${title.length > 60 ? 'text-danger' : title.length >= 50 ? 'text-success' : 'text-warning'}`}>
          Title: {title.length}/60
        </span>
        <span className={`text-[10px] font-medium ${description.length > 160 ? 'text-danger' : description.length >= 120 ? 'text-success' : 'text-warning'}`}>
          Description: {description.length}/160
        </span>
      </div>
    </div>
  );
}
