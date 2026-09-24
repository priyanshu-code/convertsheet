# Design Spec: High-Impact Growth Engines (KISS & SOLID Refined)

**Date**: 2026-09-24  
**Author**: Senior Principal Engineer / Antigravity  
**Status**: Approved for Implementation

---

## 1. Overview & Business Objectives
Based on live Google Search Console (GSC) performance data (1,191 impressions, 3 organic clicks, Position 4.1 in inflation queries, Position 3.0 in car loans, and rising wage queries), this spec establishes three focused enhancements:
1. **Pillar 1 (Inflation Moat)**: Add salary protection solver mode and multi-decade purchasing power benchmarks.
2. **Pillar 2 (Car Loan Dominance)**: Add pure early loan payoff and interest savings calculation and card.
3. **Pillar 3 (Wage Conversion Engine)**: Add net take-home pay estimation (FICA + federal tax) and 35h/40h workweek comparison.

---

## 2. Engineering Architecture & SOLID Compliance

### 2.1 Pure Mathematical Engines (`src/lib/engines/financial-engine.ts`)
- **Single Responsibility**: `calculateCarLoanEarlyPayoff` takes loan amount, interest rate, term, and extra payment per month; returns pure metrics:
  ```ts
  export interface CarLoanEarlyPayoffInput {
    loanAmount: number;
    interestRate: number; // APR %
    originalTermMonths: number;
    extraMonthlyPayment: number;
    oneTimeLumpSum?: number;
  }

  export interface CarLoanEarlyPayoffResult {
    originalMonthlyPayment: number;
    acceleratedMonthlyPayment: number;
    originalTotalInterest: number;
    acceleratedTotalInterest: number;
    totalInterestSaved: number;
    originalTermMonths: number;
    newPayoffMonths: number;
    monthsSaved: number;
    yearsSaved: number;
  }
  ```
- **KISS**: Iterative monthly amortization loop that terminates when principal drops to zero or original term is reached.

### 2.2 UI Integration
- **Inflation Calculator**: Add a lightweight mode switch between "Purchasing Power Decay" and "Salary Protection".
- **Car Loan Calculator**: Mount `CarLoanEarlyPayoffCard.tsx` under the amortization chart with a 1-click `.xlsx` export.
- **Hourly to Salary Calculator**: Connect with existing `calculateUsSalary` to display estimated net take-home pay.

### 2.3 Declarative Programmatic Presets (`src/lib/programmatic-presets.ts`)
- `100k-in-30-years`
- `200k-in-20-years`
- `35k-car-loan-payment`
- `48-month-car-loan-payment`
- `25-an-hour-is-how-much-a-year`
- `15-an-hour-is-how-much-a-year`
- `40k-salary-to-hourly`
