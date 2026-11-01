import { CheckCircle, XCircle } from 'lucide-react';

export interface SeoData {
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  slug: string;
  content: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  noIndex: boolean;
  schema: string;
  images: string[];
  imageAlts: string[];
}

interface Check { label: string; pass: boolean; weight: number }

function computeChecks(d: SeoData): Check[] {
  const kw = d.focusKeyword.toLowerCase().trim();
  const titleLower = d.seoTitle.toLowerCase();
  const descLower = d.seoDescription.toLowerCase();
  const slugLower = d.slug.toLowerCase();
  const contentLower = d.content.toLowerCase().replace(/<[^>]+>/g, '');

  const wordCount = contentLower.split(/\s+/).filter(Boolean).length;
  const internalLinks = (d.content.match(/href=["'][/][^"']/g) || []).length;
  const allImagesHaveAlt = d.images.length === 0 || d.imageAlts.every((a) => a.trim().length > 0);

  return [
    { label: 'SEO title set', pass: d.seoTitle.length >= 10, weight: 10 },
    { label: 'Title length 50–60 chars', pass: d.seoTitle.length >= 50 && d.seoTitle.length <= 60, weight: 8 },
    { label: 'Meta description set', pass: d.seoDescription.length >= 50, weight: 10 },
    { label: 'Meta desc length 120–160 chars', pass: d.seoDescription.length >= 120 && d.seoDescription.length <= 160, weight: 8 },
    { label: 'Focus keyword set', pass: kw.length > 0, weight: 8 },
    { label: 'Keyword in title', pass: kw.length > 0 && titleLower.includes(kw), weight: 8 },
    { label: 'Keyword in meta description', pass: kw.length > 0 && descLower.includes(kw), weight: 6 },
    { label: 'Keyword in URL slug', pass: kw.length > 0 && slugLower.includes(kw.replace(/\s+/g, '-')), weight: 6 },
    { label: 'Word count ≥ 300', pass: wordCount >= 300, weight: 8 },
    { label: 'OG image set', pass: d.ogImage.length > 0, weight: 6 },
    { label: 'Canonical URL set', pass: d.canonical.length > 0, weight: 5 },
    { label: 'Schema markup added', pass: d.schema.length > 0, weight: 7 },
    { label: 'Internal links present', pass: internalLinks > 0, weight: 6 },
    { label: 'All images have alt text', pass: allImagesHaveAlt, weight: 4 },
    { label: 'Page is indexable', pass: !d.noIndex, weight: 4 },
  ];
}

export default function SeoScore({ data }: { data: SeoData }) {
  const checks = computeChecks(data);
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earnedWeight = checks.filter((c) => c.pass).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  const color = score >= 70 ? '#3D8B5D' : score >= 40 ? '#C08A30' : '#B84040';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Needs Improvement' : 'Poor';

  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden sticky top-6">
      <div className="px-5 py-4 border-b border-border/50">
        <h3 className="text-[13px] font-semibold text-text">SEO Score</h3>
      </div>

      <div className="p-5">
        {/* Ring */}
        <div className="flex flex-col items-center mb-5">
          <svg width="100" height="100" className="mb-2">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#F0EBE3" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={radius}
              fill="none" stroke={color} strokeWidth="8"
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <text x="50" y="46" textAnchor="middle" fill={color} fontSize="20" fontWeight="700" fontFamily="Inter, sans-serif">{score}</text>
            <text x="50" y="60" textAnchor="middle" fill="#9C9488" fontSize="9" fontFamily="Inter, sans-serif">/ 100</text>
          </svg>
          <span className="text-[12px] font-semibold" style={{ color }}>{label}</span>
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              {c.pass
                ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-success" />
                : <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-danger/60" />
              }
              <span className={`text-[11px] ${c.pass ? 'text-text-mid' : 'text-text-muted'}`}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
