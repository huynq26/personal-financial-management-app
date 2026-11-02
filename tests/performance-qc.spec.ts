import { expect, test } from "@playwright/test";

test("real browser: synthetic landing page loads within bounded UX budget", async ({ page }) => {
  const started = Date.now();
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.getByText("Development build — fictional figures only.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create encrypted vault" })).toBeVisible();
  const elapsed = Date.now() - started;
  expect(elapsed).toBeLessThan(15_000);
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    return { loaded: document.readyState, dcl: nav?.domContentLoadedEventEnd ?? -1 };
  });
  expect(["interactive", "complete"]).toContain(perf.loaded);
  expect(perf.dcl).toBeGreaterThan(0);
});
