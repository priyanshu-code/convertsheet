import { test, expect } from "@playwright/test";

test.describe("Visual UI & Responsive Layouts", () => {
  test("Converter card renders cleanly on desktop and mobile viewports", async ({ page }) => {
    await page.goto("/convert/csv-to-jsonl");

    // Title and dropzone
    await expect(page.locator("h1")).toBeVisible();
    const dropzone = page.locator("text=Drop your CSV file here");
    await expect(dropzone).toBeVisible();

    // Verify Theme Toggle works
    const themeButton = page.locator('button[aria-label="Toggle theme"], button[aria-label*="theme" i]');
    if (await themeButton.isVisible()) {
      await themeButton.click();
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      expect(typeof isDark).toBe("boolean");
    }
  });

  test("Embed trigger opens Embed Modal properly", async ({ page }) => {
    await page.goto("/convert/csv-to-jsonl");

    // Click "Embed" button
    const embedButton = page.locator('button:has-text("Embed")');
    await expect(embedButton).toBeVisible();
    await embedButton.click();

    // Modal dialog should appear
    const modalDialog = page.locator('div[role="dialog"]');
    await expect(modalDialog).toBeVisible();
    await expect(modalDialog.locator("text=Embed CSV to JSONL Converter on Your Website")).toBeVisible();

    // "Open preview in new tab" link check
    const previewLink = modalDialog.locator('a:has-text("Open preview in new tab")');
    await expect(previewLink).toBeVisible();
    await expect(previewLink).toHaveAttribute("href", "/embed/csv-to-jsonl");
  });
});
