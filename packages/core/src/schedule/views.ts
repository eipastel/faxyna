import type { HistoryEntry, IsoDate, Priority, Task } from '../domain/types';
import { addDays } from './dates';
import { occurrences } from './frequency';

/** `null` = everyone. */
export type PersonFilter = string | null;

const PRIORITY_ORDER: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 };

export const byDueThenPriority = (a: Task, b: Task) =>
  (a.nextDue || '').localeCompare(b.nextDue || '') || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];

export const sumMinutes = (tasks: Task[]) => tasks.reduce((s, t) => s + (t.minutes || 0), 0);

const taskMatches = (t: Task, p: PersonFilter) => p === null || t.personId === p;
const entryMatches = (h: HistoryEntry, p: PersonFilter) => p === null || h.personId === p;

export const activeTasks = (tasks: Task[]) => tasks.filter((t) => !t.archived);

export interface TodayGroups {
  overdue: Task[];
  today: Task[];
  soon: Task[];
  later: Task[];
  doneToday: Task[];
}

export function todayGroups(tasks: Task[], today: IsoDate, person: PersonFilter): TodayGroups {
  const visible = activeTasks(tasks).filter((t) => taskMatches(t, person)).sort(byDueThenPriority);
  const in7 = addDays(today, 7);
  return {
    overdue: visible.filter((t) => t.nextDue! < today),
    today: visible.filter((t) => t.nextDue === today),
    soon: visible.filter((t) => t.nextDue! > today && t.nextDue! <= in7),
    later: visible.filter((t) => t.nextDue! > in7),
    doneToday: tasks.filter((t) => t.history.some((h) => h.date === today && h.type === 'done' && entryMatches(h, person))),
  };
}

export interface AgendaEntry {
  task: Task;
  due?: IsoDate;
  projected: boolean;
  done: boolean;
}

export interface AgendaDay {
  date: IsoDate;
  entries: AgendaEntry[];
}

/** 7 days from `weekStart`: scheduled occurrences, overdue ones (on today) and completions. */
export function weekAgenda(tasks: Task[], weekStart: IsoDate, today: IsoDate, person: PersonFilter): AgendaDay[] {
  const weekEnd = addDays(weekStart, 6);
  const map = new Map<IsoDate, AgendaEntry[]>();
  for (let i = 0; i < 7; i++) map.set(addDays(weekStart, i), []);

  activeTasks(tasks)
    .filter((t) => taskMatches(t, person))
    .forEach((t) => {
      occurrences(t, weekStart, weekEnd).forEach((d) =>
        map.get(d)!.push({ task: t, due: d, projected: d !== t.nextDue, done: false }),
      );
      if (t.nextDue! < weekStart) map.get(today)?.push({ task: t, due: t.nextDue!, projected: false, done: false });
    });

  tasks.forEach((t) =>
    t.history.forEach((h) => {
      if (h.type === 'done' && entryMatches(h, person)) map.get(h.date)?.push({ task: t, projected: false, done: true });
    }),
  );

  return [...map].map(([date, entries]) => ({
    date,
    entries: entries.sort((a, b) => Number(a.done) - Number(b.done)),
  }));
}

export interface WeekStats {
  done: number;
  pending: number;
  minutes: number;
}

export function weekStats(tasks: Task[], weekStart: IsoDate, person: PersonFilter = null): WeekStats {
  const weekEnd = addDays(weekStart, 6);
  const s: WeekStats = { done: 0, pending: 0, minutes: 0 };
  tasks.filter((t) => taskMatches(t, person)).forEach((t) => {
    t.history.forEach((h) => {
      if (h.type === 'done' && h.date >= weekStart && h.date <= weekEnd) {
        s.done++;
        s.minutes += t.minutes || 0;
      }
    });
    if (!t.archived && t.nextDue) {
      s.pending += occurrences(t, weekStart, weekEnd).length;
      if (t.nextDue < weekStart) s.pending++;
    }
  });
  return s;
}

export const weekPercent = ({ done, pending }: WeekStats) =>
  done + pending ? Math.round((done / (done + pending)) * 100) : 0;

export const topStreaks = (tasks: Task[], limit = 5) =>
  activeTasks(tasks).filter((t) => t.streak > 0).sort((a, b) => b.streak - a.streak).slice(0, limit);

export interface HistoryItem {
  task: Task;
  entry: HistoryEntry;
}

export function historyFeed(tasks: Task[], limit = 20): HistoryItem[] {
  const all: HistoryItem[] = [];
  tasks.forEach((task) => task.history.forEach((entry) => all.push({ task, entry })));
  return all.sort((a, b) => b.entry.date.localeCompare(a.entry.date)).slice(0, limit);
}
