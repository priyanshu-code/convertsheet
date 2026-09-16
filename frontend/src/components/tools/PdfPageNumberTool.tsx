"use client";

import React, { useState, useRef } from "react";
import { Hash, Download, UploadCloud, RefreshCw, FileText } from "lucide-react";
import { CalcCard, CalcSelect, CalcResult } from "@/components/calculator";
import { addPageNumbersToPdf } from "@/lib/engines/pdf-engine";
import { formatBytes, cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

export function PdfPageNumberTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [format, setFormat] = useState<"page_x_of_y" | "number_only">("page_x_of_y");
  const [position, setPosition] = useState<"bottom-center" | "bottom-right">("bottom-center");
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
    multiple: false,
    accept: isPdf,
    onFiles: (incomingFiles) => {
      if (incomingFiles[0]) handleFile(incomingFiles[0]);
    },
  });

  const handleFile = async (uploadedFile: File) => {
    setError(null);
    setResult(null);
    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      setFile(uploadedFile);
      setTotalPages(doc.getPageCount());
    } catch (e: any) {
      setError("Failed to open PDF document. The file may be corrupt or password protected.");
    }
  };

  const handleAddNumbers = async () => {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const res = await addPageNumbersToPdf(file, {
        format,
        position,
      });
      const url = URL.createObjectURL(res.blob);
      setResult({
        ...res,
        url,
      });
    } catch (e: any) {
      setError(e.message || "Failed to add page numbers.");
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
    setResult(null);
    setError(null);
  };

  return (
    <CalcCard
      title="Add Page Numbers to PDF"
      subtitle="Stamp clean, professional page numbering onto every page of your PDF documents with customizable position and format."
      icon={Hash}
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
                  Select a PDF document to number
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
                  <span>Add sequential page numbers with zero server uploads</span>
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

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalcSelect
                id="numbering-format"
                label="Numbering Format"
                value={format}
                onChange={(val) => setFormat(val as any)}
                options={[
                  { label: "Page X of Y (e.g. Page 1 of 10)", value: "page_x_of_y" },
                  { label: "1, 2, 3... (Digits Only)", value: "number_only" },
                ]}
                helperText="Select how the page number string should be formatted."
              />

              <CalcSelect
                id="placement-position"
                label="Placement Position"
                value={position}
                onChange={(val) => setPosition(val as any)}
                options={[
                  { label: "Bottom Center", value: "bottom-center" },
                  { label: "Bottom Right", value: "bottom-right" },
                ]}
                helperText="Choose where on the page margin the numbering should appear."
              />
            </div>

            {/* Apply Action Button */}
            <button
              type="button"
              onClick={handleAddNumbers}
              disabled={isProcessing}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Stamping Page Numbers in Browser...</span>
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5" />
                  <span>Add Page Numbers to All {totalPages} Pages</span>
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
              title="Numbered PDF Ready"
              primaryLabel="Pages Numbered"
              primaryValue={`${result.pageCount} Pages Numbered`}
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
                <span>Number Another</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </CalcCard>
  );
}
