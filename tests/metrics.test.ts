import test from "node:test";
import assert from "node:assert/strict";
import { savingsRate, netWorth } from "../lib/metrics";

test("savingsRate calculates an ordinary monthly budget", () => {
  assert.equal(savingsRate(1000, 750), 25);
});
test("savingsRate handles no income without dividing by zero", () => {
  assert.equal(savingsRate(0, 0), 0);
});
test("savingsRate represents overspending", () => {
  assert.equal(savingsRate(500, 625), -25);
});
test("savingsRate rejects negative and non-finite inputs", () => {
  assert.throws(() => savingsRate(-1, 2), RangeError);
  assert.throws(() => savingsRate(Number.NaN, 2), RangeError);
});
test("netWorth subtracts liabilities", () => {
  assert.equal(netWorth(2000, 350), 1650);
});
test("netWorth rejects non-finite inputs", () => {
  assert.throws(() => netWorth(Number.POSITIVE_INFINITY, 0), RangeError);
});
