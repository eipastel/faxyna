'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Eyebrow, Icon, ProgressBar } from '@/components/ui';
import { useTaskSheet } from '@/features/tasks/TaskSheetProvider';
import { useWeekProgress } from '@/features/progress/useWeekProgress';
import { cx } from '@/lib/cx';
import { isActive, NAV_ITEMS } from '@/lib/navigation';
import { useData } from '@/providers/DataProvider';
import styles from './Sidebar.module.css';

/** Fixed sidebar (900px and up only). */
export function Sidebar() {
  const pathname = usePathname();
  const { tasks, people } = useData();
  const { openNew } = useTaskSheet();
  const week = useWeekProgress();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <Icon name="cleaning_services" size={21} color="#ffffff" />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Faxyna</span>
          <span className={styles.brandSub}>{people.map((p) => p.name).join(' & ')}</span>
        </div>
      </div>

      <Button variant="primary" size="lg" icon="add" iconSize={20} onClick={() => openNew()}>
        Nova tarefa
      </Button>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} className={cx(styles.navItem, active && styles.active)} aria-current={active ? 'page' : undefined}>
              <Icon name={item.icon} size={21} filled={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {tasks.length > 0 && (
        <div className={styles.week}>
          <div className={styles.weekHead}>
            <Eyebrow>Semana</Eyebrow>
            <span className={styles.weekPct}>{week.percent}%</span>
          </div>
          <ProgressBar value={week.percent} color="green" />
          <span className={styles.weekSub}>{week.summary}</span>
        </div>
      )}
    </aside>
  );
}
