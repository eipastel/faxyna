import type { IsoDate, Person, Room, Settings, Task } from '../domain/types';
import { addDays, nextWeekday } from '../schedule/dates';

/** Initial data a gateway implementation writes when it is empty. */
export const DEFAULT_ROOMS: Room[] = [
  { id: 'escritorio', name: 'Escritório', icon: 'desk', hue: 250 },
  { id: 'quarto', name: 'Quarto', icon: 'bed', hue: 300 },
  { id: 'sala', name: 'Sala', icon: 'weekend', hue: 70 },
  { id: 'cozinha', name: 'Cozinha', icon: 'kitchen', hue: 25 },
  { id: 'banheiro', name: 'Banheiro', icon: 'bathtub', hue: 205 },
  { id: 'lavanderia', name: 'Lavanderia', icon: 'local_laundry_service', hue: 150 },
];

export const DEFAULT_PEOPLE: Person[] = [
  { id: 'thiago', name: 'Thiago' },
  { id: 'julia', name: 'Julia' },
];

export const DEFAULT_SETTINGS: Settings = { weekStartsMonday: true, showDoneToday: true };

/** Example tasks for the "Ver com exemplos" button (same as the prototype). */
export function buildExampleTasks(today: IsoDate, people: Person[], rooms: Room[]): Task[] {
  const a = (n: number) => addDays(today, n);
  const wd = (days: number[]) => nextWeekday(today, days, true)!;
  const p1 = people[0]?.id ?? null;
  const p2 = people[1]?.id ?? p1;
  const room = (id: string) => (rooms.some((r) => r.id === id) ? id : rooms[0]?.id ?? id);
  const mk = (t: Omit<Task, 'archived' | 'notes'> & { notes?: string }): Task => ({ archived: false, notes: '', ...t, roomId: room(t.roomId) });

  return [
    mk({ id: 'e1', name: 'Varrer e passar pano', roomId: 'sala', personId: p2, minutes: 30, priority: 'media', freq: { type: 'interval', every: 3, start: a(-9) }, nextDue: today, streak: 3,
      history: [-3, -6, -9].map((n) => ({ date: a(n), type: 'done' as const, personId: p2, onTime: true })) }),
    mk({ id: 'e2', name: 'Limpar o fogão', roomId: 'cozinha', personId: p1, minutes: 20, priority: 'media', freq: { type: 'weekdays', days: [3] }, nextDue: wd([3]), streak: 2,
      history: [{ date: addDays(wd([3]), -7), type: 'done', personId: p1, onTime: true }], notes: 'Desengordurante fica embaixo da pia.' }),
    mk({ id: 'e3', name: 'Lavar o banheiro', roomId: 'banheiro', personId: p1, minutes: 40, priority: 'alta', freq: { type: 'interval', every: 7, start: a(-9) }, nextDue: a(-2), streak: 0,
      history: [{ date: a(-9), type: 'done', personId: p1, onTime: true }] }),
    mk({ id: 'e4', name: 'Trocar roupa de cama', roomId: 'quarto', personId: p2, minutes: 15, priority: 'baixa', freq: { type: 'interval', every: 14, start: a(-10) }, nextDue: a(4), streak: 1,
      history: [{ date: a(-10), type: 'done', personId: p2, onTime: true }] }),
    mk({ id: 'e5', name: 'Lavar roupas', roomId: 'lavanderia', personId: p2, minutes: 20, priority: 'media', freq: { type: 'weekdays', days: [1, 4] }, nextDue: wd([1, 4]), streak: 4,
      history: [{ date: a(-2), type: 'done', personId: p2, onTime: true }] }),
    mk({ id: 'e6', name: 'Organizar a mesa', roomId: 'escritorio', personId: p1, minutes: 10, priority: 'baixa', freq: { type: 'interval', every: 7, start: a(-5) }, nextDue: a(2), streak: 1,
      history: [{ date: a(-5), type: 'done', personId: p1, onTime: true }] }),
    mk({ id: 'e7', name: 'Limpar a geladeira', roomId: 'cozinha', personId: null, minutes: 45, priority: 'alta', freq: { type: 'once', date: a(5) }, nextDue: a(5), streak: 0, history: [] }),
    mk({ id: 'e8', name: 'Tirar o lixo', roomId: 'cozinha', personId: p1, minutes: 5, priority: 'media', freq: { type: 'interval', every: 1, start: a(-1) }, nextDue: today, streak: 5,
      history: [{ date: a(-1), type: 'done', personId: p1, onTime: true }, { date: a(-2), type: 'skip', personId: p1 }] }),
  ];
}
