"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Image as ImageIcon,
  Download,
  UploadCloud,
  RefreshCw,
  Check,
  Trash2,
  X,
} from "lucide-react";
import {
  CalcCard,
  CalcSelect,
  CalcSlider,
  CalcResult,
} from "@/components/calculator";
import { convertImage, ImageConversionResult } from "@/lib/engines/image-engine";
import { createZipArchive, downloadBlob } from "@/lib/zip-utils";
import { formatBytes, cn } from "@/lib/utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

export interface ConvertedItem {
  id: string;
  file: File;
  result?: ImageConversionResult;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

export interface ImageConverterToolProps {
  defaultTargetFormat?: "image/webp" | "image/png" | "image/jpeg";
  title?: string;
  subtitle?: string;
}

export function ImageConverterTool({
  defaultTargetFormat = "image/webp",
  title = "In-Browser Image Converter & Compressor",
  subtitle = "Convert images between WebP, PNG, JPEG, and SVG directly in your browser with zero server uploads.",
}: ImageConverterToolProps) {
  const [items, setItems] = useState<ConvertedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<"image/webp" | "image/png" | "image/jpeg">(defaultTargetFormat);
  const [quality, setQuality] = useState<number>(85);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const batchTokenRef = useRef<number>(0);
  const itemsRef = useRef<ConvertedItem[]>(items);
  itemsRef.current = items;

  // Active preview item
  const activeItem = items.find((i) => i.id === selectedId) || items[0] || null;

  // Process batch of items with concurrency limit = 4
  const runBatch = useCallback(
    async (
      itemsToProcess: ConvertedItem[],
      format: "image/webp" | "image/png" | "image/jpeg",
      q: number,
      w: number
    ) => {
      if (itemsToProcess.length === 0) return;
      const currentToken = ++batchTokenRef.current;

      setItems((prev) =>
        prev.map((it) =>
          itemsToProcess.some((p) => p.id === it.id)
            ? { ...it, status: "pending" }
            : it
        )
      );

      const poolLimit = 4;
      const executing = new Set<Promise<void>>();

      for (const item of itemsToProcess) {
        if (currentToken !== batchTokenRef.current) break;

        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "processing" } : it))
        );

        const task: Promise<void> = (async () => {
          try {
            const res = await convertImage(item.file, {
              format,
              quality: q / 100,
              maxWidth: w,
            });
            if (currentToken === batchTokenRef.current) {
              setItems((prev) =>
                prev.map((it) =>
                  it.id === item.id
                    ? { ...it, status: "done", result: res, error: undefined }
                    : it
                )
              );
            }
          } catch (err: any) {
            if (currentToken === batchTokenRef.current) {
              setItems((prev) =>
                prev.map((it) =>
                  it.id === item.id
                    ? {
                        ...it,
                        status: "error",
                        error: err?.message || "Failed to process image",
                      }
                    : it
                )
              );
            }
          }
        })();

        executing.add(task);
        task.finally(() => executing.delete(task));

