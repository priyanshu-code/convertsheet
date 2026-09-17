import * as XLSX from "xlsx";
import {
  IConverterEngine,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { sanitizeSheetName } from "@/lib/utils";

export function flattenObject(
  obj: Record<string, unknown>,
  prefix = "",
  result: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (val === null || val === undefined) {
      result[newKey] = val;
    } else if (typeof val === "object") {
      if (Array.isArray(val)) {
        if (val.length === 0) {
          result[newKey] = "";
        } else if (val.every((item) => typeof item !== "object" || item === null)) {
          result[newKey] = val.join(", ");
        } else {
          result[newKey] = JSON.stringify(val);
        }
      } else if (val instanceof Date) {
        result[newKey] = val.toISOString();
      } else {
        flattenObject(val as Record<string, unknown>, newKey, result);
      }
    } else {
      result[newKey] = val;
    }
  }
  return result;
}

export function extractJsonItems(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.map((item) =>
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : { value: item }
    );
  }
  if (typeof data === "object" && data !== null) {
    const dataObj = data as Record<string, unknown>;
    const keys = Object.keys(dataObj);

    // 1. Check for array containing objects
    const arrayKey = keys.find(
      (k) =>
        Array.isArray(dataObj[k]) &&
        (dataObj[k] as unknown[]).length > 0 &&
        typeof (dataObj[k] as unknown[])[0] === "object"
    );
    if (arrayKey) {
      return (dataObj[arrayKey] as unknown[]).map((item) =>
        typeof item === "object" && item !== null
          ? (item as Record<string, unknown>)
          : { value: item }
      );
    }

    // 2. Check for empty wrapper arrays, e.g. { "data": [] }, { "items": [] }, or single-key empty array
    const emptyWrapperKey = keys.find((k) => {
      if (!Array.isArray(dataObj[k]) || (dataObj[k] as unknown[]).length > 0) {
        return false;
      }
      if (keys.length === 1) return true;
      const lower = k.toLowerCase();
      return [
        "data",
        "items",
        "results",
        "rows",
        "records",
        "list",
        "entities",
      ].includes(lower);
    });

    if (emptyWrapperKey) {
      return [];
    }

    return [dataObj];
  }
  return [];
}

export function yieldTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export class JsonToExcelEngine implements IConverterEngine {
  async parsePreview(file: File, maxRows?: number): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    // Yield control to let React render the parsing spinner cleanly
    await yieldTick();

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON format: ${(err as Error).message}`);
    }

    const items = extractJsonItems(data);
    const totalRows = items.length;

    // For large datasets, sampling the first 250 rows yields complete column schemas in <1ms
    // without flattening 100,000 deep objects on preview
    const sampleSize = Math.min(totalRows, 250);
    const sampleItems = items.slice(0, sampleSize);

    const columnSet = new Set<string>();
    const flattenedSample: Record<string, unknown>[] = [];

    for (let i = 0; i < sampleItems.length; i++) {
      const flattened = flattenObject(sampleItems[i]);
      flattenedSample.push(flattened);
      Object.keys(flattened).forEach((col) => columnSet.add(col));
    }

    const columns = Array.from(columnSet);
    const limit = maxRows !== undefined ? maxRows : 10;
    const rows = limit > 0 ? flattenedSample.slice(0, limit) : flattenedSample;

    return {
      columns,
      rows,
      totalRows,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) {
      throw new Error("JSON file is empty");
    }

    // Yield so browser paints converting spinner state
    await yieldTick();

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON format: ${(err as Error).message}`);
    }

    const items = extractJsonItems(data);
    const shouldFlatten = options?.flattenNested !== false;

    // Process rows in asynchronous chunks to avoid locking the UI thread and freezing animations
    const processedRows: Record<string, unknown>[] = [];
    const columnSet = new Set<string>();
    const chunkSize = 5000;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      for (const item of chunk) {
        const row = shouldFlatten ? flattenObject(item) : (item as Record<string, unknown>);
        processedRows.push(row);
        Object.keys(row).forEach((col) => columnSet.add(col));
      }
      if (items.length > chunkSize) {
        await yieldTick();
      }
    }

    const columns = Array.from(columnSet);

    await yieldTick();
    const worksheet = XLSX.utils.json_to_sheet(processedRows, { header: columns });

    await yieldTick();
    const workbook = XLSX.utils.book_new();
    const sheetName = sanitizeSheetName(options?.sheetName);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    await yieldTick();
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

export const jsonToExcelEngine = new JsonToExcelEngine();
