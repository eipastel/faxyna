import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';

interface IconProps {
  /** Material Symbols Outlined icon name. */
  name: string;
  size?: number;
  filled?: boolean;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, filled, color, className, style }: IconProps) {
  return (
    <span
      aria-hidden
      className={cx('material-symbols-outlined', className)}
      style={{ fontSize: size, color, fontVariationSettings: filled ? "'FILL' 1" : undefined, ...style }}
    >
      {name}
    </span>
  );
}
