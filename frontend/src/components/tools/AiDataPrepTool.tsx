"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Sparkles,
  Upload,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Trash2,
  Sliders,
  Table,
  Code2,
  FileText,
  AlertTriangle,
  Info,
  DollarSign,
  Cpu,
  Layers,
  ArrowRight,
  AlignLeft,
  RotateCcw,
  Clipboard,
} from "lucide-react";
import { CalcCard } from "@/components/calculator";
import { cn } from "@/lib/utils";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";
import {
  LlmRole,
  TargetFormat,
  ColumnMapping,
  AiDataPrepOptions,
  guessColumnRoles,
  convertTabularToLlm,
  SAMPLE_DATASETS,
} from "@/lib/engines/ai-dataset-engine";

const ROLE_OPTIONS: { value: LlmRole; label: string; color: string }[] = [
  { value: "user", label: "User Prompt (Input)", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800" },
  { value: "assistant", label: "Assistant Output (Target)", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800" },
  { value: "system", label: "System Prompt", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800" },
  { value: "context", label: "RAG Context / Doc", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800" },
  { value: "metadata", label: "Metadata (Ignored in prompt)", color: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" },
  { value: "ignore", label: "Exclude Column", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800" },
];

const FORMAT_OPTIONS: { id: TargetFormat; title: string; subtitle: string; icon: string }[] = [
  { id: "openai-chat", title: "OpenAI Chat JSONL", subtitle: "GPT-4o, GPT-4o-mini & o1 fine-tuning format", icon: "🤖" },
  { id: "anthropic-messages", title: "Anthropic Claude JSONL", subtitle: "Claude 3.5 Sonnet & Haiku messages format", icon: "🧠" },
  { id: "alpaca", title: "Alpaca / Instruction JSONL", subtitle: "Llama 3, Mistral, and Qwen instruction tuning", icon: "🦙" },
  { id: "sharegpt", title: "ShareGPT Format", subtitle: "Multi-turn conversations array", icon: "💬" },
  { id: "rag-markdown", title: "Markdown Context Table", subtitle: "Clean Markdown table to paste into ChatGPT/Claude", icon: "📋" },
  { id: "raw-jsonl", title: "Standard Key-Value JSONL", subtitle: "Plain JSON Lines for database ingestion", icon: "📄" },
];

export function AiDataPrepTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("openai-chat");
  const [globalSystemPrompt, setGlobalSystemPrompt] = useState<string>("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"jsonl" | "json" | "table" | "markdown">("jsonl");
  const [copied, setCopied] = useState(false);

  const [options, setOptions] = useState<AiDataPrepOptions>({
    dropEmptyRows: true,
    trimWhitespace: true,
    normalizeQuotes: true,
    maskPii: false,
    deduplicate: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Parse Raw Tabular Data (CSV, Excel, JSON)
  const processParsedData = useCallback((detectedHeaders: string[], rows: Record<string, any>[], name: string) => {
    setFileName(name);
    setHeaders(detectedHeaders);
    setRawRows(rows);
    const initialMapping = guessColumnRoles(detectedHeaders);
    setColumnMapping(initialMapping);
  }, []);

  const handleParsePastedText = useCallback(() => {
    setPasteError(null);
    const trimmed = pastedText.trim();
    if (!trimmed) {
      setPasteError("Please enter or paste tabular CSV or JSON data.");
      return;
    }

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        const rows = Array.isArray(parsed) ? parsed : [parsed];
        if (rows.length > 0 && typeof rows[0] === "object" && rows[0] !== null) {
          processParsedData(Object.keys(rows[0]), rows, "pasted-dataset.json");
          return;
        } else {
          setPasteError("JSON must be an array of objects or a record object.");
          return;
        }
      } catch (err: any) {
        setPasteError(`Invalid JSON: ${err.message}`);
        return;
      }
    }

    // Default to PapaParse for CSV / TSV
    Papa.parse(trimmed, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields && results.data.length > 0) {
          processParsedData(results.meta.fields, results.data as Record<string, any>[], "pasted-dataset.csv");
        } else {
          setPasteError("Could not detect columns. Ensure your data has a header row.");
        }
      },
      error: (err: any) => {
        setPasteError(err.message);
      },
    });
  }, [pastedText, processParsedData]);

  const handleFormatPastedText = useCallback(() => {
    const trimmed = pastedText.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        setPastedText(JSON.stringify(parsed, null, 2));
        setPasteError(null);
        return;
      } catch {
        // Not valid JSON, continue to CSV formatting
      }
    }
    const cleaned = trimmed
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
    setPastedText(cleaned);
  }, [pastedText]);

  const parseFile = useCallback(
    async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();

      try {
        if (ext === "xlsx" || ext === "xls") {
          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer, { type: "array" });
          const firstSheet = wb.Sheets[wb.SheetNames[0]];
          const json: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
          if (json.length > 0) {
            processParsedData(Object.keys(json[0]), json, file.name);
          }
        } else if (ext === "json") {
          const text = await file.text();
          const parsed = JSON.parse(text);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          if (rows.length > 0 && typeof rows[0] === "object") {
            processParsedData(Object.keys(rows[0]), rows, file.name);
          }
        } else {
          // Default to PapaParse for CSV, TSV, TXT
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.meta.fields && results.data.length > 0) {
                processParsedData(results.meta.fields, results.data as Record<string, any>[], file.name);
              }
            },
          });
        }
      } catch (err) {
        console.error("Failed to parse file for AI dataset prep:", err);
      }
    },
    [processParsedData]
  );

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

  // Load Pre-Baked Sample Dataset
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_DATASETS.find((s) => s.id === sampleId);
    if (!sample) return;
    processParsedData(sample.headers, sample.rows, `${sample.id}-sample.csv`);
  };

  const handleRoleChange = (column: string, role: LlmRole) => {
    setColumnMapping((prev) => ({
      ...prev,
      [column]: role,
    }));
  };

  // Run Real-time Engine
  const processed = useMemo(() => {
    if (headers.length === 0 || rawRows.length === 0) return null;
    return convertTabularToLlm(headers, rawRows, columnMapping, targetFormat, {
      ...options,
      globalSystemPrompt,
    });
  }, [headers, rawRows, columnMapping, targetFormat, options, globalSystemPrompt]);

  const handleCopyClipboard = () => {
    if (!processed) return;
    const content =
      activePreviewTab === "json"
        ? JSON.stringify(processed.jsonArray, null, 2)
        : activePreviewTab === "markdown"
        ? processed.markdownPreview
        : processed.jsonl;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJsonl = () => {
    if (!processed) return;
    const blob = new Blob([processed.jsonl], { type: "application/jsonlines;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = fileName?.replace(/\.[^/.]+$/, "") || "ai_dataset";
    a.download = `${baseName}_${targetFormat}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!processed) return;
    const blob = new Blob([JSON.stringify(processed.jsonArray, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = fileName?.replace(/\.[^/.]+$/, "") || "ai_dataset";
    a.download = `${baseName}_${targetFormat}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFileName(null);
    setHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setGlobalSystemPrompt("");
  };

  return (
    <CalcCard
      title="AI Dataset & JSONL Studio"
      subtitle="Convert CSV, Excel, and JSON data into token-counted training datasets for OpenAI, Anthropic Claude, and Llama fine-tuning. 100% private in-browser execution."
      icon={Sparkles}
      badge="Client-Side Privacy"
    >
      <div className="space-y-6">
        {/* Upload State or DropZone / Paste Editor */}
        {!fileName ? (
          <div className="space-y-4">
            {/* Input Mode Selector */}
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
                <span>Paste CSV / JSON</span>
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
                  accept=".csv,.xlsx,.xls,.tsv,.json"
                  aria-label="Select CSV or Excel file for AI dataset conversion"
                  onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Drop your CSV, Excel, or JSON dataset here, or click to browse
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Supports .csv, .xlsx, .tsv, .json • No file size limit • Processed 100% locally
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-5 transition-all space-y-3">
                {/* Paste Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 py-1.5 px-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-300 shadow-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleFormatPastedText}
                      disabled={!pastedText.trim()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer font-medium"
                      title="Format & clean indentation/whitespace"
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
                    placeholder={`Paste CSV data or JSON array of records here:\n\nExample CSV:\nrole,prompt,completion\nsupport,"How do I reset password?","Click on forgot password link on the login page."\nsupport,"Where is my invoice?","Invoices are sent to your account email on the 1st of every month."`}
                    aria-label="Paste CSV or JSON dataset"
                    rows={9}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y min-h-[220px]"
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
                    onClick={handleParsePastedText}
                    disabled={!pastedText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <span>Parse &amp; Prepare Dataset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Test Pre-baked Samples */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Or test immediately with a ready-to-use sample dataset:</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {SAMPLE_DATASETS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleLoadSample(sample.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/80 text-zinc-800 dark:text-zinc-200 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>⚡ {sample.title}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active File Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-xs">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {fileName}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 ml-2 font-mono">
                    ({rawRows.length} rows, {headers.length} columns)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear File</span>
                </button>
              </div>
            </div>

            {/* Target LLM Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                1. Select Target LLM Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTargetFormat(fmt.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      targetFormat === fmt.id
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-xl shrink-0">{fmt.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {fmt.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                        {fmt.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Column-to-Role Mapper */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    2. Column Role Mapping
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                    Map each spreadsheet header to its functional prompt role.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Auto-detected roles applied</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {headers.map((header) => {
                  const currentRole = columnMapping[header] || "ignore";
                  return (
                    <div
                      key={header}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[160px]" title={header}>
                          {header}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {rawRows[0]?.[header] ? String(rawRows[0][header]).slice(0, 18) + "..." : "empty"}
                        </span>
                      </div>

                      <select
                        value={currentRole}
                        onChange={(e) => handleRoleChange(header, e.target.value as LlmRole)}
                        className="w-full text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 p-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Optional Global System Prompt */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Default System Prompt / Persona (Optional)
                </label>
                <input
                  type="text"
                  value={globalSystemPrompt}
                  onChange={(e) => setGlobalSystemPrompt(e.target.value)}
                  placeholder="e.g. You are a knowledgeable financial assistant. Answer in clear bullet points."
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 p-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Live Token & Cost Metric Cards */}
            {processed && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Total Tokens</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {processed.metrics.totalTokens.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">cl100k BPE estimation</div>
                </div>

                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    <span>Avg Tokens / Row</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {processed.metrics.avgTokensPerRow}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{processed.rowsValid} valid records</div>
                </div>

                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fine-Tune Cost</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    ${processed.metrics.estimatedCostOpenAiFineTune.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">GPT-4o-mini rate</div>
                </div>

                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <Info className="w-3.5 h-3.5 text-purple-500" />
                    <span>128k Context Fit</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {processed.metrics.contextWindowPercentage128k}%
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, processed.metrics.contextWindowPercentage128k)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Data Sanitization Toggles */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 space-y-3">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center justify-between w-full text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sanitization & Quality Guardrails</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {showAdvancedOptions ? "Hide" : "Show Options"}
                </span>
              </button>

              {showAdvancedOptions && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-zinc-700 dark:text-zinc-300 border-t border-zinc-200 dark:border-zinc-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!options.dropEmptyRows}
                      onChange={(e) => setOptions((o) => ({ ...o, dropEmptyRows: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Drop Empty Rows</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!options.deduplicate}
                      onChange={(e) => setOptions((o) => ({ ...o, deduplicate: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Deduplicate Prompts</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!options.normalizeQuotes}
                      onChange={(e) => setOptions((o) => ({ ...o, normalizeQuotes: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Clean Smart Quotes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!options.maskPii}
                      onChange={(e) => setOptions((o) => ({ ...o, maskPii: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Scrub PII (Emails/Phones)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Warnings Alert if rows skipped */}
            {processed && processed.rowsSkipped > 0 && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-bold">{processed.rowsSkipped} rows skipped:</span>{" "}
                  {processed.warnings[0]?.reason || "Filtered by empty/duplicate guardrails"}.
                  {processed.warnings.length > 1 && ` (+${processed.warnings.length - 1} more)`}
                </div>
              </div>
            )}

            {/* Dual-Pane Output & Preview Studio */}
            {processed && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Tabs */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab("jsonl")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        activePreviewTab === "jsonl"
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>JSONL Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePreviewTab("json")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        activePreviewTab === "json"
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>JSON Array</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePreviewTab("markdown")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        activePreviewTab === "markdown"
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>RAG Markdown</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyClipboard}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadJson}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadJsonl}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .JSONL</span>
                    </button>
                  </div>
                </div>

                {/* Code Window Box */}
                <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 font-mono text-xs overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800 text-[11px] text-zinc-400">
                    <span>
                      {activePreviewTab === "jsonl"
                        ? `${processed.rowsValid} records formatted for ${targetFormat}`
                        : activePreviewTab === "json"
                        ? "Formatted JSON Object Array"
                        : "RAG Context Markdown Table"}
                    </span>
                    <span className="text-zinc-500">100% In-Browser Output</span>
                  </div>

                  <div className="max-h-[380px] overflow-auto p-4 leading-relaxed">
                    {activePreviewTab === "jsonl" && (
                      <pre className="whitespace-pre-wrap break-all text-emerald-400/90">
                        {processed.jsonl.slice(0, 15000)}
                        {processed.jsonl.length > 15000 && "\n\n... (truncated preview for performance, full file available via download)"}
                      </pre>
                    )}

                    {activePreviewTab === "json" && (
                      <pre className="whitespace-pre-wrap break-all text-blue-400/90">
                        {JSON.stringify(processed.jsonArray.slice(0, 20), null, 2)}
                        {processed.jsonArray.length > 20 && "\n\n... (previewing first 20 records)"}
                      </pre>
                    )}

                    {activePreviewTab === "markdown" && (
                      <pre className="whitespace-pre-wrap text-zinc-300">
                        {processed.markdownPreview}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CalcCard>
  );
}
