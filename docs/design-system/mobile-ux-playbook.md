# ConvertSheet Mobile UI/UX Playbook & Design System

## 1. Core Principles & Research Foundation
Grounded in empirical ergonomics from the Nielsen Norman Group (NN/g), Apple Human Interface Guidelines (HIG), Smashing Magazine, UX Collective, and Google Material Design 3:

1. **Thumb-Zone Ergonomics (Steven Hoober & NN/g Empirical Studies):** 
   - 82%+ of smartphone users operate devices one-handed or with index-finger support.
   - The "Natural Thumb Zone" occupies the lower 50–60% of the screen. Primary levers (calculate, preset pills, currency toggles, export buttons, slider thumbs) MUST live inside this zone.
   - Danger zone: Top-left and top-right navigation triggers require uncomfortable grip readjustment or two-handed operation, increasing drop and mis-tap probabilities.
2. **Minimum Touch Targets (Apple HIG & Google Material 3):**
   - Apple HIG specifies **44px x 44px** absolute minimum touch bounding boxes.
   - Google Material 3 specifies **48px x 48px** with at least 8px separation between adjacent interactive targets.
   - Even when visual pills render with compact typography (e.g., 12px or 13px font), the hit area (`min-h-[44px]`, `py-2 sm:py-1 px-3`, `touch-manipulation`) must guarantee zero mis-taps.
3. **Instant Tactile Feedback (Zero-Lag Execution):**
   - Visual and mathematical recalculation must execute in <16ms (60fps) upon every slider drag or numeric stroke.
   - Zero artificial loading spinners on client-side calculators. The user's physical input must yield instant feedback.
4. **Zero-Knowledge Privacy Prominence:**
   - Clear visual reassurance badge ("100% Client-Side • No server data transfer • Private & Free Forever") prominently displayed on tool hero headers.
   - Directly addresses enterprise security concerns and privacy skepticism when entering sensitive salary or mortgage numbers.
5. **Repeat Usage Habit Loops & Retention Architecture:**
   - **Real-Time URL Query Serialization:** As users slide values or adjust parameters, update `window.history.replaceState` smoothly without page reloads, ensuring every URL is an instant shareable permalink.
   - **Local Storage Saved Runs:** Let users save calculation runs locally (`CalcSaveButton`) with zero friction or registration walls.
   - **Branded Excel Retention Hooks:** Include a clean, un-obfuscated hyperlink back to the interactive calculator in all SheetJS `.xlsx` workbook exports.
   - **AI Prompt Exporters (`CalcPromptButton`):** Generate pre-structured executive prompts that borrowers and financial analysts can paste into ChatGPT/Claude for scenario analysis, reinforcing ConvertSheet as their modeling foundation.

---

## 2. Component Design Standards

### A. Dual Numeric & Range Slider Controls
Always pair numeric inputs (`<input type="number">`) with range sliders (`CalcSlider`):
- Sliders provide rapid macro exploration (e.g. testing $300k vs $800k or 7.5% vs 8.5%).
- Numeric text inputs allow exact penny or dollar precision for mortgage underwriters, accountants, and contractors.
- Ensure all sliders have explicit `aria-label` or `ariaLabel` attributes for screen readers to achieve 100% WCAG 2.1 AA compliance.

### B. Sticky Bottom Mobile Summary Bar (<640px)
On mobile viewports, the primary result card often scrolls out of the initial viewport. To eliminate disorientation:
- Render a fixed bottom bar on mobile:
  ```tsx
  <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 shadow-lg flex items-center justify-between">
    <div>
      <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Hourly Wage / Paycheck</span>
      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">$48.08/hr</span>
    </div>
    <button onClick={handleExport} className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-xs">
      Export Excel
    </button>
  </div>
  ```
- Always include bottom padding (`pb-24 sm:pb-0`) on the parent container so inputs and tables are never obscured by the bottom bar.

### C. Dynamic State Serialization (URL Permalink Engine)
Every calculator component implements live browser history synchronization:
```tsx
useEffect(() => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  params.set("annualSalary", annualSalary.toString());
  params.set("hoursPerWeek", hoursPerWeek.toString());
  const query = params.toString();
  const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, "", newUrl);
}, [annualSalary, hoursPerWeek]);
```
This ensures zero page reloads while guaranteeing that whenever a user shares a link via Slack, Teams, WhatsApp, or email, the recipient opens the exact computational model.

### D. One-Tap Formulaic Excel Exports (SheetJS Retention Loop)
All financial exports created via `xlsx` (SheetJS) must embed:
1. Model Title & Date Stamp.
2. Canonical recalculation hyperlink back to ConvertSheet (`https://www.convertsheet.com/tools/...`).
3. Complete parameter breakdown section followed by computational intervals.
4. Active Excel formulas (`=PMT(...)`, `=FV(...)`, `=SUM(...)`) so financial analysts and underwriters can inspect the underlying mechanics in Excel.

