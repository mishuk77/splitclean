import * as Crypto from 'expo-crypto';
import { getDatabase } from './database';
import type { Expense, ExpenseSplit, ExpenseItem, SplitMethod } from '../types';

interface CreateExpenseParams {
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitMethod: SplitMethod;
  category: string;
  splits: { memberId: string; amount: number; percent: number | null }[];
  items?: { name: string; amount: number; assignedTo: string[] }[];
}

export async function createExpense(params: CreateExpenseParams): Promise<string> {
  const db = await getDatabase();
  const expenseId = Crypto.randomUUID();
  const created_at = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO expenses (id, group_id, description, amount, currency, paid_by, split_method, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [expenseId, params.groupId, params.description, params.amount, params.currency, params.paidBy, params.splitMethod, params.category, created_at]
    );

    for (const split of params.splits) {
      const splitId = Crypto.randomUUID();
      await db.runAsync(
        'INSERT INTO expense_splits (id, expense_id, member_id, amount, percent) VALUES (?, ?, ?, ?, ?)',
        [splitId, expenseId, split.memberId, split.amount, split.percent]
      );
    }

    if (params.items) {
      for (const item of params.items) {
        const itemId = Crypto.randomUUID();
        await db.runAsync(
          'INSERT INTO expense_items (id, expense_id, name, amount) VALUES (?, ?, ?, ?)',
          [itemId, expenseId, item.name, item.amount]
        );
        for (const memberId of item.assignedTo) {
          const assignmentId = Crypto.randomUUID();
          await db.runAsync(
            'INSERT INTO expense_item_assignments (id, item_id, member_id) VALUES (?, ?, ?)',
            [assignmentId, itemId, memberId]
          );
        }
      }
    }

    await db.runAsync(
      'UPDATE groups SET total_expenses = total_expenses + ? WHERE id = ?',
      [params.amount, params.groupId]
    );
  });

  return expenseId;
}

export async function getExpensesByGroup(groupId: string): Promise<Expense[]> {
  const db = await getDatabase();
  const expenses = await db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE group_id = ? ORDER BY created_at DESC',
    [groupId]
  );

  for (const expense of expenses) {
    expense.splits = await db.getAllAsync<ExpenseSplit>(
      'SELECT * FROM expense_splits WHERE expense_id = ?',
      [expense.id]
    );

    if (expense.split_method === 'itemized') {
      const items = await db.getAllAsync<any>(
        'SELECT * FROM expense_items WHERE expense_id = ?',
        [expense.id]
      );
      expense.items = [];
      for (const item of items) {
        const assignments = await db.getAllAsync<{ member_id: string }>(
          'SELECT member_id FROM expense_item_assignments WHERE item_id = ?',
          [item.id]
        );
        expense.items.push({
          ...item,
          assigned_to: assignments.map((a) => a.member_id),
        });
      }
    }
  }

  return expenses;
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const db = await getDatabase();
  const expense = await db.getFirstAsync<Expense>(
    'SELECT * FROM expenses WHERE id = ?',
    [id]
  );
  if (!expense) return null;

  expense.splits = await db.getAllAsync<ExpenseSplit>(
    'SELECT * FROM expense_splits WHERE expense_id = ?',
    [expense.id]
  );

  if (expense.split_method === 'itemized') {
    const items = await db.getAllAsync<any>(
      'SELECT * FROM expense_items WHERE expense_id = ?',
      [expense.id]
    );
    expense.items = [];
    for (const item of items) {
      const assignments = await db.getAllAsync<{ member_id: string }>(
        'SELECT member_id FROM expense_item_assignments WHERE item_id = ?',
        [item.id]
      );
      expense.items.push({
        ...item,
        assigned_to: assignments.map((a) => a.member_id),
      });
    }
  }

  return expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDatabase();
  const expense = await db.getFirstAsync<{ amount: number; group_id: string }>(
    'SELECT amount, group_id FROM expenses WHERE id = ?',
    [id]
  );
  if (!expense) return;

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
    await db.runAsync(
      'UPDATE groups SET total_expenses = total_expenses - ? WHERE id = ?',
      [expense.amount, expense.group_id]
    );
  });
}
