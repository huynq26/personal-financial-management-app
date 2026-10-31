# Feature: Explain the user's financial health and risks

- Product: Personal Financial Management App
- Spec status: **Draft — not approved for implementation**
- Product Agent: Central Software Factory
- Product owner feedback: Financial assessment is the main outcome; cash flow alone is insufficient.
- Priority proposal: P0 / first value-bearing MVP
- Product owner approval: Pending

## User problem and outcome
A person wants to understand whether their **overall personal or household financial position** is healthy, requires attention, or is at risk, and learn which factors contribute to that assessment. A positive monthly cash flow alone does not establish financial security: cash reserves, debt obligations, asset liquidity and ability to withstand a setback also matter.

## Primary user journey (proposed)
1. User chooses whether the assessment covers an individual or household and chooses their main currency.
2. User enters or reviews a financial snapshot: monthly take-home income, essential and discretionary expenses, contractual debt repayments, liquid savings, assets and outstanding liabilities.
3. User reviews computed metrics, with source inputs and measurement dates.
4. Application displays an **explainable qualitative status** and separate risk flags, not an unsupported opaque credit/financial score.
5. User sees the strongest positive factors, risk factors, next steps, data gaps and the assessment date.
6. User can update figures and see the assessment change; missing data produces an **Insufficient Data** state.

## Financial data (manual entry for MVP)
- Income: net household or individual monthly income; income stability / variability as optional self-report.
- Spending: essential and discretionary monthly expenses; normalize treatment of required debt payments to avoid double counting.
- Debt: outstanding loan balances, required monthly payments, missed/overdue payments as optional self-report.
- Liquid reserves: cash and readily accessible savings, **separate from illiquid assets** such as property.
- Assets: liquid/illiquid assets with valuation dates; outstanding liabilities and amounts owed.
- Optional later: near-term obligations, known financial goals, number of dependents, protection/insurance gaps, subjective financial confidence.
- Record currency, units and as-of date; support Vietnamese locale as a proposal, pending owner's choice.

## Computed indicators
1. **Monthly surplus/deficit** = monthly net income − non-debt monthly expenses − required monthly debt payments. Document whether expense totals already include repayments.
2. **Savings capacity** = surplus / income where income is positive; negative surplus is explicitly displayed.
3. **Emergency coverage (months)** = liquid reserves / monthly essential outgoings, including required debt payments, if essential outgoings are positive.
4. **Debt payment burden** = required monthly debt payments / monthly income, if income is positive.
5. **Net worth** = total assets − liabilities; show valuation date and distinguish illiquid from spendable amounts.
6. **Coverage of upcoming obligations** (optional MVP if user enters them): reserves versus required short-term payments.
7. For zero denominators or missing values show 'Not available' with a reason, not NaN or misleading zero.

## Risk-status model — explainability first
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

## Acceptance criteria (draft)
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
1. Individual or household financial health (or both)?
2. Primary currency (VND expected as candidate), multi-currency/asset valuation rules?
3. Security model and whether first iteration stores genuine sensitive financial information or only synthetic/demo profiles?
4. Accept status categories Healthy / Caution / At Risk / Insufficient Data?
5. Select and review threshold policy / risk priority rules, with separate caution for data gaps.
6. Confirm whether direct income/expense totals suffice for MVP or full manual transaction entry is required.

**Approval gate:** This specification is Draft. No engineering implementation, production data ingestion or deployment is authorized.
