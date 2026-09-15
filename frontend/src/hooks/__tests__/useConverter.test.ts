import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConverter, MAX_FREE_FILE_SIZE_BYTES } from "../useConverter";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { IConverterEngine, TabularData, ConversionOutput } from "@/types/converter";

describe("useConverter hook", () => {
  const jsonConfig = CONVERTER_REGISTRY["json-to-excel"];
  const pdfConfig = CONVERTER_REGISTRY["pdf-to-excel"];

  it("initializes with default state", () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(result.current.isParsing).toBe(false);
    expect(result.current.isConverting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.showProModal).toBe(false);
    expect(result.current.proModalReason).toBe("");
    expect(result.current.options.sheetName).toBe("Sheet1");
    expect(result.current.options.delimiter).toBe(",");
  });

  it("rejects unsupported file extension and sets error", async () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    const invalidFile = new File(["test content"], "document.txt", {
      type: "text/plain",
    });

    await act(async () => {
      await result.current.setFile(invalidFile);
    });

    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(result.current.error).toContain("Unsupported file format");
    expect(result.current.showProModal).toBe(false);
  });

  it("triggers Pro modal gating when file exceeds 10MB limit", async () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    const largeFile = new File(["dummy"], "huge_dataset.json", {
      type: "application/json",
    });
    Object.defineProperty(largeFile, "size", {
      value: MAX_FREE_FILE_SIZE_BYTES + 1024,
    });

    await act(async () => {
      await result.current.setFile(largeFile);
    });

    expect(result.current.file).toBe(largeFile);
    expect(result.current.preview).toBeNull();
    expect(result.current.showProModal).toBe(true);
    expect(result.current.proModalReason).toContain("10MB limit");
  });

  it("triggers Pro modal gating when conversion is not client-side (e.g. pdf-to-excel)", async () => {
    const { result } = renderHook(() => useConverter(pdfConfig));

    const pdfFile = new File(["%PDF-1.4 mock content"], "statement.pdf", {
      type: "application/pdf",
    });

    await act(async () => {
      await result.current.setFile(pdfFile);
    });

    expect(result.current.file).toBe(pdfFile);
    expect(result.current.preview).toBeNull();
    expect(result.current.showProModal).toBe(true);
    expect(result.current.proModalReason).toContain("ConvertSheet Pro");
  });

  it("parses preview successfully for valid client-side file", async () => {
    const mockPreviewData: TabularData = {
      columns: ["id", "name"],
      rows: [{ id: 1, name: "Alice" }],
      totalRows: 1,
    };

    const mockEngine: IConverterEngine = {
      parsePreview: vi.fn().mockResolvedValue(mockPreviewData),
      convert: vi.fn().mockResolvedValue({
        blob: new Blob(["dummy"]),
        filename: "users.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    };

    const { result } = renderHook(() =>
      useConverter(jsonConfig, { engine: mockEngine })
    );

    const jsonFile = new File([JSON.stringify([{ id: 1, name: "Alice" }])], "users.json", {
      type: "application/json",
    });

    await act(async () => {
      await result.current.setFile(jsonFile);
    });

    expect(result.current.file).toBe(jsonFile);
    expect(result.current.preview).toEqual(mockPreviewData);
    expect(result.current.error).toBeNull();
    expect(result.current.isParsing).toBe(false);
    expect(mockEngine.parsePreview).toHaveBeenCalledWith(jsonFile, 10);
  });

  it("handles preview parsing failure gracefully", async () => {
    const mockEngine: IConverterEngine = {
      parsePreview: vi.fn().mockRejectedValue(new Error("Corrupted JSON structure")),
      convert: vi.fn(),
    };

    const { result } = renderHook(() =>
      useConverter(jsonConfig, { engine: mockEngine })
    );

    const brokenFile = new File(["{ bad json"], "broken.json", {
      type: "application/json",
    });

    await act(async () => {
      await result.current.setFile(brokenFile);
    });

    expect(result.current.preview).toBeNull();
    expect(result.current.error).toBe("Corrupted JSON structure");
    expect(result.current.isParsing).toBe(false);
  });

  it("converts file and handles download successfully", async () => {
    const mockOutput: ConversionOutput = {
      blob: new Blob(["xlsx-data"]),
      filename: "data.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    const mockEngine: IConverterEngine = {
      parsePreview: vi.fn().mockResolvedValue({ columns: ["col"], rows: [], totalRows: 0 }),
      convert: vi.fn().mockResolvedValue(mockOutput),
    };

    const { result } = renderHook(() =>
      useConverter(jsonConfig, { engine: mockEngine })
    );

    const file = new File(["[{}]"], "data.json", { type: "application/json" });
    await act(async () => {
      await result.current.setFile(file);
    });

    let success = false;
    await act(async () => {
      success = await result.current.convert();
    });

    expect(success).toBe(true);
    expect(mockEngine.convert).toHaveBeenCalledWith(file, expect.objectContaining({ sheetName: "Sheet1" }));
    expect(result.current.isConverting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("aborts convert() if no file is selected", async () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    let success = true;
    await act(async () => {
      success = await result.current.convert();
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Please select a file to convert.");
  });

  it("aborts convert() and triggers Pro modal if file size exceeds 10MB limit", async () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    const largeFile = new File(["dummy"], "large.json", { type: "application/json" });
    Object.defineProperty(largeFile, "size", { value: MAX_FREE_FILE_SIZE_BYTES + 500 });

    await act(async () => {
      await result.current.setFile(largeFile);
    });

    act(() => {
      result.current.setShowProModal(false);
    });

    let success = true;
    await act(async () => {
      success = await result.current.convert();
    });

    expect(success).toBe(false);
    expect(result.current.showProModal).toBe(true);
  });

  it("resets all state when reset() is called", async () => {
    const mockEngine: IConverterEngine = {
      parsePreview: vi.fn().mockResolvedValue({ columns: ["a"], rows: [{ a: 1 }], totalRows: 1 }),
      convert: vi.fn(),
    };

    const { result } = renderHook(() =>
      useConverter(jsonConfig, { engine: mockEngine })
    );

    const file = new File(["[{ \"a\": 1 }]"], "test.json", { type: "application/json" });
    await act(async () => {
      await result.current.setFile(file);
    });

    expect(result.current.file).not.toBeNull();
    expect(result.current.preview).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isParsing).toBe(false);
    expect(result.current.isConverting).toBe(false);
    expect(result.current.showProModal).toBe(false);
  });

  it("updates options via updateOptions() and setOptions()", () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    act(() => {
      result.current.updateOptions({ sheetName: "CustomSheet", delimiter: ";" });
    });
    expect(result.current.options.sheetName).toBe("CustomSheet");
    expect(result.current.options.delimiter).toBe(";");
    expect(result.current.options.prettify).toBe(true);

    act(() => {
      result.current.setOptions((prev) => ({ ...prev, prettify: false }));
    });
    expect(result.current.options.prettify).toBe(false);
  });

  it("handles null passed to setFile()", async () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    const file = new File(["{}"], "file.json", { type: "application/json" });
    await act(async () => {
      await result.current.setFile(file);
    });
    expect(result.current.file).toBe(file);

    await act(async () => {
      await result.current.setFile(null);
    });
    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
  });

  it("guards against race conditions when a superseded parse resolves later", async () => {
    let resolveFirstParse!: (data: TabularData) => void;
    const firstPromise = new Promise<TabularData>((resolve) => {
      resolveFirstParse = resolve;
    });

    const secondData: TabularData = {
      columns: ["colB"],
      rows: [{ colB: "second" }],
      totalRows: 1,
    };

    const mockEngine: IConverterEngine = {
      parsePreview: vi
        .fn()
        .mockImplementationOnce(() => firstPromise)
        .mockImplementationOnce(() => Promise.resolve(secondData)),
      convert: vi.fn(),
    };

    const { result } = renderHook(() =>
      useConverter(jsonConfig, { engine: mockEngine })
    );

    const file1 = new File(["{}"], "file1.json", { type: "application/json" });
    const file2 = new File(["{}"], "file2.json", { type: "application/json" });

    // Start parsing file1 (slow)
    let p1: Promise<void>;
    act(() => {
      p1 = result.current.setFile(file1);
    });

    // Start parsing file2 (fast) - supersedes file1
    await act(async () => {
      await result.current.setFile(file2);
    });

    expect(result.current.preview).toEqual(secondData);

    // Now resolve first parse (out of order)
    await act(async () => {
      resolveFirstParse({
        columns: ["colA"],
        rows: [{ colA: "first" }],
        totalRows: 1,
      });
      await p1;
    });

    // Preview should NOT be overwritten by file1
    expect(result.current.preview).toEqual(secondData);
  });

  it("guards against race condition when reset() is called during in-flight parse", async () => {
    let resolveParse!: (data: TabularData) => void;
    const slowPromise = new Promise<TabularData>((resolve) => {
      resolveParse = resolve;
    });

    const mockEngine: IConverterEngine = {
      parsePreview: vi.fn().mockImplementation(() => slowPromise),
      convert: vi.fn(),
    };

    const { result } = renderHook(() =>
      useConverter(jsonConfig, { engine: mockEngine })
    );

    const file = new File(["{}"], "file.json", { type: "application/json" });

    let p: Promise<void>;
    act(() => {
      p = result.current.setFile(file);
    });

    expect(result.current.isParsing).toBe(true);

    // User clicks reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();

    // The slow parse finishes later
    await act(async () => {
      resolveParse({
        columns: ["col"],
        rows: [{ col: 1 }],
        totalRows: 1,
      });
      await p;
    });

    // State should remain null and not be resurrected
    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
  });
});
