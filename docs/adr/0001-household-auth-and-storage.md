# ADR-0001 — Private household identity and data storage

- Status: **SUPERSEDED by [ADR-0002 — Vietnam residency](0002-vietnam-data-residency.md) on 2026-10-31**; original design preserved for historical comparison. DO NOT IMPLEMENT.
- Prepared by: Software Factory / Platform Agent
- Applies to: personal-financial-management-app, household financial health MVP
- Decision owner: huynq26
- Related: [Product Agent intake](https://github.com/huynq26/software-factory/issues/4), [Platform Issue #2](https://github.com/huynq26/personal-financial-management-app/issues/2)
- Do not connect live financial data, buy services, run database migrations against production, or deploy until approved and tested.

**Supersession reason:** The owner requires household financial data to remain stored in Vietnam. Supabase Singapore and Vercel private SSR/functions do not fit the proposed residency architecture. The active Platform Agent proposal is Vietnam-hosted Next.js + self-hosted Better Auth + Vietnam-based PostgreSQL, with all private backup/log locations verified; see ADR-0002. No infrastructure was provisioned under either proposal.

## Context and fixed product decisions

Owner confirmed: **one family/household**, **VND**, and **actual owner-entered private financial data** saved and revised by an authenticated adult. The Product Agent belongs to the factory; this repository stores its output only. The existing Next.js UI is a synthetic demo, not a working authenticated product.

Threat: personal financial information (income, savings, debt and asset estimates) is sensitive. A publicly accessible application URL is acceptable only when financial records are never publicly readable or writable. The **repository is currently public**, so source code may be public but secrets, financial test fixtures, real data, and credentials must never be committed.

## Decision candidates

| Alternative | Benefits | Tradeoffs | Decision |
| --- | --- | --- | --- |
| A. **Supabase Auth + managed PostgreSQL + RLS** | One provider for auth and data; mature Next.js SSR support; Postgres checks and per-row access controls; Vercel Marketplace integration | Separate service and region/privacy decisions; RLS must be designed and tested; backup tier and resource lifecycle must be reviewed | **Preferred for MVP (not yet approved)** |
| B. **Neon PostgreSQL + Auth.js + Drizzle** | Portable PostgreSQL, deeper control over schema/auth, good Vercel integration | More auth/session setup and policy code; ownership enforcement is mainly application-controlled unless explicit DB RLS is added; more operational integration | Viable fallback |
| C. Encrypted local-browser-only storage | No remote database needed for a prototype | Browser/device loss, portability, backup/recovery, cross-device use and secure key management are harder; not suited to the requested private saved web account | Not preferred |

## Proposed architecture (Option A)

```text
User (one adult household manager)
  | HTTPS
  v
Next.js 16 App Router on Vercel (private authenticated routes)
  |  Supabase SSR cookie/session integration
  |  Server-side input validation, CSRF/origin controls
  |  Privilege: only user-scoped publishable-key client
  v
Supabase Auth <--> Postgres (households + snapshots)
                   - RLS on all exposed private tables
                   - restrictive grants; no anonymous financial access
                   - owner_id = authenticated auth.uid()
                   - household + snapshot relationship enforced
  |
  +-- server-side assessment calculator: VND indicators from stored snapshot
      (risk classification until policy is approved: Insufficient Data / unavailable)
```

### Authentication and tenancy
- Single invited owner account. Disable public signup and anonymous sign-ins; create owner via provider's trusted admin dashboard (do not include email identity or invitation tokens in GitHub).
- Use Supabase Auth with `@supabase/ssr` and Next.js 16 `proxy.ts` token refresh. Protect server pages/routes/actions using validated `getClaims()` / `getUser()`; do **not** trust `getSession()` as proof of identity.
- Single household belongs to one user. If a second synthetic test account exists in test, it must have a separate household and fail to read the owner's records.
- No shared household invitation or child-level identities in MVP.
- Service role/secret key can bypass RLS. **Never place it in public environment variables, client bundles, app request handling or untrusted CI jobs.** Prefer user-scoped token and DB RLS for all household queries.

### Persistence
- Use PostgreSQL with RLS, restrictive grants and app-level validation. See [data model](../platform/household-data-model.md).
- A household snapshot is a consolidated **monthly VND** record (not a detailed transaction ledger), with each field distinguishing **unknown/null** from a genuine `0`.
- Use exact Postgres `NUMERIC(20,0)` with explicit ranges; pass values as decimal strings in TypeScript to avoid unsafe IEEE-754 arithmetic. Calculations use a tested decimal/BigInt-safe representation, never float currency arithmetic.
- Never treat property value as emergency liquidity. Preserve valuation date and whether family can access a balance.
- Avoid duplicated household transfers and jointly held assets/liabilities by making the input a consolidated summary and providing clear instructions; flag unclear figures rather than claiming automated de-duplication.
- No PII in audit logs; if a change history is implemented, track timestamp/actor/policy version and minimize retained prior sensitive values.

### Regions and data governance
- Proposed Supabase primary project region: **Singapore (`ap-southeast-1`)**, near the VN-based first user. Explicitly confirm before project creation. Choosing that region is **not** legal compliance certification and does not mean data can never be processed outside the region.
- Review Supabase/host terms, any relevant Vietnamese privacy/legal requirements and data transfers before production. Never promise compliance solely from provider choice.
- Define data export, delete-my-data behavior, deletion/backups retention window and restore drills. Check whether the selected provider plan includes routine backups; Supabase documents that daily managed backups are for paid plans. Do not silently upgrade a plan or assume free-tier automatic backups.
- Prefer no production analytics with private dollar/đồng amounts. Log safe metadata only (operation, code, latency, request ID); no bank account numbers or credentials.

### Vercel environments / safety
- **Local:** synthetic test fixtures, local developer keys only, not production.
- **Preview:** distinct Supabase *test* project, synthetic accounts/data only, SSO/deployment protection enabled, production DB credentials prohibited.
- **Production:** dedicated independently approved Supabase project and Vercel Production variables. Protected production branch and required reviews; Vercel Git integration automatically deploys its production branch.
- Before linking Git: set/select protected production branch, confirm deployment protection, disable unapproved writes and review plan costs.
- Use separate URLs/cookie scopes and never reuse production access or refresh tokens in Preview. Validate an environment marker server-side; prevent Preview runtime from connecting to the Production database.

## Security controls and verification

- Session verification server-side and no shared caching of authenticated content; avoid ISR/public CDN caching of financial data or `Set-Cookie` responses.
- Database row-level restrictions for SELECT/INSERT/UPDATE/DELETE plus SQL constraints; deny direct anonymous read/write and invalid cross-household IDs.
- Rate limits on auth and writes; positive/negative validation for VND strings, dates, amounts, duplicates, missing vs zero.
- CSRF/origin validation for cookie-authenticated mutations, safe cookies, XSS protections, generic errors and strict telemetry redaction.
- Independent QC must test at least 2 isolated **synthetic** accounts and unknown/cross-household IDs; see [QC release gates](../security/private-data-qc-gates.md).
- Post-deploy review: audit deploy SHA, auth and DB environment linkage, signed-in-only navigation, backup and rollback steps.
- Financial-health classification rules remain **unapproved**; no live "Healthy" result based on invented thresholds.

## Follow-up approvals
1. Owner approves Supabase versus Neon, projected budget/backup plan and Singapore region.
2. Owner reviews retention/deletion rules, login provider/settings and release controls.
3. QC verifies provider configuration, RLS policies, tests and environment separation.
4. Only after passing gates and explicit release authorization may the production application accept real household data.

## References
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
- https://supabase.com/docs/guides/platform/regions
- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq
- https://vercel.com/docs/git
- https://vercel.com/marketplace/neon
