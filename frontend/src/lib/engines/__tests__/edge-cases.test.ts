import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import {
  csvToExcelEngine,
  jsonToExcelEngine,
  excelToJsonEngine,
  excelToCsvEngine,
  xmlToExcelEngine,
  tallyXmlToExcelEngine,
} from "../index";

describe("Converter Engines - Edge Cases & Stress Testing", () => {
  describe("CSV Engine - Advanced Edge Cases", () => {
    it("handles multiline cell values with internal newlines", async () => {
      const csv = `id,name,bio\n1,Alice,"Line 1\nLine 2\nLine 3"\n2,Bob,"Simple bio"`;
      const file = new File([csv], "multiline.csv", { type: "text/csv" });

      const preview = await csvToExcelEngine.parsePreview(file);
      expect(preview.rows).toHaveLength(2);
      expect(preview.rows[0]["bio"]).toBe("Line 1\nLine 2\nLine 3");

      const output = await csvToExcelEngine.convert(file);
      const buf = await output.blob.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      expect(rows[0]["bio"]).toBe("Line 1\nLine 2\nLine 3");
    });

    it("handles escaped quotes inside quoted fields", async () => {
      const csv = `id,quote\n1,"She said, ""Hello World!"""\n2,"He replied, ""All good!"""`;
      const file = new File([csv], "quotes.csv", { type: "text/csv" });

      const output = await csvToExcelEngine.convert(file);
      const buf = await output.blob.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      expect(rows[0]["quote"]).toBe('She said, "Hello World!"');
      expect(rows[1]["quote"]).toBe('He replied, "All good!"');
    });

    it("preserves UTF-8 multi-byte characters and international alphabets", async () => {
      const csv = `name,country,symbol\n"张伟","中国","🇨🇳"\n"José","España","€"\n"Владимир","Россия","₽"`;
      const file = new File([csv], "international.csv", { type: "text/csv" });

      const output = await csvToExcelEngine.convert(file);
      const buf = await output.blob.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      expect(rows[0]["name"]).toBe("张伟");
      expect(rows[0]["symbol"]).toBe("🇨🇳");
      expect(rows[1]["name"]).toBe("José");
      expect(rows[1]["symbol"]).toBe("€");
      expect(rows[2]["name"]).toBe("Владимир");
    });

    it("handles pipe (|) and tab (\\t) delimiters via auto-detection", async () => {
      const tsv = `order_id\tcustomer\ttotal\nORD-101\tAlice\t450.50\nORD-102\tBob\t120.00`;
      const file = new File([tsv], "orders.tsv", { type: "text/tab-separated-values" });

      const preview = await csvToExcelEngine.parsePreview(file);
      expect(preview.columns).toEqual(["order_id", "customer", "total"]);
      expect(preview.rows[0]["order_id"]).toBe("ORD-101");
      expect(preview.rows[0]["total"]).toBe("450.50");

      const output = await csvToExcelEngine.convert(file);
      expect(output.blob).toBeInstanceOf(Blob);
    });

    it("handles UTF-8 BOM prefix cleanly without corrupting header name", async () => {
      const bomCsv = "\uFEFFid,name,score\n1,Alice,98\n2,Bob,92";
      const file = new File([bomCsv], "bom.csv", { type: "text/csv" });

      const preview = await csvToExcelEngine.parsePreview(file);
      expect(preview.columns[0]).toBe("id");
      expect(preview.columns[0]).not.toContain("\uFEFF");
    });
  });

  describe("JSON Engine - Deep Nesting & Heterogeneous Data", () => {
    it("flattens deeply nested 4-level objects into dot notation", async () => {
      const data = [
        {
          id: "USR-1",
          profile: {
            personal: {
              name: {
                first: "John",
                last: "Doe",
              },
            },
          },
        },
      ];
      const file = new File([JSON.stringify(data)], "deep.json", {
        type: "application/json",
      });

      const preview = await jsonToExcelEngine.parsePreview(file);
      expect(preview.columns).toContain("profile.personal.name.first");
      expect(preview.columns).toContain("profile.personal.name.last");
      expect(preview.rows[0]["profile.personal.name.first"]).toBe("John");
      expect(preview.rows[0]["profile.personal.name.last"]).toBe("Doe");

      const output = await jsonToExcelEngine.convert(file);
      const buf = await output.blob.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        wb.Sheets[wb.SheetNames[0]]
      );
      expect(rows[0]["profile.personal.name.first"]).toBe("John");
    });

    it("handles heterogeneous objects with sparse/missing keys across items", async () => {
      const data = [
        { id: 1, name: "Item A", price: 10.5 },
        { id: 2, name: "Item B", stock: 100 },
        { id: 3, category: "Hardware" },
      ];
      const file = new File([JSON.stringify(data)], "sparse.json", {
        type: "application/json",
      });

      const preview = await jsonToExcelEngine.parsePreview(file);
      expect(preview.columns).toContain("id");
      expect(preview.columns).toContain("name");
      expect(preview.columns).toContain("price");
      expect(preview.columns).toContain("stock");
      expect(preview.columns).toContain("category");

      const output = await jsonToExcelEngine.convert(file);
      expect(output.blob.size).toBeGreaterThan(0);
    });

    it("formats array of primitive values as readable comma-separated text", async () => {
      const data = [
        {
          id: 1,
          roles: ["admin", "developer", "reviewer"],
          tags: ["v1", "release"],
        },
      ];
      const file = new File([JSON.stringify(data)], "arrays.json", {
        type: "application/json",
      });

      const preview = await jsonToExcelEngine.parsePreview(file);
      expect(preview.rows[0]["roles"]).toBe("admin, developer, reviewer");
      expect(preview.rows[0]["tags"]).toBe("v1, release");
    });

    it("handles boolean and null values without crashing", async () => {
      const data = [
        { id: 1, active: true, notes: null },
        { id: 2, active: false, notes: "Verified" },
      ];
      const file = new File([JSON.stringify(data)], "types.json", {
        type: "application/json",
      });

      const preview = await jsonToExcelEngine.parsePreview(file);
      expect(preview.rows[0]["active"]).toBe(true);
      expect(preview.rows[0]["notes"]).toBeNull();
    });
  });

  describe("XML Engine - Attributes, CDATA & Tally ERP", () => {
    it("parses XML elements with both attributes and text content", async () => {
      const xml = `
        <catalog>
          <product id="P101" category="Electronics" inStock="true">Wireless Mouse</product>
          <product id="P102" category="Office" inStock="false">Ergonomic Chair</product>
        </catalog>
      `;
      const file = new File([xml], "catalog.xml", { type: "application/xml" });

      const preview = await xmlToExcelEngine.parsePreview(file);
      expect(preview.columns).toContain("@_id");
      expect(preview.columns).toContain("@_category");
      expect(preview.columns).toContain("@_inStock");
      expect(preview.rows).toHaveLength(2);
      expect(preview.rows[0]["@_id"]).toBe("P101");
      expect(preview.rows[0]["#text"]).toBe("Wireless Mouse");
    });

    it("handles CDATA blocks containing markup characters", async () => {
      const xml = `
        <items>
          <item>
            <id>1</id>
            <description><![CDATA[<strong>Sale!</strong> 50% off & free shipping]]></description>
          </item>
        </items>
      `;
      const file = new File([xml], "cdata.xml", { type: "application/xml" });

      const preview = await xmlToExcelEngine.parsePreview(file);
      expect(preview.rows[0]["description"]).toBe(
        "<strong>Sale!</strong> 50% off & free shipping"
      );
    });

    it("TallyXmlToExcelEngine extracts real-world voucher structure with ledgers", async () => {
      const tallyXml = `
        <ENVELOPE>
          <HEADER>
            <TALLYREQUEST>Export Data</TALLYREQUEST>
          </HEADER>
          <BODY>
            <DATA>
              <TALLYMESSAGE>
                <VOUCHER VCHTYPE="Sales" ACTION="Create">
                  <DATE>20260401</DATE>
                  <VOUCHERNUMBER>INV-2026-001</VOUCHERNUMBER>
                  <PARTYLEDGERNAME>Acme Industries Ltd</PARTYLEDGERNAME>
                  <AMOUNT>-25000.00</AMOUNT>
                  <NARRATION>Payment for cloud infrastructure consulting</NARRATION>
                </VOUCHER>
              </TALLYMESSAGE>
              <TALLYMESSAGE>
                <VOUCHER VCHTYPE="Payment" ACTION="Create">
                  <DATE>20260402</DATE>
                  <VOUCHERNUMBER>PAY-2026-042</VOUCHERNUMBER>
                  <PARTYLEDGERNAME>HDFC Bank Account</PARTYLEDGERNAME>
                  <AMOUNT>15000.00</AMOUNT>
                  <NARRATION>Office rent payment for April 2026</NARRATION>
                </VOUCHER>
              </TALLYMESSAGE>
            </DATA>
          </BODY>
        </ENVELOPE>
      `;
      const file = new File([tallyXml], "tally_export.xml", {
        type: "application/xml",
      });

      const preview = await tallyXmlToExcelEngine.parsePreview(file);
      expect(preview.columns).toContain("VOUCHERNUMBER");
      expect(preview.columns).toContain("PARTYLEDGERNAME");
      expect(preview.columns).toContain("AMOUNT");
      expect(preview.rows).toHaveLength(2);
      expect(preview.rows[0]["VOUCHERNUMBER"]).toBe("INV-2026-001");
      expect(preview.rows[0]["PARTYLEDGERNAME"]).toBe("Acme Industries Ltd");
      expect(preview.rows[1]["VOUCHERNUMBER"]).toBe("PAY-2026-042");

      const output = await tallyXmlToExcelEngine.convert(file, {
        sheetName: "Tally_Vouchers",
      });
      const buf = await output.blob.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      expect(wb.SheetNames).toContain("Tally_Vouchers");
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        wb.Sheets["Tally_Vouchers"]
      );
      expect(rows).toHaveLength(2);
      expect(rows[0]["VOUCHERNUMBER"]).toBe("INV-2026-001");
    });
  });

  describe("End-to-End Lossless Round-Trip Conversions", () => {
    it("Round-trip: CSV -> Excel -> CSV preserves data integrity", async () => {
      const originalCsv = `id,name,department,salary\n1,Alice,Engineering,125000\n2,Bob,Finance,95000\n3,Carol,Marketing,88000`;
      const sourceFile = new File([originalCsv], "employees.csv", {
        type: "text/csv",
      });

      // 1. CSV -> Excel (.xlsx)
      const excelOutput = await csvToExcelEngine.convert(sourceFile, {
        sheetName: "Staff",
      });
      expect(excelOutput.filename).toBe("employees.xlsx");

      // 2. Excel -> CSV (.csv)
      const excelFile = new File([excelOutput.blob], excelOutput.filename, {
        type: excelOutput.mimeType,
      });
      const csvOutput = await excelToCsvEngine.convert(excelFile, {
        delimiter: ",",
      });
      expect(csvOutput.filename).toBe("employees.csv");

      const roundTripText = await csvOutput.blob.text();
      const cleanCsv = roundTripText.replace(/^\uFEFF/, "");

      expect(cleanCsv).toContain("Alice");
      expect(cleanCsv).toContain("Engineering");
      expect(cleanCsv).toContain("Bob");
      expect(cleanCsv).toContain("125000");
    });

    it("Round-trip: JSON -> Excel -> JSON preserves structured data", async () => {
      const originalData = [
        { code: "A101", product: "Monitor", price: 299 },
        { code: "B202", product: "Keyboard", price: 89 },
      ];
      const sourceFile = new File(
        [JSON.stringify(originalData)],
        "products.json",
        { type: "application/json" }
      );

      // 1. JSON -> Excel
      const excelOutput = await jsonToExcelEngine.convert(sourceFile);
      const excelFile = new File([excelOutput.blob], excelOutput.filename, {
        type: excelOutput.mimeType,
      });

      // 2. Excel -> JSON
      const jsonOutput = await excelToJsonEngine.convert(excelFile, {
        prettify: false,
      });
      const jsonText = await jsonOutput.blob.text();
      const parsedData = JSON.parse(jsonText);

      expect(parsedData).toEqual(originalData);
    });
  });
});
