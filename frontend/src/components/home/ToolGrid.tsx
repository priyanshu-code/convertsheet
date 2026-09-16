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

  const devCount = tools.filter((t) => t.category === "data-developer").length;
  const financialCount = tools.filter((t) => t.category === "financial").length;
  const utilityCount = tools.filter((t) => t.category === "utility").length;

  const filteredTools = tools.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-8" id="tools">
      {/* Category Filter Tabs */}
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
          <span>All Tools</span>
          <span className="font-mono text-xs font-semibold">({tools.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("data-developer")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === "data-developer"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span>Data &amp; Dev</span>
          <span className="font-mono text-xs font-semibold">({devCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("financial")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === "financial"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
          }`}
        >
          <Calculator className="w-4 h-4 text-teal-500" />
          <span>Financial Calculators</span>
          <span className="font-mono text-xs font-semibold">({financialCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("utility")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === "utility"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
          <span>General Utility</span>
          <span className="font-mono text-xs font-semibold">({utilityCount})</span>
        </button>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
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
              className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-emerald-500/5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {categoryBadge}
                  </span>
                  {tool.badge && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                      {tool.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>Free &amp; Client-Side</span>
                <span className="flex items-center gap-1">
                  Open Tool
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
