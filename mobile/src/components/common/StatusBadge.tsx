import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor } from '../../utils/helpers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const color = getStatusColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}66` }, size === 'sm' && styles.sm]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  text: { fontSize: 13, fontWeight: '600' },
  textSm: { fontSize: 11 },
});

export default StatusBadge;
