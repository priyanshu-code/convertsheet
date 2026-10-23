"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  FileSpreadsheet,
  Calculator,
  Search,
  Sparkles,
  ArrowRight,
  X,
  FileCode,
  Image as ImageIcon,
  Mic,
  FileText,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import type { ConverterConfig } from "@/types/registry";
import { getAllTools } from "@/lib/tool-registry";
import { ConverterCardSkeleton } from "@/components/converter/ConverterCardSkeleton";
import { HomeCalculatorSpotlight } from "./HomeCalculatorSpotlight";
import { StudioDropZone } from "@/components/tools/StudioDropZone";

const DynamicConverterCard = dynamic(
  () => import("@/components/converter/ConverterCard").then((mod) => mod.ConverterCard),
  {
    ssr: true,
    loading: () => <ConverterCardSkeleton />,
  }
);

const POPULAR_PRESETS: { label: string; slug: string }[] = [
  { label: "JSON to Excel", slug: "json-to-excel" },
  { label: "CSV to Excel", slug: "csv-to-excel" },
  { label: "Parquet to CSV", slug: "parquet-to-csv" },
  { label: "XML to Excel", slug: "xml-to-excel" },
  { label: "Excel to JSON", slug: "excel-to-json" },
];

export interface HomeCommandHeroProps {
  defaultConverter?: ConverterConfig;
}

