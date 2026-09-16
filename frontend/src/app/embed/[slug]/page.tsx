import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tool-registry";
import { FileSpreadsheet, ShieldCheck } from "lucide-react";

// Import tool components
import { Base64Tool } from "@/components/tools/Base64Tool";
import { JsonFormatterTool } from "@/components/tools/JsonFormatterTool";
import { UrlEncoderTool } from "@/components/tools/UrlEncoderTool";
import { HashGeneratorTool } from "@/components/tools/HashGeneratorTool";
import { UnixTimestampTool } from "@/components/tools/UnixTimestampTool";
import { ColorCodeTool } from "@/components/tools/ColorCodeTool";
import { SipCalculator } from "@/components/tools/SipCalculator";
import { EmiCalculator } from "@/components/tools/EmiCalculator";
import { CompoundInterestCalculator } from "@/components/tools/CompoundInterestCalculator";
import { GstCalculator } from "@/components/tools/GstCalculator";
import { PercentageCalculator } from "@/components/tools/PercentageCalculator";
import { DiscountCalculator } from "@/components/tools/DiscountCalculator";
import { AgeCalculator } from "@/components/tools/AgeCalculator";
import { DateDifferenceCalculator } from "@/components/tools/DateDifferenceCalculator";
import { BmiCalculator } from "@/components/tools/BmiCalculator";
import { UnitConverterTool } from "@/components/tools/UnitConverterTool";
import { TipCalculator } from "@/components/tools/TipCalculator";
import { ByteConverterTool } from "@/components/tools/ByteConverterTool";
import { SalaryCalculator } from "@/components/tools/SalaryCalculator";
import { IncomeTaxCalculator } from "@/components/tools/IncomeTaxCalculator";
import { JwtDecoderTool } from "@/components/tools/JwtDecoderTool";
import { UuidGeneratorTool } from "@/components/tools/UuidGeneratorTool";
import { MarginCalculator } from "@/components/tools/MarginCalculator";
import { RoiCalculator } from "@/components/tools/RoiCalculator";
import { ImageConverterTool } from "@/components/tools/ImageConverterTool";
import { PdfMergeTool } from "@/components/tools/PdfMergeTool";
import { PdfSplitTool } from "@/components/tools/PdfSplitTool";
import { PdfWatermarkTool } from "@/components/tools/PdfWatermarkTool";
import { PdfPageNumberTool } from "@/components/tools/PdfPageNumberTool";
import { PdfTableExtractorTool } from "@/components/tools/PdfTableExtractorTool";
import { MortgageCalculator } from "@/components/tools/MortgageCalculator";
import { CarLoanCalculator } from "@/components/tools/CarLoanCalculator";
import { RetirementCalculator } from "@/components/tools/RetirementCalculator";
import { InflationCalculator } from "@/components/tools/InflationCalculator";
import { SqlStudioTool } from "@/components/tools/SqlStudioTool";
import { SheetDiffTool } from "@/components/tools/SheetDiffTool";
import { DataCleanerTool } from "@/components/tools/DataCleanerTool";

export interface EmbedPageProps {
  params: {
    slug: string;
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: EmbedPageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    return {
      title: "Calculator Widget - ConvertSheet",
      description: "Free interactive calculator widget.",
    };
  }

  return {
    title: `${tool.name} (Embed Widget) | ConvertSheet`,
    description: tool.metaDescription,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function EmbedToolPage({ params }: EmbedPageProps) {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  const componentMap: Record<string, React.ComponentType<any>> = {
    "base64-encoder-decoder": Base64Tool,
    "json-formatter-validator": JsonFormatterTool,
    "url-encoder-decoder": UrlEncoderTool,
    "hash-generator": HashGeneratorTool,
    "unix-timestamp-converter": UnixTimestampTool,
    "color-code-converter": ColorCodeTool,
    "sip-calculator": SipCalculator,
    "emi-calculator": EmiCalculator,
    "compound-interest-calculator": CompoundInterestCalculator,
    "gst-calculator": GstCalculator,
    "percentage-calculator": PercentageCalculator,
    "discount-calculator": DiscountCalculator,
    "age-calculator": AgeCalculator,
    "date-difference-calculator": DateDifferenceCalculator,
    "bmi-calculator": BmiCalculator,
    "unit-converter": UnitConverterTool,
    "tip-calculator": TipCalculator,
    "byte-converter": ByteConverterTool,
    "salary-calculator": SalaryCalculator,
    "income-tax-calculator": IncomeTaxCalculator,
    "jwt-decoder": JwtDecoderTool,
    "uuid-generator": UuidGeneratorTool,
    "margin-calculator": MarginCalculator,
    "roi-calculator": RoiCalculator,
    "webp-to-png": () => (
      <ImageConverterTool
        defaultTargetFormat="image/png"
        title="WebP to PNG Converter"
        subtitle="Convert WebP images to lossless transparent PNG format."
      />
    ),
    "png-to-webp": () => (
      <ImageConverterTool
        defaultTargetFormat="image/webp"
        title="PNG to WebP Converter"
        subtitle="Compress PNG images to next-gen WebP format to speed up web pages."
      />
    ),
    "jpeg-to-png": () => (
      <ImageConverterTool
        defaultTargetFormat="image/png"
        title="JPEG to PNG Converter"
        subtitle="Convert JPEG photos to uncompressed PNG format."
      />
    ),
    "image-compressor": () => (
      <ImageConverterTool
        defaultTargetFormat="image/webp"
        title="Image Resizer & Compressor"
        subtitle="Compress and resize WebP, PNG, and JPEG images."
      />
    ),
    "svg-to-png": () => (
      <ImageConverterTool
        defaultTargetFormat="image/png"
        title="SVG to PNG Rasterizer"
        subtitle="Render vector SVGs to crisp transparent PNG images at any resolution."
      />
    ),
    "merge-pdf": PdfMergeTool,
    "split-pdf": PdfSplitTool,
    "watermark-pdf": PdfWatermarkTool,
    "page-number-pdf": PdfPageNumberTool,
    "pdf-table-extractor": PdfTableExtractorTool,
    "mortgage-calculator": MortgageCalculator,
    "car-loan-calculator": CarLoanCalculator,
    "retirement-calculator": RetirementCalculator,
    "inflation-calculator": InflationCalculator,
    "sql-query-studio": SqlStudioTool,
    "sheet-diff-checker": SheetDiffTool,
    "data-anonymizer-cleaner": DataCleanerTool,
  };

  const ToolComponent = componentMap[tool.slug];

  return (
    <div className="space-y-3">
      {ToolComponent ? <ToolComponent /> : null}

      {/* Powered by ConvertSheet Attribution Bar (SEO Backlink Engine) */}
      <footer className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Client-Side • Private &amp; Free</span>
        </div>

        <div>
          Powered by{" "}
          <Link
            href={`https://convertsheet.com/tools/${tool.slug}`}
            target="_blank"
            rel="noopener"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>ConvertSheet</span>
            <span className="text-[10px] text-zinc-400 font-normal">↗</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
