import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PdfMergeTool } from "../PdfMergeTool";
import { PdfSplitTool } from "../PdfSplitTool";
import { PdfWatermarkTool } from "../PdfWatermarkTool";
import { PdfPageNumberTool } from "../PdfPageNumberTool";
import { PdfTableExtractorTool } from "../PdfTableExtractorTool";
import * as pdfEngine from "@/lib/engines/pdf-engine";
import { PDFDocument } from "pdf-lib";

describe("PDF Tool Components", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("PdfMergeTool", () => {
    it("renders initial dropzone correctly", () => {
      render(<PdfMergeTool />);
      expect(screen.getByText("Merge PDF Online")).toBeInTheDocument();
      expect(screen.getByText("Choose PDF Files")).toBeInTheDocument();
    });

    it("handles file selection, reordering, and merge", async () => {
      vi.spyOn(pdfEngine, "mergePdfFiles").mockResolvedValue({
        blob: new Blob(["dummy-pdf"], { type: "application/pdf" }),
        filename: "convertsheet_merged.pdf",
        pageCount: 6,
      });

      const { container } = render(<PdfMergeTool />);
      const input = container.querySelector("input[type='file']") as HTMLInputElement;

      const file1 = new File(["pdf1"], "doc1.pdf", { type: "application/pdf" });
      const file2 = new File(["pdf2"], "doc2.pdf", { type: "application/pdf" });

      fireEvent.change(input, { target: { files: [file1, file2] } });

      await waitFor(() => {
        expect(screen.getByText("doc1.pdf")).toBeInTheDocument();
        expect(screen.getByText("doc2.pdf")).toBeInTheDocument();
      });

      const mergeBtn = screen.getByRole("button", { name: /Merge 2 PDFs/i });
      fireEvent.click(mergeBtn);

      await waitFor(() => {
        expect(screen.getByText("6 Pages")).toBeInTheDocument();
        expect(screen.getByText(/Download convertsheet_merged\.pdf/i)).toBeInTheDocument();
      });
    });
  });

  describe("PdfSplitTool", () => {
    it("renders split dropzone", () => {
      render(<PdfSplitTool />);
      expect(screen.getByText("Split PDF & Extract Pages")).toBeInTheDocument();
      expect(screen.getByText("Choose PDF File")).toBeInTheDocument();
    });

    it("handles file upload, page range selection, and split", async () => {
      vi.spyOn(pdfEngine, "splitPdfFile").mockResolvedValue({
        blob: new Blob(["dummy-split"], { type: "application/pdf" }),
        filename: "test_pages_1-2.pdf",
        pageCount: 2,
      });

      const { container } = render(<PdfSplitTool />);
      const input = container.querySelector("input[type='file']") as HTMLInputElement;

      const doc = await PDFDocument.create();
      doc.addPage([100, 100]);
      doc.addPage([100, 100]);
      const bytes = await doc.save();
      const file = new File([bytes], "test.pdf", { type: "application/pdf" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText("test.pdf")).toBeInTheDocument();
        expect(screen.getByText(/2 pages total/i)).toBeInTheDocument();
      });

      const splitBtn = screen.getByRole("button", { name: /Extract Pages/i });
      fireEvent.click(splitBtn);

      await waitFor(() => {
        expect(screen.getByText("2 Pages Extracted")).toBeInTheDocument();
        expect(screen.getByText(/Download test_pages_1-2\.pdf/i)).toBeInTheDocument();
      });
    });
  });

  describe("PdfWatermarkTool", () => {
    it("renders watermark dropzone", () => {
      render(<PdfWatermarkTool />);
      expect(screen.getByText("Watermark PDF Online")).toBeInTheDocument();
      expect(screen.getByText("Choose PDF File")).toBeInTheDocument();
    });

    it("handles watermark application and download", async () => {
      vi.spyOn(pdfEngine, "watermarkPdfFile").mockResolvedValue({
        blob: new Blob(["dummy-wm"], { type: "application/pdf" }),
        filename: "test_watermarked.pdf",
        pageCount: 1,
      });

      const { container } = render(<PdfWatermarkTool />);
      const input = container.querySelector("input[type='file']") as HTMLInputElement;

      const doc = await PDFDocument.create();
      doc.addPage([100, 100]);
      const bytes = await doc.save();
      const file = new File([bytes], "test.pdf", { type: "application/pdf" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText("test.pdf")).toBeInTheDocument();
      });

      const applyBtn = screen.getByRole("button", { name: /Apply Watermark/i });
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(screen.getByText("1 Pages Watermarked")).toBeInTheDocument();
        expect(screen.getByText(/Download test_watermarked\.pdf/i)).toBeInTheDocument();
      });
    });
  });

  describe("PdfPageNumberTool", () => {
    it("renders page number dropzone", () => {
      render(<PdfPageNumberTool />);
      expect(screen.getByText("Add Page Numbers to PDF")).toBeInTheDocument();
      expect(screen.getByText("Choose PDF File")).toBeInTheDocument();
    });

    it("handles adding page numbers and download", async () => {
      vi.spyOn(pdfEngine, "addPageNumbersToPdf").mockResolvedValue({
        blob: new Blob(["dummy-numbered"], { type: "application/pdf" }),
        filename: "test_numbered.pdf",
        pageCount: 1,
      });

      const { container } = render(<PdfPageNumberTool />);
      const input = container.querySelector("input[type='file']") as HTMLInputElement;

      const doc = await PDFDocument.create();
      doc.addPage([100, 100]);
      const bytes = await doc.save();
      const file = new File([bytes], "test.pdf", { type: "application/pdf" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText("test.pdf")).toBeInTheDocument();
      });

      const numBtn = screen.getByRole("button", { name: /Add Page Numbers/i });
      fireEvent.click(numBtn);

      await waitFor(() => {
        expect(screen.getByText("1 Pages Numbered")).toBeInTheDocument();
        expect(screen.getByText(/Download test_numbered\.pdf/i)).toBeInTheDocument();
      });
    });
  });

  describe("PdfTableExtractorTool", () => {
    it("renders table extractor dropzone", () => {
      render(<PdfTableExtractorTool />);
      expect(screen.getByText("PDF Table & Text Extractor to Excel")).toBeInTheDocument();
      expect(screen.getByText("Choose PDF File")).toBeInTheDocument();
    });

    it("extracts and renders table data preview", async () => {
      vi.spyOn(pdfEngine, "extractPdfTextRows").mockResolvedValue({
        columns: ["Col1", "Col2"],
        rows: [{ Col1: "Hello", Col2: "World" }],
        totalRows: 1,
      });

      const { container } = render(<PdfTableExtractorTool />);
      const input = container.querySelector("input[type='file']") as HTMLInputElement;
      const file = new File(["dummy"], "data.pdf", { type: "application/pdf" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
        expect(screen.getByText("World")).toBeInTheDocument();
        expect(screen.getByText("Export Excel (.xlsx)")).toBeInTheDocument();
      });
    });
  });
});
