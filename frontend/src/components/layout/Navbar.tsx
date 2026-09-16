"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Search,
  Calculator,
  Terminal,
  Layers,
} from "lucide-react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { getAllTools } from "@/lib/tool-registry";
import { ConverterConfig } from "@/types/registry";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import { SavedCalculationsDrawer } from "@/components/calculator/SavedCalculationsDrawer";

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
  const [activeMenuTab, setActiveMenuTab] = useState<"converters" | "calculators">("converters");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  const allTools = getAllTools();

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

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl"
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
                {/* Mega-Dropdown Menu */}
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
                      className="absolute left-0 mt-2 w-[720px] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      {/* Mega Menu Tabs Header */}
                      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setActiveMenuTab("converters")}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            activeMenuTab === "converters"
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                          <span>File Converters (15)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveMenuTab("calculators")}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            activeMenuTab === "calculators"
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <Calculator className="w-3.5 h-3.5 text-teal-500" />
                          <span>Calculators &amp; Tools ({allTools.length})</span>
                        </button>
                      </div>

                      {activeMenuTab === "converters" ? (
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
                                    className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                  >
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                        {label}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.2 rounded ml-2 whitespace-nowrap shrink-0">
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
                              <span>Data Engineering (DuckDB)</span>
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
                                    className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                  >
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                        {label}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.2 rounded ml-2 whitespace-nowrap shrink-0">
                                      {badge}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                          {/* Data & Dev Tools */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1.5 sticky top-0 bg-white dark:bg-zinc-900 py-1">
                              Data &amp; Developer ({allTools.filter((t) => t.category === "data-developer").length})
                            </span>
                            <div className="space-y-0.5">
                              {allTools
                                .filter((t) => t.category === "data-developer")
                                .map((tool) => (
                                  <Link
                                    key={tool.slug}
                                    href={`/tools/${tool.slug}`}
                                    onClick={() => setIsToolsOpen(false)}
                                    className="block px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate hover:text-emerald-600"
                                  >
                                    {tool.name}
                                  </Link>
                                ))}
                            </div>
                          </div>

                          {/* Financial Calculators */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block mb-1.5 sticky top-0 bg-white dark:bg-zinc-900 py-1">
                              Financial Math ({allTools.filter((t) => t.category === "financial").length})
                            </span>
                            <div className="space-y-0.5">
                              {allTools
                                .filter((t) => t.category === "financial")
                                .map((tool) => (
                                  <Link
                                    key={tool.slug}
                                    href={`/tools/${tool.slug}`}
                                    onClick={() => setIsToolsOpen(false)}
                                    className="block px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate hover:text-emerald-600"
                                  >
                                    {tool.name}
                                  </Link>
                                ))}
                            </div>
                          </div>

                          {/* Utility Calculators */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 block mb-1.5 sticky top-0 bg-white dark:bg-zinc-900 py-1">
                              Utility &amp; Images ({allTools.filter((t) => t.category === "utility").length})
                            </span>
                            <div className="space-y-0.5">
                              {allTools
                                .filter((t) => t.category === "utility")
                                .map((tool) => (
                                  <Link
                                    key={tool.slug}
                                    href={`/tools/${tool.slug}`}
                                    onClick={() => setIsToolsOpen(false)}
                                    className="block px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate hover:text-emerald-600"
                                  >
                                    {tool.name}
                                  </Link>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-zinc-100 dark:border-zinc-800 mt-3 pt-2.5 px-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          <span>100% In-browser • Zero cloud servers</span>
                        </div>
                        <Link
                          href="/tools"
                          onClick={() => setIsToolsOpen(false)}
                          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 text-xs"
                        >
                          View All Tools Hub ({allTools.length}) <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Link to Tools Hub */}
                <Link
                  href="/tools"
                  className="px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Calculators &amp; Tools
                </Link>

                {/* Direct Link to Blog */}
                <Link
                  href="/blog"
                  className="px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Blog
                </Link>
              </nav>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cmd+K Search Trigger Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search Converters and Calculators"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Search tools...</span>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  ⌘K
                </kbd>
              </button>

              {/* Saved Calculations History Drawer */}
              <SavedCalculationsDrawer />

              {/* PWA Install Prompt & Offline Badge */}
              <PwaInstallButton />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Free Tools Suite Button */}
              <Link
                href="/tools"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                aria-label="Free Calculators and Tools"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="font-bold text-white">Free Tools</span>
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
            className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 pt-4 pb-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Spreadsheets &amp; Docs</span>
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
                href="/tools"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Calculators &amp; Free Tools
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Blog &amp; Data Guides
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
