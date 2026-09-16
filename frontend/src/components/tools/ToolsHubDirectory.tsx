"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight, Sparkles, Filter, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ToolConfig, ToolCategory } from "@/types/tool";
import { ExcelTemplateLibrary } from "@/components/tools/ExcelTemplateLibrary";

interface ToolsHubDirectoryProps {
  tools: ToolConfig[];
}

export function ToolsHubDirectory({ tools }: ToolsHubDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories: { label: string; value: string; count: number }[] = useMemo(() => {
    return [
      { label: "All Tools", value: "all", count: tools.length },
      {
        label: "Financial Math",
        value: "financial",
        count: tools.filter((t) => t.category === "financial").length,
      },
      {
        label: "Data & Developer",
        value: "data-developer",
        count: tools.filter((t) => t.category === "data-developer").length,
      },
      {
        label: "Utilities & PDF",
        value: "utility",
        count: tools.filter((t) => t.category === "utility").length,
      },
    ];
  }, [tools]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      const inName = tool.name.toLowerCase().includes(q);
      const inSubtitle = tool.subtitle.toLowerCase().includes(q);
      const inKeywords = (tool.keywords || []).some((k) => k.toLowerCase().includes(q));
      const inCategory = tool.category.toLowerCase().includes(q);

      return inName || inSubtitle || inKeywords || inCategory;
    });
  }, [tools, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 38+ calculators, developer encoders, PDF utilities..."
            aria-label="Search tools"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Status & Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
        <span className="font-medium">
          Showing {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
          {selectedCategory !== "all" && ` in ${selectedCategory.replace("-", " & ")}`}
        </span>
        {searchQuery && (
          <span className="text-emerald-600 dark:text-emerald-400">
            Filtered by &ldquo;{searchQuery}&rdquo;
          </span>
        )}
      </div>

      {/* Tool Cards Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                    {tool.category.replace("-", " ")}
                  </span>
                  {tool.badge && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                      <Sparkles className="w-2.5 h-2.5" />
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {tool.name}
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {tool.subtitle}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Client-Side</span>
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Launch Tool <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            No tools found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Try adjusting your search query or switching categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Free Excel Financial Model Library */}
      <div className="pt-6">
        <ExcelTemplateLibrary />
      </div>
    </div>
  );
}
