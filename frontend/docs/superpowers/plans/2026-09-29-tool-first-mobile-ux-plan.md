# Tool-First Mobile UX Priority Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ConvertSheet tools, converters, and the homepage into an immediate, tool-first mobile layout where the active editor/dropzone is directly visible in the first fold without scrolling, maximizing horizontal (X-axis) canvas with 10–12px micro-typography and 14px mobile headings, floating bordered mode switchers, and minimal padding.

**Architecture:**
- **Zero Mobile Hero Bloat:** On mobile viewports (`< 640px`), hide decorative breadcrumbs, repetitive trust badges, embed triggers, and multi-line descriptive text paragraphs. Shrink page headings (`H1`) to a sleek 14px single-line header (`text-sm font-bold tracking-tight text-center my-1`).
- **Edge-to-Edge Horizontal Canvas:** Expand X-axis space by shrinking outer container padding from `px-4` to `px-2 sm:px-6 lg:px-8 xl:px-10`.
- **Floating Bordered Mode Selectors:** Replace the heavy boxed gray tab bar with independent, floating bordered pills (`Single File`, `Batch ZIP Mode`) with active/inactive states and borders.
- **Compact Format Flow:** Reduce `FormatSelector` padding and badge text size so the source-to-target transformation fits on a single mobile row without wrapping.
- **Mobile Split Editor Mode Switcher:** Introduce a segmented toggle `[ 📝 Paste / Editor | 📁 Upload File ]` on mobile screens (`< 1024px`) in `SplitJsonInput`, `SplitCsvInput`, `SplitTableInput`, and `SplitXmlInput` to prevent 800px vertical stacking while preserving the spacious dual-pane layout on desktop.

**Architecture Diagram:**

```mermaid
graph TD
    subgraph "Mobile Viewport (< 640px)"
        A[Compact 14px H1: 'Fast, Private Structured Data Converter'] --> B[Floating Bordered Pills: Single File | Batch ZIP]
        B --> C[Compact Format Flow: JSON -> Excel]
        C --> D[Mobile Segmented Switcher: Paste / Editor vs Upload File]
        D --> E[Active Interactive Canvas Visible in 1st Fold]
    end
    subgraph "Desktop Viewport (>= 1024px)"
        F[Spacious Hero + Breadcrumbs + Trust Badges] --> G[Floating Bordered Pills]
        G --> H[Full Format Flow & Options]
        H --> I[Dual-Pane Side-by-Side Editor & Dropzone]
    end
```

**Tech Stack:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, Vitest, Testing Library.

---

### Task 1: Mobile Hero Diet & Edge-to-Edge Page Containers

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/convert/[slug]/page.tsx`
- Modify: `src/app/tools/[slug]/page.tsx`
- Test: `src/app/convert/[slug]/__tests__/page.test.tsx`
- Test: `src/app/__tests__/page.test.tsx`

- [ ] **Step 1: Write the failing tests for mobile responsive classes**

In `src/app/convert/[slug]/__tests__/page.test.tsx`, add assertions that verify the hero container has mobile padding `px-2 sm:px-6` and the heading has mobile `text-sm` class.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/app/convert/[slug]/__tests__/page.test.tsx`
Expected: FAIL if existing expectations assert older container padding or heading size.

- [ ] **Step 3: Update `page.tsx`, `convert/[slug]/page.tsx`, and `tools/[slug]/page.tsx`**

1. In `src/app/page.tsx`:
   - Change container padding to `px-2 sm:px-6 lg:px-8 xl:px-10 pt-1 sm:pt-4`.
   - Wrap trust badge in `hidden sm:flex`.
   - Update H1: `text-sm sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 my-1`.
   - Wrap subtitle paragraph in `hidden sm:block`.
2. In `src/app/convert/[slug]/page.tsx`:
   - Change container padding to `max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 xl:px-10 pt-1 sm:pt-4 pb-12 sm:pb-16 space-y-4 sm:space-y-8`.
   - Wrap breadcrumbs & privacy badge & embed trigger in `hidden sm:flex items-center justify-center gap-2`.
   - Update H1: `text-sm sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 my-1`.
   - Wrap subtitle paragraph in `hidden sm:block`.
3. In `src/app/tools/[slug]/page.tsx`:
   - Change container padding to `max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 xl:px-10 pt-1 sm:pt-4 pb-12 sm:pb-16 space-y-4 sm:space-y-7`.
   - Wrap breadcrumb `<nav aria-label="Breadcrumb">` in `hidden sm:block`.
   - Wrap trust badge & embed trigger in `hidden sm:flex`.
   - Update H1: `text-sm sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 my-1`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/app/convert/[slug]/__tests__/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/convert/[slug]/page.tsx src/app/tools/[slug]/page.tsx src/app/convert/[slug]/__tests__/page.test.tsx
git commit -m "style(layout): implement tool-first mobile layout with edge-to-edge padding and compact hero"
```

---

### Task 2: Floating Bordered Mode Selector Pills & Minimal Card Padding

**Files:**
- Modify: `src/components/converter/ConverterCard.tsx`
- Test: `src/components/converter/__tests__/ConverterCard.test.tsx`

- [ ] **Step 1: Write the failing tests for floating bordered pills**

In `src/components/converter/__tests__/ConverterCard.test.tsx`, assert that the mode buttons render as floating buttons with borders and that the card container uses minimal mobile padding `p-2.5 sm:p-6 lg:p-8`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/converter/__tests__/ConverterCard.test.tsx`
Expected: FAIL or verify existing tests pass.

- [ ] **Step 3: Update `ConverterCard.tsx`**

