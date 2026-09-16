import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import {
  getAllToolSlugs,
  getToolBySlug,
  TOOL_REGISTRY,
} from "@/lib/tool-registry";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import type { ConverterConfig } from "@/types/registry";
import { ToolJsonLdSchema } from "@/components/seo/ToolJsonLdSchema";
import { HowToGuide, FAQAccordion } from "@/components/seo";
import { AdBanner } from "@/components/layout";
import { EmbedTrigger } from "@/components/calculator/EmbedTrigger";

// Import all 18 tool components
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
import { DebtPayoffCalculator } from "@/components/tools/DebtPayoffCalculator";
import { SqlStudioTool } from "@/components/tools/SqlStudioTool";
import { SheetDiffTool } from "@/components/tools/SheetDiffTool";
import { DataCleanerTool } from "@/components/tools/DataCleanerTool";

export interface ToolPageProps {
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
}: ToolPageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested calculator or tool was not found.",
    };
  }

  const canonicalUrl = `https://convertsheet.com/tools/${tool.slug}`;
  const ogImage = `https://convertsheet.com/tools/${tool.slug}/opengraph-image`;

  return {
    title: tool.title,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: tool.title,
      description: tool.metaDescription,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${tool.name} - ConvertSheet Free Tools`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.title,
      description: tool.metaDescription,
      images: [ogImage],
    },
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  // Component lookup map
  const componentMap: Record<string, React.ComponentType> = {
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
    "webp-to-png": () => <ImageConverterTool defaultTargetFormat="image/png" title="WebP to PNG Converter" subtitle="Convert WebP images to lossless transparent PNG format." />,
    "png-to-webp": () => <ImageConverterTool defaultTargetFormat="image/webp" title="PNG to WebP Converter" subtitle="Compress PNG images to next-gen WebP format to speed up web pages." />,
    "jpeg-to-png": () => <ImageConverterTool defaultTargetFormat="image/png" title="JPEG to PNG Converter" subtitle="Convert JPEG photos to uncompressed PNG format." />,
    "image-compressor": () => <ImageConverterTool defaultTargetFormat="image/webp" title="Image Resizer & Compressor" subtitle="Compress and resize WebP, PNG, and JPEG images." />,
    "svg-to-png": () => <ImageConverterTool defaultTargetFormat="image/png" title="SVG to PNG Rasterizer" subtitle="Render vector SVGs to crisp transparent PNG images at any resolution." />,
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
    "sql-query-studio": SqlStudioTool,
    "sheet-diff-checker": SheetDiffTool,
    "data-anonymizer-cleaner": DataCleanerTool,
  };

  const ToolComponent = componentMap[tool.slug];

  // Resolve related cross-links
  const relatedConverters = (tool.relatedConverters || [])
    .map((slug) => (CONVERTER_REGISTRY as Record<string, ConverterConfig>)[slug])
    .filter(Boolean);

  const relatedTools = (tool.relatedTools || [])
    .map((slug) => getToolBySlug(slug))
    .filter(Boolean);

  return (
    <>
      <ToolJsonLdSchema config={tool} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <li>
              <Link
                href="/"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Tools Hub
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li>
              <Link
                href={`/tools/category/${tool.category}`}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors capitalize"
              >
                {tool.category.replace("-", " & ")}
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">/</li>
            <li className="font-medium text-zinc-800 dark:text-zinc-200 truncate" aria-current="page">
              {tool.name}
            </li>
          </ol>
        </nav>

        {/* Answer-First AEO Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% Client-Side • Private &amp; Free Forever</span>
            </div>
            <EmbedTrigger tool={tool} />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            {tool.name}
          </h1>

          {/* AEO Speakable Direct Answer Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium tool-answer-summary">
            💡 <strong className="text-zinc-900 dark:text-zinc-100">Direct Answer:</strong> {tool.answerSummary}
          </div>
        </div>

        {/* Primary Calculator UI */}
        <div className="max-w-4xl mx-auto">
          {ToolComponent ? <ToolComponent /> : <div>Loading tool...</div>}
        </div>

        {/* Top Ad Slot */}
        <div className="flex justify-center w-full my-6">
          <AdBanner format="horizontal" />
        </div>

        {/* GEO & E-E-A-T In-Depth About Section */}
        <section aria-labelledby="about-heading" className="space-y-4 max-w-4xl mx-auto tool-about-section">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 id="about-heading" className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              About {tool.name}
            </h2>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-3">
            <p>{tool.about}</p>
            {tool.formulaDescription && (
              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
                <strong className="block text-zinc-900 dark:text-zinc-100 font-sans mb-1">Mathematical Formula &amp; Algorithm:</strong>
                {tool.formulaDescription}
              </div>
            )}
          </div>
        </section>

        {/* How-To Step Guide */}
        <div className="max-w-4xl mx-auto">
          <HowToGuide
            config={{
              sourceFormat: tool.name,
              targetFormat: "Result",
              howTo: tool.howTo,
            } as any}
          />
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <FAQAccordion
            faqs={tool.faqs}
            title={`Frequently Asked Questions: ${tool.name}`}
            description="Answers to common questions regarding inputs, calculations, and mathematical methodology."
          />
        </div>

        {/* Cross-Linking Topic Clusters (GEO & Internal SEO) */}
        {(relatedConverters.length > 0 || relatedTools.length > 0) && (
          <section className="space-y-6 max-w-4xl mx-auto pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Related Converters &amp; Calculators
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedConverters.map((c) => (
                <Link
                  key={c.slug}
                  href={`/convert/${c.slug}`}
                  className="group p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between space-y-2"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      File Converter
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {c.sourceFormat} to {c.targetFormat}
                    </h4>
                  </div>
                  <div className="flex items-center text-xs text-zinc-400 group-hover:text-emerald-500 transition-colors">
                    <span>Convert file</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}

              {relatedTools.map((t) => (
                <Link
                  key={t!.slug}
                  href={`/tools/${t!.slug}`}
                  className="group p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between space-y-2"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Calculator / Tool
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {t!.name}
                    </h4>
                  </div>
                  <div className="flex items-center text-xs text-zinc-400 group-hover:text-emerald-500 transition-colors">
                    <span>Open tool</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Ad Banner */}
        <div className="flex justify-center w-full my-6">
          <AdBanner format="horizontal" />
        </div>
      </div>
    </>
  );
}
