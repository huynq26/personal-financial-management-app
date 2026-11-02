import { expect, test } from "@playwright/test";

const PASSPHRASE = "Fictional example passphrase only 2026!";
const TEST_AMOUNT = "45000000";

test("real browser: encrypt, save, reload, unlock and inspect only ciphertext", async ({ page }) => {
  const externalRequests: string[] = [];
  const writes: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:3000") externalRequests.push(url.origin);
    if (!["GET", "HEAD"].includes(request.method())) writes.push(request.method());
  });
  await page.goto("/");
  await expect(page.getByText("Development build — fictional figures only.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create encrypted vault" })).toBeVisible();
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  await page.locator("#confirm-passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Create encrypted vault" }).click();
  await expect(page.getByRole("heading", { name: "Financial overview" })).toBeVisible();
  await page.getByRole("button", { name: "Load sample values" }).click();
  await expect(page.locator("#income")).toHaveValue(TEST_AMOUNT);
  await page.getByRole("button", { name: "Encrypt & save on device" }).click();
  await expect(page.getByText("Encrypted snapshot saved on this device.")).toBeVisible();

  const storage = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open("household-financial-vault", 1);
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    try {
      const encrypted = await new Promise<unknown>((resolve, reject) => {
        const read = db.transaction("encrypted-records", "readonly")
          .objectStore("encrypted-records").get("household");
        read.onsuccess = () => resolve(read.result);
        read.onerror = () => reject(read.error);
      });
      return JSON.stringify(encrypted);
    } finally {
      db.close();
    }
  });
  expect(storage).toContain("ciphertext");
  expect(storage).not.toContain(TEST_AMOUNT);
  expect(storage).not.toContain(PASSPHRASE);

  await page.reload();
  await expect(page.getByRole("button", { name: "Unlock vault" })).toBeVisible();
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Unlock vault" }).click();
  await expect(page.locator("#income")).toHaveValue(TEST_AMOUNT);
  expect(externalRequests).toEqual([]);
  expect(writes).toEqual([]);
});

test("real browser: wrong passphrase cannot unlock saved financial data", async ({ page }) => {
  await page.goto("/");
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  await page.locator("#confirm-passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Create encrypted vault" }).click();
  await expect(page.getByRole("heading", { name: "Financial overview" })).toBeVisible();
  await page.getByRole("button", { name: "Lock vault" }).click();
  await page.locator("#vault-passphrase").fill("wrong but long enough passphrase");
  await page.getByRole("button", { name: "Unlock vault" }).click();
  await expect(page.locator("p.error[role=\"alert\"]")).toContainText(/incorrect passphrase|damaged encrypted data/i);
  await expect(page.getByRole("heading", { name: "Financial overview" })).toHaveCount(0);
});
