import type { InputHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import styles from './Input.module.css';

/** Single-line text field (46px, the form height used across the app). */
export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(styles.input, className)} {...rest} />;
}
