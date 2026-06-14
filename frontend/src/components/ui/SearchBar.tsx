import React, { useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search…', autoFocus }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  return (
    <div className={styles.wrap}>
      <FiSearch className={styles.icon} />
      <input ref={ref} className={styles.input} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      {value && <button className={styles.clear} onClick={() => onChange('')}><FiX /></button>}
    </div>
  );
};

export default SearchBar;
