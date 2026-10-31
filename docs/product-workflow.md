# Product discovery workflow

This is the **first phase** of the Software Factory. It precedes Platform Agent setup, Codex implementation, independent QC and DevOps.

```text
User idea in ChatGPT
  -> Product Agent drafts evidence-aware PRD in docs/product.md
  -> MVP / feature specs in specs/
  -> NFRs and backlog issues
  -> OWNER PRODUCT-SCOPE APPROVAL
  -> Platform Agent: architecture, CI, environments
  -> Codex: scoped implementation PRs
  -> QC Agent: functional + non-functional verification
  -> DevOps Agent: Vercel Preview, approved release and monitoring
```

## Required steps

1. Create a product-intake issue in the **software-factory** control repository (not in this product repository). ChatGPT can help structure it.
2. Run the **factory's centralized Product Agent** against the intake issue and this product's context; it drafts specs as a PR in this product repository. Its skill is stored only at `huynq26/software-factory/.agents/skills/product-agent/SKILL.md`. An agent orchestrator must explicitly load that skill; the product repository does not automatically inherit remote Codex skills.
3. Review the proposed audience, problem, user journeys, MVP, exclusions, measurable success criteria, key risks and NFRs.
4. Approve or reject the scope in a recorded issue/PR comment. Only the owner can approve; the Product Agent cannot self-approve.
5. After approval, accept the spec PR and create implementation issues linked to exact spec paths and acceptance criteria.
6. Hand the approved artifacts to Platform Agent. Platform and Codex must not silently reinterpret scope; proposed changes return to Product Agent and owner.

## Document contract

| Artifact | Owner | Required sections |
| --- | --- | --- |
| `docs/product.md` | Product Agent | Problem, users, evidence, MVP, out-of-scope, success metrics, approval state |
| `docs/nfr.md` | Product Agent with Platform/QC | Measurable security/privacy/accessibility/performance/reliability/cost constraints |
| `specs/<feature>.md` | Product Agent | User journey, rules, states, scenarios, dependencies, risks, verification |
| GitHub implementation issues | Product Agent | Spec link, explicit scope, criteria, priority, risk, dependencies, tests |
| Architecture and CI | Platform Agent | Approved spec traceability and environmental controls |
| QC report | QC Agent | Evidence of each acceptance criterion and NFR target |

## Approval gate

**Ready for Platform/Codex** only when:
- [ ] Owner approves a concrete MVP scope and exclusions.
- [ ] Feature specs and acceptance criteria are testable.
- [ ] Security, privacy and NFR assumptions are documented.
- [ ] Dependencies, budget constraints and open risks are visible.
- [ ] GitHub issue/PR contains an approval record.

Current pilot scope is **Draft**. The static dashboard is synthetic demonstration data and is not an approved product implementation.
