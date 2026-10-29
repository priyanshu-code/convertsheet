"use client";

import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Table,
  Eye,
  Code,
  FileCode,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { dispatchMediaJob, pollMediaJobFull } from "@/lib/media-engine-client";
import { StudioDropZone } from "./StudioDropZone";
import { MarkdownDocumentPreview } from "./MarkdownDocumentPreview";

interface MarkdownResult {
  markdown: string;
  page_count?: number;
  table_count?: number;
  mode?: string;
  duration_seconds?: number;
  engine?: string;
}

export function PdfToMarkdownTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"auto" | "fast" | "deep_scan">("auto");
  const [includeTables, setIncludeTables] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<MarkdownResult | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setResult(null);
  };

  const handleClearFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const convertToMarkdown = async () => {
    if (!file) {
      setError("Please select a document file to convert.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (mode !== "auto") {
        formData.append("mode", mode);
      }
      formData.append("include_tables", includeTables ? "true" : "false");
      formData.append("tier", "free");

      const data = await dispatchMediaJob("document/extract-markdown", formData);

      if (data.markdown !== undefined) {
        setResult(data as MarkdownResult);
      } else if (data.job_id) {
        const fullResult = await pollMediaJobFull(data.job_id);
        setResult(fullResult as unknown as MarkdownResult);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to extract markdown. Please verify document formatting and retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyMarkdown = () => {
    if (!result?.markdown) return;
    navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!result?.markdown) return;
    const baseName = file?.name ? file.name.replace(/\.[^/.]+$/, "") : "document";
    const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${baseName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: Upload Card with Native Drag-and-Drop + OS Paste */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            1. Upload Document or Scanned File
          </label>
          <StudioDropZone
            currentFile={file}
            onFileSelect={handleFileSelect}
            onClear={handleClearFile}
            title="Drop PDF or document here, or click to browse"
            subtitle="Supports PDF, DOCX, XLSX, PPTX, TIFF, PNG, JPG • Drag & drop or paste (⌘V)"
            acceptedExtensions={[
              ".pdf",
              ".png",
              ".jpg",
              ".jpeg",
              ".webp",
              ".tiff",
              ".docx",
              ".xlsx",
              ".pptx",
              ".txt",
              ".html",
            ]}
          />
        </div>

        {/* Step 2: Extraction Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setMode("auto")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              mode === "auto"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> Auto-Adaptive
            </div>
            <div className="text-sm font-semibold mt-1">Smart Routing</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Inspects digital text layer; falls back to OCR if scanned.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode("fast")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              mode === "fast"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Layers className="w-3.5 h-3.5" /> Fast Stream
            </div>
            <div className="text-sm font-semibold mt-1">Native Digital PDFs</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Instant sub-second conversion for born-digital files.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode("deep_scan")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              mode === "deep_scan"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <FileCode className="w-3.5 h-3.5" /> Deep Scan OCR
            </div>
            <div className="text-sm font-semibold mt-1">Scans & Complex Tables</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Deep layout understanding & structural table reconstruction.
            </p>
          </button>
        </div>

        {/* Table Extraction Checkbox */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
            <Table className="w-4 h-4 text-emerald-500" />
            <span>Reconstruct Tables as Clean Markdown Grids</span>
          </div>
          <input
            type="checkbox"
            checked={includeTables}
            aria-label="Reconstruct Tables as Clean Markdown Grids"
            onChange={(e) => setIncludeTables(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
          />
        </div>

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={convertToMarkdown}
            disabled={isProcessing || !file}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting Markdown Layout & Tables...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Extract Clean Markdown</span>
              </>
            )}
          </button>
        </div>

        {/* Extracted Output Area */}
        {result && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Extraction Complete
                </span>
                {result.page_count && (
                  <span className="text-zinc-500">
                    <strong>{result.page_count}</strong> {result.page_count === 1 ? "page" : "pages"}
                  </span>
                )}
                {result.table_count !== undefined && (
                  <span className="text-zinc-500">
                    <strong>{result.table_count}</strong> {result.table_count === 1 ? "table" : "tables"} detected
                  </span>
                )}
                {result.duration_seconds && (
                  <span className="text-zinc-400 font-mono">
                    {result.duration_seconds.toFixed(2)}s
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* View Mode Toggle */}
                <div className="flex rounded-xl bg-zinc-200 dark:bg-zinc-700/60 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeTab === "preview"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("raw")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeTab === "raw"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" /> Raw .md
                  </button>
                </div>

                <button
                  type="button"
                  onClick={copyMarkdown}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={downloadMarkdown}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            {/* Markdown Display Container */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-5 sm:p-6 max-h-[750px] overflow-y-auto">
              {activeTab === "preview" ? (
                <MarkdownDocumentPreview
                  markdown={result.markdown}
                  pageCount={result.page_count}
                  tableCount={result.table_count}
                />
              ) : (
                <pre className="font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed select-all">
                  {result.markdown}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Security Reassurance */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Documents are processed in isolated RAM and permanently deleted immediately upon conversion.</span>
        </div>
      </div>
    </div>
  );
}
