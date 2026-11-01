# ADR-0003 — Free Vercel MVP with encrypted local-first household storage

- **Status:** **Owner accepted local-first single-device architecture on 2026-11-01; implementation and real-data release remain pending security/QC.**
- **Owner's latest direction:** Use Vercel for the MVP, with **simple authentication and database** and keep household financial data stored in Vietnam.
- **Applies to:** one adult, one household, VND financial snapshot and health indicators.
- **Previous plan:** [ADR-0002](0002-vietnam-data-residency.md) remains the preferred design **if cloud storage, multi-device sync or real server authentication becomes necessary**. No overseas private data processing is approved.
- **This ADR does not authorize collection of real amounts until privacy/security/data-loss gates are independently verified.**

## Motivation

The pilot has one user and small, manually entered household snapshots. A Vietnam-hosted VM, managed PostgreSQL and self-hosted Better Auth create hosting cost and infrastructure work that need not be paid before the product is validated. Vercel's Hobby plan is free for eligible personal/non-commercial usage, but its managed compute has no Vietnam production region. Vercel Functions do **not** provide a persistent application database.

**Simplest compatible pilot:** host the app's static frontend on Vercel, perform all personal financial calculations **in the browser**, and store encrypted snapshots in the user's device's IndexedDB. No remote production database, identity provider or Vercel Function touches financial records.

```text
Vercel (free static Next.js deployment)
  | serves only application HTML/CSS/JS; no financial APIs or analytics
  v
Browser on user's device in Vietnam
  | create/unlock vault using user-chosen strong passphrase (LOCAL, not server login)
  | Web Crypto API: password-derived key -> AES-GCM authenticated encryption
  | encrypted IndexedDB database for household VND snapshots
  | calculate indicators locally from transient plaintext after unlock
  +-- encrypted export/import file, stored by user in Vietnam
```

## Explicit comparison

| Option | Auth | Data source | Residency / tradeoff | Direction |
| --- | --- | --- | --- | --- |
| A. **Vercel static app + local encrypted IndexedDB** | Local passphrase unlock (**not an online user account**) | Browser/device + user-owned encrypted backups | No financial dataset is uploaded by the app. Only one browser/device, subject to browser eviction and software supply-chain risk | **Preferred FREE MVP**, pending owner consent to no sync |
| B. Vercel + hosted Supabase/Firebase auth/database | Cloud identity | Cloud database, often outside Vietnam | Convenient sync but **violates owner's strict Vietnam storage preference** unless provider proves all required regions locally | Not recommended |
| C. Vercel static frontend + private VN API & VN Postgres/Better Auth | Real login | Vietnam DB and compute | Multi-device sync and resilience; paid VN hosting and more operations; safe only when app never sends plaintext to Vercel functions or foreign services | Upgrade path |
| D. Full VN-hosted app + auth/DB (ADR-0002) | Real login | VN Postgres | Strictest compute/data-locality control; higher overhead | Future production if required |

## Authentication, encryption and data format

- Present **Create a local vault** and **Unlock** screens, not misleading online `Sign in`. Local passphrase alone does not verify identity with a remote service, recover a forgotten password, restrict someone from deleting a browser database, or protect against malicious JavaScript loaded from the hosting origin.
- Require a strong, memorable passphrase, with clear guidance that it **cannot be recovered**. Do not store the passphrase, derived plaintext key or household amounts in URLs, logs, localStorage, remote error trackers or app analytics.
- Use browser-native `crypto.subtle` and **authenticated encryption AES-GCM** with fresh random 96-bit IV per encryption and versioned envelope. Derive keys from user passphrase with a reviewed, suitably calibrated KDF (Web Crypto PBKDF2 with a per-vault random salt + strong iteration parameters, or vetted Argon2id WASM after dependency security review). Store only ciphertext + salt + IV + format metadata in IndexedDB.
- Preserve data integrity with AES-GCM authentication. Validate schema/amounts before encryption and again after decrypt. Never use plain hashing as encryption; never invent a custom crypto primitive.
- Client-only deterministic VND calculations; use exact whole-đồng decimal strings/BigInt. Never expose actual financial data to Next.js Server Actions, route handlers, Vercel Functions, third-party scripts, CDN analytics, AI APIs or telemetry.
- Configure Next.js as **static export** (`output: 'export'`) for the data-entry build and prohibit private API routes/SSR. No account secrets or DB credentials. Deploy approved static assets only to a stable origin.
- Use Content Security Policy, minimize third-party JS/dependencies, pin reviewed app versions, apply dependency updates cautiously and test no network requests carry user data. **A compromised/malicious application update can still read decrypted data after unlock**. Local encryption is not an absolute guarantee against supply-chain attacks.

