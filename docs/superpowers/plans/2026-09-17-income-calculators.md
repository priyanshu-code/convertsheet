# Income & Salary Calculators (OmniCalculator-Inspired) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two high-CPC, AI-cited financial calculators (`hourly-to-salary-calculator` and `annual-to-hourly-calculator`) with bidirectional real-time recalculations, paid-time-off/overtime adjustments, SheetJS Excel export, and 12 programmatic preset landing pages.

**Architecture:**
1. Pure calculation functions in `src/lib/engines/financial-engine.ts` supporting bidirectional wage, paycheck periods (hourly, daily, weekly, bi-weekly, semi-monthly, monthly, annual), PTO, and overtime.
2. Reusable, interactive UI components `HourlyToSalaryCalculator.tsx` and `AnnualToHourlyCalculator.tsx` featuring `ModernSlider`, interactive breakdowns, and direct SheetJS Excel export.
3. Registered tools in `src/lib/financial-crown-tools-data.ts`, embedding in `/tools/[slug]`, `/embed/[slug]`, and `/tools/[slug]/[preset]`.
4. 12 programmatic SEO presets in `src/lib/programmatic-presets.ts` targeting high-volume searches ($15/hr, $20/hr, $25/hr, $30/hr, $50/hr, $50k/yr, $75k/yr, $100k/yr, etc.).

---

## Tasks

- [ ] **Task 1: Financial Calculation Engine Core & Unit Tests**
  - Implement `calculateHourlyToSalary()` and `calculateAnnualToHourly()` in `src/lib/engines/financial-engine.ts`.
  - Add test coverage in `src/lib/engines/__tests__/financial-engine.test.ts`.

- [ ] **Task 2: UI Calculator Components & Export**
  - Build `src/components/tools/HourlyToSalaryCalculator.tsx` with interactive sliders and paycheck cards.
  - Build `src/components/tools/AnnualToHourlyCalculator.tsx` with reverse wage calculation.
  - Add component tests in `src/components/tools/__tests__/income-calculators.test.tsx`.

- [ ] **Task 3: Tool Registry & Page Route Mounting**
  - Register `hourly-to-salary-calculator` & `annual-to-hourly-calculator` in `src/lib/financial-crown-tools-data.ts`.
  - Mount both calculators in `src/app/tools/[slug]/page.tsx`, `src/app/embed/[slug]/page.tsx`, and `src/app/tools/[slug]/[preset]/page.tsx`.

- [ ] **Task 4: Programmatic Presets (12 High-Intent Landing Pages)**
  - Add 6 hourly presets ($15, $20, $25, $30, $40, $50) and 6 annual presets ($40k, $50k, $60k, $75k, $100k, $150k) in `src/lib/programmatic-presets.ts`.
  - Update sitemap test in `src/app/convert/[slug]/__tests__/page.test.tsx`.
  - Add footer links in `src/components/layout/Footer.tsx`.

- [ ] **Task 5: Complete Test Pass, Build & 100% Audit Verification**
  - Run `npm test`.
  - Run `npm run build`.
  - Run `npm run audit` across all 142+ HTML pages ensuring 0 Errors, 0 Warnings.
