"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, Calculator, FileSpreadsheet, ArrowRight, X } from "lucide-react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { getAllTools } from "@/lib/tool-registry";
import type { ConverterConfig } from "@/types/registry";
import type { ToolConfig } from "@/types/tool";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allConverters = useMemo(
    () => Object.values(CONVERTER_REGISTRY) as ConverterConfig[],
    []
  );
  const allTools = useMemo(() => getAllTools(), []);

  // Filter items
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Default top suggestions
      return [
        ...allTools.slice(0, 5).map((t) => ({
          type: "tool" as const,
          id: t.slug,
          name: t.name,
          desc: t.subtitle,
          href: `/tools/${t.slug}`,
          category: t.category,
        })),
        ...allConverters.slice(0, 5).map((c) => ({
          type: "converter" as const,
          id: c.slug,
          name: `${c.sourceFormat} to ${c.targetFormat}`,
          desc: c.subtitle,
          href: `/convert/${c.slug}`,
          category: c.category,
        })),
      ];
    }

    const matchedTools = allTools
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      )
      .map((t) => ({
        type: "tool" as const,
        id: t.slug,
        name: t.name,
        desc: t.subtitle,
        href: `/tools/${t.slug}`,
        category: t.category,
      }));

    const matchedConverters = allConverters
      .filter(
        (c) =>
          c.sourceFormat.toLowerCase().includes(q) ||
          c.targetFormat.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      )
      .map((c) => ({
        type: "converter" as const,
        id: c.slug,
        name: `${c.sourceFormat} to ${c.targetFormat}`,
        desc: c.subtitle,
        href: `/convert/${c.slug}`,
        category: c.category,
      }));

    return [...matchedTools, ...matchedConverters];
  }, [query, allTools, allConverters]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
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
      aria-label="Search Converters & Calculators"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a tool name, format, or calculation (e.g. SIP, Parquet, Base64)..."
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

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-zinc-100 dark:divide-zinc-800/40">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No converters or calculators found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.type === "tool" ? Calculator : FileSpreadsheet;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between gap-3 p-3 rounded-2xl transition-all ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === "tool"
                          ? "bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60"
                          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate">{item.name}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold">
                          {item.type}
                        </span>
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
