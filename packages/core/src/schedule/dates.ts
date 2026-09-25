import type { IsoDate } from '../domain/types';

export const toIso = (d: Date): IsoDate =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

export const parseIso = (s: IsoDate): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayIso = (now = new Date()): IsoDate => toIso(now);

export const addDays = (s: IsoDate, n: number): IsoDate => {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return toIso(d);
};

/** Difference in whole days, `a - b`. */
export const diffDays = (a: IsoDate, b: IsoDate): number =>
  Math.round((parseIso(a).getTime() - parseIso(b).getTime()) / 864e5);

export const dayOfWeek = (s: IsoDate): number => parseIso(s).getDay();

export const weekStartOf = (s: IsoDate, weekStartsMonday: boolean): IsoDate => {
  const offset = weekStartsMonday ? (dayOfWeek(s) + 6) % 7 : dayOfWeek(s);
  return addDays(s, -offset);
};

/** Next day (starting from `from`) that falls on one of the given weekdays. */
export const nextWeekday = (from: IsoDate, days: number[], inclusive: boolean): IsoDate | null => {
  for (let i = inclusive ? 0 : 1; i <= 8; i++) {
    const d = addDays(from, i);
    if (days.includes(dayOfWeek(d))) return d;
  }
  return null;
};
