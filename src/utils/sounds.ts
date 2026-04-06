import { Audio } from 'expo-av';
import { useSettingsStore } from '../store/useSettingsStore';

type SoundName = 'expense' | 'settle' | 'allsettled' | 'recap';
const soundCache: Partial<Record<SoundName, Audio.Sound>> = {};

export async function playSound(name: SoundName): Promise<void> {
  const { sounds_enabled } = useSettingsStore.getState().settings;
  if (!sounds_enabled) return;
  try { /* Sound files not yet bundled */ } catch {}
}

export async function unloadSounds(): Promise<void> {
  for (const sound of Object.values(soundCache)) {
    try { await sound?.unloadAsync(); } catch {}
  }
}