        if (executing.size >= poolLimit) {
          await Promise.race(executing);
        }
      }
      await Promise.all(executing);
    },
    []
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;
      const newItems: ConvertedItem[] = files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        status: "pending",
      }));

      setItems((prev) => [...prev, ...newItems]);
      runBatch(newItems, targetFormat, quality, maxWidth);
    },
    [targetFormat, quality, maxWidth, runBatch]
  );

  const isImage = (f: File) =>
    f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".svg");

  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    multiple: true,
    accept: isImage,
    onFiles: (files) => {
      if (files.length > 0) handleFiles(files);
    },
  });

  // Live auto-update when settings change
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (itemsRef.current.length === 0) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      runBatch(itemsRef.current, targetFormat, quality, maxWidth);
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [targetFormat, quality, maxWidth, runBatch]);

  const handleDownloadItem = (item: ConvertedItem) => {
    if (!item.result) return;
    downloadBlob(item.result.blob, item.result.filename);
  };

  const completedItems = items.filter(
    (it): it is ConvertedItem & { result: ImageConversionResult } =>
      it.status === "done" && !!it.result
  );

  const handleDownloadZip = async () => {
    if (completedItems.length === 0) return;
    setIsArchiving(true);
    try {
      const entries = completedItems.map((item) => ({
        name: item.result.filename,
        data: item.result.blob,
      }));
      const zipBlob = await createZipArchive(entries);
      downloadBlob(zipBlob, "converted-images.zip");
    } catch (err: any) {
      console.error("ZIP creation failed:", err);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleClearAll = () => {
    batchTokenRef.current++;
    setItems([]);
    setSelectedId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const totalOriginalSize = items.reduce((acc, it) => acc + it.file.size, 0);
  const totalConvertedSize = completedItems.reduce(
    (acc, it) => acc + it.result.sizeBytes,
    0
  );
  const overallRatio =
    totalOriginalSize > 0 && totalConvertedSize > 0
      ? Math.round((1 - totalConvertedSize / totalOriginalSize) * 100)
      : 0;

  const isAnyProcessing = items.some(
    (it) => it.status === "processing" || it.status === "pending"
  );

  const activeRatio =
    activeItem && activeItem.result
      ? Math.round((1 - activeItem.result.sizeBytes / activeItem.file.size) * 100)
      : 0;

  return (
    <CalcCard
      title={title}
      subtitle={subtitle}
      icon={ImageIcon}
      badge="100% Client-Side"
      privacyScope="file"
    >
      <div className="space-y-6">
        {/* Hidden File Input for dropzone and "Add More Images" */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.svg"
          aria-label="Select image file to convert"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) handleFiles(files);
            e.target.value = "";
          }}
        />

        {/* Upload Dropzone when empty */}
        {items.length === 0 ? (
          <div
            {...dragHandlers}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={cn(
              "border border-dashed rounded-xl p-4 sm:p-8 text-center cursor-pointer transition-all bg-zinc-50/60 dark:bg-zinc-800/30 group focus:outline-none focus:ring-2 focus:ring-emerald-500",
              isDragOver
                ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2.5 sm:mb-4 transition-transform",
                isDragOver
                  ? "bg-emerald-600 text-white scale-110"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110"
              )}
            >
              <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Click to choose an image, drag &amp; drop, or paste
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
              <span>Supports WEBP, PNG, JPG, JPEG, and SVG up to 50MB</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold shadow-xs">
                  Ctrl / ⌘ + V
                </kbd>
                <span>to paste</span>
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {items.length} {items.length === 1 ? "Image" : "Images"} in Batch
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Original: {formatBytes(totalOriginalSize)}
                    {completedItems.length > 0 && (
                      <span>
                        {" • Converted: "}
                        {formatBytes(totalConvertedSize)}
                        {" ("}
                        {overallRatio > 0 ? `-${overallRatio}%` : `${Math.abs(overallRatio)}%`}
                        {")"}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Add More Images
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <CalcSelect
                  id="target-format"
                  label="Target Format"
                  value={targetFormat}
                  options={[
                    { value: "image/webp", label: "WEBP (Next-Gen High Compression)" },
                    { value: "image/png", label: "PNG (Lossless Transparency)" },
                    { value: "image/jpeg", label: "JPEG / JPG (Standard Web)" },
                  ]}
                  onChange={(val) => setTargetFormat(val as any)}
                />
              </div>

              <CalcSlider
                id="image-quality"
                label="Quality"
                value={quality}
                onChange={setQuality}
                min={10}
                max={100}
                step={5}
                unit="%"
                helpText="Live compression quantization"
              />

              <CalcSlider
                id="max-width"
                label="Max Width Resize"
                value={maxWidth}
                onChange={setMaxWidth}
                min={320}
                max={3840}
                step={80}
                unit="px"
                helpText="Live downscale resolution limit"
              />
            </div>

            {/* Batch Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={completedItems.length === 0 || isArchiving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  {isArchiving
                    ? "Creating ZIP..."
                    : `Download All as ZIP (${completedItems.length})`}
                </button>
              </div>

              {isAnyProcessing && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Processing conversions...
                </span>
              )}
            </div>

            {/* Compact File List */}
            <div className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-900/40 divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              {items.map((item) => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 py-2.5 px-2 rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                        : "hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                    )}
                  >
                    {/* Thumbnail & File Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {item.result?.dataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.result.dataUrl}
                            alt={item.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-1.5">
                          <span>{formatBytes(item.file.size)}</span>
                          {item.result && (
                            <>
                              <span>→</span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                {item.result.filename}
                              </span>
                              <span>({formatBytes(item.result.sizeBytes)})</span>
                            </>
                          )}
                          {item.status === "error" && (
                            <span className="text-red-500 font-medium">
                              {item.error || "Failed"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === "processing" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span className="hidden sm:inline">Converting</span>
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ready</span>
                        </span>
                      )}
                      {item.result && (
                        <button
                          type="button"
                          aria-label={`Download ${item.file.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadItem(item);
                          }}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                          title={`Download ${item.result.filename}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={`Remove ${item.file.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                        title="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metrics for selected/active item */}
            {activeItem && activeItem.result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <CalcResult
                  title="Resolution"
                  primaryLabel="Dimensions"
                  primaryValue={`${activeItem.result.width} × ${activeItem.result.height}`}
                />
                <CalcResult
                  title="New File Size"
                  primaryLabel="Compressed Size"
                  primaryValue={formatBytes(activeItem.result.sizeBytes)}
                />
                <CalcResult
                  title="Savings"
                  primaryLabel="Size Reduction"
                  primaryValue={
                    activeRatio > 0 ? `-${activeRatio}%` : `${Math.abs(activeRatio)}%`
                  }
                  primarySubtext={
                    activeRatio > 0 ? "Saved bandwidth" : "Uncompressed gain"
                  }
                />
                <CalcResult
                  title="Format"
                  primaryLabel="File Type"
                  primaryValue={targetFormat.split("/")[1].toUpperCase()}
                />
              </div>
            )}

            {/* Visual Preview for selected/active item */}
            {activeItem && activeItem.result && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider">
                    Real-time Output Preview
                  </span>
                  <span>
                    {activeItem.result.width} × {activeItem.result.height} px
                  </span>
                </div>
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 flex items-center justify-center overflow-hidden min-h-[220px] max-h-[480px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeItem.result.dataUrl}
                    alt="Converted output preview"
                    className="max-h-[440px] max-w-full rounded-lg object-contain shadow-sm transition-all duration-150"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CalcCard>
  );
}
