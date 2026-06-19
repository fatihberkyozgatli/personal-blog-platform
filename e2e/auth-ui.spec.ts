import { test, expect } from "@playwright/test";

test("login page renders the form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test("mobile nav opens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /menu/i }).first();
  await toggle.click();
  await expect(page.getByRole("link", { name: /blogs/i }).first()).toBeVisible();
});
