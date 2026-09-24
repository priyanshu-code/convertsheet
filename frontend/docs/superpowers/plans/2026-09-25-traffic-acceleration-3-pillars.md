# Implementation Plan: Traffic Acceleration — 3 Core Pillars

## Overview
Implement 19 high-intent programmatic SEO landing pages across:
- **Pillar 1: Inflation & Purchasing Power Expansion** (7 presets)
- **Pillar 2: Hourly to Salary Wage Ladder Engine** (7 presets + Wage Matrix integration fix)
- **Pillar 3: Car Loan & Auto Financing Presets & Term Matrix** (5 presets)

All presets will be statically generated at build time, tested with Vitest, audited with Playwright & Axe, and submitted to Google Search Console.

---

## Proposed Changes

### 1. `src/lib/programmatic-presets.ts`
- Append the 19 new presets to `PROGRAMMATIC_PRESETS`:
  - 7 Inflation presets: `50k-in-20-years`, `50k-in-30-years`, `250k-in-20-years`, `500k-in-20-years`, `500k-in-30-years`, `1-million-in-20-years`, `1-million-in-30-years`
  - 7 Wage presets: `18-an-hour-salary`, `22-an-hour-salary`, `28-an-hour-salary`, `35-an-hour-salary`, `45-an-hour-salary`, `60-an-hour-salary`, `75-an-hour-salary`
  - 5 Car loan presets: `30k-car-loan`, `40k-car-loan`, `50k-truck-loan`, `72-month-car-loan`, `average-car-payment-2026`

### 2. `src/app/tools/[slug]/[preset]/page.tsx`
- Enhance `WageConversionMatrix` invocation to read `Number(preset.initialValues?.hourlyRate ?? preset.initialValues?.hourlyWage) || 25` so that each wage preset page automatically renders its matching wage matrix table.

### 3. Test Suites
- `tests/lib/programmatic-presets.test.ts`:
  - Add explicit unit tests verifying retrieval and properties of representative presets from each of the 3 pillars.
- `src/app/tools/[slug]/[preset]/__tests__/page.test.tsx`:
  - Add rendering tests for wage and inflation presets.
- `src/app/convert/[slug]/__tests__/page.test.tsx`:
  - Update expected sitemap entries from 215 to 234.

---

## Verification Plan

### Automated Tests
1. `npm test tests/lib/programmatic-presets.test.ts`
2. `npm test src/app/tools/[slug]/[preset]/__tests__/page.test.tsx`
3. `npm test src/app/convert/[slug]/__tests__/page.test.tsx`
4. Full test suite: `npm test` (all 71+ test suites passing)

### Production Build & Static Export
5. `npm run build`
   - Confirm static generation of 524+ static routes with 0 errors.

### Accessibility & Link Audit
6. `npm run audit`
   - Playwright + Axe audit scanning all pages for 404s, link equity, and ARIA compliance. Target: 0 errors, 0 warnings.

### Search Console Submission
7. Submit sitemap to Google Search Console via `submit_sitemap` MCP tool.
