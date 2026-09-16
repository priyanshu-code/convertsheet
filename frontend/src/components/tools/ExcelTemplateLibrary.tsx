"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, Check, Sparkles, ShieldCheck } from "lucide-react";
import { EXCEL_TEMPLATES, downloadExcelTemplate } from "@/lib/excel-models";

export function ExcelTemplateLibrary() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    try {
      downloadExcelTemplate(id);
      setTimeout(() => setDownloadingId(null), 2000);
    } catch (err) {
      console.error("Failed to generate template:", err);
      setDownloadingId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Financial Model Library</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Downloadable Excel Financial Templates (.xlsx)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pre-built, formula-driven spreadsheets ready to open in Microsoft Excel, Google Sheets, or Apple Numbers. 100% free &amp; private.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>No Sign-Up or Email Required</span>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXCEL_TEMPLATES.map((tmpl) => {
          const isDone = downloadingId === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-xs space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {tmpl.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    .xlsx
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {tmpl.name}
                </h4>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {tmpl.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tmpl.formulaHighlights.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono truncate max-w-[180px]">
                  {tmpl.filename}
                </span>

                <button
                  type="button"
                  onClick={() => handleDownload(tmpl.id)}
                  disabled={isDone}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white"
                  }`}
                  aria-label={`Download ${tmpl.name}`}
                >
                  {isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .xlsx</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
