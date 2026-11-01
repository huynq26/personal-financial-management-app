# QC Agent — Vietnam-resident private household finance release gates

**State: test plan only, NOT EXECUTED.** No customer/owner financial data in fixtures, previews, screenshots or GitHub.

**Architecture under test:** [ADR-0002](../adr/0002-vietnam-data-residency.md): Vietnam-hosted Next.js + self-hosted Better Auth + Vietnam-hosted managed PostgreSQL. **ADR-0001 (Supabase Singapore) is superseded.**

## Critical security / functional matrix

| ID | Test / expected result | Evidence |
| --- | --- | --- |
| AUTH-01 | Public signup disabled and only manually authorized adult can use production app | Better Auth runtime config and synthetic owner login |
| AUTH-02 | Anonymous, expired/forged cookies or invalid MFA cannot access finance pages/APIs | Negative integration/E2E tests |
| AUTH-03 | Logout/revocation blocks further access; no private data is cached publicly | Browser/network cache review |
| AUTH-04 | Auth/session data is in Vietnam; if TOTP MFA enabled, backup codes stored safely | Hosting + database evidence, security review |
| TENANT-01 | User A may CRUD own household; synthetic B cannot read/write/delete or enumerate A's data | API integration tests all verbs |
| TENANT-02 | Database grants restrict runtime role; app derives owner ID from verified session, not request body | SQL role review, ownership forgery tests |
| TENANT-03 | If using PostgreSQL RLS with session tenant context, prove SET LOCAL is transaction-scoped and safe under pooling; role cannot BYPASSRLS | 2-identity SQL tests / pgTAP |
| VAL-01 | Exact whole-VND persisted as decimal strings, no precision loss, overflow, or implicit FX | Boundary roundtrip tests |
| VAL-02 | Negative/invalid/unknown inputs handled safely; missing is never implicitly zero | Tests |
| VAL-03 | Household transfers, jointly held assets and debt payments are not double counted | Approved test fixtures |
| PERS-01 | Saves, edits and reloads survive re-login; retry doesn't duplicate month | API/E2E |
| PERS-02 | Concurrent edits report revision conflicts, no silent overwrites | Integration |
| PERS-03 | Delete removes active data; recovery and backup retention consistent with disclosed policy | DB/API + recovery test |
| RES-01 | Primary DB and replicas are physically in Vietnam; evidence from contract/provider console | Region/country evidence |
| RES-02 | All backups, restore copies, exports containing private data are stored in Vietnam | Provider config + restore evidence |
| RES-03 | Production Next.js and Better Auth run in Vietnam; no Vercel SSR/functions or other foreign private-data API | Runtime/hosting review |
| RES-04 | Log storage, error traces and operational monitoring are in Vietnam or contain zero sensitive personal financial data | Traffic/data-flow audit |
| RES-05 | Email/SMS, analytics, DNS/CDN, auth MFA and vendor support flows have cross-border impact assessed; no sensitive data transmitted abroad without review | Vendor/data-flow map |
| ENV-01 | GitHub CI and Vercel Preview use synthetic-only data and **no Vietnam production DB secrets** | Workflow and environment review |
| ENV-02 | VN production release only after approved commit, QC PASS and recorded owner approval | Git/CI/config evidence |
| PRIV-01 | No VND figures, passwords, session tokens, backup keys or personally identifying account data in logs, telemetry, URLs or errors | Redacted log review |
| WEB-01 | HTTPS, CSP/XSS mitigation, CSRF/origin verification, rate limits, safe cookies and errors | Security tests |
| OPS-01 | Provider backups, recovery points, restore drill, monitoring alert route and incident response documented and tested | Restore/rollback evidence |
| OPS-02 | Linux/Node patching, firewall, TLS, server access controls and audit permissions checked | Host security review |
| FIN-01 | Only approved versioned financial risk thresholds can yield Healthy/Caution/At Risk; missing data returns Insufficient Data | Decision-table test |
| A11Y-01 | Financial input pages have keyboard/AT labels, good error feedback and non-color risk statuses | Accessibility tests |

## Release verdicts

- **PASS:** every critical applicable gate has executed evidence; data residency is verified for primary, backups, logs, production compute and third-party processors; owner approves retention, auth, hosting, financial policy and release.
- **FAIL:** any unresolved critical access-control/data-leak, region, integrity or deletion/backup defect.
- **BLOCKED:** provider, keys, testing environment, production compute or independently verified evidence is unavailable.
- Running a synthetic demo does **not** constitute security PASS or authorize entering real financial data.

## Report template

- Commit SHA / verified environment URL:
- Infrastructure provider & physically evidenced Vietnam region(s):
- DB replica/backup/restore region evidence:
- Auth/session provider, session policies and MFA tests:
- Independent tests actually executed:
- Two-account ownership/RLS checks:
- Cross-border telemetry/processing flow findings:
- Data retention/export/deletion verification:
- Defects, residual risks and follow-up issues:
- Verdict: PASS / FAIL / BLOCKED
- Owner production and real-data-intake approval reference:

**No infrastructure or private data was accessed or tested while drafting this file.**
