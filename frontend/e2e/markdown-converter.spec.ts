import { test, expect } from "@playwright/test";

test.describe("Markdown to Excel Converter & Embed Flow", () => {
  test("Test 1: Page availability & SEO", async ({ page }) => {
    const res = await page.goto("/convert/markdown-to-excel");
    expect(res?.status()).toBe(200);

    // Confirm no 404 text
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=This page could not be found")).not.toBeVisible();

    // Confirm <h1> is visible with expected text
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Convert Markdown & HTML Table to Excel");

    // Confirm canonical URL
    const canonical = await page.$eval('link[rel="canonical"]', (el) =>
      el.getAttribute("href")
    );
    expect(canonical).toBe("https://convertsheet.com/convert/markdown-to-excel");
  });

  test("Test 2: Split input interactive flow", async ({ page }) => {
    await page.goto("/convert/markdown-to-excel");

    // Check textarea with placeholder or aria-label "Paste table text" is visible
    const textarea = page.locator('textarea[aria-label="Paste table text"]');
    await expect(textarea).toBeVisible();

    // Click "Load Sample Table" button
    const loadSampleButton = page.locator('button:has-text("Load Sample Table")');
    await expect(loadSampleButton).toBeVisible();
    await loadSampleButton.click();

    // Verify textarea value contains sample markdown table with | Product | Unit Price |
    await expect(textarea).toHaveValue(/\| Product \| Unit Price \|/);

    // Click "Parse & Preview Table"
    const parseButton = page.locator('button:has-text("Parse & Preview Table")');
    await expect(parseButton).toBeVisible();
    await parseButton.click();

    // Verify preview table renders with column headers "Product", "Unit Price", "Qty", "Status"
    const previewTable = page.locator("table");
    await expect(previewTable).toBeVisible();
    await expect(page.locator('th:has-text("Product")')).toBeVisible();
    await expect(page.locator('th:has-text("Unit Price")')).toBeVisible();
    await expect(page.locator('th:has-text("Qty")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();

    // Verify "Convert & Download (.xlsx)" button becomes enabled
    const downloadButton = page.locator('button:has-text("Convert & Download")');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();
  });

  test("Test 3: Embed Route isolation", async ({ page }) => {
    const res = await page.goto("/embed/markdown-to-excel");
    expect(res?.status()).toBe(200);

    // Confirm no 404 text
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=This page could not be found")).not.toBeVisible();

    // Confirm site Navbar and Footer are hidden
    const mainNav = page.locator('header:has-text("Tools")');
    await expect(mainNav).not.toBeVisible();

    const mainFooter = page.locator('footer:has-text("Converters")');
    await expect(mainFooter).not.toBeVisible();

    // Confirm attribution bar "Powered by ConvertSheet" links to canonical converter URL
    const attributionLink = page.locator('footer a:has-text("ConvertSheet")');
    await expect(attributionLink).toBeVisible();
    await expect(attributionLink).toHaveAttribute(
      "href",
      "https://convertsheet.com/convert/markdown-to-excel"
    );
  });
});
