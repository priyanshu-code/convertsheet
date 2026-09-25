import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConverterGrid } from "../ConverterGrid";
import { CONVERTER_REGISTRY } from "@/lib/registry";

describe("ConverterGrid Component", () => {
  const allConverters = Object.values(CONVERTER_REGISTRY);

  it("renders all category tabs with proper counts", () => {
    render(<ConverterGrid converters={allConverters} initialLimit={6} />);

    expect(screen.getByRole("button", { name: /All Converters/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Spreadsheets/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /DuckDB/i })).toBeInTheDocument();

    expect(screen.getByText("(21)")).toBeInTheDocument();
    expect(screen.getByText("(9)")).toBeInTheDocument();
    expect(screen.getByText("(12)")).toBeInTheDocument();
  });

  it("shows initial 6 converters by default with Show All button, and expands on click", () => {
    render(<ConverterGrid converters={allConverters} initialLimit={6} />);

    // First items present
    expect(screen.getByText("JSON to Excel")).toBeInTheDocument();
    expect(screen.getByText("XML to Excel")).toBeInTheDocument();
    expect(screen.getByText("CSV to Excel")).toBeInTheDocument();

    // Items beyond limit are not visible yet
    expect(screen.queryByText("SQLite to Excel")).not.toBeInTheDocument();

    // Show All button is visible
    const showAllBtn = screen.getByRole("button", { name: /Show All 21 Converters/i });
    expect(showAllBtn).toBeInTheDocument();

    // Click Show All
    fireEvent.click(showAllBtn);
    expect(screen.getByText("SQLite to Excel")).toBeInTheDocument();
    expect(screen.getByText("Parquet to Excel")).toBeInTheDocument();

    // Click Show Less
    const showLessBtn = screen.getByRole("button", { name: /Show Less/i });
    fireEvent.click(showLessBtn);
    expect(screen.queryByText("SQLite to Excel")).not.toBeInTheDocument();
  });

  it("filters converters with live search input", () => {
    render(<ConverterGrid converters={allConverters} initialLimit={6} />);

    const searchInput = screen.getByLabelText(/Filter converters/i);
    fireEvent.change(searchInput, { target: { value: "parquet" } });

    expect(screen.getByText("Parquet to Excel")).toBeInTheDocument();
    expect(screen.getByText("Parquet to CSV")).toBeInTheDocument();
    expect(screen.queryByText("XML to Excel")).not.toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByRole("button", { name: /Clear filter/i });
    fireEvent.click(clearBtn);
    expect(screen.getByText("XML to Excel")).toBeInTheDocument();
  });

  it("filters to spreadsheets when Spreadsheets tab is clicked", () => {
    render(<ConverterGrid converters={allConverters} initialLimit={6} />);

    const spreadsheetsTab = screen.getByRole("button", { name: /Spreadsheets/i });
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
    render(<ConverterGrid converters={allConverters} initialLimit={6} />);

    const dataEngTab = screen.getByRole("button", { name: /DuckDB/i });
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
