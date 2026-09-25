"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
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
  Clipboard,
  AlignLeft,
  RotateCcw,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { CalcCard } from "@/components/calculator";
import { anonymizeTable, AnonymizerRules, AnonymizeResult } from "@/lib/anonymizer-utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";
import { cn } from "@/lib/utils";

const SAMPLE_PII_CSV = `name,email,phone,ssn,credit_card,notes
Alice Johnson,alice.johnson@corp.com,555-019-2831,123-45-6789,4532-1182-9921-3819,VIP Corporate Account
Bob Miller,bob.m@service.net,+1 (555) 234-5678,987-65-4321,5424-0012-3456-7890,Annual billing renewal
Carol Danvers,carol.danvers@hero.org,555-882-1920,332-91-8842,3782-822463-10005,Standard subscriber`;

export function DataCleanerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [cleanResult, setCleanResult] = useState<AnonymizeResult | null>(null);
  const [activeTab, setActiveTab] = useState<"clean" | "raw">("clean");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
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

  const handleParsePastedData = useCallback(
    (textToParse?: string) => {
      setPasteError(null);
      const content = (textToParse !== undefined ? textToParse : pastedText).trim();
      if (!content) {
        setPasteError("Please enter or paste tabular CSV or TSV data.");
        return;
      }

      try {
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.meta.fields && results.data.length > 0) {
              const detectedHeaders = results.meta.fields;
              const rows = results.data as Record<string, any>[];
              setFile(new File([content], "pasted-dataset.csv", { type: "text/csv" }));
              setHeaders(detectedHeaders);
              setRawRows(rows);
              const res = anonymizeTable(detectedHeaders, rows, rules);
              setCleanResult(res);
            } else {
              setPasteError("Could not detect columns. Ensure your data has a header row.");
            }
          },
          error: (err: any) => {
            setPasteError(err.message);
          },
        });
      } catch (err: any) {
        setPasteError(`Failed to parse data: ${err.message}`);
      }
    },
    [pastedText, rules]
  );

  const handleFormatPastedData = useCallback(() => {
    const trimmed = pastedText.trim();
    if (!trimmed) return;
    const cleaned = trimmed
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
    setPastedText(cleaned);
  }, [pastedText]);

  const handleLoadSampleData = useCallback(() => {
    setPastedText(SAMPLE_PII_CSV);
    setPasteError(null);
    handleParsePastedData(SAMPLE_PII_CSV);
  }, [handleParsePastedData]);

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
        {/* Upload Zone or Paste Editor if no file */}
        {!file ? (
          <div className="space-y-4">
            {/* Input Mode Switcher */}
            <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl w-fit border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-medium">
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                  inputMode === "upload"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode("paste")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                  inputMode === "paste"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <Clipboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Paste CSV / TSV</span>
              </button>
            </div>

            {inputMode === "upload" ? (
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
                  aria-label="Select CSV or Excel file to clean"
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
              <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-5 transition-all space-y-3">
                {/* Paste Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 py-1.5 px-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-300 shadow-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleLoadSampleData}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 transition cursor-pointer font-medium"
                      title="Load sample customer dataset with PII"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Load Sample PII</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFormatPastedData}
                      disabled={!pastedText.trim()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer font-medium"
                      title="Trim whitespace from rows"
                    >
                      <AlignLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      <span>Format</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPastedText("");
                        setPasteError(null);
                      }}
                      disabled={!pastedText.trim()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer font-medium"
                      title="Clear textarea"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    {pastedText.length.toLocaleString()} chars
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={pastedText}
                    onChange={(e) => {
                      setPastedText(e.target.value);
                      if (pasteError) setPasteError(null);
                    }}
                    placeholder={`Paste CSV data with customer info here:\n\nname,email,phone,ssn,credit_card\nAlice Johnson,alice.j@corp.com,555-019-2831,123-45-6789,4532-1182-9921-3819\nBob Miller,bob.m@service.net,555-234-5678,987-65-4321,5424-0012-3456-7890`}
                    aria-label="Paste CSV data to anonymize"
                    rows={8}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y min-h-[200px]"
                  />
                </div>

                {pasteError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-400 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{pasteError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleParsePastedData()}
                    disabled={!pastedText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <span>Parse &amp; Clean Data</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
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
