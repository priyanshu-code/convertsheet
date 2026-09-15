"use client";

import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, ShieldCheck, Zap } from "lucide-react";
import { ConverterConfig } from "@/types/registry";
import { cn } from "@/lib/utils";

export interface DropZoneProps {
  config: ConverterConfig;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export function DropZone({
  config,
  onFileSelect,
  disabled = false,
  className,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedExtensions = [
    config.sourceExtension,
    ...(config.additionalExtensions || []),
  ];

  const acceptAttribute = [
    ...acceptedExtensions,
    ...(config.acceptedMimeTypes || []),
  ].join(",");

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
      // Reset input value so selecting the same file triggers change again
      if (e.target) {
        e.target.value = "";
      }
    },
    [onFileSelect]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
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
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Upload ${config.sourceFormat} file`}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group relative flex flex-col items-center justify-center text-center",
        "border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-200 cursor-pointer select-none outline-none",
        isDragOver
          ? "border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/10 scale-[1.005]"
          : "border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttribute}
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Upload icon circle */}
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-200",
          isDragOver
            ? "scale-110 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105"
        )}
      >
        <UploadCloud className="w-8 h-8" />
      </div>

      {/* Primary prompt */}
      <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        Drop your {config.sourceFormat} file here or{" "}
        <span className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-4 group-hover:text-emerald-500">
          browse
        </span>
      </h3>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-md">
        Drag and drop from your computer or click to select a file
      </p>

      {/* Accepted formats pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 mr-1">
          Accepted:
        </span>
        {acceptedExtensions.map((ext) => (
          <span
            key={ext}
            className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
          >
            {ext}
          </span>
        ))}
      </div>

      {/* Privacy & Tier Badges */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Processed locally in browser - never uploaded to any server</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Max 10MB for free in-browser conversion</span>
        </div>
      </div>
    </div>
  );
}
