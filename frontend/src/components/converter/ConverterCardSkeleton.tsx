import React from "react";
import { UploadCloud } from "lucide-react";

export function ConverterCardSkeleton() {
  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 min-h-[260px] text-center bg-zinc-50/40 dark:bg-zinc-900/30 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
          <UploadCloud className="w-7 h-7 opacity-50" />
        </div>
        <div className="h-5 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-2"></div>
        <div className="h-4 w-48 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg"></div>
      </div>
    </div>
  );
}
