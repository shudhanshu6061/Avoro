import type { Metadata } from 'next';

import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/contact', {
    title: 'Contact AVORO | Connect With Our Fragrance House',
    description: 'Connect with AVORO for inquiries, support, collaborations, and the world of timeless luxury fragrances.',
    keywords: ['contact AVORO', 'customer support', 'fragrance concierge', 'avoro perfume support'],
    canonical: 'https://avoro.in/contact',
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
