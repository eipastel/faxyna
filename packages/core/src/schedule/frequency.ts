import type { Frequency, IsoDate, Task } from '../domain/types';
import { addDays, nextWeekday } from './dates';

/** First due date of a newly created/changed frequency. */
export function firstDue(freq: Frequency, today: IsoDate): IsoDate | null {
  if (freq.type === 'once') return freq.date;
  if (freq.type === 'interval') {
    let d = freq.start;
    while (d < today) d = addDays(d, freq.every);
    return d;
  }
  return nextWeekday(today, freq.days, true);
}

/** Next date after `from`, following the frequency (null = does not repeat). */
export function nextAfter(freq: Frequency, from: IsoDate): IsoDate | null {
  if (freq.type === 'interval') return addDays(from, freq.every);
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
