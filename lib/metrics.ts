/**
 * Pure demonstration calculations.
 * Inputs must be finite, non-negative numbers; no finance decisions here.
 */
export function savingsRate(income: number, expenses: number): number {
  if (!Number.isFinite(income) || !Number.isFinite(expenses) || income < 0 || expenses < 0) {
    throw new RangeError("Income and expenses must be finite and non-negative");
  }
  if (income === 0) return 0;
  return Math.round(((income - expenses) / income) * 1000) / 10;
}

export function netWorth(assets: number, liabilities: number): number {
  if (!Number.isFinite(assets) || !Number.isFinite(liabilities) || assets < 0 || liabilities < 0) {
    throw new RangeError("Assets and liabilities must be finite and non-negative");
  }
  return assets - liabilities;
}
