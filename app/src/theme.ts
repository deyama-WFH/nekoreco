import { DefaultTheme } from '@react-navigation/native';

export const colors = {
  background: '#FFF9F2',
  surface: '#FFFFFF',
  primary: '#E97862',
  primaryDark: '#B94F3F',
  secondary: '#F5C96A',
  text: '#342A27',
  muted: '#786C67',
  border: '#EADFD8',
  success: '#4F936E',
  warning: '#C9782B',
  danger: '#B94C4C',
  tint: '#FDE9E2',
};

export const theme = {
  colors,
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 14, lg: 22, pill: 999 },
  navigation: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  },
};
