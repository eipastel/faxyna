import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import styles from './Chip.module.css';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  /** `pill` = rounded; `box` = 9px corners. */
  shape?: 'pill' | 'box';
  /** `soft` = light blue when selected; `solid` = solid blue. */
  tone?: 'soft' | 'solid';
}

/** Selectable option used in forms (size set by the caller via `className`). */
export function Chip({ selected, shape = 'pill', tone = 'soft', className, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(styles.chip, styles[shape], selected && styles[tone], className)}
      {...rest}
    />
  );
}
