"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Download,
  Archive,
  RefreshCw,
} from "lucide-react";
import { ConverterConfig } from "@/types/registry";
import { getConverterEngine } from "@/lib/engines";
import { createZipArchive, downloadBlob } from "@/lib/zip-utils";
import { formatBytes } from "@/lib/utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

export interface BatchItem {
  id: string;
  file: File;
  status: "queued" | "converting" | "done" | "error";
  error?: string;
  outputBlob?: Blob | Uint8Array;
  outputName?: string;
}

export interface BatchConverterCardProps {
  config: ConverterConfig;
}

export function BatchConverterCard({ config }: BatchConverterCardProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetExt = config.targetExtension.startsWith(".")
    ? config.targetExtension
    : `.${config.targetExtension}`;

  const acceptedExtensions = [config.sourceExtension, ...(config.additionalExtensions || [])]
    .map((ext) => (ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`));

  const isAccepted = useCallback(
    (file: File) => {
      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
      return acceptedExtensions.includes(ext);
    },
    [acceptedExtensions]
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles = newFiles.filter(isAccepted);
      if (validFiles.length === 0) return;

      setItems((prev) => {
        const existingNames = new Set(prev.map((i) => i.file.name));
        const additions: BatchItem[] = validFiles
          .filter((f) => !existingNames.has(f.name))
          .map((file) => ({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            status: "queued",
          }));
        return [...prev, additions].flat();
      });
    },
    [isAccepted]
  );

  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    onFiles: addFiles,
    accept: isAccepted,
    disabled: isProcessing,
    multiple: true,
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const removeItem = (id: string) => {
    if (isProcessing) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    if (isProcessing) return;
    setItems([]);
  };

  const startBatchConversion = async () => {
    if (items.length === 0 || isProcessing) return;
    if (!config.engineId) return;

    const engine = getConverterEngine(config.engineId);
    if (!engine) return;

    setIsProcessing(true);

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      if (current.status === "done") continue;

      // Update current item to converting
      setItems((prev) =>
        prev.map((it) => (it.id === current.id ? { ...it, status: "converting" } : it))
      );

      try {
        const output = await engine.convert(current.file, {
          sheetName: "Sheet1",
          prettify: true,
          flattenNested: true,
        });

        const baseName = current.file.name.substring(
          0,
          current.file.name.lastIndexOf(".")
        ) || current.file.name;
        const outName = `${baseName}${targetExt}`;

        setItems((prev) =>
          prev.map((it) =>
            it.id === current.id
              ? {
                  ...it,
                  status: "done",
                  outputBlob: (output as any)?.blob || (output as any),
                  outputName: outName,
                }
              : it
          )
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === current.id
              ? {
                  ...it,
                  status: "error",
                  error: err?.message || "Conversion failed",
                }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const downloadAllAsZip = async () => {
    const completed = items.filter((i) => i.status === "done" && i.outputBlob);
    if (completed.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zipFiles = completed.map((item) => ({
        name: item.outputName || `${item.file.name}${targetExt}`,
        data: item.outputBlob!,
      }));

      const zipBlob = await createZipArchive(zipFiles);
      const zipName = `convertsheet_batch_${config.sourceFormat.toLowerCase()}_to_${config.targetFormat.toLowerCase()}.zip`;
      downloadBlob(zipBlob, zipName);
    } catch (err) {
      console.error("ZIP creation failed:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const completedCount = items.filter((i) => i.status === "done").length;
  const progressPercent =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...dragHandlers}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
          isDragOver
            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]"
            : "border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-emerald-500/60 dark:hover:border-emerald-500/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedExtensions.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Drag &amp; drop multiple {config.sourceFormat} files here, or{" "}
              <span className="text-emerald-600 dark:text-emerald-400 underline">browse</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Drop up to 50 files for parallel in-memory conversion ({acceptedExtensions.join(", ")})
            </p>
          </div>
        </div>
      </div>

      {/* Queue & Status Bar */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Batch Queue ({items.length} Files)
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                {completedCount} of {items.length} converted ({progressPercent}%)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors disabled:opacity-40"
              >
                Clear Queue
              </button>

              {completedCount === items.length && items.length > 0 ? (
                <button
                  type="button"
                  onClick={downloadAllAsZip}
                  disabled={isZipping}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {isZipping ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Archive className="w-3.5 h-3.5" />
                  )}
                  <span>Download All as ZIP (.zip)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startBatchConversion}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Convert All ({items.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {items.length > 0 && (
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* File Queue List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80 border border-zinc-100 dark:border-zinc-800 rounded-xl">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {formatBytes(item.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.status === "queued" && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      Queued
                    </span>
                  )}
                  {item.status === "converting" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Converting
                    </span>
                  )}
                  {item.status === "done" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Done
                    </span>
                  )}
                  {item.status === "error" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" title={item.error}>
                      <AlertCircle className="w-2.5 h-2.5" />
                      Failed
                    </span>
                  )}

                  {!isProcessing && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
