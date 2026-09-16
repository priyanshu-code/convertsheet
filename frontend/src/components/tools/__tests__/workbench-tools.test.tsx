import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SqlStudioTool } from "../SqlStudioTool";
import { SheetDiffTool } from "../SheetDiffTool";
import { DataCleanerTool } from "../DataCleanerTool";

describe("Phase 2: In-Browser SQL & Data Workbench Tools", () => {
  describe("SqlStudioTool", () => {
    it("renders SQL studio drop zone with DuckDB-Wasm badge", () => {
      render(<SqlStudioTool />);

      expect(
        screen.getByText(/In-Browser SQL Query Studio \(DuckDB-Wasm\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Drop CSV, Parquet, Excel, or JSON to query with SQL/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/DuckDB-Wasm Engine/i)).toBeInTheDocument();
    });
  });

  describe("SheetDiffTool", () => {
    it("renders dual drop zones for File A and File B", () => {
      render(<SheetDiffTool />);

      expect(
        screen.getByText(/Spreadsheet & File Diff Checker/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/File A \(Original Version\)/i)).toBeInTheDocument();
      expect(screen.getByText(/File B \(Modified Version\)/i)).toBeInTheDocument();
      expect(screen.getByText(/SheetJS Diff Engine/i)).toBeInTheDocument();
    });
  });

  describe("DataCleanerTool", () => {
    it("renders client-side PII cleaner with air-gapped privacy badge", () => {
      render(<DataCleanerTool />);

      expect(
        screen.getByText(/Client-Side Data Cleaner & PII Anonymizer/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Drop your CSV or Excel file here, or click to browse/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Air-Gapped Privacy/i)).toBeInTheDocument();
    });
  });
});
