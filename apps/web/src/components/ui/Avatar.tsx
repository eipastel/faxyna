import { cx } from '@/lib/cx';
import styles from './Avatar.module.css';

/** Circle with the person's initial; "–" when nobody is assigned. */
export function Avatar({ name, size = 'sm' }: { name?: string; size?: 'sm' | 'md' }) {
  return (
    <span title={name ?? 'Sem responsável'} className={cx(styles.avatar, styles[size])}>
      {name ? name[0] : '–'}
    </span>
  );
}
