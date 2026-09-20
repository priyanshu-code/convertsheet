# Technical Design Specification: Dedicated UK, Canada, and Australia Salary & Tax Calculators

**Date:** 2026-09-20  
**Status:** In Review  
**Topic:** Tier-1 Country Expansion (UK, Canada, Australia) with Dedicated Tool Pages

---

## 1. Executive Summary & Goals

To capture dominant organic rankings in the highest-search-volume English-speaking financial markets outside the US, we are building 3 **dedicated, authentic regional calculators**:
1. **🇬🇧 United Kingdom**: `uk-salary-calculator` (HMRC PAYE Tax, National Insurance Class 1, Personal Allowance, Workplace Pension, Student Loans)
2. **🇨🇦 Canada**: `canada-paycheck-calculator` (CRA Federal Tax, Provincial Tax for ON/BC/AB/QC, Canada Pension Plan (CPP/CPP2), Employment Insurance (EI))
3. **🇦🇺 Australia**: `australia-pay-calculator` (ATO Income Tax Brackets, 2% Medicare Levy, 11.5% Superannuation Guarantee, HELP/HECS Debt)

Each tool will have:
- A **dedicated route** (`/tools/uk-salary-calculator`, `/tools/canada-paycheck-calculator`, `/tools/australia-pay-calculator`).
- Pure **client-side calculation engines** in `src/lib/engines/financial-engine.ts`.
- Full **Tool Registry** entry with localized benefit-driven titles, FAQs, How-Tos, and AEO schema.
- **Visual Chart & Breakdown** matching ConvertSheet's design system with `CalcSaveButton`, `CalcShareButton`, and Excel export.
- **Cross-linking pills** connecting the tools so a visitor can easily jump between US, UK, Canada, Australia, and India.

---

## 2. Mathematical Models & Specifications

### A. United Kingdom: `uk-salary-calculator` (`calculateUkSalary`)
- **Currency:** GBP (`£`)
- **Inputs:**
  - Annual Gross Salary (`£`)
  - Tax Year (2024/25 default)
  - Workplace Pension auto-enrolment % (default 5%)
  - Student Loan plan (None, Plan 1, Plan 2, Plan 4/Scotland, Plan 5, Postgraduate)
- **HMRC 2024/25 Rules:**
  - **Personal Allowance:** £12,570 (tapers down by £1 for every £2 of income above £100,000; reaches £0 at £125,140).
  - **Income Tax Bands:**
    - Basic Rate (20%): £12,571 to £50,270
    - Higher Rate (40%): £50,271 to £125,140
    - Additional Rate (45%): Over £125,140
  - **National Insurance (Employee Class 1 - April 2024 update):**
    - Under Primary Threshold (£1,048/mo or £12,570/yr): 0%
    - £12,570 to £50,270 (Main rate): **8%**
    - Over £50,270 (Higher rate): **2%**
  - **Pension Relief:** 5% employee relief deducted pre-tax or net pay arrangement.
- **Outputs:**
  - Annual Take-Home, Monthly Take-Home, Weekly Take-Home.
  - Total Income Tax, Total National Insurance, Total Pension Contribution.
  - Effective Tax Rate %, Marginal Rate %.

### B. Canada: `canada-paycheck-calculator` (`calculateCanadaSalary`)
- **Currency:** CAD (`$`)
- **Inputs:**
  - Annual Gross Salary (`$ CAD`)
  - Province: Ontario (ON - default), British Columbia (BC), Alberta (AB), Quebec (QC)
  - RRSP contribution % (default 0%)
