import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - Fair, Open Usage Guidelines",
  description:
    "ConvertSheet terms of service: Understand our usage terms, disclaimers for financial calculations, and commitment to open, privacy-first software.",
  alternates: {
    canonical: "https://convertsheet.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <FileText className="w-4 h-4" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Terms of Service
        </h1>
        <p className="max-w-2xl mx-auto text-base text-zinc-600 dark:text-zinc-400">
          By accessing or using ConvertSheet, you agree to these clear and transparent terms.
        </p>
        <p className="text-xs text-zinc-400">Last updated: September 2026</p>
      </div>

      {/* Main Sections */}
      <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-400">
        <section className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>1. Free and Open Use</span>
          </h2>
          <p className="leading-relaxed">
            ConvertSheet grants you a non-exclusive, worldwide, royalty-free license to use all file converters, developer utilities, and calculators for personal, educational, or commercial purposes. There are no mandatory subscriptions, hidden paywalls, or artificial file limits.
          </p>
        </section>

        <section className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-emerald-500" />
            <span>2. Financial Calculators &amp; Informational Disclaimer</span>
          </h2>
          <p className="leading-relaxed">
            ConvertSheet provides mathematical modeling tools (such as mortgage calculators, retirement projections, compound interest models, and loan amortizations) solely for educational and self-directed financial estimation purposes.
          </p>
          <p className="leading-relaxed font-medium text-zinc-700 dark:text-zinc-300">
            ConvertSheet is not an investment advisor, mortgage broker, or CPA firm. Mathematical models are based on standard financial algorithms, but real-world outcomes will differ due to shifting interest rates, taxes, inflation variances, and lender fees. Always consult a certified financial planner or tax professional before making major life decisions.
          </p>
        </section>

        <section className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>3. Client-Side Processing &amp; User Responsibility</span>
          </h2>
          <p className="leading-relaxed">
            Because all transformations happen directly inside your web browser sandbox using your machine&apos;s CPU and RAM, you are responsible for maintaining backups of your source files before executing destructive file conversions or batch processing.
          </p>
        </section>

        <section className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>4. Limitation of Liability</span>
          </h2>
          <p className="leading-relaxed">
            ConvertSheet and its maintainers provide the software &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, whether express or implied. Under no circumstances shall ConvertSheet be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our tools.
          </p>
        </section>

        <section className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>5. Changes to Terms</span>
          </h2>
          <p className="leading-relaxed">
            We may periodically update these terms to reflect new features or regulatory obligations. Continued use of ConvertSheet following any updates constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/privacy"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          View Privacy Policy &rarr;
        </Link>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
        >
          <span>Return to Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
