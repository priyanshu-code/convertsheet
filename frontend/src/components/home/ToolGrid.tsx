"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Calculator, Terminal, SlidersHorizontal, Layers } from "lucide-react";
import { ToolConfig, ToolCategory } from "@/types/tool";

interface ToolGridProps {
  tools: ToolConfig[];
}

type CategoryFilter = "all" | ToolCategory;

export function ToolGrid({ tools }: ToolGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [showAll, setShowAll] = useState(false);

  const INITIAL_LIMIT = 6;

  const devCount = tools.filter((t) => t.category === "data-developer").length;
  const financialCount = tools.filter((t) => t.category === "financial").length;
  const utilityCount = tools.filter((t) => t.category === "utility").length;

  const filteredTools = tools.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  const displayedTools = showAll ? filteredTools : filteredTools.slice(0, INITIAL_LIMIT);

  return (
    <div className="space-y-6" id="tools">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedCategory === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Tools</span>
          <span className="font-mono text-[11px] font-semibold">({tools.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("data-developer")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedCategory === "data-developer"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-500" />
          <span>Data &amp; Dev</span>
          <span className="font-mono text-[11px] font-semibold">({devCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("financial")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedCategory === "financial"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-teal-500" />
          <span>Financial Calculators</span>
          <span className="font-mono text-[11px] font-semibold">({financialCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("utility")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            selectedCategory === "utility"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
          <span>General Utility</span>
          <span className="font-mono text-[11px] font-semibold">({utilityCount})</span>
        </button>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {displayedTools.map((tool) => {
          const categoryBadge =
            tool.category === "data-developer"
              ? "DEVELOPER"
              : tool.category === "financial"
              ? "FINANCE"
              : "UTILITY";

          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group relative flex flex-col justify-between p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all duration-150 shadow-xs hover:shadow-md hover:shadow-emerald-500/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {categoryBadge}
                  </span>
                  {tool.badge && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                      {tool.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>Free &amp; In-Browser</span>
                <span className="flex items-center gap-1">
                  Open Tool
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Show All / Explore Hub Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {filteredTools.length > INITIAL_LIMIT && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            {showAll ? (
              <span>Show Less ({INITIAL_LIMIT} Tools)</span>
            ) : (
              <span>Show All {filteredTools.length} Tools</span>
            )}
          </button>
        )}
        <Link
          href="/tools"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
        >
          <span>Browse Complete Tools Hub ({tools.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
