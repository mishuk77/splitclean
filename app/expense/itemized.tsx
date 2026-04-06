import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { Colors } from '../../src/constants/colors';

export default function ItemizedSplitScreen() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Itemized split is handled inline on the Add Expense screen.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 15, textAlign: 'center' },
});
