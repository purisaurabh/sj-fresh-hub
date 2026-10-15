import { expect, test } from "@playwright/test";

test("unauthenticated visitors are sent to login for private routes", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();

  await page.goto("/checkout", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/notifications", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/);
});

test("register page asks for an approved building", async ({ page }) => {
  await page.goto("/register", { waitUntil: "domcontentloaded" });
  const formHeading = page.getByRole("heading", { name: /create your account/i });
  const closedHeading = page.getByRole("heading", { name: /registration is not open/i });
  await expect(formHeading.or(closedHeading)).toBeVisible();
  if (await formHeading.isVisible()) {
    await expect(page.getByLabel(/building/i)).toBeVisible();
  }
});
