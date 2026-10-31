# Non-functional requirements — Financial Health App (draft)

**Status:** Draft, not approved for implementation. **Household assessment unit approved as a scope choice on 2026-10-31.** Initial implementation is synthetic-data-only until the privacy/security model and risk thresholds are accepted.

## Security and privacy
- Treat consolidated family income, expenses, debt, savings, net worth, ownership/access flags and information about dependents as sensitive household data. Do not require children's names or identifying details for an assessment.
- Do not store real user data in Vercel Preview or in repository issues/logs. Authenticate and authorize every read/write before adding persistence.
- Treat one household as a separate authorization boundary. Deny cross-household access; initially permit only the authorized managing account, with any future invited-adult sharing subject to explicit permissions and consent. Test unauthorized, unauthenticated, and cross-household access.
- Choose data residency, encryption, retention and deletion policies before accepting real data; do not expose secrets to CI or agent tasks.

## Correctness, explainability and auditability
- Every status must be derived from versioned, owner-reviewed financial rules with unit-tested boundaries and a source-input trace.
- Use monetary integer minor units or validated decimal arithmetic according to the currency; do not silently round or compare binary-floating-point money.
- Use combined net household income, essential/discretionary family expenses and total obligations affecting the family. Avoid counting transfers between household members, jointly held assets, shared debts or debt repayments twice. Exclude illiquid and inaccessible individually held assets from available emergency reserves.
- Show input freshness, confidence and reason codes; incomplete/contradictory data cannot silently yield a reassuring status.
- No unsupported numeric credit or financial-health scores, absolute guarantees, or regulated investment/borrowing recommendations.
- Maintain a test fixture matrix covering healthy, caution, risk, insufficient-data, contradictory and zero-denominator cases, plus households with multiple income sources, dependents, restricted savings and jointly held assets/debts.

## Accessibility and usability
- Semantic HTML, screen reader labels, keyboard operation, explicit text alongside any risk colors, helpful validation errors.
- Explain risk in plain language, avoid alarming certainty and display meaningful next steps.

## Reliability and performance
- Time-box risk assessment processing and define p95 response targets once deployment/traffic assumptions are known.
- Reproducible computations from snapshots and policy versions; avoid partial saves, duplicate updates or stale assessments.
- QC validates error paths, graceful degradation and release rollback.

## Monitoring and costs
- Capture operational errors without revealing financial amounts or PII; define alerting and cost budgets before production.
- Vercel preview builds and smoke tests use synthetic fixtures only.

## Household modeling and data minimization
- The household is the unit of financial assessment. Do not produce separate adult/child health scores in the MVP.
- Collect only what is necessary: one household record, optional household/dependent counts, consolidated amounts and explicit ownership/accessibility flags for assets and debts where relevant.
- Joint ownership must not imply that one adult automatically has access to another adult's private financial details; future multi-user sharing needs specific access design and consent.
- Define rules for which individually owned assets/debts affect family cash-flow risk and aggregate wealth, and make assumptions transparent.

## Acceptance / status
Requirements and quantified thresholds need owner approval. QC verdict: **NOT RUN**. Pilot static dashboard is not a verified assessment.
