import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HomeCommandHero } from "../HomeCommandHero";
import { CONVERTER_REGISTRY } from "@/lib/registry";

vi.mock("@/components/converter/ConverterCard", () => ({
  ConverterCard: ({ config }: { config: any }) => (
    <div data-testid="mock-converter-card">
      <span>Active Converter: {config?.title || "None"}</span>
      <span>Source: {config?.sourceFormat}</span>
      <span>Target: {config?.targetFormat}</span>
    </div>
  ),
}));

vi.mock("../HomeCalculatorSpotlight", () => ({
  HomeCalculatorSpotlight: () => (
    <div data-testid="mock-calculator-spotlight">
      <span>Calculator Spotlight Active</span>
    </div>
  ),
}));

describe("HomeCommandHero", () => {
  it("defaults to converter mode and allows switching to calculator mode and back", async () => {
    render(<HomeCommandHero defaultConverter={CONVERTER_REGISTRY["json-to-excel"]} />);

    // Check mode buttons
    const converterBtn = screen.getByRole("button", { name: /Universal File Converter/i });
    const calculatorBtn = screen.getByRole("button", { name: /Financial & Dev Calculators/i });

    expect(converterBtn).toBeInTheDocument();
    expect(calculatorBtn).toBeInTheDocument();

    // Default is converter mode
    expect(await screen.findByTestId("mock-converter-card")).toBeInTheDocument();
    expect(screen.getByText(/Source: JSON/i)).toBeInTheDocument();
    expect(screen.getByText(/Target: Excel/i)).toBeInTheDocument();
    expect(screen.queryByTestId("mock-calculator-spotlight")).not.toBeInTheDocument();

    // Click calculator button
    fireEvent.click(calculatorBtn);
    expect(screen.getByTestId("mock-calculator-spotlight")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-converter-card")).not.toBeInTheDocument();

    // Click back to converter button
    fireEvent.click(converterBtn);
    expect(await screen.findByTestId("mock-converter-card")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-calculator-spotlight")).not.toBeInTheDocument();
  });

  it("updates active converter when quick format pills are clicked", () => {
    render(<HomeCommandHero defaultConverter={CONVERTER_REGISTRY["json-to-excel"]} />);

    // Click CSV to Excel pill
    const csvPill = screen.getByRole("button", { name: /CSV to Excel/i });
    fireEvent.click(csvPill);
    expect(screen.getByText(/Source: CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/Target: Excel/i)).toBeInTheDocument();

    // Click Parquet to CSV pill
    const parquetPill = screen.getByRole("button", { name: /Parquet to CSV/i });
    fireEvent.click(parquetPill);
    expect(screen.getByText(/Source: Parquet/i)).toBeInTheDocument();
    expect(screen.getByText(/Target: CSV/i)).toBeInTheDocument();
  });

  it("switches from calculator mode back to converter mode when a format pill is clicked", () => {
    render(<HomeCommandHero defaultConverter={CONVERTER_REGISTRY["json-to-excel"]} />);

    // Switch to calculator
    const calculatorBtn = screen.getByRole("button", { name: /Financial & Dev Calculators/i });
    fireEvent.click(calculatorBtn);
    expect(screen.getByTestId("mock-calculator-spotlight")).toBeInTheDocument();

    // Click format pill
    const xmlPill = screen.getByRole("button", { name: /XML to Excel/i });
    fireEvent.click(xmlPill);

    // Should switch back to converter mode with XML to Excel
    expect(screen.getByTestId("mock-converter-card")).toBeInTheDocument();
    expect(screen.getByText(/Source: XML/i)).toBeInTheDocument();
    expect(screen.getByText(/Target: Excel/i)).toBeInTheDocument();
    expect(screen.queryByTestId("mock-calculator-spotlight")).not.toBeInTheDocument();
  });

  it("filters tools and converters when query is typed into the search bar", () => {
    render(<HomeCommandHero />);

    const searchInput = screen.getByPlaceholderText(/Search 100\+ converters/i);
    expect(searchInput).toBeInTheDocument();

    // Type query
    fireEvent.change(searchInput, { target: { value: "mortgage" } });

    // Should display search results matching mortgage
    expect(screen.getByText(/Mortgage Calculator/i)).toBeInTheDocument();

    // Clear search with X button
    const clearBtn = screen.getByLabelText(/Clear search/i);
    fireEvent.click(clearBtn);
    expect(searchInput).toHaveValue("");
    expect(screen.queryByText(/Mortgage Calculator/i)).not.toBeInTheDocument();
  });

  it("selects converter when a converter search result is clicked", () => {
    render(<HomeCommandHero />);

    const searchInput = screen.getByPlaceholderText(/Search 100\+ converters/i);
    fireEvent.change(searchInput, { target: { value: "parquet" } });

    const parquetLink = screen.getByRole("link", { name: /Parquet to CSV/i });
    fireEvent.click(parquetLink);

    expect(screen.getByText(/Source: Parquet/i)).toBeInTheDocument();
    expect(screen.getByText(/Target: CSV/i)).toBeInTheDocument();
    expect(searchInput).toHaveValue("");
  });
});
