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
  excelToJsonlEngine,
  jsonToJsonlEngine,
  JsonlToExcelEngine,
  JsonlToCsvEngine,
  CsvToJsonlEngine,
  ExcelToJsonlEngine,
  JsonToJsonlEngine,
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
import {
  tsvToCsvEngine,
  csvToTsvEngine,
  tsvToExcelEngine,
  excelToTsvEngine,
  TsvToCsvEngine,
  CsvToTsvEngine,
  TsvToExcelEngine,
  ExcelToTsvEngine,
} from "./tsv-engine";
import {
  sqlToCsvEngine,
  csvToSqlEngine,
  sqlToJsonEngine,
  jsonToSqlEngine,
  SqlToCsvEngine,
  CsvToSqlEngine,
  SqlToJsonEngine,
  JsonToSqlEngine,
} from "./sql-engine";
import {
  ndjsonToCsvEngine,
  csvToNdjsonEngine,
  ndjsonToExcelEngine,
  NdjsonToCsvEngine,
  CsvToNdjsonEngine,
  NdjsonToExcelEngine,
} from "./ndjson-engine";
import {
  yamlToExcelEngine,
  excelToYamlEngine,
  YamlToExcelEngine,
  ExcelToYamlEngine,
} from "./yaml-engine";

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
  excelToJsonlEngine,
  jsonToJsonlEngine,
  JsonlToExcelEngine,
  JsonlToCsvEngine,
  CsvToJsonlEngine,
  ExcelToJsonlEngine,
  JsonToJsonlEngine,
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

const imageStubEngine: IConverterEngine = {
  async parsePreview() {
    return { columns: [], rows: [], totalRows: 0 };
  },
  async convert() {
    throw new Error("Image conversions are processed via ImageConverterTool.");
  },
};

import {
  jpgToPngEngine,
  pngToJpgEngine,
  webpToJpgEngine,
  svgToPngEngine,
  jpgToPdfEngine,
  pngToPdfEngine,
} from "./consumer-media-engine";

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
  "excel-to-jsonl": excelToJsonlEngine,
  "json-to-jsonl": jsonToJsonlEngine,
  "markdown-to-excel": markdownTableEngine,
  "sqlite-to-excel": sqliteToExcelEngine,
  "json-to-ndjson": jsonToNdjsonEngine,
  "json-to-schema": jsonToSchemaEngine,
  "tsv-to-csv": tsvToCsvEngine,
  "csv-to-tsv": csvToTsvEngine,
  "tsv-to-excel": tsvToExcelEngine,
  "excel-to-tsv": excelToTsvEngine,
  "sql-to-csv": sqlToCsvEngine,
  "csv-to-sql": csvToSqlEngine,
  "sql-to-json": sqlToJsonEngine,
  "json-to-sql": jsonToSqlEngine,
  "ndjson-to-csv": ndjsonToCsvEngine,
  "csv-to-ndjson": csvToNdjsonEngine,
  "ndjson-to-excel": ndjsonToExcelEngine,
  "yaml-to-excel": yamlToExcelEngine,
  "excel-to-yaml": excelToYamlEngine,
  "image-converter": imageStubEngine,
  "jpg-to-png": jpgToPngEngine,
  "png-to-jpg": pngToJpgEngine,
  "webp-to-jpg": webpToJpgEngine,
  "svg-to-png": svgToPngEngine,
  "jpg-to-pdf": jpgToPdfEngine,
  "png-to-pdf": pngToPdfEngine,
};

export function getConverterEngine(engineId: ConverterEngineId): IConverterEngine {
  const engine = ENGINES[engineId];
  if (!engine) {
    throw new Error(`Unsupported converter engine: "${engineId}"`);
  }
  return engine;
}
