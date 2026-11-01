import test from "node:test";
import assert from "node:assert/strict";
import {
  assessHousehold, blankSnapshot, formatVnd, validateDocument, validateSnapshot,
} from "../lib/household";

function sample() {
  return {
    ...blankSnapshot("2026-11"), income: "45000000", essential: "18000000",
    discretionary: "8000000", repayments: "5000000", outstandingDebt: "120000000",
    liquidSavings: "35000000", assets: "2300000000", liabilities: "120000000",
  };
}

test("household indicators use whole VND, distinguish debt repayments", () => {
  const result = assessHousehold(sample());
  assert.equal(result.surplus, "14000000");
  assert.equal(result.netWorth, "2180000000");
  assert.equal(result.emergencyMonths, "1.5");
  assert.equal(result.debtPercent, "11.1");
  assert.equal(result.missing.length, 0);
});

test("unknown is not zero; missing fields do not invent a financial status", () => {
  const result = assessHousehold(blankSnapshot("2026-11"));
  assert.equal(result.surplus, null);
  assert.equal(result.netWorth, null);
  assert.equal(result.emergencyMonths, null);
  assert.ok(result.missing.length > 0);
  assert.equal(result.overdue, "unknown");
});

test("exact VND works beyond JavaScript safe integer range", () => {
  const result = assessHousehold({
    ...sample(), income: "99999999999999999999", essential: "1",
    discretionary: "0", repayments: "0",
  });
  assert.equal(result.surplus, "99999999999999999998");
  assert.ok(formatVnd(result.surplus).includes("₫"));
});

test("zero income and zero household essential costs avoid divide by zero", () => {
  const result = assessHousehold({
    ...sample(), income: "0", essential: "0", repayments: "0",
  });
  assert.equal(result.debtPercent, null);
  assert.equal(result.emergencyMonths, null);
});

test("negative and fractional VND amounts are rejected", () => {
  assert.throws(() => validateSnapshot({ ...sample(), income: "-1" }));
  assert.throws(() => validateSnapshot({ ...sample(), income: "1.5" }));
  assert.throws(() => validateSnapshot({ ...sample(), income: "1,000" }));
});

test("vault documents reject mismatched or invalid monthly keys", () => {
  assert.throws(() => validateDocument({
    version: 1, snapshots: { "2026-10": sample() },
  }));
  validateDocument({ version: 1, snapshots: { "2026-11": sample() } });
});
