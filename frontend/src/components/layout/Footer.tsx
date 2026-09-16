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
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Client-side WebAssembly &amp; Worker Engine</span>
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
