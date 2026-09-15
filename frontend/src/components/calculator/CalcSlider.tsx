"use client";

import React, { memo } from "react";

export interface CalcSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  unit?: string;
  prefix?: string;
}

export const CalcSlider = memo(function CalcSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
  prefix = "",
}: CalcSliderProps) {
  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <label
          htmlFor={id}
          className="font-semibold text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg text-xs">
          {prefix}
          {value.toLocaleString()} {unit}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
        <span>
          {prefix}
          {min} {unit}
        </span>
        <span>
          {prefix}
          {max} {unit}
        </span>
      </div>
    </div>
  );
});
