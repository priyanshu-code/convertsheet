import { test, expect } from "@playwright/test";
import initSqlJs, { Database } from "sql.js";

test.describe("SQLite to Excel Converter & Embed Flow", () => {
  test("Test 1: Page availability & SEO metadata", async ({ page }) => {
    const res = await page.goto("/convert/sqlite-to-excel");
    expect(res?.status()).toBe(200);

    // Confirm no 404 text
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=This page could not be found")).not.toBeVisible();

    // Check <h1> contains "Convert SQLite (.db, .sqlite) to Excel"
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Convert SQLite (.db, .sqlite) to Excel");

    // Check canonical URL is https://convertsheet.com/convert/sqlite-to-excel
    const canonical = await page.$eval('link[rel="canonical"]', (el) =>
      el.getAttribute("href")
    );
    expect(canonical).toBe("https://convertsheet.com/convert/sqlite-to-excel");

    // Check FAQs accordion is present and expandable
    const faqSection = page.locator('[data-testid="faq-accordion"]');
    await expect(faqSection).toBeVisible();

    const firstFaqDetails = page.locator('[data-testid="faq-item-0"]');
    await expect(firstFaqDetails).toBeVisible();
    await expect(firstFaqDetails).not.toHaveAttribute("open", "");

    // Click summary to expand
    const firstFaqSummary = firstFaqDetails.locator("summary");
    await firstFaqSummary.click();
    await expect(firstFaqDetails).toHaveAttribute("open", "");
    await expect(
      firstFaqDetails.locator("text=100% locally in your browser")
    ).toBeVisible();

    // Check howTo 3 steps are rendered
    const howToSection = page.locator('[data-testid="how-to-guide"]');
    await expect(howToSection).toBeVisible();
    await expect(page.locator('[data-testid="how-to-step-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="how-to-step-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="how-to-step-3"]')).toBeVisible();
  });

  test("Test 2: File Upload & Multi-Table UX Flow", async ({ page }) => {
    // Generate a multi-table SQLite database buffer fixture using sql.js
    const SQL = await initSqlJs();
    const db: Database = new SQL.Database();

    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);");
    db.run(
      "INSERT INTO users VALUES (1, 'Alice', 'alice@example.com'), (2, 'Bob', 'bob@example.com');"
    );

    db.run("CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL);");
    db.run(
      "INSERT INTO orders VALUES (101, 1, 99.50), (102, 2, 149.00), (103, 2, 250.75);"
    );

    const binaryArray = db.export();
    db.close();

    await page.goto("/convert/sqlite-to-excel");

    // Upload sample SQLite database via file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "customers.sqlite",
      mimeType: "application/x-sqlite3",
      buffer: Buffer.from(binaryArray),
    });

    // Verify the loaded file details render (filename and size)
    await expect(page.locator("text=customers.sqlite")).toBeVisible();

    // Verify preview table renders with column headers and records for first table ("users")
    const previewTable = page.locator("table");
    await expect(previewTable).toBeVisible();
    await expect(page.locator('th:has-text("id")')).toBeVisible();
    await expect(page.locator('th:has-text("name")')).toBeVisible();
    await expect(page.locator('th:has-text("email")')).toBeVisible();
    await expect(page.locator('td:has-text("Alice")')).toBeVisible();
    await expect(page.locator('td:has-text("Bob")')).toBeVisible();

    // Verify table selector tabs are visible for multi-table database
    const tableTabs = page.locator('[role="tablist"][aria-label="Database tables"]');
    await expect(tableTabs).toBeVisible();

    const usersTab = tableTabs.locator('button[role="tab"]:has-text("users")');
    const ordersTab = tableTabs.locator('button[role="tab"]:has-text("orders")');
    await expect(usersTab).toBeVisible();
    await expect(ordersTab).toBeVisible();

    // Switch active table preview to "orders"
    await ordersTab.click();
    await expect(page.locator('th:has-text("user_id")')).toBeVisible();
    await expect(page.locator('th:has-text("amount")')).toBeVisible();
    await expect(page.locator('td:has-text("99.5")')).toBeVisible();

    // Verify "Convert & Download (.xlsx)" button becomes enabled
    const downloadButton = page.locator(
      'button:has-text("Convert & Download")'
    );
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();
  });

  test("Test 3: Embed Route Isolation", async ({ page }) => {
    const res = await page.goto("/embed/sqlite-to-excel");
    expect(res?.status()).toBe(200);

    // Confirm no 404 text
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=This page could not be found")).not.toBeVisible();

    // Confirm Navbar and Footer are hidden in iframe mode
    const mainNav = page.locator('header:has-text("Tools")');
    await expect(mainNav).not.toBeVisible();

    const mainFooter = page.locator('footer:has-text("Converters")');
    await expect(mainFooter).not.toBeVisible();

    // Confirm attribution bar "Powered by ConvertSheet" links to canonical URL
    const attributionLink = page.locator('footer a:has-text("ConvertSheet")');
    await expect(attributionLink).toBeVisible();
    await expect(attributionLink).toHaveAttribute(
      "href",
      "https://convertsheet.com/convert/sqlite-to-excel"
    );

    // Confirm DropZone is present and interactive in embed mode
    await expect(page.locator("text=Drop your SQLite file here")).toBeVisible();
  });
});
