"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { ConverterConfig } from "@/types/registry";
import { ThemeToggle } from "./ThemeToggle";

const CONVERTER_LIST = Object.values(CONVERTER_REGISTRY) as ConverterConfig[];
const SPREADSHEET_CONVERTERS = CONVERTER_LIST.filter(
  (c) => c.category === "spreadsheets" || !c.category
);
const DATA_ENG_CONVERTERS = CONVERTER_LIST.filter(
  (c) => c.category === "data-engineering"
);

function getFormatBadge(c: ConverterConfig): string {
  if (c.slug === "excel-to-json") return "XLSX → JSON";
  if (c.slug === "excel-to-csv") return "XLSX → CSV";
  if (c.slug === "tally-xml-to-excel") return "Tally XML → XLSX";
  const src = c.sourceFormat.toUpperCase();
  const tgt = c.targetExtension.replace(".", "").toUpperCase();
  return `${src} → ${tgt}`;
}

function getConverterLabel(slug: string): string {
  const config = CONVERTER_REGISTRY[slug as keyof typeof CONVERTER_REGISTRY];
  if (config) {
    return `${config.sourceFormat} to ${config.targetFormat}`;
  }
  return slug;
}

export function Navbar() {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close tools dropdown on outside click or Escape
  useEffect(() => {
    if (!isToolsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isToolsOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
              aria-label="ConvertSheet Home"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Convert<span className="text-emerald-600 dark:text-emerald-400">Sheet</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Tools Dropdown */}
              <div
                className="relative"
                ref={toolsRef}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsToolsOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  aria-expanded={isToolsOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isToolsOpen
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>Tools</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isToolsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isToolsOpen && (
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute left-0 mt-2 w-[680px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {/* Column 1: Spreadsheets & Documents */}
                      <div>
                        <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 mb-1.5">
                          <span>Spreadsheets &amp; Docs</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                            {SPREADSHEET_CONVERTERS.length}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {SPREADSHEET_CONVERTERS.map((converter) => {
                            const badge = getFormatBadge(converter);
                            const label = getConverterLabel(converter.slug);
                            return (
                              <Link
                                key={converter.slug}
                                href={`/convert/${converter.slug}`}
                                role="menuitem"
                                onClick={() => setIsToolsOpen(false)}
                                className="group flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                    {label}
                                  </span>
                                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {converter.badge ? (
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        {converter.badge} •{" "}
                                      </span>
                                    ) : null}
                                    {converter.isClientSide
                                      ? "100% In-Browser"
                                      : "Cloud Table OCR"}
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded ml-2 whitespace-nowrap shrink-0">
                                  {badge}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column 2: Data Engineering & Analytics */}
                      <div>
                        <div className="px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 mb-1.5">
                          <span>Data Engineering</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                            {DATA_ENG_CONVERTERS.length}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {DATA_ENG_CONVERTERS.map((converter) => {
                            const badge = getFormatBadge(converter);
                            const label = getConverterLabel(converter.slug);
                            return (
                              <Link
                                key={converter.slug}
                                href={`/convert/${converter.slug}`}
                                role="menuitem"
                                onClick={() => setIsToolsOpen(false)}
                                className="group flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                    {label}
                                  </span>
                                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {converter.badge ? (
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        {converter.badge} •{" "}
                                      </span>
                                    ) : null}
                                    DuckDB-Wasm
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded ml-2 whitespace-nowrap shrink-0">
                                  {badge}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 mt-3 pt-2 px-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span>Zero server upload • Local DuckDB &amp; Worker engine</span>
                      </div>
                      <Link
                        href="/#converters"
                        onClick={() => setIsToolsOpen(false)}
                        className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 text-xs"
                      >
                        All 15 Tools <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* API Link */}
              <Link
                href="/pricing#api"
                className="px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                API
              </Link>

              {/* Pricing Link */}
              <Link
                href="/pricing"
                className="px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Pricing
              </Link>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Pro Upgrade Button */}
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
              aria-label="Upgrade to ConvertSheet Pro"
            >
              <span>👑</span>
              <span>Pro</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-200 hidden sm:inline" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-3 pb-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150"
        >
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Spreadsheets &amp; Documents</span>
                <span className="font-mono text-[10px]">{SPREADSHEET_CONVERTERS.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {SPREADSHEET_CONVERTERS.map((converter) => {
                  const badge = getFormatBadge(converter);
                  const label = getConverterLabel(converter.slug);
                  return (
                    <Link
                      key={converter.slug}
                      href={`/convert/${converter.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>{label}</span>
                      <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                        {badge}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Data Engineering (DuckDB)</span>
                <span className="font-mono text-[10px]">{DATA_ENG_CONVERTERS.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {DATA_ENG_CONVERTERS.map((converter) => {
                  const badge = getFormatBadge(converter);
                  const label = getConverterLabel(converter.slug);
                  return (
                    <Link
                      key={converter.slug}
                      href={`/convert/${converter.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>{label}</span>
                      <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                        {badge}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-2">
            <Link
              href="/pricing#api"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Developer API
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Pricing Plans
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
            >
              <span>👑</span>
              <span>Upgrade to Pro</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
