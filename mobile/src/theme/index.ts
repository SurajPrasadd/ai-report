import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { LightColors, DarkColors } from './colors';
import { Typography, Spacing, BorderRadius, Elevation } from './typography';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: LightColors.primary,
    secondary: LightColors.secondary,
    background: LightColors.background,
    surface: LightColors.surface,
    error: LightColors.error,
    onSurface: LightColors.text,
    outline: LightColors.border,
  },
  custom: LightColors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  elevation: Elevation,
  dark: false,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: DarkColors.primary,
    secondary: DarkColors.secondary,
    background: DarkColors.background,
    surface: DarkColors.surface,
    error: DarkColors.error,
    onSurface: DarkColors.text,
    outline: DarkColors.border,
  },
  custom: DarkColors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  elevation: Elevation,
  dark: true,
};

export type AppTheme = typeof lightTheme;
export { Typography, Spacing, BorderRadius, Elevation };
