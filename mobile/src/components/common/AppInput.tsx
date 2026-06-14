import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { LightColors } from '../../theme/colors';

interface AppInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  style?: ViewStyle;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

const AppInput: React.FC<AppInputProps> = ({
  label, placeholder, value, onChangeText, onBlur, error, secureTextEntry,
  multiline, numberOfLines, keyboardType = 'default', autoCapitalize = 'sentences',
  editable = true, style, rightIcon, required,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}{required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputWrapper, isFocused && styles.focused, !!error && styles.errorBorder, !editable && styles.disabled]}>
        <TextInput
          style={[styles.input, multiline && { height: 24 * (numberOfLines || 3), textAlignVertical: 'top' }]}
          placeholder={placeholder}
          placeholderTextColor={LightColors.placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => { setIsFocused(false); onBlur?.(); }}
          onFocus={() => setIsFocused(true)}
          secureTextEntry={isSecure}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.eyeButton}>
            <Text style={styles.eyeIcon}>{isSecure ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: LightColors.text, marginBottom: 6 },
  required: { color: LightColors.error },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: LightColors.border, borderRadius: 8,
    backgroundColor: LightColors.surface, paddingHorizontal: 12,
  },
  input: { flex: 1, fontSize: 15, color: LightColors.text, paddingVertical: 12 },
  focused: { borderColor: LightColors.primary },
  errorBorder: { borderColor: LightColors.error },
  disabled: { backgroundColor: LightColors.divider, opacity: 0.7 },
  errorText: { fontSize: 12, color: LightColors.error, marginTop: 4 },
  eyeButton: { padding: 4 },
  eyeIcon: { fontSize: 16 },
  rightIcon: { marginLeft: 8 },
});

export default AppInput;
