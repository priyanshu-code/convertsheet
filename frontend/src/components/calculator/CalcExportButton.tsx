"use client";

import React, { memo, useCallback } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export interface CalcExportButtonProps {
  filename: string;
  sheetName?: string;
  data: Record<string, any>[];
  label?: string;
  className?: string;
}

export const CalcExportButton = memo(function CalcExportButton({
  filename,
  sheetName = "Schedule",
  data,
  label = "Export to Excel (.xlsx)",
  className = "",
}: CalcExportButtonProps) {
  const handleExport = useCallback(() => {
    if (!data || data.length === 0) return;
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (err) {
      console.error("Export to Excel failed:", err);
    }
  }, [data, filename, sheetName]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!data || data.length === 0}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span>{label}</span>
    </button>
  );
});
