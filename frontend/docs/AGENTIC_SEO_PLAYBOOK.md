# ConvertSheet Agentic SEO Playbook: 5 Core Growth Principles

This reference playbook captures the proven SEO methodologies implemented on ConvertSheet to sustain compounding organic search visibility, high click-through rates (CTR), and rapid Google indexation.

---

## 1. Internal Linking as a Dedicated Pass (Never Generate & Forget)
- **The Pitfall:** When new calculators, programmatic presets, or articles are published, they only link backward to existing parent hubs. The older, high-authority pages never link forward to the new pages, leaving them as crawl orphans that Google rarely indexes.
- **The ConvertSheet Standard:**
  - Every new programmatic preset (`/tools/[slug]/[preset]`) must be linked from sibling presets and parent calculators.
  - Every converter page (`/convert/[slug]`) must contextually link to matching developer/financial tools (e.g. SQLite -> SQL Studio) and relevant in-depth engineering guides.
  - Every high-authority calculator must cross-link to relevant blog guides and top calculation presets.
  - No page should ever exist without at least 3 incoming internal contextual links.

---

## 2. Paced Publishing & Crawl Budget Protection
- **The Pitfall:** Pushing thousands of programmatic pages overnight on a young domain overwhelms Googlebot's crawl budget and can trigger low-quality/thin content flags.
- **The ConvertSheet Standard:**
  - Sitemaps must prioritize key hubs and high-intent calculators with higher `<priority>` (1.0 for homepage, 0.9 for converters/calculators, 0.7 for presets).
  - High-value landing pages must have unique computations, custom matrices, schema, and direct answer blocks so they do not trigger duplicate content penalties.
  - Use Google Search Console URL inspection progressively on key hubs after major updates.

---

## 3. Real Author E-E-A-T & Verifiable Credentials
- **The Pitfall:** Faceless "Staff Writer" or "ConvertSheet Engineering" text lacks algorithmic trust in Google's Helpful Content System and financial/calculator ranking systems (YMYL).
- **The ConvertSheet Standard:**
  - **Founder & Lead Author:** Priyanshu Rawat (Founder & Software Engineer).
  - **Verified Public Profiles:**
    - LinkedIn: `https://www.linkedin.com/in/priyanshu-rawat-570b7a19b/`
    - X (Twitter): `https://x.com/priyanshuz_code`
    - GitHub: `https://github.com/priyanshu-code`
  - **Schema.org:** Every Article and Guide must define `author: { "@type": "Person", "name": "Priyanshu Rawat", "jobTitle": "...", "sameAs": [...] }`.
  - Every blog article must render an interactive `AuthorBioCard` with verified links.

---

## 4. Entity Definition via Plain-Language `/about` Page
- **The Pitfall:** Relying on trendy files like `llms.txt` while the core brand identity is vague or anonymous. LLMs and search engines define brand entities by crawling plain-language `/about` pages.
- **The ConvertSheet Standard:**
  - The `/about` page must clearly state:
    1. Who founded the product and why (Priyanshu Rawat solving cloud data privacy leaks).
    2. What exact product category ConvertSheet is (In-browser WebAssembly data conversion and private financial calculators).
    3. How the technology works (DuckDB-Wasm, SheetJS, Web Workers, client-side offline execution).
    4. Structured `Organization` JSON-LD schema with `founder` pointing to `Person`.

---

## 5. Refresh Priority for Positions 8–20 (Lowest-Hanging Fruit)
- **The Pitfall:** Spending all effort drafting new articles from scratch (which take months to rank) while neglecting pages sitting on Page 2 (Positions 8–20).
- **The ConvertSheet Standard:**
  - Always check Google Search Console for queries and pages ranking in positions 5–20.
  - Moving a page from position 14 to position 3–5 can yield a 10x–20x traffic increase within weeks.
  - When refreshing a Page-2 URL:
    - Sharpen the `<title>` and `<meta name="description">` to explicitly include year, brackets, and specific numbers.
    - Provide a direct answer block (`💡 Direct Answer: ...`) matching voice search / AI Overview patterns.
    - Add an interactive matrix or table (e.g. 20-Year Inflation Erosion Matrix, APY Benchmarks, Cheat Sheet).
    - Add targeted FAQs addressing exact search intent.
