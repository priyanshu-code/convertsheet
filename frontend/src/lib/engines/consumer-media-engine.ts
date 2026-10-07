/**
 * In-Browser Image and PDF Document Converter Engines.
 * 100% Client-side execution using HTMLCanvasElement and pdf-lib.
 * Zero server uploads, zero retention.
 */

import { IConverterEngine, TabularData, ConversionOutput, ConversionOptions } from "@/types/converter";
import { convertImage } from "./image-engine";
import { PDFDocument } from "pdf-lib";

function makeImageEngine(targetFormat: "image/png" | "image/jpeg" | "image/webp", targetExt: string, mimeType: string): IConverterEngine {
  return {
    async parsePreview(file: File, _maxRows?: number): Promise<TabularData> {
      return {
        columns: ["Property", "Value"],
        rows: [
          { Property: "Filename", Value: file.name },
          { Property: "File Size", Value: `${(file.size / 1024).toFixed(1)} KB` },
          { Property: "MIME Type", Value: file.type || "image/*" },
          { Property: "Target Format", Value: targetFormat },
        ],
        totalRows: 4,
      };
    },
    async convert(file: File, _options?: ConversionOptions): Promise<ConversionOutput> {
      const result = await convertImage(file, {
        format: targetFormat,
        quality: 0.92,
      });
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      return {
        blob: result.blob,
        filename: `${baseName}.${targetExt}`,
        mimeType,
      };
    },
  };
}

function makeImageToPdfEngine(): IConverterEngine {
  return {
    async parsePreview(file: File): Promise<TabularData> {
      return {
        columns: ["Property", "Value"],
        rows: [
          { Property: "Document Name", Value: file.name },
          { Property: "Original Size", Value: `${(file.size / 1024).toFixed(1)} KB` },
          { Property: "Output Target", Value: "Adobe PDF (.pdf)" },
        ],
        totalRows: 3,
      };
    },
    async convert(file: File): Promise<ConversionOutput> {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.create();

      let image;
      const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
      if (isPng) {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else {
        image = await pdfDoc.embedJpg(arrayBuffer);
      }

      const { width, height } = image;
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

      return {
        blob,
        filename: `${baseName}.pdf`,
        mimeType: "application/pdf",
      };
    },
  };
}

export const jpgToPngEngine = makeImageEngine("image/png", "png", "image/png");
export const pngToJpgEngine = makeImageEngine("image/jpeg", "jpg", "image/jpeg");
export const webpToJpgEngine = makeImageEngine("image/jpeg", "jpg", "image/jpeg");
export const svgToPngEngine = makeImageEngine("image/png", "png", "image/png");
export const heicToJpgEngine = makeImageEngine("image/jpeg", "jpg", "image/jpeg");
export const heicToPngEngine = makeImageEngine("image/png", "png", "image/png");
export const jpgToPdfEngine = makeImageToPdfEngine();
export const pngToPdfEngine = makeImageToPdfEngine();
