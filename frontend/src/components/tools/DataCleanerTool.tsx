"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  ShieldCheck,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Eye,
  Sliders,
} from "lucide-react";
import { CalcCard } from "@/components/calculator";
import { anonymizeTable, AnonymizerRules, AnonymizeResult } from "@/lib/anonymizer-utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

export function DataCleanerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [cleanResult, setCleanResult] = useState<AnonymizeResult | null>(null);
  const [activeTab, setActiveTab] = useState<"clean" | "raw">("clean");
  const [rules, setRules] = useState<AnonymizerRules>({
    maskEmails: true,
    maskPhones: true,
    maskCreditCards: true,
    maskSsn: true,
    normalizeDates: true,
    trimWhitespace: true,
    deduplicateRows: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const json: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      if (json.length > 0) {
        const detectedHeaders = Object.keys(json[0]);
        setHeaders(detectedHeaders);
        setRawRows(json);

        // Run initial anonymization
        const result = anonymizeTable(detectedHeaders, json, rules);
        setCleanResult(result);
      }
    } catch (err) {
      console.error("Failed to parse file for cleaning:", err);
    }
  }, [rules]);

  const onDropFiles = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        parseFile(files[0]);
      }
    },
    [parseFile]
  );

  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    onFiles: onDropFiles,
    multiple: false,
  });

  const handleApplyRules = () => {
    if (headers.length === 0 || rawRows.length === 0) return;
    const result = anonymizeTable(headers, rawRows, rules);
    setCleanResult(result);
  };

  const handleExportCsv = () => {
    if (!cleanResult || cleanResult.rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(cleanResult.rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anonymized_${file?.name?.replace(/\.[^/.]+$/, "") || "dataset"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!cleanResult || cleanResult.rows.length === 0) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(cleanResult.rows);
    XLSX.utils.book_append_sheet(wb, ws, "Cleaned Data");
    XLSX.writeFile(wb, `anonymized_${file?.name?.replace(/\.[^/.]+$/, "") || "dataset"}.xlsx`);
  };

  const resetAll = () => {
    setFile(null);
    setHeaders([]);
    setRawRows([]);
    setCleanResult(null);
  };

  return (
    <CalcCard
      title="Client-Side Data Cleaner & PII Anonymizer"
      subtitle="Mask sensitive customer personal data (PII), emails, phone numbers, and payment details 100% in-browser before sharing or analyzing spreadsheets."
      icon={ShieldCheck}
      badge="Air-Gapped Privacy"
    >
      <div className="space-y-6">
        {/* Upload Zone if no file */}
        {!file ? (
          <div
            {...dragHandlers}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              isDragOver
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-emerald-500/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tsv"
              onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Drop your CSV or Excel file here, or click to browse
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Supports .csv, .xlsx, .xls • Zero data leaves your computer
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active File Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-xs">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {file.name}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 ml-2 font-mono">
                    ({rawRows.length} rows, {headers.length} columns)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Configurable Anonymization Rules Grid */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>Active Anonymization Rules</span>
                </div>

                <button
                  type="button"
                  onClick={handleApplyRules}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-apply Rules</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={!!rules.maskEmails}
                    onChange={(e) => setRules((r) => ({ ...r, maskEmails: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Mask Emails</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={!!rules.maskPhones}
                    onChange={(e) => setRules((r) => ({ ...r, maskPhones: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Mask Phone Numbers</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={!!rules.maskCreditCards}
                    onChange={(e) => setRules((r) => ({ ...r, maskCreditCards: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Redact Credit Cards</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={!!rules.maskSsn}
                    onChange={(e) => setRules((r) => ({ ...r, maskSsn: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Redact SSN / IDs</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={!!rules.normalizeDates}
                    onChange={(e) => setRules((r) => ({ ...r, normalizeDates: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Normalize Dates (ISO)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={!!rules.trimWhitespace}
                    onChange={(e) => setRules((r) => ({ ...r, trimWhitespace: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Trim Whitespace</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={!!rules.deduplicateRows}
                    onChange={(e) => setRules((r) => ({ ...r, deduplicateRows: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Remove Duplicates</span>
                </label>
              </div>
            </div>

            {/* Metrics Badge Summary */}
            {cleanResult && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
                    Cells Masked
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {cleanResult.stats.maskedCells}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center">
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                    Duplicates Removed
                  </span>
                  <div className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {cleanResult.stats.rowsRemoved}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center">
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                    Final Row Count
                  </span>
                  <div className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {cleanResult.stats.totalRows}
                  </div>
                </div>
              </div>
            )}

            {/* Table Preview with Clean vs Raw toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-xl p-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("clean")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activeTab === "clean"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Cleaned Preview ({cleanResult?.rows.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("raw")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activeTab === "raw"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Raw Input ({rawRows.length})
                  </button>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .csv</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .xlsx</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-h-80 shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/80 sticky top-0 border-b border-zinc-200 dark:border-zinc-700 font-sans font-semibold text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center text-zinc-400">#</th>
                      {headers.map((h) => (
                        <th key={h} className="py-2.5 px-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {(activeTab === "clean" ? cleanResult?.rows : rawRows)
                      ?.slice(0, 50)
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="py-2 px-3 text-center text-zinc-400 font-sans">{idx + 1}</td>
                          {headers.map((h) => (
                            <td key={h} className="py-2 px-3 whitespace-nowrap">
                              {String(row[h] ?? "")}
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
    </CalcCard>
  );
}
