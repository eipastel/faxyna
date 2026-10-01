'use client';

import { useState, type CSSProperties } from 'react';
import { DONE_STATUS, dueStatus, MISSED_STATUS, freqLabel, joinNames, lastCompletion, minutesLabel, type IsoDate, type Task } from '@faxyna/core';
import { Avatar, Dot, Icon, Pill } from '@/components/ui';
import { cx } from '@/lib/cx';
import { roomColors } from '@/lib/roomColors';
import { useSwipe } from '@/lib/useSwipe';
import { useData } from '@/providers/DataProvider';
import { useTaskActions } from './useTaskActions';
import { useTaskSheet } from './TaskSheetProvider';
import styles from './TaskRow.module.css';

export interface TaskOccurrence {
  task: Task;
  /** Date of this occurrence (default: `task.nextDue`). */
  due?: IsoDate;
  done?: boolean;
  /** Closed as not done (Week view). */
  missed?: boolean;
  /** Computed future occurrence (not yet the `nextDue`). */
  projected?: boolean;
}

interface TaskRowProps extends TaskOccurrence {
  /** Which metadata line to show: Today · Week · Rooms. */
  variant?: 'today' | 'agenda' | 'room';
  /** Position in the list, for the staggered entrance. */
  index?: number;
  /** Rooms view: the card the row sits in; other linked rooms are listed as "também …". */
  roomId?: string;
}

/** Task row reused in Today, Week (mobile) and Rooms. Swipe right completes, swipe left deletes. */
export function TaskRow({ task, due, done, missed, projected, variant = 'today', index, roomId }: TaskRowProps) {
  const { today, taskRooms, person } = useData();
  const { complete, uncomplete, remove } = useTaskActions();
  const { openDetail } = useTaskSheet();
  const rooms = taskRooms(task);
  const r = rooms[0];
  const others = rooms.filter((x) => x.id !== roomId);
  const who = person(task.personId);
  const status = done ? DONE_STATUS : missed ? MISSED_STATUS : dueStatus(due ?? task.nextDue, today, projected);
  const open = () => openDetail(task.id);
  // Only the latest completion can be undone; older ones (Week view) just open the details.
  const last = lastCompletion(task);
  const undoable = done && !!last && (!due || due === last.date);
  // Overdue: the details ask which day it was actually done.
  const overdue = !done && !missed && !!task.nextDue && task.nextDue < today;
  const toggle = () => (undoable ? uncomplete(task.id) : done || missed || projected || overdue ? open() : complete(task.id));
  const canToggle = undoable || !(done || missed || projected);

  const [leaving, setLeaving] = useState(false);
  const swipe = useSwipe({
    dirs: canToggle ? ['left', 'right'] : ['left'],
    snap: 88,
    onCommit: (dir) => (dir === 'left' ? drop() : run(toggle)),
  });
  const run = (fn: () => void) => {
    swipe.close();
    fn();
  };
  // Collapse the row first, then delete (the toast offers "Desfazer").
  const drop = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => Promise.resolve(remove(task.id)).finally(() => {
      setLeaving(false);
      swipe.close();
    }), 260);
  };

  const side = swipe.x < 0 ? 'delete' : swipe.x > 0 ? 'done' : undefined;
  const style = index === undefined ? undefined : ({ '--i': index } as CSSProperties);

  return (
    <div ref={swipe.ref} className={cx(styles.swipe, index !== undefined && 'rise', leaving && styles.leaving)} style={style}>
      <div className={styles.clip}>
        <div className={styles.actions} data-side={side} data-armed={swipe.armed || undefined}>
          {side === 'done' && (
            <button type="button" className={styles.action} onClick={() => run(toggle)}>
              <Icon name={undoable ? 'undo' : 'check'} size={22} />
              {undoable ? 'Desmarcar' : 'Concluir'}
            </button>
          )}
          {side === 'delete' && (
            <button type="button" className={styles.action} onClick={drop}>
              <Icon name="delete" size={22} />
              Excluir
            </button>
          )}
        </div>
        <div
          className={cx(styles.row, swipe.dragging && styles.dragging)}
          style={{ transform: swipe.x ? `translateX(${swipe.x}px)` : undefined }}
          {...swipe.handlers}
        >
          <CheckButton done={done} missed={missed} projected={projected} undoable={undoable} onClick={toggle} />

          <button type="button" className={styles.main} onClick={open}>
            <span className={styles.nameLine}>
              <span className={cx(styles.name, (done || missed) && styles.done)}>{task.name}</span>
              {task.priority === 'alta' && <Icon name="priority_high" size={15} color="var(--amber)" />}
            </span>
            {variant === 'room' ? (
              <span className={styles.meta}>
                {freqLabel(task.freq)}
                {others.length > 0 && ' · também ' + joinNames(others.map((x) => x.name))}
              </span>
            ) : (
              <span className={cx(styles.meta, styles.metaLine)}>
                {r && <Dot color={roomColors(r.hue).dot} />}
                <span>{joinNames(rooms.map((x) => x.name))}</span>
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
      </div>
    </div>
  );
}

interface CheckButtonProps {
  done?: boolean;
  missed?: boolean;
  projected?: boolean;
  undoable?: boolean;
  onClick(): void;
}

/** Left circle: completes or undoes with one tap (opens details when it can't). */
function CheckButton({ done, missed, projected, undoable, onClick }: CheckButtonProps) {
  return (
    <button
      type="button"
      aria-label={undoable ? 'Desmarcar' : done || missed || projected ? 'Ver detalhes' : 'Concluir'}
      className={cx(styles.check, done && styles.checkDone, missed && styles.checkMissed, projected && styles.checkProjected)}
      onClick={onClick}
    >
      <Icon name={missed ? 'close' : 'check'} size={16} className={styles.checkIcon} />
    </button>
  );
}
