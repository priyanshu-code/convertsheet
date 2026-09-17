# Feature Specification: SQLite (.db / .sqlite) to Excel & CSV Converter

## 1. Overview & Problem
Developers, data analysts, mobile engineers (iOS CoreData/Android Room), and software teams regularly need to inspect `.sqlite`, `.sqlite3`, or `.db` database files. Currently, converting an SQLite database file to an Excel spreadsheet or CSV requires installing native desktop apps (like DB Browser for SQLite) or uploading private database files to sketchy third-party cloud servers.

ConvertSheet will provide a **100% in-browser, zero-upload SQLite to Excel & CSV converter and table explorer** powered by `sql.js` (WebAssembly SQLite compiled with Emscripten) and SheetJS.

## 2. Key Capabilities & User Experience
1. **File Input**:
   - Accepts `.sqlite`, `.db`, `.sqlite3`, `.db3`, `.sqlitedb`.
   - Native drag-and-drop, file browsing, and clipboard file paste.
2. **Multi-Table Detection & Selection**:
   - Reads SQLite schema (`sqlite_master`) to find all user tables and views.
   - If a database has multiple tables (e.g. `users`, `orders`, `products`), user can:
     - **Export All Tables into One Multi-Sheet Excel Workbook** (each SQLite table becomes an Excel sheet tab).
     - **Select a specific table** to preview and export as a single `.xlsx` or `.csv`.
3. **Data Preview**:
   - Interactive table selector dropdown showing table name and row counts.
   - Clean tabular preview of the first 10-50 rows of the selected table.
4. **Export Outputs**:
   - Microsoft Excel (`.xlsx`): Multi-sheet workbook for multiple tables, or single sheet.
   - CSV (`.csv`): Download individual table as CSV.
   - JSON (`.json`): Download table records as array of JSON objects.

## 3. Technical Architecture
### Package: `sql.js` (WASM SQLite engine)
- Standard, battle-tested WebAssembly build of SQLite.
- Loads `sql-wasm.wasm` via CDN (like DuckDB-Wasm) or Next.js static asset.
- In-memory database initialization from `Uint8Array` buffer.
- Query API:
  - `db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")`
  - `db.exec("SELECT * FROM table_name LIMIT 50")`
  - Row counting and schema extraction.

### Engine: `src/lib/engines/sqlite-engine.ts`
- Implements `IConverterEngine`:
  - `parsePreview(file: File, maxRows?: number)`:
    - Reads `.sqlite` buffer into `sql.js` WASM.
    - Extracts table names. Defaults to first table for preview.
    - Returns columns and preview rows.
  - `convert(file: File, options?: ConversionOptions)`:
    - If multi-table: queries all tables and appends each table as a sheet in an Excel workbook (`XLSX.utils.book_append_sheet`).
    - Sets auto column widths.
    - Returns `.xlsx` Blob.

## 4. Registry & SEO Integration
- **Slug**: `sqlite-to-excel` (with aliases `sqlite-to-csv`, `db-to-excel`)
- **Metadata**: Target high-intent queries: "convert sqlite to excel online", "sqlite to xlsx free", "open .db file in excel without upload".
- **Category**: `"data-engineering"` (or `"spreadsheets"`).
- **Embed Support**: Universal embed widget `/embed/sqlite-to-excel`.

## 5. Verification Plan
- Unit tests with a programmatically generated binary SQLite database containing multiple tables, numbers, strings, and NULLs.
- Test multi-sheet Excel export where table A is Sheet 1 and table B is Sheet 2.
- E2E Playwright test verifying `/convert/sqlite-to-excel` and `/embed/sqlite-to-excel`.
