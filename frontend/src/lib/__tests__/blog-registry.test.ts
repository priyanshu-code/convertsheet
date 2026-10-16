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
    expect(homeLoanPosts.length).toBe(17);

    const pillar = getPillarPost("indian-home-loans");
    expect(pillar).toBeDefined();
    expect(pillar?.slug).toBe("rbi-repo-rate-hike-25-bps-home-loan-emi-impact");
    expect(pillar?.role).toBe("pillar");

    const branches = getBranchPosts(pillar!.slug);
    expect(branches.length).toBe(16);
    const branchSlugs = branches.map((b: { slug: string }) => b.slug);
    expect(branchSlugs).toContain("how-to-reduce-home-loan-car-loan-after-repo-rate-hike");
    expect(branchSlugs).toContain("pnb-bob-indian-bank-sbi-rate-hikes-after-repo-revision");
    expect(branchSlugs).toContain("public-vs-private-bank-home-loan-rates-2026");
    expect(branchSlugs).toContain("mclr-vs-eblr-old-home-loan-conversion-guide");
    expect(branchSlugs).toContain("car-loans-after-repo-rate-hike-festive-season-guide");
    expect(branchSlugs).toContain("how-rbi-repo-rate-affects-fixed-deposit-rates");
    expect(branchSlugs).toContain("how-rbi-repo-rate-affects-loan-interest-rates");
    expect(branchSlugs).toContain("the-home-loan-tenure-trap-explained");
    expect(branchSlugs).toContain("the-1-extra-emi-per-year-rule-home-loan-savings");
    expect(branchSlugs).toContain("rbi-rate-hike-fixed-deposits-vs-equity-strategy");
    expect(branchSlugs).toContain("rbi-bank-rate-penal-interest-crr-slr-liquidity-guide");
    expect(branchSlugs).toContain("rbi-monetary-policy-october-2026-common-man-guide");
    expect(branchSlugs).toContain("rbi-cva-and-sa-ccr-counterparty-risk-explained");
    expect(branchSlugs).toContain("sbi-maxgain-vs-prepayment-home-loan-overdraft-guide");
    expect(branchSlugs).toContain("mospi-cpi-inflation-surge-festive-home-loan-concessions-2026");
    expect(branchSlugs).toContain("rbi-99-percent-daily-crr-liquidity-drain-october-16-2026");

    // Verify detailed schema and content for the Oct 16 CRR mandate guide
    const crrArticle = getBlogPostBySlug("rbi-99-percent-daily-crr-liquidity-drain-october-16-2026");
    expect(crrArticle).toBeDefined();
    expect(crrArticle?.attachedToolSlug).toBe("emi-calculator");
    expect(crrArticle?.content).toContain("RBI/2026-27/290");
    expect(crrArticle?.content).toContain("₹1.8 Lakh Crore");
    expect(crrArticle?.tableOfContents).toHaveLength(5);
    expect(crrArticle?.faqs).toHaveLength(4);

    // Verify detailed schema and content for the MoSPI inflation surge & festive concessions guide
    const mospiArticle = getBlogPostBySlug("mospi-cpi-inflation-surge-festive-home-loan-concessions-2026");
    expect(mospiArticle).toBeDefined();
    expect(mospiArticle?.attachedToolSlug).toBe("home-loan-balance-transfer-calculator");
    expect(mospiArticle?.attachedToolTitle).toBe("Home Loan Balance Transfer Savings Calculator");
    expect(mospiArticle?.content).toContain("5.54%");
    expect(mospiArticle?.content).toContain("7.74%");
    expect(mospiArticle?.content).toContain("RBI/2026-27/290");
    expect(mospiArticle?.tableOfContents).toHaveLength(6);
    expect(mospiArticle?.faqs).toHaveLength(4);

    // Verify detailed schema and content for the new SBI MaxGain guide
    const maxGainArticle = getBlogPostBySlug("sbi-maxgain-vs-prepayment-home-loan-overdraft-guide");
    expect(maxGainArticle).toBeDefined();
    expect(maxGainArticle?.attachedToolSlug).toBe("home-loan-overdraft-calculator");
    expect(maxGainArticle?.attachedToolTitle).toBe("Home Loan Overdraft (SBI MaxGain) vs Prepayment Calculator");
    expect(maxGainArticle?.content).toContain("SBI MaxGain");
    expect(maxGainArticle?.content).toContain("40 BPS Spread Premium");
    expect(maxGainArticle?.content).toContain("Break-Even");
    expect(maxGainArticle?.tableOfContents).toHaveLength(8);
    expect(maxGainArticle?.faqs).toHaveLength(6);

    // Verify detailed schema and content for the two new deep guides
    const fdArticle = getBlogPostBySlug("how-rbi-repo-rate-affects-fixed-deposit-rates");
    expect(fdArticle).toBeDefined();
    expect(fdArticle?.attachedToolSlug).toBe("high-yield-savings-cd-calculator");
    expect(fdArticle?.content).toContain("Credit-to-Deposit");
    expect(fdArticle?.content).toContain("Liability Lag");
    expect(fdArticle?.tableOfContents.length).toBeGreaterThanOrEqual(5);

    const loanArticle = getBlogPostBySlug("how-rbi-repo-rate-affects-loan-interest-rates");
    expect(loanArticle).toBeDefined();
    expect(loanArticle?.attachedToolSlug).toBe("interest-rate-hike-calculator");
    expect(loanArticle?.content).toContain("Rockets and Feathers");
    expect(loanArticle?.content).toContain("Credit Risk Premium");
    expect(loanArticle?.tableOfContents.length).toBeGreaterThanOrEqual(5);

    // Cluster: in-browser-data-processing
    const dataPosts = getBlogPostsByCluster("in-browser-data-processing");
    expect(dataPosts.length).toBe(3);
    const dataPillar = getPillarPost("in-browser-data-processing");
    expect(dataPillar?.slug).toBe("convert-json-to-excel-privately");

    // Cluster: contractor-tax-finance
    const contractorPosts = getBlogPostsByCluster("contractor-tax-finance");
    expect(contractorPosts.length).toBe(4);
    const contractorPillar = getPillarPost("contractor-tax-finance");
    expect(contractorPillar?.slug).toBe("1099-vs-w2-true-hourly-rate-calculation");
    const contractorBranches = getBranchPosts("1099-vs-w2-true-hourly-rate-calculation");
    expect(contractorBranches.length).toBe(3);
    const contractorBranchSlugs = contractorBranches.map((b: { slug: string }) => b.slug);
    expect(contractorBranchSlugs).toContain("h1b-visa-closed-rumors-vs-perm-pause-explained");
    expect(contractorBranchSlugs).toContain("uk-contractor-inside-vs-outside-ir35-calculator-guide");
    expect(contractorBranchSlugs).toContain("federal-reserve-g19-credit-card-debt-avalanche-math-2026");

    // Verify schema and content for the Fed G.19 credit card debt guide
    const fedDebtArticle = getBlogPostBySlug("federal-reserve-g19-credit-card-debt-avalanche-math-2026");
    expect(fedDebtArticle).toBeDefined();
    expect(fedDebtArticle?.attachedToolSlug).toBe("debt-payoff-calculator");
    expect(fedDebtArticle?.content).toContain("22.15%");
    expect(fedDebtArticle?.content).toContain("Statistical Release G.19");
    expect(fedDebtArticle?.tableOfContents).toHaveLength(5);
    expect(fedDebtArticle?.faqs).toHaveLength(4);
  });

  it("retrieves the H-1B rumors vs PERM pause factual guide", () => {
    const post = getBlogPostBySlug("h1b-visa-closed-rumors-vs-perm-pause-explained");
    expect(post).toBeDefined();
    expect(post?.slug).toBe("h1b-visa-closed-rumors-vs-perm-pause-explained");
    expect(post?.title).toContain("Did the US Just 'Close' H-1B Visas?");
    expect(post?.category).toBe("Immigration & Career Finance");
    expect(post?.attachedToolSlug).toBe("salary-calculator");
    expect(post?.attachedToolTitle).toBe("US Salary & Take-Home Paycheck Calculator");
    expect(post?.clusterId).toBe("contractor-tax-finance");
    expect(post?.role).toBe("branch");
    expect(post?.pillarSlug).toBe("1099-vs-w2-true-hourly-rate-calculation");
    expect(post?.tableOfContents).toHaveLength(7);
    expect(post?.faqs).toHaveLength(6);

    // Fact checking content assertions
    expect(post?.content).toContain("Department of Labor");
    expect(post?.content).toContain("20 CFR § 656.17(k)");
    expect(post?.content).toContain("Microsoft");
    expect(post?.content).toContain("Infosys");
    expect(post?.content).toContain("60-day grace period");
    expect(post?.content).toContain("salary-calculator");
  });
});
