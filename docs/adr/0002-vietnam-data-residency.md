# ADR-0002 — Vietnam-resident production architecture for private household finance

- **Status:** Proposed — **preferred direction based on owner requirement**, NOT approved for provisioning or production
- **Date:** 2026-10-31
- **Decision driver:** The owner prioritizes **keeping all stored household financial data in Vietnam**.
- **Supersedes:** [ADR-0001: Supabase/Singapore proposal](0001-household-auth-and-storage.md). Do NOT implement ADR-0001 for production without a new owner decision.
- **Scope:** one authenticated adult account, one household, VND, private data entry/storage, explainable health assessment.

## 1. Residency and threat model

**Hard requirement:** The authoritative PostgreSQL database, replicas, backups/snapshots, restore copies, file exports, and any logs containing household financial information must be stored **only in physically verified Vietnam regions**. Treat private income/debt/asset records as sensitive. Residency is a deployment control that must be verified contractually and operationally; provider nationality or marketing alone does not prove a storage/backup location.

**Stronger recommendation:** Run authenticated application/API and auth processing in Vietnam too. A foreign-hosted runtime can access/copy private records, transmit payloads, capture logs, and process sessions overseas **even when the DB is in Vietnam**. If using Vercel at all, limit it to static public materials or synthetic-data development previews, never production financial API routes or SSR of private records.

Do not assume that Vietnam-only storage automatically satisfies all applicable laws, or that all information necessarily must be localized by law. Vietnam's Law 91/2025/QH15 applies from 2026-01-01; Decree 356/2025/ND-CP includes cross-border transfer provisions. Consult qualified counsel before launch, especially for backups, third-party mail, monitoring and any international data flow.

## 2. Preferred production topology

```text
Browser in Vietnam
     |
     | HTTPS / strict TLS, no private data to third-party analytics
     v
VN-hosted Next.js 16 application (Node runtime) — private SSR + API + validation
     | same-origin, httpOnly Secure cookies; auth/session controls
     +-- Better Auth (self-hosted library; invite-only account; TOTP MFA candidate)
     +-- Server-side VND calculations and versioned financial risk policy
     |
     | Private VPC, TLS, least-privilege database account
     v
Managed PostgreSQL in Vietnam
     | households, household_snapshots, Better Auth users/sessions
     +-- Encrypted backups and restore copies **in Vietnam only**
     +-- Redacted metrics/operational logs stored **in Vietnam only**

Development only: GitHub + Vercel *synthetic-data* previews.
Production private-data workloads DO NOT use Vercel Functions/CDN SSR.
```

### Providers

**Preferred first quote:** Viettel Cloud vServer + Viettel managed PostgreSQL (vDBaaS / vDBS), in an explicitly named Vietnam data center/region with private network connections and Vietnam-only backup destinations. Published product information describes both virtual servers and managed PostgreSQL deployed on local infrastructure. Require a quote and contract identifying actual region and replication/backup geography; no guarantee is implied by the product page.

**Alternative quote:** VNG Cloud vServer + vDB RDS PostgreSQL in a physically confirmed Vietnam region; private VPC endpoints; managed backups and locally located recovery copies. Their docs describe private RDS endpoints and backup capability. Compare support, billing, encryption, isolation, documented residency and restore options.

**Budget fallback:** One small **Vietnam-hosted** VM running both Next.js/Better Auth and PostgreSQL with encrypted separately stored **Vietnam-only** backups. Cheaper but materially more risky operationally; without demonstrated automated backups, patching, disaster recovery and secure DB administration, **not permitted** for real finance data.

### App and authentication

- Run Next.js server workloads on a Vietnam-hosted VM or container (Docker, reverse proxy, restricted SSH, firewall, HTTPS, automated OS/security patches).
- Use **Better Auth** self-hosted with PostgreSQL for identity and sessions; one owner account, public self-registration disabled using validated provider/application controls. No outsourced auth platform storing account/session data abroad.
- Evaluate TOTP MFA and recovery-code storage; keep secrets encrypted and backup/recovery procedure controlled. Password hashing uses reviewed secure library settings; no homegrown auth crypto. Check the exact library version and API before implementation.
- Identity is stored in the Vietnam PostgreSQL database; prefer same-origin secure httpOnly cookies, CSRF/origin defenses, rate limits, session revocation, no personally identifying auth events in foreign logs.
- Email/OTP providers can independently introduce cross-border processing. Avoid external identity/analytics by default and document any exception with user consent and regional data-flow review.

### Data model / authorization

