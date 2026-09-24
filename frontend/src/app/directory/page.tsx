import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Calculator,
  Terminal,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";
import { getAllTools } from "@/lib/tool-registry";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import type { ConverterConfig } from "@/types/registry";
import {
  getAllProgrammaticPresets,
  getProgrammaticPresetsByTool,
} from "@/lib/programmatic-presets";

export const metadata: Metadata = {
  title: "Complete Directory of Calculators, Converters & Tools | ConvertSheet",
  description:
    "Comprehensive master index of 50+ free client-side calculators, 20+ file converters, and 120+ pre-calculated scenarios. 100% private in-browser computation with zero server uploads.",
  keywords: [
    "convertsheet directory",
    "online calculators directory",
    "free financial calculators index",
    "mortgage calculator presets",
    "client-side converters list",
    "developer utilities directory",
    "html sitemap tools",
  ],
  alternates: {
    canonical: "https://www.convertsheet.com/directory",
  },
  openGraph: {
    title: "Complete Directory of Calculators, Converters & Tools | ConvertSheet",
    description:
      "Explore all 50+ client-side tools, 20+ converters, and 120+ pre-calculated financial scenarios. 100% private in-browser computation.",
    url: "https://www.convertsheet.com/directory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Complete Directory of Calculators & Tools | ConvertSheet",
    description:
      "Comprehensive directory of 190+ private calculators, tools, and programmatic calculation presets.",
  },
};

export default function DirectoryPage() {
  const tools = getAllTools();
  const converters = Object.values(CONVERTER_REGISTRY) as ConverterConfig[];
  const allPresets = getAllProgrammaticPresets();

  const financialTools = tools.filter((t) => t.category === "financial");
  const dataDevTools = tools.filter((t) => t.category === "data-developer");
  const utilityTools = tools.filter((t) => t.category === "utility");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://www.convertsheet.com/directory#webpage",
        url: "https://www.convertsheet.com/directory",
        name: "ConvertSheet Complete Tools & Calculators Master Directory",
        description:
          "Comprehensive directory index of all client-side tools, financial calculators, file converters, and pre-calculated scenarios.",
        breadcrumb: {
          "@id": "https://www.convertsheet.com/directory#breadcrumb",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.convertsheet.com/directory#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.convertsheet.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Complete Directory",
            item: "https://www.convertsheet.com/directory",
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "ConvertSheet Complete Index",
        numberOfItems: tools.length + converters.length + allPresets.length,
        itemListElement: [
          ...tools.map((t, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: t.name,
            url: `https://www.convertsheet.com/tools/${t.slug}`,
            description: t.subtitle,
          })),
          ...converters.map((c, idx) => ({
            "@type": "ListItem",
            position: tools.length + idx + 1,
            name: `${c.sourceFormat} to ${c.targetFormat} Converter`,
            url: `https://www.convertsheet.com/convert/${c.slug}`,
            description: `Convert ${c.sourceFormat} to ${c.targetFormat} privately in browser`,
          })),
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Breadcrumb Navigation */}
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
            <li className="font-medium text-zinc-800 dark:text-zinc-200" aria-current="page">
              Complete Directory
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>100% Client-Side • 190+ Free Utilities &amp; Scenarios</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Complete Tools &amp; Calculators Master Directory
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The full index of ConvertSheet&apos;s private financial calculators, developer encoders, PDF utilities, and spreadsheet converters. Every tool runs 100% in your browser with zero server data retention.
          </p>

          {/* Anchor Navigation Jump Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <a
              href="#financial-tools"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Financial Calculators ({financialTools.length})</span>
            </a>
            <a
              href="#data-developer-tools"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Data &amp; Developer ({dataDevTools.length})</span>
            </a>
            <a
              href="#utility-tools"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Document &amp; Utility ({utilityTools.length})</span>
            </a>
            <a
              href="#file-converters"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>File Converters ({converters.length})</span>
            </a>
          </div>
        </div>

        {/* Section 1: Financial Calculators & Nested Presets */}
        <section
          id="financial-tools"
          aria-labelledby="financial-heading"
          className="space-y-6 pt-4 scroll-mt-20"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="financial-heading"
                  className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight"
                >
                  Financial Calculators &amp; Presets
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Loan amortization schedules, tax models, retirement planners, and common calculation scenarios.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financialTools.map((tool) => {
              const presets = getProgrammaticPresetsByTool(tool.slug);

              return (
                <div
                  key={tool.slug}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group inline-flex items-center gap-1.5 text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      <span>{tool.name}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {tool.subtitle}
                    </p>
                  </div>

                  {presets.length > 0 && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                      <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">
                        Popular Scenarios ({presets.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {presets.map((p) => (
                          <Link
                            key={p.presetSlug}
                            href={`/tools/${tool.slug}/${p.presetSlug}`}
                            className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-zinc-50 hover:bg-emerald-50 dark:bg-zinc-800/80 dark:hover:bg-emerald-950/60 text-zinc-700 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-300 border border-zinc-200/80 hover:border-emerald-200 dark:border-zinc-700 dark:hover:border-emerald-800 transition-all font-medium"
                          >
                            <span>{p.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Data & Developer Utilities */}
        <section
          id="data-developer-tools"
          aria-labelledby="data-heading"
          className="space-y-6 pt-4 scroll-mt-20"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="data-heading"
                  className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight"
                >
                  Data &amp; Developer Utilities
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  JSON validators, Base64 converters, cryptographic hash tools, and SQL query sandboxes.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dataDevTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-teal-500/50 hover:bg-teal-50/10 dark:hover:bg-teal-950/10 transition-all group flex flex-col justify-between space-y-2 shadow-xs"
              >
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                    {tool.subtitle}
                  </p>
                </div>
                <div className="flex items-center text-xs text-zinc-400 group-hover:text-teal-500 transition-colors pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Open utility</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3: Document & Utility Tools */}
        <section
          id="utility-tools"
          aria-labelledby="utility-heading"
          className="space-y-6 pt-4 scroll-mt-20"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="utility-heading"
                  className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight"
                >
                  Document &amp; Daily Utilities
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  In-browser PDF compression, image optimization, unit converters, and timestamp calculators.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {utilityTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-blue-500/50 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-all group flex flex-col justify-between space-y-2 shadow-xs"
              >
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                    {tool.subtitle}
                  </p>
                </div>
                <div className="flex items-center text-xs text-zinc-400 group-hover:text-blue-500 transition-colors pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Open utility</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 4: Client-Side File Converters */}
        <section
          id="file-converters"
          aria-labelledby="converters-heading"
          className="space-y-6 pt-4 scroll-mt-20"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="converters-heading"
                  className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight"
                >
                  Client-Side File Converters
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Transform spreadsheet formats, JSON arrays, and XML feeds with zero server uploads.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {converters.map((c) => (
              <Link
                key={c.slug}
                href={`/convert/${c.slug}`}
                className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all group flex items-center justify-between shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    File Converter
                  </span>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {c.sourceFormat} to {c.targetFormat}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
