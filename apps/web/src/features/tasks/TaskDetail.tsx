'use client';

import { useState } from 'react';
import { addDays, capitalize, fmtLong, fmtShort, freqLabel, historyLabel, joinNames, lastCompletion, lastMiss, lastSkip, minutesLabel, PRIORITY_LABEL, type Task } from '@faxyna/core';
import { Button, Card, Dot, Eyebrow, Icon, IconButton, Input } from '@/components/ui';
import { roomColors } from '@/lib/roomColors';
import { useData } from '@/providers/DataProvider';
import { useTaskActions } from './useTaskActions';
import { useTaskSheet } from './TaskSheetProvider';
import styles from './TaskDetail.module.css';

const TONE_COLOR = { neutral: 'var(--text-2)', today: 'var(--blue-ink)', overdue: 'var(--red)', done: 'var(--green)', late: 'var(--amber)' };

/** Task details: complete, mark as not done, postpone, skip, edit, delete and latest entries. */
export function TaskDetail({ task }: { task: Task }) {
  const { today, taskRooms, person } = useData();
  const actions = useTaskActions();
  const { close, openEdit } = useTaskSheet();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const rooms = taskRooms(task);
  const r = rooms[0];
  const who = person(task.personId);
  const lastDone = lastCompletion(task);
  const doneToday = lastDone?.date === today;
  // ponytail: completions can be undone here for a week; older ones stay as they are.
  const undoable = !!lastDone && lastDone.date >= addDays(today, -7);
  const missed = lastMiss(task);
  const skipped = lastSkip(task);
  const overdue = !!task.nextDue && task.nextDue < today;
  const [otherDay, setOtherDay] = useState('');

  const act = (fn: () => void) => () => {
    fn();
    close();
  };

  const rows: { label: string; value: string; color?: string }[] = [
    { label: 'Frequência', value: freqLabel(task.freq) },
    {
      label: 'Próxima',
      value: task.nextDue ? capitalize(fmtLong(task.nextDue)) : 'Encerrada',
      color: task.nextDue && task.nextDue < today ? 'var(--red)' : undefined,
    },
    { label: 'Quem faz', value: who?.name ?? 'Sem responsável' },
    { label: 'Tempo', value: minutesLabel(task.minutes) },
    { label: 'Prioridade', value: PRIORITY_LABEL[task.priority], color: task.priority === 'alta' ? 'var(--amber)' : undefined },
  ];

  const streakLabel = task.streak
    ? task.streak + (task.streak === 1 ? ' vez no prazo' : ' seguidas no prazo')
    : 'Sem sequência ainda';

  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <Eyebrow className={styles.roomLine}>
            {r && <Icon name={r.icon} size={15} color={roomColors(r.hue).ink} />}
            {joinNames(rooms.map((x) => x.name))}
          </Eyebrow>
          <h2 className={styles.title}>{task.name}</h2>
        </div>
        <IconButton icon="close" label="Fechar" onClick={close} />
      </div>

      <Card list plain>
        {rows.map((row) => (
          <div key={row.label} className={styles.infoRow}>
            <span className={styles.infoLabel}>{row.label}</span>
            <span className={styles.infoValue} style={{ color: row.color }}>{row.value}</span>
          </div>
        ))}
      </Card>

      {task.notes && <p className={styles.notes}>{task.notes}</p>}

      <div className={styles.streak}>
        <Icon name="local_fire_department" size={20} filled color={task.streak ? 'var(--amber)' : 'var(--line-strong)'} />
        <span>{streakLabel}</span>
      </div>

      {undoable && (
        <Button size="xxl" icon="undo" iconSize={20} onClick={act(() => actions.uncomplete(task.id))}>
          {doneToday ? 'Desmarcar como feita' : 'Desmarcar feita em ' + fmtShort(lastDone.date)}
        </Button>
      )}

      {missed && (
        <Button size="xxl" icon="check" iconSize={20} onClick={act(() => actions.completeMissed(task.id))}>
          Foi feita em {fmtShort(missed.date)}
        </Button>
      )}

      {skipped && (
        <Button size="xxl" icon="undo" iconSize={20} onClick={act(() => actions.unskip(task.id))}>
          Despular {fmtShort(skipped.date)}
        </Button>
      )}

      {task.nextDue && (
        <div className={styles.actions}>
          {!doneToday && !overdue && (
            <Button variant="primary" size="xxl" icon="check" iconSize={20} onClick={act(() => actions.complete(task.id))}>
              Marcar como feita
            </Button>
          )}
          {!doneToday && overdue && (
            <>
              <Eyebrow>Quando foi feita?</Eyebrow>
              <div className={styles.twoCols}>
                <Button variant="primary" size="xxl" onClick={act(() => actions.complete(task.id, task.nextDue!))}>
                  No dia · {fmtShort(task.nextDue)}
                </Button>
                <Button variant="primary" size="xxl" onClick={act(() => actions.complete(task.id))}>Hoje</Button>
              </div>
              {task.nextDue < addDays(today, -1) && (
                <div className={styles.otherDay}>
                  <Input
                    type="date"
                    aria-label="Outro dia"
                    min={task.nextDue}
                    max={today}
                    value={otherDay}
                    onChange={(e) => setOtherDay(e.target.value)}
                  />
                  <Button disabled={!otherDay} onClick={act(() => actions.complete(task.id, otherDay))}>Outro dia</Button>
                </div>
              )}
              <Button icon="close" iconSize={18} onClick={act(() => actions.miss(task.id))}>Não foi feita</Button>
            </>
          )}
          <div className={styles.threeCols}>
            <Button onClick={act(() => actions.postpone(task.id, 1))}>Adiar 1 dia</Button>
            <Button onClick={act(() => actions.postpone(task.id, 3))}>Adiar 3 dias</Button>
            <Button onClick={act(() => actions.skip(task.id))}>Pular esta</Button>
          </div>
        </div>
      )}

      {task.history.length > 0 && (
        <div className={styles.history}>
          <Eyebrow>Últimos registros</Eyebrow>
          <div className={styles.historyList}>
            {task.history.slice(0, 6).map((h, i) => {
              const s = historyLabel(h);
              return (
                <div key={i} className={styles.historyRow}>
                  <Dot color={TONE_COLOR[s.tone]} />
                  <span className={styles.historyDate}>{fmtShort(h.date)}</span>
                  <span className={styles.historyLabel}>{s.label}</span>
                  <span className={styles.historyBy}>{person(h.personId)?.name ?? ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <Button icon="edit" iconSize={17} onClick={() => openEdit(task.id)}>Editar</Button>
        <Button
          variant="danger"
          icon="delete"
          iconSize={17}
          confirming={confirmDelete}
          onClick={confirmDelete ? act(() => actions.remove(task.id)) : () => setConfirmDelete(true)}
        >
          {confirmDelete ? 'Confirmar' : 'Excluir'}
        </Button>
      </div>
    </div>
  );
}
