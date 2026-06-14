import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LightColors } from '../theme/colors';

const SplashScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.emoji}>🤖</Text>
    <Text style={styles.title}>AI Productivity</Text>
    <Text style={styles.subtitle}>Tracking System</Text>
    <ActivityIndicator style={styles.loader} color="#fff" size="large" />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.primary, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4, letterSpacing: 1.5 },
  loader: { marginTop: 40 },
});

export default SplashScreen;
