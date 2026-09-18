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
import {
  parquetToExcelEngine,
  parquetToCsvEngine,
  parquetToJsonEngine,
  csvToParquetEngine,
  jsonToParquetEngine,
  ParquetToExcelEngine,
  ParquetToCsvEngine,
  ParquetToJsonEngine,
  CsvToParquetEngine,
  JsonToParquetEngine,
} from "./parquet-engine";
import {
  jsonlToExcelEngine,
  jsonlToCsvEngine,
  csvToJsonlEngine,
  JsonlToExcelEngine,
  JsonlToCsvEngine,
  CsvToJsonlEngine,
} from "./jsonl-engine";
import {
  markdownTableEngine,
  MarkdownTableEngine,
  parseMarkdownTable,
  parseHtmlTable,
} from "./markdown-table-engine";
import { sqliteToExcelEngine, SqliteToExcelEngine } from "./sqlite-engine";
import { DuckDbClient, getDuckDbClient } from "./duckdb-client";
import {
  jsonToNdjsonEngine,
  jsonToSchemaEngine,
  JsonToNdjsonEngine,
  JsonToSchemaEngine,
} from "./ndjson-schema-engine";

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
  parquetToExcelEngine,
  parquetToCsvEngine,
  parquetToJsonEngine,
  csvToParquetEngine,
  jsonToParquetEngine,
  ParquetToExcelEngine,
  ParquetToCsvEngine,
  ParquetToJsonEngine,
  CsvToParquetEngine,
  JsonToParquetEngine,
  jsonlToExcelEngine,
  jsonlToCsvEngine,
  csvToJsonlEngine,
  JsonlToExcelEngine,
  JsonlToCsvEngine,
  CsvToJsonlEngine,
  markdownTableEngine,
  MarkdownTableEngine,
  sqliteToExcelEngine,
  SqliteToExcelEngine,
  parseMarkdownTable,
  parseHtmlTable,
  DuckDbClient,
  getDuckDbClient,
  flattenObject,
  jsonToNdjsonEngine,
  jsonToSchemaEngine,
  JsonToNdjsonEngine,
  JsonToSchemaEngine,
};

const ENGINES: Record<ConverterEngineId, IConverterEngine> = {
  "csv-to-excel": csvToExcelEngine,
  "json-to-excel": jsonToExcelEngine,
  "excel-to-json": excelToJsonEngine,
  "excel-to-csv": excelToCsvEngine,
  "xml-to-excel": xmlToExcelEngine,
  "tally-xml-to-excel": tallyXmlToExcelEngine,
  "parquet-to-excel": parquetToExcelEngine,
  "parquet-to-csv": parquetToCsvEngine,
  "parquet-to-json": parquetToJsonEngine,
  "csv-to-parquet": csvToParquetEngine,
  "json-to-parquet": jsonToParquetEngine,
  "jsonl-to-excel": jsonlToExcelEngine,
  "jsonl-to-csv": jsonlToCsvEngine,
  "csv-to-jsonl": csvToJsonlEngine,
  "markdown-to-excel": markdownTableEngine,
  "sqlite-to-excel": sqliteToExcelEngine,
  "json-to-ndjson": jsonToNdjsonEngine,
  "json-to-schema": jsonToSchemaEngine,
};

export function getConverterEngine(engineId: ConverterEngineId): IConverterEngine {
  const engine = ENGINES[engineId];
  if (!engine) {
    throw new Error(`Unsupported converter engine: "${engineId}"`);
  }
  return engine;
}
