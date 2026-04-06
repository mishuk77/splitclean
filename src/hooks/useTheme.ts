import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { Colors, ThemeColors } from '../constants/colors';

export function useTheme(): { isDark: boolean; colors: ThemeColors } {
  const theme = useSettingsStore((s) => s.settings.theme);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
  return { isDark, colors: isDark ? Colors.dark : Colors.light };
}
