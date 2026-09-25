import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { SplitCsvInput } from "../SplitCsvInput";
import { ConverterCard } from "../ConverterCard";

describe("SplitCsvInput", () => {
  const csvToExcelConfig = CONVERTER_REGISTRY["csv-to-excel"];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders textarea and file dropzone side-by-side", () => {
    render(<SplitCsvInput config={csvToExcelConfig} onFileSelect={() => {}} />);

    expect(screen.getByTestId("split-csv-input")).toBeInTheDocument();
    expect(screen.getByLabelText(/Paste CSV data/i)).toBeInTheDocument();
    expect(screen.getByTestId("split-csv-dropzone-area")).toBeInTheDocument();
    expect(screen.getByText(/Paste CSV Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Or upload your CSV file/i)).toBeInTheDocument();
    expect(screen.getByText(".csv")).toBeInTheDocument();
  });

  it("'Load Sample CSV' populates sample CSV into textarea", () => {
    render(<SplitCsvInput config={csvToExcelConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste CSV data/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");

    const loadSampleBtn = screen.getByRole("button", { name: /Load Sample CSV/i });
    fireEvent.click(loadSampleBtn);

    expect(textarea.value.length).toBeGreaterThan(0);
    expect(textarea.value).toContain("id,name,email");
  });

  it("shows row count when valid CSV is typed", () => {
    render(<SplitCsvInput config={csvToExcelConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste CSV data/i);
    const sample = `col1,col2\nval1,val2\nval3,val4`;
    fireEvent.change(textarea, { target: { value: sample } });

    expect(screen.getAllByText(/3 rows detected/i).length).toBeGreaterThanOrEqual(1);
  });

  it("Clear button empties textarea", () => {
    render(<SplitCsvInput config={csvToExcelConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste CSV data/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "a,b\n1,2" } });
    expect(textarea.value).toBe("a,b\n1,2");

    const clearBtn = screen.getByRole("button", { name: /Clear/i });
    fireEvent.click(clearBtn);

    expect(textarea.value).toBe("");
  });

  it("'Parse CSV & Preview' button calls onFileSelect with a synthetic File", () => {
    const handleFileSelect = vi.fn();
    render(<SplitCsvInput config={csvToExcelConfig} onFileSelect={handleFileSelect} />);

    const textarea = screen.getByLabelText(/Paste CSV data/i);
    fireEvent.change(textarea, { target: { value: "colA,colB\n1,2" } });

    const parseBtn = screen.getByRole("button", { name: /Parse CSV & Preview/i });
    fireEvent.click(parseBtn);

    expect(handleFileSelect).toHaveBeenCalledTimes(1);
    const passedFile = handleFileSelect.mock.calls[0][0] as File;
    expect(passedFile).toBeInstanceOf(File);
    expect(passedFile.name).toContain(".csv");
  });

  it("ConverterCard renders SplitCsvInput for CSV converters", () => {
    render(<ConverterCard config={csvToExcelConfig} />);
    expect(screen.getByTestId("split-csv-input")).toBeInTheDocument();
  });
});
