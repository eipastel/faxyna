import type { ReactNode } from 'react';
import type { Tone } from '@faxyna/core';
import { cx } from '@/lib/cx';
import styles from './Pill.module.css';

/** Status tag (due date, history, alert). */
export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={cx(styles.pill, styles[tone])}>{children}</span>;
}
