"use client";

import React, { useState, memo, useCallback } from "react";
import { Share2, Check } from "lucide-react";

export interface CalcShareButtonProps {
  state: Record<string, string | number | boolean | undefined | null>;
  label?: string;
  className?: string;
}

export const CalcShareButton = memo(function CalcShareButton({
  state,
  label = "Share Calculation",
  className = "",
}: CalcShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const searchParams = new URLSearchParams();
      Object.entries(state).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.set(key, String(val));
        }
      });

      const queryString = searchParams.toString();
      const url = `${window.location.origin}${window.location.pathname}${
        queryString ? `?${queryString}` : ""
      }`;

      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback mechanism
      try {
        const searchParams = new URLSearchParams();
        Object.entries(state).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            searchParams.set(key, String(val));
          }
        });
        const queryString = searchParams.toString();
        const url = `${window.location.origin}${window.location.pathname}${
          queryString ? `?${queryString}` : ""
        }`;

        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Failed to copy share link:", err);
      }
    }
  }, [state]);

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link Copied!" : label}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        copied
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
          : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
});
