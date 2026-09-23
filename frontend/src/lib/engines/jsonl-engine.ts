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
 * Detects if a parsed JSONL object represents an LLM conversation or fine-tuning structure.
 */
export function isLlmJsonlRecord(record: any): boolean {
  if (!record || typeof record !== "object") return false;
  return (
    Array.isArray(record.messages) ||
    Array.isArray(record.conversations) ||
    (typeof record.instruction === "string" && typeof record.output === "string") ||
    (typeof record.prompt === "string" && typeof record.completion === "string")
  );
}

/**
 * Flattens an LLM record or complex nested object into a clean, human-readable tabular record.
 */
export function flattenLlmJsonlRecord(record: any): Record<string, string> {
  const result: Record<string, string> = {};

  if (!record || typeof record !== "object") {
    return { value: String(record ?? "") };
  }

  // 1. OpenAI / Anthropic format: { system?: string, messages: [{ role: "user", content: "..." }, ...] }
  if (Array.isArray(record.messages)) {
    if (typeof record.system === "string") {
      result["system_prompt"] = record.system;
    }

    let turnUser = 1;
    let turnAssistant = 1;
    const userCount = record.messages.filter((m: any) => m?.role === "user").length;
    const assistantCount = record.messages.filter((m: any) => m?.role === "assistant").length;

    for (const msg of record.messages) {
      if (!msg || typeof msg !== "object") continue;
      const role = String(msg.role || "").toLowerCase();
      const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? "");

      if (role === "system") {
        result["system_prompt"] = result["system_prompt"] ? `${result["system_prompt"]}\n${content}` : content;
      } else if (role === "user") {
        const col = userCount > 1 ? `user_${turnUser++}` : "user_prompt";
        result[col] = content;
      } else if (role === "assistant") {
        const col = assistantCount > 1 ? `assistant_${turnAssistant++}` : "assistant_response";
        result[col] = content;
      } else {
        result[`role_${role || "msg"}`] = content;
      }
    }
  }
  // 2. ShareGPT format: { conversations: [{ from: "human", value: "..." }, { from: "gpt", value: "..." }] }
  else if (Array.isArray(record.conversations)) {
    let turnHuman = 1;
    let turnGpt = 1;
    const humanCount = record.conversations.filter((m: any) => m?.from === "human" || m?.from === "user").length;
    const gptCount = record.conversations.filter((m: any) => m?.from === "gpt" || m?.from === "assistant").length;

    for (const msg of record.conversations) {
      if (!msg || typeof msg !== "object") continue;
      const from = String(msg.from || "").toLowerCase();
      const value = typeof msg.value === "string" ? msg.value : JSON.stringify(msg.value ?? "");

      if (from === "system") {
        result["system_prompt"] = result["system_prompt"] ? `${result["system_prompt"]}\n${value}` : value;
      } else if (from === "human" || from === "user") {
        const col = humanCount > 1 ? `user_${turnHuman++}` : "user_prompt";
        result[col] = value;
      } else if (from === "gpt" || from === "assistant") {
        const col = gptCount > 1 ? `assistant_${turnGpt++}` : "assistant_response";
        result[col] = value;
      } else {
        result[`turn_${from}`] = value;
      }
    }
  }
  // 3. Alpaca format: { instruction, input, output }
  else if ("instruction" in record || "output" in record) {
    if (record.instruction !== undefined) result["instruction"] = String(record.instruction);
    if (record.input !== undefined) result["input"] = String(record.input);
    if (record.output !== undefined) result["output"] = String(record.output);
  }
  // 4. Prompt/Completion format
  else if ("prompt" in record || "completion" in record) {
    if (record.prompt !== undefined) result["prompt"] = String(record.prompt);
    if (record.completion !== undefined) result["completion"] = String(record.completion);
  }

  // Preserve other top-level keys or nested objects
  for (const [key, val] of Object.entries(record)) {
    if (key === "messages" || key === "conversations") continue;
    if (result[key] !== undefined) continue;

    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      for (const [subKey, subVal] of Object.entries(val)) {
        result[`${key}.${subKey}`] = typeof subVal === "object" ? JSON.stringify(subVal) : String(subVal ?? "");
      }
    } else if (Array.isArray(val)) {
      result[key] = JSON.stringify(val);
    } else {
      result[key] = String(val ?? "");
    }
  }

  return result;
}

