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

export function SplitJsonInput({
  config,
  onFileSelect,
  disabled = false,
  className,
}: SplitJsonInputProps) {
  const [text, setText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedExtensions = [
    config.sourceExtension,
    ...(config.additionalExtensions || [".txt"]),
  ];

  const acceptAttribute = [
    ...acceptedExtensions,
    ...(config.acceptedMimeTypes || [
      "application/json",
      "text/json",
      "text/plain",
    ]),
  ].join(",");

  const jsonValidation = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { isValid: false, isEmpty: true, error: null, recordCount: 0, isArray: false };
    }
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
  }, [text]);

  const handleParseText = useCallback(
    (contentToParse?: string) => {
      const raw = contentToParse !== undefined ? contentToParse : text;
      const trimmed = raw.trim();
      if (!trimmed || disabled) return;

      try {
        JSON.parse(trimmed);
      } catch {
        return;
      }

      const file = new File([trimmed], "input.json", {
        type: "application/json",
      });
      onFileSelect(file);
    },
    [text, disabled, onFileSelect]
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
    setText(SAMPLE_JSON_STRING);
  }, [disabled]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    setText("");
  }, [disabled]);

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
        "grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      {/* Left Panel: Monospace JSON Textarea with Validation & Quick Actions */}
      <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-5 transition-all">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileCode2 className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Paste JSON Data
            </span>

            {/* Validation badge */}
            {!jsonValidation.isEmpty && (
              jsonValidation.isValid ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Valid JSON</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  <span>Invalid JSON</span>
                </span>
              )
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              title="Paste from Clipboard"
            >
              <Clipboard className="w-3 h-3" />
              <span>Paste from Clipboard</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              title="Load Sample JSON"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Load Sample JSON</span>
            </button>
            {text && (
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Clear"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Monospace JSON Textarea */}
        <div className="relative flex-1 min-h-[220px]">
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
            aria-label="Paste JSON data"
            placeholder={`[\n  {\n    "id": 1,\n    "title": "Data Pipeline",\n    "active": true\n  }\n]`}
            className={cn(
              "w-full h-full min-h-[220px] resize-none rounded-xl border bg-white dark:bg-zinc-950 p-3.5 font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2",
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
              <span>Paste JSON array or single object</span>
            ) : jsonValidation.isValid ? (
              <span className="flex items-center gap-1.5 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {jsonValidation.isArray
                    ? `${jsonValidation.recordCount} records detected`
                    : "Single object"}
                </span>
                <span>•</span>
                <span>{text.length} chars</span>
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-medium truncate max-w-xs">
                Syntax error: {jsonValidation.error}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleParseText()}
            disabled={disabled || !jsonValidation.isValid}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>Parse JSON &amp; Preview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Panel: Integrated File Dropzone */}
      <div className="flex flex-col">
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
            "border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all duration-200 cursor-pointer select-none outline-none min-h-[280px]",
            isDragOver
              ? "border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/10 scale-[1.005]"
              : "border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {/* Upload icon circle */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200",
              isDragOver
                ? "scale-110 bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105"
            )}
          >
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Or upload your JSON file
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
            Drag and drop a JSON file here, or{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-4 group-hover:text-emerald-500">
              browse
            </span>
          </p>

          {/* Accepted formats pills */}
          <div className="flex flex-wrap items-center justify-center gap-1 mb-4">
            {acceptedExtensions.map((ext) => (
              <span
                key={ext}
                className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
              >
                {ext}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Processed 100% locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
