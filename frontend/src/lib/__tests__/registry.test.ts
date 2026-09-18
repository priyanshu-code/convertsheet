import { describe, it, expect, vi } from "vitest";
import {
  CONVERTER_REGISTRY,
  getAllConverterSlugs,
  getConverterBySlug,
  getFeaturedConverters,
  ALL_SUPPORTED_EXTENSIONS,
  type ConverterSlug,
} from "../registry";
import {
  formatBytes,
  getFileExtension,
  isExtensionSupported,
  sanitizeSheetName,
  cn,
  downloadBlob,
} from "../utils";

describe("Converter Registry & Utilities", () => {
  describe("getAllConverterSlugs", () => {
    it("returns all 19 registered converter slugs", () => {
      const slugs = getAllConverterSlugs();
      expect(slugs).toHaveLength(19);
      expect(slugs).toContain("parquet-to-excel");
      expect(slugs).toContain("parquet-to-csv");
      expect(slugs).toContain("parquet-to-json");
      expect(slugs).toContain("csv-to-parquet");
      expect(slugs).toContain("json-to-parquet");
      expect(slugs).toContain("jsonl-to-excel");
      expect(slugs).toContain("jsonl-to-csv");
      expect(slugs).toContain("csv-to-jsonl");
      expect(slugs).toContain("markdown-to-excel");
      expect(slugs).toContain("sqlite-to-excel");
      expect(slugs).toContain("json-to-ndjson");
      expect(slugs).toContain("json-to-schema");
    });
  });

  describe("CONVERTER_REGISTRY completeness and validity", () => {
    const slugs = getAllConverterSlugs();

    it.each(slugs)("registry entry for %s satisfies all schema constraints", (slug) => {
      const config = CONVERTER_REGISTRY[slug];
      expect(config).toBeDefined();

      // Slug must match dictionary key
      expect(config.slug).toBe(slug);

      // Source and target formats
      expect(config.sourceFormat).toBeTruthy();
      expect(config.targetFormat).toBeTruthy();

      // Extensions must start with dot and be non-empty
      expect(config.sourceExtension).toMatch(/^\.[a-z0-9]+$/);
      expect(config.targetExtension).toMatch(/^\.[a-z0-9]+(\.[a-z0-9]+)*$/);

      // If additionalExtensions are provided, each must start with dot and be non-empty
      if ("additionalExtensions" in config && config.additionalExtensions) {
        expect(Array.isArray(config.additionalExtensions)).toBe(true);
        expect(config.additionalExtensions.length).toBeGreaterThan(0);
        (config.additionalExtensions as readonly string[]).forEach((ext) => {
          expect(ext).toMatch(/^\.[a-z0-9]+$/);
        });
      }

      // Accepted MIME types must be non-empty
      expect(config.acceptedMimeTypes.length).toBeGreaterThan(0);
      config.acceptedMimeTypes.forEach((mime) => {
        expect(mime).toMatch(/^[a-z0-9.-]+\/[a-z0-9.+-]+$/);
      });

      // Title, Subtitle, MetaDescription must be non-empty strings
      expect(config.title.trim().length).toBeGreaterThan(10);
      expect(config.subtitle.trim().length).toBeGreaterThan(20);
      expect(config.metaDescription.trim().length).toBeGreaterThan(30);

      // isClientSide flag and engineId check
      expect(typeof config.isClientSide).toBe("boolean");
      if (config.isClientSide) {
        expect(config.engineId).toBeDefined();
      } else {
        expect(config.engineId).toBeUndefined();
      }

      // FAQs: At least 3 FAQs, each with non-empty question and answer
      expect(config.faqs.length).toBeGreaterThanOrEqual(3);
      config.faqs.forEach((faq) => {
        expect(faq.question.trim().length).toBeGreaterThan(5);
        expect(faq.answer.trim().length).toBeGreaterThan(15);
      });

      // HowTo steps: Exactly 3 steps in sequential order (1, 2, 3)
      expect(config.howTo).toHaveLength(3);
      config.howTo.forEach((step, index) => {
        expect(step.step).toBe(index + 1);
        expect(step.title.trim().length).toBeGreaterThan(3);
        expect(step.description.trim().length).toBeGreaterThan(10);
      });
    });

    it("supports .xls as an additionalExtension for excel-to-json and excel-to-csv", () => {
      const excelJson = CONVERTER_REGISTRY["excel-to-json"];
      expect(excelJson.additionalExtensions).toBeDefined();
      expect(excelJson.additionalExtensions).toContain(".xls");

      const excelCsv = CONVERTER_REGISTRY["excel-to-csv"];
      expect(excelCsv.additionalExtensions).toBeDefined();
      expect(excelCsv.additionalExtensions).toContain(".xls");
    });

    it("has pdf-to-excel configured as server-side (isClientSide: false, engineId: undefined)", () => {
      const pdfConfig = CONVERTER_REGISTRY["pdf-to-excel"];
      expect(pdfConfig.isClientSide).toBe(false);
      expect(pdfConfig.engineId).toBeUndefined();
    });

    it("has tally-xml-to-excel configured with tally engineId", () => {
      const tallyConfig = CONVERTER_REGISTRY["tally-xml-to-excel"];
      expect(tallyConfig.isClientSide).toBe(true);
      expect(tallyConfig.engineId).toBe("tally-xml-to-excel");
    });
  });

  describe("getConverterBySlug", () => {
    it("returns the converter config for valid slug", () => {
      const config = getConverterBySlug("json-to-excel");
      expect(config).toBeDefined();
      expect(config?.slug).toBe("json-to-excel");
      expect(config?.sourceExtension).toBe(".json");
      expect(config?.targetExtension).toBe(".xlsx");
    });

    it("returns valid configuration for markdown-to-excel", () => {
      const config = getConverterBySlug("markdown-to-excel");
      expect(config).toBeDefined();
      expect(config?.slug).toBe("markdown-to-excel");
      expect(config?.sourceFormat).toBe("Markdown");
      expect(config?.targetFormat).toBe("Excel");
      expect(config?.sourceExtension).toBe(".md");
      expect(config?.targetExtension).toBe(".xlsx");
      expect(config?.isClientSide).toBe(true);
      expect(config?.engineId).toBe("markdown-to-excel");
    });

    it("returns valid configuration for sqlite-to-excel", () => {
      const config = getConverterBySlug("sqlite-to-excel");
      expect(config).toBeDefined();
      expect(config?.slug).toBe("sqlite-to-excel");
      expect(config?.sourceFormat).toBe("SQLite");
      expect(config?.targetFormat).toBe("Excel");
      expect(config?.engineId).toBe("sqlite-to-excel");
      expect(config?.sourceExtension).toBe(".sqlite");
      expect(config?.additionalExtensions).toEqual(
        expect.arrayContaining([".db", ".sqlite3", ".db3"])
      );
      expect(config?.isClientSide).toBe(true);
      expect(config?.category).toBe("spreadsheets");
    });

    it("returns valid configuration for json-to-ndjson", () => {
      const config = getConverterBySlug("json-to-ndjson");
      expect(config).toBeDefined();
      expect(config?.slug).toBe("json-to-ndjson");
      expect(config?.sourceFormat).toBe("JSON");
      expect(config?.targetFormat).toBe("NDJSON");
      expect(config?.category).toBe("data-engineering");
      expect(config?.engineId).toBe("json-to-ndjson");
      expect(config?.sourceExtension).toBe(".json");
      expect(config?.targetExtension).toBe(".ndjson");
      expect(config?.isClientSide).toBe(true);
    });

    it("returns valid configuration for json-to-schema", () => {
      const config = getConverterBySlug("json-to-schema");
      expect(config).toBeDefined();
      expect(config?.slug).toBe("json-to-schema");
      expect(config?.sourceFormat).toBe("JSON");
      expect(config?.targetFormat).toBe("JSON Schema");
      expect(config?.category).toBe("data-engineering");
      expect(config?.engineId).toBe("json-to-schema");
      expect(config?.sourceExtension).toBe(".json");
      expect(config?.targetExtension).toBe(".schema.json");
      expect(config?.isClientSide).toBe(true);
    });

    it("returns undefined for unknown slug or prototype properties", () => {
      expect(getConverterBySlug("non-existent-converter")).toBeUndefined();
      expect(getConverterBySlug("toString")).toBeUndefined();
      expect(getConverterBySlug("valueOf")).toBeUndefined();
      expect(getConverterBySlug("__proto__")).toBeUndefined();
      expect(getConverterBySlug("")).toBeUndefined();
    });
  });

  describe("getFeaturedConverters", () => {
    it("returns all converters flagged as featured", () => {
      const featured = getFeaturedConverters();
      expect(featured.length).toBeGreaterThanOrEqual(7);
      featured.forEach((item) => {
        expect(item.featured).toBe(true);
      });
    });
  });

  describe("ALL_SUPPORTED_EXTENSIONS", () => {
    it("contains all necessary extensions with leading dots", () => {
      expect(ALL_SUPPORTED_EXTENSIONS).toContain(".json");
      expect(ALL_SUPPORTED_EXTENSIONS).toContain(".xml");
      expect(ALL_SUPPORTED_EXTENSIONS).toContain(".csv");
      expect(ALL_SUPPORTED_EXTENSIONS).toContain(".xlsx");
      expect(ALL_SUPPORTED_EXTENSIONS).toContain(".xls");
      expect(ALL_SUPPORTED_EXTENSIONS).toContain(".pdf");
      expect(ALL_SUPPORTED_EXTENSIONS).toContain(".parquet");
      expect(ALL_SUPPORTED_EXTENSIONS).toContain(".jsonl");
      expect(ALL_SUPPORTED_EXTENSIONS).toContain(".ndjson");
      ALL_SUPPORTED_EXTENSIONS.forEach((ext) => {
        expect(ext.startsWith(".")).toBe(true);
      });
    });
  });

  describe("formatBytes utility", () => {
    it("formats 0 and invalid inputs accurately", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
      expect(formatBytes(-100)).toBe("0 Bytes");
      expect(formatBytes(NaN)).toBe("0 Bytes");
    });

    it("formats bytes, kilobytes, megabytes, and gigabytes accurately", () => {
      expect(formatBytes(500)).toBe("500 Bytes");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1536)).toBe("1.5 KB");
      expect(formatBytes(1048576)).toBe("1 MB");
      expect(formatBytes(1048576 * 5)).toBe("5 MB");
      expect(formatBytes(1073741824)).toBe("1 GB");
      expect(formatBytes(1099511627776)).toBe("1 TB");
    });

    it("respects decimal places parameter", () => {
      expect(formatBytes(1536, 0)).toBe("2 KB");
      expect(formatBytes(1536, 2)).toBe("1.5 KB");
      expect(formatBytes(1234567, 3)).toBe("1.177 MB");
    });
  });

  describe("getFileExtension utility", () => {
    it("extracts extension with lowercase normalization", () => {
      expect(getFileExtension("data.JSON")).toBe("json");
      expect(getFileExtension("report.XLSX")).toBe("xlsx");
      expect(getFileExtension("file.CSV")).toBe("csv");
    });

    it("handles multiple dots and returns final extension", () => {
      expect(getFileExtension("archive.tar.gz")).toBe("gz");
      expect(getFileExtension("my.report.2024.final.xlsx")).toBe("xlsx");
    });

    it("handles dotfiles and hidden files", () => {
      expect(getFileExtension(".env")).toBe("env");
      expect(getFileExtension(".gitignore")).toBe("gitignore");
      expect(getFileExtension(".hidden.json")).toBe("json");
    });

    it("returns empty string for inputs without extension", () => {
      expect(getFileExtension("noextension")).toBe("");
      expect(getFileExtension("file.")).toBe("");
      expect(getFileExtension("")).toBe("");
      expect(getFileExtension("   ")).toBe("");
      expect(getFileExtension(null as any)).toBe("");
      expect(getFileExtension(undefined as any)).toBe("");
    });

    it("trims surrounding whitespace from filename", () => {
      expect(getFileExtension("   document.pdf   ")).toBe("pdf");
    });

    it("correctly handles file paths with dots in directory names", () => {
      expect(getFileExtension("backup.2024/data")).toBe("");
      expect(getFileExtension("backup.2024/data.csv")).toBe("csv");
      expect(getFileExtension("path.with.dots/subfolder/file.json")).toBe("json");
      expect(getFileExtension("path.with.dots/subfolder/noext")).toBe("");
      expect(getFileExtension("C:\\projects.2024\\report")).toBe("");
      expect(getFileExtension("C:\\projects.2024\\report.xlsx")).toBe("xlsx");
    });
  });

  describe("isExtensionSupported utility", () => {
    it("validates extensions case-insensitively with or without leading dots", () => {
      expect(isExtensionSupported("data.xlsx", [".xlsx", ".xls"])).toBe(true);
      expect(isExtensionSupported("data.XLS", [".xlsx", ".xls"])).toBe(true);
      expect(isExtensionSupported("data.xls", ["xlsx", "xls"])).toBe(true);
      expect(isExtensionSupported("data.csv", [".xlsx", ".xls"])).toBe(false);
    });

    it("validates file paths containing directory segments", () => {
      expect(isExtensionSupported("backup.2024/data.json", [".json"])).toBe(true);
      expect(isExtensionSupported("backup.2024/data", [".json"])).toBe(false);
      expect(isExtensionSupported("C:\\dir.name\\file.csv", [".csv"])).toBe(true);
      expect(isExtensionSupported("C:\\dir.name\\file", [".csv"])).toBe(false);
    });

    it("returns false for missing extensions or empty parameter lists", () => {
      expect(isExtensionSupported("", [".xlsx"])).toBe(false);
      expect(isExtensionSupported("file.xlsx", [])).toBe(false);
      expect(isExtensionSupported("noext", [".xlsx"])).toBe(false);
      expect(isExtensionSupported(null as any, [".xlsx"])).toBe(false);
      expect(isExtensionSupported("file.xlsx", null as any)).toBe(false);
    });
  });

  describe("sanitizeSheetName utility", () => {
    it("guards against reserved worksheet name 'History' (case-insensitive)", () => {
      expect(sanitizeSheetName("History")).toBe("History_Sheet");
      expect(sanitizeSheetName("history")).toBe("History_Sheet");
      expect(sanitizeSheetName("HISTORY")).toBe("History_Sheet");
      expect(sanitizeSheetName("'history'")).toBe("History_Sheet");
      expect(sanitizeSheetName("  History  ")).toBe("History_Sheet");
      expect(sanitizeSheetName("History:")).toBe("History_Sheet");
      // Non-reserved names should be preserved
      expect(sanitizeSheetName("Order History")).toBe("Order History");
      expect(sanitizeSheetName("History_Sheet")).toBe("History_Sheet");
    });

    it("trims leading and trailing single quotes", () => {
      expect(sanitizeSheetName("'Quarterly Report'")).toBe("Quarterly Report");
      expect(sanitizeSheetName("''Double Quoted''")).toBe("Double Quoted");
      expect(sanitizeSheetName("'")).toBe("Sheet1");
      expect(sanitizeSheetName("''''")).toBe("Sheet1");
    });

    it("preserves interior single quotes", () => {
      expect(sanitizeSheetName("Company's Revenue")).toBe("Company's Revenue");
      expect(sanitizeSheetName("'Company's Revenue'")).toBe("Company's Revenue");
    });

    it("strips invalid Excel characters: \\ / ? * [ ] :", () => {
      expect(sanitizeSheetName("Sales [2024]: Total/Q1*?")).toBe("Sales 2024 TotalQ1");
      expect(sanitizeSheetName(":::***???///[[[]]]")).toBe("Sheet1");
    });

    it("clamps sheet names to a maximum of 31 characters", () => {
      const longName = "A".repeat(50);
      const sanitized = sanitizeSheetName(longName);
      expect(sanitized).toBe("A".repeat(31));
      expect(sanitized.length).toBe(31);
    });

    it("defaults to Sheet1 for falsy or blank inputs", () => {
      expect(sanitizeSheetName()).toBe("Sheet1");
      expect(sanitizeSheetName("")).toBe("Sheet1");
      expect(sanitizeSheetName("   ")).toBe("Sheet1");
      expect(sanitizeSheetName(undefined)).toBe("Sheet1");
      expect(sanitizeSheetName(null as any)).toBe("Sheet1");
    });
  });

  describe("cn utility", () => {
    it("merges class names and handles conflicting tailwind classes", () => {
      expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
      expect(cn("px-2", true && "text-white", false && "hidden")).toBe("px-2 text-white");
      expect(cn("p-4", "p-2")).toBe("p-2");
    });
  });

  describe("downloadBlob utility", () => {
    it("safely handles server-side environment when window or document is undefined", () => {
      const blob = new Blob(["test-content"], { type: "text/plain" });
      expect(() => downloadBlob(blob, "output.txt")).not.toThrow();
    });

    it("triggers file download using temporary anchor element and defers revokeObjectURL", () => {
      vi.useFakeTimers();
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      const mockRevokeObjectURL = vi.fn();
      const mockClick = vi.fn();

      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
      };

      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockCreateElement = vi.fn().mockReturnValue(mockAnchor);

      const fakeWindow = {} as any;
      const fakeDocument = {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      } as any;

      const prevWindow = (globalThis as any).window;
      const prevDocument = (globalThis as any).document;
      const prevCreateObjectURL = URL.createObjectURL;
      const prevRevokeObjectURL = URL.revokeObjectURL;

      try {
        (globalThis as any).window = fakeWindow;
        (globalThis as any).document = fakeDocument;
        URL.createObjectURL = mockCreateObjectURL;
        URL.revokeObjectURL = mockRevokeObjectURL;

        const blob = new Blob(["test-content"], { type: "text/plain" });
        downloadBlob(blob, "output.txt");

        expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
        expect(mockCreateElement).toHaveBeenCalledWith("a");
        expect(mockAnchor.href).toBe("blob:mock-url");
        expect(mockAnchor.download).toBe("output.txt");
        expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor);
        expect(mockClick).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchor);

        // revokeObjectURL must NOT be called synchronously
        expect(mockRevokeObjectURL).not.toHaveBeenCalled();

        // Advance timers by 1000ms
        vi.advanceTimersByTime(1000);
        expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      } finally {
        vi.useRealTimers();
        (globalThis as any).window = prevWindow;
        (globalThis as any).document = prevDocument;
        URL.createObjectURL = prevCreateObjectURL;
        URL.revokeObjectURL = prevRevokeObjectURL;
      }
    });
  });
});
