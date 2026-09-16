"use client";

import React, { memo } from "react";

export interface CalcInputProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (val: any) => void;
  type?: "number" | "text" | "date";
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  helperText?: string;
  helpText?: string;
  disabled?: boolean;
}

export const CalcInput = memo(function CalcInput({
  id,
  label,
  value,
  onChange,
  type = "number",
  min,
  max,
  step,
  prefix,
  suffix,
  placeholder,
  helperText,
  helpText,
  disabled = false,
}: CalcInputProps) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      </div>

      <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
        {prefix && (
          <span className="pl-3.5 pr-1.5 text-xs sm:text-sm font-medium text-zinc-400 select-none">
            {prefix}
          </span>
        )}

        <input
          id={id}
          name={id}
          type={type}
          min={min}
          max={max}
          step={step}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-2.5 text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 bg-transparent placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            prefix ? "pl-1" : "pl-3.5"
          } ${suffix ? "pr-1" : "pr-3.5"}`}
        />

        {suffix && (
          <span className="pr-3.5 pl-1.5 text-xs sm:text-sm font-medium text-zinc-400 select-none">
            {suffix}
          </span>
        )}
      </div>

      {(helperText || helpText) && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
          {helperText || helpText}
        </p>
      )}
    </div>
  );
});
