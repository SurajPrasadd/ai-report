import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  subtitle?: string;
  trend?: { value: number; label: string };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = '#1976d2', subtitle, trend }) => (
  <div className={styles.card}>
    <div className={styles.top}>
      <div className={styles.iconBox} style={{ background: `${color}18` }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
      </div>
      {trend && (
        <span className={`${styles.trend} ${trend.value >= 0 ? styles.trendUp : styles.trendDown}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
        </span>
      )}
    </div>
    <div className={styles.value} style={{ color }}>{value}</div>
    <div className={styles.title}>{title}</div>
    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
  </div>
);

export default StatCard;
