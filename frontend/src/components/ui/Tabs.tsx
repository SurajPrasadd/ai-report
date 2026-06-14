import React, { useState } from 'react';
import styles from './Tabs.module.css';

interface Tab { key: string; label: string; icon?: React.ReactNode; }

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (key: string) => void;
  children?: (activeTab: string) => React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange, children }) => {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key ?? '');

  const handleSelect = (key: string) => {
    setActive(key);
    onChange?.(key);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        {tabs.map(t => (
          <button key={t.key} className={`${styles.tab} ${active === t.key ? styles.active : ''}`} onClick={() => handleSelect(t.key)}>
            {t.icon && <span className={styles.tabIcon}>{t.icon}</span>}
            {t.label}
          </button>
        ))}
      </div>
      <div className={styles.content}>{children?.(active)}</div>
    </div>
  );
};

export default Tabs;
