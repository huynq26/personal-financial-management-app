# Non-functional requirements — Financial Health App (draft)

**Status:** Draft, not approved. Initial implementation is synthetic-data-only until the privacy/security model and risk thresholds are accepted.

## Security and privacy
- Treat financial snapshot fields (income, debt, savings, net worth and obligation information) as sensitive user data.
- Do not store real user data in Vercel Preview or in repository issues/logs. Authenticate and authorize every read/write before adding persistence.
- Prevent cross-user access and test anonymous, unauthenticated and cross-account denial.
- Choose data residency, encryption, retention and deletion policies before accepting real data; do not expose secrets to CI or agent tasks.

## Correctness, explainability and auditability
- Every status must be derived from versioned, owner-reviewed financial rules with unit-tested boundaries and a source-input trace.
- Use monetary integer minor units or validated decimal arithmetic according to the currency; do not silently round or compare binary-floating-point money.
- Document cash-flow formulas including whether repayments are included in expenses. Exclude illiquid assets from emergency liquidity calculations.
- Show input freshness, confidence and reason codes; incomplete/contradictory data cannot silently yield a reassuring status.
- No unsupported numeric credit or financial-health scores, absolute guarantees, or regulated investment/borrowing recommendations.
- Maintain a test fixture matrix covering healthy, caution, risk, insufficient-data, contradictory and zero-denominator cases.

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

## Acceptance / status
Requirements and quantified thresholds need owner approval. QC verdict: **NOT RUN**. Pilot static dashboard is not a verified assessment.
