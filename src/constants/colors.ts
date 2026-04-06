export const Colors = {
  dark: {
    background: '#0A0A0F', card: '#1A1A24', accent: '#6366F1', accentLight: '#818CF8',
    positive: '#22C55E', negative: '#F59E0B', settled: '#64748B',
    textPrimary: '#F8FAFC', textSecondary: '#94A3B8', border: '#2A2A3A',
    tabBar: '#1A1A24', tabBarInactive: '#64748B', inputBackground: '#1A1A24',
    destructive: '#EF4444', overlay: 'rgba(0, 0, 0, 0.6)',
  },
  light: {
    background: '#FAFBFC', card: '#FFFFFF', accent: '#4F46E5', accentLight: '#6366F1',
    positive: '#16A34A', negative: '#D97706', settled: '#64748B',
    textPrimary: '#0F172A', textSecondary: '#64748B', border: '#E2E8F0',
    tabBar: '#FFFFFF', tabBarInactive: '#94A3B8', inputBackground: '#F1F5F9',
    destructive: '#DC2626', overlay: 'rgba(0, 0, 0, 0.4)',
  },
};

export type ThemeColors = typeof Colors.dark;
