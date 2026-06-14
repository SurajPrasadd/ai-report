import React from 'react';
import { getStatusColor, getStatusBg } from '@/utils/helpers';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, size = 'md', className }) => {
  const color = getStatusColor(status);
  const bg = getStatusBg(status);
  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '0.7rem' : '0.78rem';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding, borderRadius: 9999, background: bg,
      fontSize, fontWeight: 600, color, whiteSpace: 'nowrap',
    }} className={className}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {status}
    </span>
  );
};

export default Badge;
