import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('splitclean.db');
    await db.execAsync('PRAGMA journal_mode = WAL');
    await db.execAsync('PRAGMA foreign_keys = ON');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();
  for (const sql of CREATE_TABLES_SQL) {
    await database.execAsync(sql);
  }
}
