"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Calculator,
  FileSpreadsheet,
  ArrowRight,
  X,
  Sparkles,
  Video,
  Volume2,
  Image as ImageIcon,
  FileText,
  Scale,
  Mic,
  Scissors,
  Receipt,
  Download,
} from "lucide-react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { getAllTools } from "@/lib/tool-registry";
import type { ConverterConfig } from "@/types/registry";
import type { ToolConfig } from "@/types/tool";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoryFilter = "all" | "ai-media" | "images-kb" | "pdf-docs" | "calculators" | "converters";

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allConverters = useMemo(
    () => Object.values(CONVERTER_REGISTRY) as ConverterConfig[],
    []
  );
  const allTools = useMemo(() => getAllTools(), []);

  const getToolIcon = (slug: string, category: string) => {
    if (slug.includes("video")) {
      return Video;
    }
    if (
      slug.includes("speech") ||
      slug.includes("voice") ||
      slug.includes("audio") ||
      slug.includes("vocal") ||
      slug.includes("acapella")
    ) {
      return Volume2;
    }
    if (slug.includes("receipt") || slug.includes("invoice")) {
      return Receipt;
    }
    if (slug.includes("pdf") || slug.includes("markdown") || slug.includes("table")) {
      return FileText;
    }
    if (slug.includes("kb") || slug.includes("image") || slug.includes("resizer") || slug.includes("png") || slug.includes("webp")) {
      return ImageIcon;
    }
    if (
      slug.includes("unblur") ||
      slug.includes("passport") ||
      slug.includes("enhancer") ||
      slug.includes("detect-ai") ||
      slug.includes("ai-content")
    ) {
      return Sparkles;
    }
    if (category === "financial" || slug.includes("calculator")) {
      return Calculator;
    }
    return FileSpreadsheet;
  };

  // Filter items
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    let tools = allTools.map((t) => ({
      type: "tool" as const,
      id: t.slug,
      name: t.name,
      desc: t.subtitle,
      href: `/tools/${t.slug}`,
      category: t.category,
      badge: t.badge,
      featured: t.featured,
      keywords: t.keywords || [],
    }));

    let converters = allConverters.map((c) => ({
      type: "converter" as const,
      id: c.slug,
      name: `${c.sourceFormat} to ${c.targetFormat} Converter`,
      desc: c.subtitle,
      href: `/convert/${c.slug}`,
      category: c.category,
      badge: undefined as string | undefined,
      featured: false,
      keywords: [c.sourceFormat, c.targetFormat, `${c.sourceFormat} to ${c.targetFormat}`],
    }));

    // Category filtering
    if (activeCategory === "ai-media") {
      tools = tools.filter(
        (t) =>
          t.id.includes("video") ||
          t.id.includes("youtube") ||
          t.id.includes("instagram") ||
          t.id.includes("speech") ||
          t.id.includes("voice") ||
          t.id.includes("audio") ||
          t.id.includes("vocal") ||
          t.id.includes("unblur") ||
          t.id.includes("passport") ||
          t.id.includes("enhancer") ||
          t.id.includes("detect-ai") ||
          t.id.includes("subtitle")
      );
      converters = [];
    } else if (activeCategory === "images-kb") {
      tools = tools.filter(
        (t) =>
          t.id.includes("kb") ||
          t.id.includes("image") ||
          t.id.includes("compress") ||
          t.id.includes("png") ||
          t.id.includes("webp") ||
          t.id.includes("photo")
      );
      converters = converters.filter((c) =>
        ["PNG", "JPG", "WEBP", "SVG", "GIF"].includes(c.name.split(" ")[0])
      );
    } else if (activeCategory === "pdf-docs") {
      tools = tools.filter(
        (t) =>
          t.id.includes("pdf") ||
          t.id.includes("markdown") ||
          t.id.includes("receipt") ||
          t.id.includes("document")
      );
      converters = converters.filter((c) => c.name.includes("PDF"));
    } else if (activeCategory === "calculators") {
      tools = tools.filter((t) => t.category === "financial" || t.id.includes("calculator"));
      converters = [];
    } else if (activeCategory === "converters") {
      tools = [];
    }

    if (!q) {
      // Default top suggestions: Show most popular / featured items
      const topTools = tools.filter((t) => t.featured).slice(0, 8);
      const otherTools = tools.filter((t) => !t.featured).slice(0, 4);
      const topConverters = converters.slice(0, 4);
      return [...topTools, ...otherTools, ...topConverters];
    }

    const matchedTools = tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
    );

    const matchedConverters = converters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.toLowerCase().includes(q))
    );

    return [...matchedTools, ...matchedConverters];
  }, [query, activeCategory, allTools, allConverters]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setActiveCategory("all");
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        window.location.href = results[selectedIndex].href;
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIndex, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Tools, Media Engines & Converters"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <Search className="w-5 h-5 text-emerald-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a tool name or converter (e.g. SIP, 50KB, Passport, Video Compress)..."
            className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Search"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-950/40 text-xs">
          {[
            { id: "all", label: "All Tools" },
            { id: "ai-media", label: "AI & Media" },
            { id: "images-kb", label: "Image & KB" },
            { id: "pdf-docs", label: "PDF & OCR" },
            { id: "calculators", label: "Calculators" },
            { id: "converters", label: "Converters" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id as CategoryFilter);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-xl font-medium transition-all shrink-0 ${
                activeCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-zinc-100 dark:divide-zinc-800/40">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No tools or converters found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon =
                item.type === "tool"
                  ? getToolIcon(item.id, item.category)
                  : FileSpreadsheet;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between gap-3 p-3 rounded-2xl transition-all ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/30"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate">{item.name}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">↑</kbd>{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">↵</kbd> Select
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">ESC</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}
