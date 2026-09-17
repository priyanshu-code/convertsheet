import { ConverterConfig } from "@/types/registry";

export const CONVERTER_REGISTRY = {
  "json-to-excel": {
    slug: "json-to-excel",
    sourceFormat: "JSON",
    targetFormat: "Excel",
    sourceExtension: ".json",
    targetExtension: ".xlsx",
    acceptedMimeTypes: ["application/json", "text/json"],
    category: "spreadsheets",
    title: "Convert JSON to Excel Online - Fast, Free & Private",
    subtitle:
      "Transform JSON data, nested objects, and API arrays into formatted Microsoft Excel (.xlsx) spreadsheets instantly in your browser.",
    metaDescription:
      "Free online JSON to Excel converter. Cleanly flattens nested objects and arrays into structured XLSX worksheets with zero data uploaded to external servers.",
    engineId: "json-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Popular",
    howTo: [
      {
        step: 1,
        title: "Upload JSON File",
        description:
          "Select or drag and drop your .json file into the upload dropzone.",
      },
      {
        step: 2,
        title: "Preview & Configure",
        description:
          "Inspect the parsed tabular preview with automatically flattened object columns and custom sheet naming.",
      },
      {
        step: 3,
        title: "Download Excel Spreadsheet",
        description:
          "Click 'Convert & Download' to immediately save your native .xlsx file to your device.",
      },
    ],
    faqs: [
      {
        question: "Is my JSON data uploaded to any remote server?",
        answer:
          "No. The conversion executes entirely in your browser using client-side JavaScript. Your data never leaves your computer.",
      },
      {
        question: "How does ConvertSheet handle nested JSON objects and arrays?",
        answer:
          "Our engine flattens nested objects using dot-notation column headers (e.g. user.profile.name) and turns array items into structured rows, preserving all data relationships.",
      },
      {
        question: "What is the maximum JSON file size supported in the browser?",
        answer:
          "Client-side conversion smoothly handles JSON files up to 10MB (typically tens of thousands of rows). For massive datasets, our background processing tier is available.",
      },
      {
        question: "Can I convert an array of JSON objects directly to Excel?",
        answer:
          "Yes. Both top-level arrays of objects and nested data arrays are automatically recognized and converted into tabular rows with clean column headers.",
      },
    ],
  },

  "xml-to-excel": {
    slug: "xml-to-excel",
    sourceFormat: "XML",
    targetFormat: "Excel",
    sourceExtension: ".xml",
    targetExtension: ".xlsx",
    acceptedMimeTypes: ["application/xml", "text/xml"],
    category: "spreadsheets",
    title: "Convert XML to Excel Online (.xlsx) - Fast In-Browser Tool",
    subtitle:
      "Parse XML trees, feeds, and attribute structures into clean, multi-column Excel workbooks without installing software.",
    metaDescription:
      "Convert XML files to Excel spreadsheets (.xlsx) online for free. Automatically detects XML record repeating nodes and converts attributes into structured spreadsheet columns.",
    engineId: "xml-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Fast",
    howTo: [
      {
        step: 1,
        title: "Select XML Document",
        description:
          "Drop your XML dataset, RSS/Atom feed, or ERP export file into the upload area.",
      },
      {
        step: 2,
        title: "Verify Table Columns",
        description:
          "Preview the extracted rows and columns with automatic XML attribute unrolling and value formatting.",
      },
      {
        step: 3,
        title: "Export to XLSX",
        description:
          "Generate and download an official Microsoft Excel .xlsx workbook with preserved headers and numeric formatting.",
      },
    ],
    faqs: [
      {
        question: "Does this XML to Excel converter support XML attributes?",
        answer:
          "Yes. XML attributes (e.g. <item id='123' category='tools'>) are unrolled into distinct spreadsheet columns prefixed with @_ so no metadata is lost.",
      },
      {
        question: "Will large enterprise XML exports convert reliably?",
        answer:
          "Yes. Our streaming XML parser parses repeat nodes directly into memory and handles files up to 10MB in your browser.",
      },
      {
        question: "Are there any privacy risks when converting sensitive business XML?",
        answer:
          "None. Processing happens 100% locally in your web browser. Neither our servers nor third parties can view your XML payload.",
      },
    ],
  },

  "csv-to-excel": {
    slug: "csv-to-excel",
    sourceFormat: "CSV",
    targetFormat: "Excel",
    sourceExtension: ".csv",
    targetExtension: ".xlsx",
    acceptedMimeTypes: ["text/csv", "application/csv", "text/plain"],
    category: "spreadsheets",
    title: "Convert CSV to Excel Online (.xlsx) - Auto-Delimiter Detection",
    subtitle:
      "Convert CSV comma, semicolon, tab, and pipe-delimited text files into authentic Microsoft Excel spreadsheets.",
    metaDescription:
      "Free online CSV to Excel converter. Auto-detects delimiters (comma, semicolon, tab), preserves leading zeros and dates, and outputs clean .xlsx workbooks.",
    engineId: "csv-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Instant",
    howTo: [
      {
        step: 1,
        title: "Upload CSV File",
        description:
          "Drag and drop any .csv, .tsv, or text file into the converter box.",
      },
      {
        step: 2,
        title: "Auto-Detect Delimiters",
        description:
          "Our engine automatically detects whether your CSV uses commas, semicolons, tabs, or pipes and prepares a preview.",
      },
      {
        step: 3,
        title: "Download Clean Excel File",
        description:
          "Save the formatted .xlsx file to your device with proper column data types and header styling.",
      },
    ],
    faqs: [
      {
        question: "Does the CSV to Excel converter preserve leading zeros?",
        answer:
          "Yes! Unlike standard Excel imports that convert postal codes like '01234' to 1234, ConvertSheet explicitly preserves leading zeros as text cells.",
      },
      {
        question: "What delimiters are supported?",
        answer:
          "Comma (,), Semicolon (;), Tab (\\t), Pipe (|), and custom single-character delimiters are supported with automatic detection.",
      },
      {
        question: "Can I convert large CSV exports from databases?",
        answer:
          "Yes. Files up to 10MB convert in under 200ms in your browser. For multi-gigabyte exports, our ConvertSheet Pro tier provides chunked streaming.",
      },
    ],
  },

  "excel-to-json": {
    slug: "excel-to-json",
    sourceFormat: "Excel",
    targetFormat: "JSON",
    sourceExtension: ".xlsx",
    additionalExtensions: [".xls"],
    targetExtension: ".json",
    acceptedMimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
    category: "spreadsheets",
    title: "Convert Excel to JSON Online (.xlsx to .json) - Array of Objects",
    subtitle:
      "Transform Excel spreadsheets (.xlsx and .xls) into clean, API-ready JSON arrays of objects with optional prettified indentation.",
    metaDescription:
      "Convert Excel to JSON online for free. Extracts XLSX and XLS worksheet rows into JSON arrays of objects with zero data retention and instant client-side download.",
    engineId: "excel-to-json",
    isClientSide: true,
    featured: true,
    badge: "Developer Favorite",
    howTo: [
      {
        step: 1,
        title: "Upload Excel Spreadsheet",
        description:
          "Select or drop any .xlsx or .xls file from your computer or phone.",
      },
      {
        step: 2,
        title: "Preview & Choose Options",
        description:
          "Inspect table columns and choose whether to format JSON with pretty indentation (2 spaces) or minified payload.",
      },
      {
        step: 3,
        title: "Download JSON File",
        description:
          "Instantly download your validated .json array ready for database seeding, web development, or REST API use.",
      },
    ],
    faqs: [
      {
        question: "How does the Excel to JSON converter map columns?",
        answer:
          "The first row of your worksheet is treated as object keys, and each subsequent row becomes an object in a JSON array: [{ column1: val1, column2: val2 }].",
      },
      {
        question: "Can I select which sheet to convert from a multi-sheet workbook?",
        answer:
          "By default, the first worksheet is parsed. You can specify custom sheet names in the options panel before downloading.",
      },
      {
        question: "Are numbers, booleans, and dates typed properly in the JSON output?",
        answer:
          "Yes. Excel numeric and boolean cells remain native JSON numbers and booleans rather than being coerced to strings.",
      },
    ],
  },

  "excel-to-csv": {
    slug: "excel-to-csv",
    sourceFormat: "Excel",
    targetFormat: "CSV",
    sourceExtension: ".xlsx",
    additionalExtensions: [".xls"],
    targetExtension: ".csv",
    acceptedMimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
    category: "spreadsheets",
    title: "Convert Excel to CSV Online (.xlsx to .csv) - UTF-8 Compliant",
    subtitle:
      "Export Excel workbooks (.xlsx, .xls) to clean UTF-8 comma-separated value (CSV) text files with proper quoting.",
    metaDescription:
      "Free online Excel to CSV converter. Converts XLSX and legacy XLS spreadsheets to UTF-8 CSV with custom delimiters, quote escaping, and instant browser processing.",
    engineId: "excel-to-csv",
    isClientSide: true,
    featured: true,
    badge: "UTF-8 Ready",
    howTo: [
      {
        step: 1,
        title: "Upload Excel File",
        description:
          "Drop your .xlsx or legacy .xls spreadsheet into the conversion box.",
      },
      {
        step: 2,
        title: "Configure Delimiters",
        description:
          "Choose standard comma (,) or international semicolon (;) delimiter settings.",
      },
      {
        step: 3,
        title: "Download Clean CSV",
        description:
          "Save your UTF-8 encoded CSV file immediately with RFC 4180 quotation compliance.",
      },
    ],
    faqs: [
      {
        question: "Is the exported CSV encoded in UTF-8?",
        answer:
          "Yes. All CSV files are generated with UTF-8 encoding and a standard byte-order mark (BOM) to ensure international characters open correctly in Excel and Google Sheets.",
      },
      {
        question: "How are cells containing commas or line breaks handled?",
        answer:
          "Our engine adheres to the RFC 4180 standard, wrapping cells with commas, quotes, or newlines in quotation marks and escaping internal quotes as \"\".",
      },
      {
        question: "Is there a limit on row count for Excel to CSV conversion?",
        answer:
          "In-browser conversion comfortably processes spreadsheets with over 100,000 rows within 1–2 seconds.",
      },
    ],
  },

  "pdf-to-excel": {
    slug: "pdf-to-excel",
    sourceFormat: "PDF",
    targetFormat: "Excel",
    sourceExtension: ".pdf",
    targetExtension: ".xlsx",
    acceptedMimeTypes: ["application/pdf"],
    category: "spreadsheets",
    title: "Convert PDF to Excel Online - Extract Tables & Bank Statements",
    subtitle:
      "Extract financial statements, invoices, and grid tables from PDF documents into editable Microsoft Excel spreadsheets.",
    metaDescription:
      "Extract structured tables from PDF documents into Excel spreadsheets (.xlsx). Advanced table detection for invoices, receipts, and bank statements.",
    isClientSide: false,
    featured: true,
    badge: "Pro / OCR",
    howTo: [
      {
        step: 1,
        title: "Upload PDF Document",
        description:
          "Select a PDF bank statement, invoice, or financial report containing tables.",
      },
      {
        step: 2,
        title: "Table Detection & OCR",
        description:
          "Our high-capacity backend engine detects table boundaries and cleans numeric column figures.",
      },
      {
        step: 3,
        title: "Download Excel Workbook",
        description:
          "Receive a clean .xlsx spreadsheet with preserved table structure and row alignment.",
      },
    ],
    faqs: [
      {
        question: "Can this tool extract multi-page bank statements?",
        answer:
          "Yes. Our server-side processing engine concatenates repeating headers across pages into a unified tabular sheet.",
      },
      {
        question: "Does it work with scanned PDFs and images?",
        answer:
          "Yes. ConvertSheet Pro uses high-accuracy Optical Character Recognition (OCR) to extract tables from scanned documents and receipts.",
      },
      {
        question: "How long are uploaded PDF files stored?",
        answer:
          "Files processed via our Pro server queue are permanently deleted within 15 minutes after conversion. We maintain zero permanent data retention.",
      },
    ],
  },

  "tally-xml-to-excel": {
    slug: "tally-xml-to-excel",
    sourceFormat: "Tally XML",
    targetFormat: "Excel",
    sourceExtension: ".xml",
    targetExtension: ".xlsx",
    acceptedMimeTypes: ["application/xml", "text/xml"],
    category: "spreadsheets",
    title: "Convert Tally XML to Excel Online - Daybooks, Vouchers & Ledgers",
    subtitle:
      "Convert Tally ERP 9 and Tally Prime XML export files into organized, audit-ready Excel spreadsheets with proper debit/credit columns.",
    metaDescription:
      "Free online Tally XML to Excel converter. Parse Tally Prime and Tally ERP 9 XML daybooks, ledgers, and voucher reports into structured Excel spreadsheets.",
    engineId: "tally-xml-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Accounting Special",
    howTo: [
      {
        step: 1,
        title: "Export & Upload Tally XML",
        description:
          "Export your Daybook, Ledger, or Voucher report as XML from Tally ERP 9 / Tally Prime, then upload it here.",
      },
      {
        step: 2,
        title: "Review Accounting Columns",
        description:
          "Verify the extracted vouchers, dates, ledger names, debit amounts, and credit amounts in the preview.",
      },
      {
        step: 3,
        title: "Download Excel Sheet",
        description:
          "Click 'Convert & Download' to generate a formatted XLSX sheet ready for accounting audits and reconciliation.",
      },
    ],
    faqs: [
      {
        question: "Which Tally versions are supported?",
        answer:
          "Both Tally Prime and Tally ERP 9 XML export formats (including All Vouchers, Daybook, and Master reports) are supported.",
      },
      {
        question: "Are ledger entries separated into Debits and Credits?",
        answer:
          "Yes. The converter extracts ledger name, voucher number, date, voucher type, debit amounts, and credit amounts into distinct columns.",
      },
      {
        question: "Is my accounting data secure?",
        answer:
          "Absolutely. Your financial records are processed purely in your browser; no financial data is ever transmitted over the network.",
      },
    ],
  },

  // -------------------------------------------------------------
  // Data Engineering & Analytical Converters (DuckDB-Wasm Powered)
  // -------------------------------------------------------------

  "parquet-to-excel": {
    slug: "parquet-to-excel",
    sourceFormat: "Parquet",
    targetFormat: "Excel",
    sourceExtension: ".parquet",
    targetExtension: ".xlsx",
    acceptedMimeTypes: [
      "application/vnd.apache.parquet",
      "application/octet-stream",
    ],
    category: "data-engineering",
    title: "Convert Parquet to Excel Online (.parquet to .xlsx) - DuckDB-Wasm",
    subtitle:
      "Convert Apache Parquet columnar datasets into Microsoft Excel spreadsheets directly in your browser with zero server uploads.",
    metaDescription:
      "Free in-browser Parquet to Excel converter powered by DuckDB-Wasm. Convert analytics datasets, Snappy compressed Parquet, and Databricks/AWS Athena exports to XLSX instantly.",
    engineId: "parquet-to-excel",
    isClientSide: true,
    featured: true,
    badge: "DuckDB-Wasm",
    howTo: [
      {
        step: 1,
        title: "Upload Apache Parquet File",
        description:
          "Select or drop your .parquet dataset into the in-browser converter.",
      },
      {
        step: 2,
        title: "Instant Columnar Preview",
        description:
          "DuckDB-Wasm reads the columnar metadata and displays a live 10-row preview with detected data types.",
      },
      {
        step: 3,
        title: "Download Excel Spreadsheet",
        description:
          "Click 'Convert & Download' to save an organized .xlsx workbook with preserved headers and numbers.",
      },
    ],
    faqs: [
      {
        question: "How can Parquet be converted without a Python server?",
        answer:
          "We run DuckDB compiled directly into WebAssembly inside your browser. DuckDB reads and deserializes the Parquet binary format locally in browser memory.",
      },
      {
        question: "Are Snappy and ZSTD compressed Parquet files supported?",
        answer:
          "Yes! DuckDB-Wasm includes full support for Snappy, GZIP, and ZSTD compressed Parquet files generated by Databricks, Snowflake, Polars, and PyArrow.",
      },
      {
        question: "Is my enterprise analytical data private?",
        answer:
          "100% private. Your .parquet file never touches our servers or third-party APIs. All processing runs in a secure client-side Web Worker.",
      },
    ],
  },

  "parquet-to-csv": {
    slug: "parquet-to-csv",
    sourceFormat: "Parquet",
    targetFormat: "CSV",
    sourceExtension: ".parquet",
    targetExtension: ".csv",
    acceptedMimeTypes: [
      "application/vnd.apache.parquet",
      "application/octet-stream",
    ],
    category: "data-engineering",
    title: "Convert Parquet to CSV Online - Fast Columnar Export",
    subtitle:
      "High-speed client-side conversion of Apache Parquet files to standard comma-separated values (CSV) with zero server latency.",
    metaDescription:
      "Convert Parquet to CSV online in your browser. Fast, private, and powered by DuckDB-Wasm with custom delimiter support and instant download.",
    engineId: "parquet-to-csv",
    isClientSide: true,
    featured: true,
    howTo: [
      {
        step: 1,
        title: "Upload Parquet File",
        description: "Choose any .parquet file from your data warehouse or pipeline.",
      },
      {
        step: 2,
        title: "Choose Delimiter",
        description: "Select comma (,), semicolon (;), or tab delimiter settings.",
      },
      {
        step: 3,
        title: "Export to CSV",
        description: "DuckDB executes a native columnar streaming copy directly to CSV.",
      },
    ],
    faqs: [
      {
        question: "Why convert Parquet to CSV?",
        answer:
          "Parquet is ideal for analytics, but many legacy tools, spreadsheets, and reporting systems require plain-text CSV format for ingestion.",
      },
      {
        question: "How fast is the conversion?",
        answer:
          "Because DuckDB-Wasm runs compiled C++ inside the browser, it can process tens of thousands of rows in 50–150ms.",
      },
      {
        question: "Can I open the resulting CSV in Excel or Google Sheets?",
        answer:
          "Yes. The output conforms to RFC 4180 standards and opens seamlessly in Microsoft Excel, Google Sheets, LibreOffice, and PostgreSQL.",
      },
    ],
  },

  "parquet-to-json": {
    slug: "parquet-to-json",
    sourceFormat: "Parquet",
    targetFormat: "JSON",
    sourceExtension: ".parquet",
    targetExtension: ".json",
    acceptedMimeTypes: [
      "application/vnd.apache.parquet",
      "application/octet-stream",
    ],
    category: "data-engineering",
    title: "Convert Parquet to JSON Online - Array of Objects",
    subtitle:
      "Convert Apache Parquet datasets to clean JSON arrays for web apps, APIs, and document stores.",
    metaDescription:
      "Convert Parquet to JSON online for free. In-browser DuckDB engine converts columnar Parquet into structured JSON arrays of objects with optional formatting.",
    engineId: "parquet-to-json",
    isClientSide: true,
    howTo: [
      {
        step: 1,
        title: "Select Parquet File",
        description: "Drag and drop your .parquet file into the converter.",
      },
      {
        step: 2,
        title: "Preview Data",
        description: "Inspect columns, row count, and choose prettify options.",
      },
      {
        step: 3,
        title: "Download JSON",
        description: "Save a clean, formatted JSON file ready for frontend or API integration.",
      },
    ],
    faqs: [
      {
        question: "How are complex column types represented in JSON?",
        answer:
          "DuckDB maps nested structs to JSON objects, lists to JSON arrays, and timestamps to ISO 8601 strings.",
      },
      {
        question: "Can I use the output with MongoDB or Elasticsearch?",
        answer:
          "Yes. The output is a standard array of JSON documents compatible with MongoDB mongoimport, Elasticsearch bulk indexers, and REST APIs.",
      },
      {
        question: "Does this require any cloud upload?",
        answer:
          "No. Processing occurs purely in your browser's local memory.",
      },
    ],
  },

  "csv-to-parquet": {
    slug: "csv-to-parquet",
    sourceFormat: "CSV",
    targetFormat: "Parquet",
    sourceExtension: ".csv",
    targetExtension: ".parquet",
    acceptedMimeTypes: ["text/csv", "application/csv", "text/plain"],
    category: "data-engineering",
    title: "Convert CSV to Parquet Online - Compressed Apache Parquet",
    subtitle:
      "Convert CSV spreadsheets into compressed, columnar Apache Parquet files directly in your browser with DuckDB-Wasm.",
    metaDescription:
      "Free online CSV to Parquet converter. Compress large CSV files into high-performance columnar Apache Parquet format using in-browser WebAssembly.",
    engineId: "csv-to-parquet",
    isClientSide: true,
    featured: true,
    badge: "Columnar Storage",
    howTo: [
      {
        step: 1,
        title: "Upload CSV Spreadsheet",
        description: "Drop your CSV or TSV file into the upload zone.",
      },
      {
        step: 2,
        title: "Automatic Schema Inference",
        description: "DuckDB scans column types (integers, floats, dates, text) automatically.",
      },
      {
        step: 3,
        title: "Download Parquet File",
        description: "Download a compact, Snappy-compressed .parquet file with up to 80% size reduction.",
      },
    ],
    faqs: [
      {
        question: "What are the advantages of converting CSV to Parquet?",
        answer:
          "Parquet uses columnar compression, making files up to 80% smaller and querying up to 100x faster in tools like DuckDB, PySpark, and AWS Athena.",
      },
      {
        question: "Does the converter infer column data types?",
        answer:
          "Yes. DuckDB analyzes the first several thousand rows to automatically detect integers, decimals, booleans, dates, and strings.",
      },
      {
        question: "Can I query the resulting Parquet file with pandas or Polars?",
        answer:
          "Yes. The output is 100% compliant with the official Apache Parquet format specification.",
      },
    ],
  },

  "json-to-parquet": {
    slug: "json-to-parquet",
    sourceFormat: "JSON",
    targetFormat: "Parquet",
    sourceExtension: ".json",
    targetExtension: ".parquet",
    acceptedMimeTypes: ["application/json", "text/json"],
    category: "data-engineering",
    title: "Convert JSON to Parquet Online - Columnar Compression",
    subtitle:
      "Transform JSON datasets and API outputs into high-efficiency Apache Parquet files in your browser.",
    metaDescription:
      "Convert JSON to Parquet online for free. Compress JSON arrays into columnar Apache Parquet files using DuckDB WebAssembly with zero data leakage.",
    engineId: "json-to-parquet",
    isClientSide: true,
    howTo: [
      {
        step: 1,
        title: "Upload JSON Document",
        description: "Select any JSON array of objects or API export.",
      },
      {
        step: 2,
        title: "Preview Inferred Schema",
        description: "Review detected keys, data types, and preview rows.",
      },
      {
        step: 3,
        title: "Download Parquet Dataset",
        description: "Save your optimized columnar Parquet file with instant browser download.",
      },
    ],
    faqs: [
      {
        question: "Can it handle nested JSON structures?",
        answer:
          "Yes. DuckDB converts nested JSON keys into Parquet STRUCT and LIST types, preserving hierarchical data without flattening.",
      },
      {
        question: "Is this tool suitable for data science pipelines?",
        answer:
          "Absolutely. It is the fastest way to turn JSON dumps into compact Parquet files for training data, PyTorch, pandas, and data lakes.",
      },
      {
        question: "Are files uploaded to remote servers?",
        answer:
          "Never. Everything runs locally in your browser session.",
      },
    ],
  },

  "jsonl-to-excel": {
    slug: "jsonl-to-excel",
    sourceFormat: "JSONL",
    targetFormat: "Excel",
    sourceExtension: ".jsonl",
    additionalExtensions: [".ndjson"],
    targetExtension: ".xlsx",
    acceptedMimeTypes: [
      "application/x-ndjson",
      "application/jsonlines",
      "text/plain",
    ],
    category: "data-engineering",
    title: "Convert JSONL to Excel Online (.jsonl to .xlsx) - AI Datasets",
    subtitle:
      "Convert Newline-Delimited JSON (JSONL / NDJSON) datasets and LLM fine-tuning files into clean Excel spreadsheets.",
    metaDescription:
      "Free online JSONL to Excel converter. Convert newline-delimited JSON (NDJSON) files into formatted XLSX worksheets with instant in-browser DuckDB processing.",
    engineId: "jsonl-to-excel",
    isClientSide: true,
    featured: true,
    badge: "AI Datasets",
    howTo: [
      {
        step: 1,
        title: "Upload JSONL File",
        description: "Select any .jsonl or .ndjson file from OpenAI, Hugging Face, or log exports.",
      },
      {
        step: 2,
        title: "Live Preview Table",
        description: "DuckDB parses line-by-line JSON records into structured tabular columns.",
      },
      {
        step: 3,
        title: "Download Excel Workbook",
        description: "Click 'Convert & Download' to export an organized .xlsx file.",
      },
    ],
    faqs: [
      {
        question: "What is JSONL format?",
        answer:
          "JSONL (JSON Lines) contains one valid JSON object per line, commonly used for AI prompt/completion datasets, logging, and massive big-data streaming.",
      },
      {
        question: "Does it support .ndjson extension?",
        answer:
          "Yes. Both .jsonl and .ndjson (Newline Delimited JSON) extensions are fully supported.",
      },
      {
        question: "Can I open large AI datasets in Excel?",
        answer:
          "Yes. Our in-browser DuckDB engine processes line-by-line streams efficiently without hitting browser DOM memory bottlenecks.",
      },
    ],
  },

  "jsonl-to-csv": {
    slug: "jsonl-to-csv",
    sourceFormat: "JSONL",
    targetFormat: "CSV",
    sourceExtension: ".jsonl",
    additionalExtensions: [".ndjson"],
    targetExtension: ".csv",
    acceptedMimeTypes: [
      "application/x-ndjson",
      "application/jsonlines",
      "text/plain",
    ],
    category: "data-engineering",
    title: "Convert JSONL to CSV Online - Fast Line-by-Line Converter",
    subtitle:
      "Transform newline-delimited JSON (JSON Lines) into standard CSV spreadsheets in seconds with DuckDB-Wasm.",
    metaDescription:
      "Convert JSONL to CSV online for free. Fast, in-browser conversion of NDJSON datasets into RFC 4180 compliant CSV files with custom delimiters.",
    engineId: "jsonl-to-csv",
    isClientSide: true,
    howTo: [
      {
        step: 1,
        title: "Upload JSONL / NDJSON File",
        description: "Drop your line-delimited JSON document into the box.",
      },
      {
        step: 2,
        title: "Configure Delimiter",
        description: "Select standard comma (,) or custom delimiter.",
      },
      {
        step: 3,
        title: "Download CSV",
        description: "Save your clean, delimited text file immediately.",
      },
    ],
    faqs: [
      {
        question: "How are missing keys in some JSON lines handled?",
        answer:
          "DuckDB unifies all unique keys across all JSON lines into consistent CSV columns, filling missing values with empty cells.",
      },
      {
        question: "Is there a limit on line count?",
        answer:
          "Files up to 10MB (typically 20,000–50,000 lines) convert in under a second in browser memory.",
      },
      {
        question: "Is my data stored or logged?",
        answer:
          "Never. All conversion happens client-side; no data is sent to our servers.",
      },
    ],
  },

  "csv-to-jsonl": {
    slug: "csv-to-jsonl",
    sourceFormat: "CSV",
    targetFormat: "JSONL",
    sourceExtension: ".csv",
    targetExtension: ".jsonl",
    acceptedMimeTypes: ["text/csv", "application/csv", "text/plain"],
    category: "data-engineering",
    title: "Convert CSV to JSONL Online - Format for AI Fine-Tuning",
    subtitle:
      "Convert CSV spreadsheets into Newline-Delimited JSON (JSONL / NDJSON) for OpenAI fine-tuning, Claude, and analytics.",
    metaDescription:
      "Free online CSV to JSONL converter. Convert CSV rows into individual newline-delimited JSON objects ready for LLM fine-tuning and big data pipelines.",
    engineId: "csv-to-jsonl",
    isClientSide: true,
    featured: true,
    badge: "LLM Prep",
    howTo: [
      {
        step: 1,
        title: "Upload CSV File",
        description: "Select or drop your spreadsheet into the dropzone.",
      },
      {
        step: 2,
        title: "Preview Records",
        description: "Verify columns and row counts before conversion.",
      },
      {
        step: 3,
        title: "Download JSONL Dataset",
        description: "Save a valid .jsonl file with one JSON record per line.",
      },
    ],
    faqs: [
      {
        question: "Can I use the output for OpenAI model fine-tuning?",
        answer:
          "Yes. The output adheres strictly to the JSON Lines format required by OpenAI, Anthropic, and Hugging Face fine-tuning APIs.",
      },
      {
        question: "Does each line represent one CSV row?",
        answer:
          "Yes. Each row in your CSV is serialized into an independent, compact JSON object separated by a standard newline.",
      },
      {
        question: "Does the converter handle commas inside text cells?",
        answer:
          "Yes. Quoted cells with commas or newlines are parsed accurately into proper JSON string properties.",
      },
    ],
  },

  "markdown-to-excel": {
    slug: "markdown-to-excel",
    sourceFormat: "Markdown",
    targetFormat: "Excel",
    sourceExtension: ".md",
    additionalExtensions: [".markdown", ".html", ".htm", ".txt"],
    targetExtension: ".xlsx",
    acceptedMimeTypes: [
      "text/markdown",
      "text/x-markdown",
      "text/plain",
      "text/html",
    ],
    category: "spreadsheets",
    engineId: "markdown-to-excel",
    isClientSide: true,
    featured: true,
    badge: "AI & Docs Favorite",
    title: "Convert Markdown & HTML Table to Excel (.xlsx) Online",
    subtitle:
      "Transform ChatGPT, Claude, and GitHub Markdown or HTML tables into clean Microsoft Excel spreadsheets instantly with zero data uploads.",
    metaDescription:
      "Free online Markdown to Excel converter. Convert AI-generated tables from ChatGPT, Claude, and HTML web tables directly into XLSX workbooks in your browser.",
    howTo: [
      {
        step: 1,
        title: "Paste or Upload Markdown",
        description:
          "Paste raw Markdown/HTML table text directly or upload a .md, .markdown, or .html file.",
      },
      {
        step: 2,
        title: "Preview & Inspect",
        description:
          "Review the parsed grid preview, verified column headers, and detected numeric formats.",
      },
      {
        step: 3,
        title: "Download Excel Spreadsheet",
        description:
          "Click 'Convert & Download' to immediately export your structured Microsoft Excel (.xlsx) file.",
      },
    ],
    faqs: [
      {
        question: "Can I convert tables generated by ChatGPT, Claude, or DeepSeek?",
        answer:
          "Yes. Simply copy and paste markdown tables or AI code block responses directly into the converter to transform them into native Excel spreadsheets.",
      },
      {
        question: "Does this converter support HTML tables with tags?",
        answer:
          "Yes. It seamlessly parses <table>, <tr>, <th>, and <td> HTML structures as well as GitHub-flavored markdown pipe tables.",
      },
      {
        question: "Is my data uploaded to any remote server?",
        answer:
          "No. All parsing and Excel generation happens 100% locally in your browser using client-side JavaScript. Your confidential data never leaves your machine.",
      },
      {
        question: "Can I paste raw markdown table text directly without creating a file?",
        answer:
          "Yes. You can paste markdown pipe tables or HTML snippets directly into the input area without saving them to a file first.",
      },
      {
        question: "Are numbers and currency formatted properly in the generated Excel file?",
        answer:
          "Yes. Clean numeric values and currency amounts are automatically recognized and formatted into proper Excel numeric types.",
      },
    ],
  },
} as const satisfies Record<string, ConverterConfig>;

