import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  IConverterEngine,
  ConverterEngineId,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { sanitizeSheetName } from "@/lib/utils";

// TSV to CSV
export class TsvToCsvEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "tsv-to-csv";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) return { columns: [], rows: [], totalRows: 0 };
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      delimiter: "\t",
      skipEmptyLines: "greedy",
    });
    const columns = parsed.meta.fields ? [...parsed.meta.fields] : [];
    const allRows = parsed.data || [];
    return {
      columns,
      rows: maxRows > 0 ? allRows.slice(0, maxRows) : allRows,
      totalRows: allRows.length,
    };
  }

  async convert(file: File): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("TSV file is empty");
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      delimiter: "\t",
      skipEmptyLines: "greedy",
    });
    const csv = Papa.unparse(parsed.data, { delimiter: "," });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.csv`,
      mimeType: "text/csv",
    };
  }
}

// CSV to TSV
export class CsvToTsvEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "csv-to-tsv";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) return { columns: [], rows: [], totalRows: 0 };
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: "greedy",
    });
    const columns = parsed.meta.fields ? [...parsed.meta.fields] : [];
    const allRows = parsed.data || [];
    return {
      columns,
      rows: maxRows > 0 ? allRows.slice(0, maxRows) : allRows,
      totalRows: allRows.length,
    };
  }

  async convert(file: File): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("CSV file is empty");
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: "greedy",
    });
    const tsv = Papa.unparse(parsed.data, { delimiter: "\t" });
    const blob = new Blob(["\uFEFF" + tsv], { type: "text/tab-separated-values;charset=utf-8;" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.tsv`,
      mimeType: "text/tab-separated-values",
    };
  }
}

// TSV to Excel
export class TsvToExcelEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "tsv-to-excel";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) return { columns: [], rows: [], totalRows: 0 };
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      delimiter: "\t",
      skipEmptyLines: "greedy",
    });
    const columns = parsed.meta.fields ? [...parsed.meta.fields] : [];
    const allRows = parsed.data || [];
    return {
      columns,
      rows: maxRows > 0 ? allRows.slice(0, maxRows) : allRows,
      totalRows: allRows.length,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("TSV file is empty");
    const parsed = Papa.parse<unknown[]>(text, {
      header: false,
      delimiter: "\t",
      skipEmptyLines: "greedy",
    });
    const worksheet = XLSX.utils.aoa_to_sheet(parsed.data);
    const workbook = XLSX.utils.book_new();
    const sheetName = sanitizeSheetName(options?.sheetName);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", compression: true });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.xlsx`,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
}

// Excel to TSV
export class ExcelToTsvEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "excel-to-tsv";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    if (file.size === 0) return { columns: [], rows: [], totalRows: 0 };
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const targetSheet = workbook.SheetNames[0];
    if (!targetSheet || !workbook.Sheets[targetSheet]) return { columns: [], rows: [], totalRows: 0 };
    const worksheet = workbook.Sheets[targetSheet];
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
    if (!aoa || aoa.length === 0) return { columns: [], rows: [], totalRows: 0 };
    const columns = (aoa[0] || []).map((col, idx) => String(col ?? "").trim() || `Column_${idx + 1}`);
    const allRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
    return {
      columns,
      rows: maxRows > 0 ? allRows.slice(0, maxRows) : allRows,
      totalRows: allRows.length,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    if (file.size === 0) throw new Error("Excel file is empty");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const targetSheet = options?.sheetName && workbook.Sheets?.[options.sheetName]
      ? options.sheetName
      : workbook.SheetNames[0];
    const worksheet = targetSheet ? workbook.Sheets[targetSheet] : undefined;
    const tsvString = worksheet ? XLSX.utils.sheet_to_csv(worksheet, { FS: "\t" }) : "";
    const blob = new Blob(["\uFEFF" + tsvString], {
      type: "text/tab-separated-values;charset=utf-8;",
    });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.tsv`,
      mimeType: "text/tab-separated-values",
    };
  }
}

export const tsvToCsvEngine = new TsvToCsvEngine();
export const csvToTsvEngine = new CsvToTsvEngine();
export const tsvToExcelEngine = new TsvToExcelEngine();
export const excelToTsvEngine = new ExcelToTsvEngine();
