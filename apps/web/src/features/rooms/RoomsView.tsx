'use client';

import { useState, type CSSProperties } from 'react';
import { activeTasks, byDueThenPriority, plural, relativeDay, type Room, type Task } from '@faxyna/core';
import { PageContent, PageHeader } from '@/components/layout/PageHeader';
import { Card, Icon, Meta, Pill } from '@/components/ui';
import { TaskRow } from '@/features/tasks/TaskRow';
import { useTaskSheet } from '@/features/tasks/TaskSheetProvider';
import { cx } from '@/lib/cx';
import { roomColors } from '@/lib/roomColors';
import { useData } from '@/providers/DataProvider';
import styles from './RoomsView.module.css';

export function RoomsView() {
  const { tasks, rooms } = useData();
  const active = activeTasks(tasks);

  return (
    <>
      <PageHeader title="Cômodos" subtitle={active.length + ' tarefas em ' + rooms.length + ' cômodos.'} />
      <PageContent gap={12}>
        <div className={styles.grid}>
          {rooms.map((room, i) => (
            <RoomCard key={room.id} index={i} room={room} tasks={active.filter((t) => t.roomIds.includes(room.id)).sort(byDueThenPriority)} />
          ))}
        </div>
      </PageContent>
    </>
  );
}

function RoomCard({ room, tasks, index }: { room: Room; tasks: Task[]; index: number }) {
  const { today } = useData();
  const { openNew } = useTaskSheet();
  const [open, setOpen] = useState(true);
  const colors = roomColors(room.hue);
  const overdue = tasks.filter((t) => t.nextDue! < today).length;
  const meta = tasks.length
    ? plural(tasks.length, 'tarefa', 'tarefas') + ' · próxima ' + relativeDay(tasks[0].nextDue!, today)
    : 'Sem tarefas';

  return (
    <Card className="rise" style={{ '--i': index } as CSSProperties}>
      <button type="button" className={styles.head} aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={styles.iconBox} style={{ background: colors.tint }}>
          <Icon name={room.icon} size={21} color={colors.ink} />
        </span>
        <span className={styles.headText}>
          <span className={styles.name}>{room.name}</span>
          <Meta>{meta}</Meta>
        </span>
        {overdue > 0 && <Pill tone="overdue">{plural(overdue, 'atrasada', 'atrasadas')}</Pill>}
        <Icon name="expand_more" size={20} color="var(--text-3)" className={cx(styles.chevron, open && styles.chevronOpen)} />
      </button>

      <div className={cx(styles.collapse, !open && styles.collapsed)} inert={!open}>
        <div className={styles.body}>
          {tasks.map((t, i) => (
            <TaskRow key={t.id} task={t} variant="room" roomId={room.id} index={i} />
          ))}
          <button type="button" className={styles.add} onClick={() => openNew(room.id)}>
            <Icon name="add" size={18} />
            <span>Adicionar tarefa em {room.name}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
