import * as XLSX from "xlsx";
import {
  IConverterEngine,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { sanitizeSheetName } from "@/lib/utils";

/**
 * Casts a cell string to a number or boolean if applicable,
 * while preserving codes with leading zeros (e.g. "01234", "007").
 * Also parses currency strings (e.g. "$12.50", "€99.99") and formatted
 * comma-separated numbers (e.g. "1,234.50", "$1,250.00").
 */
function parseCellPreservingLeadingZeros(val: unknown): unknown {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (trimmed === "") return val;
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;

  // Numeric check (integer, decimal, scientific notation)
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
    // Preserve string for codes with leading zeros (e.g. "01234", "007", "000")
    if (/^-?0\d+/.test(trimmed)) {
      return val;
    }
    const num = Number(trimmed);
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      return num;
    }
  }

  // Currency and formatted comma numbers (e.g. "$12.50", "€99.99", "1,234.50", "$1,250.00")
  const currencyMatch = trimmed.match(/^[$€£¥₹]?\s*([+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)\s*[$€£¥₹]?$/);
  if (currencyMatch) {
    const rawDigits = currencyMatch[1];
    // Check if raw numbers had leading zeros like 0123
    if (/^0\d+/.test(rawDigits.replace(/,/g, ""))) {
      return val;
    }
    const sanitized = rawDigits.replace(/,/g, "");
    const num = Number(sanitized);
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      return num;
    }
  }

  return val;
}

/**
 * Parses a GitHub Flavored Markdown pipe table into TabularData.
 */
export function parseMarkdownTable(text: string): TabularData {
  if (!text || !text.trim()) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Find table start: looking for header line followed by delimiter separator row
  // Separator row matches pattern like |:---|:---:|---:| or ---|--- etc.
  const separatorRegex = /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/;

  let headerIndex = -1;
  for (let i = 0; i < lines.length - 1; i++) {
    if (separatorRegex.test(lines[i + 1]) && lines[i].includes("|")) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const splitTableRow = (rowStr: string): string[] => {
    let s = rowStr.trim();
    // Strip leading unescaped pipe if present
    if (s.startsWith("|")) s = s.slice(1);
    // Strip trailing unescaped pipe if present (not preceded by backslash)
    if (/(?<!\\)\|$/.test(s)) s = s.slice(0, -1);
    return s
      .split(/(?<!\\)\|/)
      .map((cell) => cell.replace(/\\\|/g, "|").trim());
  };

  const rawHeaders = splitTableRow(lines[headerIndex]);
  const columns = rawHeaders.map((col, idx) => col || `Column_${idx + 1}`);

  const rows: Record<string, unknown>[] = [];

  for (let i = headerIndex + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("|")) {
      // Table ended
      break;
    }
    const cells = splitTableRow(line);
    const rowObj: Record<string, unknown> = {};
    columns.forEach((col, colIdx) => {
      const rawVal = colIdx < cells.length ? cells[colIdx] : "";
      rowObj[col] = parseCellPreservingLeadingZeros(rawVal);
    });
    rows.push(rowObj);
  }

  return {
    columns,
    rows,
    totalRows: rows.length,
  };
}

/**
 * Parses an HTML table into TabularData using DOMParser (or regex fallback).
 */