/**
 * Parses JSONL file text in JavaScript and flattens records into tabular rows.
 */
export async function parseAndFlattenJsonl(file: File): Promise<{ columns: string[]; rows: Record<string, any>[] }> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return { columns: [], rows: [] };
  }

  const flattenedRows: Record<string, any>[] = [];
  const columnSet = new Set<string>();

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      const flattened = isLlmJsonlRecord(parsed) ? flattenLlmJsonlRecord(parsed) : parsed;
      flattenedRows.push(flattened);
      Object.keys(flattened).forEach((col) => columnSet.add(col));
    } catch {
      // Skip corrupt lines gracefully
    }
  }

  return {
    columns: Array.from(columnSet),
    rows: flattenedRows,
  };
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

    // Try client-side smart parser for LLM conversation/fine-tuning datasets
    try {
      const text = await file.text();
      const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0);
      if (firstLine) {
        const parsed = JSON.parse(firstLine);
        if (isLlmJsonlRecord(parsed)) {
          const { columns, rows } = await parseAndFlattenJsonl(file);
          if (rows.length > 0) {
            return {
              columns,
              rows: rows.slice(0, maxRows),
              totalRows: rows.length,
            };
          }
        }
      }
    } catch {
      // Fall back to DuckDB
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

    // Use smart LLM-aware flattener for LLM datasets
    let rowsToExport: Record<string, any>[] = [];
    let columnsToExport: string[] = [];

    try {
      const text = await file.text();
      const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0);
      if (firstLine) {
        const parsed = JSON.parse(firstLine);
        if (isLlmJsonlRecord(parsed)) {
          const parsedData = await parseAndFlattenJsonl(file);
          rowsToExport = parsedData.rows;
          columnsToExport = parsedData.columns;
        }
      }
    } catch {
      // Fallback
    }

    if (rowsToExport.length === 0) {
      // DuckDB fallback
      const vName = generateVirtualName("jsonl_conv", file.name);
      const buffer = new Uint8Array(await file.arrayBuffer());

      try {
        await this.duckdbClient.registerFileBuffer(vName, buffer);
        const tableData = await this.duckdbClient.queryTabular(
          `SELECT * FROM read_json_auto('${vName}', format='newline_delimited')`
        );
        rowsToExport = tableData.rows;
        columnsToExport = tableData.columns;
      } finally {
        await this.duckdbClient.dropFile(vName);
      }
    }

    if (rowsToExport.length === 0) {
      throw new Error("JSONL file contains no valid data rows");
    }

    const worksheet = XLSX.utils.json_to_sheet(rowsToExport, {
      header: columnsToExport,
    });

    // Auto-calculate optimal column widths (wch)
    const colWidths = columnsToExport.map((col) => {
      let maxLen = col.length;
      const sample = rowsToExport.slice(0, 50);
      for (const r of sample) {
        const val = String(r[col] ?? "");
        if (val.length > maxLen) maxLen = Math.min(65, val.length);
      }
      return { wch: Math.max(12, maxLen + 2) };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    const sheetName = sanitizeSheetName(options?.sheetName || "Sheet1");
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      compression: true,
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

    // Try client-side smart parser for LLM datasets
    try {
      const text = await file.text();
      const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0);
      if (firstLine) {
        const parsed = JSON.parse(firstLine);
        if (isLlmJsonlRecord(parsed)) {
          const { columns, rows } = await parseAndFlattenJsonl(file);
          if (rows.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns });
            const csvString = XLSX.utils.sheet_to_csv(worksheet, {
              FS: options?.delimiter || ",",
            });
            const baseName = file.name.replace(/\.(jsonl|ndjson)$/i, "");
            const outputFilename = `${baseName}.csv`;
            const blob = new Blob([csvString], {
              type: "text/csv;charset=utf-8;",
            });

            return {
              blob,
              filename: outputFilename,
              mimeType: "text/csv;charset=utf-8;",
            };
          }
        }
      }
    } catch {
      // Fall back to DuckDB
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

      const blob = new Blob([outBuffer as unknown as BlobPart], {
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
