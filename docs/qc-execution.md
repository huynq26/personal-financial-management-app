# Actually executed independent QC — Issue #19 integration increment

This candidate adds a **separate GitHub Actions QC workflow** for the synthetic-data local-first financial app. It does not grant an independent security release verdict, approve owner scope, attest to any externally deployed Preview, or permit real household data.

## Executed checks

- `Run independent browser E2E tests`: headless Chromium against an ephemeral `127.0.0.1` Python server serving the actual Next.js static export. Tests create an encrypted vault, save fictional VND values, inspect IndexedDB for ciphertext rather than the chosen example amounts/passphrase, refresh and unlock with the correct passphrase, and reject an incorrect passphrase. They check the flow emitted **no requests to external origins and no POSTs**.
- `Run independent security tests`: assert static export files exist, no app API route, authenticated encryption rejects modification or wrong passphrase, static root has no JSON/CSV/DB data dumps.
- `Run independent performance tests`: headless Chromium confirms first-page interactive UI within a generous bounded 15-second QA budget. This is a smoke test, not production load-testing.
- Existing engineering `Product starter CI` separately type-checks, runs the normal unit tests, and builds.

**Actual evidence (synthetic only):** at candidate commit `4fdcc3fad2ce5c5c15538cfc0a5c66c39252472f`, [engineering CI #41464551580](https://github.com/huynq26/personal-financial-management-app/actions/runs/41464551580) and [separate independent QC #41464551584](https://github.com/huynq26/personal-financial-management-app/actions/runs/41464551584) both succeeded. That head was superseded by documentation and workflow wording changes; require fresh **exact-head** green runs before merging.

## Deliberate limitations / further work

- The workflow definition and tests live in the candidate source branch, so the same PR could theoretically change its own QC rules. A trusted, owner-controlled base-branch QC workflow and independent technical review are still required to establish separation of authority.
- Browser tests use local static output, **not** the real Vercel Preview. They do **not** establish QC testing an exact protected GitHub deployment ID. Do not set `qc_tested_this_deployment_id_verified=true` from these runs.
- No real backup-to-new-browser, multi-tab concurrent-write/race, device storage eviction, device in Vietnam, iOS/Safari retention, CSP, source supply-chain review or full pen test is claimed.
- `package.json` pins the added Playwright runner to an exact version; the repository currently lacks `package-lock.json`. Other semver dependencies can drift; add and review a lockfile before trusting reproducibility. GitHub Actions `npm install` is **not** an exact immutable dependency environment.
- This is a **development-branch pull request**, not a merge into `main` or permission to deploy the financial app, use genuine household data or process user secrets.
- The existing repo integration may report Vercel status automatically when a PR is opened. An unsolicited Vercel status is **not** approval of a safe Preview or release. We do not invoke any deployment from QC.
- No paid AI, cloud database, secret, external storage or GitHub write permission is used.

See factory [Issue #19](https://github.com/huynq26/software-factory/issues/19) and [Issue #17](https://github.com/huynq26/software-factory/issues/17). A complete factory rollout still requires a protected transactional writer + owner approval ledger, trusted event→state mapping, bound CI/QC/Preview, and a genuine protected Actions replay.
