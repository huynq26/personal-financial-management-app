# Financial Health App — MVP product brief

**Status: Draft specifications; CONFIRMED product direction (2026-10-31): one household, VND, and private user-entered household financial information with secure persistence. Risk thresholds, platform details and real-data launch are NOT approved.**  
**Product Agent:** Central [Software Factory Product Agent](https://github.com/huynq26/software-factory/blob/main/.agents/skills/product-agent/SKILL.md).  
**Factory intake and approval:** [Issue #4](https://github.com/huynq26/software-factory/issues/4).  
**Specifications:** [Financial health assessment](../specs/financial-health-assessment.md) (primary), [private household information intake](../specs/private-household-financial-intake.md) (required), and [cash-flow tracking](../specs/manual-cashflow-tracking.md) (optional later detailed ledger).

## Problem / main outcome

A family wants an **understandable assessment of its combined household financial condition**: Can we cover our living costs and family obligations? Which risks affect our household? What should we improve first? Financial health depends on household liquidity, shared and personal obligations, resilience to shocks and progress toward goals—not merely cash flow.

### What the app should answer
1. **What is my overall financial status?** Healthy, Caution, At Risk, or Insufficient Data.
2. **Why?** Show the risk drivers and strengths, their numbers and the rules used.
3. **What could I improve?** Prioritized, practical general next steps, with uncertainty and assumptions clearly explained.
4. **How is my situation changing?** Reassess after data is updated; trends are a later increment.

## Target users and confirmed assessment unit
**Decision: HOUSEHOLD/FAMILY ONLY for MVP (confirmed by product owner on 2026-10-31).** The primary user is an adult who manages or jointly manages the family budget. Each assessment describes **one household as a financial unit**, not an individual's financial score. Household size and number of dependents may be entered as optional contextual counts; names, birthdates and children's personal records are not required.

Aggregate combined income, ordinary household spending, repayments for obligations affecting the family, accessible household reserves, assets and liabilities. Jointly held and individually held items relevant to the household may both be included; do not count internal transfers or shared assets twice. Distinguish individually held assets that are *not available* for paying household costs. Confirm access/ownership rules before real-data entry.

This audience definition is a product hypothesis, not evidence of product-market fit.

## Confirmed user-input direction
**Decision (2026-10-31):** This is a personal-use app, starting with one authenticated adult managing one household. The owner will **enter genuine household financial information into secure forms**, save and update private financial snapshots, and view a computed household assessment. A synthetic dashboard alone does not satisfy the product goal. Actual data collection must remain **disabled until authentication, authorization, persistence, data protection and QC verification are complete**. See [private financial intake specification](../specs/private-household-financial-intake.md).

## MVP scope (revised proposal)

**P0 — Private household financial intake, saved snapshots & health assessment**
- **Sign in and privately enter, save, revisit and update** combined household monthly income, essential/discretionary family expenses, required payments on debts affecting the household, accessible family savings, assets and liabilities **in Vietnamese đồng (VND)** with an as-of date. Mark ownership/availability where it affects emergency liquidity. Multi-currency amounts and automated FX conversion are deferred beyond MVP. Real-data launch requires completed privacy/security gates.
- Calculate **household** monthly surplus, liquid emergency-fund coverage, debt burden and household net worth with auditable definitions. Avoid double-counting shared items, internal household transfers and loan repayments.
- Display an explainable qualitative assessment: Healthy / Caution / At Risk / Insufficient Data, with categorized contributing signals and measurement gaps.
- Provide specific, general action suggestions (e.g. review spending, improve emergency liquidity) rather than unvalidated predictions or individualized investment advice.
- Keep missing/uncertain inputs visible. Risk classification rules/thresholds need an explicit versioned, owner-approved policy.

**P1 — Cash-flow overview (supporting feature)**
- Enter monthly aggregate income and expense totals sufficient to feed the snapshot.
- Display simple monthly summary. Transaction-by-transaction create/edit/delete is optional for the first health assessment; decide separately.

**P2 — Later iterations, outside this MVP**
- Historical trend reports, goals/projections, detailed transaction ledger, data imports and connections, market/news recommendations, asset allocation, investment planning and scenario forecasting.

## Out of scope for MVP
Bank connections, credit scoring, trading, regulated investment recommendations, automated financial transactions, credit eligibility and production use of real sensitive data before privacy controls are approved.

## Functional acceptance (draft)
- [ ] Given a signed-in user, the app provides guided household information entry, server-validated private save, edit/revisit and explicit deletion controls; real financial input must be inaccessible without authentication.
- [ ] Given a family financial snapshot, all reported income, spending, debts and available reserves are assessed **at household level**, with amounts traced to their sources and no duplicated shared assets or inter-member transfers.
- [ ] With valid complete inputs, metrics use documented formulas and correctly display amounts in VND, with integer-đồng precision and no silent rounding or currency conversion.
- [ ] Positive monthly cash flow cannot by itself imply Healthy when liquid reserves or debt obligations are risky.
- [ ] Family home/property and restricted assets may count toward net worth (with liability offsets), but **not** accessible emergency reserves.
- [ ] Missing or inconsistent key information triggers Insufficient Data or a visibly qualified assessment.
- [ ] Every status shows **why**, including metrics, applied policy and general action suggestions.
- [ ] Threshold boundary conditions, negative states, zero denominators and conflicting indicators have deterministic QC tests.
- [ ] For real stored data, only authorized household account holders can view or change household records. A separate family's records are never accessible; household sharing and invitation permissions must be explicitly designed before launch.

## NFRs
See [NFR specification](nfr.md). This product will hold genuine private household financial amounts, so secure authentication, authorization, encrypted persistent storage, ownership isolation, user data deletion and independent security/QC tests are mandatory **before launch with real data**. Vercel Preview and CI remain synthetic-only; the production deployment must be separately approved.

## Initial success criteria
User can enter a snapshot, understand an assessment and accurately identify key financial risks. Candidate measured signals: task completion without assistance, user comprehension, correctness across audited test scenarios, and feedback about actionable explanations. Research and quantitative targets pending.

## Open questions for owner
- **Resolved: household/family financial health only for MVP (2026-10-31).**
- **Resolved: VND is the primary reporting and entry currency for the first MVP (2026-10-31).** A native multi-currency portfolio and exchange-rate conversion remain outside this MVP; values denominated in other currencies must not be silently aggregated as VND.
- **Resolved:** secure household financial intake and private persistence, initially for one account managing one household (2026-10-31). Storage provider, authentication, retention, data residency and safeguards need detailed Platform/QC approval.
- Are the proposed status labels acceptable?
- What threshold policy / risk severity rules should be reviewed for local context?

## References and caution
CFPB describes financial well-being as control of finances, ability to absorb a shock, progress toward goals and freedom of choice: https://www.consumerfinance.gov/consumer-tools/financial-well-being/about/. Do not equate a newly invented status classification with the validated CFPB self-report scale or represent it as a certified financial diagnosis.

## Approval
Household assessment unit, VND currency and real user-entered private-data direction confirmed. The security architecture, financial-risk rules, readiness and release authorization remain pending. The existing Next.js pilot UI is a **fictional technical scaffold**, not an implemented financial health assessment or production-ready financial product.
