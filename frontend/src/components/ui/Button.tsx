import React from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', loading, disabled,
  icon, iconRight, className = '', ...rest
}) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={`${styles.btn} ${styles[variant]} ${styles[size]} ${loading ? styles.loading : ''} ${className}`}
  >
    {loading && <span className={styles.spinner} />}
    {!loading && icon && <span className={styles.icon}>{icon}</span>}
    {children && <span>{children}</span>}
    {!loading && iconRight && <span className={styles.icon}>{iconRight}</span>}
  </button>
);

export default Button;