### E. Virtual Keyboard & Safe Area Inset Ergonomics (Apple HIG & Android 14)
- Mobile browsers frequently obscure input rows when the soft keyboard opens.
- Bottom summary bars and drawers must utilize CSS `env(safe-area-inset-bottom)`:
  ```tsx
  className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between"
  ```
- Parent containers must provide generous clearance (`pb-28 sm:pb-0`) ensuring that scrollable content, preset pills, and action drawers never collide with the sticky bar or virtual keyboard.

### F. Swipeable Bottom Sheets & Drawers
For multi-field secondary inputs (e.g. saved calculations, advanced tax bracket overrides), employ slide-over drawers or bottom sheets with natural swipe-to-dismiss behavior rather than desktop pop-up modals.

### G. Data Density & Visual Amortization
- Accompany amortization tables with stacked bar or area charts (Equity Paid vs Remaining Balance vs Total Interest).
- Restrict initial table view to 60 rows on client devices to prevent DOM rendering lag, with instant full export to Excel.

### H. Prevent Mobile Auto-Zoom & Touch Target Accessibility (iOS & Android)
- **16px Font Minimum on Inputs:** iOS Safari automatically zooms into the viewport when focusing an `<input>` element with `font-size < 16px`, distorting the mobile layout and hiding navigation controls. Always enforce `text-base` (16px) or larger on interactive text and numeric inputs on mobile viewports (`text-base sm:text-sm`).
- **44px Hit Targets on Micro-Pills:** Quick preset buttons (e.g. `+$50/mo`, `40h FT`, `30 yrs`) must maintain a minimum touch target bounding box of at least 44px (`min-h-[44px] min-w-[44px] touch-manipulation`) regardless of their visual typography size.
- **Accessible Slider Knobs:** Slider thumbs must feature high visual contrast (`border-2 border-emerald-500 bg-white shadow-md`) and explicit `aria-label` tags with numeric values to comply with WCAG 2.1 AA screen reader standards.

### I. Market Rate Freshness Signals & 1-Click Institutional Presets
- Mobile users frequently abandon financial calculators if they suspect interest rates or benchmarks are outdated.
- Prominently display a high-trust, pulsed freshness badge above primary inputs:
  ```tsx
  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
    <span className="font-medium">Updated for October 2026: Top Online HYSAs 4.15%–4.25% APY • 1-Year CDs 4.25%–4.35% APY (Fed Funds Target 3.75%–4.00%)</span>
  </div>
  ```
- Couple the freshness signal with 44px 1-click rate preset buttons (e.g., `[4.15% (Top HYSA)]`, `[4.25% (1-Yr CD)]`, `[3.75% (T-Bill)]`, `[4.50% (Promo APY)]`) so users do not have to manually research or key in current institutional benchmarks.
- For floating debt and mortgage tools, cite the exact regulatory mandate (e.g., October 16, 2026 RBI 99% daily minimum CRR maintenance setting the prime bank home loan floor at 8.15%–8.40%, and Fed FOMC target range at 3.75%–4.00%).

### J. Inflation Erosion & Quantitative Benchmark Visualization
- Financial decision makers require transparency on purchasing power degradation (real vs nominal values).
- When computing long-term investment horizon tools (SIP, retirement, compounding wealth), accompany the nominal future corpus with a prominent **Inflation-Adjusted Purchasing Power** metric (e.g. discounting at ~5.5% baseline CPI inflation).
- For quantitative algorithmic and risk-adjusted tools, pair position sizing with institutional Risk-Free Benchmark presets (3-Month T-Bills at 4.50%, Effective Fed Funds at 3.88%, and 10-Year Treasury Yield at 5.10%) to prevent arbitrary user assumptions and ensure rigor.

### K. Institutional Archetype Scenarios & Direct Mathematical Snippet Ergonomics
- Complex mathematical and multi-variable planning models (Retirement, Percentage, Wage Conversions) often induce decision fatigue when presenting blank or arbitrary defaults.
- **1-Click Demographic & Planning Archetypes:** Couple deep calculators with high-intent 44px archetype cards (e.g., 'Standard 65', 'Early FIRE 50', 'Late Catch-Up 67', 'Conservative 62'). Tapping an archetype instantly configures all 6–8 interrelated parameters to an institutional baseline.
- **Direct Mathematical Snippet Target Formatting:** Ground arithmetic percentage and formulaic tools in direct Google Featured Snippet answer cards that resolve arithmetic search queries (e.g. `0.20*100`, `100 - 20%`, `100 / 0.20`) with plain text equations and immediate visual answers before the full matrix table.
- **Zero-Login Local Persistence (`CalcSaveButton`):** Ensure every financial and percentage calculation run can be locally bookmarked with zero sign-up friction, storing custom scenarios in client-side `localStorage`.

