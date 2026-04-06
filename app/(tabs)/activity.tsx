import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useGroupStore } from '../../src/store/useGroupStore';
import { Colors } from '../../src/constants/colors';
import { formatCurrency, formatRelativeTime } from '../../src/utils/format';
import { getExpensesByGroup } from '../../src/db/expenses';
import { getSettlementsByGroup } from '../../src/db/settlements';
import { getMembersByGroup } from '../../src/db/members';
import type { ActivityEntry } from '../../src/types';

export default function ActivityScreen() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
  const colors = isDark ? Colors.dark : Colors.light;
  const groups = useGroupStore((s) => s.groups);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const allActivities: ActivityEntry[] = [];

        for (const group of groups) {
          const members = await getMembersByGroup(group.id);
          const memberMap = new Map(members.map((m) => [m.id, m.name]));

          const expenses = await getExpensesByGroup(group.id);
          for (const expense of expenses) {
            allActivities.push({
              id: expense.id,
              type: 'expense',
              group_id: group.id,
              group_name: group.name,
              group_emoji: group.emoji,
              description: `added ${formatCurrency(expense.amount)} "${expense.description || 'Expense'}"`,
              amount: expense.amount,
              actor_name: memberMap.get(expense.paid_by) || 'Someone',
              created_at: expense.created_at,
            });
          }

          const settlements = await getSettlementsByGroup(group.id);
          for (const s of settlements) {
            allActivities.push({
              id: s.id,
              type: 'settlement',
              group_id: group.id,
              group_name: group.name,
              group_emoji: group.emoji,
              description: `settled ${formatCurrency(s.amount)} with ${memberMap.get(s.to_member) || 'Someone'}`,
              amount: s.amount,
              actor_name: memberMap.get(s.from_member) || 'Someone',
              created_at: s.settled_at,
            });
          }
        }

        allActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setActivities(allActivities);
      }
      load();
    }, [groups])
  );

  const renderActivity = ({ item }: { item: ActivityEntry }) => (
    <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.activityText, { color: colors.textPrimary }]}>
        <Text style={{ fontWeight: '600' }}>{item.actor_name}</Text>
        {' '}{item.description}{' in '}
        <Text>{item.group_emoji} {item.group_name}</Text>
      </Text>
      <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
        {formatRelativeTime(item.created_at)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No activity yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Expenses and settlements will show up here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  activityCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  activityText: { fontSize: 15, lineHeight: 22 },
  activityTime: { fontSize: 12, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', paddingHorizontal: 40 },
});
