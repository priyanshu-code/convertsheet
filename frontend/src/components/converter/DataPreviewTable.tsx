"use client";

import React from "react";
import { Table, Eye } from "lucide-react";
import { TabularData } from "@/types/converter";
import { cn } from "@/lib/utils";

export interface DataPreviewTableProps {
  preview: TabularData;
  maxDisplayRows?: number;
  className?: string;
}

function renderCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return (
      <span className="text-zinc-400 dark:text-zinc-500 italic text-xs">
        null
      </span>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={cn(
          "px-1.5 py-0.5 rounded text-xs font-mono font-medium",
          value
            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
        )}
      >
        {String(value)}
      </span>
    );
  }

  if (typeof value === "object") {
    let jsonStr: string;
    try {
      jsonStr = JSON.stringify(value) ?? "[Object]";
    } catch {
      jsonStr = "[Object]";
    }
    return (
      <span
        className="inline-block max-w-[200px] truncate px-1.5 py-0.5 rounded text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
        title={jsonStr}
      >
        {jsonStr}
      </span>
    );
  }

  if (typeof value === "number") {
    return (
      <span className="font-mono text-zinc-800 dark:text-zinc-200">
        {Number.isFinite(value) ? value.toLocaleString() : String(value)}
      </span>
    );
  }

  const str = String(value);
  if (str.trim() === "") {
    return (
      <span className="text-zinc-300 dark:text-zinc-600 text-xs italic">
        (empty)
      </span>
    );
  }

  return (
    <span
      className="inline-block max-w-[260px] truncate text-zinc-800 dark:text-zinc-200"
      title={str}
    >
      {str}
    </span>
  );
}

export function DataPreviewTable({
  preview,
  maxDisplayRows = 10,
  className,
}: DataPreviewTableProps) {
  const rowsToDisplay = preview.rows.slice(0, maxDisplayRows);
  const totalRows = preview.totalRows ?? preview.rows.length;
  const isAllRows = totalRows <= rowsToDisplay.length;

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Top Info Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Data Preview</span>
          <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
            ({preview.columns.length} columns)
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          <Table className="w-3.5 h-3.5 text-zinc-500" />
          <span>
            {isAllRows
              ? `Showing preview of all ${totalRows} rows`
              : `Showing preview of first ${rowsToDisplay.length} rows (${totalRows} total rows detected)`}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
        <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th
                  scope="col"
                  className="w-12 px-3 py-2.5 text-center text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900"
                >
                  #
                </th>
                {preview.columns.map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-transparent">
              {rowsToDisplay.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(1, preview.columns.length + 1)}
                    className="px-4 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500 italic"
                  >
                    No preview rows available.
                  </td>
                </tr>
              ) : (
                rowsToDisplay.map((row, idx) => (
                  <tr
                    key={idx}
                    className="transition-colors hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20"
                  >
                    <td className="px-3 py-2.5 text-center text-xs font-mono text-zinc-400 dark:text-zinc-500 border-r border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/30">
                      {idx + 1}
                    </td>
                    {preview.columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 whitespace-nowrap"
                      >
                        {renderCellValue(row[col])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
