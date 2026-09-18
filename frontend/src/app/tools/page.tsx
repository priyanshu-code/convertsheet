import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Calculator,
  Terminal,
  Layers,
  ArrowRight,
  FileSpreadsheet,
  Lock,
  Zap,
} from "lucide-react";
import { getAllTools } from "@/lib/tool-registry";
import { ToolsHubDirectory } from "@/components/tools/ToolsHubDirectory";

export const metadata: Metadata = {
  title: "Free Online Calculators & Developer Tools - 100% In-Browser | ConvertSheet",
  description:
    "Explore 50+ free, private, client-side tools and financial calculators. From mortgage amortization and retirement planners to JSON validators, Base64 tools, and PDF utilities.",
  keywords: [
    "online calculators",
    "free financial calculators",
    "developer tools online",
    "mortgage calculator excel export",
    "client-side calculators",
    "private pdf tools",
    "json formatter online",
    "convertsheet tools",
  ],
  alternates: {
    canonical: "https://www.convertsheet.com/tools",
  },
  openGraph: {
    title: "Free Online Calculators & Developer Tools - 100% In-Browser | ConvertSheet",
    description:
      "Directory of 50+ private client-side calculators, developer encoders, and PDF tools. Export schedules directly to Excel with zero server tracking.",
    url: "https://www.convertsheet.com/tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Calculators & Developer Tools | ConvertSheet",
    description:
      "Explore 50+ free, private, client-side tools and calculators with instant Excel exports.",
  },
};

export default function ToolsDirectoryPage() {
  const tools = getAllTools();

  const financialCount = tools.filter((t) => t.category === "financial").length;
  const devCount = tools.filter((t) => t.category === "data-developer").length;
  const utilityCount = tools.filter((t) => t.category === "utility").length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://www.convertsheet.com/tools#webpage",
        url: "https://www.convertsheet.com/tools",
        name: "ConvertSheet Online Calculators & Developer Tools Directory",
        description:
          "Complete directory of 50+ client-side calculators, data utilities, and document converters.",
        breadcrumb: {
          "@id": "https://www.convertsheet.com/tools#breadcrumb",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.convertsheet.com/tools#breadcrumb",
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
            name: "Tools Directory",
            item: "https://www.convertsheet.com/tools",
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "ConvertSheet Utility Tools Suite",
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          url: `https://www.convertsheet.com/tools/${tool.slug}`,
          description: tool.subtitle,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
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
            <li aria-hidden="true" className="text-zinc-400">
              /
            </li>
            <li
              className="font-medium text-zinc-800 dark:text-zinc-200"
              aria-current="page"
            >
              Tools Hub
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>50+ Client-Side Tools • 100% Private &amp; Free Forever</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Tools &amp; Calculators Directory
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            High-precision financial models, developer encoders, PDF utilities, and image tools.
            Every calculation runs entirely in your browser memory with zero server uploads and instant Excel exports.
          </p>
        </div>

        {/* Category Silo Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/tools/category/financial"
            className="group p-6 rounded-3xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-zinc-900/40 border border-emerald-200/60 dark:border-emerald-800/40 hover:border-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                {financialCount} Tools
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Financial Calculators
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Mortgage PITI &amp; amortization schedules, auto financing, retirement 401(k) accumulation, inflation, and compound interest models.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform pt-1">
              Explore Category <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/tools/category/data-developer"
            className="group p-6 rounded-3xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-zinc-900/40 border border-blue-200/60 dark:border-blue-800/40 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
                {devCount} Tools
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Data &amp; Developer Tools
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              JSON formatters, Base64 encoders, JWT inspectors, UUID generators, Unix timestamp converters, and byte storage calculators.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform pt-1">
              Explore Category <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/tools/category/utility"
            className="group p-6 rounded-3xl bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-purple-950/20 dark:to-zinc-900/40 border border-purple-200/60 dark:border-purple-800/40 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950 px-2.5 py-0.5 rounded-full">
                {utilityCount} Tools
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Daily Utilities &amp; PDF
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              PDF merge, split, page numbering, table extraction, image conversions (WebP, PNG, SVG), age calculation, and unit converters.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform pt-1">
              Explore Category <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* Live Filterable Directory Grid */}
        <ToolsHubDirectory tools={tools} />

        {/* E-E-A-T Architecture Context */}
        <section className="mt-16 p-8 sm:p-10 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Zero Server Uploads • Client-Side Architecture
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Why ConvertSheet Tools Are Different
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>100% In-Browser Privacy</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Unlike legacy calculator hubs that record your financial inputs or upload your PDF files to remote cloud servers, ConvertSheet executes all logic locally in your browser memory.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>One-Click Excel (.xlsx) Export</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Powered by SheetJS, our financial calculators allow you to download complete month-by-month and year-by-year amortization schedules directly into Microsoft Excel or Google Sheets.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>Zero Latency &amp; No Paywalls</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Every calculation recalculates instantly on keystroke with zero network round trips. Free forever with no account creation or credit card required.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
