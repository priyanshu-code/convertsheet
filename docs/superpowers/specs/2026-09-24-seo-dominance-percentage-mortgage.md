# Design Spec: SEO Dominance — Percentage Calculator & 15 vs 30 Year Mortgage

**Date**: 2026-09-24  
**Author**: Senior Principal Engineer / Antigravity  
**Status**: Approved for Implementation

---

## 1. Overview & Business Objectives
Based on fresh Google Search Console (GSC) data (6 organic clicks, 1,418 impressions, 5 clicks on Sept 23):
1. `/tools/percentage-calculator` reached **Position 11.0** (1 spot away from Page 1) with 29 impressions and 1 click, yet has 0 programmatic presets.
2. The `"15 vs 30 year mortgage calculator"` search query surged to **55+ impressions** across queries.

This spec establishes:
1. **Pillar 1 (Percentage Calculator Page 1 Engine)**: Wire `initialValues` in `PercentageCalculator.tsx`, mount in `[preset]/page.tsx`, and register 5 high-intent programmatic presets with direct answer snippet cards.
2. **Pillar 2 (15 vs 30 Year Mortgage Dominance)**: Upgrade `MortgageTermComparisonTable.tsx` with visual trade-off comparison bars, export to Excel, and mount in `MortgageCalculator.tsx`.

---

## 2. Technical Architecture

### 2.1 Percentage Calculator (`src/components/tools/PercentageCalculator.tsx`)
- Export interface `PercentageCalculatorProps`:
  ```ts
  export interface PercentageCalculatorProps {
    initialValues?: Partial<{
      mode: PercentageCalcMode;
      valX: number;
      valY: number;
      originalPrice: number;
      discountPercent: number;
      taxBasePrice: number;
      taxPercent: number;
      costPrice: number;
      marginMarkupPercent: number;
      marginMarkupType: "margin" | "markup";
    }>;
  }
  ```
- Support initial state hydration from `initialValues`.
- Add a direct mathematical formula badge and step-by-step breakdown card for Google Featured Snippets.

### 2.2 Programmatic Presets (`src/lib/programmatic-presets.ts`)
- Register 5 presets under `toolSlug: "percentage-calculator"`:
  1. `what-is-20-percent-of-100` (mode: "whatIs", valX: 20, valY: 100)
  2. `what-is-15-percent-of-80` (mode: "whatIs", valX: 15, valY: 80)
  3. `percentage-increase-calculator` (mode: "change", valX: 100, valY: 150)
  4. `20-percent-off-discount-calculator` (mode: "discount", originalPrice: 100, discountPercent: 20)
  5. `margin-vs-markup-calculator` (mode: "marginMarkup", costPrice: 100, marginMarkupPercent: 30)

### 2.3 Preset Route Wiring (`src/app/tools/[slug]/[preset]/page.tsx`)
- Import `PercentageCalculator` and add `case "percentage-calculator"` to `renderCalculator()`.

### 2.4 Mortgage Term Comparison Table (`src/components/calculator/MortgageTermComparisonTable.tsx`)
- Add visual comparison delta bars:
  - Monthly payment delta ($2,666 vs $2,023)
  - Interest savings delta (-$248,282 saved)
- Add 1-click SheetJS Excel amortization schedule download.
- Mount directly in `MortgageCalculator.tsx` under rate cards.
