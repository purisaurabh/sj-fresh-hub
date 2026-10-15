import { expect, test } from "@playwright/test";

test("storefront home page renders brand and search", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /fresh, healthy & tasty produce/i })).toBeVisible();
  await expect(page.getByRole("search")).toBeVisible();
});
