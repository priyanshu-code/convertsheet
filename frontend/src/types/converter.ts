export interface TabularData {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
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
  parsePreview(file: File, maxRows?: number): Promise<TabularData>;
  convert(file: File, options?: ConversionOptions): Promise<ConversionOutput>;
}

export type ConverterEngineId =
  | "csv-to-excel"
  | "json-to-excel"
  | "excel-to-json"
  | "excel-to-csv"
  | "xml-to-excel"
  | "tally-xml-to-excel";
