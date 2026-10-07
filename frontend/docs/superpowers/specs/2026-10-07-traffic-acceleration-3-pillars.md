# Technical Design Specification: Traffic Acceleration — 3 Core Pillars (Scaling Beyond the 350 Impressions/Day Plateau)

**Document Date:** October 7, 2026  
**Target Domain:** ConvertSheet.com  
**Objective:** Scale indexable programmatic URL surface area from 117 to 170+ URLs across our three highest-performing, empirically proven search clusters to break through the 350 daily impression ceiling.

---

## 1. Executive Summary & Problem Diagnosis

### The Diagnosis
Between September 24 and October 6, ConvertSheet established strong Google Search Console authority:
- **Total Clicks:** 21 clicks (with consecutive daily organic clicks).
- **Daily Average Position:** Hovering between **17.2 and 25.4** (down from 60+ in early September).
- **Page 1 Dominance:** Over a dozen queries rank in Positions 2.0–6.0 (`texas-take-home-100k` at 2.0, `72-month-car-loan` at 3.7, `sqlite-to-excel` at 7.6, `60-tax-trap` at 2.3).

However, **daily impressions have plateaued at 250–350 impressions/day**.
The root cause is inventory exhaustion:
- The entire domain only hosts **24 converters**, **19 base tools**, and **74 programmatic presets** (~117 indexable pages).
- With average query search volume of 5–20 daily searches per narrow long-tail preset, 117 pages can mathematically never exceed ~350 impressions/day.

### The Solution: Scale the 3 Proven Winners
1. **Pillar 1: US State & Salary Bracket Matrix Expansion** (+25 presets)
2. **Pillar 2: Vehicle Financing Programmatic Expansion** (+14 presets)
3. **Pillar 3: High-Demand Tabular & Data Converters** (+14 converters)

Together, these 53 new high-intent routes will expand the sitemap by **+45%**, providing Google with hundreds of new keyword entry points in categories where our site already has proven top-10 ranking velocity.

---

## 2. Pillar 1: US State & Salary Bracket Matrix Expansion

### Implementation: `src/lib/programmatic-presets.ts`
Registered under `salary-calculator`, `uk-salary-calculator`, and `canada-paycheck-calculator`.

#### US State Tax Rules (2026 Tax Year Baseline):
- **No Income Tax States (0% State Tax):**
  - Florida (FL): `florida-take-home-50k`, `florida-take-home-75k`, `florida-take-home-100k`, `florida-take-home-150k`
  - Washington (WA): `washington-take-home-100k`, `washington-take-home-150k`
- **Flat & Low Tax States:**
  - Pennsylvania (PA - flat 3.07%): `pennsylvania-take-home-75k`, `pennsylvania-take-home-100k`
  - Illinois (IL - flat 4.95%): `illinois-take-home-75k`, `illinois-take-home-100k`
  - Arizona (AZ - flat 2.50%): `arizona-take-home-75k`, `arizona-take-home-100k`
  - Colorado (CO - flat 4.40%): `colorado-take-home-100k`, `colorado-take-home-150k`
  - North Carolina (NC - flat 4.50%): `north-carolina-take-home-75k`, `north-carolina-take-home-100k`
- **Top Population States:**
  - Ohio (OH): `ohio-take-home-75k`, `ohio-take-home-100k`
  - Georgia (GA): `georgia-take-home-75k`, `georgia-take-home-100k`
  - Virginia (VA): `virginia-take-home-100k`, `virginia-take-home-150k`
- **UK Tax Tiers (`uk-salary-calculator`):**
  - `uk-take-home-45k`, `uk-take-home-75k`, `uk-take-home-150k`
- **Canada Province Tiers (`canada-paycheck-calculator`):**
  - `alberta-take-home-80k`, `bc-take-home-80k`

Each preset contains:
- `title`, `metaDescription`, `answerSummary`, `badge`, `keywords`
- Structured Markdown comparison table with Annual, Monthly, Bi-Weekly, and Weekly take-home pay, federal tax, state tax, and FICA.
- 5–6 citable FAQs targeting exact query syntax.

---

## 3. Pillar 2: Vehicle Financing Programmatic Presets

### Implementation: `src/lib/programmatic-presets.ts`
Registered under `car-loan-calculator`.

