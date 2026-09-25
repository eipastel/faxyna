'use client';

import { useCallback, useMemo } from 'react';
import {
  buildExampleTasks, completeTask, postponeTask, relativeDay, skipTask, uncompleteTask, type Task,
} from '@faxyna/core';
import { useGateway } from '@/providers/GatewayProvider';
import { useData } from '@/providers/DataProvider';
import { useToast } from '@/providers/ToastProvider';

/**
 * Every task write goes through here: saves to the gateway and shows the
 * toast with "Desfazer" (which applies the inverse operation).
 */
export function useTaskActions() {
  const gateway = useGateway();
  const { tasks, today, people, rooms } = useData();
  const { showToast } = useToast();

  const run = useCallback(
    async (write: Promise<void>, message?: string, undo?: () => Promise<void>) => {
      try {
        await write;
        if (message) showToast(message, { undo: undo && (() => void run(undo())) });
      } catch {
        showToast('Não foi possível salvar. Tente de novo.', { error: true });
      }
    },
    [showToast],
  );

  return useMemo(() => {
    const find = (id: string) => tasks.find((t) => t.id === id);
    const restore = (prev: Task) => () => gateway.tasks.save(prev);
    const next = (t: Task) => (t.nextDue ? relativeDay(t.nextDue, today) : '');

    return {
      complete(id: string) {
        const prev = find(id);
        if (!prev?.nextDue) return;
        const t = completeTask(prev, today);
        const onTime = prev.nextDue >= today;
        const msg = (onTime ? 'Feito. ' : 'Feito, mesmo atrasado. ') + (t.nextDue ? 'Próxima ' + next(t) + '.' : 'Tarefa encerrada.');
        return run(gateway.tasks.save(t), msg, restore(prev));
      },

      uncomplete(id: string) {
        const prev = find(id);
        if (!prev) return;
        return run(gateway.tasks.save(uncompleteTask(prev)), 'Tarefa desmarcada.', restore(prev));
      },

      skip(id: string) {
        const prev = find(id);
        if (!prev) return;
        const t = skipTask(prev, today);
        return run(gateway.tasks.save(t), t.nextDue ? 'Pulada. Próxima ' + next(t) + '.' : 'Pulada e encerrada.', restore(prev));
      },

      postpone(id: string, days: number) {
        const prev = find(id);
        if (!prev?.nextDue) return;
        const t = postponeTask(prev, days, today);
        return run(gateway.tasks.save(t), 'Adiada para ' + next(t) + '.', restore(prev));
      },

      create(task: Task) {
        const msg = 'Tarefa criada. Primeira vez ' + next(task) + '.';
        return run(gateway.tasks.save(task), msg, () => gateway.tasks.remove(task.id));
      },

      update(task: Task) {
        const prev = find(task.id);
        return run(gateway.tasks.save(task), 'Tarefa atualizada.', prev && restore(prev));
      },

      remove(id: string) {
        const prev = find(id);
        if (!prev) return;
        return run(gateway.tasks.remove(id), 'Tarefa excluída.', restore(prev));
      },

      loadExamples() {
        return run(gateway.tasks.saveMany(buildExampleTasks(today, people, rooms)));
      },
    };
  }, [gateway, tasks, today, people, rooms, run]);
}
