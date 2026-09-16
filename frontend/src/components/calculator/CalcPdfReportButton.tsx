"use client";

import React, { useState } from "react";
import { FileText, Loader2, Download } from "lucide-react";

export interface CalcPdfReportButtonProps {
  onGenerate: () => Promise<Uint8Array>;
  filename: string;
  label?: string;
  className?: string;
}

export function CalcPdfReportButton({
  onGenerate,
  filename,
  label = "Download PDF Report",
  className = "",
}: CalcPdfReportButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setGenerating(true);
      const pdfBytes = await onGenerate();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF report:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-xs transition-all active:scale-95 disabled:opacity-50 ${className}`}
      title="Download printable bank-ready PDF dossier"
    >
      {generating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
      ) : (
        <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      )}
      <span>{generating ? "Generating PDF..." : label}</span>
    </button>
  );
}
