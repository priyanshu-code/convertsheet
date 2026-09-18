import {
  IConverterEngine,
  ConverterEngineId,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { extractJsonItems, flattenObject, yieldTick } from "./json-engine";

/**
 * Infer the JSON Schema primitive type name from a JavaScript value.
 */
export function inferSchemaType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "number";
  }
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") return "string";
  if (typeof value === "object") return "object";
  return "string";
}

/**
 * Formats a sample value into a compact string representation for preview tables.
 */
export function formatSampleValue(val: unknown): string {
  if (val === null) return "null";
  if (val === undefined) return "";
  if (typeof val === "object") {
    try {
      const str = JSON.stringify(val);
      return str.length > 50 ? str.substring(0, 47) + "..." : str;
    } catch {
      return String(val);
    }
  }
  return String(val);
}

/**
 * Converts JSON data (array of objects or single wrapper object) to Newline-Delimited JSON (NDJSON).
 */
export class JsonToNdjsonEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "json-to-ndjson";

  async parsePreview(file: File, maxRows?: number): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    await yieldTick();

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON format: ${(err as Error).message}`);
    }

    const items = extractJsonItems(data);
    const totalRows = items.length;

    const sampleSize = Math.min(totalRows, 250);
    const sampleItems = items.slice(0, sampleSize);

    const columnSet = new Set<string>();
    const previewRows: Record<string, unknown>[] = [];

    for (let i = 0; i < sampleItems.length; i++) {
      const item = sampleItems[i];
      Object.keys(item).forEach((col) => columnSet.add(col));
      previewRows.push(item);
    }

    const columns = Array.from(columnSet);
    const limit = maxRows !== undefined ? maxRows : 10;
    const rows = limit > 0 ? previewRows.slice(0, limit) : previewRows;

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

    await yieldTick();

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON format: ${(err as Error).message}`);
    }

    const items = extractJsonItems(data);
    const shouldFlatten = Boolean(options?.flattenNested);

    const lines: string[] = [];
    const chunkSize = 5000;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      for (const item of chunk) {
        const record = shouldFlatten ? flattenObject(item) : item;
        lines.push(JSON.stringify(record));
      }
      if (items.length > chunkSize) {
        await yieldTick();
      }
    }

    const ndjsonContent = lines.join("\n") + (lines.length > 0 ? "\n" : "");
    const blob = new Blob([ndjsonContent], {
      type: "application/x-ndjson",
    });

    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.ndjson`,
      mimeType: "application/x-ndjson",
    };
  }
}

/**
 * Converts JSON records or documents into Draft-07 JSON Schema.
 */
export class JsonToSchemaEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "json-to-schema";

  async parsePreview(file: File, _maxRows?: number): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    await yieldTick();

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON format: ${(err as Error).message}`);
    }

    const items = extractJsonItems(data);
    if (items.length === 0) {
      return {
        columns: ["Property", "Type", "Required", "Sample Value"],
        rows: [],
        totalRows: 0,
      };
    }

    // Inspect items to find all properties, inferred types, and whether they appear in every row
    const propertyMap = new Map<
      string,
      { count: number; types: Set<string>; sampleVal: unknown }
    >();

    for (const item of items) {
      for (const [key, val] of Object.entries(item)) {
        if (!propertyMap.has(key)) {
          propertyMap.set(key, {
            count: 0,
            types: new Set(),
            sampleVal: val,
          });
        }
        const entry = propertyMap.get(key)!;
        entry.count++;
        entry.types.add(inferSchemaType(val));
        if (entry.sampleVal === undefined && val !== undefined) {
          entry.sampleVal = val;
        }
      }
    }

    const totalCount = items.length;
    const rows: Record<string, unknown>[] = [];

    for (const [propName, meta] of propertyMap.entries()) {
      const typeStr = Array.from(meta.types).join(" | ");
      const isRequired = meta.count === totalCount ? "Yes" : "No";
      rows.push({
        Property: propName,
        Type: typeStr,
        Required: isRequired,
        "Sample Value": formatSampleValue(meta.sampleVal),
      });
    }

    return {
      columns: ["Property", "Type", "Required", "Sample Value"],
      rows,
      totalRows: rows.length,
    };
  }

  async convert(file: File, _options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) {
      throw new Error("JSON file is empty");
    }

    await yieldTick();

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON format: ${(err as Error).message}`);
    }

    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "document";

    let items: Record<string, unknown>[];
    if (
      typeof data === "object" &&
      data !== null &&
      !Array.isArray(data) &&
      !Object.values(data as Record<string, unknown>).some(
        (v) => Array.isArray(v) && v.length > 0 && typeof v[0] === "object"
      )
    ) {
      items = [data as Record<string, unknown>];
    } else {
      items = extractJsonItems(data);
    }

    if (items.length === 0) {
      throw new Error("No JSON records or object properties found to infer schema from");
    }

    const propertyMap = new Map<
      string,
      { count: number; types: Set<string>; sampleVal: unknown }
    >();

    for (const item of items) {
      for (const [key, val] of Object.entries(item)) {
        if (!propertyMap.has(key)) {
          propertyMap.set(key, {
            count: 0,
            types: new Set(),
            sampleVal: val,
          });
        }
        const entry = propertyMap.get(key)!;
        entry.count++;
        entry.types.add(inferSchemaType(val));
        if (entry.sampleVal === undefined && val !== undefined) {
          entry.sampleVal = val;
        }
      }
    }

    const totalCount = items.length;
    const propertiesObj: Record<string, { type: string | string[]; [k: string]: unknown }> = {};
    const requiredProps: string[] = [];

    for (const [propName, meta] of propertyMap.entries()) {
      const typeList = Array.from(meta.types);
      const schemaType = typeList.length === 1 ? typeList[0] : typeList;

      propertiesObj[propName] = {
        type: schemaType,
      };

      if (meta.count === totalCount) {
        requiredProps.push(propName);
      }
    }

    const schemaDocument: Record<string, unknown> = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: baseName,
      type: "object",
      properties: propertiesObj,
    };

    if (requiredProps.length > 0) {
      schemaDocument.required = requiredProps;
    }

    const schemaJson = JSON.stringify(schemaDocument, null, 2);
    const blob = new Blob([schemaJson], {
      type: "application/schema+json",
    });

    return {
      blob,
      filename: `${baseName}.schema.json`,
      mimeType: "application/schema+json",
    };
  }
}

export const jsonToNdjsonEngine = new JsonToNdjsonEngine();
export const jsonToSchemaEngine = new JsonToSchemaEngine();
