# Non-functional quality requirements (draft)

Targets require human sign-off and realistic load assumptions before real use.

- **Functional correctness:** unit tests for finance arithmetic; integration/E2E tests required when editing and persistence arrive.
- **Accessibility:** semantic pages, visible focus styles and keyboard flows; QC will test critical journeys.
- **Performance:** measure mobile Core Web Vitals and route p95 once traffic shape is defined.
- **Security:** no production PII in previews, auth/tenant isolation tests before accounts or data storage.
- **Reliability:** documented downtime and rollback plan before release; handle invalid input and persistence failures.
- **Observability:** build logs, runtime errors and release traceability; later uptime and budget alerts.
- **Costs:** Hobby plan for technical validation only; no unapproved paid upgrades.

QC verdict for starter: **NOT RUN**, pending CI and preview verification.
