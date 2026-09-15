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
 * Converts Apache Parquet files (.parquet) to Microsoft Excel (.xlsx).
 */
export class ParquetToExcelEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "parquet-to-excel";

  constructor(private duckdbClient: IDuckDbClient = getDuckDbClient()) {}

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    if (file.size === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const vName = generateVirtualName("preview", file.name);
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vName, buffer);

      // Query preview rows
      const previewData = await this.duckdbClient.queryTabular(
        `SELECT * FROM read_parquet('${vName}') LIMIT ${maxRows}`,
        maxRows
      );

      // Query total row count
      let totalRows = previewData.rows.length;
      try {
        const countData = await this.duckdbClient.queryTabular(
          `SELECT count(*)::BIGINT as total FROM read_parquet('${vName}')`
        );
        if (countData.rows.length > 0 && typeof countData.rows[0]["total"] === "number") {
          totalRows = countData.rows[0]["total"];
        }
      } catch {
        // Fallback to preview count if count query fails
      }

      return {
        columns: previewData.columns,
        rows: previewData.rows,
        totalRows,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse Parquet preview: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vName);
    }
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    if (file.size === 0) {
      throw new Error("Parquet file is empty");
    }

    const vName = generateVirtualName("convert", file.name);
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vName, buffer);

      const tableData = await this.duckdbClient.queryTabular(
        `SELECT * FROM read_parquet('${vName}')`
      );

      if (tableData.rows.length === 0) {
        throw new Error("Parquet file contains no data rows");
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

      const baseName = file.name.replace(/\.parquet$/i, "");
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
      throw new Error(`Parquet to Excel conversion failed: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vName);
    }
  }
}

/**
 * Converts Apache Parquet files (.parquet) to Comma-Separated Values (.csv).
 */
export class ParquetToCsvEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "parquet-to-csv";

  constructor(private duckdbClient: IDuckDbClient = getDuckDbClient()) {}

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const excelEngine = new ParquetToExcelEngine(this.duckdbClient);
    return excelEngine.parsePreview(file, maxRows);
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    if (file.size === 0) {
      throw new Error("Parquet file is empty");
    }

    const vIn = generateVirtualName("in", file.name);
    const vOut = generateVirtualName("out", "result.csv");
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vIn, buffer);

      const delimiter = options?.delimiter || ",";
      const cleanDelimiter = delimiter === "'" ? "\\'" : delimiter;

      await this.duckdbClient.execute(
        `COPY (SELECT * FROM read_parquet('${vIn}')) TO '${vOut}' (HEADER, DELIMITER '${cleanDelimiter}')`
      );

      const outBuffer = await this.duckdbClient.copyFileToBuffer(vOut);
      const baseName = file.name.replace(/\.parquet$/i, "");
      const outputFilename = `${baseName}.csv`;

      const blob = new Blob([outBuffer as unknown as BlobPart], {
        type: "text/csv;charset=utf-8;",
      });

      return {
        blob,
        filename: outputFilename,
        mimeType: "text/csv;charset=utf-8;",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Parquet to CSV conversion failed: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vIn);
      await this.duckdbClient.dropFile(vOut);
    }
  }
}

/**
 * Converts Apache Parquet files (.parquet) to JSON (.json).
 */
export class ParquetToJsonEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "parquet-to-json";

  constructor(private duckdbClient: IDuckDbClient = getDuckDbClient()) {}

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const excelEngine = new ParquetToExcelEngine(this.duckdbClient);
    return excelEngine.parsePreview(file, maxRows);
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    if (file.size === 0) {
      throw new Error("Parquet file is empty");
    }

    const vIn = generateVirtualName("in", file.name);
    const vOut = generateVirtualName("out", "result.json");
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vIn, buffer);

      await this.duckdbClient.execute(
        `COPY (SELECT * FROM read_parquet('${vIn}')) TO '${vOut}' (FORMAT JSON, ARRAY TRUE)`
      );

      const outBuffer = await this.duckdbClient.copyFileToBuffer(vOut);
      const baseName = file.name.replace(/\.parquet$/i, "");
      const outputFilename = `${baseName}.json`;

      let finalBuffer: Uint8Array | string = outBuffer;
      if (options?.prettify) {
        try {
          const text = new TextDecoder().decode(outBuffer);
          const parsed = JSON.parse(text);
          finalBuffer = JSON.stringify(parsed, null, 2);
        } catch {
          // Keep raw buffer if prettify parse fails
        }
      }

      const blob = new Blob([finalBuffer as unknown as BlobPart], {
        type: "application/json",
      });

      return {
        blob,
        filename: outputFilename,
        mimeType: "application/json",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Parquet to JSON conversion failed: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vIn);
      await this.duckdbClient.dropFile(vOut);
    }
  }
}

/**
 * Converts Comma-Separated Values (.csv) to Apache Parquet (.parquet).
 */
export class CsvToParquetEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "csv-to-parquet";

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
    const vOut = generateVirtualName("out", "result.parquet");
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vIn, buffer);

      await this.duckdbClient.execute(
        `COPY (SELECT * FROM read_csv_auto('${vIn}')) TO '${vOut}' (FORMAT PARQUET)`
      );

      const outBuffer = await this.duckdbClient.copyFileToBuffer(vOut);
      const baseName = file.name.replace(/\.csv$/i, "");
      const outputFilename = `${baseName}.parquet`;

      const blob = new Blob([outBuffer as unknown as BlobPart], {
        type: "application/vnd.apache.parquet",
      });

      return {
        blob,
        filename: outputFilename,
        mimeType: "application/vnd.apache.parquet",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`CSV to Parquet conversion failed: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vIn);
      await this.duckdbClient.dropFile(vOut);
    }
  }
}

