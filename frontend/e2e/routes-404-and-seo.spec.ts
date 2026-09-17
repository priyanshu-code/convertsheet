import { test, expect } from "@playwright/test";
import { CONVERTER_REGISTRY } from "../src/lib/registry";
import { TOOL_REGISTRY } from "../src/lib/tool-registry";
import { BLOG_POSTS } from "../src/lib/blog-registry";

test.describe("Critical Route Availability & 404 Guard", () => {
  test("Home page loads with 200, valid title, and SEO schema", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle(/ConvertSheet/i);

    // Ensure no 404 page is rendered
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=This page could not be found")).not.toBeVisible();

    // Check JSON-LD structured data
    const jsonLd = await page.$eval('script[type="application/ld+json"]', (el) =>
      JSON.parse(el.textContent || "{}")
    );
    expect(jsonLd["@type"]).toBe("WebSite");
  });

  test("All Converter pages (/convert/[slug]) return 200 and have h1 and canonical", async ({ page }) => {
    const converterSlugs = Object.keys(CONVERTER_REGISTRY);

    // Test a sample of critical converters (including csv-to-jsonl)
    const testSlugs = ["csv-to-jsonl", "json-to-excel", "parquet-to-excel", "csv-to-parquet"];
    for (const slug of testSlugs) {
      const res = await page.goto(`/convert/${slug}`);
      expect(res?.status()).toBe(200);

      // Verify no 404
      await expect(page.locator("text=This page could not be found")).not.toBeVisible();
      await expect(page.locator("h1")).toBeVisible();

      // Check canonical link
      const canonical = await page.$eval('link[rel="canonical"]', (el) =>
        el.getAttribute("href")
      );
      expect(canonical).toBe(`https://convertsheet.com/convert/${slug}`);
    }
  });

  test("All Tool pages (/tools/[slug]) return 200 without 404 errors", async ({ page }) => {
    const testSlugs = ["mortgage-calculator", "sip-calculator", "base64-encoder-decoder", "json-formatter-validator"];
    for (const slug of testSlugs) {
      const res = await page.goto(`/tools/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("text=This page could not be found")).not.toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("All Embed routes (/embed/[slug]) return 200 and NEVER 404 for converters and tools", async ({ page }) => {
    // Slugs that previously caused 404 or must always work
    const embedSlugs = [
      "csv-to-jsonl",
      "json-to-excel",
      "mortgage-calculator",
      "sip-calculator",
    ];

    for (const slug of embedSlugs) {
      const res = await page.goto(`/embed/${slug}`);
      expect(res?.status()).toBe(200);

      // Crucial: Must never show 404
      await expect(page.locator("text=404")).not.toBeVisible();
      await expect(page.locator("text=This page could not be found")).not.toBeVisible();

      // Powered by ConvertSheet footer link must exist
      const poweredByLink = page.locator('footer a:has-text("ConvertSheet")');
      await expect(poweredByLink).toBeVisible();
    }
  });
});
