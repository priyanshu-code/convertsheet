import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Cpu, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - 100% In-Browser Zero Retention",
  description:
    "ConvertSheet's privacy policy: Learn how our client-side architecture processes files 100% in your browser with zero server uploads, storage, or retention.",
  alternates: {
    canonical: "https://www.convertsheet.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy by Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Privacy Policy
        </h1>
        <p className="max-w-2xl mx-auto text-base text-zinc-600 dark:text-zinc-400">
          ConvertSheet is built on a fundamental principle:{" "}
          <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
            your data belongs to you.
          </strong>{" "}
          We believe the best privacy guarantee is not a promise, but technical impossibility.
        </p>
        <p className="text-xs text-zinc-400">Last updated: September 2026</p>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            100% In-Browser
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            All spreadsheet conversions, JSON parsers, PDF splits, and financial math run locally in your browser sandbox using WebAssembly and Web Workers.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Zero Server Uploads
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Your files never leave your computer or travel over our servers. There is no remote database, temporary file storage, or file cache.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No Data Harvesting
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We do not sell, inspect, log, or mine your confidential financial numbers, employee rosters, or proprietary customer files.
          </p>
        </div>
      </div>

      {/* Anchor Section 1: Client-Side Processing */}
      <section
        id="client-side"
        className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-4 scroll-mt-24"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          1. How Client-Side Processing Works
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Traditional file converter websites require you to upload your sensitive CSV, Excel, or PDF documents to a remote cloud server. Once on their server, your files are processed by third-party scripts, stored in temporary buckets, and often retained for days.
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          ConvertSheet operates differently. When you drag and drop a file into ConvertSheet:
        </p>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>
              Your browser reads the file locally into device RAM using the standard HTML5 File and FileReader API.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>
              Compiled WebAssembly binaries (such as DuckDB-Wasm and Apache Arrow) execute SQL queries and transformations entirely on your machine.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>
              Output files (e.g. `.xlsx`, `.csv`, `.parquet`, `.pdf`) are compiled locally and downloaded directly to your hard drive via Blob URLs.
            </span>
          </li>
        </ul>
      </section>

      {/* Anchor Section 2: Zero Retention */}
      <section
        id="zero-retention"
        className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-4 scroll-mt-24"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          2. Zero Server Data Retention
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Because files are never transmitted across the network to ConvertSheet servers, we cannot retain, archive, inspect, or accidentally leak your documents. Even if our web servers were compromised, an attacker would find zero customer files, database records, or spreadsheet dumps.
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          When you close the browser tab or refresh the page, all loaded memory and temporary Blob representations in your browser are automatically purged by your operating system.
        </p>
      </section>

      {/* Additional Privacy Sections */}
      <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-400">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            3. Analytics &amp; Cookies
          </h2>
          <p className="leading-relaxed">
            ConvertSheet uses minimal, privacy-friendly analytics to track high-level traffic metrics (such as page views, visitor country, and device type). We do not record user session inputs, file names, column headers, cell values, or personal identifiers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            4. Local Storage &amp; Preferences
          </h2>
          <p className="leading-relaxed">
            We store non-sensitive UI preferences (such as your chosen light or dark theme) in your browser&apos;s local storage (`localStorage`). This data never leaves your browser and can be cleared at any time in your browser settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            5. Contact &amp; Inquiries
          </h2>
          <p className="leading-relaxed">
            If you have questions or security inquiries regarding ConvertSheet&apos;s architectural design or privacy practices, please contact us at{" "}
            <span dangerouslySetInnerHTML={{
              __html: '<!--email_off--><a href="mailto:privacy@convertsheet.com" class="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">privacy@convertsheet.com</a><!--/email_off-->'
            }} />
            .
          </p>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Ready to convert data with complete privacy?
        </span>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
        >
          <span>Explore 41+ Free In-Browser Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
