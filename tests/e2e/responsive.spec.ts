import { expect, test } from "@playwright/test";

test("storefront fits a 360px phone width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /fresh, healthy & tasty produce/i })).toBeVisible();
  await expect(page.getByRole("search").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});
