"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getProgrammaticPresetsByTool } from "@/lib/programmatic-presets";

export interface PresetPillsBarProps {
  toolSlug: string;
  currentPresetSlug?: string;
  limit?: number;
  className?: string;
}

export function PresetPillsBar({
  toolSlug,
  currentPresetSlug,
  limit = 10,
  className = "",
}: PresetPillsBarProps) {
  const allPresets = getProgrammaticPresetsByTool(toolSlug);

  if (!allPresets || allPresets.length === 0) {
    return null;
  }

  const presets = allPresets.slice(0, limit);

  return (
    <div className={`w-full space-y-2 mb-4 sm:mb-6 ${className}`}>
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Popular Scenarios &amp; Benchmarks:</span>
        </div>
        {allPresets.length > limit && (
          <Link
            href={`/tools/${toolSlug}#tool-presets-heading`}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            View all {allPresets.length} →
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
        {/* Parent Custom / Base Tool Link */}
        <Link
          href={`/tools/${toolSlug}`}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            !currentPresetSlug
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60"
          }`}
        >
          Custom Input
        </Link>

        {presets.map((p) => {
          const isActive = currentPresetSlug === p.presetSlug;
          return (
            <Link
              key={p.presetSlug}
              href={`/tools/${toolSlug}/${p.presetSlug}`}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60"
              }`}
            >
              {p.name.replace(/\s*\(.*?\)\s*/g, "").replace(/\s*Calculator\s*/i, "")}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
