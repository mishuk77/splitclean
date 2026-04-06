import { roundCurrency } from './rounding';
import type { Expense, Settlement, Member, SimplifiedDebt } from '../types';

const EPSILON = 0.01;

export function calculateBalances(expenses: Expense[], settlements: Settlement[], members: Member[]): Map<string, number> {
  const balances = new Map<string, number>();
  for (const member of members) { balances.set(member.id, 0); }

  for (const expense of expenses) {
    const payer = expense.paid_by;
    if (!expense.splits) continue;
    for (const split of expense.splits) {
      if (split.member_id === payer) continue;
      balances.set(split.member_id, roundCurrency((balances.get(split.member_id) || 0) - split.amount));
      balances.set(payer, roundCurrency((balances.get(payer) || 0) + split.amount));
    }
  }

  for (const settlement of settlements) {
    balances.set(settlement.from_member, roundCurrency((balances.get(settlement.from_member) || 0) + settlement.amount));
    balances.set(settlement.to_member, roundCurrency((balances.get(settlement.to_member) || 0) - settlement.amount));
  }

  return balances;
}

export function simplifyDebts(balances: Map<string, number>): SimplifiedDebt[] {
  const debtors: { memberId: string; amount: number }[] = [];
  const creditors: { memberId: string; amount: number }[] = [];

  for (const [memberId, amount] of balances) {
    if (amount < -EPSILON) debtors.push({ memberId, amount: Math.abs(amount) });
    else if (amount > EPSILON) creditors.push({ memberId, amount });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: SimplifiedDebt[] = [];
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const settleAmount = roundCurrency(Math.min(debtor.amount, creditor.amount));
    transactions.push({ from: debtor.memberId, to: creditor.memberId, amount: settleAmount });
    debtor.amount = roundCurrency(debtor.amount - settleAmount);
    creditor.amount = roundCurrency(creditor.amount - settleAmount);
    if (debtor.amount < EPSILON) debtors.shift();
    if (creditor.amount < EPSILON) creditors.shift();
  }

  return transactions;
}
