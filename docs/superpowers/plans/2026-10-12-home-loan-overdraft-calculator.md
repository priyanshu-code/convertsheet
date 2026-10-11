# Home Loan Overdraft (SBI MaxGain) Engine & Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, highly-factual Home Loan Overdraft (SBI MaxGain) vs. Direct Prepayment Calculator and deep analytical blog article that capitalizes on ConvertSheet's Page 1 Google ranking surge.

**Architecture:**
- **Engine Layer:** Add `calculateHomeLoanOverdraft` and types in `src/lib/engines/financial-engine.ts`.
- **UI Component Layer:** Build `HomeLoanOverdraftCalculator.tsx` in `src/components/tools/` using `@/components/calculator` primitives.
- **Route Layer:** Create page `/tools/home-loan-overdraft-calculator` with AEO schema, answer summary, formula breakdown, and FAQs.
- **Registry Layer:** Register in `src/lib/tool-registry.ts` and `src/lib/topic-clusters.ts`.
- **Editorial Layer:** Add authoritative article `sbi-maxgain-vs-prepayment-home-loan-overdraft-guide` in `src/lib/blog-registry.ts` with bidirectional cross-links to our existing Page 1 ranking loan guides.

**Architecture Diagram:**

```mermaid
graph TD
    subgraph "Core Engines"
        A[financial-engine.ts: calculateHomeLoanOverdraft] --> B[HomeLoanOverdraftCalculator.tsx]
        A --> C[Unit Tests: financial-engine.test.ts]
    end

    subgraph "Routing & Registries"
        B --> D[/tools/home-loan-overdraft-calculator]
        E[tool-registry.ts] --> D
        F[blog-registry.ts: sbi-maxgain-vs-prepayment-home-loan-overdraft-guide] --> D
        G[topic-clusters.ts: indian-banking-loans] --> D
        G --> F
    end
```

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Lucide icons, Vitest.

---

### Task 1: Engine Implementation with TDD

**Files:**
- Test: `src/lib/engines/__tests__/financial-engine.test.ts`
- Modify: `src/lib/engines/financial-engine.ts`

- [ ] **Step 1: Write the failing tests for `calculateHomeLoanOverdraft`**
  - Verify baseline standard loan vs. overdraft loan with parked surplus.
  - Verify break-even balance formula $P \times \frac{r_{\text{od}} - r_{\text{std}}}{r_{\text{od}}}$.
  - Verify zero-surplus penalty (when parked balance is 0, overdraft loses due to 40 bps spread).
  - Verify tenure reduction and equivalent tax-free FD yield.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm test src/lib/engines/__tests__/financial-engine.test.ts`
  Expected: FAIL (function not found).

- [ ] **Step 3: Implement `calculateHomeLoanOverdraft` in `financial-engine.ts`**
  Add `HomeLoanOverdraftInput`, `HomeLoanOverdraftResult`, `HomeLoanOverdraftYearlyPoint`, and implementation.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm test src/lib/engines/__tests__/financial-engine.test.ts`
  Expected: PASS.

- [ ] **Step 5: Commit**
  Run: `git commit -am "feat(engine): add calculateHomeLoanOverdraft with break-even spread modeling"`

---

### Task 2: Build `HomeLoanOverdraftCalculator.tsx` Component

**Files:**
- Create: `src/components/tools/HomeLoanOverdraftCalculator.tsx`
- Test: `src/components/tools/__tests__/HomeLoanOverdraftCalculator.test.tsx`

- [ ] **Step 1: Write failing component test**
  Render component with inputs (Loan amount, Standard rate, OD spread, Tenure, Parked surplus) and check rendered outputs (Interest Saved, Months Saved, Break-Even Balance).

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm test src/components/tools/__tests__/HomeLoanOverdraftCalculator.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Implement `HomeLoanOverdraftCalculator.tsx`**
  Include:
  - Interactive sliders & currency inputs.
  - Quick loan presets (₹30L, ₹50L, ₹75L, ₹1Cr).
  - Preset bank spread chips (SBI MaxGain +0.40%, Bank of Baroda Home Loan Advantage +0.25%, PNB Max Saver +0.35%).
  - Visual comparison cards (Overdraft vs. Standard vs. Direct Prepayment).
  - Break-Even Alert banner explaining the surplus required to beat the spread.
  - Year-by-year amortization chart & table.
  - Excel and PDF export triggers.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm test src/components/tools/__tests__/HomeLoanOverdraftCalculator.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**
  Run: `git commit -am "feat(calculator): implement HomeLoanOverdraftCalculator component"`

---

### Task 3: Tool Page Route & Registries

**Files:**
- Create: `src/app/tools/home-loan-overdraft-calculator/page.tsx`
- Modify: `src/lib/tool-registry.ts`
- Modify: `src/lib/topic-clusters.ts`
- Test: `src/app/tools/__tests__/home-loan-overdraft-page.test.tsx`

- [ ] **Step 1: Write failing route and registry tests**
  Verify tool slug `home-loan-overdraft-calculator` exists in `tool-registry.ts` and renders page metadata.

- [ ] **Step 2: Run test to verify it fails**
  Expected: FAIL.

- [ ] **Step 3: Register in `tool-registry.ts`, `topic-clusters.ts`, and create page**
  Add full GEO/AEO metadata, mathematical formula explanation, and citable FAQs.

- [ ] **Step 4: Run test to verify it passes**
  Expected: PASS.

- [ ] **Step 5: Commit**
  Run: `git commit -am "feat(seo): register home-loan-overdraft-calculator route and SEO metadata"`

---

### Task 4: In-Depth Editorial Guide in `blog-registry.ts`

**Files:**
- Modify: `src/lib/blog-registry.ts`
- Test: `src/app/blog/[slug]/__tests__/page.test.tsx`

- [ ] **Step 1: Write failing blog registry test**
  Verify post slug `sbi-maxgain-vs-prepayment-home-loan-overdraft-guide` exists and links to `home-loan-overdraft-calculator`.

- [ ] **Step 2: Run test to verify it fails**
  Expected: FAIL.

- [ ] **Step 3: Add comprehensive article in `blog-registry.ts`**
  Covering:
  1. The Mechanics: How Home Loan Overdraft (OD) Accounts Function.
  2. The 40 bps Trap: Why Parking Zero Cash Costs ₹4 Lakh Extra.
  3. The Break-Even Balance Formula & Case Studies (₹50L & ₹1Cr loans).
  4. MaxGain vs. Direct Prepayment vs. Equity SIP (The Risk-Free Tax-Free Yield Matrix).
  5. Bank-by-Bank Comparison (SBI MaxGain vs. BoB Advantage vs. ICICI Money Saver).
  6. Actionable Playbook: How Salaried Borrowers Route Emergency Funds.
  7. FAQs with schema markup.

- [ ] **Step 4: Run test to verify it passes**
  Expected: PASS.

- [ ] **Step 5: Commit**
  Run: `git commit -am "feat(blog): add comprehensive SBI MaxGain vs Prepayment guide"`

---

### Task 5: End-to-End Verification & Production Build

- [ ] **Step 1: Run full Vitest suite**
  Run: `npm test`
- [ ] **Step 2: Run TypeScript typecheck**
  Run: `npm run typecheck`
- [ ] **Step 3: Run production Next.js build**
  Run: `npm run build`
- [ ] **Step 4: Final verification and report**
