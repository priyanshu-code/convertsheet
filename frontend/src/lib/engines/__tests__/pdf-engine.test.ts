import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  parsePageRanges,
  mergePdfFiles,
  splitPdfFile,
  watermarkPdfFile,
  addPageNumbersToPdf,
  extractPdfTextRows,
  compressPdf,
  compressBatchPdfs,
} from "../pdf-engine";

// Helper to create a dummy in-memory PDF File object
async function createTestPdfFile(name: string, pageCount: number = 3): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`Page ${i + 1} of ${name}`, { x: 50, y: 500 });
  }
  const bytes = await doc.save();
  return new File([bytes], name, { type: "application/pdf" });
}

describe("pdf-engine", () => {
  describe("parsePageRanges", () => {
    it("returns all page indices when range string is empty", () => {
      const indices = parsePageRanges("", 5);
      expect(indices).toEqual([0, 1, 2, 3, 4]);
    });

    it("parses single pages and ranges correctly", () => {
      const indices = parsePageRanges("1, 3-5, 8", 10);
      expect(indices).toEqual([0, 2, 3, 4, 7]);
    });

    it("clamps ranges to totalPages", () => {
      const indices = parsePageRanges("4-15", 5);
      expect(indices).toEqual([3, 4]);
    });

    it("ignores out-of-bounds or invalid inputs", () => {
      const indices = parsePageRanges("0, -2, foo, 99", 5);
      expect(indices).toEqual([]);
    });

    it("deduplicates and sorts page indices", () => {
      const indices = parsePageRanges("3, 1, 2-4", 5);
      expect(indices).toEqual([0, 1, 2, 3]);
    });
  });

  describe("mergePdfFiles", () => {
    it("throws an error if no files are provided", async () => {
      await expect(mergePdfFiles([])).rejects.toThrow("Please select at least one PDF file");
    });

    it("merges multiple PDF files into a single document", async () => {
      const file1 = await createTestPdfFile("doc1.pdf", 2);
      const file2 = await createTestPdfFile("doc2.pdf", 3);

      const result = await mergePdfFiles([file1, file2]);
      expect(result.pageCount).toBe(5);
      expect(result.filename).toBe("convertsheet_merged.pdf");
      expect(result.blob.type).toBe("application/pdf");
      expect(result.blob.size).toBeGreaterThan(0);
    });

    it("uses single file name if only one file is passed", async () => {
      const file = await createTestPdfFile("single.pdf", 2);
      const result = await mergePdfFiles([file]);
      expect(result.pageCount).toBe(2);
      expect(result.filename).toBe("merged_single.pdf");
    });
  });

  describe("splitPdfFile", () => {
    it("extracts specific pages according to range string", async () => {
      const file = await createTestPdfFile("original.pdf", 5);
      const result = await splitPdfFile(file, "2-3, 5");

      expect(result.pageCount).toBe(3);
      expect(result.filename).toContain("original_pages_2-3-5.pdf");
      expect(result.blob.size).toBeGreaterThan(0);
    });

    it("throws error for out-of-bounds page range", async () => {
      const file = await createTestPdfFile("short.pdf", 2);
      await expect(splitPdfFile(file, "10-12")).rejects.toThrow("Invalid page range");
    });
  });

  describe("watermarkPdfFile", () => {
    it("applies a watermark across all pages", async () => {
      const file = await createTestPdfFile("confidential.pdf", 2);
      const result = await watermarkPdfFile(file, {
        text: "CONFIDENTIAL",
        opacity: 0.3,
        diagonal: true,
      });

      expect(result.pageCount).toBe(2);
      expect(result.filename).toBe("confidential_watermarked.pdf");
      expect(result.blob.size).toBeGreaterThan(0);
    });
  });

  describe("addPageNumbersToPdf", () => {
    it("stamps page numbers with page_x_of_y format", async () => {
      const file = await createTestPdfFile("manual.pdf", 4);
      const result = await addPageNumbersToPdf(file, {
        format: "page_x_of_y",
        position: "bottom-center",
      });

      expect(result.pageCount).toBe(4);
      expect(result.filename).toBe("manual_numbered.pdf");
      expect(result.blob.size).toBeGreaterThan(0);
    });

    it("stamps page numbers with number_only format and bottom-right position", async () => {
      const file = await createTestPdfFile("guide.pdf", 2);
      const result = await addPageNumbersToPdf(file, {
        format: "number_only",
        position: "bottom-right",
      });

      expect(result.pageCount).toBe(2);
      expect(result.filename).toBe("guide_numbered.pdf");
    });
  });

  describe("extractPdfTextRows", () => {
    it("extracts tabular data or falls back to message when no text stream found", async () => {
      const file = await createTestPdfFile("data.pdf", 1);
      const tabular = await extractPdfTextRows(file);

      expect(tabular.columns).toBeDefined();
      expect(tabular.rows).toBeDefined();
      expect(tabular.rows.length).toBeGreaterThan(0);
      expect(tabular.totalRows).toBeGreaterThan(0);
    });
  });

  describe("compressPdf", () => {
    it("compresses PDF with recommended level and returns valid PdfCompressionResult", async () => {
      const file = await createTestPdfFile("document.pdf", 3);
      const result = await compressPdf(file, { level: "recommended" });

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob.type).toBe("application/pdf");
      expect(result.filename).toBe("compressed_document.pdf");
      expect(result.originalSizeBytes).toBe(file.size);
      expect(result.compressedSizeBytes).toBe(result.blob.size);
      expect(typeof result.savingsPercentage).toBe("number");
      expect(result.savingsPercentage).toBeGreaterThanOrEqual(0);
      expect(result.pageCount).toBe(3);
    });

    it("supports level: extreme and level: low", async () => {
      const file = await createTestPdfFile("sample.pdf", 2);

      const extremeResult = await compressPdf(file, { level: "extreme" });
      expect(extremeResult.filename).toBe("compressed_sample.pdf");
      expect(extremeResult.pageCount).toBe(2);
      expect(extremeResult.compressedSizeBytes).toBeGreaterThan(0);

      const lowResult = await compressPdf(file, { level: "low" });
      expect(lowResult.filename).toBe("compressed_sample.pdf");
      expect(lowResult.pageCount).toBe(2);
      expect(lowResult.compressedSizeBytes).toBeGreaterThan(0);
    });

    it("gracefully rejects for invalid non-PDF file", async () => {
      const invalidFile = new File(["This is plain text not a valid PDF"], "test.txt", {
        type: "text/plain",
      });
      await expect(compressPdf(invalidFile, { level: "recommended" })).rejects.toThrow(
        /Failed to parse PDF document|Invalid PDF file/
      );
    });

    it("gracefully rejects for empty file", async () => {
      const emptyFile = new File([], "empty.pdf", { type: "application/pdf" });
      await expect(compressPdf(emptyFile, { level: "recommended" })).rejects.toThrow(
        /empty|Failed to parse PDF document/i
      );
    });
  });

  describe("compressBatchPdfs", () => {
    it("processes multiple files with concurrency and reports progress", async () => {
      const file1 = await createTestPdfFile("doc1.pdf", 1);
      const file2 = await createTestPdfFile("doc2.pdf", 2);
      const file3 = await createTestPdfFile("doc3.pdf", 1);

      const progressCalls: [number, number][] = [];
      const onProgress = (completed: number, total: number) => {
        progressCalls.push([completed, total]);
      };

      const results = await compressBatchPdfs(
        [file1, file2, file3],
        { level: "recommended" },
        2,
        onProgress
      );

      expect(results).toHaveLength(3);
      expect(results[0].filename).toBe("compressed_doc1.pdf");
      expect(results[1].filename).toBe("compressed_doc2.pdf");
      expect(results[2].filename).toBe("compressed_doc3.pdf");
      expect(results[0].pageCount).toBe(1);
      expect(results[1].pageCount).toBe(2);
      expect(results[2].pageCount).toBe(1);

      expect(progressCalls).toHaveLength(3);
      expect(progressCalls[progressCalls.length - 1]).toEqual([3, 3]);
    });
  });
});

