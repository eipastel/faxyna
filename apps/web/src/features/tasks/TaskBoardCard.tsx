'use client';

import { joinNames } from '@faxyna/core';
import { Dot } from '@/components/ui';
import { cx } from '@/lib/cx';
import { roomColors } from '@/lib/roomColors';
import { useData } from '@/providers/DataProvider';
import { useTaskSheet } from './TaskSheetProvider';
import type { TaskOccurrence } from './TaskRow';
import styles from './TaskBoardCard.module.css';

/** Compact card for the weekly board (desktop). */
export function TaskBoardCard({ task, done, missed, projected }: TaskOccurrence) {
  const { taskRooms, person } = useData();
  const { openDetail } = useTaskSheet();
  const rooms = taskRooms(task);
  const r = rooms[0];
  const who = person(task.personId);

  return (
    <button
      type="button"
      className={cx(styles.card, done && styles.done, missed && styles.missed, projected && styles.projected)}
      onClick={() => openDetail(task.id)}
    >
      <span className={styles.name}>{task.name}</span>
      {missed && <span className={styles.missedTag}>Não feita</span>}
      <span className={styles.meta}>
        {r && <Dot color={roomColors(r.hue).dot} />}
        <span className={styles.room}>{joinNames(rooms.map((x) => x.name))}</span>
        <span>{who ? who.name[0] : '–'}</span>
      </span>
    </button>
  );
}
