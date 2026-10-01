import type { IsoDate, Task } from '../domain/types';
import { addDays } from './dates';
import { nextAfter } from './frequency';

/** Whether the schedule, walked on from `from`, has an occurrence exactly on `day`. */
function fallsOn(freq: Task['freq'], from: IsoDate, day: IsoDate): boolean {
  let d = nextAfter(freq, from);
  while (d && d < day) d = nextAfter(freq, d);
  return d === day;
}

/**
 * Recurrence counts from the day the task was completed, but always moves past
 * the occurrence being completed (early completions would otherwise land on it again).
 * A late completion closes the missed occurrences only: if one is also due today, it stays due.
 * `doneOn` records a completion made on an earlier day (forgot to mark it); on time if it was the due day.
 */
export function completeTask(task: Task, today: IsoDate, doneOn: IsoDate = today): Task {
  const onTime = !!task.nextDue && task.nextDue >= doneOn;
  let next = nextAfter(task.freq, doneOn);
  if (next && task.nextDue && next <= task.nextDue) next = nextAfter(task.freq, task.nextDue);
  if (next && next > today && task.nextDue && task.nextDue < today && fallsOn(task.freq, task.nextDue, today)) next = today;
  return {
    ...task,
    nextDue: next,
    archived: !next,
    streak: onTime ? task.streak + 1 : 0,
    history: [
      { date: doneOn, type: 'done', personId: task.personId, onTime, prevDue: task.nextDue ?? undefined, prevStreak: task.streak },
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

/**
 * Next due date once the current occurrence is closed without being done.
 * Overdue: closes the missed occurrences only; if one is also due today, it stays due.
 */
function afterClosing(task: Task, today: IsoDate): IsoDate | null {
  if (task.nextDue && task.nextDue < today && fallsOn(task.freq, task.nextDue, today)) return today;
  const base = task.nextDue && task.nextDue > today ? task.nextDue : today;
  return task.freq.type === 'interval' ? nextAfter(task.freq, today) : nextAfter(task.freq, base);
}

/** Not needed this time: the streak is kept. */
export function skipTask(task: Task, today: IsoDate): Task {
  const next = afterClosing(task, today);
  return {
    ...task,
    nextDue: next,
    archived: !next,
    history: [{ date: today, type: 'skip', personId: task.personId }, ...task.history],
  };
}

/** Should have been done and wasn't: breaks the streak; recorded on the day it was due. */
export function missTask(task: Task, today: IsoDate): Task {
  const next = afterClosing(task, today);
  return {
    ...task,
    nextDue: next,
    archived: !next,
    streak: 0,
    history: [{ date: task.nextDue ?? today, type: 'missed', personId: task.personId }, ...task.history],
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
