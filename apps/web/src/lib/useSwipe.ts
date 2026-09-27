'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent, type MouseEvent } from 'react';

export type SwipeDir = 'left' | 'right';

interface SwipeOptions {
  /** Directions the element may be dragged in (`right` = positive offset). */
  dirs: SwipeDir[];
  /** Offset (px) where it rests open showing its action; 0 = no resting state. */
  snap?: number;
  /** Fraction of the width that runs `onCommit` on release. */
  commit?: number;
  onCommit(dir: SwipeDir): void;
}

// ponytail: one open row app-wide (like iOS Mail); a module variable is enough for a single-page app.
let closeOpen: (() => void) | null = null;

/**
 * Horizontal swipe with pointer events: axis lock so vertical scroll keeps working,
 * snap-open, full-swipe commit with a haptic tick. Spread `handlers` on the moving element.
 */
export function useSwipe({ dirs, snap = 0, commit = 0.5, onCommit }: SwipeOptions) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(false);
  /** Container (moving element + its actions); taps inside it don't auto-close. */
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; base: number; axis?: 'x' | 'y' } | null>(null);
  const offset = useRef(0);
  const swallowClick = useRef(false);
  // The release decision reads refs: pointerup can run before the last pointermove re-rendered.
  const armedRef = useRef(false);
  const arm = (v: boolean) => {
    armedRef.current = v;
    setArmed(v);
  };

  const move = (v: number) => {
    offset.current = v;
    setX(v);
  };
  const close = useCallback(() => move(0), []);

  // While open: any tap outside or a scroll closes it.
  useEffect(() => {
    if (!x || dragging) return;
    if (closeOpen !== close) closeOpen?.();
    closeOpen = close;
    const onDown = (e: globalThis.PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('scroll', close, { passive: true });
    return () => {
      if (closeOpen === close) closeOpen = null;
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', close);
    };
  }, [x, dragging, close]);

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button !== 0) return;
      swallowClick.current = false;
      drag.current = { x: e.clientX, y: e.clientY, base: offset.current };
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = drag.current;
      if (!d) return;
      // Mouse released outside before the drag started: no pointerup reached us.
      if (e.pointerType === 'mouse' && !e.buttons) return void (drag.current = null);
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.axis) {
        if (Math.hypot(dx, dy) < 8) return;
        d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (d.axis === 'y') return void (drag.current = null);
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }
      let next = d.base + dx;
      const allowed = dirs.includes(next < 0 ? 'left' : 'right');
      if (!allowed) next /= 6; // rubber band
      const over = allowed && Math.abs(next) > e.currentTarget.offsetWidth * commit;
      if (over !== armedRef.current) {
        arm(over);
        if (over) navigator.vibrate?.(10);
      }
      move(next);
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const d = drag.current;
      drag.current = null;
      if (!d?.axis) {
        // A tap on an open row closes it instead of acting.
        if (d && d.base) {
          swallowClick.current = true;
          close();
        }
        return;
      }
      swallowClick.current = true;
      // Touch drags produce no click; don't eat a later keyboard or screen-reader click.
      setTimeout(() => (swallowClick.current = false));
      setDragging(false);
      const commitNow = armedRef.current;
      arm(false);
      const v = offset.current;
      if (commitNow) {
        move(Math.sign(v) * e.currentTarget.offsetWidth);
        onCommit(v < 0 ? 'left' : 'right');
      } else {
        move(snap && Math.abs(v) > snap / 2 && dirs.includes(v < 0 ? 'left' : 'right') ? Math.sign(v) * snap : 0);
      }
    },
    onPointerCancel() {
      drag.current = null;
      setDragging(false);
      arm(false);
      move(0);
    },
    // A drag ends with a click on whatever is under the finger; don't let it open things.
    onClickCapture(e: MouseEvent) {
      if (!swallowClick.current) return;
      swallowClick.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
  };

  return { ref, x, dragging, armed, close, handlers };
}
