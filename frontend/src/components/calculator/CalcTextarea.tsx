"use client";

import React, { memo } from "react";

export interface CalcTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  helperText?: string;
  readOnly?: boolean;
}

export const CalcTextarea = memo(function CalcTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  helperText,
  readOnly = false,
}: CalcTextareaProps) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
        {value.length > 0 && (
          <span className="text-[11px] font-mono text-zinc-400">
            {value.length.toLocaleString()} chars
          </span>
        )}
      </div>

      <textarea
        id={id}
        rows={rows}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3.5 text-xs sm:text-sm font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-zinc-400 resize-y transition-all"
      />

      {helperText && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {helperText}
        </p>
      )}
    </div>
  );
});
