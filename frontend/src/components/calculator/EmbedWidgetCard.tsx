"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Code, Copy, Check, ExternalLink, Eye } from "lucide-react";
import { ToolConfig } from "@/types/tool";
import { EmbedModal } from "./EmbedModal";

export interface EmbedWidgetCardProps {
  tool: ToolConfig;
}

export function EmbedWidgetCard({ tool }: EmbedWidgetCardProps) {
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const snippet = `<iframe src="https://www.convertsheet.com/embed/${tool.slug}" width="100%" height="650" frameborder="0" style="border:0;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);max-width:100%;" title="${tool.name}"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = snippet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all group">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
              {tool.category.replace("-", " & ")}
            </span>
            <Link
              href={`/tools/${tool.slug}`}
              className="text-xs font-medium text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
              title="Open full calculator page"
            >
              <span>Full page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {tool.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
              {tool.metaDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview &amp; Customize</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      <EmbedModal tool={tool} isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
  );
}
