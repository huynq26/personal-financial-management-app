import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  createVault, encryptDocument, unlockVault,
} from "../lib/vault-crypto";
import { blankSnapshot } from "../lib/household";

test("static export is configured, and there are no server API routes", () => {
  const config = readFileSync("next.config.ts", "utf8");
  assert.match(config, /output:\s*["']export["']/);
  assert.ok(existsSync("out/index.html"), "Production static export must exist");
  assert.ok(!existsSync("app/api"), "No financial API endpoint allowed");
  assert.ok(!existsSync("pages/api"), "No financial API endpoint allowed");
  assert.ok(!existsSync("out/api"), "No exported API routes allowed");
});

test("cryptographic vault authenticates and resists modified payloads", async () => {
  const phrase = "Fictional passphrase used for QC only!";
  const { key, envelope } = await createVault(phrase);
  const document = {
    version: 1 as const,
    snapshots: {
      "2026-11": { ...blankSnapshot("2026-11"), income: "9876543210000" },
    },
  };
  const encrypted = await encryptDocument(document, key, envelope.salt);
  assert.ok(!JSON.stringify(encrypted).includes("9876543210000"));
  assert.deepEqual((await unlockVault(encrypted, phrase)).document, document);
  const changed = {
    ...encrypted,
    ciphertext: (encrypted.ciphertext[0] === "A" ? "B" : "A") +
      encrypted.ciphertext.slice(1),
  };
  await assert.rejects(unlockVault(changed, phrase));
  await assert.rejects(unlockVault(encrypted, "wrong secret passphrase"));
});

test("production export contains no unencrypted household data files", () => {
  const root = readdirSync("out", { withFileTypes: true });
  const risky = root
    .filter((x) => x.isFile() && /\.(json|csv|sqlite|db)$/i.test(x.name))
    .map((x) => join("out", x.name));
  assert.deepEqual(risky, [], "No household data dumps may ship in the static root");
});
