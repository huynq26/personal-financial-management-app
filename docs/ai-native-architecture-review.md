# AI-native architecture review — Household Financial Health MVP

- **Status:** G2 REVIEWED / REMAINING IMPLEMENTATION GATES BLOCKED; product-owner architecture decision already recorded on 2026-11-01. This review is a technical assessment, **not** independent security QC or release approval.
- **Product:** [factory idea #4](https://github.com/huynq26/software-factory/issues/4); product [draft PR #1](https://github.com/huynq26/personal-financial-management-app/pull/1)
- **Reviewed baseline:** `factory/nextjs-preview-starter` at `27465fd938131ebec35a842497349b876898719d`
- **Factory SDLC:** [proposed AI-native contract (factory PR #16)](https://github.com/huynq26/software-factory/pull/16), for owner review.

## 1. Goal and constraints

One adult manages a **single household** financial snapshot in exact VND, with local encrypted storage, liquidity/cash-flow/debt/net-worth insights and an explainable qualitative health assessment once thresholds are approved. Owner chose one device/browser and encrypted manual backup for initial MVP; no automatic sync or true online recovery. No personal family figures in development, logs, prompts or cloud.

**Non-goals:** bank integration, AI-generated financial recommendations, accounts for children, proprietary scoring model, cloud data processing, unapproved hosting, production release.

## 2. Options and reasoned selection

| Option | AI-native operability | Domain correctness / privacy | Cost and complexity | Choice |
| --- | --- | --- | --- | --- |
| A. Static Next.js/TypeScript UI on approved Vercel project + browser Web Crypto + encrypted IndexedDB | Agent-readable typed modules, pure deterministic domain math, versioned specs, unit CI and feasible Playwright browser tests | Local-only plaintext processing; ciphertext in browser; vulnerable to browser eviction, unsafe scripts and data loss without backups | Low operational complexity; no cloud DB or recovery | **Owner-selected MVP architecture**, conditional on QC |
| B. Vietnam-hosted API/Auth/Postgres with migration and server enforcement | Explicit API/data contracts make service testing and automation manageable | Multi-device/private access could be supported, but strict Vietnam location/backups and auth isolation need actual provider evidence | Hosting + auth + DB costs and ops; outside approved first MVP | Deferred cloud upgrade per ADR-0002 |

This architecture is already **AI-native for delivery** through modular deterministic code and machine-readable agent instructions, despite having **no runtime AI model**. There is no technical benefit in using a "special AI-native language" for encryption or arithmetic.

## 3. Modules, contracts, tool and trust boundaries

- Domain computations: `lib/household.ts`, integer VND decimal strings / BigInt. Pure calculations must remain deterministic; unknown differs from zero.
- Encryption: `lib/vault-crypto.ts`, PBKDF2/SHA-256 + AES-GCM and validated versioned ciphertext envelope; cryptography remains browser native, not an AI inference call.
- Browser storage: `lib/vault-store.ts`, IndexedDB only; must protect data integrity across tabs and asynchronous saves before accepting real data.
- UI: `app/page.tsx`, explicit local vault create/unlock/lock, household forms, encrypted backup export/import, warnings; no sensitive browser-to-server APIs.
- Release: static Next.js `output: 'export'`, GitHub Actions tests, approved Vercel **Preview only** until human authorization. Actual deployment target must be verified; never assume a requested Preview isn't Production.
- Agent source context: `AGENTS.md`, `docs/product.md`, `docs/nfr.md`, `specs/financial-health-assessment.md`, ADR-0003. Owner-approved scope and exact branch/SHA must be pinned for Codex execution.
- Current test/build commands: `npm run typecheck`, `npm test`, `npm run build`; no automated browser E2E wired in CI yet. No live agent/QC execution claimed.

### Runtime AI decision

**Not needed for the first MVP.** Financial status must be a versioned, owner-reviewed deterministic policy with transparent thresholds; [policy proposal PR #11](https://github.com/huynq26/personal-financial-management-app/pull/11) is draft and *not approved*. Keep a human reviewing any future optional explanation/assistant feature, with separate privacy, prompt safety, model evaluation and cost authorization.

## 4. Risk, concurrency and recovery review

| Risk | Current observed evidence | Required action before real-data launch |
| --- | --- | --- |
| HIGH: data loss when user edits during asynchronous save | `saveCurrent()` awaits encrypt/write and then resets visible form/dirty state | Fix, browser-test and independently review [Issue #12](https://github.com/huynq26/personal-financial-management-app/issues/12) |
| HIGH: concurrent-tab lost updates | Whole-document encrypted IndexedDB record overwritten by unconditional put without version conflict detection | One-writer or optimistic atomic revision guard + two-tab E2E in [Issue #12](https://github.com/huynq26/personal-financial-management-app/issues/12) |
| User error from sample-data overwrite | Sample-fill action can replace unsaved form data without confirmation | Confirm/disable in production mode, test Cancel preserves edits |
| Browser storage loss / passphrase loss | IndexedDB can be evicted; backups exist in UI but manual restore across browsers not independently verified | Full encrypted export-import recovery test, cross-browser and Safari/iOS retention tests |
| Private-data exfiltration | Current code intends local-only; static build alone does not prove no outbound requests | Independent browser network tracing with synthetic figures, CSP/supply-chain review |
| Unapproved health status | Qualitative thresholds not owner-approved | Owner policy choice, deterministic rule tests on exact SHA; never use model guesses |
| Preview vs production target confusion | Previous Vercel attempt targeted Production and was canceled | Verify and enforce correct Preview target *before* any next deployment |
| AI-agent trust/cost | Factory Codex dispatcher installed, no independent paid pilot run or credentials | Explicit owner-approved API budget and least-privileged secrets, bounded retries |

## 5. Automation-first independent QC plan

- CI: lint/typecheck/build/unit tests on the exact reviewed SHA, lockfile and deps security checks.
- E2E browser: create/lock/unlock, save/edit/reopen across months, injected storage failures, two-tab stale state, backup export on one browser context and import/recovery in another, wrong passphrase/corruption, deletion, keyboard/a11y and mobile Safari where available.
- Security/privacy: inspect DevTools/Playwright network requests and IndexedDB ciphertext only, no plaintext/keys/passphrase storage, no unsafe network/third-party script capture.
- Business correctness: VND precision, zero vs unknown, consolidated household totals, debt/essential cost double-counting, liquidity distinct from property net worth, policy boundary matrix once approved.
- Independent [QC #6](https://github.com/huynq26/personal-financial-management-app/issues/6) records PASS/FAIL/BLOCKED with executed run links and exact SHA; unit test/build green is not enough.

## 6. G2 conclusion and next work

**Architecture direction: acceptable for the owner-selected, one-device synthetic MVP.** Do not add runtime LLM, cloud database, or new coding language merely to claim "AI-native."

**G2 to G3/G4 release readiness: BLOCKED** until:
1. Data-integrity defect [#12](https://github.com/huynq26/personal-financial-management-app/issues/12) is fixed with browser test evidence.
2. Backup cross-browser restore and privacy/security QC [#6](https://github.com/huynq26/personal-financial-management-app/issues/6) are independently run.
3. Explicit qualitative financial-health policy approved from [PR #11](https://github.com/huynq26/personal-financial-management-app/pull/11) and implemented/tested.
4. Correct protected synthetic Preview verified per [#9](https://github.com/huynq26/personal-financial-management-app/issues/9), with actual deployment ID and no production-target confusion.
5. A separate real-data release and API budget/agent permissions are explicitly approved.

This is **an architecture document, not proof these gates are automated**. No real household financial records, model inference, billed Codex run, or release is authorized by this review.
