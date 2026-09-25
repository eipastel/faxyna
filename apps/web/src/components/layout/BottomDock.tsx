'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, Toast } from '@/components/ui';
import { useTaskSheet } from '@/features/tasks/TaskSheetProvider';
import { cx } from '@/lib/cx';
import { isActive, NAV_ITEMS } from '@/lib/navigation';
import { useToast } from '@/providers/ToastProvider';
import styles from './BottomDock.module.css';

/** Fixed footer area: toast (always) + "Nova tarefa" button and tabs (mobile only). */
export function BottomDock() {
  const pathname = usePathname();
  const { toast, dismiss } = useToast();
  const { openNew } = useTaskSheet();
  const undo = toast?.undo;

  return (
    <div className={styles.dock}>
      {toast && (
        <Toast
          message={toast.message}
          error={toast.error}
          onUndo={undo && (() => { undo(); dismiss(); })}
        />
      )}

      <div className={styles.mobileOnly}>
        <div className={styles.fabRow}>
          <button type="button" className={styles.fab} onClick={() => openNew()}>
            <Icon name="add" size={22} />
            Nova tarefa
          </button>
        </div>
        <nav className={styles.tabs}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} className={cx(styles.tab, active && styles.active)} aria-current={active ? 'page' : undefined}>
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
