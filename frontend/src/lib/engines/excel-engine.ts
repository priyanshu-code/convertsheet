import * as XLSX from "xlsx";
import {
  IConverterEngine,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";

function parseExcelTabular(
  workbook: XLSX.WorkBook,
  maxRows?: number,
  sheetName?: string
): TabularData {
  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const targetSheet =
    sheetName && workbook.Sheets?.[sheetName]
      ? sheetName
      : workbook.SheetNames[0];

  if (!targetSheet || !workbook.Sheets || !workbook.Sheets[targetSheet]) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const worksheet = workbook.Sheets[targetSheet];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
  if (!aoa || aoa.length === 0) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const headerRow = (aoa[0] || []) as unknown[];
  const columns = headerRow.map((col, idx) => {
    const val = String(col ?? "").trim();
    return val || `Column_${idx + 1}`;
  });

  const allRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
  const limit = maxRows !== undefined ? maxRows : 10;
  const rows = limit > 0 ? allRows.slice(0, limit) : allRows;

  return {
    columns,
    rows,
    totalRows: allRows.length,
  };
}

export class ExcelToJsonEngine implements IConverterEngine {
  async parsePreview(file: File, maxRows?: number): Promise<TabularData> {
    if (file.size === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }
    const buffer = await file.arrayBuffer();
    if (buffer.byteLength === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }
    const workbook = XLSX.read(buffer, { type: "array" });
    return parseExcelTabular(workbook, maxRows);
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    if (file.size === 0) {
      throw new Error("Excel file is empty");
    }
    const buffer = await file.arrayBuffer();
    if (buffer.byteLength === 0) {
      throw new Error("Excel file is empty");
    }
    const workbook = XLSX.read(buffer, { type: "array" });
    const targetSheet =
      options?.sheetName && workbook.Sheets?.[options.sheetName]
        ? options.sheetName
        : (workbook.SheetNames || [])[0];

    const worksheet = targetSheet && workbook.Sheets ? workbook.Sheets[targetSheet] : undefined;
    const rows = worksheet
      ? XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)
      : [];

    const jsonString = options?.prettify
      ? JSON.stringify(rows, null, 2)
      : JSON.stringify(rows);

    const blob = new Blob([jsonString], { type: "application/json" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.json`,
      mimeType: "application/json",
    };
  }
}

export class ExcelToCsvEngine implements IConverterEngine {
  async parsePreview(file: File, maxRows?: number): Promise<TabularData> {
    if (file.size === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }
    const buffer = await file.arrayBuffer();
    if (buffer.byteLength === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }
    const workbook = XLSX.read(buffer, { type: "array" });
    return parseExcelTabular(workbook, maxRows);
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    if (file.size === 0) {
      throw new Error("Excel file is empty");
    }
    const buffer = await file.arrayBuffer();
    if (buffer.byteLength === 0) {
      throw new Error("Excel file is empty");
    }
    const workbook = XLSX.read(buffer, { type: "array" });
    const targetSheet =
      options?.sheetName && workbook.Sheets?.[options.sheetName]
        ? options.sheetName
        : (workbook.SheetNames || [])[0];

    const worksheet = targetSheet && workbook.Sheets ? workbook.Sheets[targetSheet] : undefined;
    const csvString = worksheet
      ? XLSX.utils.sheet_to_csv(worksheet, { FS: options?.delimiter || "," })
      : "";

    // UTF-8 BOM injection for standard spreadsheet compatibility
    const blob = new Blob(["\uFEFF" + csvString], {
      type: "text/csv;charset=utf-8;",
    });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.csv`,
      mimeType: "text/csv",
    };
  }
}

export const excelToJsonEngine = new ExcelToJsonEngine();
export const excelToCsvEngine = new ExcelToCsvEngine();
