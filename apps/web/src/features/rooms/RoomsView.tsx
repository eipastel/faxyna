'use client';

import { useState } from 'react';
import { activeTasks, byDueThenPriority, plural, relativeDay, type Room, type Task } from '@faxyna/core';
import { PageContent, PageHeader } from '@/components/layout/PageHeader';
import { Card, Icon, Meta, Pill } from '@/components/ui';
import { TaskRow } from '@/features/tasks/TaskRow';
import { useTaskSheet } from '@/features/tasks/TaskSheetProvider';
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
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} tasks={active.filter((t) => t.roomId === room.id).sort(byDueThenPriority)} />
          ))}
        </div>
      </PageContent>
    </>
  );
}

function RoomCard({ room, tasks }: { room: Room; tasks: Task[] }) {
  const { today } = useData();
  const { openNew } = useTaskSheet();
  const [open, setOpen] = useState(true);
  const colors = roomColors(room.hue);
  const overdue = tasks.filter((t) => t.nextDue! < today).length;
  const meta = tasks.length
    ? plural(tasks.length, 'tarefa', 'tarefas') + ' · próxima ' + relativeDay(tasks[0].nextDue!, today)
    : 'Sem tarefas';

  return (
    <Card>
      <button type="button" className={styles.head} aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={styles.iconBox} style={{ background: colors.tint }}>
          <Icon name={room.icon} size={21} color={colors.ink} />
        </span>
        <span className={styles.headText}>
          <span className={styles.name}>{room.name}</span>
          <Meta>{meta}</Meta>
        </span>
        {overdue > 0 && <Pill tone="overdue">{plural(overdue, 'atrasada', 'atrasadas')}</Pill>}
        <Icon name={open ? 'expand_less' : 'expand_more'} size={20} color="var(--text-3)" />
      </button>

      {open && (
        <div className={styles.body}>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} variant="room" />
          ))}
          <button type="button" className={styles.add} onClick={() => openNew(room.id)}>
            <Icon name="add" size={18} />
            <span>Adicionar tarefa em {room.name}</span>
          </button>
        </div>
      )}
    </Card>
  );
}
