'use client';

import type { ReactNode } from 'react';
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
