import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginThunk, clearError } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../types';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { LightColors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const schema = yup.object({
  employeeId: yup.string().required('Employee ID is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  rememberMe: yup.boolean().default(false),
});

type FormData = yup.InferType<typeof schema>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(s => s.auth);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { employeeId: '', email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }
  }, [error]);

  const onSubmit = async (data: FormData) => {
    await dispatch(loginThunk(data));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🤖</Text>
          <Text style={styles.appName}>AI Productivity</Text>
          <Text style={styles.appSubtitle}>Tracking System</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to your account</Text>

          <Controller
            control={control}
            name="employeeId"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Employee ID"
                placeholder="e.g. EMP001"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.employeeId?.message}
                autoCapitalize="characters"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Email Address"
                placeholder="you@company.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                required
              />
            )}
          />

          {/* Remember Me + Forgot */}
          <View style={styles.row}>
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity style={styles.rememberRow} onPress={() => onChange(!value)}>
                  <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                    {value && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>Remember Me</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <AppButton
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            size="lg"
            style={styles.loginBtn}
          />

          {/* Demo credentials */}
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>
            <Text style={styles.demoText}>ID: EMP001 | Email: admin@company.com</Text>
            <Text style={styles.demoText}>Password: Password@123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: LightColors.primary, paddingBottom: 32 },
  header: { alignItems: 'center', paddingTop: 72, paddingBottom: 32 },
  emoji: { fontSize: 64 },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 12 },
  appSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12,
  },
  welcomeText: { fontSize: 26, fontWeight: '800', color: LightColors.text, marginBottom: 4 },
  subtitleText: { fontSize: 15, color: LightColors.textSecondary, marginBottom: 28 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: LightColors.border,
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  checkboxChecked: { backgroundColor: LightColors.primary, borderColor: LightColors.primary },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  rememberText: { fontSize: 14, color: LightColors.text },
  forgotText: { fontSize: 14, color: LightColors.primary, fontWeight: '600' },
  loginBtn: { width: '100%' },
  demoBox: {
    marginTop: 24, backgroundColor: LightColors.background, borderRadius: 10,
    padding: 14, borderLeftWidth: 4, borderLeftColor: LightColors.info,
  },
  demoTitle: { fontSize: 12, fontWeight: '700', color: LightColors.info, marginBottom: 4 },
  demoText: { fontSize: 12, color: LightColors.textSecondary },
});

export default LoginScreen;
