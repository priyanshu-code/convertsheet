"use client";

import React, { useState, memo, useCallback } from "react";
import { Bot, Check } from "lucide-react";

export interface CalcPromptButtonProps {
  promptText?: string;
  prompt?: string;
  toolName?: string;
  label?: string;
  className?: string;
}

export const CalcPromptButton = memo(function CalcPromptButton({
  promptText,
  prompt,
  toolName,
  label,
  className = "",
}: CalcPromptButtonProps) {
  const [copied, setCopied] = useState(false);
  const effectivePrompt = promptText || prompt || "";
  const effectiveLabel = label || (toolName ? `Copy ${toolName} Prompt` : "Copy Prompt for ChatGPT");

  const handleCopy = useCallback(async () => {
    if (!effectivePrompt) return;
    try {
      await navigator.clipboard.writeText(effectivePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = effectivePrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [effectivePrompt]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied Prompt" : effectiveLabel}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        copied
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
          : "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Prompt Copied!</span>
        </>
      ) : (
        <>
          <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>{effectiveLabel}</span>
        </>
      )}
    </button>
  );
});
