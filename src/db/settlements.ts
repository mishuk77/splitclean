import * as Crypto from 'expo-crypto';
import { getDatabase } from './database';
import type { Settlement } from '../types';

export async function createSettlement(
  groupId: string,
  fromMember: string,
  toMember: string,
  amount: number
): Promise<string> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();
  const settled_at = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO settlements (id, group_id, from_member, to_member, amount, settled_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, groupId, fromMember, toMember, amount, settled_at]
  );
  return id;
}

export async function getSettlementsByGroup(groupId: string): Promise<Settlement[]> {
  const db = await getDatabase();
  return db.getAllAsync<Settlement>(
    'SELECT * FROM settlements WHERE group_id = ? ORDER BY settled_at DESC',
    [groupId]
  );
}

export async function deleteSettlement(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM settlements WHERE id = ?', [id]);
}
