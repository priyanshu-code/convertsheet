import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Zap, Laptop, Code2, Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About ConvertSheet - 100% Client-Side Privacy-First Tools",
  description:
    "Learn about ConvertSheet's mission to eliminate cloud data harvesting with in-browser WebAssembly data converters, developer utilities, and modern calculators.",
  alternates: {
    canonical: "https://convertsheet.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <Heart className="w-4 h-4 text-emerald-500" />
          <span>Our Story &amp; Mission</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          About ConvertSheet
        </h1>
        <p className="max-w-2xl mx-auto text-base text-zinc-600 dark:text-zinc-400">
          Empowering analysts, developers, and everyday users with fast, professional data tools that run <strong className="text-zinc-900 dark:text-zinc-100">100% locally on your device</strong>.
        </p>
      </div>

      {/* The Problem & Our Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
            ✕
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            The Status Quo is Broken
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Most online file converters upload your confidential spreadsheets, tax forms, and company datasets to unknown third-party cloud servers. Your files sit in unencrypted buckets, get logged, and pose major compliance risks under GDPR, HIPAA, and CCPA.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            The ConvertSheet Solution
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            ConvertSheet leverages modern browser capabilities — <strong>WebAssembly (WASM), Web Workers, and HTML5 Blobs</strong> — to execute SQL engines and file compilers directly on your machine. Your data never touches a server.
          </p>
        </div>
      </div>

      {/* Architecture & Tech Stack */}
      <section className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Under the Hood: How We Build
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Engineered with industry-standard open source libraries
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              <Laptop className="w-4 h-4 text-emerald-500" />
              <span>DuckDB-Wasm &amp; Apache Arrow</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Provides analytical columnar database queries, Parquet parsing, and NDJSON streaming right inside your browser memory without memory leaks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>SheetJS &amp; PDF-Lib</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              High-performance spreadsheet generation (`.xlsx`, `.csv`) and zero-upload PDF manipulation engines running in dedicated Web Workers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>Next.js 14 &amp; Tailwind CSS</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Fully static HTML pre-rendering with instantaneous client-side navigation, mobile responsiveness, and dark mode theming.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>PWA Offline-Ready</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Installable as a desktop or mobile application with service worker asset caching, enabling 100% offline usage on flights or remote networks.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/privacy"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Read our Privacy Architecture &rarr;
        </Link>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
        >
          <span>Explore All Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
