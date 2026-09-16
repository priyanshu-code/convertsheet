"use client";

import React, { useState, useRef } from "react";
import { Files, Download, UploadCloud, RefreshCw, Trash2, ArrowUp, ArrowDown, FileCheck } from "lucide-react";
import { CalcCard, CalcResult } from "@/components/calculator";
import { mergePdfFiles } from "@/lib/engines/pdf-engine";
import { formatBytes, cn } from "@/lib/utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

export function PdfMergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    filename: string;
    pageCount: number;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = (f: File) =>
    f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    multiple: true,
    accept: isPdf,
    onFiles: (incomingFiles) => {
      setError(null);
      setFiles((prev) => [...prev, ...incomingFiles]);
    },
  });

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setError(null);
    const pdfs = Array.from(newFiles).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length === 0) {
      setError("Please select valid PDF documents (.pdf).");
      return;
    }
    setFiles((prev) => [...prev, ...pdfs]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (result) setResult(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    setFiles((prev) => {
      if (index === prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMerge = async () => {
    if (files.length === 0) {
      setError("Please select at least one PDF file to merge.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const merged = await mergePdfFiles(files);
      const url = URL.createObjectURL(merged.blob);
      setResult({
        ...merged,
        url,
      });
    } catch (e: any) {
      setError(e.message || "Failed to merge PDF files.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <CalcCard
      title="Merge PDF Online"
      subtitle="Combine multiple PDF documents into a single organized PDF file in seconds. 100% private in-browser processing."
      icon={Files}
      badge="100% Client-Side"
    >
      <div className="space-y-6">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFileChange(e.target.files);
            e.target.value = "";
          }}
        />

        {/* Dropzone */}
        <div
          {...dragHandlers}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-800/30 group",
            isDragOver
              ? "border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/10 scale-[1.01]"
              : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500"
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "p-4 rounded-2xl transition-transform",
                isDragOver
                  ? "bg-emerald-600 text-white scale-110"
                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110"
              )}
            >
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Click to browse, drag &amp; drop, or paste PDF files
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
                <span>Select multiple PDFs</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold shadow-xs">
                    Ctrl / ⌘ + V
                  </kbd>
                  <span>to paste</span>
                </span>
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Choose PDF Files
            </button>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Files to Merge ({files.length})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                + Add More Files
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveUp(idx)}
                      title="Move Up"
                      className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === files.length - 1}
                      onClick={() => moveDown(idx)}
                      title="Move Down"
                      className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      title="Remove"
                      className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Merge Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleMerge}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Merging PDFs in Browser...</span>
                  </>
                ) : (
                  <>
                    <Files className="w-5 h-5" />
                    <span>Merge {files.length} {files.length === 1 ? "PDF" : "PDFs"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Merge Result & Download */}
        {result && (
          <div className="pt-2 space-y-4">
            <CalcResult
              title="Merged Document Ready"
              primaryLabel="Total Pages"
              primaryValue={`${result.pageCount} Pages`}
              primarySubtext={`Output size: ${formatBytes(result.blob.size)}`}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>Download {result.filename}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Merge Another</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </CalcCard>
  );
}
