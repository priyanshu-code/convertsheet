"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Archive,
  Download,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
  AlertCircle,
} from "lucide-react";
import { CalcCard, CalcSelect, CalcSlider } from "@/components/calculator";
import { convertImage, calculateSavings, ImageConversionResult } from "@/lib/engines/image-engine";
import { createZipArchive, downloadBlob } from "@/lib/zip-utils";
import { formatBytes, cn } from "@/lib/utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

export type ImageFormatOption = "original" | "image/webp" | "image/jpeg" | "image/png";

export interface BulkImageCompressorProps {
  defaultFormat?: ImageFormatOption;
  title?: string;
  subtitle?: string;
}

interface ImageItemState {
  id: string;
  file: File;
  previewUrl: string;
  customQuality?: number; // per-item quality override
  result?: ImageConversionResult;
  isProcessing: boolean;
  error?: string;
  version: number; // sequence number / timestamp for race-condition prevention
}

export function BulkImageCompressor({
  defaultFormat = "image/webp",
  title = "Bulk Image Compressor",
  subtitle = "Compress, convert, and downscale batches of images simultaneously in your browser. 100% private, zero uploads.",
}: BulkImageCompressorProps) {
  const [items, setItems] = useState<ImageItemState[]>([]);
  const [globalFormat, setGlobalFormat] = useState<ImageFormatOption>(defaultFormat);
  const [globalQuality, setGlobalQuality] = useState<number>(80);
  const [globalMaxWidth, setGlobalMaxWidth] = useState<number>(0); // 0 = Original
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<ImageItemState[]>([]);
  itemsRef.current = items;
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    const timers = debounceTimersRef.current;
    const currentItems = itemsRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      currentItems.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const resolveTargetFormat = (file: File, selectedFormat: ImageFormatOption): "image/webp" | "image/png" | "image/jpeg" => {
    if (selectedFormat !== "original") {
      return selectedFormat;
    }
    const type = file.type.toLowerCase();
    if (type === "image/png") return "image/png";
    if (type === "image/webp") return "image/webp";
    return "image/jpeg";
  };

  const processSingleItem = useCallback(
    async (
      item: ImageItemState,
      targetFormat: ImageFormatOption,
      quality: number,
      maxWidth: number,
      targetVersion: number
    ): Promise<void> => {
      const format = resolveTargetFormat(item.file, targetFormat);
      const effectiveQuality = (item.customQuality ?? quality) / 100;
      const effectiveMaxWidth = maxWidth > 0 ? maxWidth : undefined;

      try {
        const result = await convertImage(item.file, {
          format,
          quality: effectiveQuality,
          maxWidth: effectiveMaxWidth,
        });

        let finalResult = result;
        // If re-compressing at highest quality (>= 95%) in same format resulted in slightly larger file, keep original file bytes.
        // But if the user explicitly reduced quality (< 95%), respect the user's compression intent.
        if (result.sizeBytes >= item.file.size && targetFormat === "original" && effectiveQuality >= 0.95) {
          finalResult = {
            ...result,
            blob: item.file,
            sizeBytes: item.file.size,
          };
        }

        // Race condition prevention: only update if item's latest version matches targetVersion
        setItems((prev) =>
          prev.map((it) => {
            if (it.id === item.id && it.version === targetVersion) {
              return {
                ...it,
                result: finalResult,
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
                error: err?.message || "Failed to process image.",
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
      const validFiles = newFiles.filter(
        (f) => f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".svg")
      );
      if (validFiles.length === 0) return;

      const now = Date.now();
      const newItems: ImageItemState[] = validFiles.map((file, idx) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isProcessing: true,
        version: now + idx,
      }));

      setItems((prev) => [...prev, ...newItems]);

      // Process new files
      for (const item of newItems) {
        processSingleItem(item, globalFormat, globalQuality, globalMaxWidth, item.version);
      }
    },
    [globalFormat, globalQuality, globalMaxWidth, processSingleItem]
  );

  const isImageFile = (f: File) =>
    f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".svg");

  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    multiple: true,
    accept: isImageFile,
    onFiles: addFiles,
  });

  // Re-process items when global controls change
  const reprocessAll = useCallback(
    (newFormat: ImageFormatOption, newQuality: number, newMaxWidth: number) => {
      const newVersion = Date.now();
      // Clear customQuality so global quality/format adjustments apply to all items
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          customQuality: undefined,
          version: newVersion,
          isProcessing: true,
        }))
      );

      itemsRef.current.forEach((item) => {
        const itemWithoutCustom = { ...item, customQuality: undefined };
        processSingleItem(itemWithoutCustom, newFormat, newQuality, newMaxWidth, newVersion);
      });
    },
    [processSingleItem]
  );

  const handleGlobalFormatChange = (val: string) => {
    const fmt = val as ImageFormatOption;
    setGlobalFormat(fmt);
    reprocessAll(fmt, globalQuality, globalMaxWidth);
  };

  const handleGlobalQualityCommit = (val?: number) => {
    const qualityToApply = val ?? globalQuality;
    const existingTimer = debounceTimersRef.current.get("global");
    if (existingTimer) {
      clearTimeout(existingTimer);
      debounceTimersRef.current.delete("global");
    }
    reprocessAll(globalFormat, qualityToApply, globalMaxWidth);
  };

  const handleGlobalQualityChange = (val: number) => {
    setGlobalQuality(val);

    // Debounce re-processing during slider dragging
    const existingTimer = debounceTimersRef.current.get("global");
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      debounceTimersRef.current.delete("global");
      handleGlobalQualityCommit(val);
    }, 200);

    debounceTimersRef.current.set("global", timer);
  };

  const handleGlobalMaxWidthChange = (val: string) => {
    const width = parseInt(val, 10) || 0;
    setGlobalMaxWidth(width);
    reprocessAll(globalFormat, globalQuality, width);
  };

  const handleItemQualityDrag = (id: string, newQuality: number) => {
    // Immediate UI responsiveness for slider thumb and label without triggering isProcessing re-render
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, customQuality: newQuality } : it))
    );
  };

  const handleItemQualityCommit = (id: string, commitQuality?: number) => {
    const targetItem = itemsRef.current.find((it) => it.id === id);
    if (!targetItem) return;
    const finalQuality = commitQuality ?? targetItem.customQuality ?? globalQuality;
    const newVersion = Date.now();

    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, customQuality: finalQuality, version: newVersion, isProcessing: true }
          : it
      )
    );

    const modified = { ...targetItem, customQuality: finalQuality };
    processSingleItem(modified, globalFormat, globalQuality, globalMaxWidth, newVersion);
  };

  const handleItemQualityChange = (id: string, newQuality: number) => {
    handleItemQualityDrag(id, newQuality);

    // Debounce compression processing for slider drags or automated tests
    const existingTimer = debounceTimersRef.current.get(id);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      debounceTimersRef.current.delete(id);
      handleItemQualityCommit(id, newQuality);
    }, 200);

    debounceTimersRef.current.set(id, timer);
  };

  const handleRemoveItem = (id: string) => {
    const existingTimer = debounceTimersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      debounceTimersRef.current.delete(id);
    }
    setItems((prev) => {
      const found = prev.find((it) => it.id === id);
      if (found && found.previewUrl) {
        URL.revokeObjectURL(found.previewUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleClearAll = () => {
    debounceTimersRef.current.forEach((t) => clearTimeout(t));
    debounceTimersRef.current.clear();
    setZipError(null);
    items.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setItems([]);
  };

  const handleDownloadSingle = (item: ImageItemState) => {
    if (!item.result) return;
    downloadBlob(item.result.blob, item.result.filename);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((item) => item.result && !item.error);
    if (readyItems.length === 0) return;

    setZipError(null);
    setIsZipping(true);
    try {
      // Ensure unique filenames in ZIP
      const nameCounts: Record<string, number> = {};
      const filesForZip = readyItems.map((item) => {
        let name = item.result!.filename;
        if (nameCounts[name] !== undefined) {
          nameCounts[name]++;
          const dotIdx = name.lastIndexOf(".");
          const base = dotIdx !== -1 ? name.substring(0, dotIdx) : name;
          const ext = dotIdx !== -1 ? name.substring(dotIdx) : "";
          name = `${base}_${nameCounts[name]}${ext}`;
        } else {
          nameCounts[name] = 0;
        }
        return {
          name,
          data: item.result!.blob,
        };
      });

      const zipBlob = await createZipArchive(filesForZip);
      downloadBlob(zipBlob, "compressed_images.zip");
    } catch (err: any) {
      setZipError(err?.message || "Failed to create ZIP archive. Please try again.");
    } finally {
      setIsZipping(false);
    }
  };

  // Summary statistics
  const totalOriginalSize = items.reduce((sum, item) => sum + item.file.size, 0);
  const totalCompressedSize = items.reduce(
    (sum, item) => sum + (item.result ? item.result.sizeBytes : item.file.size),
    0
  );
  const totalSavingsBytes = Math.max(0, totalOriginalSize - totalCompressedSize);
  const totalSavingsPercent =
    totalOriginalSize > 0 ? calculateSavings(totalOriginalSize, totalCompressedSize) : 0;
  const isAnyProcessing = items.some((it) => it.isProcessing);
  const readyCount = items.filter((it) => it.result && !it.error).length;

  return (
    <CalcCard
      title={title}
      subtitle={subtitle}
      icon={ImageIcon}
      badge="Batch Engine • 100% Client-Side"
    >
      <div className="space-y-6">
        {/* Global Toolbar Controls */}
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200/60 dark:border-zinc-700/50">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Batch Settings
            </h3>
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-zinc-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All ({items.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CalcSelect
              id="target-format"
              label="Target Format"
              value={globalFormat}
              options={[
                { value: "original", label: "Auto / Original Format" },
                { value: "image/webp", label: "WebP (Next-Gen High Compression)" },
                { value: "image/jpeg", label: "JPEG (Standard Web Photos)" },
                { value: "image/png", label: "PNG (Lossless Transparency)" },
              ]}
              onChange={handleGlobalFormatChange}
            />

            <CalcSlider
              id="global-quality"
              label="Quality"
              value={globalQuality}
              min={1}
              max={100}
              step={1}
              unit="%"
              helpText="Global compression level"
              onChange={handleGlobalQualityChange}
              onCommit={handleGlobalQualityCommit}
            />

            <CalcSelect
              id="max-width-preset"
              label="Max Width"
              value={globalMaxWidth.toString()}
              options={[
                { value: "0", label: "Original (No Resize)" },
                { value: "3840", label: "4K UHD (3840px)" },
                { value: "1920", label: "Full HD (1920px)" },
                { value: "1280", label: "HD (1280px)" },
                { value: "800", label: "Web Standard (800px)" },
              ]}
              onChange={handleGlobalMaxWidthChange}
            />
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
            accept="image/*,.svg"
            aria-label="Upload multiple images"
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
            Drag &amp; drop images here, or click to browse
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Supports PNG, JPG, JPEG, WEBP, SVG • Up to 50 images simultaneously
          </p>
        </div>

        {/* Summary Stats Banner */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Total Images
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

        {/* Card Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const currentQuality = item.customQuality ?? globalQuality;
              const savings = item.result
                ? calculateSavings(item.file.size, item.result.sizeBytes)
                : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between gap-3 relative transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center relative">
                      {item.previewUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-zinc-400" />
                      )}
                      {item.isProcessing && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Metadata & Stats */}
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
                          <X className="w-4 h-4" />
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
                              {formatBytes(item.result.sizeBytes)}
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
                              {item.result.width} × {item.result.height}
                            </span>
                            <span>{item.result.filename.split(".").pop()?.toUpperCase()}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 mt-1">Compressing...</p>
                      )}
                    </div>
                  </div>

                  {/* Card Controls & Download */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                    <div className="flex-1 max-w-[200px]">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mb-1">
                        <label htmlFor={`card-quality-${item.id}`}>Quality</label>
                        <span className="font-mono font-semibold">{currentQuality}%</span>
                      </div>
                      <input
                        id={`card-quality-${item.id}`}
                        type="range"
                        min={1}
                        max={100}
                        step={1}
                        value={currentQuality}
                        disabled={!!item.error}
                        onChange={(e) => handleItemQualityChange(item.id, Number(e.target.value))}
                        onPointerUp={(e) => handleItemQualityCommit(item.id, Number((e.target as HTMLInputElement).value))}
                        onTouchEnd={(e) => handleItemQualityCommit(item.id, Number((e.target as HTMLInputElement).value))}
                        onKeyUp={(e) => {
                          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) {
                            handleItemQualityCommit(item.id, Number((e.target as HTMLInputElement).value));
                          }
                        }}
                        aria-label={`Quality for ${item.file.name}`}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
                      />
                    </div>

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
              {readyCount} of {items.length} images processed and ready for download
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
                  <span>Archiving ZIP...</span>
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
