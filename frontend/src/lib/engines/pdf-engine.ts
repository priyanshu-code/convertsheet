/**
 * 100% Client-Side PDF Engine using pdf-lib and pdfjs-dist.
 * Executes all merges, splits, watermarking, page numbering,
 * and text extraction locally in browser memory with zero server uploads.
 */

import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import * as XLSX from "xlsx";
import { TabularData } from "@/types/converter";

/**
 * Parses page ranges string like "1, 3-5, 8" into an array of 0-based page indices.
 */
export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const clean = rangeStr.replace(/\s+/g, "");
  if (!clean) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set<number>();
  const parts = clean.split(",");

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          indices.add(i - 1);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        indices.add(page - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Merges multiple PDF files in sequential order.
 */
export async function mergePdfFiles(
  files: File[]
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  if (!files || files.length === 0) {
    throw new Error("Please select at least one PDF file to merge.");
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const filename = files.length === 1 ? `merged_${files[0].name}` : "convertsheet_merged.pdf";

  return {
    blob,
    filename,
    pageCount: mergedPdf.getPageCount(),
  };
}

/**
 * Splits or extracts specific pages from a PDF file.
 */
export async function splitPdfFile(
  file: File,
  rangeStr: string
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();

  const selectedIndices = parsePageRanges(rangeStr, totalPages);
  if (selectedIndices.length === 0) {
    throw new Error(`Invalid page range. Please select pages between 1 and ${totalPages}.`);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, selectedIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const base = file.name.replace(/\.pdf$/i, "");
  const filename = `${base}_pages_${selectedIndices.map((i) => i + 1).join("-")}.pdf`;

  return {
    blob,
    filename,
    pageCount: newPdf.getPageCount(),
  };
}

export interface WatermarkOptions {
  text: string;
  opacity?: number; // 0.1 to 1.0
  size?: number; // font size
  diagonal?: boolean;
}

/**
 * Adds custom text watermark across every page of a PDF.
 */
export async function watermarkPdfFile(
  file: File,
  options: WatermarkOptions
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const opacity = options.opacity !== undefined ? options.opacity : 0.25;
  const fontSize = options.size || 50;
  const isDiagonal = options.diagonal !== false;

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(options.text, {
      x: isDiagonal ? width / 2 - textWidth / 2 : width / 2 - textWidth / 2,
      y: isDiagonal ? height / 2 - textHeight / 2 : height / 2,
      size: fontSize,
      font,
      color: rgb(0.6, 0.6, 0.6),
      opacity,
      rotate: isDiagonal ? degrees(45) : degrees(0),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const base = file.name.replace(/\.pdf$/i, "");

  return {
    blob,
    filename: `${base}_watermarked.pdf`,
    pageCount: pages.length,
  };
}

export interface PageNumberOptions {
  format?: "page_x_of_y" | "number_only";
  position?: "bottom-center" | "bottom-right";
}

/**
 * Stamps page numbers at bottom-center or bottom-right of every page.
 */
export async function addPageNumbersToPdf(
  file: File,
  options?: PageNumberOptions
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  const style = options?.format || "page_x_of_y";
  const pos = options?.position || "bottom-center";
  const fontSize = 10;

  pages.forEach((page, idx) => {
    const { width } = page.getSize();
    const pageNumber = idx + 1;
    const text = style === "page_x_of_y" ? `Page ${pageNumber} of ${total}` : `${pageNumber}`;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = width / 2 - textWidth / 2;
    if (pos === "bottom-right") {
      x = width - textWidth - 36;
    }

    page.drawText(text, {
      x,
      y: 24,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const base = file.name.replace(/\.pdf$/i, "");

  return {
    blob,
    filename: `${base}_numbered.pdf`,
    pageCount: total,
  };
}

/**
 * Basic in-browser text stream extractor for tabular rows from PDF.
 * Extracts structured line-by-line whitespace-delimited columns for SheetJS export.
 */
export async function extractPdfTextRows(file: File): Promise<TabularData> {
  const arrayBuffer = await file.arrayBuffer();
  // Read using text decoding heuristic on PDF text streams
  const uint8 = new Uint8Array(arrayBuffer);
  const rawString = new TextDecoder("latin1").decode(uint8);

  // Extract text within BT ... ET blocks and parentheses (text)
  const matches = rawString.match(/\((.*?)\)\s*Tj/g) || [];
  const tokens = matches.map((m) => m.replace(/^\(/, "").replace(/\)\s*Tj$/, "").trim()).filter(Boolean);

  if (tokens.length === 0) {
    return {
      columns: ["Page", "Content"],
      rows: [{ Page: 1, Content: "No selectable text stream found (Document may be scanned image)." }],
      totalRows: 1,
    };
  }

  // Segment tokens into table-like rows (e.g. chunks of 4-6 columns)
  const cols = ["Column_1", "Column_2", "Column_3", "Column_4"];
  const rows: Record<string, any>[] = [];

  for (let i = 0; i < tokens.length; i += 4) {
    const chunk = tokens.slice(i, i + 4);
    rows.push({
      Column_1: chunk[0] || "",
      Column_2: chunk[1] || "",
      Column_3: chunk[2] || "",
      Column_4: chunk[3] || "",
    });
  }

  return {
    columns: cols,
    rows: rows.slice(0, 100),
    totalRows: rows.length,
  };
}
