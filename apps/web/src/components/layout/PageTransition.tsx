import { ViewTransition, type ReactNode } from 'react';

const slide = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' };

/** Slides the page left or right when a tab link tags the navigation (see `navTypes`). */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={slide} exit={slide} default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
