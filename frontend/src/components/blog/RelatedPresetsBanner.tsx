import React from "react";
import Link from "next/link";
import { Calculator, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { ProgrammaticPreset } from "@/lib/programmatic-presets";

export interface RelatedPresetsBannerProps {
  presets: ProgrammaticPreset[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function RelatedPresetsBanner({
  presets,
  title = "Interactive Calculators & Scenarios",
  subtitle = "Run instant in-browser scenarios calibrated for current benchmark interest rates:",
  className = "",
}: RelatedPresetsBannerProps) {
  if (!presets || presets.length === 0) return null;

  return (
    <section
      aria-label={title}
      className={`my-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-5 sm:p-6 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <Calculator className="h-4 w-4" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        {subtitle}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {presets.map((preset) => (
          <Link
            key={`${preset.toolSlug}-${preset.presetSlug}`}
            href={`/tools/${preset.toolSlug}/${preset.presetSlug}`}
            className="group flex flex-col justify-between p-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {preset.name}
                </span>
                {preset.badge && (
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-1.5 py-0.2 rounded-md shrink-0">
                    {preset.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {preset.metaDescription}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Calculate Scenario</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
