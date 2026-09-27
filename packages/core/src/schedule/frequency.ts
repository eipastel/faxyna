import type { Frequency, IsoDate, Task } from '../domain/types';
import { addDays, nearestWeekday, nextWeekday } from './dates';

type Interval = Extract<Frequency, { type: 'interval' }>;

/** Moves an interval date to its weekday, if it has one, never earlier than `min`. */
function onWeekday(freq: Interval, d: IsoDate, min: IsoDate): IsoDate {
  if (freq.weekday === undefined) return d;
  let s = nearestWeekday(d, freq.weekday);
  while (s < min) s = addDays(s, 7);
  return s;
}

/** First due date of a newly created/changed frequency. */
export function firstDue(freq: Frequency, today: IsoDate): IsoDate | null {
  if (freq.type === 'once') return freq.date;
  if (freq.type === 'interval') {
    let d = freq.start;
    while (d < today) d = addDays(d, freq.every);
    return onWeekday(freq, d, today);
  }
  return nextWeekday(today, freq.days, true);
}

/** Next date after `from`, following the frequency (null = does not repeat). */
export function nextAfter(freq: Frequency, from: IsoDate): IsoDate | null {
  if (freq.type === 'interval') return onWeekday(freq, addDays(from, freq.every), addDays(from, 1));
  if (freq.type === 'weekdays') return nextWeekday(from, freq.days, false);
  return null;
}

/** Due dates of the task within [from, to], projected from `nextDue`. */
export function occurrences(task: Task, from: IsoDate, to: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  if (!task.nextDue || task.archived) return out;
  let d: IsoDate | null = task.nextDue;
  let guard = 0;
  while (d && d <= to && guard++ < 60) {
    if (d >= from) out.push(d);
    d = nextAfter(task.freq, d);
  }
  return out;
}

export const sameFrequency = (a: Frequency, b: Frequency) => JSON.stringify(a) === JSON.stringify(b);
