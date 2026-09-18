import React from "react";
import Link from "next/link";
import { ArrowRight, Wrench, ShieldCheck, Zap } from "lucide-react";
import { getConverterBySlug } from "@/lib/registry";

interface ToolEmbedBannerProps {
  toolSlug: string;
  toolTitle: string;
  ariaLabel?: string;
}

export function ToolEmbedBanner({
  toolSlug,
  toolTitle,
  ariaLabel,
}: ToolEmbedBannerProps) {
  const isConverter = Boolean(getConverterBySlug(toolSlug));
  const targetHref = isConverter ? `/convert/${toolSlug}` : `/tools/${toolSlug}`;

  return (
    <aside
      aria-label={ariaLabel || `Interactive Tool: ${toolTitle}`}
      className="my-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-emerald-500/5 to-teal-50/50 p-6 shadow-sm dark:border-emerald-500/20 dark:from-emerald-950/30 dark:via-zinc-900/60 dark:to-teal-950/20"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Interactive Tool</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {toolTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              100% Client-Side / Zero Uploads
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              Instant Browser Memory Processing
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Link
            href={targetHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 hover:shadow-emerald-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          >
            <span>Open Free In-Browser Tool</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
