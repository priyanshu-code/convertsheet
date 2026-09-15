import { describe, it, expect, vi, beforeEach } from "vitest";
import * as XLSX from "xlsx";
import {
  ParquetToExcelEngine,
  ParquetToCsvEngine,
  ParquetToJsonEngine,
  CsvToParquetEngine,
  JsonToParquetEngine,
} from "../parquet-engine";
import {
  JsonlToExcelEngine,
  JsonlToCsvEngine,
  CsvToJsonlEngine,
} from "../jsonl-engine";
import { getConverterEngine } from "../index";
import { IDuckDbClient } from "../duckdb-client";

describe("Parquet and JSONL Engines", () => {
  let mockDuckDb: IDuckDbClient;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockDuckDb = {
      init: vi.fn(),
      registerFileBuffer: vi.fn().mockResolvedValue(undefined),
      dropFile: vi.fn().mockResolvedValue(undefined),
      copyFileToBuffer: vi.fn().mockResolvedValue(new Uint8Array([80, 65, 82, 49])), // PAR1 magic bytes
      queryTabular: vi.fn().mockImplementation(async (sql: string) => {
        if (sql.includes("count(*)")) {
          return {
            columns: ["total"],
            rows: [{ total: 2 }],
            totalRows: 1,
          };
        }
        return {
          columns: ["id", "title", "amount"],
          rows: [
            { id: 1, title: "Alpha", amount: 100.5 },
            { id: 2, title: "Beta", amount: 250.0 },
          ],
          totalRows: 2,
        };
      }),
      execute: vi.fn().mockResolvedValue(undefined),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("ParquetToExcelEngine", () => {
    it("parsePreview extracts tabular preview from Parquet", async () => {
      const engine = new ParquetToExcelEngine(mockDuckDb);
      const file = new File([new Uint8Array([1, 2, 3])], "data.parquet", {
        type: "application/vnd.apache.parquet",
      });

      const preview = await engine.parsePreview(file, 10);
      expect(preview.columns).toEqual(["id", "title", "amount"]);
      expect(preview.rows).toHaveLength(2);
      expect(preview.totalRows).toBe(2);
      expect(mockDuckDb.registerFileBuffer).toHaveBeenCalled();
      expect(mockDuckDb.dropFile).toHaveBeenCalled();
    });

    it("parsePreview returns empty on 0-byte file", async () => {
      const engine = new ParquetToExcelEngine(mockDuckDb);
      const file = new File([], "empty.parquet", {
        type: "application/vnd.apache.parquet",
      });

      const preview = await engine.parsePreview(file);
      expect(preview.columns).toEqual([]);
      expect(preview.rows).toEqual([]);
      expect(preview.totalRows).toBe(0);
    });

    it("convert produces a valid Excel workbook", async () => {
      const engine = new ParquetToExcelEngine(mockDuckDb);
      const file = new File([new Uint8Array([1, 2, 3])], "analytics.parquet", {
        type: "application/vnd.apache.parquet",
      });

      const output = await engine.convert(file, { sheetName: "Analytics" });
      expect(output.filename).toBe("analytics.xlsx");
      expect(output.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      const arrayBuffer = await output.blob.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      expect(wb.SheetNames).toContain("Analytics");
      const rows = XLSX.utils.sheet_to_json(wb.Sheets["Analytics"]);
      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatchObject({ id: 1, title: "Alpha", amount: 100.5 });
    });

    it("convert throws descriptive error on empty file", async () => {
      const engine = new ParquetToExcelEngine(mockDuckDb);
      const file = new File([], "empty.parquet", {
        type: "application/vnd.apache.parquet",
      });
      await expect(engine.convert(file)).rejects.toThrow("Parquet file is empty");
    });
  });

  describe("ParquetToCsvEngine", () => {
    it("convert compiles Parquet into CSV via DuckDB COPY", async () => {
      const csvBytes = new TextEncoder().encode("id,title,amount\n1,Alpha,100.5\n");
      vi.mocked(mockDuckDb.copyFileToBuffer).mockResolvedValue(csvBytes);

      const engine = new ParquetToCsvEngine(mockDuckDb);
      const file = new File([new Uint8Array([1, 2])], "data.parquet", {
        type: "application/vnd.apache.parquet",
      });

      const output = await engine.convert(file, { delimiter: "," });
      expect(output.filename).toBe("data.csv");
      expect(output.mimeType).toBe("text/csv;charset=utf-8;");

      const text = await output.blob.text();
      expect(text).toContain("id,title,amount");
      expect(mockDuckDb.execute).toHaveBeenCalled();
    });
  });

  describe("ParquetToJsonEngine", () => {
    it("convert compiles Parquet into JSON", async () => {
      const jsonBytes = new TextEncoder().encode('[{"id":1,"title":"Alpha"}]');
      vi.mocked(mockDuckDb.copyFileToBuffer).mockResolvedValue(jsonBytes);

      const engine = new ParquetToJsonEngine(mockDuckDb);
      const file = new File([new Uint8Array([1, 2])], "records.parquet", {
        type: "application/vnd.apache.parquet",
      });

      const output = await engine.convert(file, { prettify: true });
      expect(output.filename).toBe("records.json");
      expect(output.mimeType).toBe("application/json");

      const text = await output.blob.text();
      expect(JSON.parse(text)).toEqual([{ id: 1, title: "Alpha" }]);
      expect(text).toContain("\n"); // Prettified
    });
  });

  describe("CsvToParquetEngine", () => {
    it("parsePreview parses CSV via DuckDB", async () => {
      const engine = new CsvToParquetEngine(mockDuckDb);
      const file = new File(["id,name\n1,Alice"], "users.csv", {
        type: "text/csv",
      });

      const preview = await engine.parsePreview(file);
      expect(preview.columns).toEqual(["id", "title", "amount"]);
      expect(preview.rows).toHaveLength(2);
    });

    it("convert exports Parquet binary blob", async () => {
      const engine = new CsvToParquetEngine(mockDuckDb);
      const file = new File(["id,val\n1,100"], "input.csv", {
        type: "text/csv",
      });

      const output = await engine.convert(file);
      expect(output.filename).toBe("input.parquet");
      expect(output.mimeType).toBe("application/vnd.apache.parquet");
      expect(mockDuckDb.execute).toHaveBeenCalledWith(
        expect.stringContaining("FORMAT PARQUET")
      );
    });
  });

  describe("JsonToParquetEngine", () => {
    it("convert exports Parquet binary blob from JSON", async () => {
      const engine = new JsonToParquetEngine(mockDuckDb);
      const file = new File(['[{"id":1}]'], "input.json", {
        type: "application/json",
      });

      const output = await engine.convert(file);
      expect(output.filename).toBe("input.parquet");
      expect(output.mimeType).toBe("application/vnd.apache.parquet");
      expect(mockDuckDb.execute).toHaveBeenCalledWith(
        expect.stringContaining("FORMAT PARQUET")
      );
    });
  });

  describe("JsonlToExcelEngine & JsonlToCsvEngine", () => {
    it("JsonlToExcelEngine converts JSONL into Excel workbook", async () => {
      const engine = new JsonlToExcelEngine(mockDuckDb);
      const file = new File(['{"id":1}\n{"id":2}'], "events.jsonl", {
        type: "application/x-ndjson",
      });

      const preview = await engine.parsePreview(file);
      expect(preview.columns).toEqual(["id", "title", "amount"]);

      const output = await engine.convert(file);
      expect(output.filename).toBe("events.xlsx");
      expect(output.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    });

    it("JsonlToCsvEngine converts JSONL into CSV", async () => {
      const csvBytes = new TextEncoder().encode("id,title\n1,Event1");
      vi.mocked(mockDuckDb.copyFileToBuffer).mockResolvedValue(csvBytes);

      const engine = new JsonlToCsvEngine(mockDuckDb);
      const file = new File(['{"id":1}'], "events.jsonl", {
        type: "application/x-ndjson",
      });

      const output = await engine.convert(file);
      expect(output.filename).toBe("events.csv");
      expect(output.mimeType).toBe("text/csv;charset=utf-8;");
    });

    it("CsvToJsonlEngine converts CSV into Newline-Delimited JSON", async () => {
      const jsonlBytes = new TextEncoder().encode('{"id":1}\n{"id":2}');
      vi.mocked(mockDuckDb.copyFileToBuffer).mockResolvedValue(jsonlBytes);

      const engine = new CsvToJsonlEngine(mockDuckDb);
      const file = new File(["id\n1\n2"], "data.csv", {
        type: "text/csv",
      });

      const output = await engine.convert(file);
      expect(output.filename).toBe("data.jsonl");
      expect(output.mimeType).toBe("application/x-ndjson");
      expect(mockDuckDb.execute).toHaveBeenCalledWith(
        expect.stringContaining("ARRAY FALSE")
      );
    });
  });

  describe("Engine Dispatcher Integration", () => {
    const engineIds = [
      "parquet-to-excel",
      "parquet-to-csv",
      "parquet-to-json",
      "csv-to-parquet",
      "json-to-parquet",
      "jsonl-to-excel",
      "jsonl-to-csv",
      "csv-to-jsonl",
    ] as const;

    it.each(engineIds)("successfully retrieves engine '%s'", (id) => {
      const engine = getConverterEngine(id);
      expect(engine).toBeDefined();
      expect(engine.id).toBe(id);
    });
  });
});