### L. Transparent Formulaic SheetJS Cell Wiring & GSC Query-Targeted Presets
- **Active Mathematical Formulas in Spreadsheets:** Rather than exporting inert static strings, SheetJS exports (`XLSX`) must bind live cell formulas (`{ t: 'n', f: 'B14-B13', v: value }`). This allows users, underwriters, and analysts to inspect the exact compounding, prepayment neutralization, and balance transfer break-even mechanics in Excel while retaining an un-obfuscated link back to ConvertSheet.
- **Organic GSC Position 11 Pre-Emptive Indexing:** Mined search queries ranking in positions 11–20 with high commercial intent (e.g., $150k, $175k, and $225k mortgage payments) must be mapped to dedicated programmatic presets. Each preset includes tailored down payment math, Freddie Mac PMMS benchmark comparisons (7.32% 30-year vs 6.68% 15-year), and structured FAQ schema targeting exact user queries.

---

## 3. Rotational Improvement Tracking
Tracked in `docs/content-inventory.json` under `calculatorAuditQueue`:
- **2026-10-12:** `mortgage-calculator`, `car-loan-calculator`, `home-loan-overdraft-calculator`
- **2026-10-13:** `rate-hike-calculator`, `savings-cd-calculator`, `balance-transfer-calculator`
- **2026-10-14:** `annual-to-hourly-calculator`, `canada-paycheck-calculator`, `salary-calculator`
- **2026-10-15:** `income-tax-calculator`, `emi-calculator`, `sip-calculator`
- **2026-10-16:** `debt-payoff-calculator`, `hourly-to-salary-calculator`, `retirement-calculator`
- **2026-10-16 (18:15 IST Radar Pulse):** `mortgage-calculator` & `car-loan-calculator` (Freddie Mac PMMS 7.40%/6.71% & Experian 2026 6.35%/11.19% rate freshness signals, 44px 1-click rate presets, safe area inset padding on sticky mobile summary bars)
- **2026-10-16 (21:15 IST Radar Pulse):** `savings-cd-calculator`, `rate-hike-calculator`, & `balance-transfer-calculator` (Fed 3.75%–4.00% & RBI 99% CRR rate freshness signals, 44px 1-click rate/deposit/MODT presets, regional savings rate card updates, and safe area inset padding on sticky mobile summary bars)
- **2026-10-17 (18:15 IST Radar Pulse):** `home-loan-overdraft-calculator`, `annual-to-hourly-calculator`, `canada-paycheck-calculator`, and `salary-calculator` (October 2026 RBI Policy 5.50% repo & SBI EBLR 8.15% / MaxGain 8.55% freshness signals, 44px 1-click rate and loan presets, safe-area inset padding on sticky mobile summary bars, and CRA 2026 tax benchmarks)
- **2026-10-17 (22:30 IST Radar Pulse):** `inflation-calculator` (BLS CPI freshness signals, real-time URL query permalink synchronization, 44px preset chips, SheetJS formulaic retention hook, CalcSaveButton, CalcShareButton, CalcPromptButton, and sticky bottom mobile bar with safe area insets)
- **2026-10-18 (Deep Cycle):** `uk-salary-calculator`, `australia-pay-calculator`, and `gst-calculator` (100% Client-Side Zero-Knowledge Privacy Badges, 2026/27 HMRC, 2026 ATO Stage 3, and 2026 GST Council freshness signals, real-time URL query permalink synchronization, dual-slider controls, 44px minimum touch targets, branded SheetJS formulaic .xlsx exports with retention links, and sticky bottom mobile summary bars with safe area insets)
- **2026-10-18 (18:15 IST Radar Pulse):** `discount-calculator`, `margin-calculator`, and `roi-calculator` (100% Client-Side Zero-Knowledge Privacy Badges, 2026 Retail/E-Commerce and Asset Benchmarks freshness signals, real-time URL query permalink synchronization, dual-slider controls, 44px minimum touch targets on all presets, branded SheetJS formulaic .xlsx exports with canonical recalculation links, and sticky bottom mobile summary bars with safe area insets)
- **2026-10-18 (21:50 IST Radar Pulse):** `tip-calculator`, `date-difference-calculator`, and `age-calculator` (100% Client-Side Zero-Knowledge Privacy Badges, 2026 Dining Norms / 2026 Calendar Standards / 2026 SSA & Demographic Benchmarks freshness signals, real-time URL query permalink synchronization, 44px minimum touch targets on all presets, branded SheetJS formulaic .xlsx exports with canonical recalculation links, CalcSaveButton, CalcShareButton, CalcPromptButton, and sticky bottom mobile summary bars with safe area insets)
- **2026-10-19 (Deep Cycle):** `byte-converter`, `unit-converter`, and `bmi-calculator` (100% Client-Side Zero-Knowledge Privacy Badges, 2026 Developer Storage Benchmarks / ISO Unit Standards / WHO & CDC Clinical fresh signals, real-time URL query permalink synchronization, 44px developer and unit conversion touch targets, dual-slider controls, branded SheetJS formulaic .xlsx exports, and sticky bottom mobile summary bars with safe area insets)
- **2026-10-20 (Deep Cycle):** `annual-to-hourly-calculator`, `canada-paycheck-calculator`, and `salary-calculator` (100% Client-Side Zero-Knowledge Privacy Badges, FLSA 2026 / CRA 2026 / IRS 2026 freshness signals, real-time URL query permalink synchronization, 44px minimum touch targets, dual-slider controls, branded SheetJS formulaic .xlsx exports with retention links, CalcSaveButton local persistence, and safe-area inset sticky bottom mobile bars)
- **2026-10-21 (Deep Cycle):** `income-tax-calculator`, `compound-interest-calculator`, and `emi-calculator` (100% Client-Side Zero-Knowledge Privacy Badges, 2026 IRS/India Budget / Freddie Mac PMMS 7.40% & 6.71% / RBI 5.50% repo freshness signals, real-time URL query permalink synchronization, 44px institutional rate and tenure presets, CalcSaveButton zero-login persistence, branded SheetJS formulaic .xlsx exports with canonical recalculation links, and sticky bottom mobile summary bars with safe area insets)
- **2026-10-22 (Deep Cycle):** `sip-calculator`, `debt-payoff-calculator`, and `strategy-risk-calculator` (100% Client-Side Zero-Knowledge Privacy Badges, October 2026 Equity/Debt SIP CAGR 12.0%–14.5% / Fed G.19 24.8%–27.9% CC APR / 3-Month T-Bill 4.50% & 10-Yr 5.10% Treasury freshness signals, real-time URL query permalink synchronization, 44px asset class presets and tenure buttons, inflation-adjusted purchasing power degradation models, 44px APR benchmark chips, 44px quantitative archetype and risk tolerance presets, CalcSaveButton zero-login persistence, formulaic SheetJS .xlsx exports with active model references, and sticky bottom mobile summary bars with safe-area insets)
- **2026-10-23 (Deep Cycle):** `retirement-calculator`, `percentage-calculator`, and `hourly-to-salary-calculator` (100% Client-Side Zero-Knowledge Privacy Badges, October 2026 IRS 401(k) / S&P 500 Historical / Sales Tax / FLSA 2026 & BLS $35.40/hr freshness signals, 1-click 44px retirement archetype presets [Early FIRE 50, Standard 65, Late Catch-Up 67, Conservative 62], CalcSaveButton local persistence deployed to percentage calculator, GSC query-targeted $28/hr presets and FAQs, Freddie Mac PMMS 7.32%/6.68% and 10-Year Treasury 4.95% rate synchronization across core mortgage tools, branded SheetJS formulaic .xlsx exports with canonical recalculation links, and safe-area inset sticky bottom mobile summary bars)
- **2026-10-24 (Deep Cycle):** `rate-hike-calculator` (`interest-rate-hike-calculator`), `savings-cd-calculator` (`high-yield-savings-cd-calculator`), and `balance-transfer-calculator` (`home-loan-balance-transfer-calculator`) (100% Client-Side Zero-Knowledge Privacy Badges, October 24, 2026 Central Bank Policy Rates [Fed Funds 3.75%–4.00%, BoE 3.75%, ECB 2.50%, RBI Repo 5.50% / 99% CRR Mandate] & Freddie Mac PMMS 7.32%/6.68% and 10-Year Treasury 5.00% freshness signals, active transparent SheetJS .xlsx cell formulas [B15=B14-B13, B16=B15*B10*12, dynamic monthly schedules, net switching costs B22=B17-B21] with canonical recalculation URLs, 44px touch targets on all delta, mode, and benchmark presets [4.85% Peak CD, 5.00% 10Y Yield], GSC Position 11 targeted programmatic presets [$150k, $175k, and $225k mortgage payments], CalcSaveButton local persistence, and safe-area inset sticky bottom mobile summary bars)



