# Household financial-health decision policy — owner review proposal

**Status:** PROPOSED, **NOT APPROVED**. Do not implement or display Healthy / Caution / At Risk automatically from this document until the owner explicitly approves one policy version in [factory idea #4](https://github.com/huynq26/software-factory/issues/4).

**Product work item:** [#10](https://github.com/huynq26/personal-financial-management-app/issues/10).  
**Owner-approved context:** one household, VND amounts, a single local-only encrypted vault on one device, no automatic sync. Actual household data and release remain prohibited pending independent security QC and separate authorization.

## Goal and method

The first valuable MVP outcome is **an understandable combined-household financial-health assessment**, not just a cash-flow calculator. Report accessible reserves, payment pressure, disposable surplus, known overdue debts, and household net worth **separately**. Never let illiquid property wealth offset a cash/repayment danger. No per-person scoring, investment recommendations, borrowing eligibility judgments or unsupported numeric credit score.

The following ratios are **engineering policy hypotheses** to discuss with the owner, not empirically validated cutoffs for Vietnamese households, CFPB financial-well-being scale outputs, or regulated financial advice.

### Definitions (from existing `lib/household.ts`)

- `surplusVnd` = combined monthly net income − essential monthly expenses − discretionary expenses − required monthly debt payments. VND amounts are exact integer decimal strings.
- `essentialOutgoingsVnd` = essential household expenses + required debt payments. **No duplicated payment line items.**
- `emergencyMonths` = *accessible* liquid savings / essential outgoings. Exclude property, inaccessible deposits and restricted accounts. Compare **unrounded exact fractions**; format one decimal for display only.
- `debtBurden` = required debt payments / combined net income where net income is positive. Compare unrounded ratios; displayed percent may be rounded but must not change decision.
- `netWorthVnd` = consolidated assets − liabilities, counting joint items once. **Net worth is descriptive only; it never automatically upgrades status.**
- `overdue` = yes / no / unknown. Unknown must never be silently treated as no.

### Missing/zero input policy

The initial MVP requires explicit VND amounts for income, essential/discretionary expenses, required repayments, accessible reserves, total assets and liabilities, plus known overdue status before showing **Healthy**. Zero is valid, blank means unknown. Outstanding debt balance should also be entered, with zero when no loans. Show missing fields clearly.

- If any required input is unknown, or overdue is unknown, return **Insufficient Data** with available indicators and **specific warnings** for already known critical problems. Never show Healthy based only on available good-looking fields.
- If income is zero: payment-burden percent is unavailable. If expenses are positive, surplus is negative, so surface an urgent cash-flow warning even if the status stays Insufficient Data until essentials and liquidity are known.
- If essential outgoings are zero: emergency-months ratio is unavailable (not infinity); do not infer Healthy from this alone. Ask the owner to confirm cost inputs.
- If contradictory input, duplicate household items, a stale snapshot, or an invalid measurement date is detected: **Insufficient Data** with a data-quality flag; do not classify using guessed values.
- The existing `HouseholdSnapshot` does not independently model each joint asset/income contributor. The first MVP relies on explicitly confirmed consolidated totals and UI warnings; fine-grained duplicate detection is out of scope unless the data model is extended.

## Decision policy A — balanced initial proposal

Apply in the following order **only to complete, validated data**:

| Rank | Condition | Status | Plain-language explanation |
| --- | --- | --- | --- |
| 0 | Unknown/inconsistent necessary information | **Insufficient Data** | Show each missing input and any available critical signal |
| 1 | Any payment is confirmed overdue | **At Risk** | Household has an overdue obligation |
| 1 | Monthly surplus is negative | **At Risk** | Current spending/payments exceed monthly income |
| 1 | Emergency coverage is **less than 1 month** | **At Risk** | Accessible reserves would not cover one month of essential outgoings |
| 1 | Monthly debt payments are **50% or more** of positive income | **At Risk** | Required payments consume a large share of household income |
| 2 | Emergency coverage is **less than 3 months**, but at least 1 | **Caution** | Buffer may be thin for unexpected costs |
| 2 | Monthly debt payments are **30% or more**, but below 50% | **Caution** | Debt payments could constrain household flexibility |
| 2 | Monthly surplus is exactly zero | **Caution** | No current monthly surplus to replenish reserves |
| 3 | All ratios calculable and no caution/critical flags | **Healthy** | Household appears able to cover recorded obligations with a defined buffer; never claim risk-free |

**Boundary convention:** lower emergency-coverage boundary is exclusive (coverage exactly 1.0 is Caution, 3.0 can be Healthy); upper debt burden boundary is inclusive (30% = Caution; 50% = At Risk). For a complete household whose essential outgoings are exactly zero, show Insufficient Data rather than inventing emergency coverage.

## Decision policy B — more conservative buffer requirement

The critical **At Risk** triggers from A are unchanged. Caution and Healthy change as follows:

- Emergency coverage **less than 6 months** but at least 1 → **Caution**.
- Debt payments **25% or more** but below 50% of positive income → **Caution**.
- Surplus equal to zero → Caution.
- Healthy requires **at least 6 months** of accessible essential-outgoings coverage, debt burden **less than 25%**, positive surplus, no overdue payments, and complete data.

**Tradeoff:** B will label more households Caution, including ones with stable income. Neither policy is independently validated as the objectively best Vietnamese-household threshold. Rules must be versioned (`household-health-v1`) and surfaced alongside the explanation, snapshot month and last updated date. Any future threshold change requires separate owner review and tests; old records should not silently be relabeled without indicating the new policy version.

## Required synthetic acceptance scenarios (no real family data)

Use **ratio boundary tests**, not rounded display strings. Each row has complete valid inputs unless stated. All values are fictional VND; monthly non-debt essential, discretionary and repayment amounts are mutually exclusive.

| Case | Combined income | Essential | Discretionary | Repayments | Accessible savings | Overdue | Expected A | Expected B | Why |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| Resilient | 60,000,000 | 15,000,000 | 10,000,000 | 6,000,000 | 126,000,000 | no | Healthy | Healthy | Six months coverage, 10% debt burden, surplus |
| 4-month buffer | 60,000,000 | 15,000,000 | 10,000,000 | 6,000,000 | 84,000,000 | no | Healthy | Caution | B requires at least 6 months |
| Exactly 3-month buffer | 60,000,000 | 15,000,000 | 10,000,000 | 6,000,000 | 63,000,000 | no | Healthy | Caution | A lower bound inclusive |
| Exactly 1-month buffer | 60,000,000 | 15,000,000 | 10,000,000 | 6,000,000 | 21,000,000 | no | Caution | Caution | At Risk requires <1 month |
| Just under 1 month | 60,000,000 | 15,000,000 | 10,000,000 | 6,000,000 | 20,999,999 | no | At Risk | At Risk | Severe shortage despite surplus |
| Debt at exactly 30% | 100,000,000 | 20,000,000 | 10,000,000 | 30,000,000 | 300,000,000 | no | Caution | Caution | A inclusive threshold |
| Debt at exactly 25% | 100,000,000 | 20,000,000 | 10,000,000 | 25,000,000 | 270,000,000 | no | Healthy | Caution | B inclusive threshold |
| Debt at exactly 50% | 100,000,000 | 20,000,000 | 10,000,000 | 50,000,000 | 420,000,000 | no | At Risk | At Risk | Critical payment pressure |
| Monthly deficit | 40,000,000 | 30,000,000 | 10,000,000 | 5,000,000 | 210,000,000 | no | At Risk | At Risk | Positive property net worth must not offset negative cash flow |
| Overdue despite surplus | 60,000,000 | 15,000,000 | 10,000,000 | 6,000,000 | 126,000,000 | yes | At Risk | At Risk | Known overdue overrides healthy ratios |
| Missing liquid reserves | 60,000,000 | 15,000,000 | 10,000,000 | 6,000,000 | **blank** | no | Insufficient Data | Insufficient Data | Unknown is not zero |
| Overdue unknown | 60,000,000 | 15,000,000 | 10,000,000 | 6,000,000 | 126,000,000 | unknown | Insufficient Data | Insufficient Data | Unknown is not no |
| Zero income / bills due | 0 | 15,000,000 | 0 | 5,000,000 | 120,000,000 | no | Insufficient Data + critical cash-flow warning | same | Income-based debt ratio unavailable |
| Zero essentials and repayments | 40,000,000 | 0 | 10,000,000 | 0 | 120,000,000 | no | Insufficient Data | Insufficient Data | Unavailable essential coverage denominator |

For test rows above, populate all *other* required fields with explicitly documented valid, nonnegative VND values, including total assets/liabilities; do not choose contradictory duplicates. Include an additional property-rich/cash-poor example with savings **0**, positive high property assets and large net worth: it must be **At Risk** because liquid coverage is 0, not Healthy. For surplus calculations, repayment is not part of essential/discretionary figures.

## Explanations and non-prescriptive actions

For each condition that drives the result, show exactly what was measured and the reviewed comparison, e.g. “Your accessible reserves would cover 0.8 months of essential expenses and debt payments (policy threshold: 1 month).” Offer 1–3 general suggestions linked to the flagged cause, such as checking recurring expenditure, preparing an emergency reserve plan, or reviewing debt obligations with a qualified professional. Never promise outcomes or recommend a particular investment or credit product.

Keep missing data visible and ask for corrections; do not tell a family that it is financially “healthy” because property values exceed its loans.

## Before engineering implementation

- [ ] Owner explicitly selects **Policy A**, **Policy B**, or proposed changes; confirms the meaning of `Insufficient Data` versus partially known severe warnings.
- [ ] Product Agent records approved thresholds and precedence with a **policy version**, exact source commit and owner decision link.
- [ ] Codex implements a **pure, deterministic policy function** in product source with boundary and contradiction tests (no network/cloud calls). Do not round before comparisons.
- [ ] Independent QC audits exact version and fixed test scenarios against a synthetic-data preview. Numeric formula unit tests alone do not prove that the policy is validated for financial advice.
- [ ] Production/real-data release still requires the separate explicit security and owner gates.

This document is **not** itself product-owner approval.
