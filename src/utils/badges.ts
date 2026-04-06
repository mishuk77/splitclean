import { useSettingsStore } from '../store/useSettingsStore';
import type { Badge, SplitMethod } from '../types';

let lastExpenseScreenOpenTime: number | null = null;
let todayExpenseCount = 0;
let lastExpenseDate = '';

export function markExpenseScreenOpened(): void {
  lastExpenseScreenOpenTime = Date.now();
}

export async function checkBadgesAfterExpense(splitMethod: SplitMethod): Promise<Badge | null> {
  const store = useSettingsStore.getState();
  const { unlocked_badges } = store.settings;
  const today = new Date().toISOString().split('T')[0];
  if (lastExpenseDate !== today) { todayExpenseCount = 0; lastExpenseDate = today; }
  todayExpenseCount++;

  if (lastExpenseScreenOpenTime && !unlocked_badges.includes('lightning_split')) {
    if (Date.now() - lastExpenseScreenOpenTime < 3000) {
      await store.updateSettings({ unlocked_badges: [...unlocked_badges, 'lightning_split'] });
      return 'lightning_split';
    }
  }
  if (todayExpenseCount >= 5 && !unlocked_badges.includes('speed_demon')) {
    const current = useSettingsStore.getState().settings.unlocked_badges;
    await store.updateSettings({ unlocked_badges: [...current, 'speed_demon'] });
    return 'speed_demon';
  }
  if (splitMethod === 'itemized' && !unlocked_badges.includes('snap_split')) {
    const current = useSettingsStore.getState().settings.unlocked_badges;
    await store.updateSettings({ unlocked_badges: [...current, 'snap_split'] });
    return 'snap_split';
  }
  return null;
}

export const BADGE_INFO: Record<Badge, { emoji: string; name: string }> = {
  lightning_split: { emoji: '⚡', name: 'Lightning Split' },
  speed_demon: { emoji: '🏃', name: 'Speed Demon' },
  snap_split: { emoji: '📸', name: 'Snap Split' },
};
