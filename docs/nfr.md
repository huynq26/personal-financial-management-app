# Non-functional requirements — Financial Health App (draft)

**Status:** Draft security/implementation approval. Confirmed direction: one household, VND, owner-entered private figures, Vietnam storage preference. **Vercel static + encrypted local IndexedDB is proposed for MVP under ADR-0003; a cloud account/database is optional later under ADR-0002.** Preview/tests remain synthetic only until QC passes.

## Vietnam storage residency (confirmed owner requirement, 2026-10-31)
- **Local-first proposal (ADR-0003):** all real records stay encrypted in the browser IndexedDB on the user's Vietnam-located device, with user-controlled encrypted backup export stored in Vietnam. The app must not upload figures to Vercel or other providers. OS/browser sync and overseas backups remain a user-configured risk that must be disclosed.
- **Cloud-sync alternative (ADR-0002):** primary database, replicas, backups, copies, financial logs and exports must be verified physically hosted in Vietnam. The provider's nationality alone is insufficient.
- For local-first MVP, **no private Next.js SSR/Functions/API** may process household amounts; Vercel serves static assets only. A local passphrase unlock (not online authentication) decrypts records on device. For cloud sync later, use Vietnam-hosted app/API and Better Auth per [ADR-0002](adr/0002-vietnam-data-residency.md).
- Logs may be stored abroad only if independently proven to contain **no** private financial/identity information and legally reviewed. Avoid sending figures to third-party analytics, email/OTP, CDN, error reporting, provider support or AI systems by default.
- Vercel **PR previews** and GitHub CI remain synthetic-only. A separately reviewed **static-only Vercel release** may be used for *client-local real data* only after crypto, backup, no-exfiltration and privacy/QC gates PASS and owner approves. Review applicable Vietnam privacy rules; hosting/storing data in VN is not a compliance guarantee.

## Security and privacy
- Treat consolidated family income, expenses, debt, savings, net worth, ownership/access flags and information about dependents as sensitive household data. Do not require children's names or identifying details for an assessment.
- **Local-first MVP:** the user enters figures after creating/unlocking an encrypted local vault. Encrypt with vetted browser Web Crypto APIs; IndexedDB stores ciphertext only. **This is not server authentication**. No Vercel Function, remote database, analytics, or network request may receive household figures. Development previews, fixtures and GitHub remain synthetic-only.
- **Cloud mode (later):** before any real remote data is accepted, enforce server-side authentication and owner checks on every CRUD operation, plus approved Vietnam data residency.
- Local-first: one encrypted household vault, one browser/device, no shared account or syncing. No claim that a passphrase is an online account or protects against malicious app code/browser extensions. Cloud mode: enforce per-account household authorization and cross-owner denial.
- Local-first: require encrypted backup export/import, restoration tests, clear passphrase/data-loss warnings, storage eviction testing (including iOS), and browser storage persistence checks. No keys, plaintext values or personal finance records in analytics, logs, GitHub or AI prompts. Cloud mode later: review database region, encryption, account isolation and retention/export/deletion before launch.

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
