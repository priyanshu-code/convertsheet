import { describe, it, expect } from "vitest";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getAllBlogPostSlugs,
  getBlogPostsByCluster,
  getPillarPost,
  getBranchPosts,
} from "../blog-registry";

describe("Blog Registry & Content Layer", () => {
  it("getAllBlogPosts returns an array with at least 1 post", () => {
    const posts = getAllBlogPosts();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });

  it("verifies each post adheres to required schema attributes", () => {
    const posts = getAllBlogPosts();
    for (const post of posts) {
      expect(post.slug).toBeDefined();
      expect(typeof post.slug).toBe("string");
      expect(post.slug.length).toBeGreaterThan(0);

      expect(post.title).toBeDefined();
      expect(typeof post.title).toBe("string");

      expect(post.description).toBeDefined();
      expect(typeof post.description).toBe("string");

      // publishedAt must match YYYY-MM-DD
      expect(post.publishedAt).toBeDefined();
      expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      expect(post.readTimeMinutes).toBeDefined();
      expect(typeof post.readTimeMinutes).toBe("number");
      expect(post.readTimeMinutes).toBeGreaterThan(0);

      expect(post.author).toBeDefined();
      expect(post.author.name).toBeDefined();
      expect(typeof post.author.name).toBe("string");

      expect(post.attachedToolSlug).toBeDefined();
      expect(typeof post.attachedToolSlug).toBe("string");

      expect(post.content).toBeDefined();
      expect(typeof post.content).toBe("string");
      expect(post.content.length).toBeGreaterThan(100);

      expect(post.tableOfContents).toBeDefined();
      expect(Array.isArray(post.tableOfContents)).toBe(true);
      expect(post.tableOfContents.length).toBeGreaterThanOrEqual(2);

      for (const tocItem of post.tableOfContents) {
        expect(tocItem.id).toBeDefined();
        expect(tocItem.title).toBeDefined();
      }
    }
  });

  it("retrieves the privacy-first JSON-to-Excel pillar post by slug", () => {
    const post = getBlogPostBySlug("convert-json-to-excel-privately");
    expect(post).toBeDefined();
    expect(post?.slug).toBe("convert-json-to-excel-privately");
    expect(post?.title).toBe("How to Convert 50,000+ Rows of Nested JSON to Excel Without Leaking Data");
    expect(post?.category).toBe("Data & Spreadsheets");
    expect(post?.readTimeMinutes).toBe(5);
    expect(post?.publishedAt).toBe("2026-09-17");
    expect(post?.author.name).toBe("Priyanshu Rawat");
    expect(post?.author.role).toBe("Founder & Lead Software Engineer");
    expect(post?.author.linkedInUrl).toContain("linkedin.com");
    expect(post?.author.githubUrl).toContain("github.com");
    expect(post?.author.twitterUrl).toContain("x.com");
    expect(post?.attachedToolSlug).toBe("json-to-excel");
    expect(post?.attachedToolTitle).toBe("JSON to Excel Converter (In-Browser WASM)");
    expect(post?.tableOfContents.length).toBeGreaterThanOrEqual(5);

    // Content should feature key keywords and sections
    expect(post?.content).toContain("WebAssembly");
    expect(post?.content).toContain("50,000");
  });

  it("returns undefined for unknown slug", () => {
    const post = getBlogPostBySlug("non-existent-blog-slug");
    expect(post).toBeUndefined();
  });

  it("getAllBlogPostSlugs returns array of slugs including convert-json-to-excel-privately", () => {
    const slugs = getAllBlogPostSlugs();
    expect(Array.isArray(slugs)).toBe(true);
    expect(slugs).toContain("convert-json-to-excel-privately");
  });

  it("retrieves the 3 new technical and financial authority guides", () => {
    const caGuide = getBlogPostBySlug("canadian-mortgage-stress-test-guide-2026");
    expect(caGuide).toBeDefined();
    expect(caGuide?.attachedToolSlug).toBe("mortgage-calculator");
    expect(caGuide?.content).toContain("OSFI");

    const parquetGuide = getBlogPostBySlug("convert-large-parquet-files-to-excel-in-browser");
    expect(parquetGuide).toBeDefined();
    expect(parquetGuide?.attachedToolSlug).toBe("parquet-to-excel");
    expect(parquetGuide?.content).toContain("DuckDB WASM");

    const ir35Guide = getBlogPostBySlug("uk-contractor-inside-vs-outside-ir35-calculator-guide");
    expect(ir35Guide).toBeDefined();
    expect(ir35Guide?.attachedToolSlug).toBe("income-tax-calculator");
    expect(ir35Guide?.content).toContain("IR35");
  });

  it("verifies pillar and branches topic cluster architecture integrity", () => {
    // Cluster: indian-home-loans
    const homeLoanPosts = getBlogPostsByCluster("indian-home-loans");
    expect(homeLoanPosts.length).toBe(8);

    const pillar = getPillarPost("indian-home-loans");
    expect(pillar).toBeDefined();
    expect(pillar?.slug).toBe("rbi-repo-rate-hike-25-bps-home-loan-emi-impact");
    expect(pillar?.role).toBe("pillar");

    const branches = getBranchPosts(pillar!.slug);
    expect(branches.length).toBe(7);
    const branchSlugs = branches.map((b: { slug: string }) => b.slug);
    expect(branchSlugs).toContain("how-to-reduce-home-loan-car-loan-after-repo-rate-hike");
    expect(branchSlugs).toContain("the-home-loan-tenure-trap-explained");
    expect(branchSlugs).toContain("the-1-extra-emi-per-year-rule-home-loan-savings");
    expect(branchSlugs).toContain("rbi-rate-hike-fixed-deposits-vs-equity-strategy");
    expect(branchSlugs).toContain("rbi-bank-rate-penal-interest-crr-slr-liquidity-guide");
    expect(branchSlugs).toContain("rbi-monetary-policy-october-2026-common-man-guide");
    expect(branchSlugs).toContain("rbi-cva-and-sa-ccr-counterparty-risk-explained");

    // Cluster: in-browser-data-processing
    const dataPosts = getBlogPostsByCluster("in-browser-data-processing");
    expect(dataPosts.length).toBe(3);
    const dataPillar = getPillarPost("in-browser-data-processing");
    expect(dataPillar?.slug).toBe("convert-json-to-excel-privately");
  });
});
