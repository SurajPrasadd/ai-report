import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>📧</Text>
        <Text style={styles.successTitle}>Check your email</Text>
        <Text style={styles.successMsg}>Password reset instructions have been sent to {email}</Text>
        <AppButton title="Back to Login" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email and we'll send you reset instructions</Text>
      </View>
      <View style={styles.form}>
        <AppInput
          label="Email Address" placeholder="you@company.com"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" required
        />
        <AppButton title="Send Reset Link" onPress={handleSubmit} loading={isLoading} size="lg" style={styles.btn} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: LightColors.background },
  header: { backgroundColor: LightColors.primary, padding: 32, paddingTop: 60, alignItems: 'center' },
  backBtn: { color: '#fff', alignSelf: 'flex-start', fontSize: 16, marginBottom: 20 },
  icon: { fontSize: 56 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 12 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  form: { padding: 24, marginTop: 8 },
  btn: { width: '100%', marginTop: 8 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: LightColors.background },
  successIcon: { fontSize: 80 },
  successTitle: { fontSize: 24, fontWeight: '800', color: LightColors.text, marginTop: 20 },
  successMsg: { fontSize: 15, color: LightColors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 24 },
});

export default ForgotPasswordScreen;