#### Top Selling US Vehicle Presets:
1. `tesla-model-y-monthly-payment`: MSRP \$44,990 | 72 mo | 6.49% | \$4,500 down $\rightarrow$ Monthly: \$679 | Total Interest: \$8,898
2. `chevy-silverado-monthly-payment`: MSRP \$48,000 | 72 mo | 6.49% | \$5,000 down $\rightarrow$ Monthly: \$723 | Total Interest: \$9,458
3. `toyota-rav4-monthly-payment`: MSRP \$31,500 | 60 mo | 5.99% | \$3,000 down $\rightarrow$ Monthly: \$551 | Total Interest: \$4,560
4. `honda-crv-monthly-payment`: MSRP \$30,800 | 60 mo | 5.99% | \$3,000 down $\rightarrow$ Monthly: \$538 | Total Interest: \$4,480
5. `ram-1500-monthly-payment`: MSRP \$42,000 | 72 mo | 6.49% | \$4,000 down $\rightarrow$ Monthly: \$639 | Total Interest: \$8,012
6. `toyota-camry-monthly-payment`: MSRP \$27,500 | 60 mo | 5.99% | \$2,500 down $\rightarrow$ Monthly: \$483 | Total Interest: \$3,980
7. `toyota-tacoma-monthly-payment`: MSRP \$33,500 | 60 mo | 5.99% | \$3,500 down $\rightarrow$ Monthly: \$580 | Total Interest: \$4,800
8. `honda-civic-monthly-payment`: MSRP \$24,500 | 60 mo | 5.99% | \$2,000 down $\rightarrow$ Monthly: \$435 | Total Interest: \$3,600

#### High-Intent Loan Terms:
9. `84-month-car-loan`: \$35,000 loan | 84 mo | 7.49% $\rightarrow$ Monthly: \$537 | Total Interest: \$10,108
10. `48-month-car-loan`: \$30,000 loan | 48 mo | 5.49% $\rightarrow$ Monthly: \$698 | Total Interest: \$3,480
11. `36-month-car-loan`: \$25,000 loan | 36 mo | 4.99% $\rightarrow$ Monthly: \$749 | Total Interest: \$1,964
12. `zero-down-car-loan`: \$35,000 loan | \$0 down | 60 mo | 6.49% $\rightarrow$ Monthly: \$685 | Total Interest: \$6,100
13. `50k-car-loan`: \$50,000 loan | 60 mo | 6.49% $\rightarrow$ Monthly: \$978 | Total Interest: \$8,680
14. `40k-car-loan`: \$40,000 loan | 60 mo | 6.49% $\rightarrow$ Monthly: \$782 | Total Interest: \$6,920

---

## 4. Pillar 3: High-Demand Tabular & Data Converters

### Implementation: `src/lib/registry.ts` & Converter Engine Wrappers
Expand `CONVERTER_REGISTRY` with 14 missing high-volume tabular pairs:

1. `tsv-to-csv` (Tab-Separated to CSV)
2. `csv-to-tsv` (CSV to Tab-Separated Values)
3. `tsv-to-excel` (TSV to XLSX)
4. `excel-to-tsv` (Excel to TSV)
5. `sql-to-csv` (SQL INSERT/Table dumps to CSV)
6. `csv-to-sql` (CSV to SQL INSERT statement generator)
7. `sql-to-json` (SQL dumps to JSON array)
8. `json-to-sql` (JSON records to SQL INSERT statements)
9. `ndjson-to-csv` (Newline-Delimited JSON to CSV)
10. `csv-to-ndjson` (CSV to Newline-Delimited JSON)
11. `ndjson-to-excel` (NDJSON to XLSX)
12. `yaml-to-excel` (YAML structured data to Excel)
13. `excel-to-yaml` (Excel sheets to YAML records)
14. `parquet-to-json` (Apache Parquet to JSON array via DuckDB-Wasm)

Each converter is registered with:
- Full SEO metadata, canonical URLs, How-To steps, structured FAQ schemas, and semantic rich about copy.
- 100% in-browser client execution with zero server upload.

---

## 5. Verification & Testing Standards
- All existing 700 unit tests must pass.
- New unit tests added to:
  - `tests/lib/programmatic-presets.test.ts` verifying all new presets resolve correctly with valid fields.
  - `src/lib/__tests__/registry.test.ts` verifying all new converter configs, valid slugs, and schema generators.
- `npm run build` must complete cleanly with 0 type errors and successful static generation for all new routes.
