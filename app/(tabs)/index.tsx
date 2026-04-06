import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useGroupStore } from '../../src/store/useGroupStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { Colors } from '../../src/constants/colors';
import { formatCurrency, formatRelativeTime } from '../../src/utils/format';
import { calculateBalances } from '../../src/utils/balances';
import { getExpensesByGroup } from '../../src/db/expenses';
import { getSettlementsByGroup } from '../../src/db/settlements';
import type { Group, Member } from '../../src/types';
import CreateGroupModal from '../../src/components/CreateGroupModal';

interface GroupWithBalance {
  group: Group;
  userBalance: number;
  memberCount: number;
  lastActivity: string | null;
}

export default function GroupsScreen() {
  const router = useRouter();
  const theme = useSettingsStore((s) => s.settings.theme);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
  const colors = isDark ? Colors.dark : Colors.light;

  const groups = useGroupStore((s) => s.groups);
  const loadGroups = useGroupStore((s) => s.loadGroups);
  const [refreshing, setRefreshing] = useState(false);
  const [groupBalances, setGroupBalances] = useState<GroupWithBalance[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [overallBalance, setOverallBalance] = useState(0);

  const loadBalances = useCallback(async () => {
    const results: GroupWithBalance[] = [];
    let totalBalance = 0;

    for (const group of groups) {
      const members = group.members || [];
      const selfMember = members.find((m: Member) => m.is_self);
      const expenses = await getExpensesByGroup(group.id);
      const settlements = await getSettlementsByGroup(group.id);
      const balances = calculateBalances(expenses, settlements, members);
      const userBalance = selfMember ? (balances.get(selfMember.id) || 0) : 0;
      totalBalance += userBalance;

      const lastExpense = expenses.length > 0 ? expenses[0].created_at : null;

      results.push({
        group,
        userBalance,
        memberCount: members.length,
        lastActivity: lastExpense,
      });
    }

    setGroupBalances(results);
    setOverallBalance(totalBalance);
  }, [groups]);

  useFocusEffect(
    useCallback(() => {
      loadBalances();
    }, [loadBalances])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0.01) return colors.positive;
    if (balance < -0.01) return colors.negative;
    return colors.settled;
  };

  const getBalanceText = (balance: number, currency: string = 'USD') => {
    if (balance > 0.01) return `You're owed ${formatCurrency(balance, currency)}`;
    if (balance < -0.01) return `You owe ${formatCurrency(Math.abs(balance), currency)}`;
    return 'All settled up ✓';
  };

  const renderGroupCard = ({ item }: { item: GroupWithBalance }) => (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/group/${item.group.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.groupCardHeader}>
        <Text style={styles.groupEmoji}>{item.group.emoji}</Text>
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: colors.textPrimary }]}>
            {item.group.name}
          </Text>
          <Text style={[styles.groupMeta, { color: colors.textSecondary }]}>
            {item.memberCount} {item.memberCount === 1 ? 'person' : 'people'}
            {item.lastActivity ? ` · ${formatRelativeTime(item.lastActivity)}` : ''}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.groupBalance,
          { color: getBalanceColor(item.userBalance) },
        ]}
      >
        {getBalanceText(item.userBalance)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Overall Balance Banner */}
      <View style={[styles.balanceBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.bannerLabel, { color: colors.textSecondary }]}>
          Overall
        </Text>
        <Text
          style={[
            styles.bannerAmount,
            { color: getBalanceColor(overallBalance) },
          ]}
        >
          {overallBalance > 0.01
            ? `You're owed ${formatCurrency(overallBalance)}`
            : overallBalance < -0.01
            ? `You owe ${formatCurrency(Math.abs(overallBalance))}`
            : 'All settled up ✓'}
        </Text>
      </View>

      {/* Group List */}
      <FlatList
        data={groupBalances}
        keyExtractor={(item) => item.group.id}
        renderItem={renderGroupCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No groups yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create your first group to start splitting expenses
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <FontAwesome name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  bannerLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  bannerAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  groupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
  },
  groupMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  groupBalance: {
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
