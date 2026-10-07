# ConvertSheet Homepage Redesign Specification

**Date:** 2026-10-08  
**Author:** Antigravity (Pair Programming with Product / Engineering)  
**Status:** Design Proposal & Architecture Review  

---

## 1. Executive Summary & Design Vision

ConvertSheet is evolving from a single-purpose utility converter into an **all-in-one private engineering & financial calculation suite**. The redesigned homepage will adopt a **Command Center / Dual Hero** architecture:
1. **Interactive Dual-Mode Command Hero**:
   - A floating segmented controller: **"📁 Universal File Converter"** vs. **"⚡ Financial & Developer Calculators"**.
   - Zero-reload, stateful instant switching.
   - When **File Converter** is selected: Renders the full DuckDB-WASM `DynamicConverterCard` with quick format preset pills (JSON → Excel, CSV → Excel, Parquet → CSV, XML → Excel).
   - When **Calculators & Math** is selected: Renders an active workbench spotlight featuring our flagship financial calculator with 1-click switcher to EMI, Rate Hike, and Balance Transfer.
2. **Instant Search & Command Bar**:
   - Integrated quick-action filter to jump to any of the 45 format converters or 57 tools in under 50ms.
3. **Trending Financial & Mortgage Suite Spotlight**:
   - Highlighted interactive cards for recent rate hike calculators, Home Loan Balance Transfer savings calculator, SIP & EMI tools with live summary outputs and badges.
4. **All Tools & Converters Categorized Matrix**:
   - Unified directory tabs (Spreadsheets, Data Engineering, Financial Math, Developer Utilities, Daily Tools) with clean grid layout and mobile-optimized micro-cards.
5. **Privacy & Security Telemetry Bar**:
   - 100% In-Browser DuckDB WASM, zero server uploads, 0ms queue time.

---

## 2. Component Architecture & Data Flow

```
[src/app/page.tsx] (Server Component with metadata & JSON-LD schema)
  │
  ├── [HomeCommandHero.tsx] ("use client" Dual Hero Controller)
  │     ├── Mode Switcher Pills (File Converter vs Financial & Calculators)
  │     ├── Conditional Active Workspace:
  │     │     ├─ Mode "converter": <DynamicConverterCard config={defaultConverter} />
  │     │     └─ Mode "calculator": <HomeCalculatorSpotlight /> (Rate Hike / Balance Transfer / EMI)
  │     └── Quick Launch Filter Bar (Instant fuzzy query to 102 tools & converters)
  │
  ├── [TrendingFinancialSuite.tsx] (Client/Server Showcase)
  │     ├── Home Loan Balance Transfer Savings (Break-even horizon + MODT auditor)
  │     ├── Interest Rate Hike EMI Impact (+25 bps, +50 bps tenure trap auditor)
  │     ├── SIP & Wealth Compounder
  │     └── Standard Home Loan EMI
  │
  ├── [HomeCatalogGrid.tsx] (Unified Categorized Grid with live filters)
  │     ├── Spreadsheets & Data Engineering (JSON, CSV, Parquet, XML)
  │     ├── Financial & Mortgage Planning (23 Tools)
  │     └── Developer & Daily Utilities (34 Tools)
  │
  └── [ValueProps & PrivacySection.tsx] (Client-side WASM privacy proof, zero data retention)
```

---

## 3. SEO, AEO & Performance Guarantees

- **Core Web Vitals**:
  - Hero retains skeleton fallback for DynamicConverterCard to guarantee LCP < 1.2s and CLS = 0.
  - Zero heavy assets on initial viewport; uses standard Tailwind classes and Lucide SVGs.
- **Structured Data (JSON-LD)**:
  - Generates `WebSite`, `Organization`, and `ItemList` schema pointing to high-converting flagship tools.
- **Canonical & Meta**:
  - Preserves self-canonical `https://www.convertsheet.com/` and OpenGraph tags.
- **Mobile Edge-to-Edge Optimization**:
  - Follows our established mobile design diet: 10–12px micro-typography, compact margins, floating pills, and full responsiveness across 320px–1440px.

---

## 4. Testing & Verification Plan

1. **Unit Tests**:
   - Test `HomeCommandHero` mode toggling between converter and calculator view.
   - Test quick-filter search query filtering across converters and calculators.
   - Test `TrendingFinancialSuite` rendering and quick links.
2. **Integration & Build Tests**:
   - Verify `src/app/__tests__/pages.test.tsx` and homepage route tests.
   - Run `npm test`, `npm run lint`, and `npm run build` with 1,936 static pages prerendering.
