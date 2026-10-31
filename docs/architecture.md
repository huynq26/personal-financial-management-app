# Household Financial Health App — Vietnam-resident platform proposal

**Status:** Architecture proposed for owner's **Vietnam financial-data residency** requirement; **NOT approved for provisioning, billing or real-data production.**  
**Product:** one household/family, owner-managed login, VND, private real financial data and explainable status.  
**Source of truth:** [ADR-0002 — Vietnam residency](adr/0002-vietnam-data-residency.md). **ADR-0001 (Supabase/Singapore) is superseded.**

## Production deployment

```text
User browser --HTTPS--> Vietnam-hosted Next.js (Node, private pages + APIs)
                              | Better Auth identity & secure sessions
                              | Server-side household ownership + validation
                              | Deterministic VND assessment
                              v
                      Vietnam-hosted private PostgreSQL
                        + managed local encrypted backups
                        + local logging/monitoring with financial amounts redacted
```

- First provider to evaluate: **Viettel Cloud vServer + Vietnam-region managed PostgreSQL**; second: **VNG Cloud vServer + vDB RDS**. Contract must verify VM, primary DB, replicas, backups, logs and disaster recovery copies are physically in Vietnam.
- Authentication: **Better Auth** running in the same Vietnam application infrastructure, with identity/session data in the Vietnam PostgreSQL. One owner account; invite-only, no public signup; TOTP MFA proposal. No external auth provider or remote email/OTP platform unless reviewed for data flows.
- DB: PostgreSQL private network only; application session checks and ownership predicates are mandatory; RLS may add defense in depth but must use server-verified identity, appropriate DB runtime roles and transaction-scoped context—not Supabase `auth.uid()`.
- Data: [household model](platform/household-data-model.md); nonnegative exact whole-VND numeric/decimal-string representation; null is unknown, not zero. Financial status thresholds still pending owner review.
- Ops: Linux/Node hardening, TLS, least-privilege secrets, encrypted backups kept in Vietnam, local monitoring, access logs with amounts redacted, tested restore, data deletion/export policy, owner-controlled release.

## Vercel and software factory

- **Vercel is not production hosting for private financial pages/APIs** under the owner's priority. Vercel currently lists no Vietnam compute region, and overseas SSR/functions may receive private data even if DB lives in Vietnam.
- Vercel may be kept for **protected, synthetic-only PR previews** or an entirely static public marketing page; it must not hold production DB credentials or access real account records.
- GitHub (currently public source repo) contains source and **synthetic-only** data. Never commit actual household financial information, credentials, backups or sensitive build artifacts.
- Production deploy targets VN compute under explicit owner approval. Do not assume existing Vercel integration implies the product is deployed or that a Git push releases production.
- GitHub Actions CI can build and test with fake data, but avoid exposing secrets to PRs/forks or external workflows.

## Quality / compliance

- [QC release gate matrix](security/private-data-qc-gates.md): verify auth, cross-account isolation, VND precision, no private logs, backups/restore, deletion, Vietnam residency evidence, protection from overseas telemetry and risk-policy decision tables.
- Vietnam Personal Data Protection Law 91/2025/QH15 effective 2026-01-01 and Decree 356/2025/ND-CP warrant legal review. Data kept in Vietnam does **not** by itself demonstrate compliance.
- Backups, support access, international email delivery, DNS/CDN, vendor monitoring, application crash reports and error-trace systems must be reviewed for cross-border processing and logging.

## Next steps and outstanding decisions

1. Verify Viettel/VNG Vietnam datacenter/managed PostgreSQL/backup regional availability and current costs with provider contracts or console.
2. Approve provider/hosting budget, auth/MFA, retention/export/delete and recovery point/time targets.
3. Codex implements Better Auth on VN-hostable Next.js, tenant-isolated DB, private intake and tested VND calculations using **synthetic** records.
4. Independent QC tests security, region evidence, operational restore/deletion and risk-policy boundary cases, returns PASS/FAIL/BLOCKED.
5. Only after owner explicitly approves production release should the app collect actual family financial data.

**No infrastructure has been created or data processed during this architecture update.**
