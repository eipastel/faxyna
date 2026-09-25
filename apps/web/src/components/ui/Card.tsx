import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Children separated by lines (task lists, history…). */
  list?: boolean;
  /** No white background (inherits the page background). */
  plain?: boolean;
}

export function Card({ list, plain, className, ...rest }: CardProps) {
  return <div className={cx(styles.card, list && styles.list, plain && styles.plain, className)} {...rest} />;
}

/** Dashed box for empty states. */
export function DashedNote({ children, roomy }: { children: ReactNode; roomy?: boolean }) {
  return <div className={cx(styles.dashed, roomy && styles.roomy)}>{children}</div>;
}
