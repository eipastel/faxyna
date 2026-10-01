import { describe, expect, it } from 'vitest';
import {
  addDays, completeTask, dayOfWeek, joinNames, minutesLabel, nearestWeekday, dueStatus, firstDue, freqLabel, occurrences, postponeTask,
  sameFrequency,
  missTask, skipTask, unmissTask, unskipTask, todayGroups, uncompleteTask, weekAgenda, weekPercent, weekStartOf, weekStats, type Task,
} from '../src';

// 2024-01-01 is a Monday.
const MON = '2024-01-01';

const task = (over: Partial<Task> = {}): Task => ({
  id: 't', name: 'Varrer', roomIds: ['sala'], personId: 'thiago', minutes: 10, priority: 'media', notes: '',
  freq: { type: 'interval', every: 3, start: MON }, nextDue: MON, archived: false, streak: 0, history: [], ...over,
});

describe('datas', () => {
  it('calcula início da semana', () => {
    expect(dayOfWeek(MON)).toBe(1);
    expect(weekStartOf('2024-01-07', true)).toBe(MON);
    expect(weekStartOf('2024-01-03', false)).toBe('2023-12-31');
  });
});

describe('frequência', () => {
  it('firstDue avança o intervalo até hoje', () => {
    expect(firstDue({ type: 'interval', every: 3, start: '2023-12-25' }, MON)).toBe('2024-01-03');
    expect(firstDue({ type: 'weekdays', days: [3] }, MON)).toBe('2024-01-03');
    expect(firstDue({ type: 'weekdays', days: [1] }, MON)).toBe(MON);
    expect(firstDue({ type: 'once', date: '2024-02-01' }, MON)).toBe('2024-02-01');
  });

  it('dias da semana respeitam a data de início', () => {
    // Wednesdays starting 2024-01-15: the first is 01-17, not this week's 01-03.
    expect(firstDue({ type: 'weekdays', days: [3], start: '2024-01-15' }, MON)).toBe('2024-01-17');
    expect(firstDue({ type: 'weekdays', days: [3], start: '2023-12-01' }, MON)).toBe('2024-01-03');
    // A start already reached is the same schedule as none (older tasks), in any key order.
    expect(sameFrequency({ type: 'weekdays', days: [3] }, { type: 'weekdays', days: [3], start: MON }, MON)).toBe(true);
    expect(sameFrequency({ days: [3], type: 'weekdays' } as never, { type: 'weekdays', days: [3] }, MON)).toBe(true);
    expect(sameFrequency({ type: 'weekdays', days: [3] }, { type: 'weekdays', days: [3], start: '2024-01-15' }, MON)).toBe(false);
  });

  it('occurrences projeta dentro do intervalo', () => {
    expect(occurrences(task(), MON, addDays(MON, 6))).toEqual([MON, '2024-01-04', '2024-01-07']);
    expect(occurrences(task({ freq: { type: 'weekdays', days: [1, 4] } }), MON, addDays(MON, 6))).toEqual([MON, '2024-01-04']);
    expect(occurrences(task({ archived: true }), MON, addDays(MON, 6))).toEqual([]);
  });

  it('a cada X dias num dia da semana vai para o mais próximo', () => {
    const SUN = '2024-01-07';
    expect([nearestWeekday('2024-02-06', 0), nearestWeekday('2024-02-03', 0), nearestWeekday(SUN, 0)]).toEqual(['2024-02-04', '2024-02-04', SUN]);
    const freq = { type: 'interval' as const, every: 30, start: SUN, weekday: 0 };
    // Done on Sunday: +30 is Tuesday 02-06, the nearest Sunday is 02-04 (two days earlier).
    expect(completeTask(task({ freq, nextDue: SUN }), SUN).nextDue).toBe('2024-02-04');
    // Created on a Tuesday: the first date is the nearest Sunday that isn't in the past.
    expect(firstDue({ ...freq, start: '2024-01-09' }, '2024-01-09')).toBe('2024-01-14');
    expect(freqLabel(freq)).toBe('A cada 30 dias, no domingo');
    expect(freqLabel({ ...freq, weekday: 2 })).toBe('A cada 30 dias, na terça');
  });

  it('freqLabel', () => {
    expect(freqLabel({ type: 'interval', every: 1, start: MON })).toBe('Todo dia');
    expect(freqLabel({ type: 'weekdays', days: [1, 2, 3, 4, 5] })).toBe('Dias úteis');
    expect(freqLabel({ type: 'weekdays', days: [0, 6] })).toBe('Fim de semana');
    expect(freqLabel({ type: 'weekdays', days: [6] })).toBe('Todo sábado');
    expect(freqLabel({ type: 'weekdays', days: [4, 3] })).toBe('Qua e qui');
  });
});

