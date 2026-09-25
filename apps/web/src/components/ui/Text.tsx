import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Text.module.css';

/** Uppercase mono label ("SEMANA", "FREQUÊNCIA"…). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(styles.eyebrow, className)}>{children}</span>;
}

/** Secondary mono text (metadata: "3 tarefas · 45 min"). */
export function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(styles.meta, className)}>{children}</span>;
}

/** 7px colored dot. */
export function Dot({ color }: { color: string }) {
  return <span className={styles.dot} style={{ background: color }} />;
}

interface SectionHeaderProps {
  title: ReactNode;
  meta?: ReactNode;
  dot?: string;
  size?: 'sm' | 'md';
}

/** Section title with an optional dot and right-aligned metadata. */
export function SectionHeader({ title, meta, dot, size = 'sm' }: SectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitle}>
        {dot && <Dot color={dot} />}
        <h3 className={cx(styles.h3, styles[size])}>{title}</h3>
      </div>
      {meta && <Meta>{meta}</Meta>}
    </div>
  );
}
