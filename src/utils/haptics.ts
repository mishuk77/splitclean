import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/useSettingsStore';

export async function triggerHaptic(type: 'light' | 'medium' | 'success' | 'error' = 'light'): Promise<void> {
  const { haptics_enabled } = useSettingsStore.getState().settings;
  if (!haptics_enabled) return;
  try {
    switch (type) {
      case 'light': await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
      case 'medium': await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
      case 'success': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      case 'error': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
    }
  } catch {}
}
