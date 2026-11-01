import { validateEnvelope, type VaultEnvelope } from "./vault-crypto";

const DB_NAME = "household-financial-vault";
const STORE = "encrypted-records";
const VAULT_KEY = "household";

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

export async function writeVault(envelope: VaultEnvelope): Promise<void> {
  validateEnvelope(envelope);
  const db = await openVaultDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Could not save the encrypted vault."));
      tx.onabort = () => reject(new Error("Local storage was interrupted; no save was confirmed."));
      tx.objectStore(STORE).put(envelope, VAULT_KEY);
    });
  } finally { db.close(); }
}

export async function deleteVault(): Promise<void> {
  const db = await openVaultDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Could not delete the local vault."));
      tx.onabort = () => reject(new Error("Local deletion was interrupted."));
      tx.objectStore(STORE).delete(VAULT_KEY);
    });
  } finally { db.close(); }
}

export async function requestPersistentStorage(): Promise<boolean | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return null;
  try { return await navigator.storage.persist(); }
  catch { return null; }
}
