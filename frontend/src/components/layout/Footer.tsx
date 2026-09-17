import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { ConverterConfig } from "@/types/registry";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const converters = (
    Object.values(CONVERTER_REGISTRY) as ConverterConfig[]
  ).map((c) => ({
    name: `${c.sourceFormat} to ${c.targetFormat}`,
    href: `/convert/${c.slug}`,
    badge: c.badge,
  }));

  const toolsLinks = [
    { name: "Tools Directory Hub", href: "/tools" },
    { name: "Hourly to Salary", href: "/tools/hourly-to-salary-calculator" },
    { name: "Annual to Hourly", href: "/tools/annual-to-hourly-calculator" },
    { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
    { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
    { name: "SIP Calculator", href: "/tools/sip-calculator" },
    { name: "EMI Calculator", href: "/tools/emi-calculator" },
    { name: "JSON Formatter", href: "/tools/json-formatter-validator" },
    { name: "Base64 Encoder", href: "/tools/base64-encoder-decoder" },
  ];

  const privacyLinks = [
    { name: "Engineering Blog", href: "/blog" },
    { name: "About Us", href: "/about" },
    { name: "100% Client-Side Processing", href: "/privacy#client-side" },
    { name: "Zero Server Data Retention", href: "/privacy#zero-retention" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 transition-colors">
      {/* Trust Badge Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Bank-Grade In-Browser Privacy</span>
            </div>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Zero File Uploads for Small Files</span>
            </div>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Fast &amp; Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              aria-label="ConvertSheet Home"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Convert<span className="text-emerald-600 dark:text-emerald-400">Sheet</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              Fast, secure, and private structured data conversion. Convert
              spreadsheets, JSON arrays, and XML feeds directly in your browser
              without sensitive data touching external cloud servers.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Client-side WebAssembly &amp; Worker Engine</span>
              </div>
              <div>
                <a
                  href="https://www.reddit.com/r/convertsheet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/40 font-semibold transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <span>Join r/convertsheet</span>
                </a>
              </div>
            </div>
          </div>

          {/* Converters Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
              Converters
            </h3>
            <ul className="space-y-2.5">
              {converters.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Calculators & Tools Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
              Calculators &amp; Tools
            </h3>
            <ul className="space-y-2.5">
              {toolsLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy & Security Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
              Privacy &amp; Security
            </h3>
            <ul className="space-y-2.5">
              {privacyLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar / Copyright */}
        <div className="border-t border-zinc-200 dark:border-zinc-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <p>© {currentYear} ConvertSheet (convertsheet.com). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for developers, analysts, and privacy-conscious teams.
          </p>
        </div>
      </div>
    </footer>
  );
}
