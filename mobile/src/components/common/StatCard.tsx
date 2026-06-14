import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LightColors } from '../../theme/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  subtitle?: string;
  style?: ViewStyle;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = LightColors.primary, subtitle, style }) => (
  <View style={[styles.card, style]}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <Text style={[styles.value, { color }]}>{value}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: LightColors.surface, borderRadius: 12, padding: 16,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, flex: 1, margin: 4,
  },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  icon: { fontSize: 24 },
  value: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  title: { fontSize: 12, color: LightColors.textSecondary, textAlign: 'center', fontWeight: '500' },
  subtitle: { fontSize: 11, color: LightColors.textSecondary, marginTop: 2 },
});

export default StatCard;
