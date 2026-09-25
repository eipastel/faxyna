import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import { Icon } from './Icon';
import styles from './Button.module.css';

type Variant = 'primary' | 'outline' | 'danger';
/** Design heights: sm 38 · md 40 · lg 42 · xl 44 · xxl 46. */
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconSize?: number;
  /** Confirmation state of the "Excluir" button. */
  confirming?: boolean;
}

export function Button({ variant = 'outline', size = 'md', icon, iconSize = 18, confirming, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], confirming && styles.confirming, className)}
      {...rest}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
  bordered?: boolean;
  iconSize?: number;
}

/** Square 32px icon-only button (close, navigate weeks). */
export function IconButton({ icon, label, bordered, iconSize = 20, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} className={cx(styles.iconButton, bordered && styles.bordered, className)} {...rest}>
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
