import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type RedirectRule = { from: string; to: string; type: '301' | '302' | '410' };

let cachedRedirects: RedirectRule[] | null = null;
let cacheExpiry = 0;

async function getRedirects(): Promise<RedirectRule[]> {
  const now = Date.now();
  if (cachedRedirects && now < cacheExpiry) return cachedRedirects;

  try {
    const res = await fetch(`${API_BASE}/api/seo/redirects`, { next: { revalidate: 300 } });
    if (!res.ok) return cachedRedirects || [];
    cachedRedirects = await res.json();
    cacheExpiry = now + 5 * 60 * 1000;
    return cachedRedirects || [];
  } catch {
    return cachedRedirects || [];
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const redirects = await getRedirects();
  const match = redirects.find((r) => r.from === pathname);

  if (!match) return NextResponse.next();

  if (match.type === '410') {
    return new NextResponse('Gone', { status: 410 });
  }

  const destination = match.to.startsWith('http')
    ? match.to
    : new URL(match.to, request.url).toString();

  return NextResponse.redirect(destination, match.type === '302' ? 302 : 301);
}

export const config = {
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico).*)'],
};