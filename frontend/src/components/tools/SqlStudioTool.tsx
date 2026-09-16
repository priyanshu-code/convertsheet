"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Database,
  Play,
  Upload,
  Download,
  FileSpreadsheet,
  Clock,
  Sparkles,
  AlertCircle,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { CalcCard } from "@/components/calculator";
import { DuckDbClient } from "@/lib/engines/duckdb-client";
import { TabularData } from "@/types/converter";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";

export function SqlStudioTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM data_table LIMIT 50;");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryTimeMs, setQueryTimeMs] = useState<number | null>(null);
  const [results, setResults] = useState<TabularData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [schemaInfo, setSchemaInfo] = useState<{ column_name: string; column_type: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFileIntoDuckDb = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setIsInitializing(true);
    setErrorMessage(null);
    setResults(null);

    const duckdb = DuckDbClient.getInstance();

    try {
      await duckdb.init();

      const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
      let buffer: Uint8Array;

      if (ext === "xlsx" || ext === "xls") {
        // Convert Excel sheet to CSV buffer for DuckDB
        const arr = await selectedFile.arrayBuffer();
        const wb = XLSX.read(arr, { type: "array" });
        const firstSheet = wb.Sheets[wb.SheetNames[0]];
        const csvText = XLSX.utils.sheet_to_csv(firstSheet);
        buffer = new TextEncoder().encode(csvText);
      } else {
        const arr = await selectedFile.arrayBuffer();
        buffer = new Uint8Array(arr);
      }

      const virtualName = `input_${Date.now()}.${ext === "xlsx" || ext === "xls" ? "csv" : ext}`;
      await duckdb.registerFileBuffer(virtualName, buffer);

      // Create or replace table data_table
      let createTableSql = "";
      if (ext === "parquet") {
        createTableSql = `CREATE OR REPLACE TABLE data_table AS SELECT * FROM read_parquet('${virtualName}');`;
      } else if (ext === "json" || ext === "jsonl") {
        createTableSql = `CREATE OR REPLACE TABLE data_table AS SELECT * FROM read_json_auto('${virtualName}');`;
      } else {
        createTableSql = `CREATE OR REPLACE TABLE data_table AS SELECT * FROM read_csv_auto('${virtualName}', header=True);`;
      }

      await duckdb.execute(createTableSql);

      // Fetch Schema Info
      const schemaData = await duckdb.queryTabular(
        "SELECT column_name, data_type AS column_type FROM information_schema.columns WHERE table_name = 'data_table';"
      );
      setSchemaInfo(schemaData.rows as any);

      // Run initial query
      const startTime = performance.now();
      const initialResults = await duckdb.queryTabular("SELECT * FROM data_table LIMIT 50;");
      const elapsed = Math.round(performance.now() - startTime);

      setQueryTimeMs(elapsed);
      setResults(initialResults);
    } catch (err: any) {
      console.error("DuckDB initialization failed:", err);
      setErrorMessage(err.message || String(err));
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const onDropFiles = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        loadFileIntoDuckDb(files[0]);
      }
    },
    [loadFileIntoDuckDb]
  );

  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    onFiles: onDropFiles,
    multiple: false,
  });

  const handleRunQuery = async () => {
    if (!sqlQuery.trim() || isExecuting) return;

    setIsExecuting(true);
    setErrorMessage(null);

    const duckdb = DuckDbClient.getInstance();
    const startTime = performance.now();

    try {
      const queryRes = await duckdb.queryTabular(sqlQuery);
      const elapsed = Math.round(performance.now() - startTime);
      setQueryTimeMs(elapsed);
      setResults(queryRes);
    } catch (err: any) {
      setErrorMessage(err.message || String(err));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportCsv = () => {
    if (!results || results.rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(results.rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!results || results.rows.length === 0) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results.rows);
    XLSX.utils.book_append_sheet(wb, ws, "Query Results");
    XLSX.writeFile(wb, "query_results.xlsx");
  };

  const resetAll = () => {
    setFile(null);
    setResults(null);
    setSchemaInfo([]);
    setErrorMessage(null);
    setQueryTimeMs(null);
  };

  return (
    <CalcCard
      title="In-Browser SQL Query Studio (DuckDB-Wasm)"
      subtitle="Query massive CSV, Parquet, Excel, and JSON files with full SQL analytics executed 100% inside your browser WebAssembly sandbox."
      icon={Database}
      badge="DuckDB-Wasm Engine"
    >
      <div className="space-y-6">
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
              accept=".csv,.parquet,.xlsx,.xls,.json,.jsonl,.tsv"
              aria-label="Select structured dataset file to query with SQL"
              onChange={(e) => e.target.files?.[0] && loadFileIntoDuckDb(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Drop CSV, Parquet, Excel, or JSON to query with SQL
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Fast in-memory analytical SQL powered by DuckDB WebAssembly • Zero server tracking
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active Table Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-xs">
              <div className="flex items-center gap-2.5">
                <TableIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {file.name}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 ml-2 font-mono">
                    (Registered as table: <code className="text-emerald-600 dark:text-emerald-400 font-bold">data_table</code>)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Close Table</span>
              </button>
            </div>

            {/* Schema Pill Bar */}
            {schemaInfo.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <span className="font-semibold text-zinc-400 uppercase text-[10px] shrink-0 mr-1">
                  Columns:
                </span>
                {schemaInfo.map((col) => (
                  <span
                    key={col.column_name}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono whitespace-nowrap shrink-0 border border-zinc-200 dark:border-zinc-700/60"
                  >
                    <strong>{col.column_name}</strong>:{" "}
                    <span className="text-zinc-400">{col.column_type}</span>
                  </span>
                ))}
              </div>
            )}

            {/* SQL Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="sql-input" className="font-bold text-zinc-700 dark:text-zinc-300">
                  SQL Query:
                </label>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSqlQuery("SELECT * FROM data_table LIMIT 50;")}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Select 50
                  </button>
                  <button
                    type="button"
                    onClick={() => setSqlQuery("SELECT COUNT(*) AS total_rows FROM data_table;")}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Count Rows
                  </button>
                  <button
                    type="button"
                    onClick={() => setSqlQuery("SUMMARIZE data_table;")}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Summarize (Stats)
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-3 shadow-inner">
                <textarea
                  id="sql-input"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleRunQuery();
                    }
                  }}
                  rows={4}
                  className="w-full bg-transparent font-mono text-xs sm:text-sm text-emerald-400 focus:outline-none resize-y leading-relaxed placeholder:text-zinc-600"
                  placeholder="SELECT * FROM data_table LIMIT 50;"
                />

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 mt-2">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">Cmd / Ctrl + Enter</kbd> to execute
                  </span>

                  <button
                    type="button"
                    onClick={handleRunQuery}
                    disabled={isExecuting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isExecuting ? "Executing..." : "Run Query"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="font-mono break-all">{errorMessage}</div>
              </div>
            )}

            {/* Query Results Section */}
            {results && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>
                      Executed in{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100 font-mono">
                        {queryTimeMs}ms
                      </strong>{" "}
                      • Returned{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100 font-mono">
                        {results.rows.length}
                      </strong>{" "}
                      rows
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export .csv</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export .xlsx</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-h-80 shadow-xs">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/80 sticky top-0 border-b border-zinc-200 dark:border-zinc-700 font-sans font-semibold text-zinc-700 dark:text-zinc-300">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center text-zinc-400">#</th>
                        {results.columns.map((col) => (
                          <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {results.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="py-2 px-3 text-center text-zinc-400 font-sans">{idx + 1}</td>
                          {results.columns.map((col) => (
                            <td key={col} className="py-2 px-3 whitespace-nowrap">
                              {String(row[col] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CalcCard>
  );
}
