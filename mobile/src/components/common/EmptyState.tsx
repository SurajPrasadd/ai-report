import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LightColors } from '../../theme/colors';
import AppButton from './AppButton';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, message, actionLabel, onAction }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
    {actionLabel && onAction && (
      <AppButton title={actionLabel} onPress={onAction} style={styles.button} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: LightColors.text, textAlign: 'center', marginBottom: 8 },
  message: { fontSize: 14, color: LightColors.textSecondary, textAlign: 'center', lineHeight: 22 },
  button: { marginTop: 24, minWidth: 160 },
});

export default EmptyState;
