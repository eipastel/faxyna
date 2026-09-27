'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
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
  const track = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<CSSProperties>();
  const [animate, setAnimate] = useState(false);
  const index = options.findIndex((o) => o.value === value);

  // The selected pill slides between options; options can differ in width, so measure.
  useLayoutEffect(() => {
    const el = track.current?.children[index + 1] as HTMLElement | undefined;
    const measure = () => setThumb(el && { width: el.offsetWidth, transform: `translateX(${el.offsetLeft}px)` });
    measure();
    // Only slide after the first placement, so it doesn't fly in from the left on mount.
    const raf = requestAnimationFrame(() => setAnimate(true));
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [index, options.length]);

  return (
    <div ref={track} role="group" aria-label={label} className={cx(styles.track, styles[size])} style={size === 'md' ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined}>
      <span className={cx(styles.thumb, animate && styles.animate, !thumb && styles.hidden)} style={thumb} aria-hidden />
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
