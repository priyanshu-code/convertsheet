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

### E. Swipeable Bottom Sheets & Drawers
For multi-field secondary inputs (e.g. saved calculations, advanced tax bracket overrides), employ slide-over drawers or bottom sheets with natural swipe-to-dismiss behavior rather than desktop pop-up modals.

### F. Data Density & Visual Amortization
- Accompany amortization tables with stacked bar or area charts (Equity Paid vs Remaining Balance vs Total Interest).
- Restrict initial table view to 60 rows on client devices to prevent DOM rendering lag, with instant full export to Excel.

---

## 3. Rotational Improvement Tracking
Tracked in `docs/content-inventory.json` under `calculatorAuditQueue`:
- **2026-10-12:** `mortgage-calculator`, `car-loan-calculator`, `home-loan-overdraft-calculator`
- **2026-10-13:** `rate-hike-calculator`, `savings-cd-calculator`, `balance-transfer-calculator`
- **2026-10-14:** `annual-to-hourly-calculator`, `canada-paycheck-calculator`, `salary-calculator`
