import { ConverterConfig } from "@/types/registry";

export const CONVERTER_REGISTRY = {
  "json-to-excel": {
    slug: "json-to-excel",
    sourceFormat: "JSON",
    targetFormat: "Excel",
    sourceExtension: ".json",
    targetExtension: ".xlsx",
    acceptedMimeTypes: ["application/json", "text/json"],
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
    title: "Convert XML to Excel Online - Fast & Private XML to XLSX",
    subtitle:
      "Parse XML documents and export structured Excel (.xlsx) workbooks directly in your browser with complete privacy.",
    metaDescription:
      "Free online XML to Excel converter. Transform complex XML documents, RSS feeds, and data dumps into clean, multi-column Excel spreadsheets with zero server uploads.",
    engineId: "xml-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Fast",
    howTo: [
      {
        step: 1,
        title: "Upload XML File",
        description:
          "Drop your .xml file into the converter box or browse to select it from your device.",
      },
      {
        step: 2,
        title: "Preview Structured Data",
        description:
          "The engine automatically identifies repeating node structures and displays an instant preview of rows and columns.",
      },
      {
        step: 3,
        title: "Export to Excel",
        description:
          "Click 'Convert & Download' to obtain your clean, styled Excel workbook (.xlsx) ready for analysis.",
      },
    ],
    faqs: [
      {
        question: "How does the XML to Excel converter identify table rows?",
        answer:
          "The engine recursively traverses your XML hierarchy to detect repeating node elements (such as records, items, or entries) and maps their attributes and child tags into spreadsheet columns.",
      },
      {
        question: "Are my XML files stored or logged anywhere?",
        answer:
          "Never. All XML parsing is executed locally within your web browser. No files are uploaded to our servers, ensuring total compliance with privacy and confidential data policies.",
      },
      {
        question: "Does it support XML files with attributes and CDATA?",
        answer:
          "Yes. XML attributes, text nodes, and CDATA sections are safely extracted and mapped to tabular columns without data loss.",
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
    title: "Convert CSV to Excel Online - Fast & Private Delimited to XLSX",
    subtitle:
      "Convert CSV, TSV, and delimited text files into styled Microsoft Excel spreadsheets with auto-delimiter detection and UTF-8 encoding.",
    metaDescription:
      "Free online CSV to Excel converter. Auto-detects delimiters (comma, semicolon, tab, pipe) and generates formatted XLSX workbooks securely in your browser.",
    engineId: "csv-to-excel",
    isClientSide: true,
    featured: true,
    badge: "Instant",
    howTo: [
      {
        step: 1,
        title: "Select CSV File",
        description:
          "Drag and drop your .csv, .tsv, or delimited text file into the upload area.",
      },
      {
        step: 2,
        title: "Auto-Detect & Preview",
        description:
          "Our parser automatically detects delimiters (commas, semicolons, tabs, or pipes) and presents a 10-row data preview.",
      },
      {
        step: 3,
        title: "Download XLSX",
        description:
          "Choose your preferred sheet name and click 'Convert & Download' to receive your native Excel spreadsheet.",
      },
    ],
    faqs: [
      {
        question: "Can it auto-detect delimiters like semicolons or tabs?",
        answer:
          "Yes. ConvertSheet automatically detects whether your file uses commas, semicolons, tabs, or pipes, parsing each column correctly.",
      },
      {
        question: "Does this handle special characters and international accents?",
        answer:
          "Yes. Files are read with UTF-8 encoding support, preserving international characters, accents, currency symbols, and emoji accurately.",
      },
      {
        question: "Can I convert large CSV files without freezing my browser?",
        answer:
          "Yes. ConvertSheet utilizes streaming PapaParse technology to process large CSVs efficiently without UI lockup.",
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
    title: "Convert Excel to JSON Online - Fast & Clean Spreadsheet Extraction",
    subtitle:
      "Extract Excel spreadsheets (.xlsx, .xls) into clean, valid JSON arrays or objects 100% privately in your browser.",
    metaDescription:
      "Convert Excel to JSON online for free. Transform XLSX and XLS workbooks into structured, formatted JSON data arrays instantly with zero server uploads.",
    engineId: "excel-to-json",
    isClientSide: true,
    featured: true,
    badge: "Developer Favorite",
    howTo: [
      {
        step: 1,
        title: "Upload Excel Workbook",
        description:
          "Drag and drop your .xlsx or .xls file into the upload dropzone.",
      },
      {
        step: 2,
        title: "Preview Tabular Records",
        description:
          "Inspect the sheet data in our tabular preview and toggle options like formatted/prettified JSON output.",
      },
      {
        step: 3,
        title: "Download JSON File",
        description:
          "Click 'Convert & Download' to save your validated JSON file directly to your computer.",
      },
    ],
    faqs: [
      {
        question: "Does this converter support older .xls files as well as .xlsx?",
        answer:
          "Yes. Both modern OpenXML (.xlsx) and legacy binary Excel (.xls) files are fully supported.",
      },
      {
        question: "Can I choose between compact and prettified JSON?",
        answer:
          "Yes. You can toggle formatted JSON for readable indented output or compact JSON for optimized file size and API payloads.",
      },
      {
        question: "How does it handle multiple sheets or empty cells?",
        answer:
          "The active worksheet is exported by default, and empty cells are handled cleanly according to standard JSON conventions.",
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
    title: "Convert Excel to CSV Online - Fast, Private & UTF-8 Safe",
    subtitle:
      "Export Excel spreadsheets (.xlsx, .xls) to UTF-8 encoded CSV files compatible with any database, CRM, or data science tool.",
    metaDescription:
      "Free online Excel to CSV converter. Export XLSX and XLS worksheets to UTF-8 CSV with custom delimiter support and complete data privacy.",
    engineId: "excel-to-csv",
    isClientSide: true,
    featured: true,
    badge: "UTF-8 Ready",
    howTo: [
      {
        step: 1,
        title: "Upload Excel File",
        description:
          "Choose your .xlsx or .xls file to convert.",
      },
      {
        step: 2,
        title: "Preview & Select Delimiter",
        description:
          "Verify the preview table and choose your preferred delimiter (comma, semicolon, tab).",
      },
      {
        step: 3,
        title: "Download CSV",
        description:
          "Click 'Convert & Download' to download a clean UTF-8 encoded CSV with proper byte-order mark (BOM) for universal compatibility.",
      },
    ],
    faqs: [
      {
        question: "Why does ConvertSheet include a UTF-8 BOM?",
        answer:
          "A UTF-8 Byte Order Mark ensures that programs like Microsoft Excel, Numbers, and Google Sheets correctly display non-ASCII characters without encoding glitches.",
      },
      {
        question: "Can I customize the delimiter?",
        answer:
          "Yes. You can select standard comma (,), semicolon (;), or tab delimiters to match your database or importing system requirements.",
      },
      {
        question: "Are my confidential business spreadsheets safe?",
        answer:
          "100% safe. The conversion executes entirely within your browser's memory. No data is transmitted to the cloud or saved anywhere.",
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
    title: "Convert PDF to Excel Online - Table Extraction & OCR",
    subtitle:
      "Extract tables and tabular data from PDF documents, financial statements, and invoices into editable Microsoft Excel spreadsheets.",
    metaDescription:
      "Convert PDF tables to Excel online. Extract financial statements, invoices, and tabular reports from PDF to editable XLSX spreadsheets accurately.",
    engineId: undefined,
    isClientSide: false,
    featured: true,
    badge: "Pro / OCR",
    howTo: [
      {
        step: 1,
        title: "Select PDF Document",
        description:
          "Upload your PDF bank statement, invoice, or tabular document.",
      },
      {
        step: 2,
        title: "Automatic Table Recognition",
        description:
          "Our specialized extraction engine parses borders, columns, and data cells from the document.",
      },
      {
        step: 3,
        title: "Export Editable XLSX",
        description:
          "Download your converted Excel spreadsheet with preserved numeric formats and column alignments.",
      },
    ],
    faqs: [
      {
        question: "How are tables detected inside PDFs?",
        answer:
          "Our table detection engine analyzes line coordinates, text bounding boxes, and whitespace gaps to reconstruct clean spreadsheet grids from static PDFs.",
      },
      {
        question: "Can it extract data from scanned PDFs?",
        answer:
          "Scanned or image-based PDFs are processed through our high-accuracy OCR pipeline in ConvertSheet Pro.",
      },
      {
        question: "Does it preserve numbers and currency formatting?",
        answer:
          "Yes. Recognized numbers, dates, and currency values are cast into proper Excel data types for seamless calculation.",
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
  if (slug in CONVERTER_REGISTRY) {
    return CONVERTER_REGISTRY[slug as ConverterSlug] as ConverterConfig;
  }
  return undefined;
}

/**
 * Retrieves all converter configurations flagged as featured.
 */
export function getFeaturedConverters(): ConverterConfig[] {
  return Object.values(CONVERTER_REGISTRY).filter((c) =>
    Boolean(c.featured)
  ) as ConverterConfig[];
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


