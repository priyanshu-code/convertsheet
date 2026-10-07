import { ConverterConfig } from "@/types/registry";
import { IMAGE_TOOLS } from "./image-tools-data";

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
      "Transform JSON data, nested objects, and API arrays into formatted Microsoft Excel (.xlsx) spreadsheets. Just paste the JSON or upload a file — 100% private in your browser.",
    metaDescription:
      "Free online JSON to Excel converter. Just paste the JSON or upload a .json file. Flattens nested objects into clean XLSX worksheets with zero data uploaded to external servers.",
    engineId: "json-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Popular",
    about:
      "Converting JSON data into Microsoft Excel spreadsheets is essential for developers, analysts, and business teams who need to analyze API payloads or database exports in a familiar spreadsheet format.\n\nWith ConvertSheet, you can just paste the JSON text directly into the editor or upload a .json file from your computer. Our intelligent engine unrolls arrays of objects, flattens nested JSON structures using dot-notation column names (e.g., user.address.city), and exports cleanly formatted .xlsx workbooks.\n\nBest of all, your data stays 100% private. All processing occurs locally in your browser memory without uploading any bytes to remote servers.",
    howTo: [
      {
        step: 1,
        title: "Paste JSON or Upload File",
        description:
          "Just paste the JSON directly into the editor or drag and drop your .json file into the upload zone.",
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
        question: "Can I just paste the JSON or do I have to upload a file?",
        answer:
          "You can do either! You can just paste the JSON payload directly into our web editor or upload any .json file. ConvertSheet processes both methods instantly in memory with zero server uploads.",
      },
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
          "Client-side conversion smoothly handles JSON files up to 100MB–200MB (typically hundreds of thousands of rows). For massive datasets, our background processing tier is available.",
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
      "Parse XML trees, feeds, and attribute structures into clean, multi-column Excel workbooks. Just paste the XML or upload an XML file.",
    metaDescription:
      "Convert XML files to Excel spreadsheets (.xlsx) online for free. Just paste the XML or upload a file. Auto-detects repeating nodes with zero server uploads.",
    engineId: "xml-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Fast",
    howTo: [
      {
        step: 1,
        title: "Paste XML or Upload File",
        description:
          "Just paste your XML data directly or drop your XML dataset, RSS/Atom feed, or ERP export file into the upload area.",
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
        question: "Can I just paste XML code instead of uploading a file?",
        answer:
          "Yes! You can just paste the raw XML text into the editor or upload an XML file. ConvertSheet extracts rows and columns instantly in your browser.",
      },
      {
        question: "Does this XML to Excel converter support XML attributes?",
        answer:
          "Yes. XML attributes (e.g. <item id='123' category='tools'>) are unrolled into distinct spreadsheet columns prefixed with @_ so no metadata is lost.",
      },
      {
        question: "Will large enterprise XML exports convert reliably?",
        answer:
          "Yes. Our streaming XML parser parses repeat nodes directly into memory and handles files up to 100MB in your browser.",
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
    title: "Convert CSV to Excel Online (2026) — Free, 100% Private (.xlsx), No Upload",
    subtitle:
      "Convert CSV, TSV, semicolon, and pipe-delimited text files into authentic Microsoft Excel spreadsheets. Just paste the CSV or upload a file.",
    metaDescription:
      "Convert CSV to Excel online in one click (2026). Just paste the CSV or upload a file. 100% private, free, and instant in your browser with zero server uploads.",
    engineId: "csv-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Instant",
    about:
      "Converting CSV (Comma-Separated Values) files into Microsoft Excel (.xlsx) is one of the most common data tasks across engineering, finance, accounting, and business intelligence. However, simply double-clicking a CSV to open it in standard Excel often silently corrupts critical data: leading zeros are stripped from ZIP codes and ID numbers, long credit card or tracking numbers are converted into scientific notation (like 1.23E+12), and international date formats are frequently misparsed.\n\nConvertSheet's CSV to Excel Converter solves these issues at the root. Built with high-performance client-side WebAssembly, our engine inspects your text stream, automatically detects your delimiter (whether comma, semicolon, tab, or pipe), and formats each column into native Excel cell data types while explicitly preserving leading zeros and raw strings intact.\n\nBest of all, conversion executes 100% locally in your web browser. Your private customer records, financial ledgers, and database exports never leave your device and are never transmitted over the internet or retained on remote servers. This guarantees full compliance with GDPR, HIPAA, and internal security policies.",
    howTo: [
      {
        step: 1,
        title: "Paste CSV or Upload File",
        description:
          "Just paste your CSV text directly or drag and drop any .csv, .tsv, or text file into the converter box.",
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
        question: "Can I just paste the CSV text directly instead of uploading a file?",
        answer:
          "Yes! You can just paste raw CSV, TSV, or tab-delimited text directly into the web editor or upload a file. Both convert instantly to Excel with zero server uploads.",
      },
      {
        question: "Does the CSV to Excel converter preserve leading zeros and formatting?",
        answer:
          "Yes! Unlike opening a CSV directly in Excel (which strips leading zeros from postal codes like '01234' and turns them into '1234'), ConvertSheet preserves leading zeros and long numeric IDs as text strings so your data remains intact.",
      },
      {
        question: "What delimiters are supported (comma, semicolon, tab, pipe)?",
        answer:
          "Comma (,), Semicolon (;), Tab (\\t), and Pipe (|) are all automatically recognized by our heuristic delimiter detector. You can also specify custom single-character delimiters if needed.",
      },
      {
        question: "Why does Microsoft Excel mess up dates and numbers when opening a CSV?",
        answer:
          "Excel attempts to auto-guess column types upon opening raw text files. This leads to dates being swapped between MM/DD and DD/MM formats and large numbers being converted to scientific notation. ConvertSheet explicitly structures the XML sheet definition in the downloaded .xlsx workbook to prevent auto-truncation.",
      },
      {
        question: "Can I convert large CSV exports from databases and APIs?",
        answer:
          "Yes. Files up to 100MB+ convert in under a second directly in your browser. For multi-gigabyte files, our ConvertSheet Pro tier provides high-speed chunked streaming via Web Workers.",
      },
      {
        question: "Is my CSV data kept private and secure?",
        answer:
          "100% private. Processing happens entirely in your local browser memory using client-side JavaScript and WebAssembly. No files are uploaded to any server, making it safe for confidential corporate and healthcare datasets.",
      },
      {
        question: "How do I convert European CSV files that use semicolon delimiters?",
        answer:
          "In many European countries, commas represent decimals and semicolons separate columns. ConvertSheet automatically identifies this structure and generates a clean, localized Excel sheet without requiring manual delimiter configuration.",
      },
      {
        question: "Can I convert CSV to Excel offline without an internet connection?",
        answer:
          "Yes. Because ConvertSheet is a Progressive Web App (PWA) with fully client-side engines, once the page is cached you can convert CSV files completely offline without an active internet connection.",
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
    title: "Parquet to Excel Converter Online — Free, In-Browser DuckDB (.xlsx)",
    subtitle:
      "Convert Apache Parquet columnar datasets into Microsoft Excel spreadsheets directly in your browser with zero server uploads.",
    metaDescription:
      "Convert Apache Parquet datasets into clean Excel (.xlsx) spreadsheets directly in your browser. Powered by DuckDB-Wasm — supports Snappy, GZIP, and ZSTD with 100% privacy.",
    engineId: "parquet-to-excel",
    isClientSide: true,
    featured: true,
    badge: "DuckDB-Wasm",
    about:
      "Apache Parquet has become the standard columnar file format for modern big data architectures, cloud data warehouses, and data lakehouses (including Snowflake, Databricks, AWS Athena, and BigQuery). While Parquet provides extraordinary query speed and compression efficiency, non-technical stakeholders, business analysts, and financial controllers cannot double-click or open Parquet files in Microsoft Excel.\n\nConvertSheet bridges this divide effortlessly without requiring Python, PyArrow, Pandas, or server infrastructure. Powered by DuckDB-Wasm running directly inside your web browser, ConvertSheet scans your columnar schemas, decompresses pages (including Snappy, GZIP, and ZSTD compression), and outputs an authentic, styled Excel spreadsheet (.xlsx).\n\nBecause computation is strictly client-side, your multi-gigabyte analytical datasets and proprietary data models never touch any external server, guaranteeing strict enterprise security and data residency compliance.",
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
      "Transform JSON datasets and API outputs into high-efficiency Apache Parquet files. Just paste the JSON or upload your file to convert instantly.",
    metaDescription:
      "Convert JSON to Parquet online for free. Just paste the JSON or upload a .json file to generate columnar Apache Parquet datasets using DuckDB WebAssembly.",
    engineId: "json-to-parquet",
    isClientSide: true,
    howTo: [
      {
        step: 1,
        title: "Paste JSON or Upload File",
        description: "Just paste your JSON records directly or select/drag-and-drop a .json file.",
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
        question: "Can I just paste the JSON or upload a file?",
        answer:
          "Yes! You can just paste the JSON text directly into the input area or upload any .json file. Both are converted into Apache Parquet entirely client-side.",
      },
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
    title: "JSONL to Excel Converter Online — Free (.jsonl to .xlsx), AI Datasets",
    subtitle:
      "Convert Newline-Delimited JSON (JSONL / NDJSON) datasets and LLM fine-tuning files into clean Excel spreadsheets directly in your browser.",
    metaDescription:
      "Convert JSONL and NDJSON files into Excel (.xlsx) workbooks online. Instant client-side processing with DuckDB-Wasm — ideal for OpenAI, Anthropic, and Hugging Face datasets. 100% private.",
    engineId: "jsonl-to-excel",
    isClientSide: true,
    featured: true,
    badge: "AI Datasets",
    about:
      "JSONL (JSON Lines or Newline-Delimited JSON, .ndjson) is the industry-standard data format for artificial intelligence training corpora, Large Language Model (LLM) fine-tuning pipelines (OpenAI GPT, Anthropic Claude, Llama), and distributed application logging. While JSONL scales effortlessly for streaming APIs, inspecting hundreds of thousands of prompt/completion pairs or evaluation records inside raw text editors is impractical.\n\nConvertSheet provides an instant, zero-install bridge from JSONL to Microsoft Excel (.xlsx). Powered by DuckDB-Wasm executing inside your web browser, ConvertSheet dynamically infers schema structures, unrolls JSON fields into formatted Excel columns, and gives you a structured spreadsheet for immediate human review, dataset curation, and team evaluation.\n\nBecause all processing takes place locally inside your browser's memory, proprietary AI prompts, customer support transcripts, and sensitive training data never pass through third-party servers.",
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
          "Files up to 100MB+ (typically hundreds of thousands of lines) convert in under a second in browser memory.",
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

  "excel-to-jsonl": {
    slug: "excel-to-jsonl",
    sourceFormat: "Excel",
    targetFormat: "JSONL",
    sourceExtension: ".xlsx",
    additionalExtensions: [".xls"],
    targetExtension: ".jsonl",
    acceptedMimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
    category: "data-engineering",
    title: "Convert Excel to JSONL Online — Free (.xlsx to .jsonl), AI Datasets",
    subtitle:
      "Convert Excel spreadsheets (.xlsx, .xls) into Newline-Delimited JSON (JSONL / NDJSON) datasets for LLM fine-tuning, OpenAI, and streaming pipelines.",
    metaDescription:
      "Convert Excel (.xlsx) workbooks into JSONL and NDJSON files online. 100% private in-browser conversion for AI model training and data engineering.",
    engineId: "excel-to-jsonl",
    isClientSide: true,
    featured: true,
    badge: "AI & LLM",
    about:
      "Excel to JSONL conversion transforms multi-column spreadsheets into line-by-line JSON objects, making them instantly ingestible by AI training frameworks (OpenAI fine-tuning, Hugging Face datasets, Claude context loading) and high-throughput data lakes (Snowflake, BigQuery, AWS Athena).\n\nWith ConvertSheet, your entire Excel workbook is converted locally in your browser with WebAssembly and SheetJS. Formulas, cell values, and dates are accurately translated into standardized JSON keys without sending sensitive business sheets or training prompts across the network.",
    howTo: [
      {
        step: 1,
        title: "Upload Excel Spreadsheet",
        description: "Drop your .xlsx or .xls file into the secure in-browser converter.",
      },
      {
        step: 2,
        title: "Preview & Select Sheet",
        description: "Preview rows and choose which worksheet to convert.",
      },
      {
        step: 3,
        title: "Download JSONL File",
        description: "Save a clean, newline-delimited JSONL file formatted for AI pipelines.",
      },
    ],
    faqs: [
      {
        question: "Can I use the converted JSONL for OpenAI fine-tuning?",
        answer:
          "Yes. Each row in your Excel file is converted into an independent JSON object formatted on its own line, strictly adhering to the JSONL format required by OpenAI, Anthropic, and Llama.",
      },
      {
        question: "Are multi-sheet workbooks supported?",
        answer:
          "Yes. You can preview and convert any sheet within your Excel workbook directly from the sheet selector dropdown.",
      },
      {
        question: "Does any data leave my device?",
        answer:
          "No. All parsing and serialization runs 100% locally in your browser using SheetJS and WebAssembly.",
      },
    ],
  },

  "json-to-jsonl": {
    slug: "json-to-jsonl",
    sourceFormat: "JSON",
    targetFormat: "JSONL",
    sourceExtension: ".json",
    targetExtension: ".jsonl",
    acceptedMimeTypes: ["application/json", "text/plain"],
    category: "data-engineering",
    title: "Convert JSON to JSONL Online — Free (.json to .jsonl / .ndjson)",
    subtitle:
      "Convert massive standard JSON arrays into streaming Newline-Delimited JSON (JSONL / NDJSON). Just paste the JSON or upload a file for LLMs, OpenAI, and vector database ingestion.",
    metaDescription:
      "Convert JSON arrays and nested records into JSONL / NDJSON files online. Just paste the JSON or upload your file. Fast, zero-install, 100% client-side conversion for AI fine-tuning.",
    engineId: "json-to-jsonl",
    isClientSide: true,
    featured: true,
    badge: "LLM Streaming",
    about:
      "Standard JSON stores collections in one monolithic array [...], requiring parsers to load the entire document into RAM before accessing a single object. JSONL (Newline-Delimited JSON) solves this by placing each JSON object on its own line, enabling lightning-fast streaming, parallel chunking, and direct compatibility with OpenAI GPT-4o, Anthropic Claude, and Llama fine-tuning APIs.\n\nWhether you need to just paste the JSON directly into your browser or upload a file, ConvertSheet converts your records directly inside browser memory with zero server uploads.",
    howTo: [
      {
        step: 1,
        title: "Paste JSON or Upload File",
        description: "Just paste the JSON array directly or select/drop your JSON file into the converter.",
      },
      {
        step: 2,
        title: "Verify Preview",
        description: "Inspect parsed fields and total record count in the interactive grid.",
      },
      {
        step: 3,
        title: "Export JSONL",
        description: "Download the formatted .jsonl file ready for streaming and training.",
      },
    ],
    faqs: [
      {
        question: "Can I just paste the JSON or do I have to upload a file?",
        answer:
          "You can do either! Just paste the JSON array directly into the input area or upload your .json file. Both convert instantly in browser memory.",
      },
      {
        question: "What is the difference between JSON and JSONL?",
        answer:
          "Standard JSON wraps all items in an array `[ {...}, {...} ]`. JSONL places each object on a separate line without surrounding brackets or trailing commas, enabling streaming and chunking.",
      },
      {
        question: "Can I convert large JSON dumps?",
        answer:
          "Yes. Our client-side parser processes records efficiently in browser memory without sending data to a third-party server.",
      },
      {
        question: "Is this format compatible with Hugging Face datasets?",
        answer:
          "Yes. JSONL is the standard format used across Hugging Face, OpenAI, and LangChain document loaders.",
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

  "sqlite-to-excel": {
    slug: "sqlite-to-excel",
    sourceFormat: "SQLite",
    targetFormat: "Excel",
    sourceExtension: ".sqlite",
    additionalExtensions: [".db", ".sqlite3", ".db3"],
    targetExtension: ".xlsx",
    acceptedMimeTypes: [
      "application/x-sqlite3",
      "application/vnd.sqlite3",
      "application/octet-stream",
    ],
    category: "spreadsheets",
    engineId: "sqlite-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Client-Side WASM",
    title: "Convert SQLite to Excel Online Free (2026) — Export .db to Multi-Sheet XLSX",
    subtitle:
      "Export all tables from .sqlite, .db, and .sqlite3 database files into formatted multi-sheet Excel spreadsheets directly in your browser with zero server uploads.",
    metaDescription:
      "Free private SQLite to Excel converter (2026). Open .sqlite, .db, and .sqlite3 files and export all database tables to native multi-sheet XLSX spreadsheets locally via WebAssembly. 100% private, no software install.",
    howTo: [
      {
        step: 1,
        title: "Upload SQLite File",
        description:
          "Select or drag and drop your SQLite database file (.db, .sqlite, .sqlite3, or .db3) into the upload zone.",
      },
      {
        step: 2,
        title: "Inspect Database Tables",
        description:
          "Preview the list of extracted tables, row counts, and column schemas parsed instantly in your browser via WebAssembly.",
      },
      {
        step: 3,
        title: "Download Multi-Sheet Excel",
        description:
          "Click 'Convert & Download' to generate and save a native multi-sheet .xlsx workbook where each database table becomes a distinct worksheet.",
      },
    ],
    faqs: [
      {
        question: "How do I open a .db or .sqlite file in Excel without Python or installing tools?",
        answer:
          "Simply drag and drop your .db or .sqlite file into ConvertSheet. Our in-browser WebAssembly engine instantly reads the SQLite binary catalog and compiles all tables into a standard Microsoft Excel (.xlsx) workbook ready to open in Excel, Numbers, or Google Sheets.",
      },
      {
        question: "Is my SQLite database file uploaded to any remote server?",
        answer:
          "No. The conversion runs 100% locally in your browser using an in-memory WebAssembly SQLite engine. Your database files, records, and proprietary data never leave your device.",
      },
      {
        question: "How are multiple database tables handled in the Excel export?",
        answer:
          "Each table in your SQLite database is automatically exported to its own dedicated worksheet tab within a single formatted Excel (.xlsx) workbook, with sanitized sheet names.",
      },
      {
        question: "Can I convert SQLite to Excel on Mac, Windows, Linux, or Chromebook?",
        answer:
          "Yes. Because ConvertSheet runs entirely in modern WebAssembly supported by Chrome, Safari, Firefox, and Edge, it operates identically across all operating systems without any software or CLI dependencies.",
      },
      {
        question: "What file extensions are supported?",
        answer:
          "The converter accepts standard SQLite database files with extensions including .sqlite, .db, .sqlite3, and .db3, as well as binary SQLite file dumps.",
      },
      {
        question: "Can this converter open encrypted or password-protected SQLite databases?",
        answer:
          "Standard SQLite databases are fully supported. Encrypted databases using custom extensions like SQLCipher or SEE require decryption prior to conversion.",
      },
      {
        question: "What is the file size limit for converting SQLite databases?",
        answer:
          "Because processing occurs in-browser via WebAssembly and browser memory buffers, database files up to 200MB can be processed smoothly depending on your device's available RAM.",
      },
    ],
  },

  "json-to-ndjson": {
    slug: "json-to-ndjson",
    sourceFormat: "JSON",
    targetFormat: "NDJSON",
    sourceExtension: ".json",
    additionalExtensions: [".txt"],
    targetExtension: ".ndjson",
    acceptedMimeTypes: ["application/json", "text/json", "text/plain"],
    category: "data-engineering",
    engineId: "json-to-ndjson",
    isClientSide: true,
    featured: true,
    badge: "AI & Vector DB",
    title: "Convert JSON to NDJSON / JSONL Online - Fast, Free & Private",
    subtitle:
      "Transform JSON objects and arrays into Newline-Delimited JSON (NDJSON/JSONL). Just paste the JSON or upload a file for vector databases and LLM finetuning.",
    metaDescription:
      "Free online JSON to NDJSON / JSONL converter. Just paste the JSON or upload a file to convert into streaming line-delimited records with zero server uploads.",
    howTo: [
      {
        step: 1,
        title: "Paste JSON or Upload File",
        description:
          "Just paste the JSON array into the editor or drag and drop a .json file into the upload zone.",
      },
      {
        step: 2,
        title: "Preview Line-Delimited Records",
        description:
          "Inspect parsed records and verify newline-delimited output formatting with automatic data sanitization.",
      },
      {
        step: 3,
        title: "Download NDJSON File",
        description:
          "Click 'Convert & Download' to export clean, single-line JSON records formatted for instant streaming ingestion.",
      },
    ],
    faqs: [
      {
        question: "Can I just paste the JSON or do I need to upload a file?",
        answer:
          "You can do either! Just paste the JSON text directly into the input area or upload your .json file. Both are converted to NDJSON / JSONL instantly in your browser.",
      },
      {
        question: "Is my JSON data uploaded to any remote server during conversion?",
        answer:
          "No. All parsing and conversion is handled 100% client-side in your web browser using JavaScript streams. Your sensitive documents, API exports, and proprietary data never touch an external server.",
      },
      {
        question: "What is the difference between NDJSON and JSONL?",
        answer:
          "NDJSON (Newline-Delimited JSON) and JSONL (JSON Lines) refer to the exact same format specification: valid individual JSON values separated by standard newline characters (\\n), enabling streaming and chunked parsing.",
      },
      {
        question: "How does the converter handle deeply nested objects and arrays?",
        answer:
          "Each top-level array element or object entry is preserved as a complete, valid JSON record on its own line. Nested structures, sub-arrays, and Unicode characters are strictly serialized without truncation.",
      },
      {
        question: "Can I use the converted NDJSON files directly with Vector Databases and LLMs?",
        answer:
          "Yes. The output strictly conforms to the streaming input requirements for vector databases like Pinecone, Weaviate, Milvus, and Qdrant, as well as OpenAI batch fine-tuning datasets and Elasticsearch bulk imports.",
      },
      {
        question: "What is the maximum JSON file size that can be converted in the browser?",
        answer:
          "Because ConvertSheet uses fast client-side streaming and efficient memory buffers, JSON files up to 50MB (often containing over 100,000 records) can be converted smoothly in modern browsers.",
      },
    ],
  },

  "json-to-schema": {
    slug: "json-to-schema",
    sourceFormat: "JSON",
    targetFormat: "JSON Schema",
    sourceExtension: ".json",
    additionalExtensions: [".txt"],
    targetExtension: ".schema.json",
    acceptedMimeTypes: ["application/json", "text/json", "text/plain"],
    category: "data-engineering",
    engineId: "json-to-schema",
    isClientSide: true,
    featured: true,
    badge: "Schema Generator",
    title: "Generate JSON Schema from JSON Online - In-Browser Generator",
    subtitle:
      "Infer and generate standard Draft-07 JSON Schema specifications from sample JSON objects. Just paste the JSON or upload a file — 100% private in your browser.",
    metaDescription:
      "Free online JSON Schema generator. Just paste the JSON or upload a file to automatically infer data types, required properties, and nested structures.",
    howTo: [
      {
        step: 1,
        title: "Paste JSON or Upload File",
        description:
          "Just paste the JSON payload or drop any sample JSON file into the secure browser upload zone.",
      },
      {
        step: 2,
        title: "Inspect Inferred Types",
        description:
          "Review detected field types, nested object hierarchies, array element schemas, and required property constraints.",
      },
      {
        step: 3,
        title: "Download Draft-07 Schema",
        description:
          "Click 'Convert & Download' to obtain your validated .schema.json specification ready for automated contract testing or OpenAPI integration.",
      },
    ],
    faqs: [
      {
        question: "Can I just paste the JSON to generate a schema?",
        answer:
          "Yes! Just paste your JSON object or array directly into the editor or upload a .json file. Our engine immediately infers types and generates a standard Draft-07 schema.",
      },
      {
        question: "Is my JSON payload or schema shared with third parties or cloud servers?",
        answer:
          "Never. Schema generation runs completely in-memory in your local browser sandbox. Sensitive schema definitions, secret keys, or confidential API structures remain strictly on your machine.",
      },
      {
        question: "Which JSON Schema specification draft does this generator output?",
        answer:
          "The generator produces standard JSON Schema Draft-07 schemas (http://json-schema.org/draft-07/schema#), ensuring maximum compatibility across modern validators, TypeScript generators, and OpenAPI 3.0 tooling.",
      },
      {
        question: "How are field types and null values inferred?",
        answer:
          "Primitives (string, integer, number, boolean) are inferred accurately based on JavaScript type semantics, while arrays with heterogeneous elements produce combined union types.",
      },
      {
        question: "Are object properties marked as required by default?",
        answer:
          "All keys discovered in object payloads are analyzed and enumerated in the 'required' array property, establishing a rigorous contract baseline that you can easily customize.",
      },
      {
        question: "Can I use generated schemas with OpenAPI, Swagger, or Ajv validation?",
        answer:
          "Yes. The output Draft-07 JSON Schema format is directly compatible with Ajv, standard JSON Schema validators, Quicktype code generators, and OpenAPI / Swagger request/response model definitions.",
      },
    ],
  },

  "webp-to-png": {
    slug: "webp-to-png",
    sourceFormat: "WebP",
    targetFormat: "PNG",
    sourceExtension: ".webp",
    targetExtension: ".png",
    acceptedMimeTypes: ["image/webp"],
    category: "utility",
    title: "Convert WebP to PNG Online - Free, Fast & Lossless",
    subtitle:
      "Batch convert Google WebP images to high-definition transparent PNG files directly in your web browser with 100% privacy.",
    metaDescription:
      "Free online WebP to PNG converter. Transform WebP photos and graphics into transparent PNG images in browser memory with zero server uploads.",
    engineId: "image-converter",
    isClientSide: true,
    badge: "100% Private",
    about: IMAGE_TOOLS["webp-to-png"].about,
    howTo: IMAGE_TOOLS["webp-to-png"].howTo,
    faqs: IMAGE_TOOLS["webp-to-png"].faqs,
  },

  "png-to-webp": {
    slug: "png-to-webp",
    sourceFormat: "PNG",
    targetFormat: "WebP",
    sourceExtension: ".png",
    targetExtension: ".webp",
    acceptedMimeTypes: ["image/png"],
    category: "utility",
    title: IMAGE_TOOLS["png-to-webp"].title,
    subtitle: IMAGE_TOOLS["png-to-webp"].subtitle,
    metaDescription: IMAGE_TOOLS["png-to-webp"].metaDescription,
    engineId: "image-converter",
    isClientSide: true,
    badge: "PageSpeed Boost",
    about: IMAGE_TOOLS["png-to-webp"].about,
    howTo: IMAGE_TOOLS["png-to-webp"].howTo,
    faqs: IMAGE_TOOLS["png-to-webp"].faqs,
  },

  "tsv-to-csv": {
    slug: "tsv-to-csv",
    sourceFormat: "TSV",
    targetFormat: "CSV",
    sourceExtension: ".tsv",
    additionalExtensions: [".tab", ".txt"],
    targetExtension: ".csv",
    acceptedMimeTypes: ["text/tab-separated-values", "text/plain", "text/csv"],
    category: "spreadsheets",
    engineId: "tsv-to-csv",
    isClientSide: true,
    featured: true,
    badge: "Instant",
    title: "Convert TSV to CSV Online - Fast, Free & In-Browser",
    subtitle: "Transform tab-separated values (.tsv) into standard comma-separated (.csv) files. Process large datasets locally in memory with zero data uploads.",
    metaDescription: "Free online TSV to CSV converter. Convert tab-delimited files to standard CSV format in your browser. Clean comma formatting and complete data privacy.",
    about: "Tab-separated values (TSV) are widely used in bioinformatics, database extracts, and research logs. ConvertSheet transforms your TSV files into RFC 4180 compliant CSV files with safe comma-escaping, double-quote wrapping, and leading-zero preservation—all directly in your browser memory.",
    howTo: [
      { step: 1, title: "Select or Paste TSV", description: "Drag and drop your .tsv file or paste raw tab-delimited text into the editor." },
      { step: 2, title: "Preview Data Grid", description: "Inspect parsed tabular rows and confirm delimiter column alignment." },
      { step: 3, title: "Download Clean CSV", description: "Click 'Convert & Download' to save your standard comma-delimited .csv file." }
    ],
    faqs: [
      { question: "How does this tool handle fields containing commas?", answer: "ConvertSheet automatically encloses fields containing commas, line breaks, or quotes in double quotes per standard RFC 4180 CSV specifications." },
      { question: "Are my TSV records uploaded to remote cloud servers?", answer: "No. The entire conversion executes client-side using JavaScript in your browser sandbox. Your data never leaves your computer." },
      { question: "Can I convert large bioinformatics or log TSV files?", answer: "Yes, our client-side parsing engine handles large datasets with hundreds of thousands of rows smoothly without server timeouts." }
    ]
  },

  "csv-to-tsv": {
    slug: "csv-to-tsv",
    sourceFormat: "CSV",
    targetFormat: "TSV",
    sourceExtension: ".csv",
    targetExtension: ".tsv",
    acceptedMimeTypes: ["text/csv", "application/csv", "text/plain"],
    category: "spreadsheets",
    engineId: "csv-to-tsv",
    isClientSide: true,
    title: "Convert CSV to TSV Online - Tab-Separated Values Generator",
    subtitle: "Convert comma-separated (.csv) spreadsheets into tab-separated (.tsv) data for command-line tools, grep, awk, and data pipelines.",
    metaDescription: "Free online CSV to TSV converter. Transform CSV tables into clean tab-delimited text in your browser with zero server data retention.",
    about: "Converting CSV to TSV is critical when feeding tabular data into UNIX command-line tools like cut, awk, and sort, or specialized scientific pipelines that require tab delimiters. ConvertSheet strips unnecessary comma-escaping and formats pristine tab-separated streams.",
    howTo: [
      { step: 1, title: "Upload CSV Spreadsheet", description: "Drop your .csv file into the upload zone or paste comma-separated values." },
      { step: 2, title: "Verify Tabular Structure", description: "Inspect the parsed columns and verify all rows are detected accurately." },
      { step: 3, title: "Download TSV File", description: "Click 'Convert & Download' to save your clean .tsv file instantly." }
    ],
    faqs: [
      { question: "Why convert CSV to TSV?", answer: "TSV is easier to process with standard UNIX utilities (awk, cut, grep) because tabs rarely occur inside natural text fields, avoiding escaping issues." },
      { question: "What happens if my CSV data contains tabs?", answer: "Our engine sanitizes interior tab characters to prevent column misalignment in the resulting output." },
      { question: "Is this conversion 100% private?", answer: "Yes. All conversion logic runs locally in browser memory with zero server uploads." }
    ]
  },

  "tsv-to-excel": {
    slug: "tsv-to-excel",
    sourceFormat: "TSV",
    targetFormat: "Excel",
    sourceExtension: ".tsv",
    additionalExtensions: [".tab", ".txt"],
    targetExtension: ".xlsx",
    acceptedMimeTypes: ["text/tab-separated-values", "text/plain"],
    category: "spreadsheets",
    engineId: "tsv-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Popular",
    title: "Convert TSV to Excel Online - Free In-Browser XLSX Converter",
    subtitle: "Convert tab-separated values (.tsv) directly into formatted Microsoft Excel (.xlsx) workbooks without Excel import wizard warnings.",
    metaDescription: "Free online TSV to Excel converter. Transform tab-separated files into formatted XLSX spreadsheets in your browser. Fast, private, and zero uploads.",
    about: "Opening raw TSV files in Microsoft Excel often triggers encoding warnings or leads to messy multi-step text import wizards. ConvertSheet creates native, pre-formatted .xlsx workbooks directly in your browser memory so you can open your data in Excel with one click.",
    howTo: [
      { step: 1, title: "Provide TSV Data", description: "Upload your .tsv document or paste tab-separated rows directly into the workspace." },
      { step: 2, title: "Preview Spreadsheet", description: "Check column headers, row counts, and configure custom worksheet names." },
      { step: 3, title: "Download Excel Workbook", description: "Click 'Convert & Download' to receive a native .xlsx spreadsheet." }
    ],
    faqs: [
      { question: "Does opening the converted file require the Excel Import Wizard?", answer: "No! ConvertSheet outputs a genuine, binary .xlsx workbook that opens directly in Microsoft Excel, Apple Numbers, and Google Sheets." },
      { question: "Does it preserve leading zeros in codes and IDs?", answer: "Yes, numeric strings with leading zeros (e.g. postal codes, SKUs) are preserved to prevent Excel auto-truncation." },
      { question: "Are my files uploaded to any third party?", answer: "Never. All data parsing and Excel generation happens 100% locally in your web browser." }
    ]
  },

  "excel-to-tsv": {
    slug: "excel-to-tsv",
    sourceFormat: "Excel",
    targetFormat: "TSV",
    sourceExtension: ".xlsx",
    additionalExtensions: [".xls"],
    targetExtension: ".tsv",
    acceptedMimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ],
    category: "spreadsheets",
    engineId: "excel-to-tsv",
    isClientSide: true,
    title: "Convert Excel to TSV Online - Export XLSX to Tab-Delimited",
    subtitle: "Export Microsoft Excel (.xlsx, .xls) worksheets to clean tab-separated (.tsv) data for command-line tools and data analysis.",
    metaDescription: "Convert Excel to TSV online for free. Export XLSX worksheets into clean tab-separated files in your browser with complete privacy.",
    about: "Extract clean tab-separated data from Microsoft Excel (.xlsx and .xls) workbooks without needing an Excel license or cumbersome export dialogues. Perfect for developers preparing training data, database dumps, and Unix text processing.",
    howTo: [
      { step: 1, title: "Upload Excel File", description: "Select an .xlsx or .xls workbook from your computer or drag it into the box." },
      { step: 2, title: "Select Sheet", description: "Preview the worksheet data and verify that columns and headers align." },
      { step: 3, title: "Download TSV", description: "Download your clean, UTF-8 tab-delimited .tsv file immediately." }
    ],
    faqs: [
      { question: "Can I convert legacy .xls Excel files?", answer: "Yes, ConvertSheet supports both modern .xlsx workbooks and legacy .xls spreadsheets." },
      { question: "How does it handle multiple worksheets?", answer: "By default, the first worksheet is converted, or you can select any specific sheet name from the conversion options." },
      { question: "Is my corporate spreadsheet data safe?", answer: "100% safe. Processing occurs entirely in client-side memory without transmitting any data over the internet." }
    ]
  },

  "sql-to-csv": {
    slug: "sql-to-csv",
    sourceFormat: "SQL",
    targetFormat: "CSV",
    sourceExtension: ".sql",
    targetExtension: ".csv",
    acceptedMimeTypes: ["application/sql", "text/plain"],
    category: "data-engineering",
    engineId: "sql-to-csv",
    isClientSide: true,
    featured: true,
    badge: "Database",
    title: "Convert SQL to CSV Online - Extract Tables & INSERTs to CSV",
    subtitle: "Extract tabular data and INSERT statements from SQL dump files into clean, downloadable CSV spreadsheets in your browser.",
    metaDescription: "Free online SQL to CSV converter. Parse SQL INSERT statements and dump files into clean CSV tables locally in your browser with zero server uploads.",
    about: "Database dump files (.sql) containing hundreds or thousands of SQL INSERT statements are cumbersome to inspect without booting up a full database server. ConvertSheet parses SQL table dumps in your browser and outputs clean comma-delimited spreadsheets instantly.",
    howTo: [
      { step: 1, title: "Upload SQL Dump", description: "Select your .sql dump file or paste raw SQL INSERT statements into the editor." },
      { step: 2, title: "Inspect Table Preview", description: "Preview extracted database columns and rows before exporting." },
      { step: 3, title: "Download CSV", description: "Click 'Convert & Download' to save your clean .csv data." }
    ],
    faqs: [
      { question: "What SQL dialects are supported?", answer: "Our parser handles standard SQL, MySQL, PostgreSQL, and SQLite INSERT INTO statements with multiple row value tuples." },
      { question: "Do I need to install or run a database server?", answer: "No database server or connection credentials are required. Parsing happens directly in your browser." },
      { question: "Are confidential database dumps kept private?", answer: "Completely private. ConvertSheet runs client-side JavaScript in your browser sandbox with zero network transmission." }
    ]
  },

  "csv-to-sql": {
    slug: "csv-to-sql",
    sourceFormat: "CSV",
    targetFormat: "SQL",
    sourceExtension: ".csv",
    targetExtension: ".sql",
    acceptedMimeTypes: ["text/csv", "application/csv", "text/plain"],
    category: "data-engineering",
    engineId: "csv-to-sql",
    isClientSide: true,
    title: "Convert CSV to SQL Online - Generate INSERT Statements",
    subtitle: "Generate clean SQL INSERT statements and table migration scripts from CSV spreadsheets directly in your browser.",
    metaDescription: "Free online CSV to SQL converter. Convert CSV spreadsheets into executable SQL INSERT statements and table definitions with 100% client-side privacy.",
    about: "Transforming spreadsheet rows into database migration scripts is a routine task for backend engineers and data analysts. ConvertSheet parses CSV files, escapes quotes, handles NULL values, and generates ready-to-run SQL INSERT statements.",
    howTo: [
      { step: 1, title: "Upload CSV Data", description: "Drop your .csv file into the converter or paste comma-separated values." },
      { step: 2, title: "Configure Table Name", description: "Specify your destination database table name and review column headers." },
      { step: 3, title: "Download SQL Script", description: "Download an executable .sql file ready for execution in MySQL, Postgres, or SQLite." }
    ],
    faqs: [
      { question: "How does the converter handle quotes and special characters?", answer: "String literals are properly escaped using standard single-quote escaping ('') to prevent syntax errors and SQL injection issues." },
      { question: "Can I customize the generated table name?", answer: "Yes, you can provide a custom table name in the conversion options, or it defaults to your filename." },
      { question: "Does this require uploading client data to a server?", answer: "No. All SQL generation executes locally in client browser memory." }
    ]
  },

  "sql-to-json": {
    slug: "sql-to-json",
    sourceFormat: "SQL",
    targetFormat: "JSON",
    sourceExtension: ".sql",
    targetExtension: ".json",
    acceptedMimeTypes: ["application/sql", "text/plain"],
    category: "data-engineering",
    engineId: "sql-to-json",
    isClientSide: true,
    title: "Convert SQL to JSON Online - Array of Objects Generator",
    subtitle: "Extract SQL dump tables and INSERT statements into structured JSON arrays of objects for web APIs, frontend apps, and NoSQL databases.",
    metaDescription: "Convert SQL to JSON online for free. Transform SQL INSERT dumps into clean JSON arrays directly in your browser with zero server uploads.",
    about: "Migrating from relational databases to document stores like MongoDB, CouchDB, or web frontend mock states requires converting SQL INSERT dumps into clean JSON arrays. ConvertSheet parses SQL statements and outputs formatted JSON objects instantly.",
    howTo: [
      { step: 1, title: "Upload SQL File", description: "Select your .sql database dump or paste SQL statements into the workspace." },
      { step: 2, title: "Inspect Inferred JSON", description: "Review extracted objects, fields, and optional indentation formatting." },
      { step: 3, title: "Download JSON", description: "Save a clean, formatted .json file ready for your application." }
    ],
    faqs: [
      { question: "Can I use the output with MongoDB or REST APIs?", answer: "Yes. The generated output is a standard array of JSON objects directly consumable by MongoDB mongoimport or REST endpoints." },
      { question: "How are NULL and numeric values handled?", answer: "SQL NULLs are mapped to JSON null, while integers and floats are converted to native JSON numbers rather than strings." },
      { question: "Is my database dump private?", answer: "100% private. All processing occurs in local browser memory with zero network uploads." }
    ]
  },

  "json-to-sql": {
    slug: "json-to-sql",
    sourceFormat: "JSON",
    targetFormat: "SQL",
    sourceExtension: ".json",
    targetExtension: ".sql",
    acceptedMimeTypes: ["application/json", "text/json", "text/plain"],
    category: "data-engineering",
    engineId: "json-to-sql",
    isClientSide: true,
    title: "Convert JSON to SQL Online - Generate Database INSERTs",
    subtitle: "Convert JSON arrays and API responses into executable SQL INSERT statements for PostgreSQL, MySQL, and SQLite.",
    metaDescription: "Free online JSON to SQL converter. Convert JSON arrays of objects into clean SQL INSERT statements directly in your browser with complete privacy.",
    about: "When you receive JSON payloads from external webhooks or third-party APIs and need to ingest them into a relational database, ConvertSheet generates safe, properly escaped SQL INSERT statements in seconds.",
    howTo: [
      { step: 1, title: "Paste JSON or Upload", description: "Paste your JSON array of objects or upload a .json file." },
      { step: 2, title: "Configure Table Name", description: "Set your target SQL table name and inspect detected column names." },
      { step: 3, title: "Download SQL Script", description: "Download your ready-to-run .sql file with formatted INSERT queries." }
    ],
    faqs: [
      { question: "What JSON format is expected?", answer: "An array of objects (e.g. [{\"id\": 1, \"name\": \"Alice\"}]) or a single object. Each property becomes a database column." },
      { question: "How does it handle nested objects?", answer: "Nested objects and arrays are safely serialized as JSON strings or formatted for relational columns." },
      { question: "Are my JSON payloads kept confidential?", answer: "Always. All parsing and SQL statement generation runs entirely client-side." }
    ]
  },

  "ndjson-to-csv": {
    slug: "ndjson-to-csv",
    sourceFormat: "NDJSON",
    targetFormat: "CSV",
    sourceExtension: ".ndjson",
    additionalExtensions: [".jsonl"],
    targetExtension: ".csv",
    acceptedMimeTypes: ["application/x-ndjson", "text/plain"],
    category: "data-engineering",
    engineId: "ndjson-to-csv",
    isClientSide: true,
    title: "Convert NDJSON to CSV Online - Fast In-Browser Converter",
    subtitle: "Convert Newline-Delimited JSON (.ndjson, .jsonl) logs and streaming datasets into standard comma-separated (.csv) spreadsheets.",
    metaDescription: "Free online NDJSON to CSV converter. Transform newline-delimited JSON streams into clean CSV tables in your browser with zero data uploads.",
    about: "Newline-Delimited JSON (NDJSON) is the industry standard for logging, streaming events, and cloud telemetry. ConvertSheet flattens NDJSON streams into clean, standard CSV tables for rapid analysis in Excel or Google Sheets.",
    howTo: [
      { step: 1, title: "Upload NDJSON File", description: "Select your .ndjson or .jsonl log file or drag it into the upload box." },
      { step: 2, title: "Preview Data Grid", description: "Check parsed fields and verify row counts across your log stream." },
      { step: 3, title: "Download CSV", description: "Click 'Convert & Download' to receive your spreadsheet-ready .csv file." }
    ],
    faqs: [
      { question: "What is the difference between NDJSON and JSONL?", answer: "NDJSON (Newline-Delimited JSON) and JSONL (JSON Lines) are practically identical formats: each line contains a single valid JSON object." },
      { question: "Can this handle multi-gigabyte log files?", answer: "Yes, our client-side streaming parser processes large line-delimited records smoothly in local memory." },
      { question: "Is my server log data secure?", answer: "100% secure. Zero bytes leave your browser, ensuring confidential logs and customer PII remain private." }
    ]
  },

  "csv-to-ndjson": {
    slug: "csv-to-ndjson",
    sourceFormat: "CSV",
    targetFormat: "NDJSON",
    sourceExtension: ".csv",
    targetExtension: ".ndjson",
    acceptedMimeTypes: ["text/csv", "application/csv", "text/plain"],
    category: "data-engineering",
    engineId: "csv-to-ndjson",
    isClientSide: true,
    title: "Convert CSV to NDJSON Online - Stream & Log Generator",
    subtitle: "Convert CSV spreadsheets into Newline-Delimited JSON (.ndjson) for BigQuery, Elasticsearch, and high-throughput streaming pipelines.",
    metaDescription: "Free online CSV to NDJSON converter. Convert CSV rows into newline-delimited JSON objects directly in your browser with complete privacy.",
    about: "Transform static CSV tabular datasets into high-efficiency Newline-Delimited JSON (NDJSON) streams ready for bulk ingestion into Elasticsearch, BigQuery, Snowflake, and streaming message brokers.",
    howTo: [
      { step: 1, title: "Provide CSV File", description: "Upload your .csv document or paste comma-separated values into the editor." },
      { step: 2, title: "Preview Extracted Objects", description: "Review detected keys and JSON line formatting in the preview panel." },
      { step: 3, title: "Download NDJSON", description: "Click 'Convert & Download' to save your .ndjson stream immediately." }
    ],
    faqs: [
      { question: "Can I load the output directly into BigQuery or Elasticsearch?", answer: "Yes! BigQuery and Elasticsearch bulk API specifically require line-delimited JSON objects without enclosing brackets." },
      { question: "Are numeric values preserved as numbers?", answer: "Yes, integers and floating-point figures are properly typed rather than quoted as strings." },
      { question: "Is data uploaded to any remote server?", answer: "No. The transformation runs 100% locally in your web browser." }
    ]
  },

  "ndjson-to-excel": {
    slug: "ndjson-to-excel",
    sourceFormat: "NDJSON",
    targetFormat: "Excel",
    sourceExtension: ".ndjson",
    additionalExtensions: [".jsonl"],
    targetExtension: ".xlsx",
    acceptedMimeTypes: ["application/x-ndjson", "text/plain"],
    category: "spreadsheets",
    engineId: "ndjson-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Big Data",
    title: "Convert NDJSON to Excel Online - Free In-Browser XLSX Export",
    subtitle: "Convert Newline-Delimited JSON (.ndjson, .jsonl) datasets directly into formatted Microsoft Excel (.xlsx) workbooks.",
    metaDescription: "Convert NDJSON to Excel online for free. Transform newline-delimited JSON records into clean XLSX spreadsheets with zero server uploads.",
    about: "Business analysts and non-technical stakeholders often struggle to inspect raw NDJSON telemetry logs. ConvertSheet parses line-delimited JSON records and converts them into native, beautifully formatted Microsoft Excel spreadsheets.",
    howTo: [
      { step: 1, title: "Select NDJSON File", description: "Drop your .ndjson or .jsonl file into the converter upload area." },
      { step: 2, title: "Preview Worksheets", description: "Inspect detected columns, row counts, and customize worksheet titles." },
      { step: 3, title: "Download Excel Workbook", description: "Receive a native .xlsx spreadsheet ready for Excel, Sheets, or Numbers." }
    ],
    faqs: [
      { question: "Can I convert large NDJSON event files to Excel?", answer: "Yes, ConvertSheet efficiently constructs XLSX workbooks with tens of thousands of rows in client-side memory." },
      { question: "How does it handle nested objects in NDJSON?", answer: "Nested JSON structures are either flattened or serialized cleanly to preserve data visibility in table cells." },
      { question: "Does this require sending proprietary logs to external servers?", answer: "No. Everything runs locally in your browser memory without uploading any bytes." }
    ]
  },

  "yaml-to-excel": {
    slug: "yaml-to-excel",
    sourceFormat: "YAML",
    targetFormat: "Excel",
    sourceExtension: ".yaml",
    additionalExtensions: [".yml"],
    targetExtension: ".xlsx",
    acceptedMimeTypes: ["application/x-yaml", "text/yaml", "text/plain"],
    category: "spreadsheets",
    engineId: "yaml-to-excel",
    isClientSide: true,
    title: "Convert YAML to Excel Online - Fast, Free & Private",
    subtitle: "Transform YAML configuration files, structured dictionaries, and lists into formatted Microsoft Excel (.xlsx) spreadsheets.",
    metaDescription: "Free online YAML to Excel converter. Transform YAML documents and data arrays into clean XLSX spreadsheets in your browser with zero uploads.",
    about: "YAML is the standard configuration language for Kubernetes, CI/CD pipelines, and application settings. When teams need to present infrastructure inventories or configuration matrixes to business stakeholders, ConvertSheet converts YAML records into clean Excel spreadsheets.",
    howTo: [
      { step: 1, title: "Paste YAML or Upload File", description: "Paste raw YAML text into the editor or upload a .yaml / .yml file." },
      { step: 2, title: "Preview Table Layout", description: "Inspect extracted keys, tabular records, and sheet name options." },
      { step: 3, title: "Download Excel File", description: "Save your native .xlsx spreadsheet with one click." }
    ],
    faqs: [
      { question: "Does it support both .yaml and .yml file extensions?", answer: "Yes! Both .yaml and .yml files are accepted seamlessly." },
      { question: "Can I convert lists of objects from Kubernetes or Ansible?", answer: "Yes, arrays of dictionaries in YAML are converted into structured spreadsheet rows and columns." },
      { question: "Is my YAML configuration data uploaded to any server?", answer: "No. Parsing runs entirely in client-side browser memory, keeping your infrastructure configs strictly private." }
    ]
  },

  "excel-to-yaml": {
    slug: "excel-to-yaml",
    sourceFormat: "Excel",
    targetFormat: "YAML",
    sourceExtension: ".xlsx",
    additionalExtensions: [".xls"],
    targetExtension: ".yaml",
    acceptedMimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ],
    category: "data-engineering",
    engineId: "excel-to-yaml",
    isClientSide: true,
    title: "Convert Excel to YAML Online - Clean Structured YAML Export",
    subtitle: "Export Microsoft Excel (.xlsx, .xls) spreadsheets to structured YAML documents for configuration management and CI/CD pipelines.",
    metaDescription: "Convert Excel to YAML online for free. Transform XLSX tables into clean YAML lists and dictionaries directly in your browser with complete privacy.",
    about: "Many non-technical product and operations teams manage configuration tables in Excel. ConvertSheet converts those spreadsheets into clean, human-readable YAML documents ready for ingestion into DevOps tooling, Kubernetes manifests, and application configurations.",
    howTo: [
      { step: 1, title: "Upload Excel Spreadsheet", description: "Select your .xlsx or .xls workbook to load it into the converter." },
      { step: 2, title: "Review Records", description: "Verify that column names match your desired YAML keys." },
      { step: 3, title: "Download YAML", description: "Click 'Convert & Download' to save your validated .yaml document." }
    ],
    faqs: [
      { question: "How does the output structure look?", answer: "The converter outputs a clean list of YAML documents where each row is an object with column names as keys." },
      { question: "Can I convert older .xls spreadsheets?", answer: "Yes, both modern .xlsx and legacy .xls files are supported." },
      { question: "Are my spreadsheets uploaded to any cloud service?", answer: "Never. The conversion executes entirely in your browser using client-side JavaScript." }
    ]
  },

  "jpg-to-png": {
    slug: "jpg-to-png",
    sourceFormat: "JPG",
    targetFormat: "PNG",
    sourceExtension: ".jpg",
    additionalExtensions: [".jpeg"],
    targetExtension: ".png",
    acceptedMimeTypes: ["image/jpeg", "image/jpg"],
    category: "utility",
    engineId: "jpg-to-png",
    isClientSide: true,
    featured: true,
    badge: "Popular",
    title: "Convert JPG to PNG Online - Free, Fast & Lossless Transparency",
    subtitle: "Convert JPEG and JPG pictures to crisp PNG images with lossless color accuracy. 100% private in-browser canvas conversion.",
    metaDescription: "Convert JPG to PNG online for free. Fast, high-resolution JPEG to PNG converter running 100% in your browser. Zero server uploads and complete privacy.",
    about: "Converting JPG photographs or graphics to PNG is vital for designers, web developers, and digital creators requiring lossless compression and sharp line reproduction without compression artifacts.\n\nConvertSheet runs 100% client-side in your browser using hardware-accelerated HTML5 Canvas APIs. Your private images are never sent over the wire or stored on remote servers.",
    howTo: [
      { step: 1, title: "Select or Drop JPG Files", description: "Upload or drag-and-drop your JPG/JPEG files directly into the converter." },
      { step: 2, title: "Customize Quality & Scale", description: "Choose maximum resolution and export settings in the live preview." },
      { step: 3, title: "Download Converted PNG", description: "Click download to instantly save your converted PNG file or batch ZIP archive." }
    ],
    faqs: [
      { question: "Does converting JPG to PNG improve quality?", answer: "It prevents further generation loss and compression artifacts when editing or saving repeatedly, though it cannot recover details already discarded by JPEG compression." },
      { question: "Are my images uploaded to any cloud servers?", answer: "No. Conversion uses native HTML5 Canvas rendering in your local browser memory with zero server uploads." },
      { question: "Can I convert multiple JPG files at once?", answer: "Yes, you can upload multiple images in Batch mode and download them in a single convenient ZIP file." }
    ]
  },

  "png-to-jpg": {
    slug: "png-to-jpg",
    sourceFormat: "PNG",
    targetFormat: "JPG",
    sourceExtension: ".png",
    targetExtension: ".jpg",
    acceptedMimeTypes: ["image/png"],
    category: "utility",
    engineId: "png-to-jpg",
    isClientSide: true,
    featured: true,
    badge: "Fast",
    title: "Convert PNG to JPG Online - Reduce Image File Size Instantly",
    subtitle: "Convert PNG graphics and screenshots to compact, web-optimized JPEG images with customizable compression quality.",
    metaDescription: "Convert PNG to JPG online for free. Compress large PNG screenshots and illustrations into small JPEG files directly in your browser with zero data uploads.",
    about: "PNG files often consume unnecessary megabytes when high transparency is not required. Converting PNG to JPG drastically reduces file sizes for email attachments, website publishing, and upload limits.\n\nConvertSheet automatically handles alpha transparency by smoothly blending with a clean white background, producing optimized, high-fidelity JPEG exports.",
    howTo: [
      { step: 1, title: "Upload PNG Files", description: "Drag and drop your PNG images or screenshots into the tool." },
      { step: 2, title: "Adjust Compression", description: "Fine-tune JPEG quality slider to achieve the optimal balance of clarity and file size." },
      { step: 3, title: "Download JPG", description: "Download your compressed JPEG picture immediately." }
    ],
    faqs: [
      { question: "What happens to transparent backgrounds in PNG?", answer: "Because JPEG does not support transparency, transparent pixels are cleanly blended into a solid white background." },
      { question: "How much smaller will the JPG file be?", answer: "Typically between 50% to 80% smaller than an uncompressed 24-bit PNG screenshot." },
      { question: "Is this tool safe for confidential screenshots?", answer: "Yes, 100% private. All rendering happens in your browser with zero server data retention." }
    ]
  },

  "webp-to-jpg": {
    slug: "webp-to-jpg",
    sourceFormat: "WebP",
    targetFormat: "JPG",
    sourceExtension: ".webp",
    targetExtension: ".jpg",
    acceptedMimeTypes: ["image/webp"],
    category: "utility",
    engineId: "webp-to-jpg",
    isClientSide: true,
    featured: false,
    title: "Convert WebP to JPG Online - Universal Compatibility",
    subtitle: "Turn Google WebP images from web pages into universally compatible JPEG files that open in any legacy photo viewer or editor.",
    metaDescription: "Convert WebP to JPG online for free. Open WebP files in older software by converting them to standard JPEG directly in your browser.",
    about: "While WebP is the modern standard for web performance, many desktop image editors, older operating systems, and document upload portals do not support the WebP format. ConvertSheet converts WebP images to standard JPEG pictures in milliseconds right in your browser.",
    howTo: [
      { step: 1, title: "Upload WebP File", description: "Select the saved WebP image from your computer or phone." },
      { step: 2, title: "Preview Image", description: "Inspect dimensions and choose target compression quality." },
      { step: 3, title: "Download JPG", description: "Save the universally compatible JPEG file." }
    ],
    faqs: [
      { question: "Why do downloaded web images save as WebP?", answer: "Modern websites serve WebP because it is smaller, but converting to JPG makes it easy to open in Photoshop, Word, or older photo viewers." },
      { question: "Does this require installing any software?", answer: "No software or browser extensions needed. It works completely inside your modern web browser." },
      { question: "Is there a limit on how many images I can convert?", answer: "No artificial limits. You can convert individual images or multiple files simultaneously." }
    ]
  },

  "svg-to-png": {
    slug: "svg-to-png",
    sourceFormat: "SVG",
    targetFormat: "PNG",
    sourceExtension: ".svg",
    targetExtension: ".png",
    acceptedMimeTypes: ["image/svg+xml"],
    category: "utility",
    engineId: "svg-to-png",
    isClientSide: true,
    featured: false,
    title: "Convert SVG to PNG Online - High-Resolution Rasterizer",
    subtitle: "Render scalable vector graphics (SVG) into crisp, high-resolution PNG raster images with preserved transparency.",
    metaDescription: "Convert SVG to PNG online for free. Rasterize vector icons and logos into crisp, high-DPI transparent PNG files with zero server uploads.",
    about: "SVG vector files are perfect for responsive websites, but email clients, social media platforms, and office applications often require raster PNG images. ConvertSheet renders your SVG vectors into pixel-perfect PNG images at any desired resolution with alpha transparency preserved.",
    howTo: [
      { step: 1, title: "Upload SVG Graphic", description: "Drop your vector .svg file into the converter." },
      { step: 2, title: "Set Output Resolution", description: "Choose the target width or let the engine preserve the vector's native viewBox dimensions." },
      { step: 3, title: "Download PNG", description: "Save your sharp transparent PNG image." }
    ],
    faqs: [
      { question: "Is background transparency maintained?", answer: "Yes, SVG transparency is completely preserved in the resulting PNG export." },
      { question: "Does the output remain sharp at high resolutions?", answer: "Yes, because SVG is mathematical vector data, it can be rasterized at 2x, 3x, or 4x scale without pixelation." },
      { question: "Is my proprietary SVG design uploaded anywhere?", answer: "Never. Vector parsing and canvas rasterization take place 100% on your local machine." }
    ]
  },

  "jpg-to-pdf": {
    slug: "jpg-to-pdf",
    sourceFormat: "JPG",
    targetFormat: "PDF",
    sourceExtension: ".jpg",
    additionalExtensions: [".jpeg"],
    targetExtension: ".pdf",
    acceptedMimeTypes: ["image/jpeg", "image/jpg"],
    category: "utility",
    engineId: "jpg-to-pdf",
    isClientSide: true,
    featured: true,
    badge: "Popular",
    title: "Convert JPG to PDF Online - Free Image to Document Converter",
    subtitle: "Convert JPEG and JPG pictures, receipts, and scans into professional, shareable PDF documents. 100% private in your browser.",
    metaDescription: "Convert JPG to PDF online for free. Package receipts, IDs, and photos into print-ready PDF files directly in your browser. Zero server uploads.",
    about: "Packaging photos, receipts, or contracts into PDF format makes them standard, secure, and ready for official email attachments and portal submissions. ConvertSheet embeds your JPEG pictures into clean Adobe PDF documents locally using client-side WebAssembly.",
    howTo: [
      { step: 1, title: "Upload JPG Photo or Scan", description: "Select the JPG files you want to turn into a PDF." },
      { step: 2, title: "Review Document Setup", description: "The converter scales the image to natural page dimensions." },
      { step: 3, title: "Download PDF", description: "Click download to instantly receive your standardized .pdf file." }
    ],
    faqs: [
      { question: "Is it safe to convert private IDs or tax receipts?", answer: "Yes, absolutely. Because ConvertSheet runs client-side with zero server retention, your sensitive documents never leave your device." },
      { question: "Does it reduce image clarity?", answer: "No, the full original JPEG resolution is embedded directly inside the PDF container." },
      { question: "Can I print the resulting PDF?", answer: "Yes, the generated PDF is 100% standard Adobe Acrobat format compatible with all home and office printers." }
    ]
  },

  "png-to-pdf": {
    slug: "png-to-pdf",
    sourceFormat: "PNG",
    targetFormat: "PDF",
    sourceExtension: ".png",
    targetExtension: ".pdf",
    acceptedMimeTypes: ["image/png"],
    category: "utility",
    engineId: "png-to-pdf",
    isClientSide: true,
    featured: false,
    title: "Convert PNG to PDF Online - High-Resolution Document Export",
    subtitle: "Transform PNG graphics, screenshots, and diagrams into clean, print-ready PDF documents with zero data uploaded to external servers.",
    metaDescription: "Convert PNG to PDF online for free. Turn screenshots, certificates, and illustrations into PDF documents privately in your browser.",
    about: "When you need to send screenshots, designs, or certificates in an official document format, converting PNG to PDF ensures cross-platform readability without layout shifts. ConvertSheet packages PNG graphics into standardized PDF documents instantly in browser memory.",
    howTo: [
      { step: 1, title: "Select PNG Image", description: "Drag and drop your PNG image into the upload area." },
      { step: 2, title: "Verify Dimensions", description: "Inspect the document layout and page sizing." },
      { step: 3, title: "Download PDF", description: "Save your standardized PDF file to your computer." }
    ],
    faqs: [
      { question: "Does this preserve transparency?", answer: "The PNG graphic is embedded faithfully within the PDF page canvas with clean white background handling." },
      { question: "Will my screenshots be clear in the PDF?", answer: "Yes, 100% of the original pixel fidelity is preserved without lossy re-compression." },
      { question: "Are my files uploaded to your servers?", answer: "No. Conversion executes strictly in your browser using client-side JavaScript." }
    ]
  },

  "heic-to-jpg": {
    slug: "heic-to-jpg",
    sourceFormat: "HEIC",
    targetFormat: "JPG",
    sourceExtension: ".heic",
    additionalExtensions: [".heif"],
    targetExtension: ".jpg",
    acceptedMimeTypes: ["image/heic", "image/heif"],
    category: "utility",
    engineId: "heic-to-jpg",
    isClientSide: true,
    featured: true,
    badge: "High Demand",
    title: "Convert HEIC to JPG Online - Free iPhone Photo Converter",
    subtitle: "Convert Apple HEIC and HEIF photos from iPhone or iPad into universal JPG format instantly with 100% privacy in your browser.",
    metaDescription: "Free online HEIC to JPG converter. Transform Apple iPhone HEIC pictures to high-quality JPG images directly in your browser with zero server uploads.",
    about: "Modern Apple iPhones and iPads capture photos in High Efficiency Image Container (HEIC) format by default to save storage space. However, Windows PCs, Android devices, government portals, and school application forms frequently reject .heic files. ConvertSheet lets you transform your HEIC photos into universally compatible JPEG files in seconds. Everything runs 100% locally in your browser memory, ensuring your personal and family photos are never uploaded to remote cloud servers.",
    howTo: [
      { step: 1, title: "Select HEIC Photos", description: "Choose or drag and drop your Apple iPhone .heic images into the converter." },
      { step: 2, title: "Auto-Convert", description: "Our browser engine immediately converts the photo to standard JPG format." },
      { step: 3, title: "Download JPG", description: "Download your converted JPG image ready for any device or web portal." }
    ],
    faqs: [
      { question: "Why can't my Windows PC or Android open HEIC photos?", answer: "HEIC is Apple's default compression format. Converting them to standard JPEG (.jpg) makes them universally viewable on all Windows, Android, and web platforms." },
      { question: "Are my private personal photos uploaded to your server?", answer: "No. ConvertSheet processes all conversions strictly client-side in your web browser. Zero image bytes leave your computer or phone." },
      { question: "Does converting from HEIC to JPG lose quality?", answer: "No. ConvertSheet preserves high JPEG quality (92%+) so your photos remain sharp and vibrant." }
    ]
  },

  "heic-to-png": {
    slug: "heic-to-png",
    sourceFormat: "HEIC",
    targetFormat: "PNG",
    sourceExtension: ".heic",
    additionalExtensions: [".heif"],
    targetExtension: ".png",
    acceptedMimeTypes: ["image/heic", "image/heif"],
    category: "utility",
    engineId: "heic-to-png",
    isClientSide: true,
    featured: false,
    badge: "Lossless",
    title: "Convert HEIC to PNG Online - Free Apple Photo to PNG",
    subtitle: "Convert Apple HEIC photos into lossless PNG format with transparent background support and zero cloud uploads.",
    metaDescription: "Convert HEIC to PNG online for free. Transform Apple iPhone photos to crisp, lossless PNG graphics with 100% client-side privacy.",
    about: "When you need maximum pixel clarity or want to edit Apple iPhone photos in graphic design software like Photoshop, Figma, or Canva, converting HEIC to PNG provides an uncompressed, lossless container. ConvertSheet performs the conversion directly in your browser memory without storing or logging your files.",
    howTo: [
      { step: 1, title: "Upload HEIC Image", description: "Select the .heic file from your iPhone, iPad, or computer." },
      { step: 2, title: "Convert to PNG", description: "The image is rendered locally into a high-fidelity PNG graphic." },
      { step: 3, title: "Download PNG", description: "Click download to save your crisp PNG image to your downloads folder." }
    ],
    faqs: [
      { question: "What is the difference between converting to JPG vs PNG?", answer: "JPG is smaller in file size and ideal for general sharing, while PNG is lossless and ideal for editing, graphic design, and preserving sharp text or lines." },
      { question: "Is this converter free to use?", answer: "Yes, 100% free with no account creation, daily conversion limits, or watermarks." },
      { question: "Does it work on mobile browsers?", answer: "Yes, you can convert HEIC files directly on iOS Safari or Android Chrome." }
    ]
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
  category: "spreadsheets" | "data-engineering" | "utility"
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
