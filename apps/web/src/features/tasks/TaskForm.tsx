'use client';

import { useState } from 'react';
import type { Priority, Task } from '@faxyna/core';
import { minutesLabel } from '@faxyna/core';
import { Button, Chip, Dot, Icon, IconButton } from '@/components/ui';
import { roomColors } from '@/lib/roomColors';
import { useData } from '@/providers/DataProvider';
import { Field } from './Field';
import { FrequencyField } from './FrequencyField';
import { initialValues, newTaskId, toTask, validate, type TaskFormValues } from './formValues';
import { useTaskActions } from './useTaskActions';
import { useTaskSheet } from './TaskSheetProvider';
import styles from './TaskForm.module.css';

const PRIORITIES: { value: Priority; label: string; dot: string }[] = [
  { value: 'baixa', label: 'Baixa', dot: 'var(--text-4)' },
  { value: 'media', label: 'Média', dot: 'var(--text-2)' },
  { value: 'alta', label: 'Alta', dot: 'var(--amber)' },
];
const MINUTES = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300];

/** Task create and edit form. */
export function TaskForm({ task, roomId }: { task?: Task; roomId?: string }) {
  const { rooms, people, today } = useData();
  const { create, update } = useTaskActions();
  const { close, openDetail } = useTaskSheet();
  const [values, setValues] = useState<TaskFormValues>(() =>
    initialValues(task, { today, roomId: roomId ?? rooms[0]?.id ?? '', personId: people[0]?.id ?? null }),
  );
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<TaskFormValues>) => {
    setValues((v) => ({ ...v, ...patch }));
    setError(null);
  };

  const save = () => {
    const problem = validate(values);
    if (problem) return setError(problem);
    const saved = toTask(values, task, today, newTaskId);
    if (task) {
      update(saved);
      openDetail(task.id);
    } else {
      create(saved);
      close();
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>{task ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        <IconButton icon="close" label="Fechar" onClick={close} />
      </div>

      <input
        className={styles.input}
        value={values.name}
        onChange={(e) => set({ name: e.target.value })}
        placeholder="O que precisa ser feito? ex: limpar o fogão"
        aria-label="Nome da tarefa"
        autoFocus
      />

      <FrequencyField values={values} set={set} />

      <Field label="Cômodo">
        <div className={styles.roomGrid}>
          {rooms.map((r) => (
            <Chip key={r.id} shape="box" selected={values.roomId === r.id} className={styles.roomChip} onClick={() => set({ roomId: r.id })}>
              <Icon name={r.icon} size={17} color={roomColors(r.hue).chipInk} />
              <span className={styles.ellipsis}>{r.name}</span>
            </Chip>
          ))}
        </div>
      </Field>

      <div className={styles.twoCols}>
        <Field label="Quem faz">
          <div className={styles.stack}>
            {[...people, null].map((p) => (
              <Chip key={p?.id ?? 'none'} shape="box" selected={values.personId === (p?.id ?? null)} className={styles.stackChip} onClick={() => set({ personId: p?.id ?? null })}>
                {p?.name ?? 'Ninguém fixo'}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="Prioridade">
          <div className={styles.stack}>
            {PRIORITIES.map((p) => (
              <Chip key={p.value} shape="box" selected={values.priority === p.value} className={styles.stackChip} onClick={() => set({ priority: p.value })}>
                <Dot color={p.dot} />
                {p.label}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Tempo estimado">
        <div className={styles.bleedRow}>
          {MINUTES.map((n) => (
            <Chip key={n} selected={values.minutes === n} className={styles.minuteChip} onClick={() => set({ minutes: n })}>
              {minutesLabel(n)}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Observações">
        <textarea
          className={styles.textarea}
          value={values.notes}
          onChange={(e) => set({ notes: e.target.value })}
          rows={2}
          placeholder="Opcional. ex: usar o desengordurante do armário"
          aria-label="Observações"
        />
      </Field>

      {error && (
        <div role="alert" className={styles.error}>
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className={styles.footer}>
        <Button variant="outline" size="xl" onClick={close}>Cancelar</Button>
        <Button variant="primary" size="xl" onClick={save}>{task ? 'Salvar' : 'Criar tarefa'}</Button>
      </div>
    </div>
  );
}
