# Technical Design Specification: SEO Title CTR, Linux Timestamp Long-Tail & Dual-Mode Regional Calculators

**Date:** 2026-09-20  
**Status:** In Review  
**Topic:** SEO Ranking Recovery & Regional Usability Optimization

---

## 1. Problem Statement & Root Cause

1. **Low SERP Visibility & Click-Through (CTR):**
   - Google Search Console placed `unix-timestamp-converter` at position ~24.3 for `"linux timestamp converter"`.
   - Current titles (`"Unix Timestamp Converter - Epoch to Human Date & Time"`) and descriptions are descriptive but lack CTR power words ("100% Private", "No Ads", "Terminal Command Helper", "ISO 8601").
   - Linux developers specifically look for bash/CLI commands (e.g. `date -d @...`) and explanations of 32-bit/64-bit epoch representation.
2. **Regional Calculator Mismatch ("Stuck between India and the West"):**
   - High bounce rate causes Google to demote ranking when an international user lands on a calculator displaying irrelevant local conventions.
   - Currently, `SalaryCalculator.tsx` and `IncomeTaxCalculator.tsx` are hardcoded to Indian Rupees (`₹`), EPF (12%), and Indian Tax Slabs (New Regime FY 2024-25).
   - A US visitor searching for "Salary Take Home" expects FICA (Social Security 6.2%, Medicare 1.45%), Federal brackets, 401(k), State tax estimates, and `$` currency.
3. **Internal Linking & Programmatic SEO Presets:**
   - There are currently no dedicated landing pages for `/tools/salary-calculator/us-take-home` or `/tools/salary-calculator/india-in-hand`, missing high-intent regional organic traffic.

---

## 2. Architecture & Design

### Section A: Action 1 - High-CTR Title & Meta Optimization across Key Tools
Update `src/lib/tool-registry.ts` for developer and conversion tools:
- **`unix-timestamp-converter`**:
  - **Title:** `Unix & Linux Timestamp Converter (Epoch to Human Date) - 100% Private`
  - **Subtitle:** `Instant bidirectional conversion between Unix epoch timestamps (seconds & milliseconds) and human dates. Includes Linux bash commands & ISO 8601 formatting.`
  - **Keywords:** `["linux timestamp converter", "unix timestamp converter", "epoch to date", "convert epoch linux command", "bash timestamp to date", "iso 8601 epoch"]`
- **`salary-calculator`**:
  - **Title:** `Salary & Take-Home Pay Calculator (US & India) - Net In-Hand Salary`
  - **Subtitle:** `Calculate net monthly take-home pay after taxes, retirement (401k / EPF), and deductions for US (Federal/FICA) and India (FY 2024-25).`
- **`income-tax-calculator`**:
  - **Title:** `Income Tax Calculator (US Federal & India Slabs) - Instant Tax Bracket Breakdown`

### Section B: Action 2 - Long-Tail Linux Intent & Bash Helpers in `UnixTimestampTool.tsx`
Enhance `UnixTimestampTool.tsx`:
1. **Linux CLI Command Cheatsheet**:
   - Provide interactive 1-click copy commands for:
     - Linux Bash (convert epoch to date): `date -d @<epoch>`
     - Linux Bash (convert current date to epoch): `date +%s`
     - macOS/BSD terminal: `date -r <epoch>`
     - Python: `from datetime import datetime; datetime.fromtimestamp(<epoch>)`
     - JavaScript: `new Date(<epoch> * 1000).toISOString()`
2. **Dedicated FAQs & Explanations**:
   - Add rich schema and on-page accordion for:
     - *"How do I convert a Unix timestamp in the Linux terminal?"*
     - *"What is the difference between Unix time in seconds (10 digits) and milliseconds (13 digits)?"*
     - *"What will happen on January 19, 2038 (Year 2038 Bug / Y2038) on 32-bit Linux?"*

### Section C: Action 3 - Dual-Mode Regional Calculators (US & India)

#### 1. Common Regional Hook & Auto-Detection:
- Use `useCurrency()` context:
  - If `market === "IN"`, default to **India** regime.
  - If `market !== "IN"`, default to **US / Global** regime.
  - Provide an interactive pill toggle right inside the calculator card: `[ 🇺🇸 United States (W-2 / 1099) ] | [ 🇮🇳 India (CTC / In-Hand) ]`.

#### 2. Salary Calculator Dual Engine:
- **US Mode**:
  - Inputs: Gross Annual Salary (`$`), Federal Filing Status (Single / Married), 401(k) Contribution (%), State Income Tax Estimate (%), Pre-tax Health/FSA.
  - Calculations:
    - FICA Social Security: 6.2% up to wage base cap ($168,600).
    - FICA Medicare: 1.45% (plus 0.9% additional for >$200k).
    - Standard Federal Deduction ($14,600 Single).
    - 2024/2025 Federal Brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%).
    - Net Annual & Semi-Monthly / Bi-Weekly / Monthly Take-Home Pay.
  - Outputs: Crisp Take-Home result cards, export to Excel, bookmark scenario.
- **India Mode**:
  - Preserves existing CTC, Basic Pay (50%), EPF (12%), Professional Tax (₹200), and Budget 2024 New Regime Slabs with standard ₹75,000 deduction.

#### 3. Income Tax Calculator Dual Engine:
- **US Mode**: Progressive Federal Tax brackets with Single / Married filing status and standard deductions.
- **India Mode**: Progressive New Tax Regime slabs (Budget 2024-25) with rebate under section 87A and 4% Health & Education cess.

#### 4. Programmatic Presets in `src/lib/programmatic-presets.ts`:
Register dedicated programmatic routes:
- `/tools/salary-calculator/us-take-home-100k`
- `/tools/salary-calculator/us-take-home-75k`
- `/tools/salary-calculator/india-in-hand-12-lakh`
- `/tools/income-tax-calculator/us-tax-single`
- `/tools/income-tax-calculator/india-new-regime`

---

## 3. Testing & Verification Plan

1. **Unit & Engine Tests:**
   - Add unit tests for US tax calculations (FICA, standard deduction, federal brackets) and India salary calculations.
   - Test preset parameter handling and geo-switch state preservation.
   - Test UnixTimestampTool with Linux CLI command generation and copy handlers.
2. **Automated Audits & Build:**
   - `npm test` (all 63+ test suites must pass).
   - `npm run audit` (100% pass on all 191+ scanned routes).
   - `npm run build` (zero errors across static page generation).