/**
 * Converts JSON (.json) to Apache Parquet (.parquet).
 */
export class JsonToParquetEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "json-to-parquet";

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
        `SELECT * FROM read_json_auto('${vIn}') LIMIT ${maxRows}`,
        maxRows
      );

      let totalRows = previewData.rows.length;
      try {
        const countData = await this.duckdbClient.queryTabular(
          `SELECT count(*)::BIGINT as total FROM read_json_auto('${vIn}')`
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
      throw new Error(`Failed to parse JSON preview: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vIn);
    }
  }

  async convert(file: File): Promise<ConversionOutput> {
    if (file.size === 0) {
      throw new Error("JSON file is empty");
    }

    const vIn = generateVirtualName("in", file.name);
    const vOut = generateVirtualName("out", "result.parquet");
    const buffer = new Uint8Array(await file.arrayBuffer());

    try {
      await this.duckdbClient.registerFileBuffer(vIn, buffer);

      await this.duckdbClient.execute(
        `COPY (SELECT * FROM read_json_auto('${vIn}')) TO '${vOut}' (FORMAT PARQUET)`
      );

      const outBuffer = await this.duckdbClient.copyFileToBuffer(vOut);
      const baseName = file.name.replace(/\.json$/i, "");
      const outputFilename = `${baseName}.parquet`;

      const blob = new Blob([outBuffer as unknown as BlobPart], {
        type: "application/vnd.apache.parquet",
      });

      return {
        blob,
        filename: outputFilename,
        mimeType: "application/vnd.apache.parquet",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`JSON to Parquet conversion failed: ${msg}`);
    } finally {
      await this.duckdbClient.dropFile(vIn);
      await this.duckdbClient.dropFile(vOut);
    }
  }
}

export const parquetToExcelEngine = new ParquetToExcelEngine();
export const parquetToCsvEngine = new ParquetToCsvEngine();
export const parquetToJsonEngine = new ParquetToJsonEngine();
export const csvToParquetEngine = new CsvToParquetEngine();
export const jsonToParquetEngine = new JsonToParquetEngine();
