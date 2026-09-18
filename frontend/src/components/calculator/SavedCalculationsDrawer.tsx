"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bookmark, Trash2, X, Clock, ArrowRight, FileSpreadsheet } from "lucide-react";
import {
  getSavedCalculations,
  removeSavedCalculation,
  clearAllSavedCalculations,
  SavedCalculationItem,
} from "@/lib/calculation-history";
import * as XLSX from "xlsx";

export function SavedCalculationsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<SavedCalculationItem[]>([]);

  const loadItems = useCallback(() => {
    setItems(getSavedCalculations());
  }, []);

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener("convertsheet_calculation_saved", handleUpdate);
    return () => {
      window.removeEventListener("convertsheet_calculation_saved", handleUpdate);
    };
  }, [loadItems]);

  const handleExportAll = () => {
    if (items.length === 0) return;
    try {
      const flattened = items.map((it) => ({
        Tool: it.toolName,
        Summary: it.summaryTitle,
        Date: new Date(it.timestamp).toLocaleString(),
        Metrics: it.summaryMetrics.map((m) => `${m.label}: ${m.value}`).join(" | "),
        URL: `https://www.convertsheet.com${it.path}`,
      }));
      const worksheet = XLSX.utils.json_to_sheet(flattened);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "SavedCalculations");
      XLSX.writeFile(workbook, "convertsheet-saved-calculations.xlsx");
    } catch (err) {
      console.error("Failed to export calculations:", err);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="View Saved Calculations History"
        className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
      >
        <Bookmark className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-medium">Saved</span>
        {items.length > 0 && (
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {/* Slide-Over Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Saved Calculations ({items.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close saved calculations drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="px-5 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              🔒 Stored 100% locally in your browser memory. Zero server uploads.
            </div>

            {/* Drawer Body: Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Clock className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    No calculations saved yet
                  </p>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Click &quot;Save Scenario&quot; inside any calculator to bookmark mortgage, salary, or loan comparisons here.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/80 shadow-xs hover:shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 mb-1.5">
                          {item.toolName || "Calculator Scenario"}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug break-words">
                          {item.summaryTitle || "Saved Calculation"}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSavedCalculation(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
                        title="Delete calculation"
                        aria-label={`Delete ${item.summaryTitle || "calculation"}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metrics grid */}
                    {item.summaryMetrics && item.summaryMetrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
                        {item.summaryMetrics.map((m, idx) => (
                          <div key={idx} className="text-xs min-w-0">
                            <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] font-medium truncate">
                              {m.label}
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-xs block truncate">
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer link & date */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Recently saved"}
                      </span>
                      <Link
                        href={item.path || "#"}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>Open Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer Actions */}
            {items.length > 0 && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-900/60">
                <button
                  type="button"
                  onClick={handleExportAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Export All (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={clearAllSavedCalculations}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                >
                  Clear History
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
