'use client';

import { useEffect } from 'react';

// Inlined so the splash paints with the first HTML byte, before any stylesheet or font.
const css = `
.splash{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:#f5f6f8;transition:opacity .45s cubic-bezier(.22,.61,.36,1),visibility .45s}
html[data-ready] .splash{opacity:0;visibility:hidden;pointer-events:none}
.splash-inner{display:flex;flex-direction:column;align-items:center;gap:28px;animation:splash-in .6s cubic-bezier(.22,.61,.36,1) both}
.splash-logo{width:56px;height:56px;border-radius:16px;box-shadow:0 8px 24px rgba(37,99,235,.18)}
.splash-bar{position:relative;width:96px;height:2px;border-radius:2px;background:#e4e4e7;overflow:hidden}
.splash-bar::after{content:"";position:absolute;inset:0;width:40%;border-radius:2px;background:#2563eb;animation:splash-slide 1.3s cubic-bezier(.65,0,.35,1) infinite}
@keyframes splash-in{from{opacity:0;transform:scale(.96)}}
@keyframes splash-slide{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
@media (prefers-reduced-motion:reduce){.splash-inner,.splash-bar::after{animation:none}}
`;

/** Full-screen loading cover shown until data and fonts are ready. */
export function Splash() {
  return (
    <div className="splash" aria-hidden>
      <style>{css}</style>
      <div className="splash-inner">
        <svg className="splash-logo" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="16" fill="#2563eb" />
          <path
            transform="translate(14 50) scale(.0375)"
            fill="#fff"
            d="M120-40v-280q0-83 58.5-141.5T320-520h40v-320q0-33 23.5-56.5T440-920h80q33 0 56.5 23.5T600-840v320h40q83 0 141.5 58.5T840-320v280H120Zm80-80h80v-120q0-17 11.5-28.5T320-280q17 0 28.5 11.5T360-240v120h80v-120q0-17 11.5-28.5T480-280q17 0 28.5 11.5T520-240v120h80v-120q0-17 11.5-28.5T640-280q17 0 28.5 11.5T680-240v120h80v-200q0-50-35-85t-85-35H320q-50 0-85 35t-35 85v200Zm320-400v-320h-80v320h80Zm0 0h-80 80Z"
          />
        </svg>
        <div className="splash-bar" />
      </div>
    </div>
  );
}

/** Mounted by each first screen: sign-in, house setup, or the app once its data has loaded. */
export function SplashDismiss() {
  useEffect(() => {
    document.fonts.ready.then(() => {
      document.documentElement.dataset.ready = '';
    });
  }, []);
  return null;
}
