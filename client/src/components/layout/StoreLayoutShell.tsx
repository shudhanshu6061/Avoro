'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import InstagramSection from '@/components/home/InstagramSection';
import CartDrawer from '@/components/ui/CartDrawer';

interface StoreLayoutShellProps {
  children: React.ReactNode;
}

export default function StoreLayoutShell({ children }: StoreLayoutShellProps) {
  const pathname = usePathname();

  // If on the launch page route or root with launch mode active
  const isLaunchPage = pathname === '/launch' || pathname?.startsWith('/launch');
  const isLaunchModeEnabled = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true';
  const isRootPage = pathname === '/';

  // If launch mode is active on root and not previewing the store
  const isStandaloneLaunch = isLaunchPage || (isLaunchModeEnabled && isRootPage);

  if (isStandaloneLaunch) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <InstagramSection />
      <Footer />
      <CartDrawer />
    </>
  );
}
