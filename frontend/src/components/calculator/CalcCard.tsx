"use client";

import React, { memo } from "react";
import { LucideIcon } from "lucide-react";
import { CurrencySelector } from "./CurrencySelector";

export interface CalcCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  showCurrencySelector?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CalcCard = memo(function CalcCard({
  title,
  subtitle,
  icon: Icon,
  badge,
  showCurrencySelector = false,
  children,
  className = "",
}: CalcCardProps) {
  return (
    <div
      className={`rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xl shadow-zinc-200/40 dark:shadow-none p-6 sm:p-8 space-y-6 transition-colors ${className}`}
    >
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showCurrencySelector && <CurrencySelector />}
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
});
