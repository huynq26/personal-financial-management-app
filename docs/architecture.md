# Household Financial Health App — platform architecture

**Status: proposed Platform Agent design; no provider/database deployed or approved yet.**  
**Product:** one owner-managed household, VND, secure actual household data entry and health assessment.  
**Current code:** a static/synthetic Next.js starter only.

## Architecture decision

- **Recommended:** Next.js App Router on Vercel + **Supabase Auth** (invite-only owner login) + **Supabase PostgreSQL** with tested RLS and conservative role grants. See [ADR-0001](adr/0001-household-auth-and-storage.md).
- **Alternative:** Neon PostgreSQL + Auth.js + explicit backend authorization, if the owner prefers independent auth and DB providers.
- Supabase project region proposed Singapore (`ap-southeast-1`), pending owner/provider approval and privacy review. This is not automatic proof of legal compliance.
- The free tier's backup/retention limitations must be reviewed before real financial data is entrusted to the service. No billing or resources have been activated.

## Data, security, and authentication

- [Household data model](platform/household-data-model.md) with private monthly VND snapshots and separate unknown/null values.
- Next.js server routes/actions verify signed-in identity and validate every request; Supabase Auth SSR with Next.js 16 Proxy. Never use `getSession()` alone as the server authorization proof.
- RLS and grants protect `households` and `household_snapshots` for each owner. Server passes only user-scoped access; no service-role key in frontend or user request paths.
- Financial amounts use exact whole-VND decimal strings to avoid unsafe JavaScript number handling; no automatic foreign currency conversion.
- All real-data tables require migrations and negative tests for cross-account/anonymous access before real storage is permitted.

## Environments

- **Local** — separate synthetic fixtures only.
- **Preview** — Vercel Preview + separate synthetic Supabase test project. Preview URLs remain protected; never copy production secrets/data.
- **Production** — owner-only account, separately secured Supabase production project, protected Vercel production branch and release approval. Do not connect real data before the QC and privacy gate.
- Vercel Git-connected repository deploys the configured production branch automatically. Confirm branch tracking and protected reviews *before* connecting app code to production. Current repository's default `main` contains only an initial README.
- No Vercel product deployment has been verified. The earlier workspace authorization attempt required extra user consent.

## Tests and operational standards

- Existing starter GitHub Actions typecheck/unit-test/build workflow is not a secure financial-app release pipeline.
- [QC Agent private-data gates](security/private-data-qc-gates.md) cover owner-only login, RLS denial, VND precision, authentication, data deletion, preview isolation, backup/restore and incident evidence.
- Implement real-data intake before risk labels only after owner approves the risk-policy decision table; otherwise show an **Insufficient Data / assessment policy pending** state.
- Runtime logs must contain safe metadata, not actual financial figures or auth tokens. Set a minimal uptime/error alert and budget guard before production.
- Data export, retention, backups and deletion timing require an explicit recorded product decision.

## Delivery sequence

1. Product Agent confirms household-only, VND, owner-submitted private records (**done**).
2. Platform Agent records the recommended ADR, schema and security test plan (**proposed; done as documentation**).
3. Owner approves proposed provider, budget and data retention before any provider resources and secrets are configured.
4. Codex implements, on isolated PRs: auth, schema/RLS, guided data entry/persistence and independent financial calculations.
5. QC independently tests safety and functionality using synthetic accounts and submits PASS/FAIL/BLOCKED.
6. DevOps configures Vercel protected Preview, controlled production release and monitoring after approval.

**Do not ask the owner to paste their financial data, Supabase API keys or provider access tokens into GitHub or ChatGPT.**
