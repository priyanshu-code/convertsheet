"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Code, Copy, Check, Sparkles, ExternalLink, Globe } from "lucide-react";
import { ToolConfig } from "@/types/tool";
import { EmbedModal } from "./EmbedModal";

export interface EmbedBannerProps {
  tool: ToolConfig;
  className?: string;
}

export function EmbedBanner({ tool, className = "" }: EmbedBannerProps) {
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const snippet = `<div style="max-width:100%;"><iframe src="https://www.convertsheet.com/embed/${tool.slug}" width="100%" height="650" frameborder="0" style="border:0;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);max-width:100%;" title="${tool.name}"></iframe><div style="font-size:11px;color:#71717a;text-align:right;margin-top:4px;"><a href="https://www.convertsheet.com/tools/${tool.slug}" target="_blank" rel="noopener" style="color:#059669;text-decoration:none;font-weight:600;">Free ${tool.name}</a> powered by <a href="https://www.convertsheet.com" target="_blank" rel="noopener" style="color:#059669;text-decoration:none;font-weight:600;">ConvertSheet</a></div></div>`;

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
      <section
        aria-labelledby="embed-banner-title"
        className={`rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/50 via-white to-zinc-50 dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 p-5 sm:p-6 shadow-xs ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <Code className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Free Embeddable Widget
              </span>
            </div>
            <h3
              id="embed-banner-title"
              className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100"
            >
              Add {tool.name} to Your Website or Blog
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Enhance your financial articles, portals, or docs with this interactive calculator. 100% free, responsive, zero backend required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Copied Embed Code!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Embed Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              <span>Customize Size</span>
            </button>

            <Link
              href="/embed"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1"
            >
              <span>All 50+ Widgets</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      <EmbedModal tool={tool} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
