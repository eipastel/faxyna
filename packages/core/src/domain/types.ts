/** Date in `YYYY-MM-DD` format, always in the local timezone. */
export type IsoDate = string;

export type Priority = 'alta' | 'media' | 'baixa';

export type Frequency =
  | { type: 'once'; date: IsoDate }
  | { type: 'interval'; every: number; start: IsoDate }
  | { type: 'weekdays'; days: number[] }; // 0 = Sunday … 6 = Saturday

export type FrequencyType = Frequency['type'];

export type HistoryEntry =
  | { date: IsoDate; type: 'done'; personId: string | null; onTime: boolean }
  | { date: IsoDate; type: 'skip'; personId: string | null }
  | { date: IsoDate; type: 'postpone'; days: number; personId: string | null };

export interface Task {
  id: string;
  name: string;
  roomId: string;
  personId: string | null;
  minutes: number;
  priority: Priority;
  notes: string;
  freq: Frequency;
  /** Next due date; `null` once the task has ended. */
  nextDue: IsoDate | null;
  archived: boolean;
  /** Consecutive on-time completions. */
  streak: number;
  /** Most recent first. */
  history: HistoryEntry[];
}

export interface Room {
  id: string;
  name: string;
  /** Material Symbols icon name. */
  icon: string;
  /** OKLCH hue (0–360) used for the room's colors. */
  hue: number;
}

export interface Person {
  id: string;
  name: string;
}

export interface Settings {
  weekStartsMonday: boolean;
  showDoneToday: boolean;
}
