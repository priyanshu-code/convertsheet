"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bookmark, Trash2, X, Clock, ArrowRight, FileSpreadsheet, ShieldCheck } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Lock body scroll and handle Escape key when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleExportAll = () => {
    if (items.length === 0) return;
    try {
      const flattened = items.map((it) => ({
        Tool: it.toolName || "Calculator Scenario",
        Summary: it.summaryTitle || "Saved Calculation",
        Date: it.timestamp ? new Date(it.timestamp).toLocaleString() : "",
        Metrics: (it.summaryMetrics || []).map((m) => `${m.label}: ${m.value}`).join(" | "),
        URL: it.path ? `https://www.convertsheet.com${it.path}` : "https://www.convertsheet.com",
      }));
      const worksheet = XLSX.utils.json_to_sheet(flattened);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "SavedCalculations");
      XLSX.writeFile(workbook, "convertsheet-saved-calculations.xlsx");
    } catch (err) {
      console.error("Failed to export calculations:", err);
    }
  };

  const drawerContent = isOpen && mounted ? (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={() => setIsOpen(false)}
      aria-modal="true"
      role="dialog"
      aria-label="Saved calculations history drawer"
    >
      <div
        className="w-full max-w-md sm:max-w-lg bg-white dark:bg-zinc-900 h-screen max-h-screen shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Saved Calculations</span>
                {items.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                    {items.length}
                  </span>
                )}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close saved calculations drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Guarantee Note */}
        <div className="px-5 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100/80 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Stored 100% locally in browser memory. Zero server uploads.</span>
        </div>

        {/* Drawer Body: Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-3 px-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No calculations saved yet
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Click &quot;Save Scenario&quot; inside any calculator (Mortgage, Salary, GST, Car Loan, Debt Payoff) to bookmark comparisons here.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/90 shadow-xs hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 mb-1.5">
                      {item.toolName || "Calculator Scenario"}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug break-words">
                      {item.summaryTitle || "Saved Calculation"}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSavedCalculation(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
                    title="Delete calculation"
                    aria-label={`Delete ${item.summaryTitle || "calculation"}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Metrics grid */}
                {item.summaryMetrics && item.summaryMetrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800/80">
                    {item.summaryMetrics.map((m, idx) => (
                      <div key={idx} className="text-xs min-w-0">
                        <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] font-medium truncate">
                          {m.label}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-xs block truncate mt-0.5">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer link & date */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently saved"}
                  </span>
                  <Link
                    href={item.path || "#"}
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline inline-flex items-center gap-1"
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
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/80">
            <button
              type="button"
              onClick={handleExportAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              <span>Export All (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={clearAllSavedCalculations}
              className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
            >
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  ) : null;

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

      {/* Rendered via Portal directly into document.body to avoid header backdrop-filter constraints */}
      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
