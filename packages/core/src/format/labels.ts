import type { Frequency, HistoryEntry, IsoDate, Priority } from '../domain/types';
import { dayOfWeek, diffDays, parseIso } from '../schedule/dates';

export const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const DOW_FULL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const MONTHS_FULL = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const plural = (n: number, one: string, many: string) => n + ' ' + (n === 1 ? one : many);

export const fmtShort = (s: IsoDate) => {
  const d = parseIso(s);
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
};

export const fmtLong = (s: IsoDate) => {
  const d = parseIso(s);
  return DOW_FULL[d.getDay()] + ', ' + d.getDate() + ' de ' + MONTHS_FULL[d.getMonth()];
};

/** e.g. "sex, 25 set" */
export const fmtEyebrow = (s: IsoDate) => {
  const d = parseIso(s);
  return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
};

/** e.g. "22 set – 28 set" */
export const fmtRange = (a: IsoDate, b: IsoDate) => {
  const x = parseIso(a);
  const y = parseIso(b);
  return x.getDate() + ' ' + MONTHS[x.getMonth()] + ' – ' + y.getDate() + ' ' + MONTHS[y.getMonth()];
};

export function relativeDay(s: IsoDate, today: IsoDate): string {
  const d = diffDays(s, today);
  if (d === 0) return 'hoje';
  if (d === 1) return 'amanhã';
  if (d === -1) return 'ontem';
  if (d > 1 && d < 7) return 'em ' + d + ' dias (' + DOW[dayOfWeek(s)] + ')';
  return fmtShort(s);
}

const mondayFirst = (a: number, b: number) => ((a + 6) % 7) - ((b + 6) % 7);

export function freqLabel(f: Frequency): string {
  if (f.type === 'once') return 'Uma vez';
  if (f.type === 'interval') return f.every === 1 ? 'Todo dia' : 'A cada ' + f.every + ' dias';
  const ds = [...f.days].sort(mondayFirst);
  if (!ds.length) return 'Sem dias';
  if (ds.length === 7) return 'Todo dia';
  if (ds.length === 5 && !ds.includes(0) && !ds.includes(6)) return 'Dias úteis';
  if (ds.length === 2 && ds.includes(0) && ds.includes(6)) return 'Fim de semana';
  if (ds.length === 1) return (ds[0] === 0 || ds[0] === 6 ? 'Todo ' : 'Toda ') + DOW_FULL[ds[0]];
  const n = ds.map((d) => DOW[d]);
  return capitalize(n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1]);
}

/** Visual tones of a "pill"; the front end picks the colors. */
export type Tone = 'neutral' | 'today' | 'overdue' | 'done' | 'late';

export interface StatusLabel {
  label: string;
  tone: Tone;
}

export function dueStatus(due: IsoDate | null | undefined, today: IsoDate, projected = false): StatusLabel {
  if (!due) return { label: 'Encerrada', tone: 'neutral' };
  const d = diffDays(due, today);
  if (d < 0) return projected ? { label: DOW[dayOfWeek(due)], tone: 'neutral' } : { label: 'Atrasada ' + -d + 'd', tone: 'overdue' };
  if (d === 0) return { label: 'Hoje', tone: 'today' };
  if (d === 1) return { label: 'Amanhã', tone: 'neutral' };
  if (d < 7) return { label: capitalize(DOW[dayOfWeek(due)]), tone: 'neutral' };
  return { label: fmtShort(due), tone: 'neutral' };
}

export const DONE_STATUS: StatusLabel = { label: 'Feita', tone: 'done' };

export function historyLabel(h: HistoryEntry): StatusLabel {
  if (h.type === 'done') return h.onTime ? { label: 'No prazo', tone: 'done' } : { label: 'Com atraso', tone: 'late' };
  if (h.type === 'skip') return { label: 'Pulada', tone: 'neutral' };
  return { label: 'Adiada +' + h.days + 'd', tone: 'neutral' };
}

export const PRIORITY_LABEL: Record<Priority, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

export const minutesLabel = (m: number) => m + ' min';
