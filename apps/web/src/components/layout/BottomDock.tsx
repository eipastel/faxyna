'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { Icon, Toast } from '@/components/ui';
import { useTaskSheet } from '@/features/tasks/TaskSheetProvider';
import { cx } from '@/lib/cx';
import { isActive, NAV_ITEMS, navTypes } from '@/lib/navigation';
import { useToast } from '@/providers/ToastProvider';
import styles from './BottomDock.module.css';

/** Fixed footer area: toast (always) + "Nova tarefa" button and tabs (mobile only). */
export function BottomDock() {
  const pathname = usePathname();
  const { toast, dismiss } = useToast();
  const { openNew } = useTaskSheet();
  // Keep the last toast on screen while its exit animation plays.
  const [shownToast, setShownToast] = useState(toast);
  if (toast && toast !== shownToast) setShownToast(toast);
  const current = toast ?? shownToast;
  useEffect(() => {
    if (toast || !shownToast) return;
    const t = setTimeout(() => setShownToast(null), 240); // exit animation (--dur)
    return () => clearTimeout(t);
  }, [toast, shownToast]);
  const undo = current?.undo;
  const tab = NAV_ITEMS.findIndex((item) => isActive(pathname, item.href));

  // The FAB shrinks to its icon while scrolling down and comes back on the way up.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setCompact(y > last && y > 80);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles.dock}>
      {/* Persistent live region: screen readers announce each toast, even one replacing another. */}
      <div role={current?.error ? 'alert' : 'status'} aria-live={current?.error ? 'assertive' : 'polite'}>
        {current && (
          <Toast
            key={current.id}
            message={current.message}
            error={current.error}
            leaving={!toast}
            onDismiss={dismiss}
            onUndo={undo && (() => { undo(); dismiss(); })}
          />
        )}
      </div>

      <div className={styles.mobileOnly}>
        <div className={styles.fabRow}>
          <button type="button" className={cx(styles.fab, compact && styles.compact)} aria-label="Nova tarefa" onClick={() => openNew()}>
            <Icon name="add" size={22} />
            <span className={styles.fabLabel}>Nova tarefa</span>
          </button>
        </div>
        <nav className={styles.tabs}>
          {tab >= 0 && <span className={styles.indicator} style={{ '--tab': tab } as CSSProperties} aria-hidden />}
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} transitionTypes={navTypes(pathname, item.href)} className={cx(styles.tab, active && styles.active)} aria-current={active ? 'page' : undefined}>
                <Icon name={item.icon} size={22} filled={active} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
