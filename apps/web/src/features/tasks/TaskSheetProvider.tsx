'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Sheet } from '@/components/ui';
import { useData } from '@/providers/DataProvider';
import { TaskDetail } from './TaskDetail';
import { TaskForm } from './TaskForm';

type SheetState =
  | { kind: 'form'; taskId?: string; roomId?: string }
  | { kind: 'detail'; taskId: string }
  | null;

interface TaskSheetApi {
  openNew(roomId?: string): void;
  openEdit(taskId: string): void;
  openDetail(taskId: string): void;
  close(): void;
}

const TaskSheetContext = createContext<TaskSheetApi | null>(null);

/** Controls the create/edit sheet and the details sheet (one at a time). */
export function TaskSheetProvider({ children }: { children: ReactNode }) {
  const { tasks } = useData();
  const [sheet, setSheet] = useState<SheetState>(null);

  const close = useCallback(() => setSheet(null), []);
  const api = useMemo<TaskSheetApi>(
    () => ({
      openNew: (roomId) => setSheet({ kind: 'form', roomId }),
      openEdit: (taskId) => setSheet({ kind: 'form', taskId }),
      openDetail: (taskId) => setSheet({ kind: 'detail', taskId }),
      close,
    }),
    [close],
  );

  const detailTask = sheet?.kind === 'detail' ? tasks.find((t) => t.id === sheet.taskId) : undefined;
  const editTask = sheet?.kind === 'form' && sheet.taskId ? tasks.find((t) => t.id === sheet.taskId) : undefined;
  const open = sheet?.kind === 'form' || !!detailTask;

  return (
    <TaskSheetContext.Provider value={api}>
      {children}
      <Sheet open={open} onClose={close} label={sheet?.kind === 'form' ? 'Tarefa' : 'Detalhes da tarefa'}>
        {sheet?.kind === 'form' && <TaskForm key={sheet.taskId ?? 'new'} task={editTask} roomId={sheet.roomId} />}
        {detailTask && <TaskDetail task={detailTask} />}
      </Sheet>
    </TaskSheetContext.Provider>
  );
}

export function useTaskSheet(): TaskSheetApi {
  const api = useContext(TaskSheetContext);
  if (!api) throw new Error('useTaskSheet precisa estar dentro de <TaskSheetProvider>');
  return api;
}
