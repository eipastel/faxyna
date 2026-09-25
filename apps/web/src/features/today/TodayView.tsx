'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { plural, sumMinutes, todayGroups, type Task } from '@faxyna/core';
import { PageContent, PageHeader } from '@/components/layout/PageHeader';
import { Card, Eyebrow, Icon, ProgressBar, SectionHeader } from '@/components/ui';
import { useWeekProgress } from '@/features/progress/useWeekProgress';
import { NoTasksState } from '@/features/tasks/NoTasksState';
import { TaskRow } from '@/features/tasks/TaskRow';
import { useData } from '@/providers/DataProvider';
import { usePersonFilter } from '@/providers/PersonFilterProvider';
import styles from './TodayView.module.css';

interface Group {
  title: string;
  dot: string;
  meta: string;
  tasks: Task[];
  done?: boolean;
}

export function TodayView() {
  const { tasks, today, settings } = useData();
  const [person] = usePersonFilter();
  const week = useWeekProgress();
  const g = useMemo(() => todayGroups(tasks, today, person), [tasks, today, person]);

  const pending = [...g.overdue, ...g.today];
  const subtitle = !tasks.length
    ? 'Tudo pronto para começar.'
    : pending.length
      ? plural(pending.length, 'tarefa', 'tarefas') + ' para hoje · ~' + sumMinutes(pending) + ' min'
      : 'Nada pendente para hoje.';

  const groups: Group[] = [
    { title: 'Atrasadas', dot: 'var(--red)', tasks: g.overdue },
    { title: 'Para hoje', dot: 'var(--blue)', tasks: g.today },
    { title: 'Próximos 7 dias', dot: 'var(--text-4)', tasks: g.soon },
    { title: 'Mais adiante', dot: 'var(--line-strong)', tasks: g.later },
  ]
    .filter((x) => x.tasks.length)
    .map((x) => ({ ...x, meta: plural(x.tasks.length, 'tarefa', 'tarefas') + ' · ' + sumMinutes(x.tasks) + ' min' }));

  if (settings.showDoneToday && g.doneToday.length) {
    groups.push({ title: 'Feitas hoje', dot: 'var(--green)', tasks: g.doneToday, done: true, meta: g.doneToday.length + ' · ' + sumMinutes(g.doneToday) + ' min' });
  }

  return (
    <>
      <PageHeader title="Hoje" subtitle={subtitle} withFilter />
      {!tasks.length ? (
        <NoTasksState />
      ) : (
        <PageContent>
          <Link href="/progresso" className={styles.weekCard}>
            <Eyebrow>Semana</Eyebrow>
            <ProgressBar value={week.percent} className={styles.weekBar} />
            <span className={styles.weekPct}>{week.percent}%</span>
            <Icon name="chevron_right" size={18} color="var(--text-3)" />
          </Link>

          {pending.length === 0 && (
            <div className={styles.allClear}>
              <Icon name="verified" size={22} color="var(--green)" />
              <div className={styles.allClearText}>
                <span className={styles.allClearTitle}>Casa em dia</span>
                <span className={styles.allClearSub}>Nada pendente para hoje. Pode sentar no sofá limpo.</span>
              </div>
            </div>
          )}

          {groups.map((group) => (
            <section key={group.title} className={styles.group}>
              <SectionHeader title={group.title} dot={group.dot} meta={group.meta} />
              <Card list>
                {group.tasks.map((t) => (
                  <TaskRow key={t.id} task={t} done={group.done} />
                ))}
              </Card>
            </section>
          ))}
        </PageContent>
      )}
    </>
  );
}
