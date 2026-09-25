'use client';

import { addDays, DOW, DOW_FULL, nextWeekday, type FrequencyType } from '@faxyna/core';
import { Chip, Icon, Segmented } from '@/components/ui';
import { useData } from '@/providers/DataProvider';
import { Field } from './Field';
import { frequencyPreview, type TaskFormValues } from './formValues';
import styles from './TaskForm.module.css';

const TYPES: { value: FrequencyType; label: string }[] = [
  { value: 'once', label: 'Uma vez' },
  { value: 'interval', label: 'A cada X dias' },
  { value: 'weekdays', label: 'Dias da semana' },
];
const EVERY = [1, 2, 3, 7, 15, 30];
const DAY_PRESETS: [string, number[]][] = [
  ['Dias úteis', [1, 2, 3, 4, 5]],
  ['Fim de semana', [0, 6]],
  ['Todos', [0, 1, 2, 3, 4, 5, 6]],
];

interface Props {
  values: TaskFormValues;
  set(patch: Partial<TaskFormValues>): void;
}

/** "Frequência" block: once · every X days · weekdays. */
export function FrequencyField({ values: v, set }: Props) {
  const { today, settings } = useData();
  const tomorrow = addDays(today, 1);
  const dayOrder = settings.weekStartsMonday ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];

  return (
    <Field label="Frequência">
      <Segmented size="md" label="Tipo de frequência" options={TYPES} value={v.freqType} onChange={(freqType) => set({ freqType })} />

      {v.freqType === 'interval' && (
        <div className={styles.panel}>
          <div className={styles.everyRow}>
            <span className={styles.label}>A cada</span>
            <div className={styles.stepper}>
              <button type="button" aria-label="Menos" className={styles.stepButton} onClick={() => set({ every: Math.max(1, v.every - 1) })}>
                <Icon name="remove" size={18} />
              </button>
              <span className={styles.stepValue}>{v.every}</span>
              <button type="button" aria-label="Mais" className={styles.stepButton} onClick={() => set({ every: Math.min(365, v.every + 1) })}>
                <Icon name="add" size={18} />
              </button>
            </div>
            <span className={styles.label}>{v.every === 1 ? 'dia' : 'dias'}</span>
          </div>
          <div className={styles.wrapRow}>
            {EVERY.map((n) => (
              <Chip key={n} selected={v.every === n} className={styles.everyChip} onClick={() => set({ every: n })}>
                {n === 1 ? 'diário' : n + 'd'}
              </Chip>
            ))}
          </div>
          <div className={`${styles.wrapRow} ${styles.divided}`}>
            <span className={styles.inlineLabel}>Começa</span>
            <DateChips value={v.start} onChange={(start) => set({ start })} options={[['Hoje', today], ['Amanhã', tomorrow]]} />
          </div>
        </div>
      )}

      {v.freqType === 'weekdays' && (
        <div className={styles.panel}>
          <div className={styles.dayGrid}>
            {dayOrder.map((d) => {
              const on = v.days.includes(d);
              return (
                <Chip key={d} shape="box" tone="solid" selected={on} aria-label={DOW_FULL[d]} className={styles.dayChip}
                  onClick={() => set({ days: on ? v.days.filter((x) => x !== d) : [...v.days, d] })}>
                  {DOW[d].slice(0, 3)}
                </Chip>
              );
            })}
          </div>
          <div className={styles.wrapRow}>
            {DAY_PRESETS.map(([label, days]) => (
              <button key={label} type="button" className={styles.preset} onClick={() => set({ days })}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {v.freqType === 'once' && (
        <div className={`${styles.panel} ${styles.panelRow}`}>
          <span className={styles.inlineLabel}>Quando</span>
          <DateChips value={v.date} onChange={(date) => set({ date })}
            options={[['Hoje', today], ['Amanhã', tomorrow], ['Sábado', nextWeekday(today, [6], true)!]]} />
        </div>
      )}

      <div className={styles.preview}>
        <Icon name="event_repeat" size={16} />
        <span>{frequencyPreview(v, today)}</span>
      </div>
    </Field>
  );
}

interface DateChipsProps {
  value: string;
  onChange(date: string): void;
  options: [string, string][];
}

/** Date shortcuts + native picker. */
function DateChips({ value, onChange, options }: DateChipsProps) {
  return (
    <>
      {options.map(([label, date]) => (
        <Chip key={label} selected={value === date} className={styles.dateChip} onClick={() => onChange(date)}>
          {label}
        </Chip>
      ))}
      <input type="date" className={styles.dateInput} value={value} aria-label="Escolher data"
        onChange={(e) => e.target.value && onChange(e.target.value)} />
    </>
  );
}
