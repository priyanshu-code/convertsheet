export interface TabularData {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  tables?: string[];
  activeTable?: string;
}

export interface ConversionOptions {
  delimiter?: string;
  sheetName?: string;
  prettify?: boolean;
  flattenNested?: boolean;
}

export interface ConversionOutput {
  blob: Blob;
  filename: string;
  mimeType: string;
}

export interface IConverterEngine {
  parsePreview(file: File, maxRows?: number, tableName?: string): Promise<TabularData>;
  convert(file: File, options?: ConversionOptions): Promise<ConversionOutput>;
}

export type ConverterEngineId =
  | "csv-to-excel"
  | "json-to-excel"
  | "excel-to-json"
  | "excel-to-csv"
  | "xml-to-excel"
  | "tally-xml-to-excel"
  | "parquet-to-excel"
  | "parquet-to-csv"
  | "parquet-to-json"
  | "csv-to-parquet"
  | "json-to-parquet"
  | "jsonl-to-excel"
  | "jsonl-to-csv"
  | "csv-to-jsonl"
  | "excel-to-jsonl"
  | "json-to-jsonl"
  | "markdown-to-excel"
  | "sqlite-to-excel"
  | "json-to-ndjson"
  | "json-to-schema"
  | "tsv-to-csv"
  | "csv-to-tsv"
  | "tsv-to-excel"
  | "excel-to-tsv"
  | "sql-to-csv"
  | "csv-to-sql"
  | "sql-to-json"
  | "json-to-sql"
  | "ndjson-to-csv"
  | "csv-to-ndjson"
  | "ndjson-to-excel"
  | "yaml-to-excel"
  | "excel-to-yaml"
  | "image-converter"
  | "jpg-to-png"
  | "png-to-jpg"
  | "webp-to-jpg"
  | "svg-to-png"
  | "heic-to-jpg"
  | "heic-to-png"
  | "jpg-to-pdf"
  | "png-to-pdf"
  | "pdf-to-jpg";
