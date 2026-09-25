import type { IsoDate, Task } from '../domain/types';
import { addDays } from './dates';
import { nextAfter } from './frequency';

/** Recurrence counts from the day the task was completed. */
export function completeTask(task: Task, today: IsoDate): Task {
  const onTime = !!task.nextDue && task.nextDue >= today;
  const next = nextAfter(task.freq, today);
  return {
    ...task,
    nextDue: next,
    archived: !next,
    streak: onTime ? task.streak + 1 : 0,
    history: [{ date: today, type: 'done', personId: task.personId, onTime }, ...task.history],
  };
}

export function skipTask(task: Task, today: IsoDate): Task {
  const base = task.nextDue && task.nextDue > today ? task.nextDue : today;
  const next = task.freq.type === 'interval' ? nextAfter(task.freq, today) : nextAfter(task.freq, base);
  return {
    ...task,
    nextDue: next,
    archived: !next,
    history: [{ date: today, type: 'skip', personId: task.personId }, ...task.history],
  };
}

export function postponeTask(task: Task, days: number, today: IsoDate): Task {
  const from = !task.nextDue || task.nextDue < today ? today : task.nextDue;
  return {
    ...task,
    nextDue: addDays(from, days),
    history: [{ date: today, type: 'postpone', days, personId: task.personId }, ...task.history],
  };
}
