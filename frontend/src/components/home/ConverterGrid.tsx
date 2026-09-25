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
    <div className="space-y-6" id="converters">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
          onClick={() => setSelectedCategory("spreadsheets")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
          onClick={() => setSelectedCategory("data-engineering")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredConverters.map((converter) => (
          <Link
            key={converter.slug}
            href={`/convert/${converter.slug}`}
            className="group relative flex flex-col justify-between p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-150"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
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

              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {converter.sourceFormat} to {converter.targetFormat}
              </h3>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {converter.metaDescription}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px]">
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
    </div>
  );
}