- Follow [private household data model](../platform/household-data-model.md) with **one household per owner** and immutable account-owned rows.
- Better Auth user IDs may be strings; use consistent FK types from the reviewed Better Auth schema. The former `auth.users`/Supabase `auth.uid()` references are **not valid** for this design.
- Every private query obtains the owner ID from a server-verified session; server authorization + restrictive DB grants are mandatory.
- **Optional defense-in-depth RLS:** implement explicit PostgreSQL policies based on a transaction-scoped, **server-derived** `app.current_user_id` (set with `SET LOCAL` / `set_config(..., true)`) and a runtime role without `BYPASSRLS`. Do not conflate this with Supabase RLS, and never trust owner IDs passed from the browser. Verify connection-pool/transaction behavior and isolation with negative tests. Application-level checks are still required.
- Only whole-đồng VND decimal strings and safe integer/decimal calculations; distinguish unknown/null from zero. No silent FX conversion.
- Encryption at rest + TLS; confirm provider scope for logs, managed backups, snapshots, key management and retained copies.

## 3. Environment topology

| Environment | App compute | DB/auth | Data |
| --- | --- | --- | --- |
| Local | Developer computer | Isolated local/dev | Synthetic only |
| Preview / PR | Vercel (protected Preview, synthetic route only) **or** VN-hosted isolated test app | Separate isolated *test* DB / test auth, never production secrets | Synthetic only |
| Production | **Vietnam-hosted Node/Next.js app** | **Vietnam-based private PostgreSQL + Better Auth** | Real owner-entered household finance after release approval |

Do not connect a Vercel production project to a repository branch in a way that unintentionally deploys private SSR or financial APIs internationally. If preserving a Vercel project for preview only, ensure production branch/deploy target cannot publish private workloads; avoid production Vercel secrets, migrations and finance APIs.

## 4. DevOps and QC requirements

- Infrastructure as code or a reviewed documented setup; restrict DB to private network; production admin access via least privilege and MFA.
- Secure secrets outside GitHub code, public PRs, client bundles, logs and model prompts. Separate production and preview.
- Backups: encrypt, schedule, alert on failure, prove *physical Vietnam location* of active/replica/snapshot/restore resources, test restoration; owner must approve cost and retention/recovery objectives.
- Monitoring: place any private log/trace/error data only in Vietnam; otherwise redact by design and confirm foreign telemetry captures no sensitive values.
- Tests: unauthorized and cross-account access, forged owner IDs, replay/retry, VND exact arithmetic, delete and restore, outage and backup drills, region evidence, dependency and server hardening.
- Independent QC must return PASS with evidence against a specific commit and environment. Only after owner approval may private production intake be enabled.
- Financial risk statuses (Healthy/Caution/At Risk) require a separate approved rule policy; don't invent cutoff values.

## 5. Options / tradeoffs

| Option | Vietnam finance data residency | Complexity | Assessment |
| --- | --- | --- | --- |
| A. Viettel VN VM + managed VN PostgreSQL + self-hosted Better Auth | **Feasible with verified region, logs and backups** | Medium | **Recommended** |
| B. VNG VN VM + VN vDB RDS + self-hosted Better Auth | **Feasible with verified region, logs and backups** | Medium | Comparable alternative |
| C. Vercel Next.js production functions + VN Postgres | DB may be in VN, **private data processing abroad** | Low–Medium | Not recommended for strict localization |
| D. Supabase Auth + PostgreSQL Singapore | Financial records and identity stored abroad | Low | Superseded for this user's current priority |

## 6. Approval checklist before spending or provisioning

- [ ] Obtain Viettel and VNG quotes for VM, managed PostgreSQL, automated backup, data egress and support.
- [ ] Confirm exact Vietnam datacenter for active DB, replicas, automated backups, disaster recovery and log copies **in writing**.
- [ ] Confirm residency terms for auth session data, message providers, monitoring and incident tooling.
- [ ] Choose provider, budget ceiling, data retention/export/deletion process, RPO/RTO and owner account recovery rules.
- [ ] Produce migration and authorization tests for Better Auth users and private household tables.
- [ ] Run independent QC security/functional tests with fake financial data.
- [ ] Explicitly authorize production deployment and **later** real data collection after review.

**Status:** No infrastructure, data, billing or production resource was created in this ADR.

## Official / vendor evidence to verify in procurement
- Viettel managed PostgreSQL VN: https://viettel-cloud.com.vn/viettel-database-service-en/
- Viettel Cloud service list: https://viettelcloud.vn/dieu-khoan
- VNG managed PostgreSQL: https://vngcloud.vn/vi/product/vdb
- VNG private DB endpoint guide: https://docs.vngcloud.vn/vng-cloud-document/vn/vdb/relational-database-service-rds/getting-started/ket-noi-toi-rds-instance/ket-noi-toi-rds-instance-thong-qua-ssh-tunnel
- Better Auth: https://better-auth.com/docs/installation and https://better-auth.com/docs/adapters/postgresql
- Vercel compute regions (none in Vietnam): https://vercel.com/docs/regions
- Vietnamese Personal Data Protection Law 91/2025/QH15: https://vanban.chinhphu.vn/?classid=1&docid=214590&pageid=27160&typegroup=
- Decree 356/2025/ND-CP: https://english.luatvietnam.vn/decree-no-356-2025-nd-cp-dated-december-31-2025-of-the-government-detailing-a-number-of-articles-and-measures-for-the-implementation-of-the-law-on-p-422896-doc1.html
