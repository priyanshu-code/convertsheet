"use client";

import React, { memo } from "react";

export interface CalcToggleOption {
  value: string;
  label: string;
}

export interface CalcToggleProps {
  label?: string;
  value: string;
  options: CalcToggleOption[];
  onChange: (val: string) => void;
}

export const CalcToggle = memo(function CalcToggle({
  label,
  value,
  options,
  onChange,
}: CalcToggleProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <span className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
      )}
      <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 w-full sm:w-auto">
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                isSelected
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
