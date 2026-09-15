"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Table, Database, Layers } from "lucide-react";
import { ConverterConfig } from "@/types/registry";

interface ConverterGridProps {
  converters: ConverterConfig[];
}

type CategoryTab = "all" | "spreadsheets" | "data-engineering";

export function ConverterGrid({ converters }: ConverterGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("all");

  const spreadsheetCount = converters.filter(
    (c) => c.category === "spreadsheets" || !c.category
  ).length;
  const dataEngCount = converters.filter(
    (c) => c.category === "data-engineering"
  ).length;

  const filteredConverters = converters.filter((c) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "spreadsheets") {
      return c.category === "spreadsheets" || !c.category;
    }
    if (selectedCategory === "data-engineering") {
      return c.category === "data-engineering";
    }
    return true;
  });

  return (
    <div className="space-y-8" id="converters">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Converters</span>
          <span className="font-mono text-xs opacity-75">({converters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("spreadsheets")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === "spreadsheets"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Spreadsheets &amp; Docs</span>
          <span className="font-mono text-xs opacity-75">({spreadsheetCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("data-engineering")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === "data-engineering"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Engineering (DuckDB)</span>
          <span className="font-mono text-xs opacity-75">({dataEngCount})</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConverters.map((converter) => (
          <Link
            key={converter.slug}
            href={`/convert/${converter.slug}`}
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-emerald-400 dark:hover:border-emerald-800 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-xl">
                  {converter.sourceFormat} &rarr; {converter.targetFormat}
                </span>
                {converter.badge && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>{converter.badge}</span>
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {converter.sourceFormat} to {converter.targetFormat}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {converter.metaDescription}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {converter.category === "data-engineering"
                  ? "DuckDB-Wasm Engine"
                  : converter.isClientSide
                  ? "In-Browser WebAssembly"
                  : "Cloud OCR Engine"}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
