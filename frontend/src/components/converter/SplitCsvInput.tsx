"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Clipboard,
  AlignLeft,
  Minimize2,
  ArrowRight,
} from "lucide-react";
import { ConverterConfig } from "@/types/registry";
import { cn } from "@/lib/utils";

export interface SplitCsvInputProps {
  config: ConverterConfig;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

const SAMPLE_CSV = `id,name,email,department,salary,status
1,Alice Johnson,alice.j@example.com,Engineering,125000,Active
2,Bob Smith,bob.s@example.com,Marketing,85000,Active
3,Carol Williams,carol.w@example.com,Product,115000,Active
4,David Brown,david.b@example.com,Design,95000,Pending
5,Emma Davis,emma.d@example.com,Finance,105000,Active`;

const SAMPLE_TSV = `id\tname\temail\tdepartment\tsalary\tstatus
1\tAlice Johnson\talice.j@example.com\tEngineering\t125000\tActive
2\tBob Smith\tbob.s@example.com\tMarketing\t85000\tActive
3\tCarol Williams\tcarol.w@example.com\tProduct\t115000\tActive
4\tDavid Brown\tdavid.b@example.com\tDesign\t95000\tPending
5\tEmma Davis\temma.d@example.com\tFinance\t105000\tActive`;

export function SplitCsvInput({
  config,
  onFileSelect,
  disabled = false,
  className,
}: SplitCsvInputProps) {
  const [text, setText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTsv = config.sourceFormat === "TSV" || config.sourceExtension === ".tsv";
  const formatName = isTsv ? "TSV" : "CSV";

  const acceptedExtensions = [
    config.sourceExtension,
    ...(config.additionalExtensions || [".txt"]),
  ];

  const acceptAttribute = [
    ...acceptedExtensions,
    ...(config.acceptedMimeTypes || [
      "text/csv",
      "text/plain",
      "application/vnd.ms-excel",
    ]),
  ].join(",");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { isEmpty: true, rowCount: 0, charCount: 0 };
    }
    const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
    return {
      isEmpty: false,
      rowCount: lines.length,
      charCount: text.length,
    };
  }, [text]);

  const handleParseText = useCallback(
    (contentToParse?: string) => {
      const raw = contentToParse !== undefined ? contentToParse : text;
      const trimmed = raw.trim();
      if (!trimmed || disabled) return;

      const fileName = isTsv ? "input.tsv" : "input.csv";
      const mimeType = isTsv ? "text/tab-separated-values" : "text/csv";
      const file = new File([trimmed], fileName, { type: mimeType });
      onFileSelect(file);
    },
    [text, disabled, isTsv, onFileSelect]
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
      // Clipboard denied or unsupported in environment
    }
  }, [disabled, handleParseText]);

  const handleLoadSample = useCallback(() => {
    if (disabled) return;
    setText(isTsv ? SAMPLE_TSV : SAMPLE_CSV);
  }, [disabled, isTsv]);

  const handleCopy = useCallback(async () => {
    if (disabled || !text) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  }, [disabled, text]);

  const handleFormat = useCallback(() => {
    if (disabled || !text.trim()) return;
    const delimiter = isTsv ? "\t" : ",";
    const lines = text.trim().split("\n");
    const formatted = lines
      .map((line) => {
        const cells = line.split(delimiter).map((c) => c.trim());
        return cells.join(delimiter);
      })
      .join("\n");
    setText(formatted);
  }, [disabled, text, isTsv]);

  const handleRemoveWhitespace = useCallback(() => {
    if (disabled || !text.trim()) return;
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    setText(lines.join("\n"));
  }, [disabled, text]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    setText("");
  }, [disabled]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragOver(false);
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFileSelect(files[0]);
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
      data-testid="split-csv-input"
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      {/* Left Panel: Monospace Textarea with Quick Actions */}
      <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-5 transition-all">
        {/* Header with Title */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Paste {formatName} Data
            </span>

            {!stats.isEmpty && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{stats.rowCount} rows detected</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 py-1.5 px-2 mb-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-300 shadow-xs">
          <div className="flex items-center flex-wrap gap-1">
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
              title="Format and trim whitespace"
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
              title="Remove blank lines"
              className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Remove white space</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || !text}
              aria-label="Clear"
              title="Clear table editor"
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
            className="inline-flex items-center gap-1 px-2.5 py-1 font-medium rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load sample {formatName}</span>
          </button>
        </div>

        {/* Monospace Textarea */}
        <div className="relative flex-1 min-h-[240px] sm:min-h-[280px]">
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
            aria-label={`Paste ${formatName} data`}
            placeholder={
              isTsv
                ? `id\tname\temail\tdepartment\n1\tAlice\talice@example.com\tEngineering`
                : `id,name,email,department\n1,Alice,alice@example.com,Engineering\n2,Bob,bob@example.com,Marketing`
            }
            className={cn(
              "w-full h-full min-h-[240px] sm:min-h-[280px] resize-none rounded-xl border bg-white dark:bg-zinc-950 p-3.5 font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2",
              "border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20"
            )}
            spellCheck={false}
          />
        </div>

        {/* Status Line */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {stats.isEmpty ? (
              <span>Paste comma or tab separated values</span>
            ) : (
              <span className="flex items-center gap-1.5 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {stats.rowCount} rows detected
                </span>
                <span>•</span>
                <span>{stats.charCount} chars</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleParseText()}
            disabled={disabled || stats.isEmpty}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <span>Parse {formatName} &amp; Preview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Panel: File Upload DropZone */}
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
          data-testid="split-csv-dropzone-area"
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
            "border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all duration-200 cursor-pointer select-none outline-none min-h-[280px] sm:min-h-[340px]",
            isDragOver
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-4 ring-emerald-500/10 scale-[1.005]"
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

          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Or upload your {config.sourceFormat} file
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
            Drag and drop a {config.sourceFormat} file here, or{" "}
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
