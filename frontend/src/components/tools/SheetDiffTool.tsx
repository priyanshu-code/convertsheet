"use client";

import React, { useState, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import { GitCompare, Upload, FileSpreadsheet, Download, Check, AlertCircle, ArrowRight } from "lucide-react";
import { CalcCard } from "@/components/calculator";

export interface DiffCellChange {
  column: string;
  oldVal: any;
  newVal: any;
}

export interface DiffRow {
  index: number;
  type: "identical" | "added" | "removed" | "modified";
  data: Record<string, any>;
  changes?: DiffCellChange[];
}

export function SheetDiffTool() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [rowsA, setRowsA] = useState<Record<string, any>[]>([]);
  const [rowsB, setRowsB] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "changes" | "added" | "removed">("changes");

  const parseFile = async (f: File): Promise<{ headers: string[]; rows: Record<string, any>[] }> => {
    const buffer = await f.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
    const h = json.length > 0 ? Object.keys(json[0]) : [];
    return { headers: h, rows: json };
  };

  const handleFileA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFileA(f);
      const res = await parseFile(f);
      setRowsA(res.rows);
      if (headers.length === 0) setHeaders(res.headers);
    }
  };

  const handleFileB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFileB(f);
      const res = await parseFile(f);
      setRowsB(res.rows);
      // Combine headers
      setHeaders((prev) => Array.from(new Set([...prev, ...res.headers])));
    }
  };

  // Compute diffs
  const diffResults: DiffRow[] = useMemo(() => {
    if (rowsA.length === 0 && rowsB.length === 0) return [];

    const results: DiffRow[] = [];
    const maxLen = Math.max(rowsA.length, rowsB.length);

    for (let i = 0; i < maxLen; i++) {
      const a = rowsA[i];
      const b = rowsB[i];

      if (a && !b) {
        results.push({ index: i + 1, type: "removed", data: a });
      } else if (!a && b) {
        results.push({ index: i + 1, type: "added", data: b });
      } else {
        const changes: DiffCellChange[] = [];
        for (const h of headers) {
          const valA = String(a[h] ?? "");
          const valB = String(b[h] ?? "");
          if (valA !== valB) {
            changes.push({ column: h, oldVal: valA, newVal: valB });
          }
        }

        if (changes.length > 0) {
          results.push({ index: i + 1, type: "modified", data: b, changes });
        } else {
          results.push({ index: i + 1, type: "identical", data: a });
        }
      }
    }

    return results;
  }, [rowsA, rowsB, headers]);

  const stats = useMemo(() => {
    const added = diffResults.filter((r) => r.type === "added").length;
    const removed = diffResults.filter((r) => r.type === "removed").length;
    const modified = diffResults.filter((r) => r.type === "modified").length;
    const identical = diffResults.filter((r) => r.type === "identical").length;
    return { added, removed, modified, identical, total: diffResults.length };
  }, [diffResults]);

  const filteredRows = useMemo(() => {
    switch (filterMode) {
      case "changes":
        return diffResults.filter((r) => r.type !== "identical");
      case "added":
        return diffResults.filter((r) => r.type === "added");
      case "removed":
        return diffResults.filter((r) => r.type === "removed");
      case "all":
      default:
        return diffResults;
    }
  }, [diffResults, filterMode]);

  const exportDiffReport = () => {
    if (diffResults.length === 0) return;
    const reportData = diffResults.map((r) => ({
      Row: r.index,
      Status: r.type.toUpperCase(),
      Changes: r.changes?.map((c) => `${c.column}: '${c.oldVal}' ➔ '${c.newVal}'`).join("; ") || "",
      ...r.data,
    }));

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Diff Report");
    XLSX.writeFile(wb, "convertsheet_diff_summary.xlsx");
  };

  return (
    <CalcCard
      title="Spreadsheet & File Diff Checker"
      subtitle="Compare two CSV or Excel sheets cell-by-cell. Visually highlight added, deleted, and modified values 100% in your browser."
      icon={GitCompare}
      badge="SheetJS Diff Engine"
    >
      <div className="space-y-6">
        {/* Dual Upload Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File A: Original */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-700 dark:text-zinc-300">File A (Original Version)</span>
              {fileA && <span className="text-emerald-600 dark:text-emerald-400 font-mono">Loaded ({rowsA.length} rows)</span>}
            </div>

            <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 cursor-pointer transition-colors text-center">
              <input type="file" accept=".csv,.xlsx,.xls,.tsv" onChange={handleFileA} className="hidden" />
              <FileSpreadsheet className="w-8 h-8 text-zinc-400 mb-2" />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                {fileA ? fileA.name : "Choose or drop File A"}
              </span>
              <span className="text-[10px] text-zinc-400 mt-1">.csv, .xlsx</span>
            </label>
          </div>

          {/* File B: Modified */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-700 dark:text-zinc-300">File B (Modified Version)</span>
              {fileB && <span className="text-emerald-600 dark:text-emerald-400 font-mono">Loaded ({rowsB.length} rows)</span>}
            </div>

            <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 cursor-pointer transition-colors text-center">
              <input type="file" accept=".csv,.xlsx,.xls,.tsv" onChange={handleFileB} className="hidden" />
              <FileSpreadsheet className="w-8 h-8 text-emerald-500 mb-2" />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                {fileB ? fileB.name : "Choose or drop File B"}
              </span>
              <span className="text-[10px] text-zinc-400 mt-1">.csv, .xlsx</span>
            </label>
          </div>
        </div>

        {/* Diff Overview Stats */}
        {fileA && fileB && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase">Modified Rows</span>
                <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{stats.modified}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Added Rows</span>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{stats.added}</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase">Removed Rows</span>
                <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{stats.removed}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">Identical Rows</span>
                <div className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-200">{stats.identical}</div>
              </div>
            </div>

            {/* Filter Pills & Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="inline-flex rounded-xl p-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterMode("changes")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterMode === "changes"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Changes Only ({stats.modified + stats.added + stats.removed})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterMode === "all"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  All Rows ({stats.total})
                </button>
              </div>

              <button
                type="button"
                onClick={exportDiffReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Diff Summary (.xlsx)</span>
              </button>
            </div>

            {/* Diff Table Grid */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-h-96 shadow-xs">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-50 dark:bg-zinc-800/80 sticky top-0 border-b border-zinc-200 dark:border-zinc-700 font-sans font-semibold text-zinc-700 dark:text-zinc-300">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center text-zinc-400">Row</th>
                    <th className="py-2.5 px-3 w-20">Status</th>
                    {headers.map((h) => (
                      <th key={h} className="py-2.5 px-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredRows.slice(0, 100).map((row) => {
                    const isAdded = row.type === "added";
                    const isRemoved = row.type === "removed";
                    const isMod = row.type === "modified";

                    return (
                      <tr
                        key={row.index}
                        className={
                          isAdded
                            ? "bg-emerald-50/60 dark:bg-emerald-950/25 text-emerald-900 dark:text-emerald-200"
                            : isRemoved
                            ? "bg-rose-50/60 dark:bg-rose-950/25 text-rose-900 dark:text-rose-200"
                            : isMod
                            ? "bg-amber-50/40 dark:bg-amber-950/15"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300"
                        }
                      >
                        <td className="py-2 px-3 text-center text-zinc-400 font-sans">{row.index}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              isAdded
                                ? "bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100"
                                : isRemoved
                                ? "bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100"
                                : isMod
                                ? "bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        {headers.map((h) => {
                          const change = row.changes?.find((c) => c.column === h);
                          if (change) {
                            return (
                              <td key={h} className="py-2 px-3 whitespace-nowrap bg-amber-100/70 dark:bg-amber-900/30 font-bold">
                                <span className="line-through text-rose-500 mr-1.5">{change.oldVal}</span>
                                <span className="text-emerald-600 dark:text-emerald-400">{change.newVal}</span>
                              </td>
                            );
                          }
                          return (
                            <td key={h} className="py-2 px-3 whitespace-nowrap">
                              {String(row.data[h] ?? "")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CalcCard>
  );
}
