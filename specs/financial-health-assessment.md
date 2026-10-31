# Feature: Explain the family's household financial health and risks

- Product: Personal Financial Management App
- Spec status: **Draft — not approved for implementation**
- Product Agent: Central Software Factory
- Product owner feedback: The **household/family** is the required assessment unit; financial assessment is the main outcome and cash flow alone is insufficient.
- Confirmed scope decisions: **HOUSEHOLD only + VND primary currency (2026-10-31)**. Other requirements, risk thresholds, storage and implementation remain Draft.
- Priority proposal: P0 / first value-bearing MVP
- Product owner approval: Pending

## User problem and outcome
A family wants to understand whether its **combined household financial position** is healthy, requires attention, or is at risk, and learn which factors contribute to that assessment. A positive monthly cash flow alone does not establish financial security: cash reserves, debt obligations, asset liquidity and ability to withstand a setback also matter.

## Primary user journey (proposed)
1. An authorized adult opens the **single household assessment**, which displays and accepts monetary values in **VND** for the first MVP. Individual financial-health profiles and multi-currency conversion are not part of this MVP.
2. User enters/reviews the family's combined net monthly incomes, essential and discretionary spending (including costs of dependents), required debt repayments, liquid savings accessible to the family, assets and liabilities. The system identifies joint versus individually held items when access matters.
3. User reviews computed metrics, with source inputs and measurement dates.
4. Application displays an **explainable qualitative status** and separate risk flags, not an unsupported opaque credit/financial score.
5. User sees the strongest positive factors, risk factors, next steps, data gaps and the assessment date.
6. User can update figures and see the assessment change; missing data produces an **Insufficient Data** state.

## Financial data (manual entry for MVP)
- **Household identity:** one household assessment with a designated managing adult; optional total adult count and number of dependents for context. Do not collect children's names or identifying details for MVP.
- **Income:** combined net monthly income of household contributors; indicate stable versus variable income if known. Do not count transfers between members as new income.
- **Spending:** family essential and discretionary monthly expenses including housing, caregiving, children's education, utilities and shared living costs. Count each cost once. Keep required debt payments separate to avoid double counting.
- **Debt:** joint and individually held loans whose repayments affect household cash flow; include outstanding balances, mandatory monthly payments and known overdue amounts, without counting the same shared obligation twice.
- **Liquid reserves:** cash/deposits readily available to support household obligations, **excluding inaccessible/restricted money and illiquid assets** such as property; track accessible status for individually held accounts.
- **Assets and liabilities:** consolidated household position covering joint plus relevant individually held items; record ownership/valuation and whether they are accessible; avoid duplicate joint-property entries. Debt balances count once.
- **Optional contextual inputs:** household size/dependent counts, irregular large expenses, upcoming obligations, family goals and income volatility. These do not require individual assessments.
- **Later, not MVP:** per-person profiles, relationship mapping, collaborative household sharing and detailed member-level financial analytics.
- **Confirmed currency:** VND (ISO 4217) for the initial household snapshot, metric calculations and reports. Capture as-of date and source/valuation date. Display VND with locale-appropriate separators and no fractional đồng. Multi-currency ingestion and automated foreign-exchange conversion are deferred. If an asset is currently valued only in another currency, ask the user to supply an explicit VND valuation/date instead of guessing an exchange rate.

## Computed indicators
1. **Household monthly surplus/deficit** = combined net household income − household non-debt monthly expenses − total required payments for debts affecting the family. Exclude intra-household transfers and repayments already included in expenses.
2. **Household savings capacity** = family surplus / combined net household income where income is positive; negative surplus is explicitly displayed.
3. **Household emergency coverage (months)** = reserves **accessible to meet family obligations** / household essential outgoings (including necessary repayments), if denominator is positive. Do not treat a restricted account or family home as liquid reserves.
4. **Household debt payment burden** = total required monthly payments for debts affecting the family / combined net household income, if income is positive.
5. **Household net worth** = consolidated family assets − consolidated liabilities, with each jointly held item counted once. Show valuation dates and distinguish unavailable/illiquid wealth from spendable reserves.
6. **Coverage of upcoming obligations** (optional MVP if user enters them): reserves versus required short-term payments.
7. For zero denominators or missing values show 'Not available' with a reason, not NaN or misleading zero.

## Risk-status model — explainability first
All determinations apply to the **household**, not to an individual adult or child. A household with strong combined earnings may still be At Risk if shared obligations cannot be met, liquid reserves are inaccessible, or liabilities are concentrated. Different family compositions affect essential costs; avoid assuming each dependent implies a fixed spending amount.
**Statuses:** Healthy / Caution / At Risk / Insufficient Data.

- **Healthy:** required bills appear coverable, available liquid buffer and debt burden fall within **owner-reviewed, documented thresholds**, and no critical indicators are triggered. Never declare 'risk-free'.
- **Caution:** one or more indicators requires attention, such as a shrinking emergency buffer or elevated debt payments, without a confirmed severe shortfall.
- **At Risk:** meaningful negative cash flow, inability to cover essential obligations, overdue debt, or substantially inadequate liquidity under the approved decision rules.
- **Insufficient Data:** essential inputs unknown, stale, contradictory or unreliable; do not show a green status from an incomplete snapshot.
- **No universal thresholds are approved yet.** Platform/owner/QC must define, version and test transparent configurable policy values and the priority/interaction of warning flags. Show the user's numbers, the threshold used and the rationale. Allow the owner to review suitability for local financial practices.
- Data quality/confidence is **separate** from health status and should be visible.
- A numerical 0–100 score is **out of scope** initially unless the methodology is justified, validated and clearly labeled. The CFPB Financial Well-Being Scale measures subjective well-being via a specific questionnaire; our calculated dashboard must not imitate or claim equivalent validity.

