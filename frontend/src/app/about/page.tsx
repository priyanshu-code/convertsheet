import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Laptop,
  Code2,
  Heart,
  ArrowRight,
  User,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { FOUNDER_AUTHOR } from "@/lib/blog-registry";

export const metadata: Metadata = {
  title: "About ConvertSheet - 100% Client-Side Privacy-First Tools",
  description:
    "Learn about ConvertSheet's mission to eliminate cloud data harvesting with in-browser WebAssembly data converters, developer utilities, and modern calculators.",
  alternates: {
    canonical: "https://www.convertsheet.com/about",
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ConvertSheet",
    url: "https://www.convertsheet.com",
    logo: "https://www.convertsheet.com/favicon.ico",
    description:
      "ConvertSheet is an in-browser WebAssembly data conversion suite, developer utility platform, and privacy-first calculation engine that processes sensitive spreadsheets, JSON, and financial records 100% locally.",
    founder: {
      "@type": "Person",
      name: FOUNDER_AUTHOR.name,
      jobTitle: FOUNDER_AUTHOR.role,
      url: "https://www.convertsheet.com/about",
      sameAs: [
        FOUNDER_AUTHOR.linkedInUrl,
        FOUNDER_AUTHOR.twitterUrl,
        FOUNDER_AUTHOR.githubUrl,
      ].filter(Boolean),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

        {/* Founder & Lead Engineer (E-E-A-T and Human Story) */}
        <section
          aria-labelledby="founder-heading"
          className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Founder &amp; Engineering Lead</span>
              </div>
              <h2
                id="founder-heading"
                className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
              >
                Built by Priyanshu Rawat
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Software Engineer • WebAssembly &amp; Distributed Systems
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {FOUNDER_AUTHOR.linkedInUrl && (
                <a
                  href={FOUNDER_AUTHOR.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:text-[#0A66C2] transition-colors"
                  aria-label="Priyanshu Rawat on LinkedIn"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-current text-[#0A66C2]"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.37 9.74V9.95H5.09v8.55h2.74z" />
                  </svg>
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}
              {FOUNDER_AUTHOR.githubUrl && (
                <a
                  href={FOUNDER_AUTHOR.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition-colors"
                  aria-label="Priyanshu Rawat on GitHub"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}
              {FOUNDER_AUTHOR.twitterUrl && (
                <a
                  href={FOUNDER_AUTHOR.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 transition-colors"
                  aria-label="Priyanshu Rawat on X"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>X</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              I started ConvertSheet out of pure frustration with modern web utilities. As a software engineer working with high-volume datasets, customer transaction logs, and internal accounting spreadsheets, I found it unacceptable that converting a <code>.json</code> or <code>.csv</code> file to Excel required uploading sensitive company data to an anonymous third-party server.
            </p>
            <p>
              With the maturity of <strong>WebAssembly (WASM)</strong>, browsers are now fast enough to execute native C++ databases and columnar query engines locally. By embedding DuckDB, SheetJS, and dedicated Web Workers into ConvertSheet, we created a suite of converters and financial engines that are mathematically rigorous, blisteringly fast, and completely confidential.
            </p>
          </div>
        </section>

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
                High-performance spreadsheet generation (<code>.xlsx</code>, <code>.csv</code>) and zero-upload PDF manipulation engines running in dedicated Web Workers.
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
    </>
  );
}
