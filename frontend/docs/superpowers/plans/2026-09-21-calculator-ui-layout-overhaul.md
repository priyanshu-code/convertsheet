# Calculator UI Layout & Anti-Truncation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul core calculator primitives (`CalcCard`, `CalcResult`) and tool layout containers to eliminate all number/text/title truncation and give all calculator pages a spacious, responsive presentation.

**Architecture:** 
1. Upgrade `CalcCard.tsx` to prevent title clipping.
2. Upgrade `CalcResult.tsx` with container-aware responsive columns (`columns?: 1 | 2 | 3 | "auto"`), `whitespace-nowrap` value safety, and multi-line readable subtext.
3. Expand page container in `src/app/tools/[slug]/page.tsx` from `max-w-5xl` to `max-w-6xl`.
4. Polish specific calculators (`DebtPayoffCalculator`, `SavingsCdCalculator`, `UkSalaryCalculator`, `CanadaPaycheckCalculator`, `AustraliaPayCalculator`, `SalaryCalculator`) to use clean 2-column sidebar layouts and deduplicated inputs.

**Architecture Diagram:**

```mermaid
graph TD
    A[Page Container: max-w-6xl] --> B[CalcCard: Title wraps cleanly]
    B --> C[Calculator Layout: Dual Column Grid]
    C --> D[CalcResult: columns={2} or auto]
    D --> E[Full Value: whitespace-nowrap]
    D --> F[Full Subtext: line-clamp-2]
```

**Tech Stack:** Next.js 14, React, Tailwind CSS, TypeScript, Vitest.

---

### Task 1: Enhance `CalcCard.tsx` and `CalcResult.tsx` Primitives

**Files:**
- Modify: `src/components/calculator/CalcCard.tsx`
- Modify: `src/components/calculator/CalcResult.tsx`
- Test: `src/components/calculator/__tests__/primitives.test.tsx`

- [ ] **Step 1: Write test for non-truncated title in `CalcCard` and `columns` prop in `CalcResult`**
In `src/components/calculator/__tests__/primitives.test.tsx`:
- Test that `CalcCard` does not truncate long titles.
- Test that `CalcResult` accepts `columns={2}` and applies a 2-column grid.
- Test that `CalcResult` renders values with `whitespace-nowrap` and subtext with `line-clamp-2`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/components/calculator/__tests__/primitives.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Update `CalcCard.tsx` and `CalcResult.tsx`**
In `CalcCard.tsx`:
- Remove `truncate` from `<h2>{title}</h2>`.
- Add `break-words` or allow normal wrapping.

In `CalcResult.tsx`:
- Add `columns?: 1 | 2 | 3 | "auto"` to `CalcResultProps`.
- Resolve grid class dynamically:
  - `columns === 1`: `grid-cols-1`
  - `columns === 2`: `grid-cols-1 sm:grid-cols-2`
  - `columns === 3`: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
  - `columns === "auto"` (default): `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (with container-friendly item min-width)
- In the item value, use `whitespace-nowrap font-mono tracking-tight`.
- In the item subtext, replace `truncate` with `line-clamp-2 leading-tight`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/components/calculator/__tests__/primitives.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**
Run: `git commit -am "feat(calculator): enhance CalcCard and CalcResult with anti-truncation and configurable columns"`

---

### Task 2: Polish `DebtPayoffCalculator.tsx` and `SavingsCdCalculator.tsx`

**Files:**
- Modify: `src/components/tools/DebtPayoffCalculator.tsx`
- Modify: `src/components/tools/SavingsCdCalculator.tsx`
- Test: `src/components/tools/__tests__/financial-crown-tools.test.tsx`

- [ ] **Step 1: Update `DebtPayoffCalculator.tsx`**
- Deduplicate extra monthly payment input (remove the extra `CalcInput` and keep `ModernSlider` which has an integrated numeric input).
- Update the secondary `CalcResult` to pass `columns={2}` so all 4 metrics have generous room without ellipses.
- Ensure the right sidebar column has plenty of padding and clean typography.

- [ ] **Step 2: Update `SavingsCdCalculator.tsx`**
- Update secondary `CalcResult` to pass `columns={2}`.

- [ ] **Step 3: Run financial crown tests**
Run: `npm test src/components/tools/__tests__/financial-crown-tools.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**
Run: `git commit -am "fix(tools): eliminate truncation and deduplicate inputs in DebtPayoffCalculator and SavingsCdCalculator"`

---

### Task 3: Expand Page Container Width in App Router & Audit Regional Calculators

**Files:**
- Modify: `src/app/tools/[slug]/page.tsx`
- Modify: `src/components/tools/UkSalaryCalculator.tsx`
- Modify: `src/components/tools/CanadaPaycheckCalculator.tsx`
- Modify: `src/components/tools/AustraliaPayCalculator.tsx`
- Modify: `src/components/tools/SalaryCalculator.tsx`
- Test: `src/components/tools/__tests__/regional-calculators.test.tsx`
- Test: `src/components/tools/__tests__/phase2-tools.test.tsx`

- [ ] **Step 1: Expand tool container width**
In `src/app/tools/[slug]/page.tsx`:
- Change calculator wrapper from `max-w-5xl` to `max-w-6xl`.

- [ ] **Step 2: Check and optimize regional salary calculators**
- In `UkSalaryCalculator.tsx`, `CanadaPaycheckCalculator.tsx`, `AustraliaPayCalculator.tsx`, and `SalaryCalculator.tsx`:
  - Set `columns={2}` on right-sidebar `CalcResult` components where items are displayed alongside inputs.
  - Verify all amounts, student loans, RRSP, and superannuation values display with zero truncation.

- [ ] **Step 3: Run regional and phase2 calculator tests**
Run: `npm test src/components/tools/__tests__/regional-calculators.test.tsx src/components/tools/__tests__/phase2-tools.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**
Run: `git commit -am "feat(layout): widen calculator workspace to max-w-6xl and optimize regional salary cards"`

---

### Task 4: Full Codebase Verification, Audit, Build & Push

**Files:**
- Full codebase

- [ ] **Step 1: Run full test suite**
Run: `npm test`
Expected: 64/64 test suites pass.

- [ ] **Step 2: Run site audit**
Run: `npm run audit`
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Run production build**
Run: `npm run build`
Expected: Clean static page generation across all 462+ routes.

- [ ] **Step 4: Push to origin/main**
Run: `git push origin main`
