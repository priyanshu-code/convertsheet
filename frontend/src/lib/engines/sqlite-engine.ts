import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import * as XLSX from "xlsx";
import {
  IConverterEngine,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { sanitizeSheetName } from "@/lib/utils";

let sqlPromise: Promise<SqlJsStatic> | null = null;

function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    // In browser environment, locate wasm from CDN. In Node (vitest/ssr), allow sql.js default resolution.
    const isBrowser =
      typeof window !== "undefined" && typeof window.document !== "undefined";
    sqlPromise = isBrowser
      ? initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        })
      : initSqlJs();
  }
  return sqlPromise;
}

function formatSqliteValue(val: unknown): unknown {
  if (val instanceof Uint8Array) {
    return `[BLOB: ${val.byteLength} bytes]`;
  }
  return val;
}

function calculateColumnWidthsFromValues(
  columns: string[],
  rowValuesList: unknown[][]
): { wch: number }[] {
  const sampleLimit = Math.min(rowValuesList.length, 100);
  return columns.map((col, colIdx) => {
    let maxLen = col.length;
    for (let i = 0; i < sampleLimit; i++) {
      const val = rowValuesList[i][colIdx];
      const strLen = val !== null && val !== undefined ? String(val).length : 0;
      if (strLen > maxLen) {
        maxLen = strLen;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
  });
}

export class SqliteToExcelEngine implements IConverterEngine {
  private async loadDatabase(file: File): Promise<Database | null> {
    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return null;
    }
    const SQL = await getSqlJs();
    return new SQL.Database(new Uint8Array(arrayBuffer));
  }

  private getUserTables(db: Database): string[] {
    const res = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rootpage ASC, rowid ASC"
    );
    if (!res || res.length === 0 || !res[0].values) {
      return [];
    }
    return res[0].values.map((row) => String(row[0]));
  }

  async parsePreview(
    file: File,
    maxRows?: number,
    tableName?: string
  ): Promise<TabularData> {
    const db = await this.loadDatabase(file);
    if (!db) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    try {
      const tables = this.getUserTables(db);
      if (tables.length === 0) {
        return { columns: [], rows: [], totalRows: 0 };
      }

      const targetTable =
        tableName && tables.includes(tableName) ? tableName : tables[0];
      const escapedTableName = `"${targetTable.replace(/"/g, '""')}"`;

      const countRes = db.exec(`SELECT COUNT(*) FROM ${escapedTableName}`);
      const totalRows =
        countRes.length > 0 && countRes[0].values.length > 0
          ? Number(countRes[0].values[0][0])
          : 0;

      const limit = maxRows !== undefined ? maxRows : 10;
      const query =
        limit > 0
          ? `SELECT * FROM ${escapedTableName} LIMIT ${limit}`
          : `SELECT * FROM ${escapedTableName}`;

      const dataRes = db.exec(query);
      if (dataRes.length === 0) {
        const pragmaRes = db.exec(`PRAGMA table_info(${escapedTableName})`);
        const columns =
          pragmaRes.length > 0 && pragmaRes[0].values
            ? pragmaRes[0].values.map((col) => String(col[1]))
            : [];
        return {
          columns,
          rows: [],
          totalRows,
          tables,
          activeTable: targetTable,
        };
      }

      const columns = dataRes[0].columns;
      const rows = dataRes[0].values.map((rowValues) => {
        const rowObj: Record<string, unknown> = {};
        columns.forEach((col, idx) => {
          rowObj[col] = formatSqliteValue(rowValues[idx]);
        });
        return rowObj;
      });

      return {
        columns,
        rows,
        totalRows,
        tables,
        activeTable: targetTable,
      };
    } finally {
      db.close();
    }
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const db = await this.loadDatabase(file);
    if (!db) {
      throw new Error("SQLite file is empty");
    }

    try {
      const tables = this.getUserTables(db);
      if (tables.length === 0) {
        throw new Error("SQLite database contains no tables");
      }

      const workbook = XLSX.utils.book_new();
      const usedSheetNames = new Set<string>();

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const escapedTableName = `"${table.replace(/"/g, '""')}"`;

        const pragmaRes = db.exec(`PRAGMA table_info(${escapedTableName})`);
        let columns: string[] = [];
        if (pragmaRes.length > 0 && pragmaRes[0].values) {
          columns = pragmaRes[0].values.map((col) => String(col[1]));
        }

        const dataRes = db.exec(`SELECT * FROM ${escapedTableName}`);
        if (dataRes.length > 0) {
          columns = dataRes[0].columns;
        }

        const rawRowValues = dataRes.length > 0 ? dataRes[0].values : [];
        const formattedRowValues = rawRowValues.map((rowValues) =>
          rowValues.map(formatSqliteValue)
        );
        const aoa: unknown[][] = [columns, ...formattedRowValues];

        const worksheet = XLSX.utils.aoa_to_sheet(aoa);

        // Auto column widths computed directly from sampled row values without creating intermediate objects
        worksheet["!cols"] = calculateColumnWidthsFromValues(columns, formattedRowValues);

        // Sanitize sheet name and ensure uniqueness
        let baseSheetName = sanitizeSheetName(table);
        if (tables.length === 1 && options?.sheetName) {
          baseSheetName = sanitizeSheetName(options.sheetName);
        }

        let sheetName = baseSheetName;
        let counter = 1;
        while (usedSheetNames.has(sheetName.toLowerCase())) {
          const suffix = `_${counter}`;
          const maxBaseLen = 31 - suffix.length;
          sheetName = `${baseSheetName.slice(0, maxBaseLen)}${suffix}`;
          counter++;
        }
        usedSheetNames.add(sheetName.toLowerCase());

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

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
    } finally {
      db.close();
    }
  }
}

export const sqliteToExcelEngine = new SqliteToExcelEngine();
