"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Table, Database, Layers, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { ConverterConfig } from "@/types/registry";

interface ConverterGridProps {
  converters: ConverterConfig[];
  initialLimit?: number;
}

type CategoryTab = "all" | "spreadsheets" | "data-engineering";

export function ConverterGrid({ converters, initialLimit = 6 }: ConverterGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const spreadsheetCount = converters.filter(
    (c) => c.category === "spreadsheets" || !c.category
  ).length;
  const dataEngCount = converters.filter(
    (c) => c.category === "data-engineering"
  ).length;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredConverters = converters.filter((c) => {
    if (selectedCategory === "spreadsheets") {
      if (c.category !== "spreadsheets" && c.category) return false;
    } else if (selectedCategory === "data-engineering") {
      if (c.category !== "data-engineering") return false;
    }

    if (normalizedQuery) {
      return (
        Boolean(c.title && c.title.toLowerCase().includes(normalizedQuery)) ||
        Boolean(c.sourceFormat && c.sourceFormat.toLowerCase().includes(normalizedQuery)) ||
        Boolean(c.targetFormat && c.targetFormat.toLowerCase().includes(normalizedQuery)) ||
        Boolean(c.slug && c.slug.toLowerCase().includes(normalizedQuery)) ||
        Boolean(c.badge && c.badge.toLowerCase().includes(normalizedQuery)) ||
        Boolean(c.metaDescription && c.metaDescription.toLowerCase().includes(normalizedQuery))
      );
    }
    return true;
  });

  const isSearching = normalizedQuery.length > 0;
  const displayedConverters = isSearching || showAll
    ? filteredConverters
    : filteredConverters.slice(0, initialLimit);

  return (
    <div className="space-y-4 sm:space-y-6" id="converters">
      {/* Category Tabs & Quick Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setShowAll(false);
            }}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Converters</span>
            <span className="font-mono text-[11px] font-semibold">({converters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory("spreadsheets");
              setShowAll(false);
            }}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === "spreadsheets"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Spreadsheets &amp; Docs</span>
            <span className="font-mono text-[11px] font-semibold">({spreadsheetCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory("data-engineering");
              setShowAll(false);
            }}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === "data-engineering"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Engineering (DuckDB)</span>
            <span className="font-mono text-[11px] font-semibold">({dataEngCount})</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            aria-label="Filter converters"
            placeholder="Search converters (e.g. parquet, json)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
              aria-label="Clear filter"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {displayedConverters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {displayedConverters.map((converter) => (
            <Link
              key={converter.slug}
              href={`/convert/${converter.slug}`}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-150"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                  <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg">
                    {converter.sourceFormat} &rarr; {converter.targetFormat}
                  </span>
                  {converter.badge && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                      <span>{converter.badge}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {converter.sourceFormat} to {converter.targetFormat}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {converter.metaDescription}
                </p>
              </div>

              <div className="mt-3 sm:mt-4 flex items-center justify-between pt-2.5 sm:pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px]">
                <span className="text-zinc-400">
                  {converter.category === "data-engineering"
                    ? "DuckDB-Wasm Engine"
                    : converter.isClientSide
                    ? "100% In-Browser"
                    : "Cloud OCR Engine"}
                </span>
                <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Convert</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No converters found matching &ldquo;<span className="font-semibold text-zinc-900 dark:text-zinc-100">{searchQuery}</span>&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Clear search filter
          </button>
        </div>
      )}

      {/* Show All / Show Less / Browse Directory Action */}
      {filteredConverters.length > initialLimit && !isSearching && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Show All {filteredConverters.length} Converters</span>
              </>
            )}
          </button>

          <Link
            href="/directory"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <span>Browse Full Directory &rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
}
