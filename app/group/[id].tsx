import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useGroupStore } from '../../src/store/useGroupStore';
import { Colors } from '../../src/constants/colors';
import { formatCurrency, formatDate, formatRelativeTime } from '../../src/utils/format';
import { calculateBalances, simplifyDebts } from '../../src/utils/balances';
import { getExpensesByGroup, deleteExpense as deleteExpenseDb } from '../../src/db/expenses';
import { getSettlementsByGroup } from '../../src/db/settlements';
import { getMembersByGroup } from '../../src/db/members';
import { createSettlement } from '../../src/db/settlements';
import type { Expense, Member, SimplifiedDebt } from '../../src/types';
import SettleAnimation from '../../src/components/SettleAnimation';
import { triggerHaptic } from '../../src/utils/haptics';
import { playSound } from '../../src/utils/sounds';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useSettingsStore((s) => s.settings.theme);
  const currency = useSettingsStore((s) => s.settings.default_currency);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
  const colors = isDark ? Colors.dark : Colors.light;
  const groups = useGroupStore((s) => s.groups);
  const deleteGroup = useGroupStore((s) => s.deleteGroup);

  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [debts, setDebts] = useState<SimplifiedDebt[]>([]);
  const [balanceMap, setBalanceMap] = useState<Map<string, number>>(new Map());
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showSettleAnim, setShowSettleAnim] = useState(false);
  const [allSettled, setAllSettled] = useState(false);

  const group = groups.find((g) => g.id === id);
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const loadData = useCallback(async () => {
    if (!id) return;
    const [loadedMembers, loadedExpenses, loadedSettlements] = await Promise.all([
      getMembersByGroup(id),
      getExpensesByGroup(id),
      getSettlementsByGroup(id),
    ]);
    setMembers(loadedMembers);
    setExpenses(loadedExpenses);

    const balances = calculateBalances(loadedExpenses, loadedSettlements, loadedMembers);
    setBalanceMap(balances);
    setDebts(simplifyDebts(balances));

    const total = loadedExpenses.reduce((sum, e) => sum + e.amount, 0);
    setTotalExpenses(total);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSettleUp = (debt: SimplifiedDebt) => {
    Alert.alert(
      'Settle Up',
      `Mark ${getMemberName(debt.from)} paid ${formatCurrency(debt.amount, currency)} to ${getMemberName(debt.to)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settle',
          onPress: async () => {
            await createSettlement(id!, debt.from, debt.to, debt.amount);
            await triggerHaptic('success');
            await playSound('settle');
            await loadData();
            // Check if all debts are now settled
            const newSettlements = await getSettlementsByGroup(id!);
            const newExpenses = await getExpensesByGroup(id!);
            const newMembers = await getMembersByGroup(id!);
            const newBalances = calculateBalances(newExpenses, newSettlements, newMembers);
            const newDebts = simplifyDebts(newBalances);
            const isAllSettled = newDebts.length === 0 && newExpenses.length > 0;
            setAllSettled(isAllSettled);
            setShowSettleAnim(true);
            if (isAllSettled) {
              await playSound('allsettled');
            }
          },
        },
      ]
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExpenseDb(expenseId);
          await loadData();
        },
      },
    ]);
  };

  const handleDeleteGroup = () => {
    Alert.alert('Delete Group', 'This will delete all expenses and settlements in this group.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGroup(id!);
          router.back();
        },
      },
    ]);
  };

  const getMemberName = (memberId: string) => {
    const member = memberMap.get(memberId);
    if (!member) return 'Unknown';
    return member.is_self ? 'You' : member.name;
  };

  const getSplitSummary = (expense: Expense) => {
    const splitCount = expense.splits?.length || 0;
    if (expense.split_method === 'equal') return `Split equally between ${splitCount}`;
    if (expense.split_method === 'itemized') return `Itemized between ${splitCount}`;
    if (expense.split_method === 'percent') return `Split by % between ${splitCount}`;
    return `Split between ${splitCount}`;
  };

  const renderExpense = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onLongPress={() => handleDeleteExpense(item.id)}
      onPress={() => router.push(`/expense/add?groupId=${id}&expenseId=${item.id}`)}
    >
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseCategory}>{item.category}</Text>
        <View style={styles.expenseInfo}>
          <Text style={[styles.expenseDesc, { color: colors.textPrimary }]}>
            {item.description || 'Expense'}
          </Text>
          <Text style={[styles.expenseMeta, { color: colors.textSecondary }]}>
            Paid by {getMemberName(item.paid_by)} · {getSplitSummary(item)}
          </Text>
        </View>
        <Text style={[styles.expenseAmount, { color: colors.textPrimary }]}>
          {formatCurrency(item.amount, currency)}
        </Text>
      </View>
      <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>
        {formatDate(item.created_at)}
      </Text>
    </TouchableOpacity>
  );

  const renderDebt = ({ item }: { item: SimplifiedDebt }) => (
    <View style={[styles.debtCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.debtInfo}>
        <Text style={[styles.debtText, { color: colors.textPrimary }]}>
          <Text style={{ fontWeight: '600' }}>{getMemberName(item.from)}</Text>
          {' owes '}
          <Text style={{ fontWeight: '600' }}>{getMemberName(item.to)}</Text>
        </Text>
        <Text style={[styles.debtAmount, { color: colors.negative }]}>
          {formatCurrency(item.amount, currency)}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.settleButton, { backgroundColor: colors.accent }]}
        onPress={() => handleSettleUp(item)}
      >
        <Text style={styles.settleButtonText}>Settle up</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBalanceBar = (memberId: string) => {
    const balance = balanceMap.get(memberId) || 0;
    const maxBalance = Math.max(...Array.from(balanceMap.values()).map(Math.abs), 1);
    const width = Math.abs(balance) / maxBalance * 100;
    const barColor = balance > 0.01 ? colors.positive : balance < -0.01 ? colors.negative : colors.settled;

    return (
      <View key={memberId} style={styles.balanceBarRow}>
        <Text style={[styles.balanceBarName, { color: colors.textPrimary }]}>
          {getMemberName(memberId)}
        </Text>
        <View style={[styles.balanceBarTrack, { backgroundColor: colors.inputBackground }]}>
          <View style={[styles.balanceBarFill, { width: `${width}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={[styles.balanceBarAmount, { color: barColor }]}>
          {balance > 0 ? '+' : ''}{formatCurrency(balance, currency)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: group ? `${group.emoji} ${group.name}` : 'Group',
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteGroup} style={{ padding: 8 }}>
              <FontAwesome name="trash-o" size={20} color={colors.destructive} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tab Switcher */}
      <View style={[styles.tabRow, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'expenses' ? colors.accent : colors.textSecondary }]}>
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'balances' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('balances')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'balances' ? colors.accent : colors.textSecondary }]}>
            Balances
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'expenses' ? (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpense}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No expenses yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Add your first expense to get started
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={debts}
          keyExtractor={(item) => `${item.from}-${item.to}`}
          renderItem={renderDebt}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={[styles.totalTracker, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                  This group has tracked
                </Text>
                <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
                  {formatCurrency(totalExpenses, currency)}
                </Text>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                  in shared expenses
                </Text>
              </View>

              {/* Balance Bars */}
              <View style={[styles.balanceBarsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {members.map((m) => renderBalanceBar(m.id))}
              </View>

              {debts.length > 0 && (
                <Text style={[styles.debtsHeader, { color: colors.textSecondary }]}>
                  SETTLEMENTS NEEDED
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.settledState}>
              <Text style={styles.settledEmoji}>✅</Text>
              <Text style={[styles.settledText, { color: colors.settled }]}>All settled up!</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => router.push(`/expense/add?groupId=${id}`)}
        activeOpacity={0.8}
      >
        <FontAwesome name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Settle Animation */}
      <SettleAnimation
        visible={showSettleAnim}
        allSettled={allSettled}
        groupEmoji={group?.emoji}
        onComplete={() => setShowSettleAnim(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  expenseCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseCategory: {
    fontSize: 28,
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDesc: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  expenseDate: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 42,
  },
  debtCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  debtInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  debtText: {
    fontSize: 15,
    flex: 1,
  },
  debtAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  settleButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  settleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  totalTracker: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 13,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 4,
  },
  balanceBarsCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  balanceBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  balanceBarName: {
    width: 60,
    fontSize: 13,
    fontWeight: '500',
  },
  balanceBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  balanceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  balanceBarAmount: {
    width: 70,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  debtsHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  settledState: {
    alignItems: 'center',
    paddingTop: 20,
  },
  settledEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  settledText: {
    fontSize: 18,
    fontWeight: '600',
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
});
