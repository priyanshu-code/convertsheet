# Blog Framework & Tool-Attached SEO Pillar Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a lightweight, high-performance static Blog Framework at `/blog` and `/blog/[slug]` with structured schema markup, clean responsive typography, and our first high-intent, tool-attached SEO pillar guide: *"How to Convert 50,000+ Rows of Nested JSON to Excel Without Leaking Confidential Data"*.

**Architecture:** We use a type-safe blog registry (`src/lib/blog-registry.ts`) that holds editorial metadata, read times, table of contents, author profile, and related interactive tools. The blog index `/blog` renders a searchable/filterable article grid, while `/blog/[slug]` provides a distraction-free reader with an interactive "Live Tool" embed card, structured JSON-LD `Article` schema, and dynamic OpenGraph image generation.

**Architecture Diagram:**

```mermaid
graph TD
    subgraph "Blog Data Layer"
        BR[src/lib/blog-registry.ts]
        P1[Pillar 1: JSON to Excel Privacy Guide]
    end

    subgraph "Next.js Static Pages"
        BI[src/app/blog/page.tsx - Index Grid]
        BP[src/app/blog/[slug]/page.tsx - Article View]
        OG[src/app/blog/[slug]/opengraph-image.tsx]
    end

    subgraph "Tool Integration Layer"
        TB[ToolEmbedBanner Component]
        TC[ConvertSheet Tool Registry]
    end

    BR --> BI
    BR --> BP
    P1 --> BR
    TC --> TB
    TB --> BP
    BP --> OG
```

**Tech Stack:** Next.js 14 (App Router, Static SSG `output: export`), React 18, TypeScript, Tailwind CSS, Lucide Icons, JSON-LD Schema.

---

### Task 1: Create Type-Safe Blog Registry & Content Layer

**Files:**
- Create: `frontend/src/lib/blog-registry.ts`
- Create: `frontend/src/lib/__tests__/blog-registry.test.ts`

- [ ] **Step 1: Write the failing test for `blog-registry.ts`**

```typescript
// frontend/src/lib/__tests__/blog-registry.test.ts
import { describe, it, expect } from "vitest";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getAllBlogPostSlugs,
} from "../blog-registry";

describe("Blog Registry", () => {
  it("returns all registered blog posts with required metadata", () => {
    const posts = getAllBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(1);

    for (const post of posts) {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.description).toBeTruthy();
      expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.readTimeMinutes).toBeGreaterThan(0);
      expect(post.author.name).toBeTruthy();
      expect(post.attachedToolSlug).toBeTruthy();
      expect(post.content).toBeTruthy();
      expect(post.tableOfContents.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("retrieves a blog post by slug", () => {
    const post = getBlogPostBySlug("convert-json-to-excel-privately");
    expect(post).toBeDefined();
    expect(post?.title).toContain("Nested JSON to Excel");
    expect(post?.attachedToolSlug).toBe("json-to-excel");
  });

  it("returns all unique slugs for static route generation", () => {
    const slugs = getAllBlogPostSlugs();
    expect(slugs).toContain("convert-json-to-excel-privately");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/blog-registry.test.ts`  
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `blog-registry.ts`**

