import { IConverterEngine, ConverterEngineId } from "@/types/converter";
import { csvToExcelEngine, CsvToExcelEngine } from "./csv-engine";
import { jsonToExcelEngine, JsonToExcelEngine, flattenObject } from "./json-engine";
import {
  excelToJsonEngine,
  excelToCsvEngine,
  ExcelToJsonEngine,
  ExcelToCsvEngine,
} from "./excel-engine";
import {
  xmlToExcelEngine,
  tallyXmlToExcelEngine,
  XmlToExcelEngine,
  TallyXmlToExcelEngine,
} from "./xml-engine";

export {
  csvToExcelEngine,
  CsvToExcelEngine,
  jsonToExcelEngine,
  JsonToExcelEngine,
  excelToJsonEngine,
  excelToCsvEngine,
  ExcelToJsonEngine,
  ExcelToCsvEngine,
  xmlToExcelEngine,
  tallyXmlToExcelEngine,
  XmlToExcelEngine,
  TallyXmlToExcelEngine,
  flattenObject,
};

const ENGINES: Record<ConverterEngineId, IConverterEngine> = {
  "csv-to-excel": csvToExcelEngine,
  "json-to-excel": jsonToExcelEngine,
  "excel-to-json": excelToJsonEngine,
  "excel-to-csv": excelToCsvEngine,
  "xml-to-excel": xmlToExcelEngine,
  "tally-xml-to-excel": tallyXmlToExcelEngine,
};

export function getConverterEngine(engineId: ConverterEngineId): IConverterEngine {
  const engine = ENGINES[engineId];
  if (!engine) {
    throw new Error(`Unsupported converter engine: "${engineId}"`);
  }
  return engine;
}