export function parseHtmlTable(text: string): TabularData {
  if (!text || !text.trim()) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const table = doc.querySelector("table");
    if (!table) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    let headerCells: string[] = [];
    let startRowIndex = 0;

    // Check thead or first row for th
    const ths = Array.from(rows[0].querySelectorAll("th"));
    if (ths.length > 0) {
      headerCells = ths.map((th) => (th.textContent || "").trim());
      startRowIndex = 1;
    } else {
      // If no <th> in row 0, use row 0 <td> as headers
      const tds = Array.from(rows[0].querySelectorAll("td"));
      if (tds.length > 0) {
        headerCells = tds.map((td) => (td.textContent || "").trim());
        startRowIndex = 1;
      }
    }

    if (headerCells.length === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const columns = headerCells.map((h, i) => h || `Column_${i + 1}`);
    const dataRows: Record<string, unknown>[] = [];

    for (let r = startRowIndex; r < rows.length; r++) {
      const cells = Array.from(rows[r].querySelectorAll("th, td")).map((c) =>
        (c.textContent || "").trim()
      );
      if (cells.length === 0) continue;
      const rowObj: Record<string, unknown> = {};
      columns.forEach((col, idx) => {
        const val = idx < cells.length ? cells[idx] : "";
        rowObj[col] = parseCellPreservingLeadingZeros(val);
      });
      dataRows.push(rowObj);
    }

    return {
      columns,
      rows: dataRows,
      totalRows: dataRows.length,
    };
  }

  // Fallback if DOMParser is unavailable
  const tableMatch = text.match(/<table[\s\S]*?>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    return { columns: [], rows: [], totalRows: 0 };
  }
  const rowMatches = tableMatch[1].match(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi);
  if (!rowMatches || rowMatches.length === 0) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const extractCells = (rowHtml: string): string[] => {
    const cells: string[] = [];
    const cellRegex = /<(?:th|td)[\s\S]*?>([\s\S]*?)<\/(?:th|td)>/gi;
    let match: RegExpExecArray | null;
    while ((match = cellRegex.exec(rowHtml)) !== null) {
      cells.push(match[1].replace(/<[^>]+>/g, "").trim());
    }
    return cells;
  };

  const rawHeaders = extractCells(rowMatches[0]);
  if (rawHeaders.length === 0) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const columns = rawHeaders.map((col, idx) => col || `Column_${idx + 1}`);
  const dataRows: Record<string, unknown>[] = [];

  for (let i = 1; i < rowMatches.length; i++) {
    const cells = extractCells(rowMatches[i]);
    if (cells.length === 0) continue;
    const rowObj: Record<string, unknown> = {};
    columns.forEach((col, idx) => {
      const val = idx < cells.length ? cells[idx] : "";
      rowObj[col] = parseCellPreservingLeadingZeros(val);
    });
    dataRows.push(rowObj);
  }

  return {
    columns,
    rows: dataRows,
    totalRows: dataRows.length,
  };
}

/**
 * Calculates auto column widths based on headers and data contents.
 */
function calculateColumnWidths(
  columns: string[],
  rows: Record<string, unknown>[]
): { wch: number }[] {
  return columns.map((col) => {
    let maxLen = col.length;
    // Check up to 100 rows for sizing
    const sample = rows.slice(0, 100);
    for (const row of sample) {
      const val = row[col];
      const strLen = val !== null && val !== undefined ? String(val).length : 0;
      if (strLen > maxLen) {
        maxLen = strLen;
      }
    }
    // Excel standard padding + minimum column width
    return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
  });
}

export class MarkdownTableEngine implements IConverterEngine {
  private parseContent(text: string): TabularData {
    const trimmed = text.trim();
    if (trimmed.includes("<table") || trimmed.includes("<TABLE")) {
      const htmlResult = parseHtmlTable(trimmed);
      if (htmlResult.columns.length > 0) {
        return htmlResult;
      }
    }
    return parseMarkdownTable(trimmed);
  }

  async parsePreview(file: File, maxRows?: number): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const tabular = this.parseContent(text);
    const limit = maxRows !== undefined ? maxRows : 10;
    const rows = limit > 0 ? tabular.rows.slice(0, limit) : tabular.rows;

    return {
      columns: tabular.columns,
      rows,
      totalRows: tabular.totalRows,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) {
      throw new Error("Markdown or HTML table file is empty");
    }

    const tabular = this.parseContent(text);
    if (tabular.columns.length === 0 || tabular.rows.length === 0) {
      throw new Error("No valid table structure found in markdown/HTML content");
    }

    const aoa: unknown[][] = [
      tabular.columns,
      ...tabular.rows.map((row) => tabular.columns.map((col) => row[col])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet["!cols"] = calculateColumnWidths(tabular.columns, tabular.rows);

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

export const markdownTableEngine = new MarkdownTableEngine();
