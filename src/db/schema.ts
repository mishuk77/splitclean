export const CREATE_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '📝',
    created_at TEXT NOT NULL,
    total_expenses REAL NOT NULL DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY NOT NULL,
    group_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_self INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY NOT NULL,
    group_id TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    paid_by TEXT NOT NULL,
    split_method TEXT NOT NULL DEFAULT 'equal',
    category TEXT NOT NULL DEFAULT '📝',
    created_at TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES members(id)
  )`,

  `CREATE TABLE IF NOT EXISTS expense_splits (
    id TEXT PRIMARY KEY NOT NULL,
    expense_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    amount REAL NOT NULL,
    percent REAL,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id)
  )`,

  `CREATE TABLE IF NOT EXISTS expense_items (
    id TEXT PRIMARY KEY NOT NULL,
    expense_id TEXT NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS expense_item_assignments (
    id TEXT PRIMARY KEY NOT NULL,
    item_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES expense_items(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id)
  )`,

  `CREATE TABLE IF NOT EXISTS settlements (
    id TEXT PRIMARY KEY NOT NULL,
    group_id TEXT NOT NULL,
    from_member TEXT NOT NULL,
    to_member TEXT NOT NULL,
    amount REAL NOT NULL,
    settled_at TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (from_member) REFERENCES members(id),
    FOREIGN KEY (to_member) REFERENCES members(id)
  )`,

  `CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    self_name TEXT NOT NULL DEFAULT 'You',
    default_currency TEXT NOT NULL DEFAULT 'USD',
    theme TEXT NOT NULL DEFAULT 'system',
    sounds_enabled INTEGER NOT NULL DEFAULT 0,
    haptics_enabled INTEGER NOT NULL DEFAULT 1,
    is_pro INTEGER NOT NULL DEFAULT 0,
    unlocked_badges TEXT NOT NULL DEFAULT '[]',
    last_monthly_recap_date TEXT
  )`,
];
