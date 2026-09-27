'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/cx';
import { tabIndex } from '@/lib/navigation';
import styles from './PageTransition.module.css';

// ponytail: module state is enough, there is one app shell per page load.
let lastTab = -1;

/**
 * The new page slides in from the side of the tab it came from. A plain CSS entrance
 * rather than the View Transitions API: WebKit (every iPhone browser) doesn't apply the
 * directional classes and shows both pages stacked during the swap.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const tab = tabIndex(usePathname());
  const [dir] = useState(() => (lastTab < 0 || lastTab === tab ? undefined : tab > lastTab ? 'forward' : 'back'));
  useEffect(() => {
    lastTab = tab;
  }, [tab]);

  return <div className={cx(dir && styles.enter, dir && styles[dir])}>{children}</div>;
}
