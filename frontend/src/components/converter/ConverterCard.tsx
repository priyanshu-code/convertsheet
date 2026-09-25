"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Loader2,
  Trash2,
  AlertCircle,
  Sparkles,
  Archive,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { ConverterConfig } from "@/types/registry";
import { formatBytes, cn } from "@/lib/utils";
import { useConverter, MAX_FREE_FILE_SIZE_BYTES } from "@/hooks/useConverter";
import { DropZone } from "./DropZone";
import { SplitTableInput } from "./SplitTableInput";
import { SplitJsonInput } from "./SplitJsonInput";
import { DataPreviewTable } from "./DataPreviewTable";
import { FormatSelector } from "./FormatSelector";
import { ProUpgradeModal } from "./ProUpgradeModal";
import { BatchConverterCard } from "./BatchConverterCard";

export interface ConverterCardProps {
  config: ConverterConfig;
  className?: string;
}

export function ConverterCard({ config, className }: ConverterCardProps) {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const {
    file,
    preview,
    options,
    isParsing,
    isConverting,
    error,
    showProModal,
    proModalReason,
    setFile,
    setOptions,
    setShowProModal,
    conversionDuration,
    reset,
    convert,
    previewTable,
  } = useConverter(config);

  const requiresPro = Boolean(
    file && (!config.isClientSide || file.size > MAX_FREE_FILE_SIZE_BYTES)
  );

  const handleConvertClick = async () => {
    if (requiresPro) {
      setShowProModal(true);
      return;
    }
    await convert();
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/40 dark:shadow-none p-4 sm:p-7 space-y-5 transition-all",
        className
      )}
    >
      {/* Mode Selector Tabs (Single File vs Batch ZIP) */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === "single"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Single File
          </button>
          <button
            type="button"
            onClick={() => setMode("batch")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === "batch"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Batch ZIP Mode</span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
              Multi-File
            </span>
          </button>
        </div>
      </div>

      {mode === "batch" ? (
        <BatchConverterCard config={config} />
      ) : (
        <>
          {/* Top Format Selector & Conversion Flow */}
          <FormatSelector
            config={config}
            options={options}
            onOptionsChange={setOptions}
          />

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-sm"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1">
            <p className="font-semibold">Notice</p>
            <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Conversion Success & Benchmark Performance Banner */}
      {conversionDuration !== null && !error && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-sm animate-in fade-in slide-in-from-top-1 duration-300"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                <span>Conversion Complete!</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                  <Timer className="w-3 h-3" />
                  {conversionDuration < 1
                    ? `${(conversionDuration * 1000).toFixed(0)} ms`
                    : `${conversionDuration.toFixed(2)}s`}
                </span>
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-0.5">
                {preview?.totalRows
                  ? `${preview.totalRows.toLocaleString()} rows processed 100% locally in your browser. Zero bytes uploaded.`
                  : "Processed 100% locally in your browser with DuckDB / WebAssembly. Zero bytes uploaded."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!file ? (
        /* State 1: No file loaded - Show SplitJsonInput for JSON sources, SplitTableInput for Markdown, otherwise DropZone */
        config.sourceFormat === "JSON" ? (
          <SplitJsonInput
            config={config}
            onFileSelect={setFile}
            disabled={isParsing}
          />
        ) : config.slug === "markdown-to-excel" || config.sourceFormat === "Markdown" ? (
          <SplitTableInput
            config={config}
            onFileSelect={setFile}
            disabled={isParsing}
          />
        ) : (
          <DropZone config={config} onFileSelect={setFile} />
        )
      ) : (
        /* State 2: File loaded - Show File Info Bar, Preview / Parsing, and Actions */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Loaded File Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={reset}
                disabled={isConverting}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                aria-label="Remove selected file"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Parsing State */}
          {isParsing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <Loader2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Parsing {config.sourceFormat} structure &amp; preparing preview...
              </p>
            </div>
          )}

          {/* Data Preview Table */}
          {!isParsing && preview && (
            <DataPreviewTable
              preview={preview}
              onTableChange={previewTable}
            />
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {requiresPro ? (
              <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 order-2 sm:order-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>ConvertSheet Pro required for this file</span>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 order-2 sm:order-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Ready to transform into native {config.targetFormat}</span>
              </div>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button
                type="button"
                onClick={reset}
                disabled={isConverting}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {requiresPro ? (
                <button
                  type="button"
                  onClick={() => setShowProModal(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20 active:scale-[0.99] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ConvertSheet Pro required for this file</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConvertClick}
                  disabled={isParsing || isConverting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Converting to {config.targetFormat}...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Convert &amp; Download {config.targetFormat}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </>
    )}

      {/* ConvertSheet Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        reason={proModalReason}
      />
    </div>
  );
}
