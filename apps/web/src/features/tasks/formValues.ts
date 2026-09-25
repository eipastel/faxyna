import {
  dayOfWeek, firstDue, fmtLong, freqLabel, relativeDay, sameFrequency,
  type Frequency, type FrequencyType, type IsoDate, type Priority, type Task,
} from '@faxyna/core';

export interface TaskFormValues {
  name: string;
  freqType: FrequencyType;
  every: number;
  start: IsoDate;
  days: number[];
  date: IsoDate;
  roomId: string;
  personId: string | null;
  minutes: number;
  priority: Priority;
  notes: string;
}

interface Defaults {
  today: IsoDate;
  roomId: string;
  personId: string | null;
}

export function initialValues(task: Task | undefined, d: Defaults): TaskFormValues {
  const f = task?.freq;
  return {
    name: task?.name ?? '',
    freqType: f?.type ?? 'interval',
    every: f?.type === 'interval' ? f.every : 3,
    start: f?.type === 'interval' ? f.start : d.today,
    days: f?.type === 'weekdays' ? f.days : [dayOfWeek(d.today)],
    date: f?.type === 'once' ? f.date : d.today,
    roomId: task?.roomId ?? d.roomId,
    personId: task ? task.personId : d.personId,
    minutes: task?.minutes ?? 15,
    priority: task?.priority ?? 'media',
    notes: task?.notes ?? '',
  };
}

export function buildFrequency(v: TaskFormValues): Frequency {
  if (v.freqType === 'once') return { type: 'once', date: v.date };
  if (v.freqType === 'interval') return { type: 'interval', every: v.every, start: v.start };
  return { type: 'weekdays', days: [...v.days] };
}

/** Blue line below the frequency ("A cada 3 dias · primeira hoje"). */
export function frequencyPreview(v: TaskFormValues, today: IsoDate): string {
  const f = buildFrequency(v);
  if (f.type === 'once') return 'Uma vez · ' + fmtLong(f.date);
  if (f.type === 'weekdays' && !f.days.length) return 'Escolha os dias da semana';
  return freqLabel(f) + ' · primeira ' + relativeDay(firstDue(f, today)!, today);
}

/** Unique id; `crypto.randomUUID` would fail over plain http (e.g. a phone on the LAN). */
export const newTaskId = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function validate(v: TaskFormValues): string | null {
  if (!v.name.trim()) return 'Dê um nome para a tarefa.';
  if (v.freqType === 'weekdays' && !v.days.length) return 'Escolha pelo menos um dia da semana.';
  return null;
}

/** Builds the task to save; recomputes the next date only if the frequency changed. */
export function toTask(v: TaskFormValues, existing: Task | undefined, today: IsoDate, newId: () => string): Task {
  const freq = buildFrequency(v);
  const base = {
    name: v.name.trim(), freq, roomId: v.roomId, personId: v.personId,
    minutes: v.minutes, priority: v.priority, notes: v.notes.trim(),
  };
  if (existing) {
    const nextDue = sameFrequency(existing.freq, freq) ? existing.nextDue : firstDue(freq, today);
    return { ...existing, ...base, nextDue, archived: !nextDue };
  }
  return { id: newId(), ...base, nextDue: firstDue(freq, today), archived: false, streak: 0, history: [] };
}
