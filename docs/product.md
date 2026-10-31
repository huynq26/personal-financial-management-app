# Financial Health App — MVP product brief

**Status: Draft (scope refinement requested by owner); NOT approved for implementation.**  
**Product Agent:** Central [Software Factory Product Agent](https://github.com/huynq26/software-factory/blob/main/.agents/skills/product-agent/SKILL.md).  
**Factory intake and approval:** [Issue #4](https://github.com/huynq26/software-factory/issues/4).  
**Specifications:** [Financial health assessment](../specs/financial-health-assessment.md) (primary) and [cash-flow tracking](../specs/manual-cashflow-tracking.md) (supporting).

## Problem / main outcome

Users don't simply want to record income and spending. They want an **understandable assessment of their current financial condition**: What is healthy? Where are the risks? What should they improve first? Financial well-being depends on liquidity, ability to meet obligations, buffer for shocks and progress toward goals, not cash flow alone.

### What the app should answer
1. **What is my overall financial status?** Healthy, Caution, At Risk, or Insufficient Data.
2. **Why?** Show the risk drivers and strengths, their numbers and the rules used.
3. **What could I improve?** Prioritized, practical general next steps, with uncertainty and assumptions clearly explained.
4. **How is my situation changing?** Reassess after data is updated; trends are a later increment.

## Target users and evidence
Initially individuals or households who want a clearer financial overview; which model to support first is pending owner review. This is a product hypothesis, not evidence of product-market fit.

## MVP scope (revised proposal)

**P0 — Financial snapshot & financial health assessment**
- Manually enter monthly income, essential/discretionary expenses, required debt repayments, accessible savings, assets and liabilities; specify currency and as-of date.
- Calculate monthly surplus, liquid emergency-fund coverage, debt burden and net worth with auditable definitions and no double-counted loan payments.
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
- [ ] With valid complete inputs, metrics follow documented formulas, currencies and precision.
- [ ] Positive monthly cash flow cannot by itself imply Healthy when liquid reserves or debt obligations are risky.
- [ ] Illiquid property value counts toward net worth but **not** accessible emergency reserves.
- [ ] Missing or inconsistent key information triggers Insufficient Data or a visibly qualified assessment.
- [ ] Every status shows **why**, including metrics, applied policy and general action suggestions.
- [ ] Threshold boundary conditions, negative states, zero denominators and conflicting indicators have deterministic QC tests.
- [ ] For real stored data, only the authenticated data owner can access their information.

## NFRs
See [NFR specification](nfr.md). The product deals with sensitive financial information, so authentication, isolation, privacy and auditability are prerequisites to real-data persistence. A demo with synthetic data can precede real-data integration.

## Initial success criteria
User can enter a snapshot, understand an assessment and accurately identify key financial risks. Candidate measured signals: task completion without assistance, user comprehension, correctness across audited test scenarios, and feedback about actionable explanations. Research and quantitative targets pending.

## Open questions for owner
- Individual versus household?
- VND only or multiple currencies?
- Demo-only versus securely persisted real personal data?
- Are the proposed status labels acceptable?
- What threshold policy / risk severity rules should be reviewed for local context?

## References and caution
CFPB describes financial well-being as control of finances, ability to absorb a shock, progress toward goals and freedom of choice: https://www.consumerfinance.gov/consumer-tools/financial-well-being/about/. Do not equate a newly invented status classification with the validated CFPB self-report scale or represent it as a certified financial diagnosis.

## Approval
Pending. The existing Next.js pilot UI is a **fictional technical scaffold**, not an implemented financial health assessment or production-ready financial product.
