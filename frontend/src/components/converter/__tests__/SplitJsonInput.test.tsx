import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { SplitJsonInput } from "../SplitJsonInput";
import { ConverterCard } from "../ConverterCard";

describe("SplitJsonInput", () => {
  const jsonToNdjsonConfig = CONVERTER_REGISTRY["json-to-ndjson"];
  const jsonToSchemaConfig = CONVERTER_REGISTRY["json-to-schema"];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders textarea and file dropzone side-by-side", () => {
    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={() => {}} />);

    expect(screen.getByTestId("split-json-input")).toBeInTheDocument();
    expect(screen.getByLabelText(/Paste JSON data/i)).toBeInTheDocument();
    expect(screen.getByTestId("split-json-dropzone-area")).toBeInTheDocument();
    expect(screen.getByText(/Paste JSON Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Or upload your JSON file/i)).toBeInTheDocument();
    expect(screen.getByText(".json")).toBeInTheDocument();
  });

  it("shows 'Paste JSON Data' and file drop prompt", () => {
    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={() => {}} />);

    expect(screen.getByText("Paste JSON Data")).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop a JSON file here/i)).toBeInTheDocument();
  });

  it("'Load Sample JSON' button populates sample JSON array into textarea", () => {
    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste JSON data/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");

    const loadSampleBtn = screen.getByRole("button", { name: /Load Sample JSON/i });
    fireEvent.click(loadSampleBtn);

    expect(textarea.value.length).toBeGreaterThan(0);
    const parsed = JSON.parse(textarea.value);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]).toHaveProperty("id");
  });

  it("shows character counter and record count when valid JSON array is typed", () => {
    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste JSON data/i);
    const sampleArray = JSON.stringify([
      { id: 1, name: "Alice", role: "admin" },
      { id: 2, name: "Bob", role: "user" }
    ], null, 2);

    fireEvent.change(textarea, { target: { value: sampleArray } });

    expect(screen.getByText(/2 records detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Valid JSON/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${sampleArray.length}\\s*chars`, "i"))).toBeInTheDocument();
  });

  it("shows JSON syntax error notice if invalid JSON is typed", () => {
    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={() => {}} />);

    const textarea = screen.getByLabelText(/Paste JSON data/i);
    fireEvent.change(textarea, { target: { value: '{"id": 1, invalid_json' } });

    expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
    expect(screen.getByText(/Syntax error/i)).toBeInTheDocument();

    const parseBtn = screen.getByRole("button", { name: /Parse JSON & Preview/i });
    expect(parseBtn).toBeDisabled();
  });

  it("'Parse JSON & Preview' button calls onFileSelect with a synthetic File", async () => {
    const handleFileSelect = vi.fn();
    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={handleFileSelect} />);

    const textarea = screen.getByLabelText(/Paste JSON data/i);
    const validJson = JSON.stringify([{ id: "usr_1", name: "Eve" }]);

    fireEvent.change(textarea, { target: { value: validJson } });

    const parseBtn = screen.getByRole("button", { name: /Parse JSON & Preview/i });
    expect(parseBtn).not.toBeDisabled();
    fireEvent.click(parseBtn);

    expect(handleFileSelect).toHaveBeenCalledTimes(1);
    const fileArg = handleFileSelect.mock.calls[0][0] as File;
    expect(fileArg).toBeInstanceOf(File);
    expect(fileArg.name).toBe("input.json");
    expect(fileArg.type).toBe("application/json");

    const content = await fileArg.text();
    expect(content).toBe(validJson);
  });

  it("file drag-and-drop / file input triggers onFileSelect", () => {
    const handleFileSelect = vi.fn();
    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={handleFileSelect} />);

    const dropzone = screen.getByTestId("split-json-dropzone-area");
    const file = new File(['[{"test": true}]'], "data.json", { type: "application/json" });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(handleFileSelect).toHaveBeenCalledWith(file);
  });

  it("disabled state disables textarea and buttons when disabled is true", () => {
    const handleFileSelect = vi.fn();
    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={handleFileSelect} disabled={true} />);

    const textarea = screen.getByLabelText(/Paste JSON data/i);
    expect(textarea).toBeDisabled();

    const loadSampleBtn = screen.getByRole("button", { name: /Load Sample JSON/i });
    expect(loadSampleBtn).toBeDisabled();

    const parseBtn = screen.getByRole("button", { name: /Parse JSON & Preview/i });
    expect(parseBtn).toBeDisabled();
  });

  it("allows clearing JSON text after typing or loading sample", () => {
    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={() => {}} />);

    const loadSampleBtn = screen.getByRole("button", { name: /Load Sample JSON/i });
    fireEvent.click(loadSampleBtn);

    const textarea = screen.getByLabelText(/Paste JSON data/i) as HTMLTextAreaElement;
    expect(textarea.value.length).toBeGreaterThan(0);

    const clearBtn = screen.getByRole("button", { name: /Clear/i });
    fireEvent.click(clearBtn);

    expect(textarea.value).toBe("");
  });

  it("pastes from clipboard when 'Paste from Clipboard' button is clicked", async () => {
    const handleFileSelect = vi.fn();
    const clipJson = JSON.stringify([{ id: 101, name: "Clipboard User" }], null, 2);

    Object.assign(navigator, {
      clipboard: {
        readText: vi.fn().mockResolvedValue(clipJson),
      },
    });

    render(<SplitJsonInput config={jsonToNdjsonConfig} onFileSelect={handleFileSelect} />);

    const pasteBtn = screen.getByRole("button", { name: /Paste from Clipboard/i });
    fireEvent.click(pasteBtn);

    await waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
      expect(handleFileSelect).toHaveBeenCalledTimes(1);
    });

    const fileArg = handleFileSelect.mock.calls[0][0] as File;
    expect(fileArg.name).toBe("input.json");
    const content = await fileArg.text();
    expect(content).toBe(clipJson);
  });

  describe("Integration with ConverterCard", () => {
    it("renders SplitJsonInput when config.slug is 'json-to-ndjson' and no file is loaded", () => {
      render(<ConverterCard config={jsonToNdjsonConfig} />);

      expect(screen.getByTestId("split-json-input")).toBeInTheDocument();
      expect(screen.getByLabelText(/Paste JSON data/i)).toBeInTheDocument();
      expect(screen.getByTestId("split-json-dropzone-area")).toBeInTheDocument();
    });

    it("renders SplitJsonInput when config.slug is 'json-to-schema' and no file is loaded", () => {
      render(<ConverterCard config={jsonToSchemaConfig} />);

      expect(screen.getByTestId("split-json-input")).toBeInTheDocument();
      expect(screen.getByLabelText(/Paste JSON data/i)).toBeInTheDocument();
      expect(screen.getByTestId("split-json-dropzone-area")).toBeInTheDocument();
    });
  });
});
