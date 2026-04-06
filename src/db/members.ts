import * as Crypto from 'expo-crypto';
import { getDatabase } from './database';
import type { Member } from '../types';

export async function addMember(groupId: string, name: string, isSelf: boolean): Promise<string> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();
  await db.runAsync(
    'INSERT INTO members (id, group_id, name, is_self) VALUES (?, ?, ?, ?)',
    [id, groupId, name, isSelf ? 1 : 0]
  );
  return id;
}

export async function getMembersByGroup(groupId: string): Promise<Member[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM members WHERE group_id = ? ORDER BY is_self DESC, name ASC',
    [groupId]
  );
  return rows.map((r) => ({ ...r, is_self: !!r.is_self }));
}

export async function updateMember(id: string, name: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE members SET name = ? WHERE id = ?', [name, id]);
}

export async function deleteMember(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM members WHERE id = ?', [id]);
}

export async function getSelfMember(groupId: string): Promise<Member | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM members WHERE group_id = ? AND is_self = 1',
    [groupId]
  );
  return row ? { ...row, is_self: true } : null;
}
