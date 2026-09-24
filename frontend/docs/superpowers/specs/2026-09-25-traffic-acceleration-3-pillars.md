# Technical Design Specification: Traffic Acceleration — 3 Core Pillars

## 1. Executive Summary & Objective
Following Google Search Console empirical validation where our first inflation programmatic preset (`100k-in-20-years`) achieved **Position 4.1 with a 14.3% CTR**, this project expands ConvertSheet's organic search dominance across three high-intent financial search verticals:
1. **Pillar 1: Inflation & Purchasing Power Long-Tail Expansion** (7 presets)
2. **Pillar 2: Hourly to Salary Wage Ladder Engine** (7 presets + Wage Matrix integration fix)
3. **Pillar 3: Car Loan & Auto Financing Presets & Term Matrix** (5 presets)

Together, these 19 new programmatic SEO landing pages will bring total programmatic presets from 105 to 124, expand the sitemap from 215 to 234 indexable routes, and capture substantial search volume with sub-3 click depth, Answer-First AEO optimization, JSON-LD structured data, and 100% client-side spreadsheet exports.

---

## 2. Architectural Principles & Constraints
- **KISS & SOLID**: Leverage existing programmatic preset architecture (`PROGRAMMATIC_PRESETS`), dynamic route handlers (`/tools/[slug]/[preset]`), and specialized matrix components (`WageConversionMatrix`, `InflationErosionMatrix`, `CarLoanTermMatrix`).
- **Zero Ads / Affiliate Bloat**: Strictly organic SEO focused. No intrusive popups, banners, or affiliate redirects to preserve Core Web Vitals (INP < 50ms, LCP < 1.2s, CLS = 0).
- **Exact Mathematical Modeling**: Standardized financial compounding formulas ($P / (1+r)^t$ for inflation, $r \cdot P / (1 - (1+r)^{-n})$ for amortization, and $W \times 2,080$ for hourly wages).
- **Quality & Accessibility**: 100% test pass rate, 0 link audit errors, 0 axe accessibility warnings.

---

## 3. Detailed Preset Specifications

### Pillar 1: Inflation & Purchasing Power (toolSlug: `inflation-calculator`)
Historical US CPI baseline: 3.2% compound annual inflation.
1. `50k-in-20-years` ($50,000 over 20 years):
   - Initial values: `amount: 50000, inflationRate: 3.2, years: 20`
   - Real purchasing power: $26,630 (46.7% erosion). Future dollars needed: $93,878.
2. `50k-in-30-years` ($50,000 over 30 years):
   - Initial values: `amount: 50000, inflationRate: 3.2, years: 30`
   - Real purchasing power: $19,435 (61.1% erosion). Future dollars needed: $128,635.
3. `250k-in-20-years` ($250,000 over 20 years):
   - Initial values: `amount: 250000, inflationRate: 3.2, years: 20`
   - Real purchasing power: $133,152 (46.7% erosion). Future dollars needed: $469,390.
4. `500k-in-20-years` ($500,000 over 20 years):
   - Initial values: `amount: 500000, inflationRate: 3.2, years: 20`
   - Real purchasing power: $266,303 (46.7% erosion). Future dollars needed: $938,780.
5. `500k-in-30-years` ($500,000 over 30 years):
   - Initial values: `amount: 500000, inflationRate: 3.2, years: 30`
   - Real purchasing power: $194,351 (61.1% erosion). Future dollars needed: $1,286,354.
6. `1-million-in-20-years` ($1,000,000 over 20 years):
   - Initial values: `amount: 1000000, inflationRate: 3.2, years: 20`
   - Real purchasing power: $532,607 (46.7% erosion). Future dollars needed: $1,877,560.
7. `1-million-in-30-years` ($1,000,000 over 30 years):
   - Initial values: `amount: 1000000, inflationRate: 3.2, years: 30`
   - Real purchasing power: $388,702 (61.1% erosion). Future dollars needed: $2,572,709.

