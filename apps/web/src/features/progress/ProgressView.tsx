'use client';

import { fmtRange, fmtShort, historyFeed, historyLabel, minutesLabel, topStreaks, weekStats } from '@faxyna/core';
import { PageContent, PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Card, DashedNote, Eyebrow, Icon, Meta, Pill, ProgressBar, SectionHeader } from '@/components/ui';
import { NoTasksState } from '@/features/tasks/NoTasksState';
import { useTaskSheet } from '@/features/tasks/TaskSheetProvider';
import { useData } from '@/providers/DataProvider';
import { useWeekProgress } from './useWeekProgress';
import styles from './ProgressView.module.css';

export function ProgressView() {
  const { tasks, people, room, person } = useData();
  const { openDetail } = useTaskSheet();
  const week = useWeekProgress();
  const streaks = topStreaks(tasks);
  const history = historyFeed(tasks);

  return (
    <>
      <PageHeader title="Progresso" subtitle="Como a casa está indo nesta semana." />
      {!tasks.length ? (
        <NoTasksState />
      ) : (
        <PageContent>
          <Card className={styles.summary}>
            <div className={styles.summaryHead}>
              <Eyebrow>Esta semana</Eyebrow>
              <Meta>{fmtRange(week.start, week.end)}</Meta>
            </div>
            <div className={styles.summaryValue}>
              <span className={styles.bigPct}>{week.percent}%</span>
              <span className={styles.summarySub}>{week.summary}</span>
            </div>
            <ProgressBar value={week.percent} height={8} />
          </Card>

          <div className={styles.people}>
            {people.map((p) => {
              const s = weekStats(tasks, week.start, p.id);
              return (
                <div key={p.id} className={styles.personCard}>
                  <div className={styles.personHead}>
                    <Avatar name={p.name} size="md" />
                    <span className={styles.personName}>{p.name}</span>
                  </div>
                  <dl className={styles.stats}>
                    <Stat label="Feitas" value={s.done} />
                    <Stat label="Pendentes" value={s.pending} />
                    <Stat label="Tempo" value={minutesLabel(s.minutes)} />
                  </dl>
                </div>
              );
            })}
          </div>

          <section className={styles.section}>
            <SectionHeader title="Sequências no prazo" />
            {streaks.length ? (
              <Card list>
                {streaks.map((t) => (
                  <button key={t.id} type="button" className={styles.streakRow} onClick={() => openDetail(t.id)}>
                    <Icon name="local_fire_department" size={20} filled color="var(--amber)" />
                    <span className={styles.rowText}>
                      <span className={styles.rowName}>{t.name}</span>
                      <Meta>{room(t.roomId)?.name}</Meta>
                    </span>
                    <span className={styles.streakCount}>{t.streak + (t.streak === 1 ? ' vez' : ' seguidas')}</span>
                  </button>
                ))}
              </Card>
            ) : (
              <DashedNote>Conclua tarefas dentro do prazo para começar uma sequência.</DashedNote>
            )}
          </section>

          <section className={styles.section}>
            <SectionHeader title="Histórico" />
            {history.length ? (
              <Card list plain>
                {history.map(({ task, entry }, i) => {
                  const s = historyLabel(entry);
                  return (
                    <div key={task.id + i} className={styles.historyRow}>
                      <span className={styles.historyDate}>{fmtShort(entry.date)}</span>
                      <span className={styles.rowText}>
                        <span className={styles.historyName}>{task.name}</span>
                        <Meta>{person(entry.personId)?.name ?? 'Sem responsável'}</Meta>
                      </span>
                      <Pill tone={s.tone}>{s.label}</Pill>
                    </div>
                  );
                })}
              </Card>
            ) : (
              <DashedNote>Nada registrado ainda.</DashedNote>
            )}
          </section>
        </PageContent>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
