import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Image as ImageIcon,
  FileText,
  Calculator,
  Code2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface EcosystemCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  pills: { label: string; href: string }[];
  primaryHref: string;
}

const ECOSYSTEM_CATEGORIES: EcosystemCategory[] = [
  {
    id: "ai-vision",
    title: "AI Vision & Photo Enhancement",
    subtitle: "High-Performance Neural Media",
    description: "Restore degraded portraits, remove room backgrounds, and upscale low-res photos to 4K.",
    icon: Sparkles,
    badge: "New Neural Suite",
    primaryHref: "/tools/unblur-face",
    pills: [
      { label: "Unblur Face", href: "/tools/unblur-face" },
      { label: "White BG Passport", href: "/tools/white-background-passport-photo" },
      { label: "4x AI Enhancer", href: "/tools/ai-photo-enhancer" },
      { label: "Speech to Text", href: "/tools/speech-to-text" },
      { label: "Text to Speech", href: "/tools/text-to-speech" },
      { label: "AI Content Detector", href: "/tools/ai-content-detector" },
      { label: "Audio Noise Reducer", href: "/tools/audio-noise-reducer" },
    ],
  },
  {
    id: "image-tools",
    title: "Image & Target-KB Tools",
    subtitle: "Exact Constraint Optimization",
    description: "Compress images to exact KB limits (20KB, 50KB, 100KB) for government forms and visa uploads.",
    icon: ImageIcon,
    badge: "Most Used",
    primaryHref: "/tools/image-resizer",
    pills: [
      { label: "Compress Image", href: "/tools/compress-image" },
      { label: "Image Resizer", href: "/tools/image-resizer" },
      { label: "WebP to PNG", href: "/tools/webp-to-png" },
      { label: "SVG to PNG", href: "/tools/svg-to-png" },
    ],
  },
  {
    id: "pdf-tools",
    title: "PDF & Document Processing",
    subtitle: "Fast, In-Browser Document Suite",
    description: "Compress PDFs to exact target sizes, merge, split, watermark, and extract tables with zero retention.",
    icon: FileText,
    primaryHref: "/tools/compress-pdf",
    pills: [
      { label: "PDF to Markdown", href: "/tools/pdf-to-markdown" },
      { label: "Compress PDF", href: "/tools/compress-pdf" },
      { label: "Merge PDF", href: "/tools/merge-pdf" },
      { label: "PDF Table Extractor", href: "/tools/pdf-table-extractor" },
    ],
  },
  {
    id: "spreadsheet-converters",
    title: "Spreadsheet & Data Converters",
    subtitle: "Zero-Server DuckDB Engine",
    description: "Convert JSON, Excel, CSV, Parquet, and SQLite at up to 50,000 rows/sec directly in browser memory.",
    icon: FileSpreadsheet,
    primaryHref: "/convert/json-to-excel",
    pills: [
      { label: "JSON to Excel", href: "/convert/json-to-excel" },
      { label: "CSV to Excel", href: "/convert/csv-to-excel" },
      { label: "PDF to Excel", href: "/convert/pdf-to-excel" },
      { label: "SQLite to Excel", href: "/convert/sqlite-to-excel" },
    ],
  },
  {
    id: "financial-calculators",
    title: "Financial & Mortgage Planning",
    subtitle: "Institutional-Grade Calculators",
    description: "Plan loan amortizations, calculate true hourly 1099 rates, and project retirement wealth.",
    icon: Calculator,
    primaryHref: "/tools/mortgage-calculator",
    pills: [
      { label: "Mortgage", href: "/tools/mortgage-calculator" },
      { label: "Salary Paycheck", href: "/tools/salary-calculator" },
      { label: "Compound Interest", href: "/tools/compound-interest-calculator" },
      { label: "EMI Calculator", href: "/tools/emi-calculator" },
    ],
  },
  {
    id: "developer-utilities",
    title: "Developer & Data Utilities",
    subtitle: "Everyday Engineering Workspaces",
    description: "Format minified JSON, generate Base64 strings, analyze JWTs, and diff large data files.",
    icon: Code2,
    primaryHref: "/tools/json-formatter-validator",
    pills: [
      { label: "JSON Formatter", href: "/tools/json-formatter-validator" },
      { label: "Base64 Tool", href: "/tools/base64-encoder-decoder" },
      { label: "SQL Query Studio", href: "/tools/sql-query-studio" },
      { label: "Sheet Diff", href: "/tools/sheet-diff-checker" },
    ],
  },
];

export function ModularEcosystemGrid() {
  return (
    <section aria-labelledby="ecosystem-heading" className="space-y-6 sm:space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>All-In-One Private Tooling Ecosystem</span>
        </div>
        <h2
          id="ecosystem-heading"
          className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Explore Tools by Category
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          From AI face restoration and passport photo formatting to instant client-side spreadsheet conversions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {ECOSYSTEM_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:shadow-xl dark:hover:shadow-emerald-950/20 transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center text-zinc-900 dark:text-white group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  {cat.badge && (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      {cat.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {cat.title}
                  </h3>
                  <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {cat.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Sub-Tool Quick Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.pills.map((pill) => (
                    <Link
                      key={pill.label}
                      href={pill.href}
                      className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 border border-zinc-200/80 dark:border-zinc-700/60 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {pill.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom Explore Link */}
              <div className="pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                <Link
                  href={cat.primaryHref}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                >
                  <span>Explore category</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
