'use client';

import { useMemo, useState } from 'react';
import {
  addDays, capitalize, fmtLong, fmtRange, parseIso, DOW, dayOfWeek, sumMinutes, weekAgenda, weekStartOf,
  type AgendaDay, type IsoDate,
} from '@faxyna/core';
import { PageContent, PageHeader } from '@/components/layout/PageHeader';
import { Card, DashedNote, IconButton, SectionHeader } from '@/components/ui';
import { NoTasksState } from '@/features/tasks/NoTasksState';
import { TaskBoardCard } from '@/features/tasks/TaskBoardCard';
import { TaskRow } from '@/features/tasks/TaskRow';
import { cx } from '@/lib/cx';
import { useData } from '@/providers/DataProvider';
import { usePersonFilter } from '@/providers/PersonFilterProvider';
import styles from './WeekView.module.css';

const dayLetter = (d: IsoDate) => DOW[dayOfWeek(d)];
const dayNum = (d: IsoDate) => parseIso(d).getDate();

export function WeekView() {
  const { tasks, today, settings } = useData();
  const [person] = usePersonFilter();
  const [offset, setOffset] = useState(0);
  const [picked, setPicked] = useState<IsoDate | null>(null);

  const start = addDays(weekStartOf(today, settings.weekStartsMonday), offset * 7);
  const end = addDays(start, 6);
  const days = useMemo(() => weekAgenda(tasks, start, today, person), [tasks, start, today, person]);

  const selected = picked && picked >= start && picked <= end ? picked : today >= start && today <= end ? today : start;
  const selectedDay = days.find((d) => d.date === selected)!;
  const goTo = (n: number) => {
    setOffset(n);
    setPicked(null);
  };

  return (
    <>
      <PageHeader title="Semana" subtitle="Toque num dia para ver o que está previsto." withFilter />
      {!tasks.length ? (
        <NoTasksState />
      ) : (
        <PageContent gap={18}>
          <div className={styles.nav}>
            <IconButton bordered icon="chevron_left" iconSize={18} label="Semana anterior" onClick={() => goTo(offset - 1)} />
            <button type="button" className={styles.range} onClick={() => goTo(0)}>{fmtRange(start, end)}</button>
            <IconButton bordered icon="chevron_right" iconSize={18} label="Próxima semana" onClick={() => goTo(offset + 1)} />
          </div>

          <div className={styles.mobile}>
            <WeekStrip days={days} selected={selected} today={today} onSelect={setPicked} />
            <SectionHeader
              size="md"
              title={capitalize(fmtLong(selected))}
              meta={selectedDay.entries.length ? selectedDay.entries.length + ' · ' + sumMinutes(selectedDay.entries.map((e) => e.task)) + ' min' : ''}
            />
            {selectedDay.entries.length ? (
              <Card list>
                {selectedDay.entries.map((e, i) => (
                  <TaskRow key={e.task.id + i} variant="agenda" {...e} />
                ))}
              </Card>
            ) : (
              <DashedNote roomy>Dia livre. Nenhuma tarefa prevista.</DashedNote>
            )}
          </div>

          <WeekBoard days={days} today={today} />
        </PageContent>
      )}
    </>
  );
}

interface StripProps {
  days: AgendaDay[];
  selected: IsoDate;
  today: IsoDate;
  onSelect(date: IsoDate): void;
}

/** 7-day strip (mobile). */
function WeekStrip({ days, selected, today, onSelect }: StripProps) {
  return (
    <div className={styles.strip}>
      {days.map(({ date, entries }) => (
        <button
          key={date}
          type="button"
          aria-pressed={date === selected}
          className={cx(styles.stripDay, date === today && styles.isToday, date === selected && styles.isSelected)}
          onClick={() => onSelect(date)}
        >
          <span className={styles.stripLetter}>{dayLetter(date)}</span>
          <span className={styles.stripNum}>{dayNum(date)}</span>
          <span className={cx(styles.stripCount, !entries.length && styles.stripCountEmpty)}>{entries.length || '·'}</span>
        </button>
      ))}
    </div>
  );
}

/** 7-column board (desktop). */
function WeekBoard({ days, today }: { days: AgendaDay[]; today: IsoDate }) {
  return (
    <div className={styles.boardScroll}>
      <div className={styles.board}>
        {days.map(({ date, entries }) => (
          <div key={date} className={cx(styles.column, date === today && styles.columnToday)}>
            <div className={styles.columnHead}>
              <span className={styles.columnLetter}>{dayLetter(date)}</span>
              <span className={styles.columnNum}>{dayNum(date)}</span>
            </div>
            <div className={styles.columnBody}>
              {entries.map((e, i) => (
                <TaskBoardCard key={e.task.id + i} {...e} />
              ))}
              {!entries.length && <span className={styles.free}>Livre</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
