# Family Finance — Local-first Household Financial Health MVP

Pilot implementation for the [Software Factory](https://github.com/huynq26/software-factory).

> **SECURITY STATE: DEVELOPMENT / SYNTHETIC DATA ONLY.** This is an initial implementation; it has NOT passed independent cryptographic, browser, backup, and deployment security tests. **Do not enter actual household financial records or a real personal passphrase yet.**

## Architecture — approved for development

- Vercel Hobby hosts **static Next.js 16 UI** only (`next.config.ts` uses `output: "export"`).
- **One local device/browser**. A strong passphrase is used to derive an encryption key in the browser. **This is NOT a real online login**.
- Financial figures are stored as **AES-GCM-encrypted ciphertext in browser IndexedDB**, never in a remote database.
- VND household indicators are computed locally using exact `BigInt` whole-đồng arithmetic.
- Financial-health status labels are intentionally **disabled** until a versioned policy and thresholds are approved.
- Export/import preserves a **password-protected encrypted backup**. There is no automatic sync or passphrase recovery.
- **Browser data can be lost/evicted**; an exported encrypted backup, stored securely and physically in Vietnam, and a successful restore test are essential.

### Local development

Requires Node 22+.

```bash
npm install --no-audit --no-fund
npm run typecheck
npm test
npm run build
npm run dev
```

Open http://localhost:3000 and use **fictional** values only. The app lets you create a test vault, load example household amounts, save, view VND indicators, export an encrypted backup, lock/unlock, restore from a backup, and delete the vault.

### Expected data and limits

A snapshot stores monthly take-home household income, essential/discretionary expenses, required debt repayments, total outstanding debt, liquid savings available for family expenses, total assets/liabilities and overdue status. All amounts are **whole VND**, and blank means unknown rather than zero.

Calculations:

- Monthly surplus = income − essential spending − discretionary spending − required debt repayments.
- Emergency coverage months = accessible savings / (essential spending + required repayments), where denominator > 0.
- Debt burden = required repayments / monthly net income, where income > 0.
- Net worth = total household assets − total liabilities.
- Do not add debts or savings to totals twice. Real property is **not** counted as accessible emergency liquidity.

### Why an encrypted browser vault?

The user prioritized keeping their financial information in Vietnam and using free Vercel hosting. A browser-local encrypted vault means the app does not send figures to Vercel. However, **device/browser cloud backups, extensions or malicious code served in a future deployment can still compromise the intended boundary**. A local passphrase does not provide remote identity, recovery or multi-device sharing.

### Required independent security gates

See [ADR-0003](docs/adr/0003-vercel-local-first-mvp.md), [QC gates](docs/security/local-vault-qc-gates.md), [Codex local vault task](https://github.com/huynq26/personal-financial-management-app/issues/8), [QC task](https://github.com/huynq26/personal-financial-management-app/issues/6) and [Vercel task](https://github.com/huynq26/personal-financial-management-app/issues/9).

The owner has approved **development of the local-first architecture**, not a production release or collection of genuine household data. Before real use: verify encryption and passphrase lifecycle, browser network behavior, same-origin and CSP, iOS/browser retention, recovery from an encrypted backup, and deployment safety on an exact reviewed commit. Release only on explicit owner approval after independent QC.

## Centralized software-factory workflow

The **Product, Platform, QC and DevOps Agent skill definitions live in the [factory repository](https://github.com/huynq26/software-factory)**. This product repo keeps the approved project artifacts, source and tests, **not copies of the agents**.

Idea → central Product Agent → owner approves scope → Platform Agent architecture → Codex engineering PR → independent QC → explicit DevOps release approval.

No API keys, banking credentials, actual household amounts, personal passphrases, or secret tokens belong in this repository.
