import type { Metadata } from 'next';
import JournalClient from './JournalClient';

import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/journal', {
    title: 'AVORO Journal | Stories, Emotion & Timeless Elegance',
    description: 'Explore stories of fragrance, emotion, memory, and the art of timeless luxury through the world of AVORO.',
    keywords: ['perfume journal', 'fragrance stories', 'scent notes', 'AVORO journal', 'fragrance guide'],
    canonical: 'https://avoro.in/journal',
  });
}

export default function JournalPage() {
  return <JournalClient />;
}
