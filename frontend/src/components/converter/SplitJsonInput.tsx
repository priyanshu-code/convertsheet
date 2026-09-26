"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Clipboard,
  FileCode2,
  RotateCcw,
  Sparkles,
  UploadCloud,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  AlignLeft,
  Minimize2,
  FolderOpen,
} from "lucide-react";
import { ConverterConfig } from "@/types/registry";
import { cn } from "@/lib/utils";

export interface SplitJsonInputProps {
  config: ConverterConfig;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

const SAMPLE_JSON_RECORDS = [
  {
    id: "usr_101",
    name: "Sarah Chen",
    email: "sarah.chen@example.ai",
    role: "ML Engineer",
    skills: ["Python", "PyTorch", "VectorDB"],
    active: true,
  },
  {
    id: "usr_102",
    name: "Alex Rivera",
    email: "alex.rivera@example.ai",
    role: "Data Architect",
    skills: ["PostgreSQL", "DuckDB", "Kafka"],
    active: true,
  },
  {
    id: "usr_103",
    name: "Maya Lin",
    email: "maya.lin@example.ai",
    role: "Prompt Engineer",
    skills: ["LangChain", "Evaluation", "Embeddings"],
    active: false,
  },
];

const SAMPLE_JSON_STRING = JSON.stringify(SAMPLE_JSON_RECORDS, null, 2);
const SAMPLE_JSONL_STRING = SAMPLE_JSON_RECORDS.map((r) => JSON.stringify(r)).join("\n");

export function SplitJsonInput({
  config,
  onFileSelect,
  disabled = false,
  className,
}: SplitJsonInputProps) {
  const [text, setText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isJsonl =
    config.sourceFormat === "JSONL" ||
    config.sourceFormat === "NDJSON" ||
    config.sourceExtension === ".jsonl" ||
    config.sourceExtension === ".ndjson";
  const formatName = isJsonl ? "JSONL" : "JSON";

  const acceptedExtensions = [
    config.sourceExtension,
    ...(config.additionalExtensions || [".txt"]),
  ];

  const acceptAttribute = [
    ...acceptedExtensions,
    ...(config.acceptedMimeTypes || [
      "application/json",
      "text/json",
      "application/x-ndjson",
      "application/jsonlines",
      "text/plain",
    ]),
  ].join(",");

  const jsonValidation = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { isValid: false, isEmpty: true, error: null, recordCount: 0, isArray: false };
    }

    if (isJsonl) {
      // Check if user pasted a JSON array into JSONL tool (allow seamless conversion)
      try {
        const parsedArr = JSON.parse(trimmed);
        if (Array.isArray(parsedArr)) {
          return {
            isValid: true,
            isEmpty: false,
            error: null,
            recordCount: parsedArr.length,
            isArray: true,
          };
        }
      } catch {
        // Not a JSON array; check line-by-line JSONL
      }

      const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
      let validCount = 0;
      let syntaxError: string | null = null;
      for (let i = 0; i < lines.length; i++) {
        try {
          JSON.parse(lines[i]);
          validCount++;
        } catch (err: unknown) {
          syntaxError = `Line ${i + 1}: ${err instanceof Error ? err.message : "Syntax error"}`;
          break;
        }
      }

      if (syntaxError) {
        return {
          isValid: false,
          isEmpty: false,
          error: syntaxError,
          recordCount: 0,
          isArray: false,
        };
      }

      return {
        isValid: true,
        isEmpty: false,
        error: null,
        recordCount: validCount,
        isArray: false,
      };
    }

    // Standard JSON validation
    try {
      const parsed = JSON.parse(trimmed);
      const isArr = Array.isArray(parsed);
      const count = isArr ? parsed.length : 1;
      return { isValid: true, isEmpty: false, error: null, recordCount: count, isArray: isArr };
    } catch (err: unknown) {
      return {
        isValid: false,
        isEmpty: false,
        error: err instanceof Error ? err.message : "Syntax error",
        recordCount: 0,
        isArray: false,
      };
    }
  }, [text, isJsonl]);

  const handleParseText = useCallback(
    (contentToParse?: string) => {
      const raw = contentToParse !== undefined ? contentToParse : text;
      const trimmed = raw.trim();
      if (!trimmed || disabled) return;

      let contentToSend = trimmed;
      if (isJsonl) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            // Auto-convert JSON array to clean newline-delimited JSONL lines
            contentToSend = parsed.map((item) => JSON.stringify(item)).join("\n");
          }
        } catch {
          // Already newline-delimited JSONL
        }
      } else {
        try {
          JSON.parse(trimmed);
        } catch {
          return;
        }
      }

      const ext = config.sourceExtension || (isJsonl ? ".jsonl" : ".json");
      const cleanExt = ext.startsWith(".") ? ext : `.${ext}`;
      const fileName = `input${cleanExt}`;
      const mimeType = isJsonl ? "application/x-ndjson" : "application/json";

      const file = new File([contentToSend], fileName, {
        type: mimeType,
      });
      onFileSelect(file);
    },
    [text, disabled, isJsonl, config.sourceExtension, onFileSelect]
  );

  const handlePasteFromClipboard = useCallback(async () => {
    if (disabled) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          setText(clipText);
          handleParseText(clipText);
        }
      }
    } catch {
      // Browser might reject clipboard access or not support it in test env
    }
  }, [disabled, handleParseText]);

  const handleLoadSample = useCallback(() => {
    if (disabled) return;
    setText(isJsonl ? SAMPLE_JSONL_STRING : SAMPLE_JSON_STRING);
  }, [disabled, isJsonl]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    setText("");
  }, [disabled]);

  const handleCopy = useCallback(async () => {
    if (!text || disabled) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Browser might reject clipboard
    }
  }, [text, disabled]);

  const handleFormat = useCallback(() => {
    if (!text.trim() || disabled) return;
    if (isJsonl) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setText(parsed.map((item) => JSON.stringify(item)).join("\n"));
          return;
        }
      } catch {
        // Line-by-line formatting
      }
      const lines = text.trim().split("\n").filter(Boolean);
      const formatted = lines
        .map((l) => {
          try {
            return JSON.stringify(JSON.parse(l.trim()));
          } catch {
            return l.trim();
          }
        })
        .join("\n");
      setText(formatted);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON, keep as is
    }
  }, [text, disabled, isJsonl]);

  const handleRemoveWhitespace = useCallback(() => {
    if (!text.trim() || disabled) return;
    if (isJsonl) {
      const lines = text.trim().split("\n").filter(Boolean);
      const minified = lines
        .map((l) => {
          try {
            return JSON.stringify(JSON.parse(l.trim()));
          } catch {
            return l.trim();
          }
        })
        .join("\n");
      setText(minified);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed));
    } catch {
      const collapsed = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("");
      setText(collapsed);
    }
  }, [text, disabled, isJsonl]);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setIsDragOver(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        onFileSelect(droppedFiles[0]);
      }
    },
    [disabled, onFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        onFileSelect(selectedFiles[0]);
      }
      if (e.target) {
        e.target.value = "";
      }
    },
    [onFileSelect]
  );

  const handleDropzoneClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleDropzoneKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [disabled]
  );

  return (
    <div
      data-testid="split-json-input"
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      {/* Left Panel: Monospace JSON/JSONL Textarea with Validation & Quick Actions */}
      <div className="flex flex-col rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-4 sm:p-5 transition-all min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]">
        {/* Header with Title and Validation Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileCode2 className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Paste {formatName} Data
            </span>

            {/* Validation badge */}
            {!jsonValidation.isEmpty && (
              jsonValidation.isValid ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Valid {formatName}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  <span>Invalid {formatName}</span>
                </span>
              )
            )}
          </div>
        </div>

        {/* Action Toolbar: Single clean row without wrapping */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 py-1.5 px-2 mb-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-300 shadow-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              disabled={disabled}
              aria-label="Paste from Clipboard"
              title="Paste from clipboard"
              className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={disabled || !text}
              aria-label="Copy"
              title={`Copy ${formatName} text`}
              className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleFormat}
              disabled={disabled || !text}
              aria-label="Format"
              title={isJsonl ? "Format lines" : "Prettify JSON with indentation"}
              className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Format</span>
            </button>
            <button
              type="button"
              onClick={handleRemoveWhitespace}
              disabled={disabled || !text}
              aria-label="Remove white space"
              title={isJsonl ? "Compact line-by-line JSONL" : "Minify JSON into compact payload"}
              className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Minify</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || !text}
              aria-label="Clear"
              title="Clear editor"
              className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            disabled={disabled}
            aria-label={`Load Sample ${formatName}`}
            title={`Load Sample ${formatName}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 font-medium rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/70 dark:border-emerald-800/70 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load sample {formatName}</span>
          </button>
        </div>

        {/* Spacious Monospace Textarea */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] lg:min-h-[400px]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleParseText();
              }
            }}
            disabled={disabled}
            aria-label={`Paste ${formatName} data or upload`}
            placeholder={
              isJsonl
                ? `{"id": 1, "title": "Data Pipeline", "active": true}\n{"id": 2, "title": "Model Training", "active": false}`
                : `[\n  {\n    "id": 1,\n    "title": "Data Pipeline",\n    "active": true\n  }\n]`
            }
            className={cn(
              "w-full h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[400px] resize-none rounded-xl border bg-white dark:bg-zinc-950 p-4 font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2",
              !jsonValidation.isEmpty && !jsonValidation.isValid
                ? "border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20"
            )}
            spellCheck={false}
          />
        </div>

        {/* Status Line: Syntax feedback, counters, Parse & Preview button */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {jsonValidation.isEmpty ? (
              <span>Paste {formatName} in the editor or drop a file on the right</span>
            ) : jsonValidation.isValid ? (
              <span className="flex items-center gap-1.5 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {jsonValidation.isArray
                    ? `${jsonValidation.recordCount} records detected`
                    : isJsonl
                    ? `${jsonValidation.recordCount} lines detected`
                    : "Single object"}
                </span>
                <span>•</span>
                <span>{text.length.toLocaleString()} chars</span>
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-medium truncate max-w-xs sm:max-w-md">
                Syntax error: {jsonValidation.error}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleParseText()}
            disabled={disabled || !jsonValidation.isValid}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <span>Parse {formatName} &amp; Preview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Panel: Integrated File Dropzone with Matching Spacious Layout */}
      <div className="flex flex-col h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttribute}
          onChange={handleInputChange}
          onClick={(e) => e.stopPropagation()}
          disabled={disabled}
          className="sr-only hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div
          data-testid="split-json-dropzone-area"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Upload ${config.sourceFormat} file`}
          aria-disabled={disabled}
          onClick={handleDropzoneClick}
          onKeyDown={handleDropzoneKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative flex-1 flex flex-col items-center justify-center text-center",
            "border-2 border-dashed rounded-2xl p-6 sm:p-10 transition-all duration-200 cursor-pointer select-none outline-none min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]",
            isDragOver
              ? "border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/10 scale-[1.005]"
              : "border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {/* Upload icon circle */}
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 shadow-xs",
              isDragOver
                ? "scale-110 bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105"
            )}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
            Or upload your {formatName} file
          </h2>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-sm leading-normal">
            Drag and drop a {formatName} file here, or{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-4 group-hover:text-emerald-500">
              browse
            </span>
          </p>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 dark:group-hover:text-white transition-colors shadow-xs mb-5">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Browse {formatName} file</span>
          </div>

          {/* Accepted formats pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
            {acceptedExtensions.map((ext) => (
              <span
                key={ext}
                className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
              >
                {ext}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Processed 100% locally in your browser • Zero server uploads
          </p>
        </div>
      </div>
    </div>
  );
}