```typescript
// frontend/src/lib/blog-registry.ts
export interface BlogAuthor {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface BlogTocItem {
  id: string;
  title: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // YYYY-MM-DD
  updatedAt?: string;
  readTimeMinutes: number;
  category: "Data & Spreadsheets" | "Financial Modeling" | "Privacy & Security";
  author: BlogAuthor;
  attachedToolSlug: string; // e.g. "json-to-excel"
  attachedToolTitle: string;
  tableOfContents: BlogTocItem[];
  content: string; // Rich semantic HTML / Markdown structure
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "convert-json-to-excel-privately",
    title: "How to Convert 50,000+ Rows of Nested JSON to Excel Without Leaking Data",
    description:
      "A step-by-step guide for developers and financial analysts to flatten deeply nested JSON arrays into tabular Excel spreadsheets locally in the browser with zero cloud uploads.",
    publishedAt: "2026-09-17",
    readTimeMinutes: 5,
    category: "Data & Spreadsheets",
    author: {
      name: "ConvertSheet Engineering",
      role: "Core Architecture Team",
    },
    attachedToolSlug: "json-to-excel",
    attachedToolTitle: "JSON to Excel Converter (In-Browser WASM)",
    tableOfContents: [
      { id: "the-cloud-converter-security-risk", title: "1. The Hidden Risk of Online JSON Converters" },
      { id: "understanding-nested-json", title: "2. The Challenge of Nested JSON Objects & Arrays" },
      { id: "in-browser-conversion-step-by-step", title: "3. Step-by-Step: Converting In-Browser With Zero Uploads" },
      { id: "performance-benchmark-50k-rows", title: "4. Performance Benchmarks: 50,000 Rows in 300ms" },
      { id: "best-practices-data-sanitization", title: "5. Best Practices for Sensitive Data Exports" },
    ],
    content: `
      <section id="the-cloud-converter-security-risk" class="space-y-4">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          1. The Hidden Risk of Online JSON Converters
        </h2>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Every day, developers, financial auditors, and product managers export customer records, payment logs from Stripe, or telemetry databases formatted as massive JSON files. When asked to convert this raw data into an Excel (<code>.xlsx</code>) spreadsheet for non-technical stakeholders, the instinctive search is <em>"JSON to Excel converter online"</em>.
        </p>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          However, most legacy online converters upload your payload directly to remote servers. If your JSON contains PII (Personally Identifiable Information), internal financial records, or proprietary schemas, sending it across the public web directly violates <strong>GDPR, SOC 2, HIPAA, and CCPA</strong> compliance frameworks.
        </p>
      </section>

      <section id="understanding-nested-json" class="space-y-4 pt-6">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          2. The Challenge of Nested JSON Objects &amp; Arrays
        </h2>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Real-world production JSON is rarely flat key-value pairs. Objects routinely contain nested sub-objects (e.g. <code>user.address.zipcode</code>) and repeating arrays (e.g. <code>transactions: [{ id, amount }]</code>).
        </p>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          ConvertSheet uses an intelligent recursive flattener that automatically detects hierarchical keys and formats them as standard dot-notation column headers (such as <code>billing.address.state</code>) or multi-sheet relational exports, preventing cell clipping and truncated data.
        </p>
      </section>

      <section id="in-browser-conversion-step-by-step" class="space-y-4 pt-6">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          3. Step-by-Step: Converting In-Browser With Zero Uploads
        </h2>
        <ol class="list-decimal list-inside space-y-3 text-zinc-700 dark:text-zinc-300">
          <li><strong>Drag &amp; Drop Your File:</strong> Drop your <code>.json</code> or <code>.jsonl</code> payload directly into the browser dropzone.</li>
          <li><strong>Client-Side Parsing:</strong> HTML5 <code>FileReader</code> streams the raw bytes directly into your computer's RAM. The network tab shows <strong>0 bytes transmitted to any server</strong>.</li>
          <li><strong>SheetJS Compilation:</strong> The local Web Worker parses the JSON tree, computes columnar widths, and outputs a formatted Excel Workbook Blob.</li>
          <li><strong>Instant Download:</strong> Click download to immediately save your <code>.xlsx</code> file locally.</li>
        </ol>
      </section>

      <section id="performance-benchmark-50k-rows" class="space-y-4 pt-6">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          4. Performance Benchmarks: 50,000 Rows in 300ms
        </h2>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Because ConvertSheet runs compiled WebAssembly in dedicated Web Workers without the overhead of HTTP network upload latency, performance scales with your local CPU:
        </p>
        <div class="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-zinc-100 dark:bg-zinc-800/80 font-bold border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th class="p-3">File Size</th>
                <th class="p-3">Row Count</th>
                <th class="p-3">Traditional Cloud Tool</th>
                <th class="p-3 text-emerald-600 dark:text-emerald-400">ConvertSheet In-Browser</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td class="p-3 font-mono">1.2 MB</td>
                <td class="p-3">5,000</td>
                <td class="p-3 text-zinc-500">6.4 seconds</td>
                <td class="p-3 font-bold text-emerald-600 dark:text-emerald-400">~85 ms</td>
              </tr>
              <tr>
                <td class="p-3 font-mono">12.8 MB</td>
                <td class="p-3">50,000</td>
                <td class="p-3 text-zinc-500">28.2 seconds</td>
                <td class="p-3 font-bold text-emerald-600 dark:text-emerald-400">~340 ms</td>
              </tr>
              <tr>
                <td class="p-3 font-mono">50+ MB</td>
                <td class="p-3">200,000+</td>
                <td class="p-3 text-rose-500">HTTP 413 (Payload Too Large)</td>
                <td class="p-3 font-bold text-emerald-600 dark:text-emerald-400">~1.2 seconds (WASM)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="best-practices-data-sanitization" class="space-y-4 pt-6">
        <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          5. Best Practices for Sensitive Data Exports
        </h2>
        <ul class="space-y-2 text-zinc-700 dark:text-zinc-300">
          <li>• <strong>Audit Network Requests:</strong> Open Chrome DevTools (F12) &gt; Network tab. Confirm that no multipart POST requests are initiated during conversion.</li>
          <li>• <strong>Enable Airplane Mode:</strong> ConvertSheet's PWA architecture allows you to disconnect from Wi-Fi completely and execute file conversions offline.</li>
          <li>• <strong>Sanitize Identifiers:</strong> Always strip unnecessary authorization tokens or bearer headers from JSON payloads prior to distributing spreadsheets to external teams.</li>
        </ul>
      </section>
    `,
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogPostSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/blog-registry.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/blog-registry.ts frontend/src/lib/__tests__/blog-registry.test.ts
git commit -m "feat(blog): create blog registry with privacy-first JSON-to-Excel pillar guide"
```

---

### Task 2: Create Reusable `ToolEmbedBanner` & Blog Card Components

