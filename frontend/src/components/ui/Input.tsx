import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, hint, required, icon, className = '', id, ...rest }) => {
  const inputId = id ?? `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className={styles.field}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}{required && <span className={styles.req}> *</span>}</label>}
      <div className={styles.wrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input id={inputId} className={`${styles.input} ${icon ? styles.withIcon : ''} ${error ? styles.error : ''} ${className}`} {...rest} />
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
};

export default Input;
