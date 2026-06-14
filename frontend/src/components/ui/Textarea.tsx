import React from 'react';
import styles from './Input.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string; required?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({ label, error, required, id, ...rest }) => {
  const elId = id ?? `ta-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className={styles.field}>
      {label && <label htmlFor={elId} className={styles.label}>{label}{required && <span className={styles.req}> *</span>}</label>}
      <textarea id={elId} rows={3} className={`${styles.input} ${error ? styles.error : ''}`} style={{ resize: 'vertical', lineHeight: 1.5 }} {...rest} />
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
};

export default Textarea;
