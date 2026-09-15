import * as XLSX from "xlsx";
import {
  IConverterEngine,
  ConverterEngineId,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { sanitizeSheetName } from "@/lib/utils";
import { IDuckDbClient, getDuckDbClient } from "./duckdb-client";

function generateVirtualName(prefix: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${safeName}`;
}

/**
 * Converts Newline-Delimited JSON (.jsonl / .ndjson) to Microsoft Excel (.xlsx).
 */
export class JsonlToExcelEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "jsonl-to-excel";

  constructor(private duckdbClient: IDuckDbClient = getDuckDbClient()) {}

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    if (file.size === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const vName = generateVirtualName("jsonl_prev", file.name);
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vName, buffer);

      const previewData = await this.duckdbClient.queryTabular(
        `SELECT * FROM read_json_auto('${vName}', format='newline_delimited') LIMIT ${maxRows}`,
        maxRows
      );

      let totalRows = previewData.rows.length;
      try {
        const countData = await this.duckdbClient.queryTabular(
          `SELECT count(*)::BIGINT as total FROM read_json_auto('${vName}', format='newline_delimited')`
        );
        if (countData.rows.length > 0 && typeof countData.rows[0]["total"] === "number") {
          totalRows = countData.rows[0]["total"];
        }
      } catch {
        // Fallback
      }

      return {
        columns: previewData.columns,
        rows: previewData.rows,
        totalRows,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse JSONL preview: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vName);
    }
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    if (file.size === 0) {
      throw new Error("JSONL file is empty");
    }

    const vName = generateVirtualName("jsonl_conv", file.name);
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vName, buffer);

      const tableData = await this.duckdbClient.queryTabular(
        `SELECT * FROM read_json_auto('${vName}', format='newline_delimited')`
      );

      if (tableData.rows.length === 0) {
        throw new Error("JSONL file contains no data rows");
      }

      const worksheet = XLSX.utils.json_to_sheet(tableData.rows, {
        header: tableData.columns,
      });

      const workbook = XLSX.utils.book_new();
      const sheetName = sanitizeSheetName(options?.sheetName || "Sheet1");
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const baseName = file.name.replace(/\.(jsonl|ndjson)$/i, "");
      const outputFilename = `${baseName}.xlsx`;

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      return {
        blob,
        filename: outputFilename,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`JSONL to Excel conversion failed: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vName);
    }
  }
}

/**
 * Converts Newline-Delimited JSON (.jsonl / .ndjson) to Comma-Separated Values (.csv).
 */
export class JsonlToCsvEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "jsonl-to-csv";

  constructor(private duckdbClient: IDuckDbClient = getDuckDbClient()) {}

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const excelEngine = new JsonlToExcelEngine(this.duckdbClient);
    return excelEngine.parsePreview(file, maxRows);
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    if (file.size === 0) {
      throw new Error("JSONL file is empty");
    }

    const vIn = generateVirtualName("in", file.name);
    const vOut = generateVirtualName("out", "result.csv");
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vIn, buffer);

      const delimiter = options?.delimiter || ",";
      const cleanDelimiter = delimiter === "'" ? "\\'" : delimiter;

      await this.duckdbClient.execute(
        `COPY (SELECT * FROM read_json_auto('${vIn}', format='newline_delimited')) TO '${vOut}' (HEADER, DELIMITER '${cleanDelimiter}')`
      );

      const outBuffer = await this.duckdbClient.copyFileToBuffer(vOut);
      const baseName = file.name.replace(/\.(jsonl|ndjson)$/i, "");
      const outputFilename = `${baseName}.csv`;

      const blob = new Blob([outBuffer], {
        type: "text/csv;charset=utf-8;",
      });

      return {
        blob,
        filename: outputFilename,
        mimeType: "text/csv;charset=utf-8;",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`JSONL to CSV conversion failed: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vIn);
      await this.duckdbClient.dropFile(vOut);
    }
  }
}

/**
 * Converts Comma-Separated Values (.csv) to Newline-Delimited JSON (.jsonl).
 */
export class CsvToJsonlEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "csv-to-jsonl";

  constructor(private duckdbClient: IDuckDbClient = getDuckDbClient()) {}

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    if (file.size === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const vIn = generateVirtualName("in", file.name);
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vIn, buffer);

      const previewData = await this.duckdbClient.queryTabular(
        `SELECT * FROM read_csv_auto('${vIn}') LIMIT ${maxRows}`,
        maxRows
      );

      let totalRows = previewData.rows.length;
      try {
        const countData = await this.duckdbClient.queryTabular(
          `SELECT count(*)::BIGINT as total FROM read_csv_auto('${vIn}')`
        );
        if (countData.rows.length > 0 && typeof countData.rows[0]["total"] === "number") {
          totalRows = countData.rows[0]["total"];
        }
      } catch {
        // Fallback
      }

      return {
        columns: previewData.columns,
        rows: previewData.rows,
        totalRows,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse CSV preview: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vIn);
    }
  }

  async convert(file: File): Promise<ConversionOutput> {
    if (file.size === 0) {
      throw new Error("CSV file is empty");
    }

    const vIn = generateVirtualName("in", file.name);
    const vOut = generateVirtualName("out", "result.jsonl");
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vIn, buffer);

      // ARRAY FALSE outputs newline-delimited JSON objects
      await this.duckdbClient.execute(
        `COPY (SELECT * FROM read_csv_auto('${vIn}')) TO '${vOut}' (FORMAT JSON, ARRAY FALSE)`
      );

      const outBuffer = await this.duckdbClient.copyFileToBuffer(vOut);
      const baseName = file.name.replace(/\.csv$/i, "");
      const outputFilename = `${baseName}.jsonl`;

      const blob = new Blob([outBuffer], {
        type: "application/x-ndjson",
      });

      return {
        blob,
        filename: outputFilename,
        mimeType: "application/x-ndjson",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`CSV to JSONL conversion failed: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vIn);
      await this.duckdbClient.dropFile(vOut);
    }
  }
}

export const jsonlToExcelEngine = new JsonlToExcelEngine();
export const jsonlToCsvEngine = new JsonlToCsvEngine();
export const csvToJsonlEngine = new CsvToJsonlEngine();
