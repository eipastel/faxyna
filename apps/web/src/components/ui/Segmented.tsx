import { cx } from '@/lib/cx';
import styles from './Segmented.module.css';

export interface SegmentedOption<T> {
  value: T;
  label: string;
}

interface SegmentedProps<T> {
  options: SegmentedOption<T>[];
  value: T;
  onChange(value: T): void;
  /** `sm` = person filter; `md` = frequency type (full width). */
  size?: 'sm' | 'md';
  label?: string;
}

export function Segmented<T>({ options, value, onChange, size = 'sm', label }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className={cx(styles.track, styles[size])} style={size === 'md' ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          className={cx(styles.option, o.value === value && styles.selected)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
