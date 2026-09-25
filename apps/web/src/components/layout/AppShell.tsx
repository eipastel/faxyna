'use client';

import { useEffect, type ReactNode } from 'react';
import { TaskSheetProvider } from '@/features/tasks/TaskSheetProvider';
import { DataProvider } from '@/providers/DataProvider';
import { GatewayProvider } from '@/providers/GatewayProvider';
import { PersonFilterProvider } from '@/providers/PersonFilterProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { BottomDock } from './BottomDock';
import { Sidebar } from './Sidebar';
import styles from './AppShell.module.css';

/** Providers + layout (sidebar, main column, fixed footer). */
export function AppShell({ children }: { children: ReactNode }) {
  // Offline cache for the installed app; skipped in dev so it never serves stale code.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
  }, []);

  return (
    <GatewayProvider>
      <DataProvider>
        <ToastProvider>
          <PersonFilterProvider>
            <TaskSheetProvider>
              <div className={styles.shell}>
                <Sidebar />
                <main className={styles.main}>{children}</main>
              </div>
              <BottomDock />
            </TaskSheetProvider>
          </PersonFilterProvider>
        </ToastProvider>
      </DataProvider>
    </GatewayProvider>
  );
}
