# ConvertSheet Mobile UI/UX Playbook & Design System

## 1. Core Principles & Research Foundation
Grounded in empirical ergonomics from the Nielsen Norman Group (NN/g), Apple Human Interface Guidelines (HIG), and Google Material Design 3:

1. **Thumb-Zone Ergonomics:** 
   - 82%+ of smartphone users operate devices one-handed or with index-finger support.
   - The "Natural Thumb Zone" occupies the lower 50–60% of the screen. Primary levers (calculate, preset pills, currency toggles, export buttons) MUST live inside this zone.
   - Danger zone: Top-left and top-right navigation triggers are out of reach for comfortable single-handed operation.
2. **Minimum Touch Targets:**
   - Apple HIG specifies **44px x 44px** absolute minimum touch bounding boxes.
   - Google Material 3 specifies **48px x 48px** with at least 8px separation between adjacent interactive targets.
   - Even if visual pills render at 32px height, the hit area or padding (`py-2 sm:py-1 px-3`, `min-h-[44px]`) must guarantee zero mis-taps.
3. **Instant Tactile Feedback:**
   - Visual and mathematical recalculation must execute in <16ms (60fps) upon every slider drag or numeric stroke.
   - Zero artificial loading spinners on client-side calculators.
4. **Zero-Knowledge Privacy Prominence:**
   - Clear visual reassurance badge ("100% Client-Side • No server data transfer • Private & Free Forever") prominently displayed on tool hero headers.
5. **Repeat Usage Habit Loops:**
   - **Real-Time URL Query Serialization:** As users slide values or adjust parameters, update `window.history.replaceState` smoothly without page reloads, ensuring every URL is an instant shareable permalink.
   - **Local Storage Saved Runs:** Let users save calculation runs locally (`CalcSaveButton`) with zero friction or registration walls.
   - **Branded Excel Retention Hooks:** Include a clean, un-obfuscated hyperlink back to the interactive calculator in all SheetJS `.xlsx` workbook exports.

---

## 2. Component Design Standards

### A. Dual Numeric & Range Slider Controls
Always pair numeric inputs (`<input type="number">`) with range sliders (`CalcSlider`):
- Sliders provide rapid macro exploration (e.g. testing $300k vs $800k).
- Numeric text inputs allow exact penny or dollar precision for mortgage underwriters and contractors.

### B. Sticky Bottom Mobile Summary Bar (<640px)
On mobile viewports, the primary result card often scrolls out of the initial viewport. To eliminate disorientation:
- Render a fixed bottom bar on mobile:
  ```tsx
  <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 shadow-lg flex items-center justify-between">
    <div>
      <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Monthly Payment</span>
      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">$2,450/mo</span>
    </div>
    <button onClick={handleExport} className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl">
      Export Excel
    </button>
  </div>
  ```
- Include padding `pb-20` on the main container so content is never obscured by the bottom bar.

### C. Swipeable Bottom Sheets & Drawers
For multi-field secondary inputs (e.g. saved calculations, advanced tax bracket overrides), employ slide-over drawers or bottom sheets with natural swipe-to-dismiss behavior rather than desktop pop-up modals.

### D. Data Density & Visual Amortization
- Accompany amortization tables with stacked bar or area charts (Equity Paid vs Remaining Balance vs Total Interest).
- Restrict initial table view to 60 rows on client devices to prevent DOM rendering lag, with instant full export to Excel.

---

## 3. Rotational Improvement Tracking
Tracked in `docs/content-inventory.json` under `calculatorAuditQueue`. Each rotation upgrades 2–3 pending calculators to conform with this playbook, accompanied by unit tests.
