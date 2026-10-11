# ConvertSheet Mobile UI/UX Playbook & Design System

## 1. Core Principles
1. **Thumb-Zone Ergonomics:** Primary actions (calculate, export, preset switches) must live in the lower 60% of the screen.
2. **Minimum Touch Targets:** 44px x 44px minimum (ideally 48px) for buttons, inputs, slider handles, and preset pills.
3. **Instant Tactile Feedback:** Immediate visual update on value change; zero lag between slider dragging and result recalculation.
4. **Zero-Knowledge Privacy Prominence:** Privacy reassurance badge ("100% in-browser, no data leaves your device") clearly visible.

## 2. Component Design Standards
* **Dual Numeric & Slider Inputs:** Always pair a numeric `<input type="number">` with a range slider so users can either type exact values or slide smoothly.
* **Sticky Bottom Mobile Bar:** On viewports under 640px, keep key output metrics (e.g., Monthly EMI, Total Interest) sticky at the bottom with an "Export to Excel" action.
* **Swipeable Bottom Sheets / Drawers:** For complex settings, secondary inputs, and historical comparisons, use bottom sheets rather than bulky nested accordions.
* **Visual Data Breakdowns:** Accompany large tables with intuitive donut charts or stacked bar charts (Principal vs Interest vs Taxes) using accessible color palettes.

## 3. Rotational Improvement Tracking
* Tracked in `docs/content-inventory.json` under `calculatorAuditQueue`.
