import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LightColors } from '../../theme/colors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...', size = 'large', fullScreen = false }) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size={size} color={LightColors.primary} />
    {message && <Text style={styles.text}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  fullScreen: { flex: 1 },
  text: { marginTop: 12, fontSize: 14, color: LightColors.textSecondary },
});

export default LoadingSpinner;
