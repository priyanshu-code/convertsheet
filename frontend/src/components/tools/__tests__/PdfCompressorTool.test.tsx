import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PdfCompressorTool } from "../PdfCompressorTool";
import * as pdfEngine from "@/lib/engines/pdf-engine";
import * as zipUtils from "@/lib/zip-utils";

describe("PdfCompressorTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock createObjectURL & revokeObjectURL
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn(() => `blob:mock-pdf-url-${Math.random()}`);
    } else {
      vi.spyOn(globalThis.URL, "createObjectURL").mockImplementation(() => `blob:mock-pdf-url-${Math.random()}`);
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(globalThis.URL, "revokeObjectURL").mockImplementation(() => {});
    }

    // Default mock compressPdf
    vi.spyOn(pdfEngine, "compressPdf").mockImplementation(async (file, options) => {
      const baseName = file.name.replace(/\.pdf$/i, "");
      const originalSizeBytes = file.size || 1000;
      const factor = options.level === "extreme" ? 0.3 : options.level === "low" ? 0.8 : 0.5;
      const compressedSizeBytes = Math.round(originalSizeBytes * factor);
      const savingsPercentage = Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100);

      return {
        blob: new Blob(["compressed-pdf-data"], { type: "application/pdf" }),
        filename: `compressed_${baseName}.pdf`,
        originalSizeBytes,
        compressedSizeBytes,
        savingsPercentage,
        pageCount: 3,
      };
    });

    vi.spyOn(zipUtils, "createZipArchive").mockResolvedValue(new Blob(["mock-zip"], { type: "application/zip" }));
    vi.spyOn(zipUtils, "downloadBlob").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders multi-file dropzone with .pdf validation and preset level selector", () => {
    render(<PdfCompressorTool />);

    expect(screen.getByText("Compress PDF Online")).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop PDF files here, or click to browse/i)).toBeInTheDocument();
    expect(screen.getByText(/Supports up to 20 PDF documents/i)).toBeInTheDocument();

    // Preset level selector buttons
    expect(screen.getByRole("button", { name: /Recommended/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Extreme/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Low/i })).toBeInTheDocument();
  });

  it("supports custom title and subtitle props", () => {
    render(
      <PdfCompressorTool
        title="Custom PDF Compressor"
        subtitle="Custom Subtitle for Testing"
      />
    );

    expect(screen.getByText("Custom PDF Compressor")).toBeInTheDocument();
    expect(screen.getByText("Custom Subtitle for Testing")).toBeInTheDocument();
  });

  it("preset level selector toggles compression mode and triggers re-compression", async () => {
    const { container } = render(<PdfCompressorTool />);
    const input = container.querySelector('input[type="file"]');

    const file = new File(["pdf content 1000 bytes"], "document.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("document.pdf")).toBeInTheDocument();
      expect(screen.getByText("3 Pages")).toBeInTheDocument();
    });

    const initialCalls = pdfEngine.compressPdf.mock.calls.length;
    expect(initialCalls).toBe(1);
    expect(pdfEngine.compressPdf.mock.calls[0][1]).toEqual({ level: "recommended" });

    // Switch to Extreme preset
    const extremeBtn = screen.getByRole("button", { name: /Extreme/i });
    fireEvent.click(extremeBtn);

    await waitFor(() => {
      expect(pdfEngine.compressPdf.mock.calls.length).toBeGreaterThan(initialCalls);
    });
    expect(pdfEngine.compressPdf.mock.calls[1][1]).toEqual({ level: "extreme" });

    // Switch to Low preset
    const lowBtn = screen.getByRole("button", { name: /Low/i });
    fireEvent.click(lowBtn);

    await waitFor(() => {
      expect(pdfEngine.compressPdf.mock.calls.length).toBeGreaterThan(initialCalls + 1);
    });
    expect(pdfEngine.compressPdf.mock.calls[2][1]).toEqual({ level: "low" });
  });

  it("adding PDF files displays document cards with page count, file size badge, and savings percentage", async () => {
    const { container } = render(<PdfCompressorTool />);
    const input = container.querySelector('input[type="file"]');

    const file1 = new File(["data 10000 bytes"], "contract.pdf", { type: "application/pdf" });
    const file2 = new File(["data 20000 bytes"], "report.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("contract.pdf")).toBeInTheDocument();
      expect(screen.getByText("report.pdf")).toBeInTheDocument();
    });

    // Summary banner check
    expect(screen.getByText(/Total Documents/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Saved/i)).toBeInTheDocument();

    // Verify page count badges
    const pageBadges = screen.getAllByText("3 Pages");
    expect(pageBadges.length).toBe(2);

    // Verify savings badges are displayed (e.g. -50%)
    const savingsBadges = screen.getAllByText("-50%");
    expect(savingsBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("handles drag-and-drop file upload", async () => {
    render(<PdfCompressorTool />);
    const dropzone = screen.getByText(/Drag & drop PDF files here/i).closest("div");

    const file = new File(["pdf sample"], "dragged.pdf", { type: "application/pdf" });

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file] },
      });
    });

    await waitFor(() => {
      expect(screen.getByText("dragged.pdf")).toBeInTheDocument();
    });
  });

  it("single document download triggers downloadBlob", async () => {
    const { container } = render(<PdfCompressorTool />);
    const input = container.querySelector('input[type="file"]');

    const file = new File(["pdf data"], "invoice.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("invoice.pdf")).toBeInTheDocument();
    });

    const downloadBtn = screen.getByTitle(/Download compressed_invoice\.pdf/i);
    expect(downloadBtn).toBeInTheDocument();

    fireEvent.click(downloadBtn);

    expect(zipUtils.downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      "compressed_invoice.pdf"
    );
  });

  it("single document removal removes card and revokes object URL", async () => {
    const revokeSpy = vi.spyOn(globalThis.URL, "revokeObjectURL");
    const { container } = render(<PdfCompressorTool />);
    const input = container.querySelector('input[type="file"]');

    const file1 = new File(["data 1"], "doc1.pdf", { type: "application/pdf" });
    const file2 = new File(["data 2"], "doc2.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("doc1.pdf")).toBeInTheDocument();
      expect(screen.getByText("doc2.pdf")).toBeInTheDocument();
    });

    const removeBtns = screen.getAllByTitle(/Remove/i);
    expect(removeBtns.length).toBe(2);

    fireEvent.click(removeBtns[0]);

    await waitFor(() => {
      expect(screen.queryByText("doc1.pdf")).not.toBeInTheDocument();
      expect(screen.getByText("doc2.pdf")).toBeInTheDocument();
    });

    expect(revokeSpy).toHaveBeenCalled();
  });

  it('"Download All as ZIP" triggers createZipArchive and downloadBlob', async () => {
    const { container } = render(<PdfCompressorTool />);
    const input = container.querySelector('input[type="file"]');

    const file1 = new File(["data 1"], "doc1.pdf", { type: "application/pdf" });
    const file2 = new File(["data 2"], "doc2.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("doc1.pdf")).toBeInTheDocument();
      expect(screen.getByText("doc2.pdf")).toBeInTheDocument();
    });

    const zipButton = screen.getByRole("button", { name: /Download All as ZIP/i });
    expect(zipButton).toBeInTheDocument();

    fireEvent.click(zipButton);

    await waitFor(() => {
      expect(zipUtils.createZipArchive).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "compressed_doc1.pdf" }),
          expect.objectContaining({ name: "compressed_doc2.pdf" }),
        ])
      );
      expect(zipUtils.downloadBlob).toHaveBeenCalledWith(
        expect.any(Blob),
        "compressed_pdfs.zip"
      );
    });
  });

  it("handles corrupted or password-protected PDF with error badge on that card without breaking other batch items", async () => {
    vi.spyOn(pdfEngine, "compressPdf").mockImplementation(async (file) => {
      if (file.name === "corrupted.pdf") {
        throw new Error("Password-protected or invalid PDF structure.");
      }
      return {
        blob: new Blob(["good pdf"], { type: "application/pdf" }),
        filename: `compressed_${file.name}`,
        originalSizeBytes: 5000,
        compressedSizeBytes: 2500,
        savingsPercentage: 50,
        pageCount: 2,
      };
    });

    const { container } = render(<PdfCompressorTool />);
    const input = container.querySelector('input[type="file"]');

    const file1 = new File(["bad data"], "corrupted.pdf", { type: "application/pdf" });
    const file2 = new File(["good data"], "valid.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("corrupted.pdf")).toBeInTheDocument();
      expect(screen.getByText("valid.pdf")).toBeInTheDocument();
    });

    // Error badge on corrupted card
    await waitFor(() => {
      expect(screen.getByText(/Password-protected or invalid PDF structure/i)).toBeInTheDocument();
    });

    // Valid card should still succeed
    expect(screen.getByText("2 Pages")).toBeInTheDocument();
  });

  it("shows dismissible error alert when ZIP archive creation fails", async () => {
    vi.spyOn(zipUtils, "createZipArchive").mockRejectedValueOnce(
      new Error("ZIP bundle compression failure")
    );

    const { container } = render(<PdfCompressorTool />);
    const input = container.querySelector('input[type="file"]');

    const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("doc.pdf")).toBeInTheDocument();
    });

    const zipButton = screen.getByRole("button", { name: /Download All as ZIP/i });
    fireEvent.click(zipButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/ZIP bundle compression failure/i)).toBeInTheDocument();
    });

    // Dismiss error
    const dismissBtn = screen.getByRole("button", { name: /Dismiss ZIP error/i });
    fireEvent.click(dismissBtn);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("ignores non-pdf files in upload", async () => {
    const { container } = render(<PdfCompressorTool />);
    const input = container.querySelector('input[type="file"]');

    const file1 = new File(["not a pdf"], "image.png", { type: "image/png" });
    const file2 = new File(["valid"], "doc.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("doc.pdf")).toBeInTheDocument();
    });

    expect(screen.queryByText("image.png")).not.toBeInTheDocument();
  });
});