- **CRA 2024 Rules:**
  - **Federal Brackets (2024):**
    - 15% on first $55,867
    - 20.5% on $55,867 to $111,733
    - 26% on $111,733 to $173,205
    - 29% on $173,205 to $246,752
    - 33% over $246,752
    - Federal Basic Personal Amount (BPA): $15,705 (tax credit at 15%).
  - **Provincial Brackets (e.g. Ontario 2024):**
    - 5.05% on first $51,446
    - 9.15% on $51,446 to $102,894
    - 11.16% on $102,894 to $150,000
    - 12.16% on $150,000 to $220,000
    - 13.16% over $220,000 + Ontario Health Premium.
  - **Canada Pension Plan (CPP & CPP2 2024):**
    - Base CPP: 5.95% on earnings between $3,500 exemption and $68,500 YMPE cap (Max $3,867.50).
    - Second CPP (CPP2): 4.0% on earnings between $68,500 and $73,200 cap (Max $188.00).
  - **Employment Insurance (EI 2024):**
    - 1.66% up to Maximum Insurable Earnings of $63,200 (Max $1,049.12).
- **Outputs:**
  - Net Annual, Semi-Monthly (24 pay periods), Bi-Weekly (26 pay periods) Take-Home.
  - Federal Tax, Provincial Tax, CPP/CPP2, EI, and RRSP savings.

### C. Australia: `australia-pay-calculator` (`calculateAustraliaSalary`)
- **Currency:** AUD (`$`)
- **Inputs:**
  - Annual Gross Salary (excluding Super)
  - Superannuation Guarantee Rate (default 11.5% for 2024-25)
  - Medicare Levy Exemption / Surcharge toggles
  - HELP / HECS Student Debt (Yes / No)
- **ATO 2024-25 Stage 3 Tax Cut Rates (Effective 1 July 2024):**
  - $0 to $18,200 (Tax-free threshold): Nil
  - $18,201 to $45,000: **16%**
  - $45,001 to $135,000: **30%**
  - $135,001 to $190,000: **37%**
  - $190,001 and above: **45%**
  - **Medicare Levy:** Flat 2.0% of taxable income (phasing in above ~$26,000 threshold).
  - **Superannuation Guarantee (SG):** 11.5% employer contribution calculated on top of base salary (up to maximum contribution base ~$65,070/quarter).
  - **HELP/HECS Debt:** ATO progressive repayment rates starting at ~1% over ~$54,435 up to 10% over ~$159,663.
- **Outputs:**
  - Net Annual Take-Home, Monthly Take-Home, Fortnightly Take-Home (26 fortnights), Weekly Take-Home.
  - Total ATO Income Tax, Medicare Levy, Employer Super Paid to Fund.

---

## 3. UI Component Architecture

Each new tool component will be built under `src/components/tools/`:
- `src/components/tools/UkSalaryCalculator.tsx`
- `src/components/tools/CanadaPaycheckCalculator.tsx`
- `src/components/tools/AustraliaPayCalculator.tsx`

Each component features:
1. **Regional Badges & Cross-Link Hub**:
   - Header links: `[ 🇺🇸 US Paycheck ] | [ 🇬🇧 UK PAYE ] | [ 🇨🇦 Canada ] | [ 🇦🇺 Australia ] | [ 🇮🇳 India CTC ]`.
2. **Interactive Sliders & Presets**:
   - Quick presets for median salaries in that country (e.g. UK: £30k, £45k, £70k, £100k; Canada: $50k, $75k, $100k, $130k; Australia: $60k, $90k, $120k, $160k).
3. **High-Contrast Cards & Scenario Bookmarks**:
   - `CalcResult`, `CalcChart` showing Tax vs Deductions vs Take-Home, `CalcSaveButton`, `CalcShareButton`, and `CalcExportButton` for Excel.

---

## 4. Testing & Quality Verification

- **Unit tests for all 3 mathematical engines** in `financial-engine.test.ts`.
- **Component test suite** in `src/components/tools/__tests__/regional-calculators.test.tsx`.
- **Registry & Sitemap integrity tests**: Updating total tool counts and sitemap URL counts.
- **`npm test`**: 100% test pass rate.
- **`npm run audit`**: 100% pass on all routes (0 errors, 0 warnings).
- **`npm run build`**: Clean static generation across all routes.
