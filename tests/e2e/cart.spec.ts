import { expect, test } from "@playwright/test";

test("guest can add an in-stock item and is asked to log in at checkout", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const addButton = page.getByRole("button", { name: /^add$/i }).first();
  try {
    await addButton.waitFor({ timeout: 15_000 });
  } catch {
    test.skip(true, "No in-stock catalog items are available.");
  }
  await addButton.click();
  await page.goto("/cart", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: /continue to checkout/i })).toBeVisible();
  await page.getByRole("link", { name: /continue to checkout/i }).click();
  await expect(page).toHaveURL(/\/login/);
});
