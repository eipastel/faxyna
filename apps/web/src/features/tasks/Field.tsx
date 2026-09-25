import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui';
import styles from './TaskForm.module.css';

/** Form field: uppercase label + content. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}
