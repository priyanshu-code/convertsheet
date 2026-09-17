import { describe, it, expect, beforeAll } from "vitest";
import initSqlJs, { Database } from "sql.js";
import * as XLSX from "xlsx";
import { sqliteToExcelEngine } from "../sqlite-engine";

describe("SqliteToExcelEngine", () => {
  let sampleSqliteFile: File;

  beforeAll(async () => {
    const SQL = await initSqlJs();
    const db: Database = new SQL.Database();

    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);");
    db.run(
      "INSERT INTO users VALUES (1, 'Alice', 'alice@example.com'), (2, 'Bob', 'bob@example.com');"
    );

    db.run("CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL);");
    db.run("INSERT INTO orders VALUES (101, 1, 99.50), (102, 2, 149.00);");

    const binaryArray = db.export();
    db.close();

    sampleSqliteFile = new File([binaryArray], "test.sqlite", {
      type: "application/x-sqlite3",
    });
  });

  describe("parsePreview", () => {
    it("returns columns and rows for the first table (users) with totalRows", async () => {
      const preview = await sqliteToExcelEngine.parsePreview(sampleSqliteFile);

      expect(preview.columns).toEqual(["id", "name", "email"]);
      expect(preview.rows).toHaveLength(2);
      expect(preview.rows[0]).toEqual({
        id: 1,
        name: "Alice",
        email: "alice@example.com",
      });
      expect(preview.rows[1]).toEqual({
        id: 2,
        name: "Bob",
        email: "bob@example.com",
      });
      expect(preview.totalRows).toBe(2);
    });

    it("respects maxRows parameter", async () => {
      const preview = await sqliteToExcelEngine.parsePreview(sampleSqliteFile, 1);
      expect(preview.columns).toEqual(["id", "name", "email"]);
      expect(preview.rows).toHaveLength(1);
      expect(preview.totalRows).toBe(2);
    });

    it("returns empty structure for empty file", async () => {
      const emptyFile = new File([], "empty.sqlite", {
        type: "application/x-sqlite3",
      });
      const preview = await sqliteToExcelEngine.parsePreview(emptyFile);
      expect(preview.columns).toEqual([]);
      expect(preview.rows).toEqual([]);
      expect(preview.totalRows).toBe(0);
    });

    it("handles database with empty table", async () => {
      const SQL = await initSqlJs();
      const db: Database = new SQL.Database();
      db.run("CREATE TABLE empty_table (id INT, note TEXT);");
      const bin = db.export();
      db.close();

      const file = new File([bin], "empty_tbl.sqlite");
      const preview = await sqliteToExcelEngine.parsePreview(file);
      expect(preview.columns).toEqual(["id", "note"]);
      expect(preview.rows).toHaveLength(0);
      expect(preview.totalRows).toBe(0);
    });
  });

  describe("convert", () => {
    it("exports multi-sheet Excel workbook where tables become separate sheets", async () => {
      const output = await sqliteToExcelEngine.convert(sampleSqliteFile);

      expect(output.filename).toBe("test.xlsx");
      expect(output.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(output.blob.size).toBeGreaterThan(0);

      const arrayBuffer = await output.blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      expect(workbook.SheetNames).toContain("orders");
      expect(workbook.SheetNames).toContain("users");

      const ordersSheet = workbook.Sheets["orders"];
      const ordersData = XLSX.utils.sheet_to_json<Record<string, unknown>>(ordersSheet);
      expect(ordersData).toHaveLength(2);
      expect(ordersData[0]).toMatchObject({ id: 101, user_id: 1, amount: 99.5 });

      const usersSheet = workbook.Sheets["users"];
      const usersData = XLSX.utils.sheet_to_json<Record<string, unknown>>(usersSheet);
      expect(usersData).toHaveLength(2);
      expect(usersData[0]).toMatchObject({ id: 1, name: "Alice", email: "alice@example.com" });
    });

    it("handles database with single table and custom sheetName", async () => {
      const SQL = await initSqlJs();
      const db: Database = new SQL.Database();
      db.run("CREATE TABLE products (sku TEXT, price REAL);");
      db.run("INSERT INTO products VALUES ('SKU-1', 19.99);");
      const bin = db.export();
      db.close();

      const file = new File([bin], "single.sqlite");
      const output = await sqliteToExcelEngine.convert(file, { sheetName: "MyProducts" });
      const ab = await output.blob.arrayBuffer();
      const wb = XLSX.read(ab, { type: "array" });
      expect(wb.SheetNames).toEqual(["MyProducts"]);
    });

    it("throws error for empty file", async () => {
      const emptyFile = new File([], "empty.sqlite", {
        type: "application/x-sqlite3",
      });
      await expect(sqliteToExcelEngine.convert(emptyFile)).rejects.toThrow(
        "SQLite file is empty"
      );
    });
  });
});
