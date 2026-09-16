"use client";

import { useState, useCallback, useEffect } from "react";

export interface UseFileDropAndPasteOptions {
  onFiles: (files: File[]) => void;
  accept?: (file: File) => boolean;
  disabled?: boolean;
  multiple?: boolean;
}

export function useFileDropAndPaste({
  onFiles,
  accept,
  disabled = false,
  multiple = false,
}: UseFileDropAndPasteOptions) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;

      const dropped = Array.from(e.dataTransfer.files || []);
      const matched = accept ? dropped.filter(accept) : dropped;

      if (matched.length > 0) {
        onFiles(multiple ? matched : [matched[0]]);
      }
    },
    [disabled, accept, multiple, onFiles]
  );

  // Global window paste listener for Ctrl/Cmd + V
  useEffect(() => {
    if (disabled) return;

    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept paste if user is typing in a text field
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const clipboardFiles: File[] = [];

      // Check clipboardData.files first
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          clipboardFiles.push(e.clipboardData.files[i]);
        }
      } else if (e.clipboardData?.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.kind === "file") {
            const f = item.getAsFile();
            if (f) clipboardFiles.push(f);
          }
        }
      }

      const matched = accept
        ? clipboardFiles.filter(accept)
        : clipboardFiles;

      if (matched.length > 0) {
        e.preventDefault();
        onFiles(multiple ? matched : [matched[0]]);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, multiple, accept, onFiles]);

  return {
    isDragOver,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
