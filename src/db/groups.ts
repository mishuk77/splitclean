import * as Crypto from 'expo-crypto';
import { getDatabase } from './database';
import type { Group } from '../types';

export async function createGroup(name: string, emoji: string): Promise<string> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();
  const created_at = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO groups (id, name, emoji, created_at, total_expenses) VALUES (?, ?, ?, ?, 0)',
    [id, name, emoji, created_at]
  );
  return id;
}

export async function getGroups(): Promise<Group[]> {
  const db = await getDatabase();
  return db.getAllAsync<Group>('SELECT * FROM groups ORDER BY created_at DESC');
}

export async function getGroupById(id: string): Promise<Group | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Group>('SELECT * FROM groups WHERE id = ?', [id]);
}

export async function updateGroup(id: string, name: string, emoji: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE groups SET name = ?, emoji = ? WHERE id = ?', [name, emoji, id]);
}

export async function updateGroupTotal(id: string, amount: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE groups SET total_expenses = total_expenses + ? WHERE id = ?',
    [amount, id]
  );
}

export async function deleteGroup(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM groups WHERE id = ?', [id]);
}
