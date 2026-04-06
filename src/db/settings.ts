import { getDatabase } from './database';
import type { UserSettings, ThemeMode } from '../types';

export async function initDefaultSettings(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO user_settings (id) VALUES (1)`
  );
}

export async function getSettings(): Promise<UserSettings> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM user_settings WHERE id = 1'
  );
  if (!row) {
    return {
      id: 1,
      self_name: 'You',
      default_currency: 'USD',
      theme: 'system',
      sounds_enabled: false,
      haptics_enabled: true,
      is_pro: false,
      unlocked_badges: [],
      last_monthly_recap_date: null,
    };
  }
  return {
    ...row,
    sounds_enabled: !!row.sounds_enabled,
    haptics_enabled: !!row.haptics_enabled,
    is_pro: !!row.is_pro,
    unlocked_badges: JSON.parse(row.unlocked_badges || '[]'),
    theme: row.theme as ThemeMode,
  };
}

export async function updateSettings(
  updates: Partial<Omit<UserSettings, 'id'>>
): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.self_name !== undefined) { fields.push('self_name = ?'); values.push(updates.self_name); }
  if (updates.default_currency !== undefined) { fields.push('default_currency = ?'); values.push(updates.default_currency); }
  if (updates.theme !== undefined) { fields.push('theme = ?'); values.push(updates.theme); }
  if (updates.sounds_enabled !== undefined) { fields.push('sounds_enabled = ?'); values.push(updates.sounds_enabled ? 1 : 0); }
  if (updates.haptics_enabled !== undefined) { fields.push('haptics_enabled = ?'); values.push(updates.haptics_enabled ? 1 : 0); }
  if (updates.is_pro !== undefined) { fields.push('is_pro = ?'); values.push(updates.is_pro ? 1 : 0); }
  if (updates.unlocked_badges !== undefined) { fields.push('unlocked_badges = ?'); values.push(JSON.stringify(updates.unlocked_badges)); }
  if (updates.last_monthly_recap_date !== undefined) { fields.push('last_monthly_recap_date = ?'); values.push(updates.last_monthly_recap_date); }

  if (fields.length === 0) return;
  values.push(1);
  await db.runAsync(`UPDATE user_settings SET ${fields.join(', ')} WHERE id = ?`, values);
}
