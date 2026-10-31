# Supporting feature: Record and review monthly cash flow

- Product: Personal Financial Management App
- Spec status: **Draft — not approved for implementation**
- Idea source: Initial personal finance MVP proposal in `docs/product.md`
- Priority proposal: P2 for detailed transaction editing; manual **monthly summary inputs** are part of financial health P0
- Product Owner approval: Pending

## Scope relationship
This is a supporting / later increment, **not the product's primary purpose**. The first valuable MVP is [Financial Health Assessment](financial-health-assessment.md). A user can enter monthly income, expenses and debt payments in a **summary form**, without a transaction ledger. Detailed individual record entry/editing is optional and awaits separate approval.

## User problem and expected outcome
An individual wants to understand monthly income, expenses and available surplus without manually reconciling separate notes or spreadsheets.

## Personas and main journey
An individual enters an income or expense with amount, date, category and optional description, can correct an entry, and views totals for a selected month. This is a **proposed** MVP flow; no real customer research has been performed.

## In scope for a later, separately approved ledger iteration
- Manually add, review, edit and delete income/expense records.
- View income, expense and net cash flow totals for a selected calendar month.
- Basic categories and clear empty/error states.
- Currency and persistence strategy to be approved before implementation.
- All computation is reproducible and testable.

## Out of scope
- Bank connections and account aggregation.
- Financial investment recommendations, market feeds, trading, recurring transactions and automation.
- Multi-user sharing and paid plans.

## Data and rules to decide
- Transaction type: income or expense.
- Amount: positive number with currency-specific precision; never use binary floating point for stored money.
- Transaction date, category and optional description.
- Decide timezone, currency policy and whether users can enter past/future dates.
- Personal data must be private to the authenticated owner. Authentication and storage are not yet implemented.

## Acceptance criteria for the later ledger feature (candidate; NOT MVP requirements)
- [ ] Given a signed-in user with an empty month, when they view the dashboard, then all totals show zero and the empty state explains how to add a transaction.
- [ ] Given a valid expense, when the user saves it, then it appears once in the selected month and expense/net totals update correctly.
- [ ] Given a valid income record, when saved, then income and net cash flow update correctly.
- [ ] Given a negative, zero, invalid or overprecision amount, when submitted, then the form rejects it without saving.
- [ ] Given a record owned by the user, when it is edited or deleted, then totals reflect the change exactly once.
- [ ] Given an unauthenticated or different authenticated user, when they attempt to read or change another user's record, then the request is denied without exposing data.
- [ ] Given a network/database error, when a save fails, then the UI shows an actionable error and does not claim success.

## NFR acceptance requirements
- Authorization and privacy tests must pass before real financial data is permitted.
- Keyboard navigation, labels, focus indicators and user-visible feedback on all flows.
- Performance and recovery budgets must be agreed with Platform and QC.
- Audit/backup and retention policy, if needed, are approved before persistence.
- Preview uses synthetic data; production requires deployment and privacy approval.

## Dependencies and risks
- Choose auth model, managed database, data residency/retention approach, currency handling and cost budget.
- No live data until isolated access controls and QC security tests exist.
- Feature is not implementation-ready while these decisions and owner sign-off remain pending.

## Verification approach
Unit tests: amounts/totals, rounding rules, month selection, invalid input.
Integration: create/edit/delete, persistent aggregation, auth boundaries.
Browser E2E: empty state, successful entry, correction, failure feedback, mobile responsiveness, keyboard access.
QC produces an independent PASS/FAIL/BLOCKED report with preview URL and commit SHA.

## Handoff
Platform Agent: recommend and justify auth, database, money representation, testing/CI architecture and privacy controls.
Codex: no implementation issue until owner approves this specification.
Product Owner: confirm user goals, MVP boundary, currency, and security/hosting decisions.
