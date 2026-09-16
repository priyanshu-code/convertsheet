import { ToolConfig } from "@/types/tool";

export const WORKBENCH_TOOLS: Record<string, ToolConfig> = {
  "sql-query-studio": {
    slug: "sql-query-studio",
    name: "In-Browser SQL Query Studio",
    category: "data-developer",
    title: "In-Browser SQL Query Studio - DuckDB WebAssembly Query Runner",
    subtitle: "Run lightning-fast analytical SQL queries directly against CSV, Parquet, Excel, and JSON files inside browser RAM with zero server uploads.",
    metaDescription: "Free in-browser SQL query runner powered by DuckDB-Wasm. Query CSV, Parquet, Excel, and JSON files with full SQL syntax and export results instantly.",
    answerSummary: "Execute analytical SQL queries directly on CSV, Parquet, and Excel files inside your browser using DuckDB-Wasm, with sub-second execution and zero data leakage.",
    badge: "DuckDB-Wasm",
    featured: true,
    keywords: [
      "sql query runner",
      "duckdb wasm online",
      "query csv with sql",
      "parquet sql runner",
      "browser sql studio",
      "offline sql query",
      "excel sql query tool",
    ],
    formulaDescription:
      "Executes SQL queries compiled to WebAssembly via DuckDB's vectorized columnar execution engine directly inside a Web Worker thread.",
    about:
      "Analyzing confidential business datasets, customer dumps, or multi-gigabyte log extracts usually requires spinning up local databases or uploading sensitive files to cloud SaaS platforms. ConvertSheet's In-Browser SQL Studio changes that paradigm by embedding DuckDB WebAssembly directly into your browser. You can drag and drop massive CSV, Parquet, JSON, or Excel files, run complex aggregations, joins, filters, and window functions, and export the resulting datasets to CSV or Excel with complete data privacy.",
    howTo: [
      {
        step: 1,
        title: "Drop or Select Data File",
        description:
          "Drop any CSV, Parquet, Excel (.xlsx), or JSON file to register it as an in-memory table named 'data_table'.",
      },
      {
        step: 2,
        title: "Write or Choose SQL Query",
        description:
          "Write any standard SQL query or click one of the quick presets (Limit 50, Count Rows, Summarize Stats).",
      },
      {
        step: 3,
        title: "Execute & Export",
        description:
          "Press Cmd/Ctrl + Enter to run the query in milliseconds, inspect results, and download as CSV or Excel.",
      },
    ],
    faqs: [
      {
        question: "Is my data uploaded to any server when running SQL queries?",
        answer:
          "No. All execution occurs 100% client-side inside a DuckDB WebAssembly virtual machine running directly in your browser's memory. No data is ever sent to any remote server.",
      },
      {
        question: "What SQL dialect does this studio support?",
        answer:
          "It supports DuckDB's full PostgreSQL-compatible SQL dialect, including CTEs (WITH clauses), window functions, regular expressions, and nested JSON operators.",
      },
    ],
    relatedConverters: ["csv-to-excel", "parquet-to-excel", "json-to-excel"],
    relatedTools: ["sheet-diff-checker", "data-anonymizer-cleaner"],
  },

  "sheet-diff-checker": {
    slug: "sheet-diff-checker",
    name: "Spreadsheet & File Diff Checker",
    category: "data-developer",
    title: "Spreadsheet & CSV Diff Checker - Compare Excel Files Online",
    subtitle: "Compare two CSV or Excel spreadsheets side by side. Visually inspect added rows, deleted records, and changed cell values in color.",
    metaDescription: "Free online spreadsheet diff tool. Compare two CSV or Excel files cell-by-cell with visual color-coded changes and downloadable diff summary reports.",
    answerSummary: "Compare two spreadsheets cell-by-cell in your browser, highlighting additions (green), removals (red), and modified values (amber) with zero file uploads.",
    badge: "SheetJS Engine",
    featured: true,
    keywords: [
      "spreadsheet diff",
      "excel file compare online",
      "csv diff tool",
      "compare two excel sheets",
      "excel difference checker",
      "sheet compare free",
    ],
    formulaDescription:
      "Performs cell-by-cell matrix comparison across aligned row indices and column headers, computing value transitions (old ➔ new) and set differences.",
    about:
      "Comparing revisions of financial models, inventory sheets, price lists, or customer registries usually requires manual eyeball checks or complex VLOOKUP formulas. ConvertSheet's Spreadsheet & File Diff Checker automates this comparison entirely in your browser. Simply drop File A (the original version) and File B (the modified version) to receive an instant visual diff report highlighting changes in color, with quick filters to focus on modified rows and 1-click Excel summary export.",
    howTo: [
      {
        step: 1,
        title: "Upload Original File (A)",
        description:
          "Drop or select the baseline CSV or Excel spreadsheet into the File A slot.",
      },
      {
        step: 2,
        title: "Upload Modified File (B)",
        description:
          "Drop or select the updated or revision spreadsheet into the File B slot.",
      },
      {
        step: 3,
        title: "Inspect Visual Changes & Export",
        description:
          "Toggle between 'Changes Only' and 'All Rows', view inline value transitions, and export the diff summary to Excel.",
      },
    ],
    faqs: [
      {
        question: "How does the diff tool match rows between two files?",
        answer:
          "It compares rows based on sequential row indices and matching column headers, tracking exact cell value discrepancies.",
      },
      {
        question: "Can I compare a CSV file against an Excel (.xlsx) file?",
        answer:
          "Yes! You can compare any combination of CSV, TSV, and Excel (.xlsx, .xls) files seamlessly.",
      },
    ],
    relatedConverters: ["csv-to-excel", "excel-to-csv"],
    relatedTools: ["sql-query-studio", "data-anonymizer-cleaner"],
  },

  "data-anonymizer-cleaner": {
    slug: "data-anonymizer-cleaner",
    name: "Client-Side Data Cleaner & PII Anonymizer",
    category: "data-developer",
    title: "Client-Side Data Cleaner & PII Anonymizer - Mask Sensitive Data Online",
    subtitle: "Mask customer emails, phone numbers, credit cards, and SSNs in CSV and Excel spreadsheets before sharing or training AI models. 100% private.",
    metaDescription: "Free client-side data cleaner and PII anonymizer. Mask emails, phone numbers, credit card numbers, and SSNs in CSV/Excel files with zero cloud uploads.",
    answerSummary: "Clean and anonymize customer PII, mask emails and phone numbers, deduplicate rows, and normalize dates in CSV/Excel files 100% offline in your browser.",
    badge: "Enterprise Security",
    featured: true,
    keywords: [
      "data anonymizer online",
      "pii masking tool",
      "mask emails in csv",
      "redact sensitive data excel",
      "client side data cleaner",
      "sanitize dataset for ai",
      "gdpr compliant data scrubber",
    ],
    formulaDescription:
      "Applies deterministic regex transformations to detect and replace PII tokens (RFC 5322 emails, E.164 phones, Luhn-pattern credit cards, SSNs) with masked hashes.",
    about:
      "When sharing real-world datasets with third-party vendors, overseas teams, or generative AI models, exposing Personally Identifiable Information (PII) violates GDPR, CCPA, and HIPAA compliance regulations. ConvertSheet's Client-Side Data Cleaner & PII Anonymizer allows security, compliance, and analytics teams to scrub sensitive fields directly inside their local browser environment without uploading confidential data to external servers.",
    howTo: [
      {
        step: 1,
        title: "Upload Dataset",
        description:
          "Drop your CSV or Excel file to load the raw records into browser memory.",
      },
      {
        step: 2,
        title: "Configure Anonymization Rules",
        description:
          "Check the rules you want to apply: Mask Emails, Mask Phones, Redact Credit Cards/SSNs, Normalize Dates, or Remove Duplicates.",
      },
      {
        step: 3,
        title: "Preview & Download Cleaned Dataset",
        description:
          "Inspect the live Cleaned vs Raw preview and download the sanitized file as CSV or Excel.",
      },
    ],
    faqs: [
      {
        question: "Is this tool safe for HIPAA or GDPR protected data?",
        answer:
          "Yes. Because 100% of data processing occurs in your browser RAM without network transmission, no protected health information (PHI) or personal data ever leaves your computer.",
      },
      {
        question: "Does the anonymization preserve domain names in email addresses?",
        answer:
          "Yes. It masks the username portion (e.g. j***h@company.org) while retaining the email domain for demographic and company analysis.",
      },
    ],
    relatedConverters: ["csv-to-excel", "excel-to-json"],
    relatedTools: ["sql-query-studio", "sheet-diff-checker"],
  },
};
