# Codex agent instructions

This is the product implementation repository. Read `docs/product.md`, `docs/architecture.md`, `docs/nfr.md` and the linked GitHub issue before coding.

- Only implement approved issues with acceptance criteria; if the product scope is still draft, ask for approval before implementing business features.
- Keep changes scoped to the issue; create a PR with test evidence and known limitations.
- Use TypeScript, Next.js App Router, accessible HTML, and responsive layout.
- Add appropriate unit, integration and Playwright tests for real product behavior; do not replace tests with self-reported success.
- Run `npm run typecheck`, `npm test`, `npm run build`.
- Use only synthetic sample data; do not commit secrets, real financial records, or API keys.
- Do not enable real payment/bank connections, paid Vercel services, or production deployment without explicit authorization.
- A passing starter build is NOT QC approval. Independent functional/NFR test evidence is required.
## Product Agent — first phase
- For an **idea** or discovery task, read `.agents/skills/product-agent/SKILL.md` and `docs/product-workflow.md`.
- Draft or revise `docs/product.md`, `docs/nfr.md`, and `specs/<feature>.md` via a reviewable PR.
- Create or propose a prioritized, acceptance-testable backlog; record assumptions and open questions.
- **Never self-approve** product scope. Only the product owner can authorize specs to be implemented.
- For **implementation** tasks, confirm the issue links an owner-approved spec before coding.

## Engineering and downstream handoff
- Use the Product/Platform/QC/DevOps skills in the factory control repository as complementary role guidance.
- Workflow: Idea → Product Agent → Owner scope approval → Platform Agent → Codex implementation → QC Agent → DevOps/Vercel.
- A successful build is only engineering evidence; QC still requires independently executed acceptance and non-functional tests.
