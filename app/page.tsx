"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  assessHousehold, blankSnapshot, formatVnd, isValidVnd, moneyFields,
  type HouseholdSnapshot, type MoneyField, type VaultDocument,
} from "../lib/household";
import {
  createVault, encryptDocument, parseBackup, serializeBackup, unlockVault,
  type VaultEnvelope,
} from "../lib/vault-crypto";
import { deleteVault, readVault, requestPersistentStorage, writeVault } from "../lib/vault-store";

type Stage = "loading" | "create" | "unlock" | "ready";

function currentMonth(): string {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0")].join("-");
}

const sampleAmounts: Partial<HouseholdSnapshot> = {
  income: "45000000",
  essential: "18000000",
  discretionary: "8000000",
  repayments: "5000000",
  outstandingDebt: "120000000",
  liquidSavings: "35000000",
  assets: "2300000000",
  liabilities: "120000000",
  overdue: "no",
};

function friendlyError(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("loading");
  const [passphrase, setPassphrase] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [document, setDocument] = useState<VaultDocument | null>(null);
  const [form, setForm] = useState<HouseholdSnapshot>(() => blankSnapshot("2026-01"));
  const [dirty, setDirty] = useState(false);
  const [persistentStorage, setPersistentStorage] = useState<boolean | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);
  const envelopeRef = useRef<VaultEnvelope | null>(null);
  const backupRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(blankSnapshot(currentMonth()));
    let active = true;
    readVault().then(envelope => {
      if (!active) return;
      envelopeRef.current = envelope;
      setStage(envelope ? "unlock" : "create");
    }).catch(err => {
      if (!active) return;
      setStage("unlock");
      setError("The local vault could not be read. You may restore an encrypted backup. " + friendlyError(err));
    });
    return () => { active = false; };
  }, []);

  const overview = useMemo(() => assessHousehold(form), [form]);

  function enterReady(doc: VaultDocument, key: CryptoKey, envelope: VaultEnvelope) {
    const months = Object.keys(doc.snapshots).sort().reverse();
    const month = months[0] ?? currentMonth();
    keyRef.current = key;
    envelopeRef.current = envelope;
    setDocument(doc);
    setForm(doc.snapshots[month] ?? blankSnapshot(month));
    setDirty(false);
    setError("");
    setPassphrase("");
    setConfirmation("");
    setNotice("");
    setStage("ready");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (passphrase !== confirmation) {
      setError("The passphrases do not match.");
      return;
    }
    setBusy(true);
    try {
      const result = await createVault(passphrase);
      const existing = await readVault();
      if (existing) throw new Error("An existing vault was found. Unlock or restore it instead.");
      await writeVault(result.envelope);
      enterReady(result.document, result.key, result.envelope);
      setPersistentStorage(await requestPersistentStorage());
    } catch (err) { setError(friendlyError(err)); }
    finally { setBusy(false); }
  }

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const envelope = envelopeRef.current ?? await readVault();
      if (!envelope) throw new Error("No local vault found. Restore a backup or create a new vault.");
      const result = await unlockVault(envelope, passphrase);
      enterReady(result.document, result.key, envelope);
      setPersistentStorage(await requestPersistentStorage());
    } catch (err) { setError(friendlyError(err)); }
    finally { setBusy(false); }
  }

  function updateField(field: MoneyField, value: string) {
    if (!isValidVnd(value)) {
      setError("Enter whole VND using digits only, without commas, periods or negative values.");
      return;
    }
    setError("");
    setForm(previous => ({ ...previous, [field]: value }));
    setDirty(true);
    setNotice("");
  }

  function chooseMonth(month: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return;
    if (dirty && !window.confirm("Discard unsaved changes and switch months?")) return;
    setForm(document?.snapshots[month] ?? blankSnapshot(month));
    setDirty(false);
    setNotice("");
    setError("");
  }

  async function saveCurrent() {
    if (!document || !keyRef.current || !envelopeRef.current) return;
    setBusy(true);
    setError("");
    try {
      const updated: HouseholdSnapshot = { ...form, updatedAt: new Date().toISOString() };
      const next: VaultDocument = {
        version: 1, snapshots: { ...document.snapshots, [form.month]: updated },
      };
      const envelope = await encryptDocument(next, keyRef.current, envelopeRef.current.salt);
      await writeVault(envelope);
      envelopeRef.current = envelope;
      setDocument(next);
      setForm(updated);
      setDirty(false);
      setNotice("Encrypted snapshot saved on this device. Export a backup after important changes.");
    } catch (err) { setError(friendlyError(err)); }
    finally { setBusy(false); }
  }

  async function deleteMonth() {
    if (!document || !keyRef.current || !envelopeRef.current ||
      !document.snapshots[form.month] ||
      !window.confirm("Permanently remove this month's saved snapshot from this browser?")) return;
    setBusy(true);
    try {
      const snapshots = { ...document.snapshots };
      delete snapshots[form.month];
      const next: VaultDocument = { version: 1, snapshots };
      const envelope = await encryptDocument(next, keyRef.current, envelopeRef.current.salt);
      await writeVault(envelope);
      envelopeRef.current = envelope;
      setDocument(next);
      setForm(blankSnapshot(form.month));
      setDirty(false);
      setNotice("Month deleted from the local vault. Previous exported backups are unaffected.");
    } catch (err) { setError(friendlyError(err)); }
    finally { setBusy(false); }
  }

  function lockVault() {
    if (dirty && !window.confirm("Lock and discard unsaved edits?")) return;
    keyRef.current = null;
    setDocument(null);
    setForm(blankSnapshot(currentMonth()));
    setPassphrase("");
    setConfirmation("");
    setNotice("");
    setError("");
    setDirty(false);
    setStage("unlock");
  }

  async function removeVault() {
    if (!window.confirm("Delete the entire encrypted vault from this browser? You must have an exported backup to recover it.")) return;
    setBusy(true);
    setError("");
    try {
      await deleteVault();
      envelopeRef.current = null;
      keyRef.current = null;
      setDocument(null);
      setForm(blankSnapshot(currentMonth()));
      setDirty(false);
      setStage("create");
      setNotice("Local vault deleted. Any separately exported backups still exist.");
    } catch (err) { setError(friendlyError(err)); }
    finally { setBusy(false); }
  }

  async function downloadBackup() {
    if (dirty) {
      setError("Save or discard unsaved edits before exporting a backup.");
      return;
    }
    try {
      const envelope = await readVault();
      if (!envelope) throw new Error("No saved vault exists.");
      const data = new Blob([serializeBackup(envelope)], { type: "application/json" });
      const url = URL.createObjectURL(data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = "household-vault-encrypted-" + new Date().toISOString().slice(0, 10) + ".json";
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice("Encrypted backup exported. Keep the file and passphrase safe; test restoring it in a separate browser profile.");
      setError("");
    } catch (err) { setError(friendlyError(err)); }
  }

  async function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!passphrase) {
      setError("Enter the backup's passphrase before restoring.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (file.size > 2_500_000) throw new Error("Encrypted backup file is too large.");
      const envelope = parseBackup(await file.text());
      const unlocked = await unlockVault(envelope, passphrase);
      const existing = await readVault();
      if (existing && !window.confirm("Replace the encrypted vault currently stored in this browser with this backup?")) {
        return;
      }
      await writeVault(envelope);
      enterReady(unlocked.document, unlocked.key, envelope);
      setNotice("Encrypted backup restored locally.");
    } catch (err) { setError(friendlyError(err)); }
    finally { setBusy(false); }
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand"><span className="mark" aria-hidden="true">F</span><span>Family Finance</span></div>
        <div className="top-actions">
          <span className="preview-label">LOCAL-FIRST MVP</span>
          {stage === "ready" && <button className="button text-button" onClick={lockVault}>Lock vault</button>}
        </div>
      </header>

      <section className="safety-banner" aria-label="Safety notice">
        <strong>Development build — fictional figures only.</strong> Security and backup testing has not passed. Do not enter actual household financial information yet.
      </section>

      {stage === "loading" && <section className="center-panel"><h1>Opening local vault…</h1><p>Checking encrypted browser storage.</p></section>}

      {(stage === "create" || stage === "unlock") && (
        <section className="intro-layout">
          <div className="intro-copy">
            <p className="overline">PRIVATE BY DESIGN</p>
            <h1>Know your family's <em>financial picture.</em></h1>
            <p>Track household income, spending, debts and accessible savings. Figures are encrypted on this browser and never sent to a financial API.</p>
            <div className="feature-list">
              <span>Vietnamese đồng (VND)</span><span>One private household</span><span>No cloud database</span>
            </div>
            <p className="fine-print">One browser only. No automatic sync or password recovery. Browser data can be cleared or lost; export an encrypted backup before relying on this tool.</p>
          </div>
          <div className="panel vault-panel">
            <p className="overline">{stage === "create" ? "CREATE YOUR VAULT" : "WELCOME BACK"}</p>
            <h2>{stage === "create" ? "Protect your local data" : "Unlock your vault"}</h2>
            <p className="hint">{stage === "create" ? "Use a unique passphrase of at least 12 characters. Losing it means losing access to your encrypted records." : "Your passphrase stays on this device and is never sent to Vercel."}</p>
            <form onSubmit={stage === "create" ? handleCreate : handleUnlock} className="stack">
              <label htmlFor="vault-passphrase">Local vault passphrase</label>
              <input id="vault-passphrase" type="password" autoComplete="off" minLength={stage === "create" ? 12 : undefined} required value={passphrase} onChange={e => setPassphrase(e.target.value)} placeholder="Enter your passphrase" />
              {stage === "create" && <>
                <label htmlFor="confirm-passphrase">Confirm passphrase</label>
                <input id="confirm-passphrase" type="password" autoComplete="off" required value={confirmation} onChange={e => setConfirmation(e.target.value)} placeholder="Enter it again" />
              </>}
              {error && <p role="alert" className="error">{error}</p>}
              {notice && <p role="status" className="success">{notice}</p>}
              <button className="button primary" type="submit" disabled={busy}>{busy ? "Working…" : stage === "create" ? "Create encrypted vault" : "Unlock vault"}</button>
            </form>
            <div className="import-group">
              <p className="hint">Have an encrypted backup? Enter its passphrase above, then select the backup file.</p>
              <input ref={backupRef} className="visually-hidden" id="backup-file" type="file" accept=".json,application/json" onChange={restoreBackup} />
              <button type="button" className="button outline" disabled={busy} onClick={() => backupRef.current?.click()}>Restore encrypted backup</button>
            </div>
          </div>
        </section>
      )}

      {stage === "ready" && document && (
        <>
          <section className="dashboard-heading">
            <div>
              <p className="overline">YOUR HOUSEHOLD · ENCRYPTED LOCALLY</p>
              <h1>Financial overview</h1>
              <p className="lede">Understand your family's current financial position, one month at a time.</p>
            </div>
            <span className="local-pill">Stored on this device only</span>
          </section>

          {error && <p role="alert" className="error alert-block">{error}</p>}
          {notice && <p role="status" className="success alert-block">{notice}</p>}
          <div className="dashboard-grid">
            <section className="panel input-panel" aria-labelledby="input-title">
              <div className="panel-heading">
                <div><p className="overline">01 · INPUT</p><h2 id="input-title">Household snapshot</h2></div>
                {dirty && <span className="dirty-pill">Unsaved edits</span>}
              </div>
              <div className="month-row">
                <div className="field"><label htmlFor="month">Reporting month</label>
                  <input id="month" type="month" value={form.month} onChange={e => chooseMonth(e.target.value)} /></div>
                <button className="button outline small" type="button" onClick={() => {
                  setForm({ ...blankSnapshot(form.month), ...sampleAmounts, updatedAt: "" });
                  setDirty(true);
                  setNotice("Fictional sample values loaded; they have not been saved.");
                }}>Load sample values</button>
              </div>
              <div className="fields-grid">
                {moneyFields.map(field => (
                  <div className="field" key={field.key}>
                    <label htmlFor={field.key}>{field.label}</label>
                    <div className="money-input"><input
                      id={field.key} type="text" inputMode="numeric" autoComplete="off"
                      value={form[field.key]} onChange={e => updateField(field.key, e.target.value.trim())}
                      placeholder="Leave blank if unknown" aria-describedby={field.key + "-hint"} />
                      <span>VND</span></div>
                    <small id={field.key + "-hint"}>{field.hint}</small>
                  </div>
                ))}
              </div>
              <div className="field">
                <label htmlFor="overdue">Any overdue household bills or loan repayments?</label>
                <select id="overdue" value={form.overdue} onChange={e => { setForm(p => ({ ...p, overdue: e.target.value as HouseholdSnapshot["overdue"] })); setDirty(true); }}>
                  <option value="unknown">Unknown / not provided</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="form-actions">
                <button className="button primary" disabled={busy || !dirty} onClick={() => void saveCurrent()}>
                  {busy ? "Saving…" : "Encrypt & save on device"}
                </button>
                <button className="button outline" disabled={busy || !document.snapshots[form.month]} onClick={() => void deleteMonth()}>Delete this month</button>
              </div>
              <p className="fine-print">Blank means unknown, not zero. Assets should include your savings once; liabilities should include your loan balances once. Do not count debt repayments twice.</p>
            </section>

            <div className="results-column">
              <section className="panel result-panel" aria-labelledby="health-title">
                <p className="overline">02 · ASSESSMENT</p>
                <h2 id="health-title">Household financial health</h2>
                <div className="status-box">
                  <span className="status-label">Assessment rules pending approval</span>
                  <p>We can calculate your indicators, but we will not label your family Healthy, Caution or At Risk until the risk thresholds are reviewed and tested.</p>
                </div>
                {overview.missing.length > 0 && (
                  <div className="missing-box">
                    <strong>Incomplete information</strong>
                    <p>{overview.missing.length} financial field(s) are blank. Missing inputs cannot be treated as zero.</p>
                  </div>
                )}
                <div className="result-grid">
                  <div className="result-item"><span>Monthly surplus / deficit</span><strong>{formatVnd(overview.surplus)}</strong></div>
                  <div className="result-item"><span>Household net worth</span><strong>{formatVnd(overview.netWorth)}</strong></div>
                  <div className="result-item"><span>Emergency reserve coverage</span><strong>{overview.emergencyMonths === null ? "Unavailable" : overview.emergencyMonths + " months"}</strong></div>
                  <div className="result-item"><span>Debt-payment share of income</span><strong>{overview.debtPercent === null ? "Unavailable" : overview.debtPercent + "%"}</strong></div>
                </div>
                <p className="hint">Cash-flow = net income − essential spending − optional spending − required debt payments. Emergency coverage uses accessible savings, not property value.</p>
              </section>
              <section className="panel backup-panel" aria-labelledby="backup-title">
                <p className="overline">03 · BACKUP & PRIVACY</p>
                <h2 id="backup-title">Keep a recovery copy</h2>
                <p>Browser storage can disappear if your device is reset, the browser is cleared, or its storage is evicted. You cannot recover a lost passphrase.</p>
                <button className="button outline" onClick={() => void downloadBackup()}>Export encrypted backup</button>
                <p className="hint">Store your encrypted backup on a trusted device or drive in Vietnam. Lock this vault to restore a backup file.</p>
                {persistentStorage === false && <p className="hint">Your browser did not grant persistent storage. Backups are especially important.</p>}
                <div className="divider" />
                <button className="button danger" disabled={busy} onClick={() => void removeVault()}>Delete entire local vault</button>
              </section>
            </div>
          </div>
          <p className="footer-note">Prototype only · No cloud login, automatic sync, or investment advice · Financial information never intentionally uploaded by this app.</p>
        </>
      )}
    </main>
  );
}
