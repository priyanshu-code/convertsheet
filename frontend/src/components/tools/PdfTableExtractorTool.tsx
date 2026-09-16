"use client";

import React, { useState, useRef } from "react";
import { Table, Download, UploadCloud, RefreshCw, FileText, Copy, Check, FileSpreadsheet } from "lucide-react";
import { CalcCard } from "@/components/calculator";
import { extractPdfTextRows } from "@/lib/engines/pdf-engine";
import { TabularData } from "@/types/converter";
import { formatBytes } from "@/lib/utils";
import * as XLSX from "xlsx";

export function PdfTableExtractorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<TabularData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (uploadedFile: File) => {
    setError(null);
    setData(null);
    setFile(uploadedFile);
    setIsProcessing(true);
    try {
      const extracted = await extractPdfTextRows(uploadedFile);
      setData(extracted);
    } catch (e: any) {
      setError(e.message || "Failed to extract text data from PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportExcel = () => {
    if (!data || !file) return;
    const ws = XLSX.utils.json_to_sheet(data.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ExtractedData");
    const baseName = file.name.replace(/\.pdf$/i, "");
    XLSX.writeFile(wb, `${baseName}_extracted.xlsx`);
  };

  const exportCsv = () => {
    if (!data || !file) return;
    const ws = XLSX.utils.json_to_sheet(data.rows);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = file.name.replace(/\.pdf$/i, "");
    a.download = `${baseName}_extracted.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!data) return;
    const text = JSON.stringify(data.rows, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setData(null);
    setError(null);
  };

  return (
    <CalcCard
      title="PDF Table & Text Extractor to Excel"
      subtitle="Parse structured tables and text streams from PDF documents and export to Excel (.xlsx) or CSV with 100% privacy."
      icon={Table}
      badge="SheetJS Powered"
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
                  Select a PDF to extract tables & text
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Extract tabular data and export directly to Excel (.xlsx) or CSV.
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
            {/* File Info Bar */}
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
                    {formatBytes(file.size)}
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

            {isProcessing && (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Extracting text streams and tabular layout...
                </p>
              </div>
            )}

            {data && (
              <div className="space-y-4">
                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Extracted Data Preview ({data.totalRows} {data.totalRows === 1 ? "row" : "rows"})
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={exportExcel}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportCsv}
                      className="px-3.5 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? "Copied" : "Copy JSON"}</span>
                    </button>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="border border-zinc-200 dark:border-zinc-700/60 rounded-xl overflow-hidden shadow-sm">
                  <div className="max-h-72 overflow-auto">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700/60 text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/80 sticky top-0">
                        <tr>
                          {data.columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-2.5 text-left font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        {data.rows.slice(0, 50).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            {data.columns.map((col) => (
                              <td
                                key={`${rIdx}-${col}`}
                                className="px-4 py-2 text-zinc-800 dark:text-zinc-200 whitespace-nowrap"
                              >
                                {row[col] !== undefined && row[col] !== null ? String(row[col]) : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </CalcCard>
  );
}