1. Change card outer container:
   ```tsx
   className={cn(
     "w-full rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/40 dark:shadow-none p-2.5 sm:p-6 lg:p-8 space-y-3 sm:space-y-6 transition-all",
     className
   )}
   ```
2. Replace boxed tab bar with floating bordered pills:
   ```tsx
   <div className="flex items-center justify-between pb-1 sm:pb-2">
     <div className="flex items-center gap-2">
       <button
         type="button"
         onClick={() => setMode("single")}
         className={cn(
           "px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full border transition-all cursor-pointer",
           mode === "single"
             ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
             : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
         )}
       >
         Single File
       </button>
       <button
         type="button"
         onClick={() => setMode("batch")}
         className={cn(
           "inline-flex items-center gap-1.5 px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full border transition-all cursor-pointer",
           mode === "batch"
             ? "bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500 shadow-xs"
             : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
         )}
       >
         <Archive className="w-3.5 h-3.5" />
         <span>Batch ZIP Mode</span>
         <span
           className={cn(
             "text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold",
             mode === "batch"
               ? "bg-emerald-700/80 text-white"
               : "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
           )}
         >
           Multi-File
         </span>
       </button>
     </div>
   </div>
   ```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/converter/__tests__/ConverterCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/converter/ConverterCard.tsx src/components/converter/__tests__/ConverterCard.test.tsx
git commit -m "style(converter): convert mode tabs into floating bordered buttons with minimal card padding"
```

---

### Task 3: Streamlined Single-Row Format Flow

**Files:**
- Modify: `src/components/converter/FormatSelector.tsx`
- Test: `src/components/converter/__tests__/FormatSelector.test.tsx`

- [ ] **Step 1: Write the failing tests for compact FormatSelector styling**

In `src/components/converter/__tests__/FormatSelector.test.tsx`, verify format badges and options trigger render with compact mobile styling.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/converter/__tests__/FormatSelector.test.tsx`
Expected: FAIL or verify existing assertions.

- [ ] **Step 3: Update `FormatSelector.tsx`**

1. Change outer container padding to `p-2 sm:p-4 rounded-xl`.
2. Update format badges to `px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium`.
3. Update Conversion Options trigger to `text-[11px] sm:text-xs font-medium px-2 py-1 rounded-lg`.
4. Ensure text does not wrap on 320px–360px viewports.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/converter/__tests__/FormatSelector.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/converter/FormatSelector.tsx src/components/converter/__tests__/FormatSelector.test.tsx
git commit -m "style(converter): streamline FormatSelector padding and micro-typography for mobile"
```

---

### Task 4: High-Density Split Inputs with Mobile Mode Switcher & 10–12px Micro-Typography

**Files:**
- Modify: `src/components/converter/SplitJsonInput.tsx`
- Modify: `src/components/converter/SplitCsvInput.tsx`
- Modify: `src/components/converter/SplitTableInput.tsx`
- Modify: `src/components/converter/SplitXmlInput.tsx`
- Test: `src/components/converter/__tests__/SplitJsonInput.test.tsx`
- Test: `src/components/converter/__tests__/SplitCsvInput.test.tsx`
- Test: `src/components/converter/__tests__/SplitTableInput.test.tsx`
- Test: `src/components/converter/__tests__/SplitXmlInput.test.tsx`

- [ ] **Step 1: Write unit tests for mobile mode switcher in SplitJsonInput and SplitCsvInput**

In `SplitJsonInput.test.tsx`, add a test for switching between "Paste & Editor" and "Upload File" tabs on mobile.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/converter/__tests__/SplitJsonInput.test.tsx`
Expected: FAIL (tab buttons not found).

- [ ] **Step 3: Implement Mobile Segmented Switcher & Micro-Typography**

1. In `SplitJsonInput.tsx`:
   - Add state: `const [mobileTab, setMobileTab] = useState<"paste" | "upload">("paste");`
   - Render segmented toggle on mobile (`flex lg:hidden items-center justify-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 mb-2 border border-zinc-200/80 dark:border-zinc-700/80`).
   - Left panel: `p-2.5 sm:p-5`, hide on mobile when `mobileTab === "upload"` (`mobileTab === "upload" && "hidden lg:flex"`).
   - Right panel: hide on mobile when `mobileTab === "paste"` (`mobileTab === "paste" && "hidden lg:flex"`).
   - Micro-typography for action toolbar: `text-[10px] sm:text-xs`, `px-1.5 py-0.5`.
   - Textarea: `font-mono text-xs sm:text-sm h-48 sm:h-64 lg:h-80`.
2. Apply the exact same enhancements to:
   - `src/components/converter/SplitCsvInput.tsx`
   - `src/components/converter/SplitTableInput.tsx`
   - `src/components/converter/SplitXmlInput.tsx`

- [ ] **Step 4: Run all split input tests to verify they pass**

Run: `npm test src/components/converter/__tests__/SplitJsonInput.test.tsx src/components/converter/__tests__/SplitCsvInput.test.tsx src/components/converter/__tests__/SplitTableInput.test.tsx src/components/converter/__tests__/SplitXmlInput.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/converter/SplitJsonInput.tsx src/components/converter/SplitCsvInput.tsx src/components/converter/SplitTableInput.tsx src/components/converter/SplitXmlInput.tsx src/components/converter/__tests__/
git commit -m "feat(converter): add mobile segmented tabs and 10-12px micro-typography to split inputs"
```

---

### Task 5: Full Test Suite, Production Build & Mobile Verification

**Files:**
- Full codebase verification

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All test suites pass (76+ suites, 695+ tests).

- [ ] **Step 2: Run production Next.js build**

Run: `npm run build`
Expected: Successful compilation of all static and programmatic routes with zero errors.

- [ ] **Step 3: Verification check**

Verify git diff is clean and ready.
