import type { Metadata } from 'next';
import PreLaunchLanding from '@/components/launch/PreLaunchLanding';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AVORO | The Wait Is Almost Over | Pre-Launch',
  description: 'AVORO — Haute Parfumerie. Artisanal fragrances crafted with rare essences. Reserve your VIP early access before the official launch.',
  keywords: ['AVORO', 'luxury perfume', 'pre-launch', 'early access', 'artisanal fragrance', 'made in india'],
  openGraph: {
    title: 'AVORO — The Wait Is Almost Over',
    description: 'Artisanal fragrances crafted with rare essences. Reserve your VIP early access.',
    siteName: 'AVORO',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function LaunchPage() {
  return <PreLaunchLanding />;
}
