# Household private-data model — Platform design proposal

**Status: proposal; no migration has been executed, no database provisioned.**  
Contract sources: `docs/product.md`, `specs/private-household-financial-intake.md`, `specs/financial-health-assessment.md`.

## Modeling rules

The first MVP is **one authenticated adult account / one household**. This is a private monthly financial snapshot, **not** transaction-level bookkeeping.

| Entity | Fields / constraints | Notes |
| --- | --- | --- |
| `households` | `id UUID PK`, `owner_id UUID NOT NULL UNIQUE` referencing `auth.users`, `created_at`, `updated_at` | One household per authenticated owner; no children/member identities |
| `household_snapshots` | `id UUID PK`, `household_id UUID`, `owner_id UUID`, `report_month DATE`, `as_of DATE`, `version INT`, timestamps | Unique `(household_id, report_month)`; composite `(household_id, owner_id)` FK to households prevents spoofed ownership |
| Monetary fields on snapshot | `monthly_net_income_vnd`, `essential_outgoings_vnd`, `discretionary_outgoings_vnd`, `required_debt_payments_vnd`, `outstanding_debt_vnd`, `liquid_reserves_available_vnd`, `total_assets_vnd`, `total_liabilities_vnd` | Nullable `NUMERIC(20,0)` + nonnegative CHECK; nullable ≠ zero. Assets includes liquid savings **once**; liabilities includes outstanding debt **once** |
| Risk context | `overdue_status` (`yes`/`no`/`unknown`), `valuation_as_of`, `income_variability`, optional adult/dependent **counts** | Unknown should not default to no/zero; never collect children's names |
| Change metadata | `updated_at`, `revision`; optional metadata-only audit trail | Do not log private financial amounts or record previous versions without approved retention policy |

**Normalization decision:** no automated per-person account aggregation or automatic duplicate detection in MVP. User enters already-consolidated household totals with help text: exclude transfers between family members, do not repeat a joint asset, don't double-count loan payments under general expenses. An optional future `holdings` table can represent item-level provenance if needs warrant it.

## Money and dates

- Inputs and outputs are VND; support whole đồng only, without implicit currency conversion.
- Validate decimal-digit amounts (strip sanctioned grouping symbols only in UI) and enforce a documented maximum; encode database numeric amounts as **decimal strings** across API boundaries; never serialize a DB `NUMERIC(20,0)` as an unsafe JavaScript number.
- For deterministic calculations use tested BigInt-safe operations or a decimal package. Percent/ratio results can be separately rounded for display, preserving source amount precision.
- `report_month` is normalized to the first day of the reporting month; `as_of` is the actual assessment snapshot date. Enforce a consistent timezone policy before release.
- `liquid_reserves_available_vnd` means spendable by the household; an illiquid property may appear in assets but must not inflate emergency coverage.
- Monthly surplus = income − essential spending − discretionary spending − required debt repayments, assuming the spending figures exclude repayments.
- Emergency months = available liquid reserves ÷ (monthly essential outgoings + unavoidable debt repayments), if denominator > 0.
- Debt burden = monthly required repayments ÷ net income, when net income > 0.
- Household net worth = total assets − total liabilities; these consolidated assets/liabilities do not add the debt or reserves columns a second time.
- Do not implement Healthy/Caution/At Risk thresholds until a versioned risk policy has been approved. Insufficient Data is a valid result when information is missing/contradictory.

## RLS and privilege implementation requirements

This is a **policy contract, not executable migration SQL**. Platform/Codex must create actual reviewed migrations and pgTAP tests.

- `households`: `owner_id = auth.uid()` for **SELECT, INSERT, UPDATE, DELETE**, with restrictive grants to `authenticated` and none to `anon`; insert/update WITH CHECK also enforces current owner.
- `household_snapshots`: same owner predicate for all CRUD operations plus a composite foreign key `(household_id, owner_id)` to `households(id, owner_id)`, with a UNIQUE index on household pair. The server derives owner ID from verified session, not request body.
- Enable **RLS** and restrict table grants, not policies alone. Avoid `service_role`/DB owner in user request paths; never expose secret keys to clients. Restrict privileged table changes to migrations.
- Ownership field mutations must be prohibited at the application API and DB permission/trigger level so no user can reassign a record; ensure RLS WITH CHECK and FK enforce the same.
- Every user-inputted financial field must be validated server-side with explicit non-negative whole-VND, upper-bound and data consistency checks. Do not assume frontend validation suffices.
- On household delete, cascade active snapshot deletion. Separately document auth-account deletion and backup retention. Don't claim immediate erasure from backups.
- Ensure `owner_id` is never set by the client. Query identity is verified on each request; never cache household responses across users.

## Idempotence and revisions

- A snapshot is identified by authenticated owner/household plus normalized month. Upsert should not produce a duplicate if the user retries a failed network request.
- Use optimistic locking `revision` or an equivalent conditional update to prevent silent overwrites from two tabs; return a clear conflict, never silently discard one edit.
- If keeping historical version copies, define their retention and protection separately and apply equivalent RLS.

## Implement/test before any real data

- pgTAP/SQL or integration tests for two synthetic identities, each with a household; one cannot select/insert/update/delete another's snapshots even with an explicit UUID.
- Unknown versus true zero, negative amount rejection, max amount/overflow, grouping/precision, duplicate month, missing date, timestamp consistency.
- Family consolidation and no double-counting for shared assets, intra-household transfers and loan payments.
- Restore from backup, data export and delete/retention; auth-disabled/deleted account behavior.

Further refinements and selected provider must be approved in [ADR-0001](../adr/0001-household-auth-and-storage.md).
