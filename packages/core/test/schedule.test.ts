import { describe, expect, it } from 'vitest';
import {
  addDays, completeTask, dayOfWeek, dueStatus, firstDue, freqLabel, occurrences, postponeTask,
  skipTask, todayGroups, weekAgenda, weekPercent, weekStartOf, weekStats, type Task,
  buildExampleTasks, DEFAULT_PEOPLE, DEFAULT_ROOMS,
} from '../src';

// 2024-01-01 is a Monday.
const MON = '2024-01-01';

const task = (over: Partial<Task> = {}): Task => ({
  id: 't', name: 'Varrer', roomId: 'sala', personId: 'thiago', minutes: 10, priority: 'media', notes: '',
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

  it('occurrences projeta dentro do intervalo', () => {
    expect(occurrences(task(), MON, addDays(MON, 6))).toEqual([MON, '2024-01-04', '2024-01-07']);
    expect(occurrences(task({ freq: { type: 'weekdays', days: [1, 4] } }), MON, addDays(MON, 6))).toEqual([MON, '2024-01-04']);
    expect(occurrences(task({ archived: true }), MON, addDays(MON, 6))).toEqual([]);
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

  it('concluir atrasada zera streak; "uma vez" encerra', () => {
    expect(completeTask(task({ nextDue: '2023-12-30', streak: 4 }), MON).streak).toBe(0);
    const once = completeTask(task({ freq: { type: 'once', date: MON } }), MON);
    expect(once.nextDue).toBeNull();
    expect(once.archived).toBe(true);
  });

  it('pular e adiar', () => {
    expect(skipTask(task({ freq: { type: 'weekdays', days: [1] }, nextDue: '2024-01-08' }), MON).nextDue).toBe('2024-01-15');
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

  it('processa as tarefas de exemplo sem travar', () => {
    const tasks = buildExampleTasks(MON, DEFAULT_PEOPLE, DEFAULT_ROOMS);
    expect(todayGroups(tasks, MON, null).today.length).toBeGreaterThan(0);
    expect(weekAgenda(tasks, MON, MON, null)).toHaveLength(7);
    expect(weekStats(tasks, MON).pending).toBeGreaterThan(0);
  });

  it('dueStatus', () => {
    expect(dueStatus('2023-12-30', MON)).toEqual({ label: 'Atrasada 2d', tone: 'overdue' });
    expect(dueStatus(MON, MON).tone).toBe('today');
    expect(dueStatus(null, MON).label).toBe('Encerrada');
  });
});
