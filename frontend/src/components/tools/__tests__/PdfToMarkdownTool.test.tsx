import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PdfToMarkdownTool } from "../PdfToMarkdownTool";
import * as mediaEngineClient from "@/lib/media-engine-client";

describe("PdfToMarkdownTool", () => {
  it("renders upload dropzone and extraction controls", () => {
    render(<PdfToMarkdownTool />);
    expect(screen.getByText(/Upload Document or Scanned File/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-Adaptive/i)).toBeInTheDocument();
    expect(screen.getByText(/Fast Stream/i)).toBeInTheDocument();
    expect(screen.getByText(/Deep Scan OCR/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Extract Clean Markdown/i })).toBeDisabled();
  });

  it("extracts markdown and renders the formatted document preview", async () => {
    const mockMarkdown = `## Page 1

Financial Summary

| Quarter | Revenue | Profit |
| :--- | :---: | ---: |
| Q1 | $100K | $25K |
| Q2 | $150K | $40K |
`;

    vi.spyOn(mediaEngineClient, "dispatchMediaJob").mockResolvedValue({
      markdown: mockMarkdown,
      page_count: 1,
      table_count: 1,
      duration_seconds: 1.25,
    } as any);

    render(<PdfToMarkdownTool />);

    const file = new File(["dummy content"], "bank-statement.pdf", {
      type: "application/pdf",
    });

    const fileInput = screen.getByLabelText(/upload file input/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    const extractBtn = screen.getByRole("button", { name: /Extract Clean Markdown/i });
    expect(extractBtn).not.toBeDisabled();

    fireEvent.click(extractBtn);

    await waitFor(() => {
      expect(screen.getByText(/Extraction Complete/i)).toBeInTheDocument();
    });

    // Verify preview renders table properly
    expect(screen.getByText("Quarter")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$100K")).toBeInTheDocument();
    expect(screen.getByText("Table #1")).toBeInTheDocument();

    // Verify raw tab switch
    const rawTab = screen.getByRole("button", { name: /raw \.md/i });
    fireEvent.click(rawTab);
    expect(screen.getByText(/\| Quarter \| Revenue \| Profit \|/)).toBeInTheDocument();
  });
});
