'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import styles from './SplitPageLayout.module.css';

const FULL_WIDTH_ROUTES = ['/', '/collection', '/about', '/contact', '/journal'];
const CENTERED_ROUTES = ['/order/confirmation'];

export default function PageContentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullWidth = FULL_WIDTH_ROUTES.includes(pathname) || pathname.startsWith('/product/');
  const centered = CENTERED_ROUTES.includes(pathname);
  
  const isWide =
    pathname === '/checkout' ||
    pathname === '/account' ||
    pathname === '/collection/discovery-set';

  if (isFullWidth) {
    return (
      <main className="mainHome">
        {children}
      </main>
    );
  }

  return (
    <main className="mainSplit">
      <div className={styles.cosmosSlot} aria-hidden />
      <div
        className={`${styles.contentPanel} ${
          !centered ? styles.contentPanelTop : ''
        }`}
      >
        <div
          className={`${styles.contentInner} ${
            isWide ? styles.contentInnerWide : ''
          }`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