export type ConverterSlug = keyof typeof CONVERTER_REGISTRY;

/**
 * Returns all converter slug keys defined in CONVERTER_REGISTRY.
 */
export function getAllConverterSlugs(): ConverterSlug[] {
  return Object.keys(CONVERTER_REGISTRY) as ConverterSlug[];
}

/**
 * Retrieves a converter configuration by its slug.
 */
export function getConverterBySlug(slug: string): ConverterConfig | undefined {
  if (Object.hasOwn(CONVERTER_REGISTRY, slug)) {
    return CONVERTER_REGISTRY[slug as ConverterSlug] as ConverterConfig;
  }
  return undefined;
}

/**
 * Retrieves all converter configurations flagged as featured.
 */
export function getFeaturedConverters(): ConverterConfig[] {
  return (Object.values(CONVERTER_REGISTRY) as ConverterConfig[]).filter((c) =>
    Boolean(c.featured)
  );
}

/**
 * Retrieves converters by category.
 */
export function getConvertersByCategory(
  category: "spreadsheets" | "data-engineering"
): ConverterConfig[] {
  return (Object.values(CONVERTER_REGISTRY) as ConverterConfig[]).filter(
    (c) => c.category === category
  );
}

/**
 * List of all supported source extensions across all registered converters.
 */
export const ALL_SUPPORTED_EXTENSIONS: string[] = Array.from(
  new Set(
    (Object.values(CONVERTER_REGISTRY) as ConverterConfig[]).flatMap((c) => [
      c.sourceExtension,
      ...(c.additionalExtensions ?? []),
    ])
  )
);
