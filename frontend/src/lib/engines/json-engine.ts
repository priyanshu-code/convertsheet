import * as XLSX from "xlsx";
import {
  IConverterEngine,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";

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
    const arrayKey = Object.keys(dataObj).find(
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
    return [dataObj];
  }
  return [];
}

export class JsonToExcelEngine implements IConverterEngine {
  async parsePreview(file: File, maxRows?: number): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const data = JSON.parse(text);
    const items = extractJsonItems(data);
    const flattenedRows = items.map((item) => flattenObject(item));

    const columnSet = new Set<string>();
    for (const row of flattenedRows) {
      Object.keys(row).forEach((col) => columnSet.add(col));
    }
    const columns = Array.from(columnSet);

    const limit = maxRows !== undefined ? maxRows : 10;
    const rows = limit > 0 ? flattenedRows.slice(0, limit) : flattenedRows;

    return {
      columns,
      rows,
      totalRows: flattenedRows.length,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) {
      throw new Error("JSON file is empty");
    }

    const data = JSON.parse(text);
    const items = extractJsonItems(data);
    const shouldFlatten = options?.flattenNested !== false;
    const processedRows = items.map((item) =>
      shouldFlatten ? flattenObject(item) : item
    );

    const columnSet = new Set<string>();
    for (const row of processedRows) {
      Object.keys(row).forEach((col) => columnSet.add(col));
    }
    const columns = Array.from(columnSet);

    const worksheet = XLSX.utils.json_to_sheet(processedRows, { header: columns });
    const workbook = XLSX.utils.book_new();
    const sheetName = options?.sheetName || "Sheet1";
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
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
