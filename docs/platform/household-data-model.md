# Household private-data model — Vietnam-resident production proposal

**Status:** Platform design only; no database/migration provisioned or executed.  
**Architecture:** [ADR-0002](../adr/0002-vietnam-data-residency.md) (Vietnam-hosted Better Auth + PostgreSQL). The prior Supabase-specific `auth.users`/`auth.uid()` contract is superseded.

## Tables and identity

Better Auth uses its own user/session tables in PostgreSQL. Confirm its exact schema/ID type after pinning a reviewed version. **Do not assume UUID identity**: the default Better Auth user ID can be a string. Build referential keys with matching types and separately owned account data.

| Table | Fields | Invariants |
| --- | --- | --- |
| Better Auth user/session/account/verification tables | Library-generated IDs and security/session fields | Restricted auth role; single invited adult; no public signup |
| `households` | `id UUID PK`, `owner_user_id TEXT UNIQUE NOT NULL`, timestamps | `owner_user_id` FK to Better Auth user primary key, exact field/type confirmed in migration |
| `household_snapshots` | `id UUID PK`, `household_id UUID`, `owner_user_id TEXT`, `report_month DATE`, `as_of DATE`, revision, timestamps | Unique (household_id, report_month); composite FK ties owner and household; no cross-owner change |

Snapshot monetary columns (proposal, each `NUMERIC(20,0)` with nonnegative and max-bound CHECK): `monthly_net_income_vnd`, `essential_outgoings_vnd`, `discretionary_outgoings_vnd`, `required_debt_payments_vnd`, `outstanding_debt_vnd`, `liquid_reserves_available_vnd`, `total_assets_vnd`, `total_liabilities_vnd`. Each is nullable where unknown must not be misrepresented as zero.

Other fields: overdue status (yes/no/unknown), valuation date, snapshot month, income volatility indicator, optional non-identifying adult/dependent counts. No names of children, bank passwords, account numbers or national identification numbers.

## Exact money rules

- Whole VND only. Validate source strings; Postgres decimal numeric stores exact values. On TS/API boundaries serialize **strings** to avoid IEEE-754 precision loss.
- Household net income is combined monthly net pay; do not count transfers between members.
- Essential/discretionary outgoings do **not** include the monthly debt repayments entered separately. Cash-flow surplus = income − expenses − required repayments.
- Emergency coverage = accessible reserves / (essential outgoings + unavoidable debt payments), when denominator > 0.
- Household net worth = assets − liabilities; cash already part of assets and debts already part of liabilities **must not be added twice**.
- Distinguish accessible savings from restricted funds and illiquid property; unknown input ≠ zero.
- Classification thresholds require versioned owner-approved policy; missing values should yield Insufficient Data or explicitly limited results.

## Authorization / RLS design

- **Mandatory:** a verified Better Auth session on every server-side read/write; owner identity derived from session, never from client-supplied owner ID. Every query must constrain `owner_user_id` to that identity.
- DB network only accessible from VN app server and restricted admin network. Runtime DB role has minimal grants; no owner/superuser privilege and no `BYPASSRLS`. Auth schema permissions must be scoped separately.
- **Optional but recommended defense in depth:** PostgreSQL RLS policies for household/snapshot tables based on transaction-local `current_setting('app.current_user_id', true)`. The server must set this value **from the verified Better Auth session** inside the same SQL transaction (`SET LOCAL`/`set_config(..., true)`) for every data access. Policies must also enforce WITH CHECK and immutable owner relationship.
- **Never** use `auth.uid()` (Supabase-specific) or an arbitrary client-supplied JWT/owner ID. Tests must verify connection pooling doesn't leak tenant session context and normal query paths cannot bypass server auth.
- RLS transaction context supplied by the server is *not* a substitute for secure SQL parameterization or query ownership predicates. Test SQL injection and privilege escalation.
- DB-level owner/household FKs, not just business code, reject cross-owner attachment and changes to owner IDs.
- Active-record deletion and provider backup retention must be documented and tested. Do not claim instant erased backups.

## Operations and environment residency

- Primary managed PostgreSQL, read replicas, backups and restore copies all physically in **Vietnam**. Exact datacenter/region verified with provider and the approved contract.
- Store identity/session data and any retained private logs only in the Vietnam-hosted systems. Prevent unreviewed third-party exports and cross-border telemetry.
- Production must never share DB/session secrets with Vercel Preview or GitHub CI (both synthetic only).

## Migration / testing requirements

1. Generate/review Better Auth schema, identity types and migrations, retaining a rollback/backup plan.
2. Create household/snapshot tables, composite keys, permissions, validated numeric ranges and optional RLS policies.
3. With two synthetic accounts, verify each CRUD operation, guessed IDs, forged ownership, anonymous requests, expired sessions, SQL transaction-scoped tenant context and denial of ownership reassignment.
4. VND precision, negative/overlarge numbers, NULL vs zero, safe retries and edit conflicts; household shared-asset consolidation and debt duplicate handling.
5. Prove backup/restore, active deletion, retention disclosure, tenant isolation and Vietnam residency **before first real user financial data**.

**No production migrations or tests have yet run.**