### Pillar 2: Hourly to Salary Wage Ladder (toolSlug: `hourly-to-salary-calculator`)
Standard work year: 40 hours/week × 52 weeks = 2,080 hours.
1. `18-an-hour-salary` ($18/hour):
   - Annual: $37,440 | Monthly: $3,120 | Bi-Weekly: $1,440 | Weekly: $720 | Daily: $144
2. `22-an-hour-salary` ($22/hour):
   - Annual: $45,760 | Monthly: $3,813 | Bi-Weekly: $1,760 | Weekly: $880 | Daily: $176
3. `28-an-hour-salary` ($28/hour):
   - Annual: $58,240 | Monthly: $4,853 | Bi-Weekly: $2,240 | Weekly: $1,120 | Daily: $224
4. `35-an-hour-salary` ($35/hour):
   - Annual: $72,800 | Monthly: $6,067 | Bi-Weekly: $2,800 | Weekly: $1,400 | Daily: $280
5. `45-an-hour-salary` ($45/hour):
   - Annual: $93,600 | Monthly: $7,800 | Bi-Weekly: $3,600 | Weekly: $1,800 | Daily: $360
6. `60-an-hour-salary` ($60/hour):
   - Annual: $124,800 | Monthly: $10,400 | Bi-Weekly: $4,800 | Weekly: $2,400 | Daily: $480
7. `75-an-hour-salary` ($75/hour):
   - Annual: $156,000 | Monthly: $13,000 | Bi-Weekly: $6,000 | Weekly: $3,000 | Daily: $600

**Integration Fix**:
In `src/app/tools/[slug]/[preset]/page.tsx`, resolve `preset.initialValues?.hourlyRate ?? preset.initialValues?.hourlyWage` to ensure `WageConversionMatrix` dynamically adopts the preset wage rate rather than falling back to default 25.

### Pillar 3: Car Loan & Auto Financing (toolSlug: `car-loan-calculator`)
1. `30k-car-loan` ($30,000 Car Loan):
   - `vehiclePrice: 30000, downPayment: 3000, tradeInValue: 0, interestRate: 6.5, loanTermMonths: 60, salesTaxPercent: 7.0, dealerFees: 450`
   - Financed: ~$29,550. Monthly: ~$578/mo. Total interest: ~$5,115.
2. `40k-car-loan` ($40,000 Car Loan):
   - `vehiclePrice: 40000, downPayment: 4000, tradeInValue: 0, interestRate: 6.5, loanTermMonths: 60, salesTaxPercent: 7.0, dealerFees: 450`
   - Financed: ~$39,250. Monthly: ~$768/mo. Total interest: ~$6,793.
3. `50k-truck-loan` ($50,000 Truck Loan):
   - `vehiclePrice: 50000, downPayment: 5000, tradeInValue: 0, interestRate: 6.8, loanTermMonths: 72, salesTaxPercent: 7.0, dealerFees: 550`
   - Financed: ~$49,050. Monthly: ~$831/mo. Total interest: ~$10,816.
4. `72-month-car-loan` (72-Month Auto Loan):
   - `vehiclePrice: 35000, downPayment: 3500, tradeInValue: 0, interestRate: 6.9, loanTermMonths: 72, salesTaxPercent: 7.0, dealerFees: 450`
   - Financed: ~$34,400. Monthly: ~$585/mo. Total interest: ~$7,736.
5. `average-car-payment-2026` (Average US Car Payment 2026):
   - `vehiclePrice: 48000, downPayment: 4800, tradeInValue: 0, interestRate: 6.75, loanTermMonths: 68, salesTaxPercent: 7.0, dealerFees: 500`
   - Financed: ~$47,060. Monthly: ~$834/mo. Addresses national new/used payment benchmarks.

---

## 4. Verification & Testing Strategy
- Unit tests: verify all 19 presets in `tests/lib/programmatic-presets.test.ts`.
- Page tests: verify rendering and metadata generation in `src/app/tools/[slug]/[preset]/__tests__/page.test.tsx`.
- Sitemap tests: update expected length in `src/app/convert/[slug]/__tests__/page.test.tsx` (215 $\to$ 234).
- Production build: `npm run build` must export all 524+ static HTML pages.
- Accessibility & Link audit: `npm run audit` must achieve 0 errors, 0 warnings.
