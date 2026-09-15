"use client";

import React from "react";
import {
  FileSpreadsheet,
  Download,
  Loader2,
  Trash2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { ConverterConfig } from "@/types/registry";
import { formatBytes, cn } from "@/lib/utils";
import { useConverter, MAX_FREE_FILE_SIZE_BYTES } from "@/hooks/useConverter";
import { DropZone } from "./DropZone";
import { DataPreviewTable } from "./DataPreviewTable";
import { FormatSelector } from "./FormatSelector";
import { ProUpgradeModal } from "./ProUpgradeModal";

export interface ConverterCardProps {
  config: ConverterConfig;
  className?: string;
}

export function ConverterCard({ config, className }: ConverterCardProps) {
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
    reset,
    convert,
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
        "w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm p-4 sm:p-8 space-y-6 transition-all",
        className
      )}
    >
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

      {/* Main Content Area */}
      {!file ? (
        /* State 1: No file loaded - Show DropZone */
        <DropZone config={config} onFileSelect={setFile} />
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-700 hover:border-rose-200 dark:hover:border-rose-900/60 transition-colors"
                title="Remove file and choose another"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
          {!isParsing && preview && <DataPreviewTable preview={preview} />}

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

      {/* ConvertSheet Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        reason={proModalReason}
      />
    </div>
  );
}