## Explanation and recommendations
- List **Why this status?** with linked metrics (e.g., reserves cover 1.2 months of essentials; loan payments absorb a large share of income).
- Provide 1–3 prioritized, general, low-risk actions grounded in the actual identified causes (e.g., review non-essential spending, examine debt schedule, build accessible reserves).
- Explain uncertainties and assumptions; avoid guarantees, investment/credit eligibility judgments, or personalized regulated advice.
- Reflect conflicting dimensions: high property wealth cannot erase a near-term cash shortage.

## Currency-related acceptance criteria (VND scope confirmed; implementation Draft)
- [ ] Given an input in VND, the app stores/calculates the value with exact integer-đồng precision (or safe validated decimal representation), not imprecise binary floating-point money.
- [ ] Given an amount represented in another currency, the app rejects automatic aggregation into VND and explains how to provide a documented VND valuation. It does not silently apply an invented exchange rate.
- [ ] Given a household dashboard, all financial amounts consistently display in VND; ratio-based indicators are shown as ratios/percentages or months, not as VND.

## Household-specific acceptance criteria (draft)
- [ ] Given two adults contribute income and share expenses, when the household snapshot is assessed, then combined income and actual household expenses produce **one household result**; no per-person score is displayed.
- [ ] Given a transfer of funds between two household accounts, when totals are calculated, then the transfer does not inflate combined household income, spending, reserves or net worth.
- [ ] Given a jointly held property or shared loan appearing in multiple input records, when consolidated, then the asset and obligation count **once**; duplicate/ambiguous records trigger review.
- [ ] Given reserves owned by one adult but inaccessible for family expenses, when emergency coverage is computed, then inaccessible balances are excluded even if they contribute to overall household wealth.
- [ ] Given essential caregiving/education costs for dependents, when the family enters monthly expenses, then those costs are included in household obligations without requiring children's identifying details.
- [ ] Given member-level income or debt information is incomplete, when the system cannot establish trustworthy household totals, then it shows Insufficient Data or a clearly limited result rather than Healthy.
- [ ] Given a separate household account, when its user requests this family's financial data, then access is denied; household member sharing is not enabled without explicit permissions and consent.

## General acceptance criteria (draft)
- [ ] Given complete valid financial inputs, when assessment runs, then every displayed metric equals a documented deterministic formula with relevant precision and currency.
- [ ] Given positive income but material debt pressure and very low liquid savings under the approved policy, when assessment runs, then a positive cash flow alone **cannot** force Healthy.
- [ ] Given a high-value illiquid asset and minimal accessible reserves, when assessment runs, then emergency coverage uses **only liquid reserves**, not net worth.
- [ ] Given an essential input missing, stale or inconsistent, when assessment runs, then it shows Insufficient Data or an explicitly limited assessment, with missing fields explained.
- [ ] Given zero income or zero essential expenditure, when ratios would divide by zero, then a descriptive unavailable state appears and no NaN/Infinity.
- [ ] Given known overdue payments or an obligation shortfall meeting the approved critical rule, when status is derived, then At Risk is shown along with exact reasons.
- [ ] Given a status of Caution or At Risk, when a user opens its explanation, then they can see each driver, assumptions, applicable threshold and general next steps.
- [ ] Given inputs are changed, when the calculation is rerun, then status and reasons are reproducible and trace to the same versioned policy.
- [ ] Given another user or anonymous session, when they request private financial snapshots, then access is denied before any data is revealed.
- [ ] Given a simulated sample profile, when QA runs snapshot/decision-table tests, then expected risk statuses and boundary cases match an approved fixture matrix.

## Functional scope vs supporting capabilities
- Priority A: Financial snapshot input + dashboard + risk classification and explanations.
- Priority B: Simple monthly cash flow summaries feeding the assessment.
- Transaction-by-transaction bookkeeping is **not required** for the first assessment if a user can supply reliable monthly totals; track a richer cashflow editor as a separate optional issue.
- Charts, projections, recommendations for buying financial products, bank imports, portfolio market data and automated investment advice are out of scope for the first validation iteration.

## Quality, privacy, and validation
- Privacy: amounts, assets and debts are sensitive. Protect accounts, data and access before collecting real user information; use synthetic datasets for Preview.
- Reliability: retain version of decision policy, source figures and effective date. Add deterministic and boundary tests for conflicting signals.
- Usability: accessible, non-alarming labels and plain language; avoid color as the sole communication of risk.
- Fairness: avoid implying a universal financial-health standard; surface different needs and missing factors.
- Evidence: actual assessment software is **not yet implemented**. The existing demo displays fictional summary numbers, not these risk classifications.
- Research rationale: https://www.consumerfinance.gov/consumer-tools/financial-well-being/about/ and https://www.consumerfinance.gov/data-research/research-reports/perceived-financial-preparedness-saving-habits-and-financial-security/

## Owner decisions needed before Codex implementation
1. **Resolved by product owner on 2026-10-31: household/family financial health only.** Do not implement an individual assessment mode in MVP.
2. **Resolved by product owner on 2026-10-31: VND primary reporting and entry currency for first MVP.** Automated FX conversion and native multi-currency handling are deferred. Precise VND valuation and source-date rules for overseas assets still need Platform/QC review.
3. Security model and whether first iteration stores genuine sensitive financial information or only synthetic/demo profiles?
4. Accept status categories Healthy / Caution / At Risk / Insufficient Data?
5. Select and review threshold policy / risk priority rules, with separate caution for data gaps.
6. Confirm whether direct income/expense totals suffice for MVP or full manual transaction entry is required.

**Approval gate:** Household assessment unit and VND primary currency are confirmed, but this specification is otherwise Draft. No engineering implementation, production data ingestion or deployment is authorized.
