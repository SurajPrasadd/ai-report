import React from 'react';
import styles from './Input.module.css';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ label, error, required, options, placeholder, id, className = '', ...rest }) => {
  const selectId = id ?? `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className={styles.field}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}{required && <span className={styles.req}> *</span>}</label>}
      <select id={selectId} className={`${styles.input} ${error ? styles.error : ''} ${className}`} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
};

export default Select;
