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
  ShieldCheck,
} from "lucide-react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { getAllTools } from "@/lib/tool-registry";
import { ConverterConfig } from "@/types/registry";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import { SavedCalculationsDrawer } from "@/components/calculator/SavedCalculationsDrawer";
import { CurrencySelector } from "@/components/calculator/CurrencySelector";

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
  const pathname = usePathname();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<
    "converters" | "images" | "media-ai" | "calculators"
  >("converters");
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

  if (pathname?.startsWith("/embed")) {
    return null;
  }

  return (
    <>
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8 shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-zinc-400 rounded-xl shrink-0"
                aria-label="ConvertSheet Home"
              >
                <div className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Convert<span className="text-zinc-500 dark:text-zinc-400 font-medium">Sheet</span>
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
                      <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setActiveMenuTab("converters")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                            activeMenuTab === "converters"
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>File Converters</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveMenuTab("images")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                            activeMenuTab === "images"
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Image &amp; Photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveMenuTab("media-ai")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                            activeMenuTab === "media-ai"
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Audio, PDF &amp; AI</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveMenuTab("calculators")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                            activeMenuTab === "calculators"
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Calculators &amp; Dev</span>
                        </button>
                      </div>

                      {activeMenuTab === "converters" && (
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
                                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                                        {label}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.2 rounded ml-2 whitespace-nowrap shrink-0">
                                      {badge}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>

                          {/* Column 2: Data Engineering & Analytics */}
                          <div>
                            <div className="px-2 py-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 mb-1.5">
                              <span>Data Engineering (DuckDB)</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
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
                                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                                        {label}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.2 rounded ml-2 whitespace-nowrap shrink-0">
                                      {badge}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeMenuTab === "images" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                              Official Photos &amp; Exam Dimensions
                            </span>
                            <div className="space-y-1">
                              {[
                                { name: "Passport Photo Maker (3.5x4.5cm)", slug: "passport-photo-maker" },
                                { name: "White Background Passport Photo", slug: "white-background-passport-photo" },
                                { name: "Signature Resizer (140x60px)", slug: "signature-resizer" },
                                { name: "SSC Photo Resizer (20-50 KB)", slug: "ssc-photo-resizer" },
                                { name: "UPSC Photo Resizer (350x350px)", slug: "upsc-photo-resizer" },
                                { name: "PAN Card Photo Resizer", slug: "pan-card-photo-resizer" },
                              ].map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/tools/${item.slug}`}
                                  onClick={() => setIsToolsOpen(false)}
                                  className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                              Target KB &amp; AI Enhancement
                            </span>
                            <div className="space-y-1">
                              {[
                                { name: "Compress Image to 20KB", slug: "compress-image-to-20kb" },
                                { name: "Compress Image to 50KB", slug: "compress-image-to-50kb" },
                                { name: "Compress Image to 100KB", slug: "compress-image-to-100kb" },
                                { name: "Compress Image to 200KB", slug: "compress-image-to-200kb" },
                                { name: "Face Unblur (GFPGAN)", slug: "unblur-face" },
                                { name: "AI Photo Enhancer (4x Super-Res)", slug: "ai-photo-enhancer" },
                              ].map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/tools/${item.slug}`}
                                  onClick={() => setIsToolsOpen(false)}
                                  className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeMenuTab === "media-ai" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                              Voice &amp; Audio Processing
                            </span>
                            <div className="space-y-1">
                              {[
                                { name: "Speech to Text (Whisper)", slug: "speech-to-text" },
                                { name: "Text to Speech Audio Generator", slug: "text-to-speech" },
                                { name: "Audio Noise Reducer & Cleaner", slug: "audio-noise-reducer" },
                                { name: "Vocal Remover & Splitter", slug: "vocal-remover" },
                                { name: "Auto Subtitle Generator", slug: "auto-subtitle-generator" },
                              ].map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/tools/${item.slug}`}
                                  onClick={() => setIsToolsOpen(false)}
                                  className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                              PDF &amp; AI Text Tools
                            </span>
                            <div className="space-y-1">
                              {[
                                { name: "PDF to Clean Markdown & OCR", slug: "pdf-to-markdown" },
                                { name: "AI Content & Essay Detector", slug: "ai-content-detector" },
                                { name: "Receipt & Invoice OCR", slug: "receipt-ocr" },
                                { name: "PDF Merge Tool", slug: "pdf-merge" },
                                { name: "PDF Compressor", slug: "pdf-compressor" },
                              ].map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/tools/${item.slug}`}
                                  onClick={() => setIsToolsOpen(false)}
                                  className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeMenuTab === "calculators" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                              Financial Calculators
                            </span>
                            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                              {[
                                { name: "SIP Calculator", slug: "sip-calculator" },
                                { name: "EMI Calculator", slug: "emi-calculator" },
                                { name: "Mortgage Calculator", slug: "mortgage-calculator" },
                                { name: "Salary & Take-Home Calculator", slug: "salary-calculator" },
                                { name: "Compound Interest Calculator", slug: "compound-interest-calculator" },
                                { name: "Retirement Planner", slug: "retirement-calculator" },
                              ].map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/tools/${item.slug}`}
                                  onClick={() => setIsToolsOpen(false)}
                                  className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                              Developer &amp; Data Utilities
                            </span>
                            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                              {[
                                { name: "JSON Formatter & Validator", slug: "json-formatter-validator" },
                                { name: "Base64 Encoder & Decoder", slug: "base64-encoder-decoder" },
                                { name: "URL Encoder & Decoder", slug: "url-encoder-decoder" },
                                { name: "Hash Generator (SHA-256/MD5)", slug: "hash-generator" },
                                { name: "UUID Generator", slug: "uuid-generator" },
                                { name: "JWT Decoder", slug: "jwt-decoder" },
                              ].map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/tools/${item.slug}`}
                                  onClick={() => setIsToolsOpen(false)}
                                  className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
                                >
                                  {item.name}
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

                {/* Calculators & Tools Link */}
                <Link
                  href="/tools"
                  className="sr-only focus:not-sr-only px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Calculators & Tools
                </Link>

                {/* Direct Link to Blog */}
                <Link
                  href="/blog"
                  className="px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Blog
                </Link>

                {/* Reddit Community Link */}
                <a
                  href="https://www.reddit.com/r/convertsheet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm font-medium rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="ConvertSheet Reddit Community"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <span>Community</span>
                </a>
              </nav>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Cmd+K Search Trigger Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search Converters and Calculators"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Search tools...</span>
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-300 dark:border-zinc-700">
                  ⌘K
                </kbd>
              </button>

              {/* Currency & Region Selector */}
              <div className="hidden md:inline-block">
                <CurrencySelector />
              </div>

              {/* Saved Calculations History Drawer */}
              <div className="hidden sm:inline-block">
                <SavedCalculationsDrawer />
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Free Tools Suite Button */}
              <Link
                href="/tools"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400"
                aria-label="Free Calculators and Tools"
              >
                <Sparkles className="w-3.5 h-3.5 text-white dark:text-zinc-900" />
                <span className="font-bold">Free Tools</span>
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
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-xs font-semibold text-zinc-500">Market &amp; Currency</span>
                <CurrencySelector />
              </div>
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-xs font-semibold text-zinc-500">Saved Scenarios</span>
                <SavedCalculationsDrawer />
              </div>
              <div className="px-3 py-1">
                <PwaInstallButton />
              </div>
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
              <a
                href="https://www.reddit.com/r/convertsheet/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
                <span>Reddit Community (r/convertsheet)</span>
              </a>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