describe('ações', () => {
  it('concluir no prazo conta a partir de hoje e soma streak', () => {
    const t = completeTask(task({ nextDue: '2024-01-02', streak: 2 }), MON);
    expect(t.nextDue).toBe('2024-01-04');
    expect(t.streak).toBe(3);
    expect(t.history[0]).toMatchObject({ type: 'done', onTime: true, date: MON });
  });

  it('concluir antes do prazo avança para depois da ocorrência concluída', () => {
    expect(completeTask(task({ nextDue: '2024-01-04' }), MON).nextDue).toBe('2024-01-07');
    expect(completeTask(task({ freq: { type: 'interval', every: 1, start: MON }, nextDue: '2024-01-02' }), MON).nextDue).toBe('2024-01-03');
    expect(completeTask(task({ freq: { type: 'weekdays', days: [3] }, nextDue: '2024-01-03' }), MON).nextDue).toBe('2024-01-10');
  });

  it('rótulo de tempo', () => {
    expect([30, 60, 90, 125].map(minutesLabel)).toEqual(['30 min', '1h', '1h30', '2h05']);
    expect([[], ['Sala'], ['Sala', 'Cozinha'], ['Sala', 'Cozinha', 'Quarto']].map(joinNames)).toEqual(['', 'Sala', 'Sala e Cozinha', 'Sala, Cozinha e Quarto']);
  });

  it('concluir atrasada zera streak; "uma vez" encerra', () => {
    expect(completeTask(task({ nextDue: '2023-12-30', streak: 4 }), MON).streak).toBe(0);
    // Late completion keeps today's occurrence due; interval off today still counts from today.
    const daily = task({ freq: { type: 'interval', every: 1, start: MON }, nextDue: '2023-12-31' });
    const caught = completeTask(daily, MON);
    expect(caught.nextDue).toBe(MON);
    expect(completeTask(caught, MON)).toMatchObject({ nextDue: '2024-01-02', streak: 1 });
    expect(completeTask(task({ freq: { type: 'weekdays', days: [1, 3] }, nextDue: '2023-12-27' }), MON).nextDue).toBe(MON);
    expect(completeTask(task({ nextDue: '2023-12-30' }), MON).nextDue).toBe('2024-01-04');
  });

  it('concluir num dia anterior (esqueceu de marcar)', () => {
    const daily = task({ freq: { type: 'interval', every: 1, start: MON }, nextDue: '2023-12-31', streak: 2 });
    const onDay = completeTask(daily, MON, '2023-12-31');
    expect(onDay).toMatchObject({ nextDue: MON, streak: 3 });
    expect(onDay.history[0]).toMatchObject({ date: '2023-12-31', onTime: true });
    expect(uncompleteTask(onDay)).toEqual(daily);
    // Later than due but before today: late, and today's occurrence stays due.
    const late = completeTask(task({ freq: { type: 'interval', every: 1, start: MON }, nextDue: '2023-12-30' }), MON, '2023-12-31');
    expect(late).toMatchObject({ nextDue: MON, streak: 0 });
    // Interval counts from the day it was done.
    expect(completeTask(task({ nextDue: '2023-12-30' }), MON, '2023-12-30').nextDue).toBe('2024-01-02');
    const once = completeTask(task({ freq: { type: 'once', date: MON } }), MON);
    expect(once.nextDue).toBeNull();
    expect(once.archived).toBe(true);
  });

  it('desmarcar volta ao estado anterior', () => {
    const before = task({ nextDue: '2024-01-02', streak: 2 });
    expect(uncompleteTask(completeTask(before, MON))).toEqual(before);
    const once = task({ freq: { type: 'once', date: MON } });
    expect(uncompleteTask(completeTask(once, MON))).toEqual(once);
    expect(uncompleteTask(before)).toBe(before);
  });

  it('não feita fecha a ocorrência e zera a sequência', () => {
    const daily = task({ freq: { type: 'weekdays', days: [0, 1, 2, 3, 4, 5, 6] }, nextDue: '2023-12-31', streak: 3 });
    const t = missTask(daily, MON);
    expect(t).toMatchObject({ nextDue: MON, streak: 0 });
    expect(t.history[0]).toEqual({ date: '2023-12-31', type: 'missed', personId: 'thiago', prevStreak: 3 });
    // Undone: due again on that day with the streak back; then done on that day instead.
    expect(unmissTask(t)).toEqual(daily);
    const fixed = completeTask(unmissTask(t), MON, '2023-12-31');
    expect(fixed).toMatchObject({ nextDue: MON, streak: 4 });
    expect(uncompleteTask(fixed)).toEqual(daily);
    expect(unmissTask(daily)).toBe(daily);
    // Shows on the Week view on the day it was due.
    const day = weekAgenda([t], addDays(MON, -1), MON, null)[0];
    expect(day.entries).toContainEqual(expect.objectContaining({ due: '2023-12-31', missed: true, done: false }));
    // Counts against the week it was due.
    expect(weekStats([missTask(task({ nextDue: '2024-01-02' }), '2024-01-03')], MON).pending).toBe(1 + 1); // missed + 01-06
  });

  it('pular e adiar', () => {
    expect(skipTask(task({ freq: { type: 'weekdays', days: [1] }, nextDue: '2024-01-08' }), MON).nextDue).toBe('2024-01-15');
    // Skipping an overdue occurrence keeps today's due (daily task, yesterday missed).
    const daily = task({ freq: { type: 'weekdays', days: [0, 1, 2, 3, 4, 5, 6] }, nextDue: '2023-12-31', streak: 3 });
    const skipped = skipTask(daily, MON);
    expect(skipped).toMatchObject({ nextDue: MON, streak: 3 });
    // Recorded on the day it was due, shown there in the Week view, and can be undone.
    expect(skipped.history[0]).toEqual({ date: '2023-12-31', type: 'skip', personId: 'thiago' });
    expect(weekAgenda([skipped], addDays(MON, -1), MON, null)[0].entries).toContainEqual(expect.objectContaining({ skipped: true }));
    expect(unskipTask(skipped)).toEqual(daily);
    expect(unskipTask(daily)).toBe(daily);
    // Overdue with nothing due today: moves on from today as before.
    expect(skipTask(task({ freq: { type: 'weekdays', days: [3] }, nextDue: '2023-12-27' }), MON).nextDue).toBe('2024-01-03');
    expect(postponeTask(task({ nextDue: '2023-12-28' }), 3, MON).nextDue).toBe('2024-01-04');
    expect(postponeTask(task({ nextDue: '2024-01-05' }), 1, MON).nextDue).toBe('2024-01-06');
  });
});

