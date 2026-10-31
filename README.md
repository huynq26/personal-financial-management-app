# Personal Financial Management App

Pilot web application for [Software Factory](https://github.com/huynq26/software-factory).

> **Status:** Preview-only technical starter. All numbers on the screen are fictional. There is no persistence, authentication, financial advice or bank integration. Product scope and production release are not approved.

## Stack

Next.js 16, React 19, TypeScript, plain CSS, small unit test suite. Vercel will host review previews. A database and auth provider will be selected only after the Product Agent's specification is approved.

## Local development

Requires Node.js 22+.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Open http://localhost:3000.

## How the factory uses this repo

1. Product Agent: turn ideas into a reviewable PRD, MVP and testable feature specs using [the local skill](.agents/skills/product-agent/SKILL.md), [idea intake](.github/ISSUE_TEMPLATE/product_idea.yml) and [product workflow](docs/product-workflow.md). **You approve the scope**; the agent does not.
2. Platform Agent: own architecture, platform configuration and build/test infrastructure.
3. Codex Engineer: implement an approved GitHub issue in an isolated branch and PR.
4. QC Agent: verify behavior, accessibility and NFRs against a Vercel Preview and record evidence.
5. DevOps Agent: record deployment details, monitoring and rollback. **Production requires explicit owner approval**.

## Deployment boundary

This PR is intended for a Vercel **Preview** deployment. No production deployment, real customer data or secret configuration is authorized. Confirm the Vercel production branch and branch protection before merging application code to the production branch.
