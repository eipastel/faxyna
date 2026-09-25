'use client';

import { DONE_STATUS, dueStatus, freqLabel, minutesLabel, type IsoDate, type Task } from '@faxyna/core';
import { Avatar, Dot, Icon, Pill } from '@/components/ui';
import { cx } from '@/lib/cx';
import { roomColors } from '@/lib/roomColors';
import { useData } from '@/providers/DataProvider';
import { useTaskActions } from './useTaskActions';
import { useTaskSheet } from './TaskSheetProvider';
import styles from './TaskRow.module.css';

export interface TaskOccurrence {
  task: Task;
  /** Date of this occurrence (default: `task.nextDue`). */
  due?: IsoDate;
  done?: boolean;
  /** Computed future occurrence (not yet the `nextDue`). */
  projected?: boolean;
}

interface TaskRowProps extends TaskOccurrence {
  /** Which metadata line to show: Today · Week · Rooms. */
  variant?: 'today' | 'agenda' | 'room';
}

/** Task row reused in Today, Week (mobile) and Rooms. */
export function TaskRow({ task, due, done, projected, variant = 'today' }: TaskRowProps) {
  const { today, room, person } = useData();
  const { complete } = useTaskActions();
  const { openDetail } = useTaskSheet();
  const r = room(task.roomId);
  const who = person(task.personId);
  const status = done ? DONE_STATUS : dueStatus(due ?? task.nextDue, today, projected);
  const open = () => openDetail(task.id);
  const toggle = () => (done || projected ? open() : complete(task.id));

  return (
    <div className={styles.row}>
      <CheckButton done={done} projected={projected} onClick={toggle} />

      <button type="button" className={styles.main} onClick={open}>
        <span className={styles.nameLine}>
          <span className={cx(styles.name, done && styles.done)}>{task.name}</span>
          {task.priority === 'alta' && <Icon name="priority_high" size={15} color="var(--amber)" />}
        </span>
        {variant === 'room' ? (
          <span className={styles.meta}>{freqLabel(task.freq)}</span>
        ) : (
          <span className={cx(styles.meta, styles.metaLine)}>
            {r && <Dot color={roomColors(r.hue).dot} />}
            <span>{r?.name}</span>
            {variant === 'today' && <><span>·</span><span>{freqLabel(task.freq)}</span></>}
            {!!task.minutes && <><span>·</span><span>{minutesLabel(task.minutes)}</span></>}
            {variant === 'agenda' && projected && <><span>·</span><span>prevista</span></>}
          </span>
        )}
      </button>

      <div className={styles.side} onClick={open} aria-hidden>
        <Pill tone={status.tone}>{status.label}</Pill>
        <Avatar name={who?.name} />
      </div>
    </div>
  );
}

interface CheckButtonProps {
  done?: boolean;
  projected?: boolean;
  onClick(): void;
}

/** Left circle: completes with one tap (or opens details if already done/projected). */
function CheckButton({ done, projected, onClick }: CheckButtonProps) {
  return (
    <button
      type="button"
      aria-label={done || projected ? 'Ver detalhes' : 'Concluir'}
      className={cx(styles.check, done && styles.checkDone, projected && styles.checkProjected)}
      onClick={onClick}
    >
      <Icon name="check" size={16} style={{ opacity: done ? 1 : 0 }} />
    </button>
  );
}
