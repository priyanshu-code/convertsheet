"use client";

import React, { useState } from "react";
import { ArrowRight, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { ConverterConfig } from "@/types/registry";
import { ConversionOptions } from "@/types/converter";
import { cn } from "@/lib/utils";

export interface FormatSelectorProps {
  config: ConverterConfig;
  options: ConversionOptions;
  onOptionsChange: (newOptions: ConversionOptions) => void;
  className?: string;
}

const DELIMITER_OPTIONS = [
  { label: "Comma (,)", value: "," },
  { label: "Semicolon (;)", value: ";" },
  { label: "Tab (\\t)", value: "\t" },
  { label: "Pipe (|)", value: "|" },
];

export function FormatSelector({
  config,
  options,
  onOptionsChange,
  className,
}: FormatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isExcelTarget =
    config.targetExtension === ".xlsx" ||
    config.targetFormat.toLowerCase().includes("excel");

  const isCsvRelated =
    config.sourceExtension === ".csv" ||
    config.targetExtension === ".csv" ||
    config.slug.includes("csv");

  const isJsonTarget =
    config.targetExtension === ".json" ||
    config.targetFormat.toLowerCase().includes("json");

  const isJsonSource =
    config.sourceExtension === ".json" ||
    config.sourceFormat.toLowerCase().includes("json");

  const hasSettings =
    isExcelTarget || isCsvRelated || isJsonTarget || isJsonSource;

  const handleSheetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      sheetName: e.target.value,
    });
  };

  const handleDelimiterSelect = (delimiter: string) => {
    onOptionsChange({
      ...options,
      delimiter,
    });
  };

  const handlePrettifyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      prettify: e.target.checked,
    });
  };

  const handleFlattenToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      flattenNested: e.target.checked,
    });
  };

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 shadow-xs",
        className
      )}
    >
      {/* Visual Format Flow Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Source badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
            <span>{config.sourceFormat}</span>
            <span className="text-zinc-400 dark:text-zinc-500 font-normal">
              {config.sourceExtension}
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />

          {/* Target badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span>{config.targetFormat}</span>
            <span className="text-emerald-600/80 dark:text-emerald-400/80 font-normal">
              {config.targetExtension}
            </span>
          </div>
        </div>

        {/* Settings Accordion Trigger Button */}
        {hasSettings && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Conversion Options</span>
            {isOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>
        )}
      </div>

      {/* Settings Accordion Panel */}
      {hasSettings && isOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 text-sm">
          {/* Sheet Name (Excel Target) */}
          {isExcelTarget && (
            <div className="space-y-1.5">
              <label
                htmlFor="excel-sheet-name-input"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Worksheet Name
              </label>
              <input
                id="excel-sheet-name-input"
                type="text"
                maxLength={31}
                value={options.sheetName ?? "Sheet1"}
                onChange={handleSheetNameChange}
                placeholder="Sheet1"
                className="w-full sm:w-64 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Max 31 characters. Special characters like [ ] * ? / \ will be cleaned.
              </p>
            </div>
          )}

          {/* Delimiter Selection (CSV Related) */}
          {isCsvRelated && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                CSV Delimiter
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:w-80">
                {DELIMITER_OPTIONS.map((item) => {
                  const isSelected = (options.delimiter ?? ",") === item.value;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleDelimiterSelect(item.value)}
                      className={cn(
                        "px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-all text-center",
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold"
                          : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prettify JSON Toggle (JSON Target) */}
          {isJsonTarget && (
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.prettify ?? true}
                onChange={handlePrettifyToggle}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <div className="space-y-0.5">
                <span className="block text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  Prettify JSON Output
                </span>
                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                  Format output with 2-space indentation for human readability.
                </span>
              </div>
            </label>
          )}

          {/* Flatten Nested Objects Toggle (JSON Source) */}
          {isJsonSource && (
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.flattenNested ?? true}
                onChange={handleFlattenToggle}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <div className="space-y-0.5">
                <span className="block text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  Flatten Nested Objects
                </span>
                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                  Turn nested properties into dot-notated spreadsheet columns (e.g. user.address.city).
                </span>
              </div>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
