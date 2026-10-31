# QC gate — encrypted local-first financial vault on Vercel

**Status:** Draft test plan, NOT EXECUTED. No real household data permitted until an independently reviewed release and owner sign-off.

**Proposed architecture:** [ADR-0003 — Vercel static + encrypted IndexedDB](../adr/0003-vercel-local-first-mvp.md). The original [server-side QC matrix](private-data-qc-gates.md) remains relevant only if a Vietnam-hosted cloud backend (ADR-0002) is implemented.

## Critical tests

| ID | Required independent verification |
| --- | --- |
| STATIC-01 | Production build contains only static JS/CSS/HTML, **no server functions, API routes or Server Actions receiving financial amounts** |
| STATIC-02 | Under browser network inspection, create/unlock/save/edit/view/export/delete never sends actual household amounts or vault/passphrase secrets to Vercel or any third party |
| STATIC-03 | Deployment CSP, dependency audit, version pinning and source review mitigate script injection/supply-chain risk; acknowledge compromised served JS can steal unlocked data |
| CRYPTO-01 | New vault derives an authenticated-encryption key using vetted KDF parameters, random per-vault salt, and AES-GCM with unique random IV for each encryption |
| CRYPTO-02 | IndexedDB stores **ciphertext only**, never plaintext amounts, passphrase or derived key; audit localStorage, browser cache, error reporting, URL and logs |
| CRYPTO-03 | Wrong passphrase or modified ciphertext produces an authentication/decryption error; no silent corruption/partial acceptance |
| CRYPTO-04 | Lock clears accessible decrypted state; fresh page requires passphrase; warn that local unlock does not grant a recoverable cloud account |
| STORE-01 | Save, edit, delete, refresh and reload roundtrip preserve exact whole VND values and distinguish missing/null from zero |
| STORE-02 | Browser storage full, quota exceeded, offline mode, incognito and device storage eviction are handled without false 'Saved' claims |
| STORE-03 | Request browser storage persistence where possible and display accurate status; browser may still delete data |
| BACKUP-01 | Encrypted export/import survives moving to a new device/browser and verifies integrity; corrupted or wrong-passphrase backup fails safely |
| BACKUP-02 | Before first real-data use, user confirms a **tested encrypted backup** stored in a user-controlled Vietnamese location, not an overseas sync provider |
| BACKUP-03 | UI clearly explains passphrase loss, browser clearing, uninstall, Safari/iOS eviction and no automatic cross-device sync |
| RES-01 | Test on a device physically in Vietnam and review device/browser/OS cloud backups so financial ciphertext is not automatically copied abroad contrary to owner's preference |
| FIN-01 | VND calculations, family ownership/double-counting, indebtedness, asset liquidity and missing inputs match approved deterministic fixtures |
| FIN-02 | Healthy/Caution/At Risk **not displayed** without explicit versioned, owner-approved threshold policy |
| UX-01 | Keyboard/screen-reader UX, validation messages, empty/error states, lock/unlock and backup flow tested |
| RELEASE-01 | Fixed reviewed commit, stable origin, HTTPS, no third-party analytics/exfiltration and an explicit owner consent for single-device storage |

## Risk acceptance before real data

- This architecture **does not support real online authentication or automatic syncing**.
- A person who can access an unlocked device/browser or compromised script may access household data.
- IndexedDB storage is subject to eviction/clearing and is **not a backup**.
- Vercel hosting serves code from abroad; although data need never be sent to Vercel, that deployed code remains a trust boundary.
- Device/OS cloud backups may copy even encrypted local data overseas. Explicitly document user's configuration and limitations.

## Required evidence
Record the reviewed deployment SHA and static artifact contents; browser network traces with **synthetic data only**; encryption tests, backup restore logs without secrets, Safari/iOS behavior, decision-table tests and any residual security risks. Final result PASS/FAIL/BLOCKED, owner acceptance reference, and date.

**No QC results are claimed by this document.**
