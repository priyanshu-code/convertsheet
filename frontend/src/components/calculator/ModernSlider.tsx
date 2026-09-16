"use client";

import React, { memo } from "react";

export interface SliderPreset {
  label: string;
  value: number;
}

export interface ModernSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  presets?: SliderPreset[];
  helpText?: string;
  onChange: (val: number) => void;
  className?: string;
  disabled?: boolean;
}

export const ModernSlider = memo(function ModernSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  prefix = "",
  suffix = "",
  presets,
  helpText,
  onChange,
  className = "",
  disabled = false,
}: ModernSliderProps) {
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min || 1)) * 100)
  );

  return (
    <div className={`space-y-2.5 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200"
        >
          {label}
        </label>
        <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-2.5 py-1 shadow-sm">
          {prefix && (
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1">
              {prefix}
            </span>
          )}
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            aria-label={`${label} numeric input`}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (!isNaN(num)) onChange(num);
            }}
            className="w-16 sm:w-20 text-xs sm:text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-transparent text-right focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {suffix && (
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 ml-1">
              {suffix}
            </span>
          )}
        </div>
      </div>

      <div className="relative flex items-center h-6">
        <input
          id={id}
          type="range"
          role="slider"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${percentage}%, #e4e4e7 ${percentage}%, #e4e4e7 100%)`,
          }}
          className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {presets.map((preset) => {
            const isActive = preset.value === value;
            return (
              <button
                key={preset.label}
                type="button"
                disabled={disabled}
                onClick={() => onChange(preset.value)}
                className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActive
                    ? "bg-emerald-600 text-white font-bold shadow-sm scale-105"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/60"
                }`}
              >
                {prefix}
                {preset.label}
                {suffix && ` ${suffix}`}
              </button>
            );
          })}
        </div>
      )}

      {helpText && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {helpText}
        </p>
      )}
    </div>
  );
});
