# QC Agent — private household financial data release gates

**State: test plan only, NOT EXECUTED.** No customer/owner financial data may be used as test fixtures or screenshots.

## Security gate matrix

| ID | Test / expected outcome | Evidence before first real-data release |
| --- | --- | --- |
| AUTH-01 | Public registration disabled; only the invited adult account signs in | Provider configuration snapshot **without secrets**, session test |
| AUTH-02 | Expired, forged or absent session cannot access financial pages or API | Route/API negative tests |
| AUTH-03 | Logout invalidates effective session; private pages are not shared-cached | Browser tests, cache/Cookie headers review |
| RLS-01 | Authenticated synthetic user A can CRUD own household/snapshot | Integration + pgTAP output |
| RLS-02 | User B cannot read/insert/update/delete user A's household or snapshots by guessing UUID | Four negative SQL/API tests |
| RLS-03 | Anonymous user has **no grants or access** to private financial tables | Schema grants + pgTAP evidence |
| RLS-04 | Client cannot set/change owner_id or attach snapshot to another owner | DB FK/trigger and API tests |
| VAL-01 | VND amount exact, no rounding/overflow; null is not zero | Boundary tests for value parsing and persistence |
| VAL-02 | Negative, malformed, overlarge and contradictory amounts rejected server-side | Property/boundary tests |
| VAL-03 | Shared property, family transfers and loan repayments aren't double-counted | Accepted test vectors |
| PERS-01 | Save, reload and update the same month; retries don't create duplicates | UI + API idempotency tests |
| PERS-02 | Two-tab concurrent updates produce an explicit conflict instead of silent loss | Integration tests |
| PERS-03 | User data delete removes active records; backups and account deletion terms are documented | Delete verification, retention policy |
| ENV-01 | Preview uses **separate synthetic project** and no production credentials or real records | Deployment config review, runtime checks |
| ENV-02 | Production environment is protected and releases require reviewed commit, QC PASS, owner approval | Git/Vercel config evidence |
| PRIV-01 | No amounts, tokens, credentials or private account info in logs, telemetry, URLs or exception traces | Redacted log/event review |
| WEB-01 | Cookie-origin checks where needed, HTTPS, XSS/CSRF protections, rate limits and safe errors | Security review and tests |
| OPS-01 | Backups/restore plan, deletion timeline, alert routing and rollback validated for chosen plan | Documented restore/rollback exercise |
| FIN-01 | Household health state is from a versioned, approved policy; Insufficient Data when lacking inputs | Independent decision-table QC |
| A11Y-01 | Forms support labels, keyboard navigation, validation feedback and non-color status communication | Accessibility check + manual workflow |

## QC verdict

- **PASS:** all applicable critical rows have real evidence, security blockers are resolved and owner has signed off on the selected data hosting/retention and financial policy.
- **FAIL:** access-control, privacy, integrity or data-loss protection is not satisfied.
- **BLOCKED:** provider/database/preview credentials are not configured or target environment cannot be independently tested.
- Security test credentials and synthetic financial figures must never be printed into PR logs or committed.

## Evidence template

- Commit SHA and Preview URL (protected):
- SQL migration / provider version and region:
- Tests executed and environment:
- Passing checks:
- Failed checks + issue links:
- Known residual risks:
- Final verdict: PASS / FAIL / BLOCKED
- Product Owner security and production launch approval: pending / recorded (link)

An agent cannot self-certify production readiness.
