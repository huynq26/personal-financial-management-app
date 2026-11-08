import { validateEnvelope, type VaultEnvelope } from "./vault-crypto";

const DB_NAME = "household-financial-vault";
const STORE = "encrypted-records";
const VAULT_KEY = "household";

export class VaultConflictError extends Error {
  constructor() {
    super("Another tab changed this encrypted vault. Your unsaved edits remain on screen. Copy them before locking, then reload and unlock the latest vault. No overwrite was saved.");
    this.name = "VaultConflictError";
  }
}

function openVaultDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("This browser does not support local vault storage."));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Unable to open local encrypted storage."));
    request.onblocked = () => reject(new Error("Another open tab is blocking local storage."));
  });
}

// Compare the full persisted encrypted envelope inside ONE readwrite IDB transaction.
// A preflight read outside the transaction would allow cross-tab lost updates.
// Every fresh encryption has a random IV; it cannot equal an earlier revision.
function matchesRevision(actual: unknown, expected: VaultEnvelope | null): boolean {
  if (expected === null) return actual === undefined;
  if (typeof actual !== "object" || actual === null || Array.isArray(actual)) return false;
  const record = actual as Record<string, unknown>;
  return (["format", "version", "iterations", "salt", "iv", "ciphertext", "updatedAt"] as const)
    .every(field => record[field] === expected[field]);
}

async function atomicMutation(
  expected: VaultEnvelope | null,
  replacement: VaultEnvelope | null,
): Promise<void> {
  if (expected !== null) validateEnvelope(expected);
  if (replacement !== null) validateEnvelope(replacement);
  const db = await openVaultDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      let conflict = false;
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Could not commit encrypted vault changes."));
      tx.onabort = () => reject(conflict
        ? new VaultConflictError()
        : new Error("Local storage was interrupted; changes were not saved."));
      const store = tx.objectStore(STORE);
      const read = store.get(VAULT_KEY);
      read.onsuccess = () => {
        if (!matchesRevision(read.result, expected)) {
          conflict = true;
          tx.abort();
          return;
        }
        // The read and write are protected by this same transaction lock.
        if (replacement === null) store.delete(VAULT_KEY);
        else store.put(replacement, VAULT_KEY);
      };
      // Request errors abort the transaction and are reported via tx.onabort.
    });
  } finally { db.close(); }
}

export async function readVault(): Promise<VaultEnvelope | null> {
  const db = await openVaultDB();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(VAULT_KEY);
      request.onsuccess = () => {
        try {
          if (request.result === undefined) return resolve(null);
          validateEnvelope(request.result);
          resolve(request.result);
        } catch (error) { reject(error); }
      };
      request.onerror = () => reject(new Error("Unable to read the local vault."));
    });
  } finally { db.close(); }
}

/** Commit only if the current persisted version still equals expected. */
export async function writeVault(
  envelope: VaultEnvelope, expected: VaultEnvelope | null,
): Promise<void> {
  await atomicMutation(expected, envelope);
}

/** Deletion is also protected against newer edits made in another tab. */
export async function deleteVault(expected: VaultEnvelope): Promise<void> {
  await atomicMutation(expected, null);
}

export async function requestPersistentStorage(): Promise<boolean | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return null;
  try { return await navigator.storage.persist(); }
  catch { return null; }
}
