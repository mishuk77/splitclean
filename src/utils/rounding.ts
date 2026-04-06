export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function splitEqual(amount: number, count: number, payerIndex: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [roundCurrency(amount)];
  const baseAmount = Math.floor((amount * 100) / count) / 100;
  const totalBase = roundCurrency(baseAmount * count);
  const remainder = roundCurrency(amount - totalBase);
  const splits = new Array(count).fill(baseAmount);
  splits[payerIndex] = roundCurrency(baseAmount + remainder);
  return splits;
}

export function distributeRemainder(amounts: number[], total: number, payerIndex: number): number[] {
  const result = amounts.map(roundCurrency);
  const currentSum = result.reduce((sum, a) => sum + a, 0);
  const diff = roundCurrency(total - currentSum);
  if (Math.abs(diff) >= 0.01) {
    result[payerIndex] = roundCurrency(result[payerIndex] + diff);
  }
  return result;
}
