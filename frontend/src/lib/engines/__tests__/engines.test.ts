import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import {
  csvToExcelEngine,
  jsonToExcelEngine,
  excelToJsonEngine,
  excelToCsvEngine,
  xmlToExcelEngine,
  tallyXmlToExcelEngine,
  getConverterEngine,
} from "../index";

describe("Conversion Engines", () => {
  describe("csvToExcelEngine", () => {
    it("parsePreview extracts columns and rows from CSV text", async () => {
      const csvContent = "name,age,city\nAlice,30,New York\nBob,25,San Francisco\nCharlie,35,Chicago";
      const file = new File([csvContent], "users.csv", { type: "text/csv" });

      const preview = await csvToExcelEngine.parsePreview(file, 2);

      expect(preview.columns).toEqual(["name", "age", "city"]);
      expect(preview.rows).toHaveLength(2);
      expect(preview.rows[0]).toEqual({ name: "Alice", age: "30", city: "New York" });
      expect(preview.rows[1]).toEqual({ name: "Bob", age: "25", city: "San Francisco" });
      expect(preview.totalRows).toBe(3);
    });

    it("parsePreview handles semicolon delimited CSV via auto-detection", async () => {
      const csvContent = "product;price;quantity\nLaptop;1200;5\nPhone;800;10";
      const file = new File([csvContent], "inventory.csv", { type: "text/csv" });

      const preview = await csvToExcelEngine.parsePreview(file);
      expect(preview.columns).toEqual(["product", "price", "quantity"]);
      expect(preview.rows).toHaveLength(2);
      expect(preview.totalRows).toBe(2);
    });

    it("parsePreview handles empty files gracefully", async () => {
      const file = new File([""], "empty.csv", { type: "text/csv" });
      const preview = await csvToExcelEngine.parsePreview(file);
      expect(preview.columns).toEqual([]);
      expect(preview.rows).toEqual([]);
      expect(preview.totalRows).toBe(0);
    });

    it("convert produces a valid XLSX Blob", async () => {
      const csvContent = "name,age,city\nAlice,30,New York\nBob,25,San Francisco";
      const file = new File([csvContent], "users.csv", { type: "text/csv" });

      const output = await csvToExcelEngine.convert(file, { sheetName: "Users" });

      expect(output.filename).toBe("users.xlsx");
      expect(output.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(output.blob).toBeInstanceOf(Blob);

      const arrayBuffer = await output.blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      expect(workbook.SheetNames).toContain("Users");
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets["Users"]);
      expect(sheetData).toHaveLength(2);
      expect(sheetData[0]).toMatchObject({ name: "Alice", age: 30, city: "New York" });
    });

    it("convert throws error on empty CSV", async () => {
      const file = new File(["   "], "empty.csv", { type: "text/csv" });
      await expect(csvToExcelEngine.convert(file)).rejects.toThrow("CSV file is empty");
    });
  });

  describe("jsonToExcelEngine", () => {
    it("parsePreview flattens nested objects into tabular format", async () => {
      const jsonData = [
        {
          id: 1,
          user: { name: "Alice", address: { city: "New York" } },
          tags: ["admin", "editor"],
        },
        {
          id: 2,
          user: { name: "Bob", address: { city: "Boston" } },
          tags: ["viewer"],
        },
      ];
      const file = new File([JSON.stringify(jsonData)], "users.json", {
        type: "application/json",
      });

      const preview = await jsonToExcelEngine.parsePreview(file);

      expect(preview.columns).toContain("id");
      expect(preview.columns).toContain("user.name");
      expect(preview.columns).toContain("user.address.city");
      expect(preview.columns).toContain("tags");
      expect(preview.rows).toHaveLength(2);
      expect(preview.rows[0]["user.name"]).toBe("Alice");
      expect(preview.rows[0]["user.address.city"]).toBe("New York");
      expect(preview.totalRows).toBe(2);
    });

    it("parsePreview handles single object input (non-array)", async () => {
      const singleObject = {
        company: "Acme Corp",
        meta: { founded: 2020, active: true },
      };
      const file = new File([JSON.stringify(singleObject)], "company.json", {
        type: "application/json",
      });

      const preview = await jsonToExcelEngine.parsePreview(file);
      expect(preview.columns).toContain("company");
      expect(preview.columns).toContain("meta.founded");
      expect(preview.columns).toContain("meta.active");
      expect(preview.rows).toHaveLength(1);
      expect(preview.totalRows).toBe(1);
    });

    it("convert produces a valid XLSX Blob", async () => {
      const jsonData = [
        { id: 1, details: { title: "Dev", score: 95 } },
        { id: 2, details: { title: "Lead", score: 99 } },
      ];
      const file = new File([JSON.stringify(jsonData)], "scores.json", {
        type: "application/json",
      });

      const output = await jsonToExcelEngine.convert(file, { sheetName: "Scores" });

      expect(output.filename).toBe("scores.xlsx");
      expect(output.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      const arrayBuffer = await output.blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      expect(workbook.SheetNames).toContain("Scores");
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets["Scores"]);
      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatchObject({ id: 1, "details.title": "Dev", "details.score": 95 });
    });

    it("convert supports flattenNested: false option", async () => {
      const jsonData = [{ id: 1, nested: { key: "val" } }];
      const file = new File([JSON.stringify(jsonData)], "raw.json", {
        type: "application/json",
      });

      const output = await jsonToExcelEngine.convert(file, { flattenNested: false });
      expect(output.blob).toBeInstanceOf(Blob);
    });
  });

  describe("excelToJsonEngine", () => {
    function createMockExcelFile(filename = "data.xlsx"): File {
      const worksheet = XLSX.utils.aoa_to_sheet([
        ["id", "name", "role"],
        [1, "Alice", "Admin"],
        [2, "Bob", "User"],
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      return new File([buffer], filename, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }

    it("parsePreview extracts columns and rows from Excel", async () => {
      const file = createMockExcelFile();
      const preview = await excelToJsonEngine.parsePreview(file);

      expect(preview.columns).toEqual(["id", "name", "role"]);
      expect(preview.rows).toHaveLength(2);
      expect(preview.rows[0]).toEqual({ id: 1, name: "Alice", role: "Admin" });
      expect(preview.totalRows).toBe(2);
    });

    it("convert produces a valid JSON Blob", async () => {
      const file = createMockExcelFile("team.xlsx");
      const output = await excelToJsonEngine.convert(file, { prettify: true });

      expect(output.filename).toBe("team.json");
      expect(output.mimeType).toBe("application/json");

      const text = await output.blob.text();
      const json = JSON.parse(text);
      expect(json).toEqual([
        { id: 1, name: "Alice", role: "Admin" },
        { id: 2, name: "Bob", role: "User" },
      ]);
      // Verify formatting when prettify is true
      expect(text).toContain("\n");
    });
  });

  describe("excelToCsvEngine", () => {
    function createMockExcelFile(): File {
      const worksheet = XLSX.utils.aoa_to_sheet([
        ["id", "name", "dept"],
        [101, "Carol", "Finance"],
        [102, "David", "Marketing"],
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Departments");
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      return new File([buffer], "staff.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }

    it("parsePreview extracts tabular preview from Excel", async () => {
      const file = createMockExcelFile();
      const preview = await excelToCsvEngine.parsePreview(file, 1);

      expect(preview.columns).toEqual(["id", "name", "dept"]);
      expect(preview.rows).toHaveLength(1);
      expect(preview.totalRows).toBe(2);
    });

    it("convert produces valid CSV Blob with custom delimiter", async () => {
      const file = createMockExcelFile();
      const output = await excelToCsvEngine.convert(file, { delimiter: ";" });

      expect(output.filename).toBe("staff.csv");
      expect(output.mimeType).toBe("text/csv");

      const text = await output.blob.text();
      expect(text).toContain("id;name;dept");
      expect(text).toContain("101;Carol;Finance");
    });
  });

  describe("xmlToExcelEngine", () => {
    it("parsePreview and convert parses generic XML into tabular data and XLSX", async () => {
      const xmlContent = `
        <catalog>
          <book id="bk101">
            <author>Gambardella, Matthew</author>
            <title>XML Developer's Guide</title>
            <price>44.95</price>
          </book>
          <book id="bk102">
            <author>Ralls, Kim</author>
            <title>Midnight Rain</title>
            <price>5.95</price>
          </book>
        </catalog>
      `;
      const file = new File([xmlContent], "books.xml", { type: "application/xml" });

      const preview = await xmlToExcelEngine.parsePreview(file);
      expect(preview.columns).toContain("author");
      expect(preview.columns).toContain("title");
      expect(preview.columns).toContain("price");
      expect(preview.rows).toHaveLength(2);
      expect(preview.rows[0]["author"]).toBe("Gambardella, Matthew");

      const output = await xmlToExcelEngine.convert(file);
      expect(output.filename).toBe("books.xlsx");
      expect(output.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      const arrayBuffer = await output.blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      expect(sheetData).toHaveLength(2);
    });

    it("handles single-item XML files", async () => {
      const xmlContent = `
        <product id="p100">
          <name>Super Widget</name>
          <cost>19.99</cost>
        </product>
      `;
      const file = new File([xmlContent], "product.xml", { type: "application/xml" });

      const preview = await xmlToExcelEngine.parsePreview(file);
      expect(preview.columns).toContain("name");
      expect(preview.columns).toContain("cost");
      expect(preview.rows).toHaveLength(1);
      expect(preview.rows[0]["name"]).toBe("Super Widget");
    });

    it("handles Tally XML format voucher collections", async () => {
      const tallyXml = `
        <ENVELOPE>
          <BODY>
            <DATA>
              <TALLYMESSAGE>
                <VOUCHER VCHTYPE="Payment">
                  <DATE>20230401</DATE>
                  <PARTYNAME>Rent</PARTYNAME>
                  <AMOUNT>-15000</AMOUNT>
                </VOUCHER>
              </TALLYMESSAGE>
              <TALLYMESSAGE>
                <VOUCHER VCHTYPE="Receipt">
                  <DATE>20230402</DATE>
                  <PARTYNAME>Consulting</PARTYNAME>
                  <AMOUNT>25000</AMOUNT>
                </VOUCHER>
              </TALLYMESSAGE>
            </DATA>
          </BODY>
        </ENVELOPE>
      `;
      const file = new File([tallyXml], "tally_export.xml", { type: "application/xml" });

      const preview = await tallyXmlToExcelEngine.parsePreview(file);
      expect(preview.rows).toHaveLength(2);
      expect(preview.totalRows).toBe(2);

      const output = await tallyXmlToExcelEngine.convert(file);
      expect(output.filename).toBe("tally_export.xlsx");
    });
  });

  describe("getConverterEngine factory", () => {
    it("returns correct engine instances by engineId", () => {
      expect(getConverterEngine("csv-to-excel")).toBe(csvToExcelEngine);
      expect(getConverterEngine("json-to-excel")).toBe(jsonToExcelEngine);
      expect(getConverterEngine("excel-to-json")).toBe(excelToJsonEngine);
      expect(getConverterEngine("excel-to-csv")).toBe(excelToCsvEngine);
      expect(getConverterEngine("xml-to-excel")).toBe(xmlToExcelEngine);
      expect(getConverterEngine("tally-xml-to-excel")).toBe(tallyXmlToExcelEngine);
    });

    it("throws an error for unsupported engineId", () => {
      expect(() => getConverterEngine("unsupported-engine" as any)).toThrow(
        /Unsupported converter engine/
      );
    });
  });
});
