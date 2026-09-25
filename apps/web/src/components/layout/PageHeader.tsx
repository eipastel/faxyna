'use client';

import type { ReactNode } from 'react';
import { fmtEyebrow } from '@faxyna/core';
import { Eyebrow, Segmented } from '@/components/ui';
import { useData } from '@/providers/DataProvider';
import { usePersonFilter } from '@/providers/PersonFilterProvider';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle: ReactNode;
  /** Shows the All / person filter (Today and Week). */
  withFilter?: boolean;
}

/** Sticky header: today's date, tab title, optional filter and subtitle. */
export function PageHeader({ title, subtitle, withFilter }: PageHeaderProps) {
  const { today, people, tasks } = useData();
  const [filter, setFilter] = usePersonFilter();
  const options = [{ value: null as string | null, label: 'Todos' }, ...people.map((p) => ({ value: p.id as string | null, label: p.name }))];

  return (
    <header className={styles.header}>
      <Eyebrow>{fmtEyebrow(today)}</Eyebrow>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {withFilter && tasks.length > 0 && <Segmented label="Filtrar por pessoa" options={options} value={filter} onChange={setFilter} />}
      </div>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  );
}

/** Page content with the default padding. */
export function PageContent({ children, gap = 22 }: { children: ReactNode; gap?: number }) {
  return <div className={styles.content} style={{ gap }}>{children}</div>;
}
