# Non-functional requirements — Financial Health App (draft)

**Status:** Draft, not approved for implementation. **Household assessment, VND and private real-data intake/persistence are confirmed product directions (2026-10-31).** Preview/tests remain synthetic-data-only; the actual product must not accept real data until security controls and QC are approved.

## Security and privacy
- Treat consolidated family income, expenses, debt, savings, net worth, ownership/access flags and information about dependents as sensitive household data. Do not require children's names or identifying details for an assessment.
- The actual application **must securely persist authenticated user-entered household financial information**. Before any real data is accepted, enforce server-side authentication and ownership checks for **every** create/read/update/delete. Vercel Preview, fixtures and GitHub issues/logs use **synthetic data only**.
- Treat one household as a separate authorization boundary. Deny cross-household access; initially permit only the authorized managing account, with any future invited-adult sharing subject to explicit permissions and consent. Test unauthorized, unauthenticated, and cross-household access.
- Select and document database region, encryption in transit/at rest, least-privileged server credentials, retention, export and deletion/backup handling **before enabling production data capture**; do not expose secrets to CI or agents. No raw household figures in analytics, logs or AI prompts by default.

## Correctness, explainability and auditability
- Every status must be derived from versioned, owner-reviewed financial rules with unit-tested boundaries and a source-input trace.
- Initial MVP monetary reporting/entry is **VND**. Use exact whole-đồng values (safe integers or validated decimal representation within explicitly supported bounds); do not silently round, overflow or calculate currency amounts using imprecise binary-floating-point money. Reject unsupported mixed-currency aggregation. Native multi-currency and automatic FX are deferred.
- Use combined net household income, essential/discretionary family expenses and total obligations affecting the family. Avoid counting transfers between household members, jointly held assets, shared debts or debt repayments twice. Exclude illiquid and inaccessible individually held assets from available emergency reserves.
- Show input freshness, confidence and reason codes; incomplete/contradictory data cannot silently yield a reassuring status.
- No unsupported numeric credit or financial-health scores, absolute guarantees, or regulated investment/borrowing recommendations.
- Maintain a test fixture matrix covering healthy, caution, risk, insufficient-data, contradictory and zero-denominator cases, plus households with multiple income sources, dependents, restricted savings and jointly held assets/debts.

## Secure persistence and identity acceptance
- One authenticated adult account manages one household in MVP. No spouse invitations or household sharing by default; avoid collecting child identifiers.
- Persist each snapshot in a private database. Validate VND amounts on the server, guard against mass assignment/ID tampering, enforce per-account household isolation, and avoid exposing financial amounts through API errors.
- On update, calculations must derive from the stored latest snapshot and an approved versioned risk policy. A write failure must not show success or create duplicate snapshots.
- Make viewing, editing, requesting deletion, and retention terms clear. Backup erasure/recovery constraints must be disclosed accurately.
- Security/QC verify cross-household access denial, safe session handling, HTTPS, misuse protection, and no PII/financial amounts in Vercel logs, preview or telemetry.

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

## VND correctness and QA
- Test VND input parsing and formatting (Vietnamese separators, whole đồng, zero, invalid fractional or negative figures as applicable) without confusing thousands separators or changing magnitude.
- Ensure source currency/valuation dates are traceable when external asset valuations are manually provided in VND; never invent an FX rate.
- Verify threshold rules compare homogeneous VND amounts, with no implicit cross-currency addition.

## Household modeling and data minimization
- The household is the unit of financial assessment. Do not produce separate adult/child health scores in the MVP.
- Collect only what is necessary: one household record, optional household/dependent counts, consolidated amounts and explicit ownership/accessibility flags for assets and debts where relevant.
- Joint ownership must not imply that one adult automatically has access to another adult's private financial details; future multi-user sharing needs specific access design and consent.
- Define rules for which individually owned assets/debts affect family cash-flow risk and aggregate wealth, and make assumptions transparent.

## Acceptance / status
Requirements and quantified thresholds need owner approval. QC verdict: **NOT RUN**. Pilot static dashboard is not a verified assessment.