## Reliability and backup (non-negotiable)

- Browser IndexedDB may be evicted or erased by browser settings, device resets, Safari/iOS storage policy or origin changes. **It is not a reliable sole backup.**
- Offer **export encrypted backup** and **import/restore** via local file. Do not export plaintext VND figures by default.
- Warn about forgotten passphrase and data loss; encourage storing encrypted backup on a user-controlled storage medium physically in Vietnam. Verify backup integrity and successful test restoration prior to real financial use.
- Request `navigator.storage.persist()` when supported but do not assume it prevents all loss; display persistence/backup status and an explicit reminder after edits.
- Ensure correct origin: changing from one Vercel preview domain to another is a new IndexedDB origin and **does not carry over** stored household data. Real usage needs a stable, explicitly approved production/static URL. Preview branches use only fictional data.
- Device/OS/browser cloud backups (including browser sync) may export encrypted records abroad without the app's knowledge. Users must review these settings for **strict Vietnam-only storage**.
- Device loss or browser data clearing means the household records can be recovered **only from the encrypted user-held export**. No automatic cross-device sync.
- For longer-term financial records or seamless access from multiple devices, migrate through an explicit locally decrypted-and-user-approved export to a Vietnam-hosted backend per ADR-0002.

## Data model and user flow

- Exactly one household vault; no member accounts, no API identity.
- Data record: snapshot month, as-of date, family net income, essential/discretionary expenses, debt payments, total debt, available liquid reserves, total assets/liabilities, overdue flag, optional dependents count. Validate exact whole VND and null-versus-zero distinction.
- After unlocking the vault, user adds/edits/reviews family figures, sees cash-flow / debt burden / emergency coverage / net worth. **Healthy/Caution/At Risk** labels remain unavailable until versioned thresholds are explicitly approved.
- Lock clears decrypted in-memory state on explicit lock/logout and on full app reload. Never keep financial plaintext in service-worker caches or browser histories.
- Deletion deletes the local encrypted vault and warns about separately exported backups.

## QC gates to enable REAL local data

1. Static deployment validation: no secret app functions, server-side APIs, server actions, tracking scripts, or outbound requests with financial amounts.
2. Crypto review: KDF, salt/nonce generation, AEAD encryption/decryption, passphrase failures, corrupt ciphertext, no plaintext persistence, safe locking and memory lifecycle.
3. Isolation: another device/browser or another origin cannot silently access the user's vault; threat review for compromised scripts/extensions/malware.
4. Backup: encrypted export + import restore, passphrase mismatch, corruption detection, storage eviction simulation and iOS Safari tests.
5. Functional: VND exact input and summaries, missing values, family consolidation, debt and liquidity calculation without rounding errors.
6. UX: accessible passphrase form, recovery warnings, backup prompts, privacy notice and deletion guidance.
7. Security acceptance on a **fixed reviewed release commit**; owner approves local-only device data-loss tradeoff and real-data usage before release.

**Do not deploy a real-data collection form simply because Vercel hosting is free.**

## Owner decision required

- [x] **Confirmed by owner (2026-11-01):** local encrypted vault on one browser/device is acceptable; no automatic cross-device sync for MVP.
- [x] **Acknowledged as the design:** passphrase unlock is local protection and **not** online authentication; no remote account recovery.
- [x] Encrypted manual backup/restore is included in the accepted local-first design; there is **no provider recovery**. **Actual encrypted backup and restoration have NOT been implemented or tested.**
- [ ] Approve a reviewed, stable Vercel static release for **real financial-data entry only after independent crypto, backup/restore, privacy and security QC PASS**.

## References
- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/functions/runtimes
- https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey
- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
- https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
