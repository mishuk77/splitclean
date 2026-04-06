import { create } from 'zustand';
import type { UserSettings } from '../types';
import * as settingsDb from '../db/settings';

interface SettingsState {
  settings: UserSettings;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Omit<UserSettings, 'id'>>) => Promise<void>;
}

const defaultSettings: UserSettings = {
  id: 1, self_name: 'You', default_currency: 'USD', theme: 'system',
  sounds_enabled: false, haptics_enabled: true, is_pro: false,
  unlocked_badges: [], last_monthly_recap_date: null,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoaded: false,
  loadSettings: async () => {
    await settingsDb.initDefaultSettings();
    const settings = await settingsDb.getSettings();
    set({ settings, isLoaded: true });
  },
  updateSettings: async (updates) => {
    await settingsDb.updateSettings(updates);
    set({ settings: { ...get().settings, ...updates } });
  },
}));
