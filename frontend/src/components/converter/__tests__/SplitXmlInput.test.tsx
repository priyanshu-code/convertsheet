import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { SplitXmlInput } from "../SplitXmlInput";
import { ConverterCard } from "../ConverterCard";

describe("SplitXmlInput", () => {
  const xmlToExcelConfig = CONVERTER_REGISTRY["xml-to-excel"];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders textarea and file dropzone side-by-side", () => {
    render(<SplitXmlInput config={xmlToExcelConfig} onFileSelect={() => {}} />);

    expect(screen.getByTestId("split-xml-input")).toBeInTheDocument();
    expect(screen.getByLabelText(/Paste XML data/i)).toBeInTheDocument();
    expect(screen.getByTestId("split-xml-dropzone-area")).toBeInTheDocument();
    expect(screen.getByText(/Paste XML Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Or upload your XML file/i)).toBeInTheDocument();
    expect(screen.getByText(".xml")).toBeInTheDocument();
  });

  it("'Load Sample XML' populates sample XML into textarea", () => {
    render(<SplitXmlInput config={xmlToExcelConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste XML data/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");

    const loadSampleBtn = screen.getByRole("button", { name: /Load Sample XML/i });
    fireEvent.click(loadSampleBtn);

    expect(textarea.value.length).toBeGreaterThan(0);
    expect(textarea.value).toContain("<records>");
  });

  it("Clear button empties textarea", () => {
    render(<SplitXmlInput config={xmlToExcelConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste XML data/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "<root><item/></root>" } });
    expect(textarea.value).toBe("<root><item/></root>");

    const clearBtn = screen.getByRole("button", { name: /Clear/i });
    fireEvent.click(clearBtn);

    expect(textarea.value).toBe("");
  });

  it("'Parse XML & Preview' button calls onFileSelect with a synthetic File", () => {
    const handleFileSelect = vi.fn();
    render(<SplitXmlInput config={xmlToExcelConfig} onFileSelect={handleFileSelect} />);

    const textarea = screen.getByLabelText(/Paste XML data/i);
    fireEvent.change(textarea, { target: { value: "<root><item>Hello</item></root>" } });

    const parseBtn = screen.getByRole("button", { name: /Parse XML & Preview/i });
    fireEvent.click(parseBtn);

    expect(handleFileSelect).toHaveBeenCalledTimes(1);
    const passedFile = handleFileSelect.mock.calls[0][0] as File;
    expect(passedFile).toBeInstanceOf(File);
    expect(passedFile.name).toContain(".xml");
  });

  it("ConverterCard renders SplitXmlInput for XML converters", () => {
    render(<ConverterCard config={xmlToExcelConfig} />);
    expect(screen.getByTestId("split-xml-input")).toBeInTheDocument();
  });
});
