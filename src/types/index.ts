export type SplitMethod = 'equal' | 'exact' | 'percent' | 'itemized';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface Member {
  id: string;
  group_id: string;
  name: string;
  is_self: boolean;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  created_at: string;
  total_expenses: number;
  members?: Member[];
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
  percent: number | null;
}

export interface ExpenseItem {
  id: string;
  expense_id: string;
  name: string;
  amount: number;
  assigned_to: string[]; // member IDs
}

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string; // member ID
  split_method: SplitMethod;
  category: string;
  created_at: string;
  splits?: ExpenseSplit[];
  items?: ExpenseItem[];
}

export interface Settlement {
  id: string;
  group_id: string;
  from_member: string; // member ID
  to_member: string; // member ID
  amount: number;
  settled_at: string;
}

export interface UserSettings {
  id: number;
  self_name: string;
  default_currency: string;
  theme: ThemeMode;
  sounds_enabled: boolean;
  haptics_enabled: boolean;
  is_pro: boolean;
  unlocked_badges: string[];
  last_monthly_recap_date: string | null;
}

export interface SimplifiedDebt {
  from: string; // member ID
  to: string; // member ID
  amount: number;
}

export interface GroupWithBalance extends Group {
  member_count: number;
  user_balance: number; // positive = owed, negative = owes
  last_activity: string | null;
}

export interface ActivityEntry {
  id: string;
  type: 'expense' | 'settlement';
  group_id: string;
  group_name: string;
  group_emoji: string;
  description: string;
  amount: number;
  actor_name: string;
  created_at: string;
}

export type Badge = 'lightning_split' | 'speed_demon' | 'snap_split';
