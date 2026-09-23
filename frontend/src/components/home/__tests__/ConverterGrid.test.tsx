import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConverterGrid } from "../ConverterGrid";
import { CONVERTER_REGISTRY } from "@/lib/registry";

describe("ConverterGrid Component", () => {
  const allConverters = Object.values(CONVERTER_REGISTRY);

  it("renders all category tabs with proper counts", () => {
    render(<ConverterGrid converters={allConverters} />);

    expect(screen.getByRole("button", { name: /All Converters/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Spreadsheets & Docs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Data Engineering/i })).toBeInTheDocument();

    expect(screen.getByText("(21)")).toBeInTheDocument();
    expect(screen.getByText("(9)")).toBeInTheDocument();
    expect(screen.getByText("(12)")).toBeInTheDocument();
  });

  it("shows all 21 converters by default", () => {
    render(<ConverterGrid converters={allConverters} />);

    expect(screen.getByText("JSON to Excel")).toBeInTheDocument();
    expect(screen.getByText("Parquet to Excel")).toBeInTheDocument();
    expect(screen.getByText("JSONL to CSV")).toBeInTheDocument();
    expect(screen.getByText("SQLite to Excel")).toBeInTheDocument();
  });

  it("filters to spreadsheets when Spreadsheets tab is clicked", () => {
    render(<ConverterGrid converters={allConverters} />);

    const spreadsheetsTab = screen.getByRole("button", { name: /Spreadsheets & Docs/i });
    fireEvent.click(spreadsheetsTab);

    // Spreadsheets present
    expect(screen.getByText("JSON to Excel")).toBeInTheDocument();
    expect(screen.getByText("CSV to Excel")).toBeInTheDocument();
    expect(screen.getByText("Excel to CSV")).toBeInTheDocument();

    // Data engineering filtered out
    expect(screen.queryByText("Parquet to Excel")).not.toBeInTheDocument();
    expect(screen.queryByText("JSONL to Excel")).not.toBeInTheDocument();
  });

  it("filters to data engineering when Data Engineering tab is clicked", () => {
    render(<ConverterGrid converters={allConverters} />);

    const dataEngTab = screen.getByRole("button", { name: /Data Engineering/i });
    fireEvent.click(dataEngTab);

    // Data engineering present
    expect(screen.getByText("Parquet to Excel")).toBeInTheDocument();
    expect(screen.getByText("Parquet to CSV")).toBeInTheDocument();
    expect(screen.getByText("CSV to Parquet")).toBeInTheDocument();
    expect(screen.getByText("JSONL to Excel")).toBeInTheDocument();

    // Spreadsheets filtered out
    expect(screen.queryByText("JSON to Excel")).not.toBeInTheDocument();
    expect(screen.queryByText("XML to Excel")).not.toBeInTheDocument();
  });
});
