import { XMLParser } from "fast-xml-parser";
import * as XLSX from "xlsx";
import {
  IConverterEngine,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { flattenObject } from "./json-engine";

export function extractXmlRecords(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) {
    return parsed.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    );
  }
  if (!parsed || typeof parsed !== "object") {
    return [];
  }

  // BFS search for the primary array of objects
  const queue: unknown[] = [parsed];
  let bestArray: Record<string, unknown>[] | null = null;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;

    const currentObj = current as Record<string, unknown>;
    for (const key of Object.keys(currentObj)) {
      const val = currentObj[key];
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
        if (!bestArray || val.length > bestArray.length) {
          bestArray = val as Record<string, unknown>[];
        }
      } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        queue.push(val);
      }
    }
    if (bestArray) break;
  }

  if (bestArray) {
    // Check if items are wrapped in a single child object (e.g. <TALLYMESSAGE><VOUCHER>...</VOUCHER></TALLYMESSAGE>)
    return bestArray.map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const keys = Object.keys(item);
        if (
          keys.length === 1 &&
          typeof item[keys[0]] === "object" &&
          item[keys[0]] !== null &&
          !Array.isArray(item[keys[0]])
        ) {
          return item[keys[0]] as Record<string, unknown>;
        }
      }
      return item;
    });
  }

  // Fallback: Drill down single-key containers to find innermost record object
  let curr: unknown = parsed;
  while (curr && typeof curr === "object" && !Array.isArray(curr)) {
    const currObj = curr as Record<string, unknown>;
    const keys = Object.keys(currObj);
    if (
      keys.length === 1 &&
      typeof currObj[keys[0]] === "object" &&
      currObj[keys[0]] !== null &&
      !Array.isArray(currObj[keys[0]])
    ) {
      curr = currObj[keys[0]];
    } else {
      break;
    }
  }

  if (curr && typeof curr === "object" && !Array.isArray(curr)) {
    return [curr as Record<string, unknown>];
  }

  return [];
}

export class XmlToExcelEngine implements IConverterEngine {
  protected parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
    });
  }

  async parsePreview(file: File, maxRows?: number): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const parsed = this.parser.parse(text);
    const rawRecords = extractXmlRecords(parsed);
    const flattenedRows = rawRecords.map((r) => flattenObject(r));

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
      throw new Error("XML file is empty");
    }

    const parsed = this.parser.parse(text);
    const rawRecords = extractXmlRecords(parsed);
    const shouldFlatten = options?.flattenNested !== false;
    const processedRows = rawRecords.map((r) =>
      shouldFlatten ? flattenObject(r) : r
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

export class TallyXmlToExcelEngine extends XmlToExcelEngine {}

export const xmlToExcelEngine = new XmlToExcelEngine();
export const tallyXmlToExcelEngine = new TallyXmlToExcelEngine();
