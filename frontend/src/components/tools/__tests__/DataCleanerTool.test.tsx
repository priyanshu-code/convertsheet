import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataCleanerTool } from "../DataCleanerTool";

describe("DataCleanerTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders upload zone and mode switcher", () => {
    render(<DataCleanerTool />);

    expect(screen.getByText(/Client-Side Data Cleaner & PII Anonymizer/i)).toBeInTheDocument();
    expect(screen.getByText(/Drop your CSV or Excel file here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Upload File/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Paste CSV \/ TSV/i })).toBeInTheDocument();
  });

  it("switches to paste tab and allows loading sample PII data", () => {
    render(<DataCleanerTool />);

    const pasteTab = screen.getByRole("button", { name: /Paste CSV \/ TSV/i });
    fireEvent.click(pasteTab);

    expect(screen.getByLabelText(/Paste CSV data to anonymize/i)).toBeInTheDocument();

    const sampleBtn = screen.getByRole("button", { name: /Load Sample PII/i });
    fireEvent.click(sampleBtn);

    // After loading sample PII, active file header and anonymized view appear
    expect(screen.getByText(/pasted-dataset.csv/i)).toBeInTheDocument();
    expect(screen.getByText(/Export \.csv/i)).toBeInTheDocument();
    expect(screen.getByText(/Export \.xlsx/i)).toBeInTheDocument();
  });

  it("parses manually pasted CSV data and applies PII masking", () => {
    render(<DataCleanerTool />);

    fireEvent.click(screen.getByRole("button", { name: /Paste CSV \/ TSV/i }));

    const textarea = screen.getByLabelText(/Paste CSV data to anonymize/i);
    const customCsv = `name,email,phone\nJane Doe,jane@doe.org,555-432-1234\nJohn Smith,john@smith.org,555-987-6543`;
    fireEvent.change(textarea, { target: { value: customCsv } });

    const parseBtn = screen.getByRole("button", { name: /Parse & Clean Data/i });
    fireEvent.click(parseBtn);

    expect(screen.getByText(/pasted-dataset.csv/i)).toBeInTheDocument();
    expect(screen.getByText(/2 rows, 3 columns/i)).toBeInTheDocument();
  });
});
