import { Icon } from './Icon';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  error?: boolean;
}

export function Toast({ message, onUndo, error }: ToastProps) {
  return (
    <div role={error ? 'alert' : 'status'} className={styles.toast}>
      <Icon name={error ? 'error' : 'check_circle'} size={18} color={error ? 'var(--red)' : 'var(--green)'} />
      <span className={styles.message}>{message}</span>
      {onUndo && (
        <button type="button" className={styles.undo} onClick={onUndo}>
          Desfazer
        </button>
      )}
    </div>
  );
}
