import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import {
  csvToExcelEngine,
  jsonToExcelEngine,
  xmlToExcelEngine,
  tallyXmlToExcelEngine,
} from "../index";

describe("Public Sample Files Integration Tests", () => {
  const samplesDir = path.resolve(__dirname, "../../../../public/samples");

  it("successfully parses and converts public/samples/users.csv", async () => {
    const filePath = path.join(samplesDir, "users.csv");
    const content = fs.readFileSync(filePath, "utf-8");
    const file = new File([content], "users.csv", { type: "text/csv" });

    const preview = await csvToExcelEngine.parsePreview(file);
    expect(preview.columns).toEqual([
      "id",
      "name",
      "role",
      "department",
      "email",
      "salary",
      "zip_code",
      "notes",
    ]);
    expect(preview.rows).toHaveLength(5);
    expect(preview.rows[0]["name"]).toBe("Smith, John");
    expect(preview.rows[0]["zip_code"]).toBe("01234");
    expect(preview.rows[2]["name"]).toContain("陈伟");

    const output = await csvToExcelEngine.convert(file);
    expect(output.filename).toBe("users.xlsx");
    const buf = await output.blob.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      wb.Sheets[wb.SheetNames[0]]
    );
    expect(rows).toHaveLength(5);
  });

  it("successfully parses and converts public/samples/ecommerce.json", async () => {
    const filePath = path.join(samplesDir, "ecommerce.json");
    const content = fs.readFileSync(filePath, "utf-8");
    const file = new File([content], "ecommerce.json", {
      type: "application/json",
    });

    const preview = await jsonToExcelEngine.parsePreview(file);
    expect(preview.columns).toContain("order_id");
    expect(preview.columns).toContain("customer.name");
    expect(preview.columns).toContain("customer.email");
    expect(preview.columns).toContain("payment.currency");
    expect(preview.rows).toHaveLength(2);
    expect(preview.rows[0]["customer.name"]).toBe("Sarah Connor");

    const output = await jsonToExcelEngine.convert(file);
    expect(output.filename).toBe("ecommerce.xlsx");
    const buf = await output.blob.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      wb.Sheets[wb.SheetNames[0]]
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]["customer.name"]).toBe("Sarah Connor");
  });

  it("successfully parses and converts public/samples/catalog.xml", async () => {
    const filePath = path.join(samplesDir, "catalog.xml");
    const content = fs.readFileSync(filePath, "utf-8");
    const file = new File([content], "catalog.xml", {
      type: "application/xml",
    });

    const preview = await xmlToExcelEngine.parsePreview(file);
    expect(preview.columns.length).toBeGreaterThan(0);
    expect(preview.rows.length).toBeGreaterThan(0);

    const output = await xmlToExcelEngine.convert(file);
    expect(output.filename).toBe("catalog.xlsx");
    const buf = await output.blob.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    expect(wb.SheetNames.length).toBe(1);
  });

  it("successfully parses and converts public/samples/tally-sample.xml", async () => {
    const filePath = path.join(samplesDir, "tally-sample.xml");
    const content = fs.readFileSync(filePath, "utf-8");
    const file = new File([content], "tally-sample.xml", {
      type: "application/xml",
    });

    const preview = await tallyXmlToExcelEngine.parsePreview(file);
    expect(preview.columns).toContain("VOUCHERNUMBER");
    expect(preview.columns).toContain("PARTYLEDGERNAME");
    expect(preview.rows).toHaveLength(2);
    expect(preview.rows[0]["VOUCHERNUMBER"]).toBe("CS-2026-INV01");
    expect(preview.rows[0]["PARTYLEDGERNAME"]).toBe(
      "Apex Cloud Solutions Pvt Ltd"
    );
    expect(preview.rows[1]["VOUCHERNUMBER"]).toBe("REC-2026-004");

    const output = await tallyXmlToExcelEngine.convert(file);
    expect(output.filename).toBe("tally-sample.xlsx");
    const buf = await output.blob.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      wb.Sheets[wb.SheetNames[0]]
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]["VOUCHERNUMBER"]).toBe("CS-2026-INV01");
  });
});
