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
    title: "CSV to Excel Converter Online — Free, Instant (.xlsx), No Upload",
    subtitle:
      "Convert CSV, TSV, semicolon, and pipe-delimited text files into authentic Microsoft Excel spreadsheets. Just paste the CSV or upload a file.",
    metaDescription:
      "Convert CSV to Excel online in one click. Just paste the CSV or upload a file. 100% private, free, and instant in your browser with zero server uploads.",
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
    title: "Convert SQLite (.db, .sqlite) to Excel (.xlsx) Online",
    subtitle:
      "Export tables from SQLite database files into formatted multi-sheet Excel spreadsheets directly in your browser with zero server uploads.",
    metaDescription:
      "Free private SQLite to Excel converter. Load .sqlite and .db database files and export all tables to native multi-sheet XLSX spreadsheets locally via WebAssembly.",
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
