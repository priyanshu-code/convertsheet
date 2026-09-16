# Design Document: Modern & Personalized Financial Calculator UX

**Author:** Antigravity  
**Date:** 2026-09-16  
**Status:** In Review  
**Inspired By:** Dezerv (Goal-based personalized journey & readiness metrics), Groww (Effortless tactile sliders & immediate visual breakdown)

---

## 1. Executive Summary & Goals

### Current State:
ConvertSheet's current financial calculators rely primarily on standard numeric text input fields (`<input type="number">`). While accurate, it feels dry and static:
- Users have to mentally calculate numbers before typing.
- No immediate visual gratification when experimenting with scenarios.
- Lacks emotional resonance or personalized milestones (e.g. "You're 72% on track for a comfortable retirement!").

### Target Experience:
Transform ConvertSheet's financial calculators into a **tactile, modern, and personalized wealth planning experience**:
1. **Premium Interactive Slider Component (`ModernSlider`)**:
   - Smooth custom-styled slider with active gradient track fill.
   - Floating value badge that dynamically positions above the thumb knob.
   - Quick-select preset pills (e.g. `[18] [25] [30] [45] [60]` or `[$500] [$1,000] [$2,000]`).
   - Direct editable numeric input alongside the slider so power users can still type exact numbers.
2. **Personalized Step-by-Step "Retirement Health Check" Onboarding**:
   - A welcoming 3-step wizard for the Retirement Calculator:
     - **Step 1:** Your Timeline (Current Age & Target Retirement Age).
     - **Step 2:** Your Lifestyle & Savings (Current Nest Egg & Monthly Investment).
     - **Step 3:** Your Retirement Vision (Target Monthly Spend in Retirement).
   - Instant "Retirement Readiness Score" badge (e.g., "Fully Funded", "Comfortable", or "Action Required") with personalized breakdown.
   - Seamless switch between "Step-by-Step Guided Mode" and "All-in-One Expert Playground".
3. **Visual Wealth Breakdown (Donut Chart & Dynamic Milestones)**:
   - Interactive Recharts Donut / Radial breakdown comparing:
     - Principal Invested (Blue)
     - Compound Growth / Interest Earned (Emerald)
     - Employer Match / Free Money (Teal)
   - Real-time milestone insights (e.g., "Compound interest provides 62% of your final wealth!").

---

## 2. Visual Architecture & Component Hierarchy

```
RetirementCalculator
├── WizardProgressHeader (Optional: Step 1 / 2 / 3 or "Switch to Advanced")
├── Main Layout Grid (2 Columns on Desktop)
│   ├── Left Column: Interactive Controls
│   │   ├── ModernSlider (Current Age) [Presets: 22, 25, 30, 35, 40]
│   │   ├── ModernSlider (Retirement Age) [Presets: 50 (FIRE), 55, 60, 65, 70]
│   │   ├── ModernSlider (Current Savings) [Presets: $10k, $25k, $50k, $100k, $250k]
│   │   ├── ModernSlider (Monthly Contribution) [Presets: $250, $500, $1k, $2k, $3k]
│   │   └── Collapsible "Advanced Market Assumptions" (Return Rate, Inflation, Match %)
│   │
│   └── Right Column: Personalized Dashboard & Insights
│       ├── RetirementReadinessScoreCard (e.g., "94% Ready • On Track to Retire at 60")
│       ├── DonutBreakdownChart (Principal vs Compounding vs Employer Match)
│       ├── SummaryMetricCards (Nest Egg, Inflation-Adjusted Power, Safe 4% Monthly Income)
│       └── CalcPdfReportButton & Ask AI Advisor Trigger
└── Bottom: Portfolio Growth & Drawdown Curve (Full-width Recharts Line/Area)
```

---

## 3. Detailed Component Specifications

### 3.1. `ModernSlider.tsx` (Reusable Across All Calculators)
- **Props**:
  - `label`: string
  - `value`: number
  - `min`: number
  - `max`: number
  - `step`: number
  - `prefix`?: string (e.g. `$`)
  - `suffix`?: string (e.g. `yrs`, `%`, `/mo`)
  - `presets`?: Array<{ label: string; value: number }>
  - `helpText`?: string
  - `onChange`: (value: number) => void
- **Features**:
  - Twin representation: Synchronized slider track + inline number input with click-to-edit.
  - Active fill track with emerald gradient (`bg-gradient-to-r from-emerald-500 to-teal-400`).
  - Tactile quick-select preset chips beneath the slider with active state highlighting.
  - Accessible: Full ARIA range attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `role="slider"`).

### 3.2. `RetirementWizard.tsx` (Personalized Step-by-Step Flow)
- **Step 1: Timeline**
  - "When do you want to break free?"
  - Sliders for Current Age & Target Retirement Age.
  - Live preview of "Years to build wealth: X years".
- **Step 2: Financial Foundation**
  - "What do your investments look like today?"
  - Current portfolio balance & monthly savings capacity.
- **Step 3: Future Lifestyle & Reveal**
  - Desired retirement monthly budget.
  - Instant transition to the personalized results dashboard with animated reveal.
- **Toggle**: "I know my numbers — Show Full Calculator" button for immediate power-user access.

### 3.3. `RetirementDonutBreakdown.tsx`
- Clean SVG/Recharts Donut chart showing:
  - Total Personal Savings ($ and %)
  - Compound Interest Earned ($ and %)
  - Employer Matching Contributions ($ and %)
- Central text display showing the projected net worth at retirement.

---

## 4. Reusability Across Other Calculators
The `ModernSlider` component will directly elevate other calculators:
- **Mortgage Calculator**: Sliders for Home Price, Down Payment %, Interest Rate, Loan Term (15y vs 30y pills).
- **Car Loan Calculator**: Sliders for Vehicle Price, Down Payment, Term (36, 48, 60, 72, 84 month chips).
- **SIP & Compound Interest**: Sliders for Monthly Investment, Time Period, Expected Return %.

---

## 5. Verification & Testing Plan

1. **Unit & Component Testing**:
   - `ModernSlider.test.tsx`: Tests boundary values, dragging, keyboard navigation (ArrowLeft/ArrowRight), and clicking preset chips.
   - `RetirementCalculator.test.tsx`: Tests that moving sliders updates calculation results and donut distribution in real-time.
   - `RetirementWizard.test.tsx`: Tests step progression (Next/Back), state retention, and toggling to full view.
2. **Local A11y & SEO Audit**:
   - Run `npm run audit` to ensure 0 errors and 0 warnings (no skipped headings, proper ARIA labels on all slider thumbs and buttons).
3. **Responsive Visual Testing**:
   - Mobile touch dragging: Sliders have adequate touch target size (minimum 44x44px hit area).
   - Dark mode & Light mode contrast compliance.
