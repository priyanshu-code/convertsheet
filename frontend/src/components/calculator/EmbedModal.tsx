"use client";

import React, { useState, useCallback, useMemo } from "react";
import { X, Code, Copy, Check, ExternalLink } from "lucide-react";
import { ToolConfig } from "@/types/tool";

export interface EmbedModalProps {
  tool: ToolConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function EmbedModal({ tool, isOpen, onClose }: EmbedModalProps) {
  const [sizePreset, setSizePreset] = useState<"responsive" | "standard" | "compact">("responsive");
  const [copied, setCopied] = useState(false);

  const dimensions = useMemo(() => {
    switch (sizePreset) {
      case "standard":
        return { width: "750px", height: "650px", wVal: "750", hVal: "650" };
      case "compact":
        return { width: "500px", height: "600px", wVal: "500", hVal: "600" };
      case "responsive":
      default:
        return { width: "100%", height: "650px", wVal: "100%", hVal: "650" };
    }
  }, [sizePreset]);

  const embedCode = useMemo(() => {
    const embedUrl = `https://convertsheet.com/embed/${tool.slug}`;
    const toolUrl = `https://convertsheet.com/tools/${tool.slug}`;

    return `<iframe src="${embedUrl}" width="${dimensions.wVal}" height="${dimensions.hVal}" frameborder="0" style="border:0;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);width:${dimensions.width};max-width:100%;" title="${tool.name}"></iframe>\n<p style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#6b7280;margin-top:6px;text-align:right;">Powered by <a href="${toolUrl}" target="_blank" rel="noopener" style="color:#10b981;font-weight:600;text-decoration:none;">ConvertSheet Free Tools</a></p>`;
  }, [tool.slug, tool.name, dimensions]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [embedCode]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="embed-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Code className="w-3.5 h-3.5" />
              <span>Embed Widget</span>
            </div>
            <h2
              id="embed-modal-title"
              className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Embed {tool.name} on Your Website
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Paste this responsive HTML snippet into any blog post, article, or documentation page.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close embed modal"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Size Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Widget Dimensions:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSizePreset("responsive")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                sizePreset === "responsive"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              Responsive (100%)
            </button>
            <button
              type="button"
              onClick={() => setSizePreset("standard")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                sizePreset === "standard"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              Standard (750px)
            </button>
            <button
              type="button"
              onClick={() => setSizePreset("compact")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                sizePreset === "compact"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              Compact (500px)
            </button>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>HTML Embed Code</span>
            <span className="font-mono text-[10px]">iframe</span>
          </div>
          <div className="relative rounded-2xl bg-zinc-950 text-zinc-300 p-4 font-mono text-xs border border-zinc-800 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-all select-all leading-relaxed">
              {embedCode}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <a
            href={`/embed/${tool.slug}`}
            target="_blank"
            rel="noopener"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Open preview in new tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 active:scale-[0.99] transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-100" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy HTML Code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