export function HomeCommandHero({
  defaultConverter = CONVERTER_REGISTRY["json-to-excel"],
}: HomeCommandHeroProps) {
  const [mode, setMode] = useState<"converter" | "calculator">("converter");
  const [activeConverter, setActiveConverter] = useState<ConverterConfig>(defaultConverter);
  const [searchQuery, setSearchQuery] = useState("");
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const allTools = useMemo(() => getAllTools(), []);
  const allConverters = useMemo(() => Object.values(CONVERTER_REGISTRY), []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matchedConverters = allConverters
      .filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.sourceFormat?.toLowerCase().includes(q) ||
          c.targetFormat?.toLowerCase().includes(q) ||
          c.subtitle?.toLowerCase().includes(q) ||
          c.metaDescription?.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((c) => ({
        type: "converter" as const,
        title: c.title,
        href:
          c.slug === "webp-to-png" || c.slug === "png-to-webp"
            ? `/tools/${c.slug}`
            : `/convert/${c.slug}`,
        subtitle: `${c.sourceFormat} → ${c.targetFormat} converter`,
        slug: c.slug,
        config: c,
      }));

    const matchedTools = allTools
      .filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.title?.toLowerCase().includes(q) ||
          t.subtitle?.toLowerCase().includes(q) ||
          t.metaDescription?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((t) => ({
        type: "tool" as const,
        title: t.title || t.name,
        href: `/tools/${t.slug}`,
        subtitle: t.category,
        slug: t.slug,
        config: null,
      }));

    return [...matchedConverters, ...matchedTools].slice(0, 6);
  }, [searchQuery, allConverters, allTools]);

  const handleSelectPreset = (slug: string) => {
    const found = (CONVERTER_REGISTRY as Record<string, ConverterConfig>)[slug];
    if (found) {
      setActiveConverter(found);
      setMode("converter");
    }
  };

  const handleQuickDrop = (file: File) => {
    setDroppedFile(file);
    const name = file.name.toLowerCase();

    // If it's a dataset, auto-switch to converter mode
    if (name.endsWith(".json")) {
      handleSelectPreset("json-to-excel");
    } else if (name.endsWith(".csv")) {
      handleSelectPreset("csv-to-excel");
    } else if (name.endsWith(".parquet")) {
      handleSelectPreset("parquet-to-csv");
    } else if (name.endsWith(".xml")) {
      handleSelectPreset("xml-to-excel");
    }
  };

  const suggestedActions = useMemo(() => {
    if (!droppedFile) return [];
    const name = droppedFile.name.toLowerCase();
    const type = droppedFile.type;

    if (type.startsWith("image/") || /\.(jpe?g|png|webp|bmp|tiff)$/i.test(name)) {
      return [
        { label: "Compress to 50KB", href: "/tools/compress-image-to-50kb", icon: ImageIcon },
        { label: "Passport Photo Maker", href: "/tools/passport-photo-maker", icon: ImageIcon },
        { label: "White Background", href: "/tools/white-background-passport-photo", icon: ImageIcon },
        { label: "Unblur Face (GFPGAN)", href: "/tools/unblur-face", icon: Sparkles },
      ];
    } else if (type.startsWith("audio/") || /\.(mp3|wav|m4a|ogg|flac)$/i.test(name)) {
      return [
        { label: "Speech to Text (Whisper)", href: "/tools/speech-to-text", icon: Mic },
        { label: "Denoise Audio & Clean", href: "/tools/audio-noise-reducer", icon: Mic },
      ];
    } else if (type === "application/pdf" || name.endsWith(".pdf")) {
      return [
        { label: "PDF to Markdown & OCR", href: "/tools/pdf-to-markdown", icon: FileText },
        { label: "Compress PDF", href: "/tools/pdf-compressor", icon: FileText },
        { label: "Merge PDF", href: "/tools/pdf-merge", icon: FileText },
      ];
    }
    return [];
  }, [droppedFile]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Clean, High-Contrast Command Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-3 pt-2 sm:pt-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Everyday Media, Document &amp; Data Tools
        </h1>
        <p className="text-xs sm:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          High-performance in-browser tools. Drag and drop any file, search with ⌘K, or launch dedicated studios instantly.
        </p>
      </div>

      {/* Universal File Dropzone on Homepage */}
      <div className="w-full max-w-3xl mx-auto">
        <StudioDropZone
          onFileSelect={handleQuickDrop}
          currentFile={droppedFile}
          onClear={() => setDroppedFile(null)}
          title="Drop any file here or click to inspect"
          subtitle="Photos, audio, PDFs, and spreadsheets • Instant tool suggestions"
        />

        {/* Suggested 1-click tools for dropped file */}
        {droppedFile && suggestedActions.length > 0 && (
          <div className="mt-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 animate-in fade-in duration-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                Suggested actions for {droppedFile.name}:
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                {formatBytes(droppedFile.size)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestedActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors shadow-xs"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{action.label}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hero Interactive Command Controller */}
      <div className="w-full max-w-5xl mx-auto space-y-4">
        {/* Quick Search & Command Bar */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ converters, image tools, audio & calculators..."
              aria-label="Search 100+ converters, financial calculators, & developer utilities"
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {searchResults.length === 0 ? (
                <div className="p-4 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  No matching converters or calculators found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                searchResults.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      if (item.type === "converter" && item.config) {
                        e.preventDefault();
                        setActiveConverter(item.config);
                        setMode("converter");
                        setSearchQuery("");
                      } else {
                        setSearchQuery("");
                      }
                    }}
                    className="flex items-center justify-between p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {item.type === "converter" ? (
                          <FileCode className="w-3.5 h-3.5" />
                        ) : (
                          <Calculator className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 capitalize">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Dual Mode Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs">
          {/* Segmented Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 w-full sm:w-auto shadow-xs">
            <button
              type="button"
              aria-pressed={mode === "converter"}
              onClick={() => setMode("converter")}
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                mode === "converter"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Universal File Converter</span>
            </button>
            <button
              type="button"
              aria-pressed={mode === "calculator"}
              onClick={() => setMode("calculator")}
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                mode === "calculator"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Financial &amp; Dev Calculators</span>
            </button>
          </div>

          {/* Quick Format Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 shrink-0 hidden md:inline">
              Quick:
            </span>
            {POPULAR_PRESETS.map((preset) => {
              const isSelected = mode === "converter" && activeConverter.slug === preset.slug;
              return (
                <button
                  key={preset.slug}
                  type="button"
                  onClick={() => handleSelectPreset(preset.slug)}
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer",
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 font-bold"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Mode Workspace Panel */}
        <div className="mt-3">
          {mode === "converter" ? (
            <DynamicConverterCard key={activeConverter.slug} config={activeConverter} />
          ) : (
            <HomeCalculatorSpotlight />
          )}
        </div>
      </div>
    </div>
  );
}
