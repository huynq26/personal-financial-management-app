# Feature: Private household financial information intake and persistence

- Product: Household Financial Health App
- Product Agent owner: central `huynq26/software-factory`
- Scope choice: **Confirmed by product owner (2026-10-31)** — the application must collect financial information directly from the user (initially the owner), not rely on static demo data.
- Assessment scope: one **household/family**, VND; proposed MVP vault is local to one browser/device. Cloud account is a separate future option.
- Specification status: **DRAFT**. Storage technology, authentication design, financial status thresholds, release and privacy/security acceptance are not approved.
- Dependency: `specs/financial-health-assessment.md`.

## Primary outcome

The user opens the Vercel-hosted **static app**, unlocks a **local encrypted vault using a passphrase**, enters family financial figures, and saves encrypted snapshots to browser IndexedDB. Financial indicators run in the browser. This is **not a recoverable cloud login or remote database**, and the no-sync tradeoff needs explicit approval.

**Start with one adult managing one household on one device/browser, if local-first MVP is approved.** No cloud account, auto-sync, child identities, spouse invitation or passphrase recovery. This is a product scope choice, not authorization to ingest actual records until security is verified.

## Vercel MVP proposal — local-first, not cloud login

[ADR-0003](../docs/adr/0003-vercel-local-first-mvp.md) proposes Vercel hosting **static assets only**, with client-side encrypted IndexedDB and passphrase unlock. A passphrase unlock is not real authentication. The owner must accept single-device/no-sync limitations. Encrypted backup export/import with a tested restore is mandatory before any real records are entrusted to the app. Browser data can be evicted or cleared; malware, extensions and malicious deployment code can access unlocked data. Do **not** send financial amounts to Vercel functions or analytics.

**Local-first acceptance additions (draft):**
- [ ] Encrypt the household record with reviewed Web Crypto authenticated encryption and password key derivation; store ciphertext only; reject wrong passphrase/corrupt ciphertext.
- [ ] Encrypted export/import roundtrip reproduces the same snapshot from a fresh browser profile; document permanent loss if both vault and backup are lost.
- [ ] Static build contains no financial API/server actions, no unauthorized outbound financial network requests, and no production secrets.
- [ ] Test browser storage eviction and iOS data loss; show backup reminder and storage persistence state where supported.
- [ ] Same-origin vault and passphrase are distinct from online identity and cross-device sync.
- [ ] Real-data use is blocked until crypto/security/privacy/QC PASS and owner's release decision.

## Proposed onboarding and editing flow

1. Welcome screen explains local-only storage, browser data loss, device backups and a **strong local vault passphrase**; require unlock before entering or viewing financial figures. This is not online sign-in.
2. Household setup: default one household, optional count of adults/dependents (no identifying details required), VND, and snapshot effective month/as-of date.
3. Guided steps with back/next, save-draft and contextual help:
   - **Income:** combined average monthly *net* household income, optionally multiple sources; mark irregular earnings or seasonality if known.
   - **Monthly living expenses:** essential family costs (food, housing, utilities, childcare/education, healthcare, transportation) plus discretionary costs. Loan repayments entered in the debt section must not be entered as expenses again.
   - **Debt and upcoming obligations:** required monthly repayments, remaining outstanding balances, any arrears/overdue obligations; duplicate shared loans count once.
   - **Liquid safety reserves:** cash and savings **available for household needs**; separately identify deposits inaccessible/locked or restricted.
   - **Assets:** property, investments, vehicles and other assets, with estimated value, valuation date and accessibility. Mark shared assets so each counts once.
   - **Liabilities:** outstanding debts/other obligations without duplicating debt balances already recorded.
4. Review a summary screen showing inputs, assumptions, missing information and the calculation period. Offer an edit control for each section.
5. In the proposed local-first mode, validate and **encrypt** the snapshot, commit ciphertext to IndexedDB and confirm only when the local storage transaction succeeds. Cloud mode (later) requires authenticated server-confirmed writes.
6. Calculate financial indicators and, when all essential inputs and approved policy values exist, show Healthy / Caution / At Risk with **why**, contributing ratios, warnings and general improvement steps. Otherwise show **Insufficient Data** with the missing inputs.
7. Return later to review/change the snapshot, and explicitly delete it or the entire personal dataset.

## Minimal field definitions (design proposal)

| Field | Input form | Validation / meaning |
| --- | --- | --- |
| Household period / as-of date | Month + date | Required; do not silently substitute a different period |
| Monthly net income | VND amount, optional multiple sources | Required for household ratios; distinguish no income from unknown |
| Essential monthly living costs | VND amount or category totals | Required; exclude debt repayments recorded separately |
| Discretionary monthly spending | VND amount | Optional if known; unknown must not be treated as zero without disclosure |
| Required monthly debt payments | VND amount | Required or explicit zero; includes family-affecting obligations |
| Total outstanding debt | VND amount | Required or explicit zero; no duplicated shared debts |
| Accessible liquid savings | VND amount | Required or explicit zero; excludes illiquid/restricted balances |
| Other assets | VND valuation(s) and dates | Optional for basic liquidity assessment; missing assets limit completeness of net-worth output |
| Overdue bills/payments | Yes / No / Unknown and optional amount | Used in risk flags; Unknown is not No |
| Household adult/dependent count | Non-identifying counts | Optional context, never mandatory child identity |

