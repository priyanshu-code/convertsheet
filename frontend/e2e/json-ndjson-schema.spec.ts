import { test, expect } from "@playwright/test";

test.describe("JSON to NDJSON & JSON to Schema E2E Flow", () => {
  test("Test 1: /convert/json-to-ndjson E2E Flow", async ({ page }) => {
    const res = await page.goto("/convert/json-to-ndjson");
    expect(res?.status()).toBe(200);

    // Confirm no 404 text
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=This page could not be found")).not.toBeVisible();

    // Valid <h1> is visible
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Convert JSON to NDJSON / JSONL");

    // Valid canonical URL
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://convertsheet.com/convert/json-to-ndjson"
    );

    // Split input is visible with textarea and "Load Sample JSON" button
    const splitInput = page.locator('[data-testid="split-json-input"]');
    await expect(splitInput).toBeVisible();

    const textarea = page.locator('textarea[aria-label="Paste JSON data"]');
    await expect(textarea).toBeVisible();

    const loadSampleButton = page.locator('button:has-text("Load Sample JSON")');
    await expect(loadSampleButton).toBeVisible();

    // Click "Load Sample JSON"
    await loadSampleButton.click();

    // Verify textarea has JSON sample content
    await expect(textarea).toHaveValue(/Sarah Chen/);

    // Click "Parse JSON & Preview"
    const parseButton = page.locator('button:has-text("Parse JSON & Preview")');
    await expect(parseButton).toBeVisible();
    await parseButton.click();

    // Tabular preview table appears with column headers (id, name, email, role)
    const previewTable = page.locator("table");
    await expect(previewTable).toBeVisible();
    await expect(previewTable.locator('th:has-text("id")')).toBeVisible();
    await expect(previewTable.locator('th:has-text("name")')).toBeVisible();
    await expect(previewTable.locator('th:has-text("email")')).toBeVisible();
    await expect(previewTable.locator('th:has-text("role")')).toBeVisible();

    // "Convert & Download NDJSON" button is enabled and visible
    const downloadButton = page.locator('button:has-text("Convert & Download NDJSON")');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();
  });

  test("Test 2: /convert/json-to-schema E2E Flow", async ({ page }) => {
    const res = await page.goto("/convert/json-to-schema");
    expect(res?.status()).toBe(200);

    // Confirm no 404 text
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=This page could not be found")).not.toBeVisible();

    // Valid <h1> is visible
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Generate JSON Schema from JSON");

    // Valid canonical URL
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://convertsheet.com/convert/json-to-schema"
    );

    // Split input is visible
    const splitInput = page.locator('[data-testid="split-json-input"]');
    await expect(splitInput).toBeVisible();

    const textarea = page.locator('textarea[aria-label="Paste JSON data"]');
    await expect(textarea).toBeVisible();

    // Click "Load Sample JSON"
    const loadSampleButton = page.locator('button:has-text("Load Sample JSON")');
    await expect(loadSampleButton).toBeVisible();
    await loadSampleButton.click();

    // Click "Parse JSON & Preview"
    const parseButton = page.locator('button:has-text("Parse JSON & Preview")');
    await expect(parseButton).toBeVisible();
    await parseButton.click();

    // Tabular schema preview appears with columns Property, Type, Required, Sample Value
    const previewTable = page.locator("table");
    await expect(previewTable).toBeVisible();
    await expect(previewTable.locator('th:has-text("Property")')).toBeVisible();
    await expect(previewTable.locator('th:has-text("Type")')).toBeVisible();
    await expect(previewTable.locator('th:has-text("Required")')).toBeVisible();
    await expect(previewTable.locator('th:has-text("Sample Value")')).toBeVisible();

    // Confirm inferred properties appear in table rows
    await expect(previewTable.locator('td:has-text("name")')).toBeVisible();
    await expect(previewTable.locator('td:has-text("email")')).toBeVisible();

    // "Convert & Download JSON Schema" button is enabled and visible
    const downloadButton = page.locator('button:has-text("Convert & Download JSON Schema")');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();
  });

  test("Test 3: Embed Route Isolation", async ({ page }) => {
    // Check /embed/json-to-ndjson
    const resNdjson = await page.goto("/embed/json-to-ndjson");
    expect(resNdjson?.status()).toBe(200);
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=This page could not be found")).not.toBeVisible();

    // Verify website Navbar and Footer are hidden in embed iframe mode
    const mainNavNdjson = page.locator('header:has-text("Tools")');
    await expect(mainNavNdjson).not.toBeVisible();
    const mainFooterNdjson = page.locator('footer:has-text("Converters")');
    await expect(mainFooterNdjson).not.toBeVisible();

    // Verify attribution links back to convertsheet.com
    const attributionNdjson = page.locator('footer a:has-text("ConvertSheet")');
    await expect(attributionNdjson).toBeVisible();
    await expect(attributionNdjson).toHaveAttribute(
      "href",
      "https://convertsheet.com/convert/json-to-ndjson"
    );

    // Check /embed/json-to-schema
    const resSchema = await page.goto("/embed/json-to-schema");
    expect(resSchema?.status()).toBe(200);
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=This page could not be found")).not.toBeVisible();

    // Verify website Navbar and Footer are hidden in embed iframe mode
    const mainNavSchema = page.locator('header:has-text("Tools")');
    await expect(mainNavSchema).not.toBeVisible();
    const mainFooterSchema = page.locator('footer:has-text("Converters")');
    await expect(mainFooterSchema).not.toBeVisible();

    // Verify attribution links back to convertsheet.com
    const attributionSchema = page.locator('footer a:has-text("ConvertSheet")');
    await expect(attributionSchema).toBeVisible();
    await expect(attributionSchema).toHaveAttribute(
      "href",
      "https://convertsheet.com/convert/json-to-schema"
    );
  });
});
