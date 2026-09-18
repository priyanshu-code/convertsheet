# JSON to NDJSON & JSON Schema Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy two high-demand developer converters — **JSON to NDJSON / JSONL** and **JSON to JSON Schema (Draft-07)** — with in-browser parsing, dual-pane split input (paste + file drop), schema inference, and full SEO/embed support.

**Architecture:** We implement two lightweight, zero-cloud client engines (`ndjson-schema-engine.ts`) conforming to `IConverterEngine`. A reusable `SplitJsonInput.tsx` UI provides immediate paste-and-validate superpowers. Both converters are registered into `CONVERTER_REGISTRY`, automatically unlocking `/convert/[slug]` and `/embed/[slug]` routes.

**Architecture Diagram:**

```mermaid
graph TD
    subgraph "Input Layer"
        UI[SplitJsonInput.tsx]
        Drop[Dropzone]
        Paste[Paste Textarea]
        Drop --> UI
        Paste --> UI
    end

    subgraph "Engine Layer"
        UI -->|json-to-ndjson| E1[JsonToNdjsonEngine]
        UI -->|json-to-schema| E2[JsonToSchemaEngine]
        E1 --> O1[application/x-ndjson Blob]
        E2 --> O2[application/schema+json Blob]
    end

    subgraph "Routing & SEO Layer"
        R[registry.ts] --> C1[/convert/json-to-ndjson]
        R --> C2[/convert/json-to-schema]
        R --> Em1[/embed/json-to-ndjson]
        R --> Em2[/embed/json-to-schema]
    end
```

**Tech Stack:** TypeScript, Next.js 15 (App Router), Tailwind CSS, React, Vitest, Playwright.

---

### Task 1: Parser Engines & Types (`ndjson-schema-engine.ts`)

**Files:**
- Create: `frontend/src/lib/engines/ndjson-schema-engine.ts`
- Create: `frontend/src/lib/engines/__tests__/ndjson-schema-engine.test.ts`
- Modify: `frontend/src/types/converter.ts`
- Modify: `frontend/src/lib/engines/index.ts`

- [ ] **Step 1: Update `ConverterEngineId`**
  In `frontend/src/types/converter.ts`, add `"json-to-ndjson"` and `"json-to-schema"` to `ConverterEngineId`.

- [ ] **Step 2: Write failing unit tests**
  In `frontend/src/lib/engines/__tests__/ndjson-schema-engine.test.ts`, test:
  - `JsonToNdjsonEngine`:
    - Top-level array of objects -> parses preview columns & rows.
    - Top-level object containing array (`{ items: [...] }`) -> parses correctly.
    - Convert produces valid newline-separated JSON records.
    - `flattenNested` option flattens nested object keys.
  - `JsonToSchemaEngine`:
    - Inferred schema properties (`string`, `number`, `integer`, `boolean`, `array`, `object`).
    - Tabular preview columns: `["Property", "Type", "Required", "Sample Value"]`.
    - Convert produces valid Draft-07 JSON Schema document with `$schema`, `properties`, and `required`.

- [ ] **Step 3: Run test to verify failure**
  Run `npm test src/lib/engines/__tests__/ndjson-schema-engine.test.ts`.

- [ ] **Step 4: Implement `ndjson-schema-engine.ts`**
  Implement `JsonToNdjsonEngine` and `JsonToSchemaEngine`. Export singletons `jsonToNdjsonEngine` and `jsonToSchemaEngine`.

- [ ] **Step 5: Register in `engines/index.ts`**
  Register `"json-to-ndjson"` and `"json-to-schema"` in `ENGINES` map.

- [ ] **Step 6: Run tests and commit**
  Run `npm test src/lib/engines/__tests__/ndjson-schema-engine.test.ts`.
  Commit with: `"feat(engine): add json to ndjson and json schema generator engines"`

---

### Task 2: Registry & Programmatic SEO Configuration

**Files:**
- Modify: `frontend/src/lib/registry.ts`
- Modify: `frontend/src/lib/__tests__/registry.test.ts`
- Modify: Downstream test suites (`page.test.tsx`, `ConverterGrid.test.tsx`) for total count 19.

- [ ] **Step 1: Write failing registry tests**
  In `frontend/src/lib/__tests__/registry.test.ts`, assert `json-to-ndjson` and `json-to-schema` exist, belong to `data-engineering`, have valid extensions, 3-step `howTo`, and 5 FAQs.

- [ ] **Step 2: Run test to verify failure**
  Run `npm test src/lib/__tests__/registry.test.ts`.

- [ ] **Step 3: Register in `CONVERTER_REGISTRY`**
  Register both configurations in `src/lib/registry.ts`.

- [ ] **Step 4: Update downstream test assertions**
  Update total converter counts from 17 to 19 (data-engineering from 8 to 10).

- [ ] **Step 5: Run tests and commit**
  Run `npm test`.
  Commit with: `"feat(registry): register json-to-ndjson and json-to-schema converters"`

---

### Task 3: Split Dual-Pane Input Component (`SplitJsonInput.tsx`)

**Files:**
- Create: `frontend/src/components/converter/SplitJsonInput.tsx`
- Create: `frontend/src/components/converter/__tests__/SplitJsonInput.test.tsx`
- Modify: `frontend/src/components/converter/ConverterCard.tsx`

- [ ] **Step 1: Write unit tests for SplitJsonInput**
  Verify textarea typing, sample JSON loader button, character counter, JSON syntax validation error badge, and drag-and-drop file select.

- [ ] **Step 2: Run test to verify failure**
  Run `npm test src/components/converter/__tests__/SplitJsonInput.test.tsx`.

- [ ] **Step 3: Implement `SplitJsonInput.tsx`**
  Build the dual-pane UI with clean Tailwind styles and sample data helper.

- [ ] **Step 4: Wire into `ConverterCard.tsx`**
  Show `SplitJsonInput` when `config.slug === "json-to-ndjson" || config.slug === "json-to-schema"`.

- [ ] **Step 5: Run tests and commit**
  Run `npm test`.
  Commit with: `"feat(ui): add split json paste and dropzone input component"`

---

### Task 4: E2E Playwright Tests & Verification

**Files:**
- Create: `frontend/e2e/json-ndjson-schema.spec.ts`

- [ ] **Step 1: Implement E2E Playwright tests**
  - Test `/convert/json-to-ndjson`: Page loads, paste sample JSON, verify preview records, verify convert download button enabled.
  - Test `/convert/json-to-schema`: Page loads, upload JSON file, verify schema preview properties table, verify download.
  - Test `/embed/json-to-ndjson` & `/embed/json-to-schema`: Verify iframe mode hides Navbar and Footer with attribution link.

- [ ] **Step 2: Run E2E and Unit test suites**
  - Run `npm test`
  - Run `CI=1 npm run test:e2e`
  - Run `npm run build`

- [ ] **Step 3: Commit and push**
  Commit with: `"test(e2e): add playwright tests for json to ndjson and json schema converters"`.
  Push to `origin/main`.
