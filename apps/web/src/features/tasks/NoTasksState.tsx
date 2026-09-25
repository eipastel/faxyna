'use client';

import { Button, Icon } from '@/components/ui';
import { useTaskActions } from './useTaskActions';
import { useTaskSheet } from './TaskSheetProvider';
import styles from './NoTasksState.module.css';

/** Initial state, before any task exists. */
export function NoTasksState() {
  const { openNew } = useTaskSheet();
  const { loadExamples } = useTaskActions();

  return (
    <div className={styles.empty}>
      <div className={styles.iconBox}>
        <Icon name="cleaning_services" size={24} color="var(--text-2)" />
      </div>
      <h2 className={styles.title}>Nenhuma tarefa ainda</h2>
      <p className={styles.text}>Cadastre o que precisa ser feito e com que frequência. O app calcula as próximas datas sozinho.</p>
      <div className={styles.actions}>
        <Button variant="primary" size="sm" icon="add" onClick={() => openNew()}>Nova tarefa</Button>
        <Button variant="outline" size="sm" onClick={loadExamples}>Ver com exemplos</Button>
      </div>
    </div>
  );
}
