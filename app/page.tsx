import { netWorth, savingsRate } from "../lib/metrics";

const sample = {
  income: 5000,
  expenses: 3400,
  assets: 42500,
  liabilities: 7500,
};
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const format = (value: number) => currency.format(value);

const nextSteps = [
  { number: "01", title: "Define real user journeys", description: "Agree how users enter information and which outcomes matter." },
  { number: "02", title: "Build the first feature", description: "Codex implements a scoped GitHub Issue with tests and review." },
  { number: "03", title: "Verify independently", description: "QC tests behavior, privacy, accessibility and reliability." },
];

export default function Home() {
  return (
    <main className="page">
      <header className="topbar">
        <div className="brand"><div className="mark">F</div><span>Finance Lab</span></div>
        <span className="preview-label">SOFTWARE FACTORY PILOT</span>
      </header>

      <section className="hero">
        <div className="eyebrow"><span className="dot" /> PREVIEW ENVIRONMENT</div>
        <h1>Money clarity,<br/><span>built intentionally.</span></h1>
        <p>A foundation for understanding personal cash flow, setting goals, and making better-informed decisions. Our AI software factory is building the first release.</p>
        <div className="hero-tags"><span>Next.js + TypeScript</span><span>Codex engineering</span><span>Vercel previews</span></div>
      </section>

      <section className="section" aria-labelledby="demo-title">
        <div className="section-header">
          <div><p className="overline">SAMPLE DASHBOARD</p><h2 id="demo-title">Financial overview</h2></div>
          <div className="sample-pill">Fictional data only</div>
        </div>
        <div className="metrics">
          <article className="metric"><p>Net worth</p><strong>{format(netWorth(sample.assets, sample.liabilities))}</strong><span>Example assets minus liabilities</span></article>
          <article className="metric"><p>Monthly income</p><strong>{format(sample.income)}</strong><span>Illustrative income</span></article>
          <article className="metric"><p>Monthly expenses</p><strong>{format(sample.expenses)}</strong><span>Illustrative spending</span></article>
          <article className="metric accent"><p>Savings rate</p><strong>{savingsRate(sample.income, sample.expenses)}%</strong><span>Calculated from sample values</span></article>
        </div>
      </section>

      <section className="section next-section" aria-labelledby="next-title">
        <div><p className="overline">PRODUCT DELIVERY</p><h2 id="next-title">What happens next</h2></div>
        <div className="steps">
          {nextSteps.map((step) => (
            <article className="step" key={step.number}>
              <span className="step-number">{step.number}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </article>
          ))}
        </div>
      </section>
      <footer>Preview-only technical starter. No real accounts, transactions or financial advice.</footer>
    </main>
  );
}
