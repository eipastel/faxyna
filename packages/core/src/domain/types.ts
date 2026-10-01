/** Date in `YYYY-MM-DD` format, always in the local timezone. */
export type IsoDate = string;

export type Priority = 'alta' | 'media' | 'baixa';

export type Frequency =
  | { type: 'once'; date: IsoDate }
  /** `weekday`: each date moves to the nearest one of that day (0 = Sunday), e.g. every 30 days on a Sunday. */
  | { type: 'interval'; every: number; start: IsoDate; weekday?: number }
  /** `days`: 0 = Sunday … 6 = Saturday. `start`: nothing is due before it (absent on older tasks). */
  | { type: 'weekdays'; days: number[]; start?: IsoDate };

export type FrequencyType = Frequency['type'];

export type HistoryEntry =
  /** `prevDue`/`prevStreak` let `uncompleteTask` restore the task (absent on older entries). */
  | { date: IsoDate; type: 'done'; personId: string | null; onTime: boolean; prevDue?: IsoDate; prevStreak?: number }
  /** Not needed this time. */
  | { date: IsoDate; type: 'skip'; personId: string | null }
  /** Should have been done and wasn't; `date` is the day it was due. `prevStreak` lets `unmissTask` restore it. */
  | { date: IsoDate; type: 'missed'; personId: string | null; prevStreak?: number }
  | { date: IsoDate; type: 'postpone'; days: number; personId: string | null };

export interface Task {
  id: string;
  name: string;
  /** One or more rooms done together (e.g. an open-plan living room and kitchen). */
  roomIds: string[];
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
