import { cx } from '@/lib/cx';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  height?: number;
  color?: 'blue' | 'green';
  className?: string;
}

export function ProgressBar({ value, height = 6, color = 'blue', className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx(styles.track, className)}
      style={{ height }}
    >
      <div className={styles.fill} style={{ width: value + '%', background: `var(--${color})` }} />
    </div>
  );
}
