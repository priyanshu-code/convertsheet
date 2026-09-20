import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tool-registry";
import { getAllConverterSlugs, getConverterBySlug } from "@/lib/registry";
import { ConverterCard } from "@/components/converter";
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
import { HourlyToSalaryCalculator } from "@/components/tools/HourlyToSalaryCalculator";
import { AnnualToHourlyCalculator } from "@/components/tools/AnnualToHourlyCalculator";
import { SqlStudioTool } from "@/components/tools/SqlStudioTool";
import { SheetDiffTool } from "@/components/tools/SheetDiffTool";
import { DataCleanerTool } from "@/components/tools/DataCleanerTool";
import { BulkImageCompressor } from "@/components/tools/BulkImageCompressor";
import { PdfCompressorTool } from "@/components/tools/PdfCompressorTool";
import { SavingsCdCalculator } from "@/components/tools/SavingsCdCalculator";
import { DebtPayoffCalculator } from "@/components/tools/DebtPayoffCalculator";
import { UkSalaryCalculator } from "@/components/tools/UkSalaryCalculator";
import { CanadaPaycheckCalculator } from "@/components/tools/CanadaPaycheckCalculator";
import { AustraliaPayCalculator } from "@/components/tools/AustraliaPayCalculator";

export interface EmbedPageProps {
  params: {
    slug: string;
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  const toolSlugs = getAllToolSlugs();
  const converterSlugs = getAllConverterSlugs();
  const allSlugs = Array.from(new Set([...toolSlugs, ...converterSlugs]));

  return allSlugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: EmbedPageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (tool) {
    return {
      title: `${tool.name} (Embed Widget) | ConvertSheet`,
      description: tool.metaDescription,
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  const converter = getConverterBySlug(params.slug);
  if (converter) {
    return {
      title: `${converter.sourceFormat} to ${converter.targetFormat} Converter (Embed Widget) | ConvertSheet`,
      description: converter.metaDescription,
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  return {
    title: "Widget - ConvertSheet",
    description: "Free interactive data widget.",
  };
}

export default function EmbedToolPage({ params }: EmbedPageProps) {
  const tool = getToolBySlug(params.slug);
  const converter = getConverterBySlug(params.slug);

  if (!tool && !converter) {
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
    "compress-image": () => (
      <BulkImageCompressor
        defaultFormat="original"
        title="Bulk Image Compressor"
        subtitle="Compress up to 50 photos simultaneously in your browser with 100% privacy."
      />
    ),
    "compress-jpeg": () => (
      <BulkImageCompressor
        defaultFormat="image/jpeg"
        title="JPEG & JPG Compressor"
        subtitle="Compress and optimize JPG/JPEG images with smart quantization."
      />
    ),
    "compress-png": () => (
      <BulkImageCompressor
        defaultFormat="image/png"
        title="PNG Compressor"
        subtitle="Compress transparent PNG images without quality loss."
      />
    ),
    "compress-webp": () => (
      <BulkImageCompressor
        defaultFormat="image/webp"
        title="WebP Compressor"
        subtitle="Compress next-generation WebP images for peak Core Web Vitals."
      />
    ),
    "image-compressor": () => (
      <BulkImageCompressor
        defaultFormat="original"
        title="Bulk Image Compressor"
        subtitle="Compress up to 50 photos simultaneously in your browser with 100% privacy."
      />
    ),
    "svg-to-png": () => (
      <ImageConverterTool
        defaultTargetFormat="image/png"
        title="SVG to PNG Rasterizer"
        subtitle="Render vector SVGs to crisp transparent PNG images at any resolution."
      />
    ),
    "compress-pdf": () => (
      <PdfCompressorTool
        title="Bulk PDF Compressor"
        subtitle="Compress up to 20 PDF documents simultaneously in your browser with 100% privacy."
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
    "hourly-to-salary-calculator": HourlyToSalaryCalculator,
    "annual-to-hourly-calculator": AnnualToHourlyCalculator,
    "debt-payoff-calculator": DebtPayoffCalculator,
    "high-yield-savings-cd-calculator": SavingsCdCalculator,
    "uk-salary-calculator": UkSalaryCalculator,
    "canada-paycheck-calculator": CanadaPaycheckCalculator,
    "australia-pay-calculator": AustraliaPayCalculator,
    "sql-query-studio": SqlStudioTool,
    "sheet-diff-checker": SheetDiffTool,
    "data-anonymizer-cleaner": DataCleanerTool,
  };

  const ToolComponent = tool ? componentMap[tool.slug] : null;
  const backlinkUrl = converter
    ? `https://www.convertsheet.com/convert/${converter.slug}`
    : `https://www.convertsheet.com/tools/${tool?.slug}`;

  return (
    <div className="space-y-3">
      {converter ? (
        <ConverterCard config={converter} />
      ) : ToolComponent ? (
        <ToolComponent />
      ) : null}

      {/* Powered by ConvertSheet Attribution Bar (SEO Backlink Engine) */}
      <footer className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Client-Side • Private &amp; Free</span>
        </div>

        <div>
          Powered by{" "}
          <Link
            href={backlinkUrl}
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