Use exact whole-VND amounts with input formatting that distinguishes 1000000 from 1.000.000; do not accept silently rounded fractional values. Explicit **Unknown / Not provided** is distinct from **0**. Field grouping must be understandable to a non-accountant.

## Vietnam-resident data requirement (confirmed 2026-10-31)

The owner specifically requires **household financial data to remain stored in Vietnam**. Any production database, replica, backup, retention archive, private logs or export with sensitive figures must be in a verified Vietnam datacenter. The proposed production architecture also hosts the private app APIs and self-hosted Better Auth in Vietnam; Vercel may be used only for synthetic previews, not private production SSR/functions. See [ADR-0002](../docs/adr/0002-vietnam-data-residency.md).

- [ ] Given a selected provider, the Platform Agent documents physical location of DB, replicas, backup/restore and financial logs and collects evidence.
- [ ] Given production private-data requests, the application and auth runtime run in Vietnam; no unapproved third-party foreign processors or email/SMS logging receive the submitted values.
- [ ] Given protected Vercel Preview or GitHub CI, no real financial amounts, real auth cookies or production secrets are ever present.
- [ ] Given recovery/deletion, backups and restores remain in Vietnamese storage locations and meet the disclosed retention schedule.

## Persistence and privacy contract

- **Local-first:** one passphrase-encrypted household vault on the device; it does **not** authenticate an online identity. Cloud mode later requires real auth, private owner identity and account isolation.
- **Local-first:** only AES-GCM ciphertext, unique nonces, a salt and KDF parameters stored in IndexedDB; keys/passphrase and plaintext never persisted. **Cloud mode:** Vietnam database with auth/ownership checks, after approved architecture.
- In transit: HTTPS only; protect cookies/session state and mutations against common web vulnerabilities (CSRF where applicable, input validation, access controls).
- **Local-first:** records stay on user device in Vietnam, unless browser/OS cloud backups sync them abroad. Vercel must not receive amounts. **Cloud mode:** prove Vietnam residency for DB/replicas/backups/logs. Do not claim compliance from location alone.
- Minimize fields; never request bank credentials, account passwords, identity card numbers, children's names or bank account numbers to compute household status.
- Never send household figures to analytics, logs, error monitoring, CI artifacts or AI model prompts by default. Any LLM-based analysis of actual values requires separately disclosed/approved data handling.
- Provide user-facing data review, editing, deletion, retention explanation and export as a candidate requirement (format/access to be finalized by Platform).
- Backups and recovery must preserve deletion/retention commitments; describe realistic timeframes before production.
- Keep synthetic examples and local development fixtures completely separate from real private records.

## Acceptance criteria — draft for Platform + QC

- [ ] Given a new local vault, the user creates a passphrase and receives blank household intake; no fictional or other user's figures are preloaded.
- [ ] Given wrong passphrase or locked local vault, the app cannot decrypt figures. No server endpoint exists to read/write private finance data in local-first mode.
- [ ] In local-first mode other browser profiles/origins have no access to the same-origin encrypted vault. Browser extensions and malicious app code remain documented risks. Cloud mode requires cross-account negative tests.
- [ ] Given correct form data, only ciphertext persists locally and the exact figures are recovered after reload and passphrase unlock.
- [ ] Given browser quota/IndexedDB write failure, the app does not show save success. User can retry without creating duplicate month records.
- [ ] Given required information is **Unknown**, the assessment is marked Insufficient Data or explicitly qualified, never silently treating missing amounts as zero.
- [ ] Given a user edits one input, resulting metrics and status are recalculated from the stored latest snapshot using an approved versioned policy.
- [ ] Given a user enters formatted VND figures, the exact whole-đồng value persists and displays consistently without precision loss.
- [ ] Given family transfers, shared assets or debts, the app does not double-count them in income, emergency liquidity or net worth.
- [ ] Given local vault deletion, active IndexedDB ciphertext is removed; app warns separately exported backups must also be deleted by owner.
- [ ] Given a test or preview environment, only synthetic fixture financial data is permitted. Real household data is rejected/not imported into preview.
- [ ] Given actual user household data, no raw values appear in operational logs, CI outputs, telemetry, public error responses or analytics.

## MVP exclusions

No detailed daily transaction ledger, bank synchronization, family member invitations, shared login, investment execution, loan approval/credit scoring, third-party financial-data sharing or automatic market news recommendations.

## Platform handoff (not decided)

Platform Agent must produce an ADR covering authentication/session management, secure database and household ownership enforcement, app data model, data residency and retention, backups, secret isolation, audit-friendly changes, rate limits, breach/restore procedure and Vercel Preview vs Production environment separation. **Do not deploy a form that accepts real sensitive information before security and QC gates pass.**

## Product owner decisions captured

1. Household/family financial-health assessment: **Approved as scope**.
2. Primary currency VND: **Approved as scope**.
3. User manually enters financial information and stores it privately: **confirmed product goal**. Local passphrase + encrypted IndexedDB is a proposed simplification, not yet explicit approval to abandon multi-device cloud access.
4. Risk-policy thresholds, data retention/export, exact schema, auth and hosting implementation, and launch with real data: **Pending detailed review**.
