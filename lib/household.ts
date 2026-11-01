export type OverdueStatus = "yes" | "no" | "unknown";

export interface HouseholdSnapshot {
  month: string;
  income: string;
  essential: string;
  discretionary: string;
  repayments: string;
  outstandingDebt: string;
  liquidSavings: string;
  assets: string;
  liabilities: string;
  overdue: OverdueStatus;
  updatedAt: string;
}

export type MoneyField = Exclude<keyof HouseholdSnapshot, "month" | "overdue" | "updatedAt">;

export const moneyFields: { key: MoneyField; label: string; hint: string }[] = [
  { key: "income", label: "Household take-home income", hint: "Combined monthly net income, excluding transfers within your family" },
  { key: "essential", label: "Essential monthly spending", hint: "Housing, food, utilities, education and other essentials; exclude loan repayments below" },
  { key: "discretionary", label: "Other monthly spending", hint: "Dining out, shopping, recreation and other optional expenses" },
  { key: "repayments", label: "Required monthly debt payments", hint: "Total household repayments; do not repeat them above" },
  { key: "outstandingDebt", label: "Total outstanding debt", hint: "Balances of household loans, counted once" },
  { key: "liquidSavings", label: "Accessible cash and savings", hint: "Only funds available to cover family bills, not locked deposits or property" },
  { key: "assets", label: "Total household assets", hint: "Property, investments, accessible savings and other assets; count jointly owned items once" },
  { key: "liabilities", label: "Total household liabilities", hint: "All amounts owed, including the outstanding debt above, counted once" },
];

export function blankSnapshot(month: string): HouseholdSnapshot {
  return {
    month, income: "", essential: "", discretionary: "", repayments: "",
    outstandingDebt: "", liquidSavings: "", assets: "", liabilities: "",
    overdue: "unknown", updatedAt: "",
  };
}

/** All input amounts are ungrouped, unsigned, whole-VND decimal strings. Empty means unknown. */
export function isValidVnd(value: string): boolean {
  if (value === "") return true;
  return /^\d{1,20}$/.test(value);
}

export function validateSnapshot(value: unknown): asserts value is HouseholdSnapshot {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Invalid household snapshot.");
  }
  const s = value as Record<string, unknown>;
  if (typeof s.month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(s.month)) {
    throw new Error("Invalid reporting month.");
  }
  if (s.overdue !== "yes" && s.overdue !== "no" && s.overdue !== "unknown") {
    throw new Error("Invalid overdue payment status.");
  }
  if (typeof s.updatedAt !== "string" || s.updatedAt.length > 50) {
    throw new Error("Invalid update date.");
  }
  for (const { key, label } of moneyFields) {
    const v = s[key];
    if (typeof v !== "string" || !isValidVnd(v)) {
      throw new Error(label + " must be a nonnegative whole VND amount without separators.");
    }
  }
}

export interface VaultDocument {
  version: 1;
  snapshots: Record<string, HouseholdSnapshot>;
}

export function validateDocument(value: unknown): asserts value is VaultDocument {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Invalid vault.");
  const d = value as Record<string, unknown>;
  if (d.version !== 1 || typeof d.snapshots !== "object" || d.snapshots === null || Array.isArray(d.snapshots)) {
    throw new Error("Unsupported vault format.");
  }
  const snapshots = d.snapshots as Record<string, unknown>;
  if (Object.keys(snapshots).length > 240) throw new Error("Vault exceeds the supported number of months.");
  for (const [key, value] of Object.entries(snapshots)) {
    validateSnapshot(value);
    if (key !== value.month) throw new Error("Snapshot month does not match its key.");
  }
}

function amount(raw: string): bigint | null {
  return raw === "" ? null : BigInt(raw);
}

export function formatVnd(raw: string | null): string {
  return raw === null || raw === "" ? "Not provided" : new Intl.NumberFormat("vi-VN").format(BigInt(raw)) + " ₫";
}

function decimalTenth(numerator: bigint, denominator: bigint): string | null {
  if (denominator <= 0n) return null;
  const negative = numerator < 0n;
  const absolute = negative ? -numerator : numerator;
  const tenths = (absolute * 10n + denominator / 2n) / denominator;
  return (negative ? "-" : "") + (tenths / 10n).toString() + "." + (tenths % 10n).toString();
}

export interface HouseholdOverview {
  surplus: string | null;
  netWorth: string | null;
  emergencyMonths: string | null;
  debtPercent: string | null;
  missing: string[];
  overdue: OverdueStatus;
}

export function assessHousehold(snapshot: HouseholdSnapshot): HouseholdOverview {
  validateSnapshot(snapshot);
  const m = Object.fromEntries(moneyFields.map(f => [f.key, amount(snapshot[f.key])])) as Record<MoneyField, bigint | null>;
  const missing = moneyFields.filter(f => m[f.key] === null).map(f => f.label);
  let surplus: string | null = null;
  if (m.income !== null && m.essential !== null && m.discretionary !== null && m.repayments !== null) {
    surplus = (m.income - m.essential - m.discretionary - m.repayments).toString();
  }
  const netWorth = m.assets === null || m.liabilities === null ? null : (m.assets - m.liabilities).toString();
  const essentialWithDebt = m.essential === null || m.repayments === null ? null : m.essential + m.repayments;
  const emergencyMonths = m.liquidSavings === null || essentialWithDebt === null ? null
    : decimalTenth(m.liquidSavings, essentialWithDebt);
  const debtPercent = m.repayments === null || m.income === null ? null
    : decimalTenth(m.repayments * 100n, m.income);
  return { surplus, netWorth, emergencyMonths, debtPercent, missing, overdue: snapshot.overdue };
}
