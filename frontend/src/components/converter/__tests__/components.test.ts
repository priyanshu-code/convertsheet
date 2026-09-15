import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { TabularData } from "@/types/converter";
import { DropZone } from "../DropZone";
import { DataPreviewTable } from "../DataPreviewTable";
import { FormatSelector } from "../FormatSelector";
import { ProUpgradeModal } from "../ProUpgradeModal";
import { ConverterCard } from "../ConverterCard";

describe("Converter Components", () => {
  const jsonConfig = CONVERTER_REGISTRY["json-to-excel"];
  const excelConfig = CONVERTER_REGISTRY["excel-to-json"];
  const csvConfig = CONVERTER_REGISTRY["csv-to-excel"];

  describe("DropZone", () => {
    it("renders upload prompt and source format", () => {
      const html = renderToStaticMarkup(
        React.createElement(DropZone, {
          config: jsonConfig,
          onFileSelect: () => {},
        })
      );

      expect(html).toContain("Drop your JSON file here or");
      expect(html).toContain("browse");
      expect(html).toContain(".json");
      expect(html).toContain("Processed locally in browser - never uploaded to any server");
      expect(html).toContain("Max 10MB for free in-browser conversion");
    });

    it("renders multiple accepted extension pills when config specifies additionalExtensions", () => {
      const html = renderToStaticMarkup(
        React.createElement(DropZone, {
          config: excelConfig,
          onFileSelect: () => {},
        })
      );

      expect(html).toContain(".xlsx");
      expect(html).toContain(".xls");
    });

    it("applies disabled attributes when disabled is true", () => {
      const html = renderToStaticMarkup(
        React.createElement(DropZone, {
          config: jsonConfig,
          onFileSelect: () => {},
          disabled: true,
        })
      );

      expect(html).toContain('aria-disabled="true"');
      expect(html).toContain("pointer-events-none");
    });
  });

  describe("DataPreviewTable", () => {
    const samplePreview: TabularData = {
      columns: ["id", "name", "isActive", "details", "score", "missing"],
      rows: [
        {
          id: 1,
          name: "Alice",
          isActive: true,
          details: { role: "Admin" },
          score: 95.5,
          missing: null,
        },
        {
          id: 2,
          name: "Bob",
          isActive: false,
          details: { role: "User" },
          score: 80,
          missing: undefined,
        },
      ],
      totalRows: 25,
    };

    it("renders table headers and row data correctly", () => {
      const html = renderToStaticMarkup(
        React.createElement(DataPreviewTable, {
          preview: samplePreview,
          maxDisplayRows: 10,
        })
      );

      // Header columns
      expect(html).toContain("id");
      expect(html).toContain("name");
      expect(html).toContain("isActive");
      expect(html).toContain("details");
      expect(html).toContain("score");

      // Cell data
      expect(html).toContain("Alice");
      expect(html).toContain("Bob");
      expect(html).toContain("true");
      expect(html).toContain("false");
      expect(html).toContain("{&quot;role&quot;:&quot;Admin&quot;}");
      expect(html).toContain("95.5");
      expect(html).toContain("null");

      // Row count badge
      expect(html).toContain("Showing preview of first 2 rows (25 total rows detected)");
    });

    it("renders all rows message when totalRows matches row count", () => {
      const smallPreview: TabularData = {
        columns: ["title"],
        rows: [{ title: "Item 1" }, { title: "Item 2" }],
        totalRows: 2,
      };

      const html = renderToStaticMarkup(
        React.createElement(DataPreviewTable, {
          preview: smallPreview,
        })
      );

      expect(html).toContain("Showing preview of all 2 rows");
    });

    it("renders empty state message when rows array is empty", () => {
      const emptyPreview: TabularData = {
        columns: ["col1", "col2"],
        rows: [],
        totalRows: 0,
      };

      const html = renderToStaticMarkup(
        React.createElement(DataPreviewTable, {
          preview: emptyPreview,
        })
      );

      expect(html).toContain("No preview rows available.");
    });
  });

  describe("FormatSelector", () => {
    it("renders source and target format badges and options trigger", () => {
      const html = renderToStaticMarkup(
        React.createElement(FormatSelector, {
          config: jsonConfig,
          options: { sheetName: "Sheet1", delimiter: ",", prettify: true },
          onOptionsChange: () => {},
        })
      );

      expect(html).toContain("JSON");
      expect(html).toContain(".json");
      expect(html).toContain("Excel");
      expect(html).toContain(".xlsx");
      expect(html).toContain("Conversion Options");
    });
  });

  describe("ProUpgradeModal", () => {
    it("returns null when isOpen is false", () => {
      const html = renderToStaticMarkup(
        React.createElement(ProUpgradeModal, {
          isOpen: false,
          onClose: () => {},
        })
      );

      expect(html).toBe("");
    });

    it("renders modal dialog, reason, feature list, and pricing CTA when isOpen is true", () => {
      const customReason = "File exceeds 10MB limit for free tier.";
      const html = renderToStaticMarkup(
        React.createElement(ProUpgradeModal, {
          isOpen: true,
          onClose: () => {},
          reason: customReason,
        })
      );

      expect(html).toContain("ConvertSheet Pro Required");
      expect(html).toContain("Upgrade to Pro for Heavy Files");
      expect(html).toContain(customReason);

      // Features
      expect(html).toContain("Up to 100GB Files");
      expect(html).toContain("Batch Conversion");
      expect(html).toContain("15-Min Auto File Wipe");
      expect(html).toContain("Developer REST API &amp; CLI");

      // CTA
      expect(html).toContain("View Pro Plans ($9.99/mo)");
      expect(html).toContain('href="/pricing"');
    });
  });

  describe("ConverterCard", () => {
    it("renders DropZone and FormatSelector initially when no file is chosen", () => {
      const html = renderToStaticMarkup(
        React.createElement(ConverterCard, {
          config: csvConfig,
        })
      );

      expect(html).toContain("CSV");
      expect(html).toContain(".csv");
      expect(html).toContain("Drop your CSV file here or");
      expect(html).toContain("browse");
    });
  });
});
