import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LightColors } from '../../theme/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

const AppButton: React.FC<AppButtonProps> = ({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, icon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = { ...styles.base, ...styles[size] };
    switch (variant) {
      case 'secondary': return { ...base, backgroundColor: LightColors.secondary };
      case 'outline': return { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: LightColors.primary };
      case 'danger': return { ...base, backgroundColor: LightColors.error };
      case 'success': return { ...base, backgroundColor: LightColors.success };
      default: return { ...base, backgroundColor: LightColors.primary };
    }
  };

  const getTextStyle = (): TextStyle => ({
    ...styles.text,
    ...styles[`text_${size}` as keyof typeof styles] as TextStyle,
    color: variant === 'outline' ? LightColors.primary : '#fff',
  });

  return (
    <TouchableOpacity
      style={[getContainerStyle(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? LightColors.primary : '#fff'} size="small" />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{icon ? `${icon}  ` : ''}{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 24 },
  lg: { paddingVertical: 16, paddingHorizontal: 32 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '600', textAlign: 'center' },
  text_sm: { fontSize: 13 },
  text_md: { fontSize: 15 },
  text_lg: { fontSize: 17 },
});

export default AppButton;
