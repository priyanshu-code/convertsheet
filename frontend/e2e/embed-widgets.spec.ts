import { test, expect } from "@playwright/test";

test.describe("Embed Widget Isolation & UI", () => {
  test("Embed widget for converters hides website Navbar and Footer", async ({ page }) => {
    await page.goto("/embed/csv-to-jsonl");

    // The main site header navigation should NOT exist inside the embed iframe view
    const mainNav = page.locator('header:has-text("Tools")');
    await expect(mainNav).not.toBeVisible();

    // The main site multi-column footer should NOT exist
    const mainFooter = page.locator('footer:has-text("Converters")');
    await expect(mainFooter).not.toBeVisible();

    // But the embed attribution bar MUST be visible
    await expect(page.locator("text=100% Client-Side • Private & Free")).toBeVisible();
    await expect(page.locator('a:has-text("ConvertSheet")')).toBeVisible();

    // Drag-and-drop zone should be interactive
    await expect(page.locator("text=Drop your CSV file here")).toBeVisible();
  });

  test("Embed widget for calculators hides Navbar and Footer", async ({ page }) => {
    await page.goto("/embed/mortgage-calculator");

    // Main site header should NOT exist
    await expect(page.locator('header:has-text("Tools")')).not.toBeVisible();

    // Calculator input fields must be visible
    await expect(page.locator("text=Home Purchase Price")).toBeVisible();
    await expect(page.locator("text=Monthly Payment Breakdown")).toBeVisible();
  });
});
