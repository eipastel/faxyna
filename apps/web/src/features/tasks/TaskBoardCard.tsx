'use client';

import { Dot } from '@/components/ui';
import { cx } from '@/lib/cx';
import { roomColors } from '@/lib/roomColors';
import { useData } from '@/providers/DataProvider';
import { useTaskSheet } from './TaskSheetProvider';
import type { TaskOccurrence } from './TaskRow';
import styles from './TaskBoardCard.module.css';

/** Compact card for the weekly board (desktop). */
export function TaskBoardCard({ task, done, projected }: TaskOccurrence) {
  const { room, person } = useData();
  const { openDetail } = useTaskSheet();
  const r = room(task.roomId);
  const who = person(task.personId);

  return (
    <button
      type="button"
      className={cx(styles.card, done && styles.done, projected && styles.projected)}
      onClick={() => openDetail(task.id)}
    >
      <span className={styles.name}>{task.name}</span>
      <span className={styles.meta}>
        {r && <Dot color={roomColors(r.hue).dot} />}
        <span className={styles.room}>{r?.name}</span>
        <span>{who ? who.name[0] : '–'}</span>
      </span>
    </button>
  );
}
