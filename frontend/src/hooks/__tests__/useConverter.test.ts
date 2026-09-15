import { describe, it, expect, vi } from "vitest";
import React from "react";
import { useConverter, MAX_FREE_FILE_SIZE_BYTES } from "../useConverter";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { IConverterEngine, TabularData, ConversionOutput } from "@/types/converter";

// Lightweight test hook runner for Node test environment
function renderHook<T>(renderCallback: () => T) {
  let hookIndex = 0;
  const stateStore: any[] = [];
  const result: { current: T } = { current: undefined as any };

  const dispatcher = (React as any)
    .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;

  const testDispatcher = {
    useState(initialState: any) {
      const idx = hookIndex++;
      if (stateStore[idx] === undefined) {
        stateStore[idx] =
          typeof initialState === "function" ? initialState() : initialState;
      }
      const setState = (action: any) => {
        stateStore[idx] =
          typeof action === "function" ? action(stateStore[idx]) : action;
        rerun();
      };
      return [stateStore[idx], setState];
    },
    useRef(initialValue: any) {
      const idx = hookIndex++;
      if (stateStore[idx] === undefined) {
        stateStore[idx] = { current: initialValue };
      }
      return stateStore[idx];
    },
    useCallback(fn: any) {
      return fn;
    },
    useEffect() {},
    useMemo(fn: any) {
      return fn();
    },
  };

  function rerun() {
    hookIndex = 0;
    const prevDispatcher = dispatcher.current;
    dispatcher.current = testDispatcher;
    try {
      result.current = renderCallback();
    } finally {
      dispatcher.current = prevDispatcher;
    }
  }

  rerun();
  return { result, rerun };
}

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

    await result.current.setFile(invalidFile);

    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(result.current.error).toContain("Unsupported file format");
    expect(result.current.showProModal).toBe(false);
  });

  it("triggers Pro modal gating when file exceeds 10MB limit", async () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    // Create a mock file larger than 10MB
    const largeFile = new File(["dummy"], "huge_dataset.json", {
      type: "application/json",
    });
    Object.defineProperty(largeFile, "size", {
      value: MAX_FREE_FILE_SIZE_BYTES + 1024,
    });

    await result.current.setFile(largeFile);

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

    await result.current.setFile(pdfFile);

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

    await result.current.setFile(jsonFile);

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

    await result.current.setFile(brokenFile);

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
    await result.current.setFile(file);

    const success = await result.current.convert();
    expect(success).toBe(true);
    expect(mockEngine.convert).toHaveBeenCalledWith(file, expect.objectContaining({ sheetName: "Sheet1" }));
    expect(result.current.isConverting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("aborts convert() if no file is selected", async () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    const success = await result.current.convert();
    expect(success).toBe(false);
    expect(result.current.error).toBe("Please select a file to convert.");
  });

  it("aborts convert() and triggers Pro modal if file size exceeds 10MB limit", async () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    const largeFile = new File(["dummy"], "large.json", { type: "application/json" });
    Object.defineProperty(largeFile, "size", { value: MAX_FREE_FILE_SIZE_BYTES + 500 });

    await result.current.setFile(largeFile);
    result.current.setShowProModal(false);

    const success = await result.current.convert();
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
    await result.current.setFile(file);

    expect(result.current.file).not.toBeNull();
    expect(result.current.preview).not.toBeNull();

    result.current.reset();

    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isParsing).toBe(false);
    expect(result.current.isConverting).toBe(false);
    expect(result.current.showProModal).toBe(false);
  });

  it("updates options via updateOptions() and setOptions()", () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    result.current.updateOptions({ sheetName: "CustomSheet", delimiter: ";" });
    expect(result.current.options.sheetName).toBe("CustomSheet");
    expect(result.current.options.delimiter).toBe(";");
    expect(result.current.options.prettify).toBe(true);

    result.current.setOptions((prev) => ({ ...prev, prettify: false }));
    expect(result.current.options.prettify).toBe(false);
  });

  it("handles null passed to setFile()", async () => {
    const { result } = renderHook(() => useConverter(jsonConfig));

    const file = new File(["{}"], "file.json", { type: "application/json" });
    await result.current.setFile(file);
    expect(result.current.file).toBe(file);

    await result.current.setFile(null);
    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
  });
});
