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


test("browser: stale second tab cannot silently overwrite a newer encrypted month", async ({ page, context }) => {
  await page.goto("/");
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  await page.locator("#confirm-passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Create encrypted vault" }).click();
  await expect(page.getByRole("heading", { name: "Financial overview" })).toBeVisible();
  await page.locator("#income").fill("100");
  await page.getByRole("button", { name: "Encrypt & save on device" }).click();
  await expect(page.getByText("Encrypted snapshot saved on this device.", { exact: false })).toBeVisible();

  const other = await context.newPage();
  await other.goto("/");
  await other.locator("#vault-passphrase").fill(PASSPHRASE);
  await other.getByRole("button", { name: "Unlock vault" }).click();
  await expect(other.locator("#income")).toHaveValue("100");

  await page.locator("#income").fill("200");
  await page.getByRole("button", { name: "Encrypt & save on device" }).click();
  await expect(page.getByText("Encrypted snapshot saved on this device.", { exact: false })).toBeVisible();

  const savedMonth = await other.locator("#month").inputValue();
  await other.locator("#month").fill(savedMonth === "2026-10" ? "2026-09" : "2026-10");
  await other.locator("#income").fill("300");
  await other.getByRole("button", { name: "Encrypt & save on device" }).click();
  await expect(other.locator('p.error[role="alert"]')).toContainText("Another tab changed this encrypted vault");
  await expect(other.locator(".dirty-pill").getByText("Unsaved edits", { exact: true })).toBeVisible();
  await expect(other.locator("#income")).toHaveValue("300");

  // After deliberately discarding the unsaved stale tab, the committed latest
  // value from the first tab is still available and not overwritten.
  await other.reload();
  await other.locator("#vault-passphrase").fill(PASSPHRASE);
  await other.getByRole("button", { name: "Unlock vault" }).click();
  await expect(other.locator("#income")).toHaveValue("200");
});

test("browser: restoring an older backup cannot recreate a stale tab revision (ABA)", async ({ page, context }) => {
  await page.goto("/");
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  await page.locator("#confirm-passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Create encrypted vault" }).click();
  await expect(page.locator("#income")).toBeVisible();
  await page.locator("#income").fill("100");
  await page.getByRole("button", { name: "Encrypt & save on device" }).click();
  await expect(page.getByText("Encrypted snapshot saved on this device.", { exact: false })).toBeVisible();

  // Capture a synthetic encrypted backup at revision E2. Another tab keeps
  // E2 unlocked while the first tab saves E3 and then restores the E2 backup.
  const backup = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open("household-financial-vault", 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    try {
      return await new Promise<unknown>((resolve, reject) => {
        const req = db.transaction("encrypted-records", "readonly")
          .objectStore("encrypted-records").get("household");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } finally {
      db.close();
    }
  });
  expect(backup).toBeTruthy();

  const stale = await context.newPage();
  await stale.goto("/");
  await stale.locator("#vault-passphrase").fill(PASSPHRASE);
  await stale.getByRole("button", { name: "Unlock vault" }).click();
  await expect(stale.locator("#income")).toHaveValue("100");

  await page.locator("#income").fill("200");
  await page.getByRole("button", { name: "Encrypt & save on device" }).click();
  await expect(page.getByText("Encrypted snapshot saved on this device.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Lock vault" }).click();
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  page.once("dialog", dialog => void dialog.accept());
  await page.locator("#backup-file").setInputFiles({
    name: "synthetic-vault-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByText("Encrypted backup restored locally.")).toBeVisible();
  await expect(page.locator("#income")).toHaveValue("100");

  // Without fresh encryption, the restored bytes match stale tab E2 exactly,
  // its read-compare-write succeeds, and restored data is silently lost.
  await stale.locator("#income").fill("300");
  await stale.getByRole("button", { name: "Encrypt & save on device" }).click();
  await expect(stale.locator('p.error[role="alert"]')).toContainText(
    "Another tab changed this encrypted vault"
  );
  await expect(stale.locator("#income")).toHaveValue("300");
  await expect(stale.locator(".dirty-pill")).toContainText("Unsaved edits");

  await page.reload();
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Unlock vault" }).click();
  await expect(page.locator("#income")).toHaveValue("100");
});

test("browser: editing and month switching are disabled during a pending save", async ({ page }) => {
  await page.goto("/");
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  await page.locator("#confirm-passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Create encrypted vault" }).click();
  await expect(page.locator("#income")).toBeVisible();
  await page.locator("#income").fill("123456");

  await page.evaluate(() => {
    const original = SubtleCrypto.prototype.encrypt;
    Object.defineProperty(SubtleCrypto.prototype, "encrypt", {
      configurable: true,
      value: async function (this: SubtleCrypto, ...args: unknown[]) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return Reflect.apply(original, this, args);
      },
    });
  });
  await page.getByRole("button", { name: "Encrypt & save on device" }).click();
  await expect(page.locator("#income")).toBeDisabled();
  await expect(page.locator("#month")).toBeDisabled();
  await expect(page.locator("#overdue")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Load sample values" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Lock vault" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Export encrypted backup" })).toBeDisabled();
  await expect(page.locator("#income")).toBeEnabled();
  await expect(page.locator("#income")).toHaveValue("123456");
  await expect(page.getByText("Unsaved edits")).toHaveCount(0);
});

test("browser: canceling sample replacement preserves unsaved real-form edits", async ({ page }) => {
  await page.goto("/");
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  await page.locator("#confirm-passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Create encrypted vault" }).click();
  await expect(page.locator("#income")).toBeVisible();
  await page.locator("#income").fill("333");
  page.once("dialog", dialog => void dialog.dismiss());
  await page.getByRole("button", { name: "Load sample values" }).click();
  await expect(page.locator("#income")).toHaveValue("333");
  await expect(page.getByText("Unsaved edits")).toBeVisible();
  page.once("dialog", dialog => void dialog.accept());
  await page.getByRole("button", { name: "Load sample values" }).click();
  await expect(page.locator("#income")).toHaveValue(TEST_AMOUNT);
});

test("browser: failed encrypted storage write retains the unsaved form", async ({ page }) => {
  await page.goto("/");
  await page.locator("#vault-passphrase").fill(PASSPHRASE);
  await page.locator("#confirm-passphrase").fill(PASSPHRASE);
  await page.getByRole("button", { name: "Create encrypted vault" }).click();
  await expect(page.locator("#income")).toBeVisible();
  await page.locator("#income").fill("222");

  await page.evaluate(() => {
    Object.defineProperty(IDBDatabase.prototype, "transaction", {
      configurable: true,
      value: function () {
        throw new DOMException("Simulated storage quota failure", "QuotaExceededError");
      },
    });
  });
  await page.getByRole("button", { name: "Encrypt & save on device" }).click();
  await expect(page.locator('p.error[role="alert"]')).toContainText("Simulated storage quota failure");
  await expect(page.getByText("Unsaved edits")).toBeVisible();
  await expect(page.locator("#income")).toHaveValue("222");
});
