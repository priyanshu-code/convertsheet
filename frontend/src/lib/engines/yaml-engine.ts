import yaml from "js-yaml";
import * as XLSX from "xlsx";
import {
  IConverterEngine,
  ConverterEngineId,
  TabularData,
  ConversionOptions,
  ConversionOutput,
} from "@/types/converter";
import { sanitizeSheetName } from "@/lib/utils";

function parseYamlRecords(text: string): Record<string, unknown>[] {
  const loaded = yaml.load(text);
  if (!loaded) return [];
  if (Array.isArray(loaded)) {
    return loaded.filter((item): item is Record<string, unknown> => item !== null && typeof item === "object");
  }
  if (typeof loaded === "object") {
    // If it is a dictionary of items or contains a root array
    const values = Object.values(loaded);
    const arrayItem = values.find((v) => Array.isArray(v));
    if (arrayItem && Array.isArray(arrayItem)) {
      return arrayItem.filter((item): item is Record<string, unknown> => item !== null && typeof item === "object");
    }
    return [loaded as Record<string, unknown>];
  }
  return [];
}

// YAML to Excel
export class YamlToExcelEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "yaml-to-excel";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    const text = await file.text();
    if (!text || !text.trim()) return { columns: [], rows: [], totalRows: 0 };
    const records = parseYamlRecords(text);
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    return {
      columns,
      rows: maxRows > 0 ? records.slice(0, maxRows) : records,
      totalRows: records.length,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    const text = await file.text();
    if (!text || !text.trim()) throw new Error("YAML file is empty");
    const records = parseYamlRecords(text);
    if (records.length === 0) throw new Error("No structured tabular records found in YAML document");

    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    const sheetName = sanitizeSheetName(options?.sheetName);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", compression: true });
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

// Excel to YAML
export class ExcelToYamlEngine implements IConverterEngine {
  readonly id: ConverterEngineId = "excel-to-yaml";

  async parsePreview(file: File, maxRows: number = 10): Promise<TabularData> {
    if (file.size === 0) return { columns: [], rows: [], totalRows: 0 };
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const targetSheet = workbook.SheetNames[0];
    if (!targetSheet || !workbook.Sheets[targetSheet]) return { columns: [], rows: [], totalRows: 0 };
    const worksheet = workbook.Sheets[targetSheet];
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
    if (!aoa || aoa.length === 0) return { columns: [], rows: [], totalRows: 0 };
    const columns = (aoa[0] || []).map((col, idx) => String(col ?? "").trim() || `Column_${idx + 1}`);
    const allRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
    return {
      columns,
      rows: maxRows > 0 ? allRows.slice(0, maxRows) : allRows,
      totalRows: allRows.length,
    };
  }

  async convert(file: File, options?: ConversionOptions): Promise<ConversionOutput> {
    if (file.size === 0) throw new Error("Excel file is empty");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const targetSheet = options?.sheetName && workbook.Sheets?.[options.sheetName]
      ? options.sheetName
      : workbook.SheetNames[0];
    const worksheet = targetSheet ? workbook.Sheets[targetSheet] : undefined;
    const records = worksheet ? XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet) : [];

    const yamlString = yaml.dump(records, { indent: 2, lineWidth: -1 });
    const blob = new Blob([yamlString], { type: "application/x-yaml" });
    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "converted";
    return {
      blob,
      filename: `${baseName}.yaml`,
      mimeType: "application/x-yaml",
    };
  }
}

export const yamlToExcelEngine = new YamlToExcelEngine();
export const excelToYamlEngine = new ExcelToYamlEngine();
