'use client';

import { useEffect, type ReactNode } from 'react';
import { InstallCard } from '@/features/install/InstallCard';
import { TaskSheetProvider } from '@/features/tasks/TaskSheetProvider';
import { DataProvider } from '@/providers/DataProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { PersonFilterProvider } from '@/providers/PersonFilterProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { BottomDock } from './BottomDock';
import { SplashDismiss } from './Splash';
import { Sidebar } from './Sidebar';
import styles from './AppShell.module.css';

/** Providers + layout (sidebar, main column, fixed footer). */
export function AppShell({ children }: { children: ReactNode }) {
  // Offline cache for the installed app; skipped in dev so it never serves stale code.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
  }, []);

  return (
    <SessionProvider>
      <DataProvider>
        <ToastProvider>
          <PersonFilterProvider>
            <TaskSheetProvider>
              <SplashDismiss />
              <div className={styles.shell}>
                <Sidebar />
                <main className={styles.main}>{children}</main>
              </div>
              <BottomDock />
              <InstallCard />
            </TaskSheetProvider>
          </PersonFilterProvider>
        </ToastProvider>
      </DataProvider>
    </SessionProvider>
  );
}
