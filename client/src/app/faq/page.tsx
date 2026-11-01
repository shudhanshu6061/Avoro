import type { Metadata } from 'next';
import FaqClient from './FaqClient';

import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/faq', {
    title: 'FAQ | AVORO Guide',
    description: 'Know your scent. From application to longevity, sillage to storage – answers to help you get the most out of every spray of AVORO.',
    keywords: ['AVORO FAQ', 'perfume questions', 'fragrance guide', 'shipping returns', 'fragrance care'],
    canonical: 'https://avoro.in/faq',
  });
}

export default function FaqPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <FaqClient />
    </div>
  );
}
