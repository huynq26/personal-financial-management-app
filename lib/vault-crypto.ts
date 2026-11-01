import { validateDocument, type VaultDocument } from "./household";

export const KDF_ITERATIONS = 310_000;

export interface VaultEnvelope {
  format: "household-vault";
  version: 1;
  salt: string;
  iv: string;
  ciphertext: string;
  iterations: number;
  updatedAt: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    s += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(s);
}
function fromBase64(value: string): Uint8Array {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) {
    throw new Error("Invalid encrypted backup encoding.");
  }
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}

export function validateEnvelope(value: unknown): asserts value is VaultEnvelope {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Invalid encrypted vault file.");
  }
  const e = value as Record<string, unknown>;
  if (e.format !== "household-vault" || e.version !== 1 || e.iterations !== KDF_ITERATIONS ||
      typeof e.salt !== "string" || typeof e.iv !== "string" ||
      typeof e.ciphertext !== "string" || typeof e.updatedAt !== "string") {
    throw new Error("Unsupported encrypted vault version.");
  }
  if (e.ciphertext.length > 2_000_000 || e.updatedAt.length > 50 ||
      fromBase64(e.salt).length !== 16 || fromBase64(e.iv).length !== 12 ||
      fromBase64(e.ciphertext).length < 17) {
    throw new Error("Invalid encrypted vault contents.");
  }
}

async function deriveVaultKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", encoder.encode(passphrase),
    "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: KDF_ITERATIONS, hash: "SHA-256" },
    material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"],
  );
}

export async function encryptDocument(
  document: VaultDocument,
  key: CryptoKey,
  salt: string,
): Promise<VaultEnvelope> {
  validateDocument(document);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encoder.encode(JSON.stringify(document));
  const buffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    format: "household-vault", version: 1, salt, iterations: KDF_ITERATIONS,
    iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(buffer)),
    updatedAt: new Date().toISOString(),
  };
}

export async function createVault(passphrase: string): Promise<{
  key: CryptoKey; document: VaultDocument; envelope: VaultEnvelope
}> {
  if (passphrase.length < 12) throw new Error("Choose a passphrase with at least 12 characters.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveVaultKey(passphrase, salt);
  const document: VaultDocument = { version: 1, snapshots: {} };
  const envelope = await encryptDocument(document, key, toBase64(salt));
  return { key, document, envelope };
}

export async function unlockVault(envelope: VaultEnvelope, passphrase: string): Promise<{
  key: CryptoKey; document: VaultDocument
}> {
  validateEnvelope(envelope);
  const key = await deriveVaultKey(passphrase, fromBase64(envelope.salt));
  try {
    const buffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(envelope.iv) }, key, fromBase64(envelope.ciphertext),
    );
    const document: unknown = JSON.parse(decoder.decode(buffer));
    validateDocument(document);
    return { key, document };
  } catch {
    throw new Error("Unable to unlock: incorrect passphrase or damaged encrypted data.");
  }
}

export function parseBackup(contents: string): VaultEnvelope {
  if (contents.length > 2_500_000) throw new Error("Backup is too large.");
  let parsed: unknown;
  try { parsed = JSON.parse(contents); }
  catch { throw new Error("Not a valid encrypted backup file."); }
  validateEnvelope(parsed);
  return parsed;
}

export function serializeBackup(envelope: VaultEnvelope): string {
  validateEnvelope(envelope);
  return JSON.stringify(envelope, null, 2);
}
