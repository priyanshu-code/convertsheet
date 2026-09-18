import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Lock,
  Code2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import type { ConverterConfig } from "@/types/registry";
import { getAllTools } from "@/lib/tool-registry";
import { ConverterCardSkeleton } from "@/components/converter/ConverterCardSkeleton";
import { AdBanner } from "@/components/layout";
import { ConverterGrid } from "@/components/home/ConverterGrid";
import { ToolGrid } from "@/components/home/ToolGrid";

const DynamicConverterCard = dynamic(
  () => import("@/components/converter/ConverterCard").then((mod) => mod.ConverterCard),
  {
    ssr: true,
    loading: () => <ConverterCardSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "ConvertSheet - Fast, Private Structured Data Converter",
  description:
    "Convert JSON, CSV, Excel & XML spreadsheets instantly in your browser. 100% private, zero server uploads for small files, and powerful developer APIs.",
  alternates: {
    canonical: "https://www.convertsheet.com",
  },
  openGraph: {
    title: "ConvertSheet - Fast, Private Structured Data Converter",
    description:
      "Convert JSON, CSV, Excel & XML spreadsheets instantly in your browser. 100% private, zero server uploads for small files.",
    url: "https://www.convertsheet.com",
    type: "website",
  },
};

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "100% Client-Side Privacy",
    description:
      "Small files are transformed directly in your web browser using WebAssembly. Your confidential financial data and records never touch a server.",
  },
  {
    icon: Zap,
    title: "Zero Queue Latency",
    description:
      "No waiting in backend worker queues. In-browser conversions execute in 50–200ms with instant one-click download triggers.",
  },
  {
    icon: Lock,
    title: "Zero Data Retention",
    description:
      "We never store, log, or sell your documents. For Pro server conversions, files are auto-purged from encrypted memory after 15 minutes.",
  },
  {
    icon: Code2,
    title: "Developer REST API",
    description:
      "Automate file ingestion pipelines in Python, Node.js, Zapier, and n8n with dedicated API keys, high throughput, and 99.9% uptime SLA.",
  },
];

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "ConvertSheet",
      url: "https://www.convertsheet.com",
      description:
        "Fast, private structured data conversion. Convert spreadsheets, JSON arrays, and XML feeds directly in your browser with zero server uploads.",
    },
    {
      "@type": "Organization",
      name: "ConvertSheet",
      url: "https://www.convertsheet.com",
      logo: "https://www.convertsheet.com/icon.png",
    },
  ],
};

export default function HomePage() {
  const defaultConverter = CONVERTER_REGISTRY["json-to-excel"];
  const allConverters = Object.values(CONVERTER_REGISTRY) as ConverterConfig[];
  const allTools = getAllTools();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16 sm:space-y-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Top Trust Badge */}
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>100% In-Browser Privacy • Zero Server Uploads</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.12]">
          Fast, Private Structured Data Converter
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Convert JSON, CSV, Excel &amp; XML instantly in your browser — 100% private, zero cost, and zero server uploads.
        </p>
      </div>

      {/* Hero Universal Converter Card - Above the fold */}
      <div className="max-w-4xl mx-auto">
        <DynamicConverterCard config={defaultConverter} />
      </div>

      {/* Leaderboard Ad Slot */}
      <div className="flex justify-center w-full my-6 sm:my-8">
        <AdBanner format="leaderboard" />
      </div>

      {/* Popular Converters Grid */}
      <section aria-labelledby="popular-tools-heading" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
            Conversion Suite
          </span>
          <h2
            id="popular-tools-heading"
            className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Popular Conversion Tools
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Dedicated landing pages optimized for high-traffic file format transformations.
          </p>
        </div>

        <ConverterGrid converters={allConverters} />
      </section>

      {/* Free Calculators & Online Tools Grid */}
      <section aria-labelledby="free-tools-heading" className="space-y-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
            Calculators &amp; Utilities
          </span>
          <h2
            id="free-tools-heading"
            className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Free Online Calculators &amp; Developer Tools
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            18 specialized financial, developer, and everyday math calculators executing 100% in your browser.
          </p>
        </div>

        <ToolGrid tools={allTools} />
      </section>

      {/* Value Propositions Section */}
      <section aria-labelledby="why-convertsheet-heading" className="space-y-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
            Why ConvertSheet?
          </span>
          <h2
            id="why-convertsheet-heading"
            className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Built for Extreme Speed &amp; Total Privacy
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Traditional online converters upload your spreadsheets to remote servers. ConvertSheet does the heavy lifting in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUE_PROPS.map((prop, idx) => {
            const Icon = prop.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {prop.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {prop.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Free Platform & Open Tools Suite Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-center max-w-5xl mx-auto space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Free • No Signups • Client-Side Privacy</span>
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Every Converter &amp; Calculator is Free Forever
        </h2>
        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          No credit cards, no monthly subscriptions, and no hidden file size limits. Run high-performance DuckDB transformations, financial projections, and developer formatting completely in your browser.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/#tools"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-colors"
          >
            <span>Explore Free Calculators</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/#converters"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors"
          >
            <span>Browse 15 File Converters</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero server data retention</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant client-side execution</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No account required</span>
          </span>
        </div>
      </section>

      {/* Horizontal Ad Banner */}
      <div className="flex justify-center w-full my-6">
        <AdBanner format="horizontal" />
      </div>
    </div>
  );
}
