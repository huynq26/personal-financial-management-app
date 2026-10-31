# Pilot architecture (draft)

- Runtime: Node 24, Next.js 16 App Router, TypeScript, React.
- Styling: plain CSS; no design system dependency initially.
- Persistence: none in starter; choose a managed database after specification approval.
- Authentication and authorization: not implemented; required before storing personal financial information.
- Deployment: Vercel Git-connected preview builds, GitHub Actions for build/typecheck/unit tests.
- Environments: Preview is synthetic-data-only. Configure a protected production branch before first live release.
- Observability: use Vercel deployment/build logs at first; define error monitoring, performance, uptime and budget alerts before production.
- Decisions still open: database, login model, PII retention, data residency, transaction categories, backups, audit logging and rollback.

**Security:** never put tokens, bank credentials, actual records or user PII in the repository or preview.
