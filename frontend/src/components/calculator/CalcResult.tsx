"use client";

import React, { memo } from "react";
import { CalcCopyButton } from "./CalcCopyButton";

export interface CalcResultItem {
  label: string;
  value: string;
  highlight?: boolean;
  subtext?: string;
  badge?: string;
}

export interface CalcResultProps {
  title?: string;
  primaryValue?: string;
  primaryLabel?: string;
  primarySubtext?: string;
  items?: CalcResultItem[];
  copyValue?: string;
  copyLabel?: string;
  className?: string;
}

export const CalcResult = memo(function CalcResult({
  title = "Calculation Result",
  primaryValue,
  primaryLabel,
  primarySubtext,
  items,
  copyValue,
  copyLabel,
  className = "",
}: CalcResultProps) {
  return (
    <div
      className={`rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/60 via-emerald-50/20 to-transparent dark:from-emerald-950/40 dark:via-zinc-900/40 dark:to-zinc-900/20 p-5 sm:p-6 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-800/40 pb-3">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          {title}
        </h2>
        {copyValue && (
          <CalcCopyButton textToCopy={copyValue} label={copyLabel} />
        )}
      </div>

      {primaryValue && (
        <div className="space-y-1">
          {primaryLabel && (
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {primaryLabel}
            </span>
          )}
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-mono tracking-tight text-emerald-700 dark:text-emerald-300 break-words">
            {primaryValue}
          </div>
          {primarySubtext && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {primarySubtext}
            </p>
          )}
        </div>
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-colors flex flex-col justify-between ${
                item.highlight
                  ? "border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-zinc-800/80 shadow-xs"
                  : "border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40"
              }`}
            >
              <div className="flex items-start justify-between gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                <span className="line-clamp-2 leading-tight">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
              <div
                className={`text-sm sm:text-base lg:text-lg font-bold font-mono tracking-tight break-words ${
                  item.highlight
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {item.value}
              </div>
              {item.subtext && (
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                  {item.subtext}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