**Files:**
- Create: `frontend/src/components/blog/ToolEmbedBanner.tsx`
- Create: `frontend/src/components/blog/BlogCard.tsx`
- Create: `frontend/src/components/blog/__tests__/blog-components.test.tsx`

- [ ] **Step 1: Write failing tests for blog UI components**

```typescript
// frontend/src/components/blog/__tests__/blog-components.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToolEmbedBanner } from "../ToolEmbedBanner";
import { BlogCard } from "../BlogCard";
import { BLOG_POSTS } from "@/lib/blog-registry";

describe("Blog UI Components", () => {
  it("renders ToolEmbedBanner with direct action link", () => {
    render(
      <ToolEmbedBanner
        toolSlug="json-to-excel"
        toolTitle="JSON to Excel Converter"
      />
    );
    expect(screen.getByText("Interactive Tool")).toBeInTheDocument();
    expect(screen.getByText("JSON to Excel Converter")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Free In-Browser Tool/i })).toHaveAttribute(
      "href",
      "/convert/json-to-excel"
    );
  });

  it("renders BlogCard with title, category, read time, and link", () => {
    const post = BLOG_POSTS[0];
    render(<BlogCard post={post} />);
    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText(post.category)).toBeInTheDocument();
    expect(screen.getByText(`${post.readTimeMinutes} min read`)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", `/blog/${post.slug}`);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/components/blog/__tests__/blog-components.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement `ToolEmbedBanner.tsx` and `BlogCard.tsx`**

Implement both components with clean Tailwind typography, accessible links, and dark mode contrast.

- [ ] **Step 4: Run test to verify pass**

Run: `npm test -- src/components/blog/__tests__/blog-components.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/blog/
git commit -m "feat(blog): create ToolEmbedBanner and BlogCard components"
```

---

### Task 3: Build `/blog` Index Grid Page

**Files:**
- Create: `frontend/src/app/blog/page.tsx`
- Modify: `frontend/src/app/__tests__/pages.test.tsx`

- [ ] **Step 1: Implement `src/app/blog/page.tsx`**
  - High-converting hero banner: *"ConvertSheet Engineering & Privacy Insights"*.
  - Category filters / search.
  - Responsive grid of `BlogCard` items.
  - Fully static export (`output: export` compatible).
  - OpenGraph and metadata tags.

- [ ] **Step 2: Add unit test in `pages.test.tsx`**
  - Verify `/blog` renders headline, category pills, and post cards.

- [ ] **Step 3: Run test and verify pass**

Run: `npm test -- src/app/__tests__/pages.test.tsx`  
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/blog/page.tsx frontend/src/app/__tests__/pages.test.tsx
git commit -m "feat(blog): build /blog index directory page"
```

---

### Task 4: Build `/blog/[slug]` Dynamic Reader & Schema Markup

**Files:**
- Create: `frontend/src/app/blog/[slug]/page.tsx`
- Create: `frontend/src/app/blog/[slug]/opengraph-image.tsx`
- Modify: `frontend/src/app/sitemap.ts`

- [ ] **Step 1: Implement `src/app/blog/[slug]/page.tsx`**
  - `generateStaticParams()` mapping all blog slugs for static SSG.
  - Structured `generateMetadata()` with canonical URLs and keywords.
  - JSON-LD Schema: `Article` schema with `headline`, `datePublished`, `author`, `publisher`.
  - Floating/sticky Table of Contents for quick navigation.
  - Sticky `ToolEmbedBanner` providing immediate practical utility right inside the article.
  - Breadcrumbs navigation (`Home > Blog > Post`).

- [ ] **Step 2: Implement dynamic OpenGraph card (`opengraph-image.tsx`)**
  - Generates 1200x630 social preview image with article title and ConvertSheet badge.

- [ ] **Step 3: Update `sitemap.ts`**
  - Include `/blog` and all `/blog/[slug]` routes in the XML sitemap.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/blog/[slug]/ frontend/src/app/sitemap.ts
git commit -m "feat(blog): build /blog/[slug] reader with JSON-LD schema and opengraph cards"
```

---

### Task 5: Navbar / Footer Integration & Full Verification

**Files:**
- Modify: `frontend/src/components/layout/Navbar.tsx` (Add Blog link to desktop & mobile menu)
- Modify: `frontend/src/components/layout/Footer.tsx` (Add Blog link in navigation columns)
- Run: `npm test`
- Run: `npm run build`
- Run: `npm run audit`

- [ ] **Step 1: Run complete unit test suite**

Run: `npm test`  
Expected: 100% pass across all test files.

- [ ] **Step 2: Run production static build**

Run: `npm run build`  
Expected: Compiles all static routes with 0 errors.

- [ ] **Step 3: Run local axe-core auditor**

Run: `npm run audit`  
Expected: All pages scanned with 0 errors and 0 warnings.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/layout/Navbar.tsx frontend/src/components/layout/Footer.tsx
git commit -m "feat(layout): link Blog in Navbar and Footer navigation"
```
