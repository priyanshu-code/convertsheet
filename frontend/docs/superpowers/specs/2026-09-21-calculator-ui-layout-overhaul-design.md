# Calculator UI Responsive Layout & Truncation Overhaul Design

**Date:** 2026-09-21  
**Status:** Approved  
**Scope:** Core calculator UI primitives (`CalcResult`, `CalcCard`), tool pages container width, and component-specific layout refinements (`DebtPayoffCalculator`, `SavingsCdCalculator`, `UkSalaryCalculator`, `CanadaPaycheckCalculator`, `AustraliaPayCalculator`, `SalaryCalculator`, etc.).

---

## 1. Problem Statement & Root Cause Analysis

In multi-column financial calculator views (e.g. `lg:col-span-7` input, `lg:col-span-5` results), cards suffer from severe visual squashing and clipping:
1. **Metric Truncation in `CalcResult`**: Hardcoded `lg:grid-cols-3` forces 3 columns into ~380px sidebar containers, causing large financial amounts like `$13,800` to be truncated into `$13...` with ellipses.
2. **Subtext Loss**: Metric cards use `truncate` (single-line clip), cutting off descriptive context like "Minimums + your extra accelerator contribution".
3. **Card Title Truncation in `CalcCard`**: Indiscriminate `truncate` class on `<h2>` turns `"Debt Elimination Summary"` into `"Debt Elimination Sum..."`.
4. **Duplicated Input Controls**: In `DebtPayoffCalculator`, the extra monthly payment has both a separate `CalcInput` and a `ModernSlider` directly below it, which already has its own numeric input box.
5. **Page Container Limitation**: `tools/[slug]/page.tsx` limits the main interactive calculator to `max-w-5xl` (1024px), leaving sidebars tightly compressed on desktop screens.

---

## 2. Architectural Solution (Approach A: Container-Aware Adaptive Primitives)

```mermaid
graph TD
    A[tools/[slug]/page.tsx: max-w-6xl] --> B[CalcCard: Non-truncated Title & Flex Wrap]
    B --> C[Calculator Layout: Dual Column Grid]
    C --> D[CalcResult: Container-Aware Adaptive Grid]
    D --> E[Adaptive Columns: auto / 1 / 2 / 3]
    D --> F[whitespace-nowrap & line-clamp-2 on Subtext]
    D --> G[Full Value Visibility: Zero Truncation]
```

### 2.1. Primitive Enhancements

#### `CalcCard.tsx`
- Remove `truncate` from the `<h2>` card title. Allow words to wrap cleanly onto a second line if space is constrained (`break-normal`).
- Improve header flex alignment: `flex-wrap sm:flex-nowrap gap-3`, giving the title priority and keeping badge/currency selector shrink-resistant.

#### `CalcResult.tsx`
- Add optional `columns?: 1 | 2 | 3 | "auto"` prop to `CalcResultProps` (defaulting to `"auto"`).
- In `"auto"` mode, apply responsive container-aware classes:
  - Inside wide areas (full width or `col-span-12`): `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
  - When explicitly specified or when inside narrow sidebars: 2 columns (`grid-cols-1 sm:grid-cols-2`) or dynamic auto-fit grid (`@container` + `grid-cols-[repeat(auto-fit,minmax(140px,1fr))]`).
- Remove `truncate` from item subtext; replace with `line-clamp-2 leading-tight` so users can read full descriptions.
- Value typography: Ensure `whitespace-nowrap` on monetary and numerical outputs, with `text-sm sm:text-base lg:text-lg font-bold font-mono tracking-tight`.

### 2.2. Calculator Page Container (`src/app/tools/[slug]/page.tsx`)
- Upgrade calculator container width from `max-w-5xl` to `max-w-6xl` (and `max-w-7xl` on large monitors) so split 7/5 layouts provide 480px+ width to the output sidebar.

### 2.3. Tool-Specific Polish
- **`DebtPayoffCalculator.tsx`**:
  - Remove redundant `CalcInput` above `ModernSlider` for extra monthly accelerator payment (relying on `ModernSlider`'s built-in numeric input).
  - Explicitly configure `CalcResult columns={2}` for the secondary metrics so all 4 metrics (Total Debt, Monthly Commitment, Total Interest, Cumulative Payments) render with full breathing room.
- **`SavingsCdCalculator.tsx`**:
  - Configure `CalcResult columns={2}` for the right-column metrics (Initial Deposit, Contributions, Early Penalty, Net Balance).
- **`UkSalaryCalculator.tsx`, `CanadaPaycheckCalculator.tsx`, `AustraliaPayCalculator.tsx`, `SalaryCalculator.tsx`**:
  - Ensure right-column `CalcResult` has `columns={2}` or uses auto-fit layout, ensuring none of the 8+ items clip.

---

## 3. Verification Plan
1. **Visual and Unit Testing**:
   - Verify `CalcResult` test cases in `primitives.test.tsx` for new `columns` prop and no truncation.
   - Verify all existing component tests in `regional-calculators.test.tsx`, `phase2-tools.test.tsx`, and `financial-crown-tools.test.tsx`.
2. **Full Test Suite**: `npm test` across all 64 test suites.
3. **Audit**: `npm run audit` (0 errors, 0 warnings).
4. **Build**: `npm run build` static compilation.
