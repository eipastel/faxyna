'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Sheet.module.css';

/** Matches the exit animation (--dur) in Sheet.module.css. */
const EXIT_MS = 240;

interface SheetProps {
  open: boolean;
  onClose(): void;
  label: string;
  children: ReactNode;
}

/** Bottom sheet on mobile (drag down to close); centered modal from 900px up. */
export function Sheet({ open, onClose, label, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  // A ref so a parent re-render mid-drag doesn't reset the gesture.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Stay mounted while the exit animation plays, showing the last content.
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);
  const closing = shown && !open;
  const lastChildren = useRef(children);
  if (open) lastChildren.current = children;

  // A timer rather than animationend: animations don't run in background tabs,
  // and a sheet stuck mounted would keep the page scroll locked.
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => setShown(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [closing]);

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

  // The page behind shouldn't scroll while the sheet is up.
  useEffect(() => {
    if (!shown) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    return () => void (root.style.overflow = '');
  }, [shown]);

  // iOS keeps the layout viewport full height when the keyboard opens, so a
  // bottom-pinned sheet ends up under the keyboard. Track the visible area.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!open || !vv) return;
    const sync = () => {
      panel.current?.style.setProperty('--vv-height', `${vv.height}px`);
      panel.current?.style.setProperty('--vv-bottom', `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`);
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, [open]);

  // Drag down to dismiss (mobile). Touch events because the gesture has to win
  // over native scrolling, which needs a non-passive touchmove. Areas that scroll
  // on their own (textarea, [data-no-sheet-drag]) never start it.
  useEffect(() => {
    const el = panel.current;
    if (!open || !el) return;
    // Reopened during the exit of a dragged close: start from the resting position.
    el.style.removeProperty('--drag');
    overlay.current?.style.removeProperty('opacity');
    let startX = 0;
    let startY = 0;
    let startT = 0;
    let dy = 0;
    let tracking = false;
    let dragging = false;
    const set = (v: number) => {
      el.style.setProperty('--drag', v + 'px');
      if (overlay.current) overlay.current.style.opacity = String(1 - v / el.offsetHeight);
    };
    const onStart = (e: TouchEvent) => {
      const target = e.target as Element;
      tracking = el.scrollTop <= 0 && !target.closest('textarea, [data-no-sheet-drag]') && !matchMedia('(min-width: 900px)').matches;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startT = e.timeStamp;
      dy = 0;
    };
    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      dy = e.touches[0].clientY - startY;
      if (!dragging) {
        if (dy < 0) tracking = false;
        if (!tracking || dy < 6) return;
        if (Math.abs(e.touches[0].clientX - startX) > dy) return void (tracking = false); // sideways scroll
        dragging = true;
        el.dataset.dragging = '';
      }
      e.preventDefault();
      set(Math.max(0, dy));
    };
    const onEnd = (e: TouchEvent) => {
      if (!dragging) return;
      dragging = tracking = false;
      delete el.dataset.dragging;
      const flick = dy > 40 && dy / (e.timeStamp - startT) > 0.6; // px/ms
      if (dy > el.offsetHeight * 0.25 || flick) onCloseRef.current();
      else set(0);
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [open]);

  if (!shown) return null;
  return (
    <>
      <div ref={overlay} className={cx(styles.overlay, closing && styles.closing)} onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cx(styles.panel, closing && styles.closing)}
      >
        <div className={styles.handle} />
        {open ? children : lastChildren.current}
      </div>
    </>
  );
}
