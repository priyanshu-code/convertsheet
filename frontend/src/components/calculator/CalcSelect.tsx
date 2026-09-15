"use client";

import React, { memo } from "react";

export interface CalcSelectOption {
  value: string;
  label: string;
}

export interface CalcSelectProps {
  id: string;
  label: string;
  value: string;
  options: CalcSelectOption[];
  onChange: (val: string) => void;
  helperText?: string;
  disabled?: boolean;
}

export const CalcSelect = memo(function CalcSelect({
  id,
  label,
  value,
  options,
  onChange,
  helperText,
  disabled = false,
}: CalcSelectProps) {
  return (
    <div className="space-y-1.5 w-full">
      <label
        htmlFor={id}
        className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-2.5 px-3.5 text-sm sm:text-base font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer transition-all"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {helperText}
        </p>
      )}
    </div>
  );
});
