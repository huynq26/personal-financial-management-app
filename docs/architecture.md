# Household Financial Health App — Vercel-first MVP architecture

**Status:** Platform Agent proposal, not final approval or real-data release.  
**Confirmed owner requirements:** one household, VND, direct owner-entered financial figures, storage in Vietnam.  
**New preference:** use Vercel for the MVP with the simplest authentication/data solution.

## Primary recommendation — no server for the pilot

**[ADR-0003: Vercel static site + encrypted browser-local vault](adr/0003-vercel-local-first-mvp.md)** is the recommended **free MVP option**, conditional on accepting one browser/device and no cloud synchronization.

```text
Vercel Hobby: static Next.js HTML/CSS/JS only (no private APIs/SSR)
                         |
                         v
Browser on owner's device in Vietnam
   [local passphrase unlock — NOT cloud identity/login]
   [browser Web Crypto encryption AES-GCM]
   [encrypted IndexedDB household snapshots]
   [local VND financial calculations]
   [encrypted backup export/import]
```

- No cloud database or paid Vietnamese VM is required for a strictly **single-device pilot**.
- Household financial amounts are never sent to Vercel, GitHub CI, any server or analytics. The application must not include server actions or network endpoints for private data.
- Financial records are stored locally in the browser and therefore in Vietnam **if the device remains physically in Vietnam and OS/cloud backups or sync do not transfer copies abroad**.
- **Critical caveat:** browser storage can be cleared or evicted. Encrypted backup export/import and test restore are mandatory before real personal financial use. A local passphrase unlock is not a recoverable online account.
- Untrusted scripts, compromised deployments or browser extensions can still leak decrypted values. A proper code/CSP/no-analytics review and pinning reviewed releases is required.
- The existing preview and draft app contain fictional sample values only, and the encrypted local vault is **not implemented yet**.
- Owner must confirm the no-sync, single-device tradeoff before we activate local real-data collection. A free host is not proof of financial data safety.

## Cloud synchronization / multi-device upgrade

If the owner needs logins and the same data on multiple devices, revert to **[ADR-0002: Vietnam-hosted private app/Better Auth/PostgreSQL](adr/0002-vietnam-data-residency.md)**. This requires running and paying for a Vietnam-hosted API/database, validating backups, logs and other private data flows. Vercel could still host a static frontend, but never production private SSR/functions outside Vietnam under the residency priority.

Earlier **[ADR-0001 Supabase Singapore](adr/0001-household-auth-and-storage.md)** remains superseded, since that hosted-data location conflicts with the owner priority.

## MVP data and quality

- Entry: combined family incomes, essential/discretionary monthly costs, debt repayments/total balance, available savings, assets/liabilities, overdue status and as-of date. Only one private household vault.
- Money uses exact VND whole-đồng strings; do not count joint assets, internal transfers or debt payments twice.
- Missing amounts are not automatically zero. Show transparent household summary; financial risk statuses remain disabled pending versioned, owner-approved thresholds.
- Browser in-memory computations must not persist plaintext anywhere (localStorage, IndexedDB, browser caches or URLs).
- [Local privacy and QC release gates](security/private-data-qc-gates.md), [private intake specification](../specs/private-household-financial-intake.md).

## Software factory workflow

1. Product Agent confirms requirements (**done**), including Vietnam locality.
2. Platform Agent has proposed low-cost local-first [ADR-0003](adr/0003-vercel-local-first-mvp.md) and retained cloud [ADR-0002](adr/0002-vietnam-data-residency.md) as fallback.
3. Owner decides whether single-device/no-sync and encrypted backup are acceptable.
4. Codex implements local vault, client-only financial forms, encryption, export/import and calculation tests on isolated branch; **use synthetic data exclusively before QC**.
5. QC tests crypto, device storage/eviction recovery, browser support, no sensitive network traffic, local-only data boundaries and financial calculation correctness.
6. DevOps deploys a reviewed **static** Vercel build with stable origin, deployment protections, CSP and no private API routes, after QC and explicit approval to use real data.

**No password, financial account information, credentials or user household amounts should be pasted into GitHub issues or PRs.**
