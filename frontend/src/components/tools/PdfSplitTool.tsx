"use client";

import React, { useState, useRef } from "react";
import { Scissors, Download, UploadCloud, RefreshCw, FileText, Check } from "lucide-react";
import { CalcCard, CalcInput, CalcResult } from "@/components/calculator";
import { splitPdfFile } from "@/lib/engines/pdf-engine";
import { formatBytes } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";

export function PdfSplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>("1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    filename: string;
    pageCount: number;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (uploadedFile: File) => {
    setError(null);
    setResult(null);
    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const count = doc.getPageCount();
      setFile(uploadedFile);
      setTotalPages(count);
      setPageRange(count > 1 ? `1-${Math.min(count, 3)}` : "1");
    } catch (e: any) {
      setError("Failed to open PDF document. The file may be corrupt or password protected.");
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const res = await splitPdfFile(file, pageRange);
      const url = URL.createObjectURL(res.blob);
      setResult({
        ...res,
        url,
      });
    } catch (e: any) {
      setError(e.message || "Failed to extract pages.");
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
    setFile(null);
    setTotalPages(0);
    setPageRange("1");
    setResult(null);
    setError(null);
  };

  const applyPreset = (preset: "all" | "first" | "odd" | "even" | "last") => {
    if (totalPages === 0) return;
    if (preset === "all") {
      setPageRange(totalPages === 1 ? "1" : `1-${totalPages}`);
    } else if (preset === "first") {
      setPageRange("1");
    } else if (preset === "last") {
      setPageRange(totalPages.toString());
    } else if (preset === "odd") {
      const odds = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p % 2 !== 0);
      setPageRange(odds.join(", "));
    } else if (preset === "even") {
      const evens = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p % 2 === 0);
      setPageRange(evens.length ? evens.join(", ") : "2");
    }
  };

  return (
    <CalcCard
      title="Split PDF & Extract Pages"
      subtitle="Extract specific pages or page ranges from any PDF document quickly and securely in your browser."
      icon={Scissors}
      badge="100% Client-Side"
    >
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-800/30 group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Select a PDF document to split
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Extract single pages, ranges, or custom subsets with 100% privacy.
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Choose PDF File
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected File Card */}
            <div className="p-4 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatBytes(file.size)} • {totalPages} {totalPages === 1 ? "page" : "pages"} total
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
              >
                Change File
              </button>
            </div>

            {/* Page Range Input */}
            <div className="space-y-2">
              <CalcInput
                id="pages-to-extract"
                label="Pages to Extract"
                value={pageRange}
                onChange={setPageRange}
                placeholder="e.g. 1-3, 5, 8-10"
                helpText={`Specify page numbers between 1 and ${totalPages}. Use commas or dashes.`}
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Presets:
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset("all")}
                  className="px-2.5 py-1 text-xs rounded-md bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  All Pages
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("first")}
                  className="px-2.5 py-1 text-xs rounded-md bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  First Page
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("odd")}
                  className="px-2.5 py-1 text-xs rounded-md bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Odd Pages
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("even")}
                  className="px-2.5 py-1 text-xs rounded-md bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Even Pages
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("last")}
                  className="px-2.5 py-1 text-xs rounded-md bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Last Page
                </button>
              </div>
            </div>

            {/* Split Action Button */}
            <button
              type="button"
              onClick={handleSplit}
              disabled={isProcessing || !pageRange.trim()}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Extracting Pages in Browser...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" />
                  <span>Extract Pages</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Result & Download */}
        {result && (
          <div className="pt-2 space-y-4">
            <CalcResult
              title="Extracted PDF Ready"
              primaryLabel="Pages Extracted"
              primaryValue={`${result.pageCount} Pages Extracted`}
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
                <span>Split Another</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </CalcCard>
  );
}
