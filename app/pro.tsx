import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { Colors } from '../src/constants/colors';

export default function ProScreen() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
  const colors = isDark ? Colors.dark : Colors.light;

  const features = [
    'Remove ads',
    'CSV/PDF export',
    'Multi-currency in groups',
    'Recurring expenses',
    'Custom category emojis',
    'Monthly recap cards',
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>SplitClean Pro</Text>
      <Text style={[styles.price, { color: colors.accent }]}>$3.99 one-time</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>No subscription. Ever.</Text>

      <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={{ color: colors.positive, marginRight: 8 }}>✓</Text>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>{f}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.buyButton, { backgroundColor: colors.accent }]}
        onPress={() => Alert.alert('Coming Soon', 'In-app purchases will be available soon!')}
      >
        <Text style={styles.buyButtonText}>Unlock Pro — $3.99</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginTop: 20 },
  price: { fontSize: 22, fontWeight: '700', marginTop: 8 },
  subtitle: { fontSize: 15, marginTop: 4, marginBottom: 24 },
  featuresCard: { width: '100%', borderRadius: 12, borderWidth: 1, padding: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  featureText: { fontSize: 16 },
  buyButton: { borderRadius: 12, paddingVertical: 16, paddingHorizontal: 40, marginTop: 24 },
  buyButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
