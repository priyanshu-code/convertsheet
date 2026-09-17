import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import {
  markdownTableEngine,
  MarkdownTableEngine,
  parseMarkdownTable,
  parseHtmlTable,
} from "../markdown-table-engine";
import { getConverterEngine } from "../index";

describe("markdown-table-engine", () => {
  describe("parseMarkdownTable", () => {
    it("parses GFM pipe tables with various column alignments", () => {
      const markdown = `
| Product | Price | In Stock |
| :--- | :---: | ---: |
| Widget A | $12.50 | 150 |
| Widget B | $99.00 | 0 |
`;
      const result = parseMarkdownTable(markdown);

      expect(result.columns).toEqual(["Product", "Price", "In Stock"]);
      expect(result.totalRows).toBe(2);
      expect(result.rows).toEqual([
        { Product: "Widget A", Price: "$12.50", "In Stock": 150 },
        { Product: "Widget B", Price: "$99.00", "In Stock": 0 },
      ]);
    });

    it("handles auto numeric casting and preserves leading zeros or non-numeric strings gracefully", () => {
      const markdown = `
| Code | Quantity | Rate | FloatVal |
| --- | --- | --- | --- |
| 00123 | 42 | $12.50 | 3.1415 |
| 000 | -10 | 1,234.50 | 0 |
`;
      const result = parseMarkdownTable(markdown);

      expect(result.columns).toEqual(["Code", "Quantity", "Rate", "FloatVal"]);
      expect(result.totalRows).toBe(2);
      // "00123" preserves leading zeros as string
      expect(result.rows[0].Code).toBe("00123");
      expect(result.rows[0].Quantity).toBe(42);
      expect(result.rows[0].Rate).toBe("$12.50");
      expect(result.rows[0].FloatVal).toBe(3.1415);

      expect(result.rows[1].Code).toBe("000");
      expect(result.rows[1].Quantity).toBe(-10);
      expect(result.rows[1].Rate).toBe("1,234.50");
      expect(result.rows[1].FloatVal).toBe(0);
    });

    it("handles tables without leading/trailing pipes and extra spaces", () => {
      const markdown = `
Item | Count
--- | ---
Apple | 10
Banana | 20
`;
      const result = parseMarkdownTable(markdown);
      expect(result.columns).toEqual(["Item", "Count"]);
      expect(result.totalRows).toBe(2);
      expect(result.rows[0]).toEqual({ Item: "Apple", Count: 10 });
      expect(result.rows[1]).toEqual({ Item: "Banana", Count: 20 });
    });

    it("returns empty TabularData for empty or non-table markdown", () => {
      expect(parseMarkdownTable("")).toEqual({ columns: [], rows: [], totalRows: 0 });
      expect(parseMarkdownTable("Just some text\nwithout tables")).toEqual({
        columns: [],
        rows: [],
        totalRows: 0,
      });
    });
  });

  describe("parseHtmlTable", () => {
    it("parses standard HTML table with thead, tbody, th, and td", () => {
      const html = `<table><thead><tr><th>City</th><th>Pop</th></tr></thead><tbody><tr><td>Tokyo</td><td>37M</td></tr><tr><td>Delhi</td><td>31M</td></tr></tbody></table>`;
      const result = parseHtmlTable(html);

      expect(result.columns).toEqual(["City", "Pop"]);
      expect(result.totalRows).toBe(2);
      expect(result.rows).toEqual([
        { City: "Tokyo", Pop: "37M" },
        { City: "Delhi", Pop: "31M" },
      ]);
    });

    it("parses HTML table without explicit thead or tbody", () => {
      const html = `
      <table>
        <tr>
          <th>Name</th>
          <th>Score</th>
        </tr>
        <tr>
          <td>Alice</td>
          <td>95</td>
        </tr>
      </table>`;
      const result = parseHtmlTable(html);

      expect(result.columns).toEqual(["Name", "Score"]);
      expect(result.totalRows).toBe(1);
      expect(result.rows).toEqual([{ Name: "Alice", Score: 95 }]);
    });

    it("handles empty or invalid HTML", () => {
      expect(parseHtmlTable("")).toEqual({ columns: [], rows: [], totalRows: 0 });
      expect(parseHtmlTable("<div>No table here</div>")).toEqual({
        columns: [],
        rows: [],
        totalRows: 0,
      });
    });
  });

  describe("MarkdownTableEngine", () => {
    const engine = new MarkdownTableEngine();

    it("parsePreview extracts preview headers and records from a markdown File", async () => {
      const mdContent = `
| Product | Price | In Stock |
| :--- | :---: | ---: |
| Widget A | $12.50 | 150 |
| Widget B | $99.00 | 0 |
| Widget C | $5.00 | 25 |
`;
      const file = new File([mdContent], "products.md", { type: "text/markdown" });
      const preview = await engine.parsePreview(file, 2);

      expect(preview.columns).toEqual(["Product", "Price", "In Stock"]);
      expect(preview.totalRows).toBe(3);
      expect(preview.rows).toHaveLength(2);
      expect(preview.rows[0]).toEqual({
        Product: "Widget A",
        Price: "$12.50",
        "In Stock": 150,
      });
    });

    it("parsePreview automatically detects and parses HTML table files", async () => {
      const htmlContent = `<table><tr><th>ID</th><th>Status</th></tr><tr><td>101</td><td>Active</td></tr></table>`;
      const file = new File([htmlContent], "status.html", { type: "text/html" });
      const preview = await engine.parsePreview(file);

      expect(preview.columns).toEqual(["ID", "Status"]);
      expect(preview.totalRows).toBe(1);
      expect(preview.rows[0]).toEqual({ ID: 101, Status: "Active" });
    });

    it("convert exports SheetJS XLSX workbook buffer with valid blob and auto column widths", async () => {
      const mdContent = `
| Product Name | Unit Price | In Stock Quantity |
| :--- | :---: | ---: |
| High Performance Laptop | 1200 | 15 |
| Wireless Mouse | 25 | 200 |
`;
      const file = new File([mdContent], "inventory.md", { type: "text/markdown" });
      const output = await engine.convert(file, { sheetName: "Inventory" });

      expect(output.filename).toBe("inventory.xlsx");
      expect(output.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(output.blob).toBeInstanceOf(Blob);

      const arrayBuffer = await output.blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellStyles: true });
      expect(workbook.SheetNames).toContain("Inventory");

      const sheet = workbook.Sheets["Inventory"];
      expect(sheet["!cols"]).toBeDefined();
      expect(sheet["!cols"]?.length).toBe(3);

      const sheetData = XLSX.utils.sheet_to_json(sheet);
      expect(sheetData).toHaveLength(2);
      expect(sheetData[0]).toMatchObject({
        "Product Name": "High Performance Laptop",
        "Unit Price": 1200,
        "In Stock Quantity": 15,
      });
    });

    it("convert throws an error if table contains no rows or columns", async () => {
      const file = new File(["No table content"], "empty.md", { type: "text/markdown" });
      await expect(engine.convert(file)).rejects.toThrow();
    });

    it("is registered in ENGINES and retrievable via getConverterEngine", () => {
      const registered = getConverterEngine("markdown-to-excel");
      expect(registered).toBe(markdownTableEngine);
    });
  });
});
