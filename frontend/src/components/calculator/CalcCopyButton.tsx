"use client";

import React, { useState, memo, useCallback } from "react";
import { Copy, Check } from "lucide-react";

export interface CalcCopyButtonProps {
  textToCopy?: string;
  text?: string;
  label?: string;
  className?: string;
}

export const CalcCopyButton = memo(function CalcCopyButton({
  textToCopy,
  text,
  label = "Copy",
  className = "",
}: CalcCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const targetText = textToCopy || text || "";

  const handleCopy = useCallback(async () => {
    if (!targetText) return;
    try {
      await navigator.clipboard.writeText(targetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = targetText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [targetText]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!targetText}
      aria-label={copied ? "Copied" : label}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        copied
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
      } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
});
