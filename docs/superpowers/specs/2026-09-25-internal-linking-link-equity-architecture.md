# Design Spec: Internal Linking & Link Equity Architecture

**Date**: 2026-09-25  
**Author**: Senior Principal Engineer / Antigravity  
**Status**: Ready for Implementation Plan  

---

## 1. Executive Summary & Problem Statement

ConvertSheet currently has:
- 51 base tools (`/tools/[slug]`)
- 21 file converters (`/convert/[slug]`)
- 124 programmatic SEO presets (`/tools/[slug]/[preset]`)

### The "Leaky Pipe" Discovery:
While the top of the site hierarchy (`/` -> `/tools` -> `/tools/[slug]`) is well-connected, **parent tool pages currently do NOT link down to their programmatic presets**.
Consequently, our 124 programmatic preset pages are partially orphaned in HTML crawl paths, relying almost exclusively on the XML sitemap (`/sitemap.xml`) and lateral sibling links.

According to Google's ranking algorithms and PageRank distribution models:
1. Links embedded in the core HTML content of high-authority parent pages pass direct link equity (internal PageRank) and keyword-rich anchor text.
2. Pages located $\le 3$ clicks from the root index significantly outperform pages hidden at deeper crawl depths.

---

## 2. The 3-Pillar Solution Architecture

```
[ Homepage (/) ] 
       │ 
       ├─────────────────────────────────┬───────────────────────────────┐
       ▼                                 ▼                               ▼
[ Tools Hub (/tools) ]          [ Directory (/directory) ]       [ Site-wide Footer ]
       │                         (Full Semantic Index)            (Trending Links + /directory)
       ▼                                 │                               │
[ Parent Tool (/tools/[slug]) ]          │                               │
       │                                 │                               │
       ▼ (Pillar 1: Preset Grid)         │                               │
       └────────────────────────► ◄──────┴───────────────────────────────┘
                                 ▼
         [ Programmatic Presets (/tools/[slug]/[preset]) ]
```

### Pillar 1: Parent Tool Preset Grid (`src/app/tools/[slug]/page.tsx`)
- Inspect `getProgrammaticPresetsByTool(tool.slug)`.
- If presets exist for the current tool (e.g. Mortgage Calculator has 25+, Percentage Calculator has 5, Salary Calculator has 5):
  - Render a clean, responsive **"Popular {tool.name} Scenarios & Calculations"** section.
  - Position: Directly below the primary calculator card and before the How-To guide & FAQs.
  - Structure: Grid of card links containing the preset name, badge, and arrow link pointing to `/tools/${tool.slug}/${preset.presetSlug}`.
  - Accessibility: `<section aria-labelledby="presets-heading">` with `<h2 id="presets-heading">`.

### Pillar 2: Semantic HTML Directory (`src/app/directory/page.tsx`)
- Create a dedicated, highly organized HTML directory page at `/directory`.
- Architecture:
  - **Hero Section**: Overview, live category jump anchors (`#financial`, `#data-developer`, `#utility`, `#converters`), and instant client-side search filter.
  - **Categorized Sections**:
    - **Financial Calculators & Scenarios**: Lists all financial tools, with their nested programmatic presets cleanly grouped beneath them.
    - **Developer & Data Utilities**: Formatter, encoders, SQL Studio, CSV converters.
    - **Document & PDF Tools**: PDF compression, merge, split, watermark, page numbers, table extract.
    - **File Converters**: All 21 private client-side converters.
  - **SEO Metadata & Schema**:
    - Standard canonical URL: `https://www.convertsheet.com/directory`
    - Title: `"Complete Directory of Calculators, Converters & Tools | ConvertSheet"`
    - Meta Description: High-intent summary of all tools and pre-calculated scenarios.
    - Schema.org: `@type: "CollectionPage"` with `BreadcrumbList` and `ItemList`.
  - **Sitemap Integration**:
    - Add `/directory` to `src/app/sitemap.ts`.
    - Expected sitemap total length increases by 1 (from 214 to 215).

### Pillar 3: Footer Trending Links & Directory Bridge (`src/components/layout/Footer.tsx`)
- In `Footer.tsx`:
  - Add a **Trending Calculations** column/sub-section pointing to our fastest-growing GSC queries:
    - `15 vs 30 Year Mortgage` (`/tools/mortgage-calculator/15-year-vs-30-year`)
    - `What is 20% of 100?` (`/tools/percentage-calculator/what-is-20-percent-of-100`)
    - `$100k Salary After Tax` (`/tools/salary-calculator/us-take-home-100k`)
    - `20% Off Discount Calculator` (`/tools/percentage-calculator/20-percent-off-discount-calculator`)
    - `$300k Mortgage Payment` (`/tools/mortgage-calculator/300k-mortgage`)
    - `UK £100k Tax Trap` (`/tools/uk-salary-calculator/uk-100k-tax-trap`)
  - Add a prominent link to `"All Tools Directory (HTML Sitemap)"` (`/directory`) in the Footer navigation so it receives site-wide PageRank.

---

## 3. Engineering & Quality Standards
- **SOLID & KISS Principles**: Minimal dependencies, pure client-side interactivity where appropriate, zero runtime regressions.
- **100% Static Export (`output: "export"`)**: Every new page must build cleanly during SSG.
- **Accessibility & Auditing**:
  - Valid ARIA landmark structure with unique headings.
  - 0 axe errors in `npm run audit`.
- **Test Coverage**:
  - Unit tests for `/directory` page render, search filtering, and schema.
  - Unit tests for parent tool preset grid rendering in `src/app/tools/[slug]/__tests__/page.test.tsx`.
  - Update sitemap length assertion to 215 in `src/app/convert/[slug]/__tests__/page.test.tsx`.
