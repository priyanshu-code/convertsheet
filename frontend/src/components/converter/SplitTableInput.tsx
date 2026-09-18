"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Clipboard,
  FileCode,
  RotateCcw,
  Sparkles,
  UploadCloud,
  ArrowRight,
} from "lucide-react";
import { ConverterConfig } from "@/types/registry";
import { cn } from "@/lib/utils";

export interface SplitTableInputProps {
  config: ConverterConfig;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

const SAMPLE_MARKDOWN_TABLE = `| Product | Unit Price | Qty | Status |
| :--- | :--- | :--- | :--- |
| Widget Alpha | $24.99 | 120 | In Stock |
| Widget Beta | $89.00 | 45 | Backorder |
| Gadget Pro | $149.99 | 18 | In Stock |
| Cable Ultra | $12.50 | 250 | In Stock |`;

export function SplitTableInput({
  config,
  onFileSelect,
  disabled = false,
  className,
}: SplitTableInputProps) {
  const [text, setText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedExtensions = [
    config.sourceExtension,
    ...(config.additionalExtensions || [".markdown", ".html", ".htm", ".txt"]),
  ];

  const acceptAttribute = [
    ...acceptedExtensions,
    ...(config.acceptedMimeTypes || [
      "text/markdown",
      "text/x-markdown",
      "text/plain",
      "text/html",
    ]),
  ].join(",");

  const handleParseText = useCallback(
    (contentToParse?: string) => {
      const raw = contentToParse !== undefined ? contentToParse : text;
      const trimmed = raw.trim();
      if (!trimmed || disabled) return;

      const file = new File([trimmed], "pasted-table.md", {
        type: "text/markdown",
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
    setText(SAMPLE_MARKDOWN_TABLE);
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
      data-testid="split-table-input"
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      {/* Left Panel: Monospace Textarea with Quick Actions */}
      <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-5 transition-all">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileCode className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Paste Markdown or HTML Table
            </span>
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
              title="Load Sample Table"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Load Sample Table</span>
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

        {/* Monospace Textarea */}
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
            aria-label="Paste table text"
            placeholder={`| Product | Unit Price | Qty | Status |\n| :--- | :--- | :--- | :--- |\n| Widget Alpha | $24.99 | 120 | In Stock |\n| Widget Beta | $89.00 | 45 | Backorder |`}
            className="w-full h-full min-h-[220px] resize-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3.5 font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            spellCheck={false}
          />
        </div>

        {/* Parse & Preview Button Footer */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {text.length > 0
              ? `${text.split("\n").filter((l) => l.trim().length > 0).length} lines detected`
              : "Supports ChatGPT, Claude, GitHub & <table> tags"}
          </span>

          <button
            type="button"
            onClick={() => handleParseText()}
            disabled={disabled || !text.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>Parse & Preview Table</span>
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
          data-testid="split-dropzone-area"
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

          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Or upload your file
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
            Drag and drop a file here, or{" "}
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
