'use client';

import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import { useSwipe } from '@/lib/useSwipe';
import { Icon } from './Icon';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  action?: { label: string; run(): void };
  error?: boolean;
  /** Plays the exit animation (the parent unmounts it afterwards). */
  leaving?: boolean;
  /** Swiped away sideways. */
  onDismiss?: () => void;
}

export function Toast({ message, action, error, leaving, onDismiss }: ToastProps) {
  const swipe = useSwipe({ dirs: ['left', 'right'], commit: 0.3, onCommit: () => onDismiss?.() });
  const style = { '--x': swipe.x + 'px', opacity: 1 - Math.abs(swipe.x) / 240 } as CSSProperties;

  return (
    <div
      ref={swipe.ref}
      className={cx(styles.toast, swipe.dragging && styles.dragging, leaving && styles.leaving)}
      style={style}
      {...swipe.handlers}
    >
      <Icon name={error ? 'error' : 'check_circle'} size={18} filled color={error ? '#f87171' : '#4ade80'} />
      <span className={styles.message}>{message}</span>
      {action && (
        <button type="button" className={styles.action} onClick={action.run}>
          {action.label}
        </button>
      )}
    </div>
  );
}