describe('visões', () => {
  it('agrupa hoje e calcula semana', () => {
    const late = task({ id: 'a', nextDue: '2023-12-30' });
    const now = task({ id: 'b', nextDue: MON, personId: 'julia' });
    const g = todayGroups([late, now], MON, null);
    expect(g.overdue.map((t) => t.id)).toEqual(['a']);
    expect(g.today.map((t) => t.id)).toEqual(['b']);
    expect(todayGroups([late, now], MON, 'julia').overdue).toEqual([]);

    const s = weekStats([late, now], MON);
    // late: overdue (1) + projections 01-02 and 01-05; now: 01-01, 01-04, 01-07
    expect(s.pending).toBe(1 + 2 + 3);
    expect(weekPercent({ done: 1, pending: 3, minutes: 0 })).toBe(25);

    const agenda = weekAgenda([late], MON, MON, null);
    expect(agenda[0].entries).toHaveLength(1); // overdue shows up on today
  });

  it('filtro por pessoa inclui tarefas sem responsável', () => {
    const mine = task({ id: 'a', personId: 'thiago' });
    const other = task({ id: 'b', personId: 'julia' });
    const anyone = task({ id: 'c', personId: null });
    expect(todayGroups([mine, other, anyone], MON, 'thiago').today.map((t) => t.id)).toEqual(['a', 'c']);
  });

  it('dueStatus', () => {
    expect(dueStatus('2023-12-30', MON)).toEqual({ label: 'Atrasada 2d', tone: 'overdue' });
    expect(dueStatus(MON, MON).tone).toBe('today');
    expect(dueStatus(null, MON).label).toBe('Encerrada');
  });
});
