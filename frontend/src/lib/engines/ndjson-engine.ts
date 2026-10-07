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

function parseNdjsonLines(text: string): Record<string, unknown>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const records: Record<string, unknown>[] = [];
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj && typeof obj === "object") {
        records.push(obj as Record<string, unknown>);
      }
    } catch {
      // Skip invalid JSON lines
    }
  }
  return records;
}

// NDJSON to CSV
export class NdjsonToCsvEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "ndjson-to-csv";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) return { columns: [], rows: [], totalRows: 0 };
    const records = parseNdjsonLines(text);
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    return {
      columns,
      rows: maxRows > 0 ? records.slice(0, maxRows) : records,
      totalRows: records.length,
    };
  }

  async convert(file: File): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("NDJSON file is empty");
    const records = parseNdjsonLines(text);
    if (records.length === 0) throw new Error("No valid JSON objects found in NDJSON");
    const csv = Papa.unparse(records, { delimiter: "," });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.csv`,
      mimeType: "text/csv",
    };
  }
}

// CSV to NDJSON
export class CsvToNdjsonEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "csv-to-ndjson";

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
    const ndjsonContent = (parsed.data || []).map((row) => JSON.stringify(row)).join("\n") + "\n";
    const blob = new Blob([ndjsonContent], { type: "application/x-ndjson" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.ndjson`,
      mimeType: "application/x-ndjson",
    };
  }
}

// NDJSON to Excel
export class NdjsonToExcelEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "ndjson-to-excel";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) return { columns: [], rows: [], totalRows: 0 };
    const records = parseNdjsonLines(text);
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    return {
      columns,
      rows: maxRows > 0 ? records.slice(0, maxRows) : records,
      totalRows: records.length,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("NDJSON file is empty");
    const records = parseNdjsonLines(text);
    if (records.length === 0) throw new Error("No valid JSON objects found in NDJSON");

    const worksheet = XLSX.utils.json_to_sheet(records);
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

export const ndjsonToCsvEngine = new NdjsonToCsvEngine();
export const csvToNdjsonEngine = new CsvToNdjsonEngine();
export const ndjsonToExcelEngine = new NdjsonToExcelEngine();
