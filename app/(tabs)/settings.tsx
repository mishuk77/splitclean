import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useGroupStore } from '../../src/store/useGroupStore';
import { Colors } from '../../src/constants/colors';
import { CURRENCIES } from '../../src/constants/currencies';
import { initDatabase, getDatabase } from '../../src/db/database';
import type { ThemeMode } from '../../src/types';

export default function SettingsScreen() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const loadGroups = useGroupStore((s) => s.loadGroups);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
  const colors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [nameInput, setNameInput] = useState(settings.self_name);

  const handleNameBlur = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== settings.self_name) {
      updateSettings({ self_name: trimmed });
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    updateSettings({ theme: newTheme });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your groups, expenses, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            const db = await getDatabase();
            await db.execAsync('DELETE FROM expense_item_assignments');
            await db.execAsync('DELETE FROM expense_items');
            await db.execAsync('DELETE FROM expense_splits');
            await db.execAsync('DELETE FROM expenses');
            await db.execAsync('DELETE FROM settlements');
            await db.execAsync('DELETE FROM members');
            await db.execAsync('DELETE FROM groups');
            await db.execAsync('DELETE FROM user_settings');
            await initDatabase();
            await useSettingsStore.getState().loadSettings();
            await loadGroups();
            setNameInput('You');
          },
        },
      ]
    );
  };

  const ThemeButton = ({ mode, label }: { mode: ThemeMode; label: string }) => (
    <TouchableOpacity
      style={[
        styles.themeButton,
        {
          backgroundColor: settings.theme === mode ? colors.accent : colors.inputBackground,
          borderColor: settings.theme === mode ? colors.accent : colors.border,
        },
      ]}
      onPress={() => handleThemeChange(mode)}
    >
      <Text
        style={[
          styles.themeButtonText,
          { color: settings.theme === mode ? '#FFFFFF' : colors.textPrimary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Your Name */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>YOUR NAME</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.textInput, { color: colors.textPrimary }]}
          value={nameInput}
          onChangeText={setNameInput}
          onBlur={handleNameBlur}
          placeholder="Enter your name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Currency */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DEFAULT CURRENCY</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CURRENCIES.slice(0, 8).map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[
                styles.currencyChip,
                {
                  backgroundColor: settings.default_currency === c.code ? colors.accent : colors.inputBackground,
                  borderColor: settings.default_currency === c.code ? colors.accent : colors.border,
                },
              ]}
              onPress={() => updateSettings({ default_currency: c.code })}
            >
              <Text
                style={{
                  color: settings.default_currency === c.code ? '#FFFFFF' : colors.textPrimary,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                {c.symbol} {c.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.themeRow}>
          <ThemeButton mode="dark" label="Dark" />
          <ThemeButton mode="light" label="Light" />
          <ThemeButton mode="system" label="System" />
        </View>
      </View>

      {/* Sound & Haptics */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SOUND & HAPTICS</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Sound effects</Text>
          <Switch
            value={settings.sounds_enabled}
            onValueChange={(v) => updateSettings({ sounds_enabled: v })}
            trackColor={{ true: colors.accent }}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Haptic feedback</Text>
          <Switch
            value={settings.haptics_enabled}
            onValueChange={(v) => updateSettings({ haptics_enabled: v })}
            trackColor={{ true: colors.accent }}
          />
        </View>
      </View>

      {/* Data */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.actionRow} onPress={handleClearData}>
          <Text style={[styles.actionText, { color: colors.destructive }]}>
            Clear all data
          </Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.aboutText, { color: colors.textPrimary }]}>
          SplitClean v1.0.0
        </Text>
        <Text style={[styles.aboutTagline, { color: colors.textSecondary }]}>
          Split expenses. Not hairs.
        </Text>
        <Text style={[styles.aboutMotto, { color: colors.accent }]}>
          No subscriptions. No BS. Ever.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  textInput: {
    fontSize: 16,
    padding: 0,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  currencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  actionRow: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboutTagline: {
    fontSize: 14,
    marginTop: 4,
  },
  aboutMotto: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});
