import { AlertTriangle, CheckCircle } from 'lucide-react';

interface HeadingNode {
  level: number;
  text: string;
}

interface HeadingTreeProps {
  content: string; // HTML or plain text content
}

function parseHeadings(html: string): HeadingNode[] {
  const regex = /<h([1-4])[^>]*>(.*?)<\/h\1>/gi;
  const headings: HeadingNode[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({ level: parseInt(match[1]), text: match[2].replace(/<[^>]+>/g, '') });
  }
  return headings;
}

export default function HeadingTree({ content }: HeadingTreeProps) {
  const headings = parseHeadings(content);
  const h1s = headings.filter((h) => h.level === 1);

  const warnings: string[] = [];
  if (h1s.length === 0) warnings.push('Missing H1 tag — every page should have exactly one H1.');
  if (h1s.length > 1) warnings.push(`Multiple H1 tags found (${h1s.length}) — use only one H1 per page.`);

  // Check skipped levels
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    if (curr > prev + 1) {
      warnings.push(`Heading level skipped: H${prev} → H${curr} (missing H${prev + 1}).`);
      break;
    }
  }

  const indentMap: Record<number, string> = { 1: 'pl-0', 2: 'pl-4', 3: 'pl-8', 4: 'pl-12' };
  const colorMap: Record<number, string> = {
    1: 'text-gold-dark font-semibold',
    2: 'text-text font-medium',
    3: 'text-text-mid',
    4: 'text-text-muted',
  };

  if (headings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-text-muted py-2">
        <AlertTriangle className="w-3.5 h-3.5 text-warning" />
        No headings detected in content. Add H1–H4 tags to structure your page.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {warnings.length > 0 && (
        <div className="space-y-1.5">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-warning bg-warning/5 border border-warning/20 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}
      {warnings.length === 0 && (
        <div className="flex items-center gap-2 text-[11px] text-success">
          <CheckCircle className="w-3.5 h-3.5" />
          Heading structure looks good.
        </div>
      )}
      <div className="bg-bg rounded-xl p-3 space-y-1 font-mono">
        {headings.map((h, i) => (
          <div key={i} className={`${indentMap[h.level]} flex items-center gap-2`}>
            <span className="text-[10px] font-bold text-text-muted bg-bg-soft px-1.5 py-0.5 rounded w-7 text-center flex-shrink-0">H{h.level}</span>
            <span className={`text-[12px] truncate ${colorMap[h.level]}`}>{h.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
