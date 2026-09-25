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
    history: [
      { date: today, type: 'done', personId: task.personId, onTime, prevDue: task.nextDue ?? undefined, prevStreak: task.streak },
      ...task.history,
    ],
  };
}

/** The completion `uncompleteTask` can revert: the latest history entry, if it is one. */
export function lastCompletion(task: Task) {
  const last = task.history[0];
  return last?.type === 'done' ? last : undefined;
}

/** Reverts the latest completion, putting the task back where it was. */
export function uncompleteTask(task: Task): Task {
  const last = lastCompletion(task);
  if (!last) return task;
  return {
    ...task,
    nextDue: last.prevDue ?? last.date,
    archived: false,
    streak: last.prevStreak ?? Math.max(0, task.streak - 1),
    history: task.history.slice(1),
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
