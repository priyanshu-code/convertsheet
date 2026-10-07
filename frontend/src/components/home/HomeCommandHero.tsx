"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  FileSpreadsheet,
  Calculator,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  FileCode,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import type { ConverterConfig } from "@/types/registry";
import { getAllTools } from "@/lib/tool-registry";
import { ConverterCardSkeleton } from "@/components/converter/ConverterCardSkeleton";
import { HomeCalculatorSpotlight } from "./HomeCalculatorSpotlight";

const DynamicConverterCard = dynamic(
  () => import("@/components/converter/ConverterCard").then((mod) => mod.ConverterCard),
  {
    ssr: true,
    loading: () => <ConverterCardSkeleton />,
  }
);

const POPULAR_PRESETS: { label: string; slug: string }[] = [
  { label: "JSON to Excel", slug: "json-to-excel" },
  { label: "CSV to Excel", slug: "csv-to-excel" },
  { label: "Parquet to CSV", slug: "parquet-to-csv" },
  { label: "XML to Excel", slug: "xml-to-excel" },
  { label: "Excel to JSON", slug: "excel-to-json" },
];

export interface HomeCommandHeroProps {
  defaultConverter?: ConverterConfig;
}

export function HomeCommandHero({
  defaultConverter = CONVERTER_REGISTRY["json-to-excel"],
}: HomeCommandHeroProps) {
  const [mode, setMode] = useState<"converter" | "calculator">("converter");
  const [activeConverter, setActiveConverter] = useState<ConverterConfig>(defaultConverter);
  const [searchQuery, setSearchQuery] = useState("");

  const allTools = useMemo(() => getAllTools(), []);
  const allConverters = useMemo(() => Object.values(CONVERTER_REGISTRY), []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matchedConverters = allConverters
      .filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.sourceFormat?.toLowerCase().includes(q) ||
          c.targetFormat?.toLowerCase().includes(q) ||
          c.subtitle?.toLowerCase().includes(q) ||
          c.metaDescription?.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((c) => ({
        type: "converter" as const,
        title: c.title,
        href: `/convert/${c.sourceFormat.toLowerCase()}-to-${c.targetFormat.toLowerCase()}`,
        subtitle: `${c.sourceFormat} → ${c.targetFormat} converter`,
        slug: `${c.sourceFormat.toLowerCase()}-to-${c.targetFormat.toLowerCase()}`,
        config: c,
      }));

    const matchedTools = allTools
      .filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.title?.toLowerCase().includes(q) ||
          t.subtitle?.toLowerCase().includes(q) ||
          t.metaDescription?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((t) => ({
        type: "tool" as const,
        title: t.title || t.name,
        href: `/tools/${t.slug}`,
        subtitle: t.category,
        slug: t.slug,
        config: null,
      }));

    return [...matchedConverters, ...matchedTools].slice(0, 6);
  }, [searchQuery, allConverters, allTools]);

  const handleSelectPreset = (slug: string) => {
    const found = (CONVERTER_REGISTRY as Record<string, ConverterConfig>)[slug];
    if (found) {
      setActiveConverter(found);
      setMode("converter");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Product Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-3 pt-2 sm:pt-4">
        {/* Top Trust Badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>100% In-Browser Privacy • Zero Server Uploads</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-sm sm:text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 my-1">
          Fast, Private Structured Data Converter
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Transform nested JSON, massive CSVs, and Excel spreadsheets directly in your browser memory via DuckDB WASM — 100% free, zero lag, and zero cloud uploads.
        </p>

        {/* Product Trust Highlights Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            Zero Server Uploads
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            DuckDB-WASM Engine
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            100% Free &amp; Open Utilities
          </span>
        </div>
      </div>

      {/* Hero Interactive Command Controller */}
      <div className="w-full max-w-5xl mx-auto space-y-3">
        {/* Dual Mode Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1.5 sm:p-2 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs">
          {/* Segmented Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 w-full sm:w-auto shadow-xs">
            <button
              type="button"
              onClick={() => setMode("converter")}
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                mode === "converter"
                  ? "bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Universal File Converter</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("calculator")}
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                mode === "calculator"
                  ? "bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Financial &amp; Dev Calculators</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                Live
              </span>
            </button>
          </div>

          {/* Quick Format Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 shrink-0 hidden md:inline">
              Quick:
            </span>
            {POPULAR_PRESETS.map((preset) => {
              const isSelected = mode === "converter" && activeConverter.slug === preset.slug;
              return (
                <button
                  key={preset.slug}
                  type="button"
                  onClick={() => handleSelectPreset(preset.slug)}
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer",
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Search & Command Bar */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ converters, financial calculators, & developer utilities..."
              className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {searchResults.length === 0 ? (
                <div className="p-3 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  No matching converters or calculators found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                searchResults.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (item.type === "converter" && item.config) {
                        setActiveConverter(item.config);
                        setMode("converter");
                      }
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {item.type === "converter" ? (
                          <FileCode className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Workspace Showcase Container */}
      <div className="w-full max-w-7xl mx-auto shadow-xl shadow-zinc-900/5 rounded-3xl transition-all">
        {mode === "converter" ? (
          <DynamicConverterCard config={activeConverter} />
        ) : (
          <HomeCalculatorSpotlight />
        )}
      </div>
    </div>
  );
}
