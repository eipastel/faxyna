'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Sheet.module.css';

interface SheetProps {
  open: boolean;
  onClose(): void;
  label: string;
  children: ReactNode;
}

/** Bottom sheet on mobile; centered modal from 900px up. */
export function Sheet({ open, onClose, label, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);

  // Move focus into the dialog when it opens and give it back when it closes.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!panel.current?.contains(document.activeElement)) panel.current?.focus();
    return () => previous?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className={styles.panel}>
        <div className={styles.handle} />
        {children}
      </div>
    </>
  );
}
