import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await expect(page).toHaveTitle(/.+/);
});

test("blog listing renders", async ({ page }) => {
  await page.goto("/blogs");
  await expect(page.getByRole("heading", { name: /all blog posts/i })).toBeVisible();
});

test("anon sees the reading-wall gate on a post, not the full body", async ({ page }) => {
  await page.goto("/blogs");
  const firstPost = page.locator('a[href^="/blogs/"]').first();
  await firstPost.click();
  await expect(page.getByRole("heading", { name: /sign in to keep reading/i })).toBeVisible();
});
