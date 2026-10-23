"use client";

import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, File as FileIcon, X, RefreshCw, Image as ImageIcon } from "lucide-react";
import { useFileDropAndPaste } from "@/hooks/useFileDropAndPaste";
import { formatBytes } from "@/lib/utils";

export interface StudioDropZoneProps {
  onFileSelect: (file: File) => void;
  currentFile?: File | null;
  onClear?: () => void;
  title?: string;
  subtitle?: string;
  acceptedExtensions?: string[];
  disabled?: boolean;
  className?: string;
}

export function StudioDropZone({
  onFileSelect,
  currentFile,
  onClear,
  title = "Drop file here or click to browse",
  subtitle = "Supports all major formats • Instant local inspection",
  acceptedExtensions,
  disabled = false,
  className = "",
}: StudioDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Hook for Drag-and-Drop + Window Clipboard Paste (Cmd/Ctrl + V)
  const { isDragOver, dragHandlers } = useFileDropAndPaste({
    onFiles: (files) => {
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    accept: (file) => {
      if (!acceptedExtensions || acceptedExtensions.length === 0) return true;
      const lower = file.name.toLowerCase();
      return acceptedExtensions.some((ext) => lower.endsWith(ext.toLowerCase()));
    },
    disabled,
    multiple: false,
  });

  useEffect(() => {
    if (currentFile && currentFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(currentFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [currentFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
    // reset input so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleContainerClick = () => {
    if (!disabled && !currentFile) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Upload file input"
        className="sr-only"
        disabled={disabled}
        accept={acceptedExtensions?.join(",")}
        onChange={handleInputChange}
      />

      {!currentFile ? (
        <div
          {...dragHandlers}
          onClick={handleContainerClick}
          className={`relative group flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            isDragOver
              ? "border-black dark:border-white bg-zinc-100 dark:bg-zinc-800/80 scale-[1.01]"
              : "border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-900/40 hover:border-zinc-500 dark:hover:border-zinc-500 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70"
          } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
        >
          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/80 dark:border-zinc-700/80 mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
          </div>

          <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 text-center tracking-tight">
            {title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1 max-w-sm">
            {subtitle}
          </p>

          <div className="mt-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-200 dark:border-zinc-700">
              ⌘V
            </kbd>
            <span>or Ctrl+V to paste</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {imagePreview ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt={currentFile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0 border border-zinc-200 dark:border-zinc-700">
                <FileIcon className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {currentFile.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{formatBytes(currentFile.size)}</span>
                <span>•</span>
                <span className="uppercase text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {currentFile.type.split("/")[1] || "file"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>

            {onClear && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Remove file"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
