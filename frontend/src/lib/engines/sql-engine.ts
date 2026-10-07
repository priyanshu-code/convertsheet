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

function parseSqlInserts(sqlText: string): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];
  // Match INSERT INTO table (col1, col2, ...) VALUES (val1, val2, ...);
  const insertRegex = /INSERT\s+INTO\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)\s*VALUES\s*(.+?);/gis;
  let match: RegExpExecArray | null;

  while ((match = insertRegex.exec(sqlText)) !== null) {
    const rawCols = match[2];
    const rawValuesList = match[3];

    const columns = rawCols
      .split(",")
      .map((c) => c.trim().replace(/[`"']/g, ""));

    // Extract tuples (...), (...)
    const tupleRegex = /\(([^)]+)\)/g;
    let tupleMatch: RegExpExecArray | null;

    while ((tupleMatch = tupleRegex.exec(rawValuesList)) !== null) {
      const rawVals = tupleMatch[1];
      // Basic CSV-like split respecting single-quoted strings
      const values: unknown[] = [];
      const valRegex = /'((?:''|[^'])*)'|NULL|(\d+(?:\.\d+)?)|([^,]+)/gi;
      let vMatch: RegExpExecArray | null;

      while ((vMatch = valRegex.exec(rawVals)) !== null) {
        if (vMatch[1] !== undefined) {
          values.push(vMatch[1].replace(/''/g, "'"));
        } else if (vMatch[0].trim().toUpperCase() === "NULL") {
          values.push(null);
        } else if (vMatch[2] !== undefined) {
          values.push(Number(vMatch[2]));
        } else {
          const trimmed = vMatch[0].trim();
          if (trimmed.length > 0) values.push(trimmed);
        }
      }

      if (values.length > 0) {
        const row: Record<string, unknown> = {};
        columns.forEach((col, idx) => {
          row[col] = values[idx] !== undefined ? values[idx] : null;
        });
        records.push(row);
      }
    }
  }

  // Fallback: If no standard INSERT INTO matched, attempt line-by-line simple parse
  if (records.length === 0) {
    const simpleInsert = /VALUES\s*\(([^)]+)\)/gi;
    let sMatch: RegExpExecArray | null;
    let rowIdx = 1;
    while ((sMatch = simpleInsert.exec(sqlText)) !== null) {
      const rawVals = sMatch[1].split(",").map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
      const row: Record<string, unknown> = {};
      rawVals.forEach((val, idx) => {
        row[`col_${idx + 1}`] = val;
      });
      records.push(row);
      rowIdx++;
    }
  }

  return records;
}

function escapeSqlValue(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "1" : "0";
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

// SQL to CSV
export class SqlToCsvEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "sql-to-csv";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) return { columns: [], rows: [], totalRows: 0 };
    const rows = parseSqlInserts(text);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return {
      columns,
      rows: maxRows > 0 ? rows.slice(0, maxRows) : rows,
      totalRows: rows.length,
    };
  }

  async convert(file: File): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("SQL file is empty");
    const rows = parseSqlInserts(text);
    if (rows.length === 0) throw new Error("No INSERT statements or tabular data found in SQL file");
    const csv = Papa.unparse(rows, { delimiter: "," });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.csv`,
      mimeType: "text/csv",
    };
  }
}

// CSV to SQL
export class CsvToSqlEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "csv-to-sql";

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

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("CSV file is empty");
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: "greedy",
    });
    const tableName = (options?.sheetName || file.name.replace(/\.[^/.]+$/, "") || "table_data").replace(/[^a-zA-Z0-9_]/g, "_");
    const columns = parsed.meta.fields || [];
    const colList = columns.map((c) => `\`${c}\``).join(", ");

    const insertStatements = parsed.data.map((row) => {
      const values = columns.map((col) => escapeSqlValue(row[col])).join(", ");
      return `INSERT INTO \`${tableName}\` (${colList}) VALUES (${values});`;
    });

    const sqlContent = `-- Generated by ConvertSheet.com\n-- Table: ${tableName}\n\n` + insertStatements.join("\n") + "\n";
    const blob = new Blob([sqlContent], { type: "application/sql" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.sql`,
      mimeType: "application/sql",
    };
  }
}

// SQL to JSON
export class SqlToJsonEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "sql-to-json";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) return { columns: [], rows: [], totalRows: 0 };
    const rows = parseSqlInserts(text);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return {
      columns,
      rows: maxRows > 0 ? rows.slice(0, maxRows) : rows,
      totalRows: rows.length,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("SQL file is empty");
    const rows = parseSqlInserts(text);
    const jsonString = options?.prettify ? JSON.stringify(rows, null, 2) : JSON.stringify(rows);
    const blob = new Blob([jsonString], { type: "application/json" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.json`,
      mimeType: "application/json",
    };
  }
}

// JSON to SQL
export class JsonToSqlEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "json-to-sql";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) return { columns: [], rows: [], totalRows: 0 };
    const parsed = JSON.parse(text);
    const records: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : [parsed];
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    return {
      columns,
      rows: maxRows > 0 ? records.slice(0, maxRows) : records,
      totalRows: records.length,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("JSON file is empty");
    const parsed = JSON.parse(text);
    const records: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : [parsed];
    if (records.length === 0) throw new Error("JSON contains no records");

    const tableName = (options?.sheetName || file.name.replace(/\.[^/.]+$/, "") || "records").replace(/[^a-zA-Z0-9_]/g, "_");
    const columns = Object.keys(records[0]);
    const colList = columns.map((c) => `\`${c}\``).join(", ");

    const insertStatements = records.map((row) => {
      const values = columns.map((col) => escapeSqlValue(row[col])).join(", ");
      return `INSERT INTO \`${tableName}\` (${colList}) VALUES (${values});`;
    });

    const sqlContent = `-- Generated by ConvertSheet.com\n-- Table: ${tableName}\n\n` + insertStatements.join("\n") + "\n";
    const blob = new Blob([sqlContent], { type: "application/sql" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.sql`,
      mimeType: "application/sql",
    };
  }
}

export const sqlToCsvEngine = new SqlToCsvEngine();
export const csvToSqlEngine = new CsvToSqlEngine();
export const sqlToJsonEngine = new SqlToJsonEngine();
export const jsonToSqlEngine = new JsonToSqlEngine();
