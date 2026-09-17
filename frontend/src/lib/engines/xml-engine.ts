import { XMLParser } from "fast-xml-parser";
import * as XLSX from "xlsx";
import {
  IConverterEngine,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { flattenObject } from "./json-engine";
import { sanitizeSheetName } from "@/lib/utils";

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
      if (key.startsWith("@_")) continue;
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
    // Check if items are wrapped in a single child object (e.g. <TALLYMESSAGE xmlns:UDF="..."><VOUCHER>...</VOUCHER></TALLYMESSAGE>)
    return bestArray.map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const itemObj = item as Record<string, unknown>;
        const childKeys = Object.keys(itemObj).filter((k) => !k.startsWith("@_"));
        if (
          childKeys.length === 1 &&
          typeof itemObj[childKeys[0]] === "object" &&
          itemObj[childKeys[0]] !== null &&
          !Array.isArray(itemObj[childKeys[0]])
        ) {
          return itemObj[childKeys[0]] as Record<string, unknown>;
        }
      }
      return item;
    });
  }

  // Fallback: Drill down single-child containers to find innermost record object / array
  let curr: unknown = parsed;
  while (curr && typeof curr === "object" && !Array.isArray(curr)) {
    const currObj = curr as Record<string, unknown>;
    const childKeys = Object.keys(currObj).filter((k) => !k.startsWith("@_"));
    if (childKeys.length === 1) {
      const childVal = currObj[childKeys[0]];
      if (Array.isArray(childVal)) {
        return childVal.filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null
        );
      } else if (typeof childVal === "object" && childVal !== null) {
        curr = childVal;
      } else {
        break;
      }
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

  protected extractRecords(parsed: Record<string, unknown>): Record<string, unknown>[] {
    return extractXmlRecords(parsed);
  }

  async parsePreview(file: File, maxRows?: number): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const parsed = this.parser.parse(text) as Record<string, unknown>;
    const rawRecords = this.extractRecords(parsed);
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

    const parsed = this.parser.parse(text) as Record<string, unknown>;
    const rawRecords = this.extractRecords(parsed);
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

export class TallyXmlToExcelEngine extends XmlToExcelEngine {
  protected override extractRecords(
    parsed: Record<string, unknown>
  ): Record<string, unknown>[] {
    if (!parsed || typeof parsed !== "object") {
      return [];
    }

    const getChild = (obj: unknown, keyName: string): unknown => {
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) return undefined;
      const foundKey = Object.keys(obj as Record<string, unknown>).find(
        (k) => k.toLowerCase() === keyName.toLowerCase()
      );
      return foundKey ? (obj as Record<string, unknown>)[foundKey] : undefined;
    };

    const findTallyMessages = (root: Record<string, unknown>): unknown => {
      let current: unknown = root;
      const envelope = getChild(current, "ENVELOPE");
      if (envelope) current = envelope;

      const body = getChild(current, "BODY");
      if (body) current = body;

      const importData = getChild(current, "IMPORTDATA") || getChild(current, "DATA");
      if (importData) current = importData;

      const requestData = getChild(current, "REQUESTDATA") || getChild(current, "DATA");
      if (requestData) current = requestData;

      const messages = getChild(current, "TALLYMESSAGE");
      if (messages) return messages;

      // Fallback: search for TALLYMESSAGE anywhere in the parsed tree
      const queue: unknown[] = [root];
      while (queue.length > 0) {
        const curr = queue.shift();
        if (!curr || typeof curr !== "object") continue;
        const currObj = curr as Record<string, unknown>;
        for (const k of Object.keys(currObj)) {
          if (k.toLowerCase() === "tallymessage") {
            return currObj[k];
          }
          if (typeof currObj[k] === "object" && currObj[k] !== null && !k.startsWith("@_")) {
            queue.push(currObj[k]);
          }
        }
      }
      return undefined;
    };

    const tallyMessages = findTallyMessages(parsed);

    if (tallyMessages) {
      const msgList = Array.isArray(tallyMessages) ? tallyMessages : [tallyMessages];
      const records: Record<string, unknown>[] = [];

      for (const msg of msgList) {
        if (!msg || typeof msg !== "object") continue;
        const msgObj = msg as Record<string, unknown>;
        const childKeys = Object.keys(msgObj).filter((k) => !k.startsWith("@_"));

        for (const key of childKeys) {
          const val = msgObj[key];
          if (Array.isArray(val)) {
            for (const item of val) {
              if (item && typeof item === "object") {
                records.push(item as Record<string, unknown>);
              }
            }
          } else if (val && typeof val === "object") {
            records.push(val as Record<string, unknown>);
          }
        }
      }

      if (records.length > 0) {
        return records;
      }
    }

    return super.extractRecords(parsed);
  }
}

export const xmlToExcelEngine = new XmlToExcelEngine();
export const tallyXmlToExcelEngine = new TallyXmlToExcelEngine();
