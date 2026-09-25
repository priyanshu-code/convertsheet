import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import {
  getAllConverterSlugs,
  getConverterBySlug,
  CONVERTER_REGISTRY,
} from "@/lib/registry";
import type { ConverterConfig } from "@/types/registry";
import { ConverterCard } from "@/components/converter";
import { AdBanner } from "@/components/layout";
import { HowToGuide, FAQAccordion, JsonLdSchema } from "@/components/seo";
import { EmbedTrigger } from "@/components/calculator";
import { getAllTools } from "@/lib/tool-registry";
import type { ToolConfig } from "@/types/tool";

export interface ConverterPageProps {
  params: {
    slug: string;
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllConverterSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: ConverterPageProps): Promise<Metadata> {
  const config = getConverterBySlug(params.slug);

  if (!config) {
    return {
      title: "Converter Not Found",
      description: "The requested data converter was not found.",
    };
  }

  const canonicalUrl = `https://www.convertsheet.com/convert/${config.slug}`;
  const ogImage = `https://www.convertsheet.com/convert/${config.slug}/opengraph-image`;

  return {
    title: config.title,
    description: config.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.title,
      description: config.metaDescription,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.metaDescription,
      images: [ogImage],
    },
  };
}

export default function ConverterPage({ params }: ConverterPageProps) {
  const config = getConverterBySlug(params.slug);

  if (!config) {
    notFound();
  }

  // Retrieve the other converters for internal cross-linking
  const otherConverters = (
    Object.values(CONVERTER_REGISTRY) as ConverterConfig[]
  ).filter((c) => c.slug !== config.slug);

  // Retrieve featured calculators & tools for bidirectional GEO/SEO cross-linking
  const featuredTools = getAllTools().slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12 sm:pt-4 sm:pb-16 space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-1.5 sm:space-y-2">
        {/* Breadcrumb Navigation & Privacy Badge in one compact line */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5"
          >
            <Link
              href="/"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Home
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <Link
              href="/#converters"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Converters
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-zinc-800 dark:text-zinc-200">
              {config.sourceFormat} to {config.targetFormat}
            </span>
          </nav>
          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <div
            data-testid="privacy-badge"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 px-2 py-0.5 rounded-full"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {config.isClientSide
                ? "100% Client-Side & Private • Zero Server Uploads"
                : "Secure End-to-End Processing • Zero Retention"}
            </span>
          </div>
          <EmbedTrigger
            tool={{
              slug: config.slug,
              name: `${config.sourceFormat} to ${config.targetFormat} Converter`,
              type: "converter",
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {config.title}
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-normal">
          {config.subtitle}
        </p>
      </div>

      {/* Converter Card - Spacious, pro-grade desktop width */}
      <div className="w-full max-w-7xl mx-auto">
        <ConverterCard config={config} />
      </div>

      {/* Leaderboard Ad Slot */}
      <div className="flex justify-center w-full my-4 sm:my-6">
        <AdBanner format="leaderboard" />
      </div>

      {/* 3-Step Visual How-To Guide */}
      <div className="max-w-5xl mx-auto">
        <HowToGuide config={config} />
      </div>

      {/* Editorial In-Depth About Section */}
      {config.about && (
        <section
          aria-labelledby="converter-about-heading"
          data-testid="converter-about-section"
          className="max-w-4xl mx-auto space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2
              id="converter-about-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              About {config.sourceFormat} to {config.targetFormat} Conversion
            </h2>
          </div>
          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-3">
            {config.about.split("\n\n").map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {/* Interactive FAQ Accordion */}
      <div className="max-w-4xl mx-auto">
        <FAQAccordion config={config} />
      </div>

      {/* Other Popular Data Converters Section */}
      <section
        aria-labelledby="other-converters-heading"
        data-testid="other-converters-section"
        className="max-w-7xl mx-auto pt-8 border-t border-zinc-200 dark:border-zinc-800"
      >
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2
            id="other-converters-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Other Popular Data Converters
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Convert spreadsheets, structured documents, and accounting files directly in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {otherConverters.map((converter) => (
            <Link
              key={converter.slug}
              href={`/convert/${converter.slug}`}
              className="group relative flex flex-col justify-between p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-emerald-300 dark:hover:border-emerald-800/80 hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg">
                    {converter.sourceFormat} &rarr; {converter.targetFormat}
                  </span>
                  {converter.badge && (
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      {converter.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {converter.sourceFormat} to {converter.targetFormat}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {converter.metaDescription}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Launch Converter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Contextual Data & Financial Productivity Bridge */}
      <div className="max-w-5xl mx-auto p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-emerald-50/80 dark:from-emerald-950/30 dark:via-zinc-900/60 dark:to-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
            Integrated Data Workflow
          </span>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Converting payroll, invoices, or mortgage data?
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
            Clean and analyze your spreadsheet outputs with our free in-browser calculators: test <Link href="/tools/salary-calculator" className="text-emerald-600 dark:text-emerald-400 underline font-medium">Take-Home Pay</Link>, model <Link href="/tools/mortgage-calculator" className="text-emerald-600 dark:text-emerald-400 underline font-medium">Mortgage Amortization</Link>, or scrub sensitive PII with <Link href="/tools/data-anonymizer-cleaner" className="text-emerald-600 dark:text-emerald-400 underline font-medium">Data Anonymizer</Link>.
          </p>
        </div>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
        >
          <span>Explore Free Tools Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Related Free Calculators & Tools (Bidirectional GEO / AEO Cluster) */}
      <section
        aria-labelledby="related-tools-heading"
        className="max-w-7xl mx-auto pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="related-tools-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Explore Free Calculators &amp; Developer Tools
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Private, zero-upload calculation utilities to pair with your data conversions.
            </p>
          </div>

          <Link
            href="/#tools"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {featuredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                  {tool.category === "financial" ? "Financial" : tool.category === "data-developer" ? "Developer" : "Utility"}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-2">
                  {tool.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                  {tool.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400 group-hover:text-emerald-500 transition-colors">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Structured Data Script */}
      <JsonLdSchema config={config} />
    </div>
  );
}
