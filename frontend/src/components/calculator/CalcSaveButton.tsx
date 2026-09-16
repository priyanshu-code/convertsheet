"use client";

import React, { useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { saveCalculation } from "@/lib/calculation-history";

export interface CalcSaveButtonProps {
  toolSlug: string;
  toolName: string;
  summaryTitle: string;
  summaryMetrics: { label: string; value: string }[];
  path?: string;
  label?: string;
  className?: string;
}

export function CalcSaveButton({
  toolSlug,
  toolName,
  summaryTitle,
  summaryMetrics,
  path = `/tools/${toolSlug}`,
  label = "Save Scenario",
  className = "",
}: CalcSaveButtonProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveCalculation({
      toolSlug,
      toolName,
      summaryTitle,
      summaryMetrics,
      path,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={handleSave}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        saved
          ? "bg-emerald-600 text-white border border-emerald-600"
          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
      } ${className}`}
    >
      {saved ? (
        <>
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Scenario Saved!</span>
        </>
      ) : (
        <>
          <Bookmark className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
