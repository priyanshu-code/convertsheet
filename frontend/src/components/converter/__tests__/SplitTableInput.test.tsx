import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { SplitTableInput } from "../SplitTableInput";
import { ConverterCard } from "../ConverterCard";

describe("SplitTableInput", () => {
  const markdownConfig = CONVERTER_REGISTRY["markdown-to-excel"];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders textarea and file dropzone side-by-side", () => {
    render(<SplitTableInput config={markdownConfig} onFileSelect={() => {}} />);

    expect(screen.getByTestId("split-table-input")).toBeInTheDocument();
    expect(screen.getByLabelText(/Paste table text/i)).toBeInTheDocument();
    expect(screen.getByTestId("split-dropzone-area")).toBeInTheDocument();
    expect(screen.getByText(/Paste Markdown or HTML Table/i)).toBeInTheDocument();
    expect(screen.getByText(/Or upload your file/i)).toBeInTheDocument();
    expect(screen.getByText(".md")).toBeInTheDocument();
  });

  it("'Load Sample Table' populates the textarea", () => {
    render(<SplitTableInput config={markdownConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste table text/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");

    const loadSampleBtn = screen.getByRole("button", { name: /Load Sample Table/i });
    fireEvent.click(loadSampleBtn);

    expect(textarea.value).toContain("| Product | Unit Price | Qty | Status |");
    expect(textarea.value).toContain("Widget Alpha");
    expect(textarea.value).toContain("Widget Beta");
  });

  it("typing/pasting table text and clicking 'Parse & Preview Table' triggers onFileSelect with a File object containing the text", async () => {
    const handleFileSelect = vi.fn();
    render(<SplitTableInput config={markdownConfig} onFileSelect={handleFileSelect} />);

    const textarea = screen.getByLabelText(/Paste table text/i);
    const sampleTable = "| Name | Role |\n| --- | --- |\n| Alice | Admin |";

    fireEvent.change(textarea, { target: { value: sampleTable } });

    const parseBtn = screen.getByRole("button", { name: /Parse & Preview Table/i });
    expect(parseBtn).not.toBeDisabled();
    fireEvent.click(parseBtn);

    expect(handleFileSelect).toHaveBeenCalledTimes(1);
    const fileArg = handleFileSelect.mock.calls[0][0] as File;
    expect(fileArg).toBeInstanceOf(File);
    expect(fileArg.name).toBe("pasted-table.md");
    expect(fileArg.type).toBe("text/markdown");

    const content = await fileArg.text();
    expect(content).toBe(sampleTable);
  });

  it("allows clearing text after typing or loading sample", () => {
    render(<SplitTableInput config={markdownConfig} onFileSelect={() => {}} />);

    const loadSampleBtn = screen.getByRole("button", { name: /Load Sample Table/i });
    fireEvent.click(loadSampleBtn);

    const textarea = screen.getByLabelText(/Paste table text/i) as HTMLTextAreaElement;
    expect(textarea.value.length).toBeGreaterThan(0);

    const clearBtn = screen.getByRole("button", { name: /Clear/i });
    fireEvent.click(clearBtn);

    expect(textarea.value).toBe("");
  });

  it("pastes from clipboard when 'Paste from Clipboard' button is clicked", async () => {
    const handleFileSelect = vi.fn();
    const clipText = "| ID | Name |\n| -- | -- |\n| 1 | Test |";

    Object.assign(navigator, {
      clipboard: {
        readText: vi.fn().mockResolvedValue(clipText),
      },
    });

    render(<SplitTableInput config={markdownConfig} onFileSelect={handleFileSelect} />);

    const pasteBtn = screen.getByRole("button", { name: /Paste from Clipboard/i });
    fireEvent.click(pasteBtn);

    await waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
      expect(handleFileSelect).toHaveBeenCalledTimes(1);
    });

    const fileArg = handleFileSelect.mock.calls[0][0] as File;
    expect(fileArg.name).toBe("pasted-table.md");
    const content = await fileArg.text();
    expect(content).toBe(clipText);
  });

  it("handles file drop in right dropzone panel", () => {
    const handleFileSelect = vi.fn();
    render(<SplitTableInput config={markdownConfig} onFileSelect={handleFileSelect} />);

    const dropzone = screen.getByTestId("split-dropzone-area");
    const file = new File(["# Markdown content"], "test.md", { type: "text/markdown" });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(handleFileSelect).toHaveBeenCalledWith(file);
  });

  it("disables textarea and buttons when disabled prop is true", () => {
    const handleFileSelect = vi.fn();
    render(<SplitTableInput config={markdownConfig} onFileSelect={handleFileSelect} disabled={true} />);

    const textarea = screen.getByLabelText(/Paste table text/i);
    expect(textarea).toBeDisabled();

    const loadSampleBtn = screen.getByRole("button", { name: /Load Sample Table/i });
    expect(loadSampleBtn).toBeDisabled();
  });

  it("formats and aligns markdown table pipes when 'Format' button is clicked", () => {
    render(<SplitTableInput config={markdownConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste table text/i) as HTMLTextAreaElement;
    const messyTable = "|Col A|Col B|\n|---|---|\n|1|Long Text Value|";
    fireEvent.change(textarea, { target: { value: messyTable } });

    const formatBtn = screen.getByRole("button", { name: /^Format$/i });
    fireEvent.click(formatBtn);

    expect(textarea.value).toContain(" | ");
    expect(textarea.value).toContain("Col A");
  });

  it("removes white space and blank lines when 'Remove white space' button is clicked", () => {
    render(<SplitTableInput config={markdownConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste table text/i) as HTMLTextAreaElement;
    const tableWithSpaces = "  | A | B |   \n\n\n  | 1 | 2 |  ";
    fireEvent.change(textarea, { target: { value: tableWithSpaces } });

    const removeWhitespaceBtn = screen.getByRole("button", { name: /Remove white space/i });
    fireEvent.click(removeWhitespaceBtn);

    expect(textarea.value).toBe("| A | B |\n| 1 | 2 |");
  });

  it("copies table text to clipboard when 'Copy' button is clicked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<SplitTableInput config={markdownConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste table text/i);
    fireEvent.change(textarea, { target: { value: "| Header |\n| --- |\n| Data |" } });

    const copyBtn = screen.getByRole("button", { name: /^Copy$/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("| Header |\n| --- |\n| Data |");
    expect(await screen.findByText(/Copied!/i)).toBeInTheDocument();
  });

  describe("Integration with ConverterCard", () => {
    it("renders SplitTableInput when config.slug is 'markdown-to-excel' and no file is loaded", () => {
      render(<ConverterCard config={markdownConfig} />);

      expect(screen.getByTestId("split-table-input")).toBeInTheDocument();
      expect(screen.getByLabelText(/Paste table text/i)).toBeInTheDocument();
      expect(screen.getByTestId("split-dropzone-area")).toBeInTheDocument();
    });

    it("renders standard DropZone when config.slug is not 'markdown-to-excel'", () => {
      const csvConfig = CONVERTER_REGISTRY["csv-to-excel"];
      render(<ConverterCard config={csvConfig} />);

      expect(screen.queryByTestId("split-table-input")).not.toBeInTheDocument();
      expect(screen.getByTestId("dropzone-area")).toBeInTheDocument();
    });
  });
});
