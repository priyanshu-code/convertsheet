# SQLite (.db / .sqlite) to Excel & CSV Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 100% in-browser, client-side SQLite database (`.sqlite`, `.db`, `.sqlite3`) to Excel (`.xlsx`) and CSV converter powered by `sql.js` WebAssembly, supporting multi-table workbooks and table selection.

**Architecture:** Install `sql.js` WASM engine to parse SQLite files in-memory without server uploads. An engine class `SqliteToExcelEngine` implements `IConverterEngine`, reading all tables via `sqlite_master`, extracting columns and rows, and exporting each table as a separate named worksheet in a single Excel workbook (or single table to CSV).

**Architecture Diagram:**

```mermaid
graph TD
    subgraph "Input & File Handling"
        A[Upload .sqlite / .db / .sqlite3] --> B[Uint8Array ArrayBuffer]
    end

    subgraph "sql.js WebAssembly SQLite VM"
        B --> C[initSqlJs WASM Module]
        C --> D[new SQL.Database(buffer)]
        D --> E[Query sqlite_master for Tables]
        E --> F[Extract Table 1, Table 2, ... Table N]
    end

    subgraph "Export Generation"
        F --> G[Tabular Preview of Selected Table]
        F --> H[SheetJS XLSX Builder]
        H --> I[Multi-Sheet Excel Workbook: Table 1 -> Sheet 1, Table 2 -> Sheet 2]
        I --> J[Download .xlsx / .csv]
    end
```

**Tech Stack:** TypeScript, Next.js 14, `sql.js` (WASM), SheetJS (`xlsx`), Vitest, Playwright.

---

### Task 1: Install `sql.js` & Build `sqlite-engine.ts`

**Files:**
- Install: `npm install sql.js && npm install -D @types/sql.js`
- Create: `frontend/src/lib/engines/sqlite-engine.ts`
- Create: `frontend/src/lib/engines/__tests__/sqlite-engine.test.ts`
- Modify: `frontend/src/types/converter.ts`
- Modify: `frontend/src/lib/engines/index.ts`

- [ ] **Step 1: Install `sql.js` dependency**
  Run: `npm install sql.js && npm install -D @types/sql.js`
- [ ] **Step 2: Add `"sqlite-to-excel"` to `ConverterEngineId`**
  In `frontend/src/types/converter.ts`.
- [ ] **Step 3: Write failing unit test for `sqliteToExcelEngine`**
  In `frontend/src/lib/engines/__tests__/sqlite-engine.test.ts`:
  - Initialize `sql.js` to build an in-memory SQLite database with 2 tables: `users` (id, name, email) and `orders` (id, user_id, amount).
  - Export binary buffer `db.export()`, wrap in `File`.
  - Test `parsePreview`: extracts table columns and rows.
  - Test `convert`: exports multi-sheet Excel workbook with `users` and `orders` sheets.
- [ ] **Step 4: Implement `SqliteToExcelEngine`**
  In `frontend/src/lib/engines/sqlite-engine.ts`:
  - Loads `sql.js` WASM.
  - Inspects `sqlite_master` for user tables.
  - Converts query results to `TabularData`.
  - Builds multi-sheet `.xlsx` workbook using SheetJS with auto column widths.
- [ ] **Step 5: Register engine in `src/lib/engines/index.ts`**
  Register `"sqlite-to-excel": sqliteToExcelEngine`.
- [ ] **Step 6: Run test to verify pass**
  Run: `npm test src/lib/engines/__tests__/sqlite-engine.test.ts`.
- [ ] **Step 7: Commit**
  ```bash
  git add frontend/package.json frontend/package-lock.json frontend/src/types/converter.ts frontend/src/lib/engines/
  git commit -m "feat(engine): add sql.js wasm sqlite to excel parsing engine"
  ```

---

### Task 2: Register `"sqlite-to-excel"` in Converter Registry & SEO

**Files:**
- Modify: `frontend/src/lib/registry.ts`
- Modify: `frontend/src/lib/__tests__/registry.test.ts`
- Modify: `frontend/src/components/home/__tests__/ConverterGrid.test.tsx`
- Modify: `frontend/src/app/convert/[slug]/__tests__/page.test.tsx`

- [ ] **Step 1: Write test for `"sqlite-to-excel"` registry config**
  Verify `getConverterBySlug("sqlite-to-excel")` returns valid config with source format `"SQLite"`, target format `"Excel"`, and extensions `.sqlite`, `.db`, `.sqlite3`.
- [ ] **Step 2: Register `"sqlite-to-excel"` in `CONVERTER_REGISTRY`**
  - Category: `"data-engineering"`
  - Badge: `"WASM Database"`
  - Title: `"Convert SQLite (.db / .sqlite) to Excel (.xlsx) Online - Fast & Private"`
  - HowTo: 3 steps (upload database, preview tables, download multi-sheet Excel).
  - 5 targeted FAQs addressing privacy, multi-table databases, large database files, and viewing tables.
- [ ] **Step 3: Run unit tests**
  Run: `npm test src/lib/__tests__/registry.test.ts`
- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/lib/registry.ts frontend/src/lib/__tests__/registry.test.ts frontend/src/components/home/__tests__/ConverterGrid.test.tsx frontend/src/app/convert/[slug]/__tests__/page.test.tsx
  git commit -m "feat(registry): register sqlite-to-excel converter"
  ```

---

### Task 3: Table Selection & Multi-Table UX

**Files:**
- Modify: `frontend/src/types/converter.ts` (allow `tableNames?: string[]` and `selectedTable?: string` in `ConversionOptions` or `TabularData`)
- Modify: `frontend/src/components/converter/DataPreviewTable.tsx` (add table switcher tab/select if multiple tables exist)
- Test: `frontend/src/components/converter/__tests__/components.test.tsx`

- [ ] **Step 1: Add table switching support in preview**
  If `preview.metadata?.tables` contains multiple tables, show an intuitive pill tab bar or dropdown allowing user to switch preview between tables before converting.
- [ ] **Step 2: Run unit tests**
  Run: `npm test`
- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/types/ frontend/src/components/converter/
  git commit -m "feat(ui): add multi-table switcher for sqlite database preview"
  ```

---

### Task 4: E2E Verification & Integration Tests

**Files:**
- Create: `frontend/e2e/sqlite-converter.spec.ts`
- Run: `npm run test:e2e`
- Run: `npm run build`

- [ ] **Step 1: Create Playwright E2E spec**
  - Check `/convert/sqlite-to-excel` availability, 200 OK, no 404, valid SEO tags.
  - Check `/embed/sqlite-to-excel` clean iframe rendering with attribution link.
- [ ] **Step 2: Run test suites**
  Run: `npm run test:e2e` and `npm test`
- [ ] **Step 3: Run production build**
  Run: `npm run build`
- [ ] **Step 4: Commit & Push to Main**
  ```bash
  git add . && git commit -m "feat: complete sqlite to excel converter with wasm engine" && git push origin main
  ```
