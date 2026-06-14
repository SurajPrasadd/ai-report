import { TextStyle } from 'react-native';

export const Typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 } as TextStyle,
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 36 } as TextStyle,
  h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 } as TextStyle,
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 } as TextStyle,
  h5: { fontSize: 18, fontWeight: '600', lineHeight: 26 } as TextStyle,
  h6: { fontSize: 16, fontWeight: '600', lineHeight: 24 } as TextStyle,
  subtitle1: { fontSize: 16, fontWeight: '500', lineHeight: 24 } as TextStyle,
  subtitle2: { fontSize: 14, fontWeight: '500', lineHeight: 22 } as TextStyle,
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 } as TextStyle,
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 22 } as TextStyle,
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 18 } as TextStyle,
  overline: { fontSize: 10, fontWeight: '400', letterSpacing: 1.5, textTransform: 'uppercase' } as TextStyle,
  button: { fontSize: 14, fontWeight: '600', letterSpacing: 0.5 } as TextStyle,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Elevation = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
};
