'use client';

import { useEffect } from 'react';
import { useToast } from '@/providers/ToastProvider';

const CURRENT = process.env.NEXT_PUBLIC_APP_VERSION;
const EVERY_MS = 60_000;
const RELOADED_FOR = 'faxyna-reloaded-for';

/** Reload at most once per new version: if a stale cache still serves the old bundle, a
 * second reload would loop forever, so from then on only the button is offered. */
function reloadedFor(version: string, mark = false): boolean {
  try {
    if (mark) sessionStorage.setItem(RELOADED_FOR, version);
    return sessionStorage.getItem(RELOADED_FOR) === version;
  } catch {
    return true; // no storage: never auto-reload, just offer
  }
}

/**
 * Installed PWAs resume from the background on the old bundle, so check for a new deploy
 * whenever the app comes back, reconnects, and every minute while visible. With nothing open
 * it reloads right away; mid-edit it offers "Atualizar" instead so no typing is lost.
 */
export function UpdateWatcher() {
  const { showToast } = useToast();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    let offered = false;

    const check = async () => {
      if (document.visibilityState !== 'visible') return void (offered = false); // offer again next time
      let version: string | undefined;
      try {
        version = (await (await fetch('/version.json', { cache: 'no-store' })).json()).version;
      } catch {
        return; // offline: try again later
      }
      if (!version || version === CURRENT) return;
      // ponytail: an open dialog or focused field means the user is mid-edit.
      const busy = document.querySelector('[role=dialog]') || document.activeElement?.matches('input, textarea');
      if (!busy && !reloadedFor(version)) {
        reloadedFor(version, true);
        return location.reload();
      }
      if (offered) return; // already offered; reloads on a later check once nothing is open
      offered = true;
      showToast('Nova versão disponível.', { action: { label: 'Atualizar', run: () => location.reload() }, sticky: true });
    };

    check();
    const timer = setInterval(check, EVERY_MS);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('online', check);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('online', check);
    };
  }, [showToast]);

  return null;
}
