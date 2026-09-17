import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  IConverterEngine,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { sanitizeSheetName } from "@/lib/utils";

function parseCellPreservingLeadingZeros(val: unknown): unknown {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (trimmed === "") return val;
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;

  // If numeric
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
    // Preserve string for codes with leading zeros (e.g. "01234", "007")
    if (/^-?0\d+/.test(trimmed)) {
      return val;
    }
    const num = Number(trimmed);
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      return num;
    }
  }
  return val;
}

export class CsvToExcelEngine implements IConverterEngine {
  async parsePreview(file: File, maxRows?: number): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: "greedy",
    });

    const columns = parsed.meta.fields ? [...parsed.meta.fields] : [];
    const allRows = parsed.data || [];
    const limit = maxRows !== undefined ? maxRows : 10;
    const rows = limit > 0 ? allRows.slice(0, limit) : allRows;

    return {
      columns,
      rows,
      totalRows: allRows.length,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) {
      throw new Error("CSV file is empty");
    }

    const parsed = Papa.parse<unknown[]>(text, {
      header: false,
      skipEmptyLines: "greedy",
      delimiter: options?.delimiter,
      dynamicTyping: false,
    });

    const rows = (parsed.data || []).map((row, rowIdx) => {
      if (rowIdx === 0) return row;
      return (row || []).map((cell) => parseCellPreservingLeadingZeros(cell));
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    const sheetName = sanitizeSheetName(options?.sheetName);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      compression: true,
    });
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

export const csvToExcelEngine = new CsvToExcelEngine();
