"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  Archive,
  AlertCircle,
  X,
  FileCheck,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { CalcCard } from "@/components/calculator";
import {
  compressPdf,
  PdfCompressionLevel,
  PdfCompressionResult,
} from "@/lib/engines/pdf-engine";
import { createZipArchive, downloadBlob } from "@/lib/zip-utils";
import { formatBytes, cn } from "@/lib/utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

export interface PdfCompressorToolProps {
  title?: string;
  subtitle?: string;
}

interface PdfItemState {
  id: string;
  file: File;
  result?: PdfCompressionResult;
  isProcessing: boolean;
  error?: string;
  version: number;
}

const PRESET_CONFIGS: {
  level: PdfCompressionLevel;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    level: "recommended",
    title: "Recommended",
    subtitle: "Balanced quality & file size. Strips metadata, optimizes object streams.",
    icon: Sparkles,
  },
  {
    level: "extreme",
    title: "Extreme",
    subtitle: "Maximum compression for email & portal limits. Aggressive stream optimization.",
    icon: Zap,
  },
  {
    level: "low",
    title: "Low",
    subtitle: "Preserves document metadata & highest fidelity. Light object stream re-encoding.",
    icon: ShieldCheck,
  },
];

export function PdfCompressorTool({
  title = "Compress PDF Online",
  subtitle = "Reduce PDF file size client-side without uploading to any server. 100% private, fast, and secure.",
}: PdfCompressorToolProps) {
  const [items, setItems] = useState<PdfItemState[]>([]);
  const [level, setLevel] = useState<PdfCompressionLevel>("recommended");
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<PdfItemState[]>([]);
  itemsRef.current = items;

  // Cleanup blob URLs if any on unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining object references
    };
  }, []);

  const isPdfFile = (f: File) =>
    f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

  const processSingleItem = useCallback(
    async (
      item: PdfItemState,
      compressionLevel: PdfCompressionLevel,
      targetVersion: number
    ): Promise<void> => {
      try {
        const result = await compressPdf(item.file, { level: compressionLevel });

        setItems((prev) =>
          prev.map((it) => {
            if (it.id === item.id && it.version === targetVersion) {
              return {
                ...it,
                result,
                isProcessing: false,
                error: undefined,
              };
            }
            return it;
          })
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((it) => {
            if (it.id === item.id && it.version === targetVersion) {
              return {
                ...it,
                result: undefined,
                isProcessing: false,
                error: err?.message || "Failed to compress PDF.",
              };
            }
            return it;
          })
        );
      }
    },
    []
  );

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      const validFiles = newFiles.filter(isPdfFile);
      if (validFiles.length === 0) return;

      // Limit to 20 files total
      const availableSlots = Math.max(0, 20 - itemsRef.current.length);
      const filesToAdd = validFiles.slice(0, availableSlots);
      if (filesToAdd.length === 0) return;

      const now = Date.now();
      const newItems: PdfItemState[] = filesToAdd.map((file, idx) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        isProcessing: true,
        version: now + idx,
      }));

      setItems((prev) => [...prev, ...newItems]);

      for (const item of newItems) {
        processSingleItem(item, level, item.version);
      }
    },
    [level, processSingleItem]
  );

  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    multiple: true,
    accept: isPdfFile,
    onFiles: addFiles,
  });

  const handleLevelChange = (newLevel: PdfCompressionLevel) => {
    if (newLevel === level) return;
    setLevel(newLevel);

    const newVersion = Date.now();
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        version: newVersion,
        isProcessing: true,
      }))
    );

    itemsRef.current.forEach((item) => {
      processSingleItem(item, newLevel, newVersion);
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    // Revoke object URL if any in memory
    try {
      URL.revokeObjectURL(`blob:revoked-${id}`);
    } catch {
      // ignore
    }
  };

  const handleDownloadSingle = (item: PdfItemState) => {
    if (!item.result) return;
    downloadBlob(item.result.blob, item.result.filename);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((item) => item.result && !item.error);
    if (readyItems.length === 0) return;

    setIsZipping(true);
    setZipError(null);

    try {
      const zipEntries = readyItems.map((item) => ({
        name: item.result!.filename,
        data: item.result!.blob,
      }));

      const zipBlob = await createZipArchive(zipEntries);
      downloadBlob(zipBlob, "compressed_pdfs.zip");
    } catch (err: any) {
      setZipError(
        err?.message || "Failed to generate ZIP archive. Please try again or download individually."
      );
    } finally {
      setIsZipping(false);
    }
  };

  // Summary statistics
  const totalOriginalSize = items.reduce((acc, it) => acc + it.file.size, 0);
  const totalCompressedSize = items.reduce((acc, it) => {
    if (it.result) return acc + it.result.compressedSizeBytes;
    return acc + it.file.size;
  }, 0);
  const totalSavingsBytes = Math.max(0, totalOriginalSize - totalCompressedSize);
  const totalSavingsPercent =
    totalOriginalSize > 0
      ? Math.max(0, Math.round((totalSavingsBytes / totalOriginalSize) * 100))
      : 0;

  const readyCount = items.filter((it) => it.result && !it.error && !it.isProcessing).length;
  const isAnyProcessing = items.some((it) => it.isProcessing);

  return (
    <CalcCard
      title={title}
      subtitle={subtitle}
      icon={FileText}
      badge="100% Client-Side"
    >
      <div className="space-y-6">
        {/* Preset Level Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
            Compression Level Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_CONFIGS.map((config) => {
              const Icon = config.icon;
              const isSelected = level === config.level;
              return (
                <button
                  key={config.level}
                  type="button"
                  onClick={() => handleLevelChange(config.level)}
                  className={cn(
                    "flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all relative",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isSelected
                          ? "text-emerald-900 dark:text-emerald-100"
                          : "text-zinc-800 dark:text-zinc-200"
                      )}
                    >
                      {config.title}
                    </span>
                    {config.level === "recommended" && (
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {config.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          {...dragHandlers}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-800/20 group",
            isDragOver
              ? "border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/10 scale-[1.005]"
              : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf,.pdf"
            aria-label="Upload PDF files"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                addFiles(Array.from(e.target.files));
                e.target.value = "";
              }
            }}
          />
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform",
              isDragOver
                ? "bg-emerald-600 text-white scale-110"
                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110"
            )}
          >
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Drag &amp; drop PDF files here, or click to browse
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Supports up to 20 PDF documents simultaneously • 100% private in-browser compression
          </p>
        </div>

        {/* Summary Stats Banner */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Total Documents
              </span>
              <span className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200">
                {items.length} {items.length === 1 ? "file" : "files"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Original Size
              </span>
              <span className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200">
                {formatBytes(totalOriginalSize)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Compressed Size
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatBytes(totalCompressedSize)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Total Saved
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {totalSavingsPercent > 0 ? `-${totalSavingsPercent}%` : "0%"}{" "}
                <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  ({formatBytes(totalSavingsBytes)})
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Document Cards Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const savings = item.result ? item.result.savingsPercentage : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between gap-3 relative transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Document Icon / Status */}
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative">
                      <FileText className="w-6 h-6" />
                      {item.isProcessing && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-xl flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate"
                          title={item.file.name}
                        >
                          {item.file.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          title={`Remove ${item.file.name}`}
                          className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.error ? (
                        <div className="flex items-center gap-1 text-xs text-red-500 mt-2 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.error}</span>
                        </div>
                      ) : item.result ? (
                        <div className="space-y-1.5 mt-1.5">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              {formatBytes(item.file.size)} →
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {formatBytes(item.result.compressedSizeBytes)}
                            </span>
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold",
                                savings > 0
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                              )}
                            >
                              {savings > 0 ? `-${savings}%` : `${Math.abs(savings)}%`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
                              {item.result.pageCount} {item.result.pageCount === 1 ? "Page" : "Pages"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <FileCheck className="w-3 h-3" /> Done
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Compressing...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Single Document Download Action */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end">
                    <button
                      type="button"
                      disabled={!item.result || item.isProcessing || !!item.error}
                      onClick={() => handleDownloadSingle(item)}
                      title={`Download ${item.result?.filename || item.file.name}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ZIP Creation Error Banner */}
        {zipError && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-sm"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-xs sm:text-sm">ZIP Archive Error</p>
                <p className="text-xs text-rose-700 dark:text-rose-300">{zipError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setZipError(null)}
              aria-label="Dismiss ZIP error"
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Batch Action Footer */}
        {items.length > 0 && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {readyCount} of {items.length} PDF documents compressed and ready
            </div>

            <button
              type="button"
              disabled={readyCount === 0 || isZipping || isAnyProcessing}
              onClick={handleDownloadAllZip}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isZipping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating ZIP Archive...</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </CalcCard>
  );
}
