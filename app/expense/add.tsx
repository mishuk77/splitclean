import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { useSettingsStore } from '../../src/store/useSettingsStore';
import { Colors } from '../../src/constants/colors';
import { CATEGORY_EMOJIS, DEFAULT_CATEGORY } from '../../src/constants/categories';
import { autoCategory } from '../../src/utils/categories';
import { splitEqual, roundCurrency, distributeRemainder } from '../../src/utils/rounding';
import { formatCurrency } from '../../src/utils/format';
import { getMembersByGroup } from '../../src/db/members';
import { createExpense, getExpenseById } from '../../src/db/expenses';
import { triggerHaptic } from '../../src/utils/haptics';
import { playSound } from '../../src/utils/sounds';
import { markExpenseScreenOpened, checkBadgesAfterExpense, BADGE_INFO } from '../../src/utils/badges';
import type { Member, SplitMethod } from '../../src/types';

const SPLIT_METHODS: { key: SplitMethod; label: string }[] = [
  { key: 'equal', label: 'Equal' },
  { key: 'exact', label: 'Exact' },
  { key: 'percent', label: 'Percent' },
  { key: 'itemized', label: 'Itemized' },
];

export default function AddExpenseScreen() {
  const { groupId, expenseId } = useLocalSearchParams<{ groupId: string; expenseId?: string }>();
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);
  const systemTheme = useColorScheme();
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && systemTheme !== 'light');
  const colors = isDark ? Colors.dark : Colors.light;
  const currency = settings.default_currency;

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [paidBy, setPaidBy] = useState<string>('');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [itemizedSplits, setItemizedSplits] = useState<{ memberId: string; amount: number }[]>([]);
  const [itemizedItems, setItemizedItems] = useState<{ name: string; amount: number; assignedTo: string[] }[]>([]);
  const isEditing = !!expenseId;

  useEffect(() => {
    markExpenseScreenOpened();
  }, []);

  useEffect(() => {
    async function load() {
      if (!groupId) return;
      const loadedMembers = await getMembersByGroup(groupId);
      setMembers(loadedMembers);

      const self = loadedMembers.find((m) => m.is_self);
      if (self) setPaidBy(self.id);

      const allIds = new Set(loadedMembers.map((m) => m.id));
      setSelectedMembers(allIds);

      if (expenseId) {
        const expense = await getExpenseById(expenseId);
        if (expense) {
          setAmount(expense.amount.toString());
          setDescription(expense.description);
          setPaidBy(expense.paid_by);
          setSplitMethod(expense.split_method);
          setCategory(expense.category);
          if (expense.splits) {
            const selected = new Set(expense.splits.map((s) => s.member_id));
            setSelectedMembers(selected);
            if (expense.split_method === 'exact') {
              const ea: Record<string, string> = {};
              expense.splits.forEach((s) => { ea[s.member_id] = s.amount.toString(); });
              setExactAmounts(ea);
            } else if (expense.split_method === 'percent') {
              const pct: Record<string, string> = {};
              expense.splits.forEach((s) => { pct[s.member_id] = (s.percent || 0).toString(); });
              setPercentages(pct);
            }
          }
          if (expense.items) {
            setItemizedItems(expense.items.map((i) => ({
              name: i.name,
              amount: i.amount,
              assignedTo: i.assigned_to,
            })));
          }
        }
      }
    }
    load();
  }, [groupId, expenseId]);

  useEffect(() => {
    if (description) {
      setCategory(autoCategory(description));
    }
  }, [description]);

  const parsedAmount = parseFloat(amount) || 0;
  const selectedMembersList = members.filter((m) => selectedMembers.has(m.id));
  const payerIndex = selectedMembersList.findIndex((m) => m.id === paidBy);

  const toggleMember = (id: string) => {
    const next = new Set(selectedMembers);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMembers(next);
  };

  const getEqualSplitPerPerson = () => {
    if (selectedMembersList.length === 0 || parsedAmount === 0) return 0;
    return roundCurrency(parsedAmount / selectedMembersList.length);
  };

  const getExactTotal = () => {
    return Object.values(exactAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  };

  const getPercentTotal = () => {
    return Object.values(percentages).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  };

  const canSave = () => {
    if (parsedAmount <= 0) return false;
    if (!paidBy) return false;
    if (selectedMembersList.length === 0) return false;

    if (splitMethod === 'exact') {
      return Math.abs(getExactTotal() - parsedAmount) < 0.01;
    }
    if (splitMethod === 'percent') {
      return Math.abs(getPercentTotal() - 100) < 0.01;
    }
    if (splitMethod === 'itemized') {
      return itemizedItems.length > 0;
    }
    return true;
  };

  const handleSave = async () => {
    if (!canSave() || !groupId) return;

    let splits: { memberId: string; amount: number; percent: number | null }[] = [];

    if (splitMethod === 'equal') {
      const amounts = splitEqual(parsedAmount, selectedMembersList.length, Math.max(payerIndex, 0));
      splits = selectedMembersList.map((m, i) => ({
        memberId: m.id,
        amount: amounts[i],
        percent: roundCurrency(100 / selectedMembersList.length),
      }));
    } else if (splitMethod === 'exact') {
      splits = selectedMembersList.map((m) => ({
        memberId: m.id,
        amount: parseFloat(exactAmounts[m.id] || '0'),
        percent: null,
      }));
    } else if (splitMethod === 'percent') {
      const rawAmounts = selectedMembersList.map((m) => {
        const pct = parseFloat(percentages[m.id] || '0');
        return roundCurrency((pct / 100) * parsedAmount);
      });
      const adjusted = distributeRemainder(rawAmounts, parsedAmount, Math.max(payerIndex, 0));
      splits = selectedMembersList.map((m, i) => ({
        memberId: m.id,
        amount: adjusted[i],
        percent: parseFloat(percentages[m.id] || '0'),
      }));
    } else if (splitMethod === 'itemized') {
      // Calculate splits from itemized items
      const memberTotals: Record<string, number> = {};
      for (const item of itemizedItems) {
        const perPerson = roundCurrency(item.amount / item.assignedTo.length);
        for (const memberId of item.assignedTo) {
          memberTotals[memberId] = (memberTotals[memberId] || 0) + perPerson;
        }
      }
      splits = Object.entries(memberTotals).map(([memberId, amt]) => ({
        memberId,
        amount: roundCurrency(amt),
        percent: null,
      }));
    }

    if (isEditing) {
      const { deleteExpense } = await import('../../src/db/expenses');
      await deleteExpense(expenseId!);
    }

    await createExpense({
      groupId,
      description: description || 'Expense',
      amount: parsedAmount,
      currency,
      paidBy,
      splitMethod,
      category,
      splits,
      items: splitMethod === 'itemized' ? itemizedItems : undefined,
    });

    await triggerHaptic('success');
    await playSound('expense');

    // Check for badges
    const badge = await checkBadgesAfterExpense(splitMethod);
    if (badge) {
      const info = BADGE_INFO[badge];
      Alert.alert(`${info.emoji} ${info.name}`, 'You earned a new badge!');
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: isEditing ? 'Edit Expense' : 'Add Expense' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.textPrimary }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Description */}
        <TextInput
          style={[styles.descInput, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder="What's this for?"
          placeholderTextColor={colors.textSecondary}
        />

        {/* Paid By */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PAID BY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {members.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.chip,
                {
                  backgroundColor: paidBy === m.id ? colors.accent : colors.card,
                  borderColor: paidBy === m.id ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setPaidBy(m.id)}
            >
              <Text style={{ color: paidBy === m.id ? '#FFFFFF' : colors.textPrimary, fontWeight: '500' }}>
                {m.is_self ? 'You' : m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Split Method */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SPLIT METHOD</Text>
        <View style={[styles.segmentedControl, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SPLIT_METHODS.map((sm) => (
            <TouchableOpacity
              key={sm.key}
              style={[
                styles.segment,
                splitMethod === sm.key && { backgroundColor: colors.accent },
              ]}
              onPress={() => setSplitMethod(sm.key)}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: splitMethod === sm.key ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                {sm.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Split Among */}
        {splitMethod !== 'itemized' && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SPLIT AMONG</Text>
            {members.map((m) => (
              <View key={m.id} style={[styles.splitRow, { borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: selectedMembers.has(m.id) ? colors.accent : 'transparent',
                      borderColor: selectedMembers.has(m.id) ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => toggleMember(m.id)}
                >
                  {selectedMembers.has(m.id) && (
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>✓</Text>
                  )}
                </TouchableOpacity>
                <Text style={[styles.splitName, { color: colors.textPrimary }]}>
                  {m.is_self ? 'You' : m.name}
                </Text>

                {splitMethod === 'equal' && selectedMembers.has(m.id) && (
                  <Text style={[styles.splitAmount, { color: colors.textSecondary }]}>
                    {formatCurrency(getEqualSplitPerPerson(), currency)}
                  </Text>
                )}

                {splitMethod === 'exact' && selectedMembers.has(m.id) && (
                  <TextInput
                    style={[styles.splitInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
                    value={exactAmounts[m.id] || ''}
                    onChangeText={(v) => setExactAmounts({ ...exactAmounts, [m.id]: v })}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                )}

                {splitMethod === 'percent' && selectedMembers.has(m.id) && (
                  <View style={styles.percentRow}>
                    <TextInput
                      style={[styles.splitInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
                      value={percentages[m.id] || ''}
                      onChangeText={(v) => setPercentages({ ...percentages, [m.id]: v })}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                    />
                    <Text style={[{ color: colors.textSecondary, marginLeft: 4 }]}>%</Text>
                  </View>
                )}
              </View>
            ))}

            {splitMethod === 'exact' && (
              <Text style={[styles.validationText, {
                color: Math.abs(getExactTotal() - parsedAmount) < 0.01 ? colors.positive : colors.negative
              }]}>
                Total: {formatCurrency(getExactTotal(), currency)} of {formatCurrency(parsedAmount, currency)}
              </Text>
            )}

            {splitMethod === 'percent' && (
              <Text style={[styles.validationText, {
                color: Math.abs(getPercentTotal() - 100) < 0.01 ? colors.positive : colors.negative
              }]}>
                Total: {getPercentTotal().toFixed(1)}% of 100%
              </Text>
            )}
          </>
        )}

        {/* Itemized */}
        {splitMethod === 'itemized' && (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>LINE ITEMS</Text>
            {itemizedItems.map((item, idx) => (
              <View key={idx} style={[styles.itemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>
                    {formatCurrency(item.amount, currency)}
                  </Text>
                  <TouchableOpacity onPress={() => setItemizedItems(itemizedItems.filter((_, i) => i !== idx))}>
                    <Text style={{ color: colors.destructive, fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {members.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.miniChip,
                        {
                          backgroundColor: item.assignedTo.includes(m.id) ? colors.accent : colors.inputBackground,
                          borderColor: item.assignedTo.includes(m.id) ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => {
                        const updated = [...itemizedItems];
                        const current = updated[idx].assignedTo;
                        if (current.includes(m.id)) {
                          if (current.length > 1) {
                            updated[idx] = { ...updated[idx], assignedTo: current.filter((id) => id !== m.id) };
                          }
                        } else {
                          updated[idx] = { ...updated[idx], assignedTo: [...current, m.id] };
                        }
                        setItemizedItems(updated);
                      }}
                    >
                      <Text style={{ color: item.assignedTo.includes(m.id) ? '#FFFFFF' : colors.textPrimary, fontSize: 12 }}>
                        {m.is_self ? 'You' : m.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}

            <AddItemRow
              colors={colors}
              members={members}
              onAdd={(item) => setItemizedItems([...itemizedItems, item])}
            />

            {itemizedItems.length > 0 && (
              <Text style={[styles.validationText, {
                color: Math.abs(itemizedItems.reduce((s, i) => s + i.amount, 0) - parsedAmount) < 0.01
                  ? colors.positive : colors.negative
              }]}>
                Items total: {formatCurrency(itemizedItems.reduce((s, i) => s + i.amount, 0), currency)} of {formatCurrency(parsedAmount, currency)}
              </Text>
            )}
          </View>
        )}

        {/* Category */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CATEGORY_EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: category === e ? colors.accent + '30' : colors.card,
                  borderColor: category === e ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setCategory(e)}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: canSave() ? colors.accent : colors.border }]}
          onPress={handleSave}
          disabled={!canSave()}
        >
          <Text style={[styles.saveButtonText, { color: canSave() ? '#FFFFFF' : colors.textSecondary }]}>
            {isEditing ? 'Update Expense' : 'Save Expense'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AddItemRow({
  colors,
  members,
  onAdd,
}: {
  colors: any;
  members: Member[];
  onAdd: (item: { name: string; amount: number; assignedTo: string[] }) => void;
}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    const parsedAmt = parseFloat(amount);
    if (!name.trim() || !parsedAmt || parsedAmt <= 0) return;
    onAdd({
      name: name.trim(),
      amount: parsedAmt,
      assignedTo: members.map((m) => m.id),
    });
    setName('');
    setAmount('');
  };

  return (
    <View style={[addItemStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={addItemStyles.row}>
        <TextInput
          style={[addItemStyles.nameInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
          value={name}
          onChangeText={setName}
          placeholder="Item name"
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          style={[addItemStyles.amountInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
        />
        <TouchableOpacity
          style={[addItemStyles.addBtn, { backgroundColor: colors.accent }]}
          onPress={handleAdd}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const addItemStyles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  amountInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    minWidth: 100,
    textAlign: 'center',
  },
  descInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  chipScroll: {
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  splitName: {
    flex: 1,
    fontSize: 16,
  },
  splitAmount: {
    fontSize: 15,
  },
  splitInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'right',
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
  categoryChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  itemRow: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
