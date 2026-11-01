import test from "node:test";
import assert from "node:assert/strict";
import {
  createVault, encryptDocument, parseBackup, serializeBackup, unlockVault,
} from "../lib/vault-crypto";
import { blankSnapshot, type VaultDocument } from "../lib/household";

test("encrypt, decrypt, and export a household snapshot without plaintext in envelope", async () => {
  const passphrase = "a strongly private local passphrase 2026";
  const created = await createVault(passphrase);
  const snapshot = { ...blankSnapshot("2026-11"), income: "12345678901234567890" };
  const doc: VaultDocument = { version: 1, snapshots: { "2026-11": snapshot } };
  const envelope = await encryptDocument(doc, created.key, created.envelope.salt);
  const exported = serializeBackup(envelope);
  assert.ok(!exported.includes(snapshot.income));
  const restored = parseBackup(exported);
  const unlocked = await unlockVault(restored, passphrase);
  assert.equal(unlocked.document.snapshots["2026-11"].income, snapshot.income);
});

test("incorrect passphrase never unlocks a vault", async () => {
  const created = await createVault("valid passphrase that is long enough");
  await assert.rejects(unlockVault(created.envelope, "an incorrect passphrase"));
});

test("corrupt ciphertext fails authenticated decryption", async () => {
  const created = await createVault("another sufficiently long passphrase");
  const original = created.envelope.ciphertext;
  const modified = (original[0] === "A" ? "B" : "A") + original.slice(1);
  await assert.rejects(unlockVault({ ...created.envelope, ciphertext: modified }, "another sufficiently long passphrase"));
});

test("short passphrases are rejected for new vaults", async () => {
  await assert.rejects(createVault("short"), /12 characters/);
});

test("invalid backups are rejected before import", () => {
  assert.throws(() => parseBackup('{"data":"not a vault"}'));
  assert.throws(() => parseBackup("not-json"));
});
