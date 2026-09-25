"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  FileCode2,
  Minimize2,
  Maximize2,
  Clipboard,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlignLeft,
} from "lucide-react";
import {
  CalcCard,
  CalcTextarea,
  CalcSelect,
  CalcResult,
  CalcCopyButton,
  CalcShareButton,
} from "@/components/calculator";

export function JsonFormatterTool() {
  const [input, setInput] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("input");
      if (q) return q;
    }
    return `{\n  "name": "ConvertSheet",\n  "status": "online",\n  "features": ["Converters", "Calculators"],\n  "privacy": true\n}`;
  });
  const [indent, setIndent] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const ind = new URLSearchParams(window.location.search).get("indent");
      if (ind) return ind;
    }
    return "2";
  });

  const { formatted, minified, error, stats } = useMemo(() => {
    if (!input.trim()) {
      return { formatted: "", minified: "", error: null, stats: null };
    }
    try {
      const parsed = JSON.parse(input);
      const space = indent === "tab" ? "\t" : Number(indent);
      const pretty = JSON.stringify(parsed, null, space);
      const mini = JSON.stringify(parsed);
      const keysCount = typeof parsed === "object" && parsed !== null ? Object.keys(parsed).length : 1;

      return {
        formatted: pretty,
        minified: mini,
        error: null,
        stats: {
          keys: keysCount,
          formattedSize: `${pretty.length} B`,
          minifiedSize: `${mini.length} B`,
          savings: `${(((pretty.length - mini.length) / (pretty.length || 1)) * 100).toFixed(0)}%`,
        },
      };
    } catch (e: any) {
      return {
        formatted: "",
        minified: "",
        error: e.message || "Invalid JSON syntax",
        stats: null,
      };
    }
  }, [input, indent]);

  const [copied, setCopied] = useState(false);

  const handleMinify = useCallback(() => {
    if (minified) setInput(minified);
  }, [minified]);

  const handleBeautify = useCallback(() => {
    if (formatted) setInput(formatted);
  }, [formatted]);

  const handlePaste = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setInput(text);
      }
    } catch {
      // browser might block clipboard
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!input) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // clipboard write failed
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(`{\n  "name": "ConvertSheet",\n  "status": "online",\n  "features": ["Converters", "Calculators"],\n  "privacy": true\n}`);
  }, []);

  return (
    <CalcCard
      title="JSON Formatter & Validator"
      subtitle="Format, validate, beautify, and minify JSON payloads with syntax error detection and live payload metrics."
      icon={FileCode2}
      badge="RFC 8259"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-48">
          <CalcSelect
            id="json-indent"
            label="Indentation Spacing"
            value={indent}
            options={[
              { value: "2", label: "2 Spaces" },
              { value: "4", label: "4 Spaces" },
              { value: "tab", label: "Tab Indent" },
            ]}
            onChange={setIndent}
          />
        </div>

        <div className="flex items-center gap-2 pt-5">
          <CalcShareButton
            state={{
              input,
              indent,
            }}
            label="Share JSON"
          />
        </div>
      </div>

      {/* Toolbar: Paste | Copy | Format | Remove white space | Clear | Load JSON data */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-300 shadow-xs">
        <button
          type="button"
          onClick={handlePaste}
          aria-label="Paste from Clipboard"
          title="Paste from clipboard"
          className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-md hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <Clipboard className="w-3.5 h-3.5" />
          <span>Paste</span>
        </button>
        <span className="text-zinc-300 dark:text-zinc-700 select-none">|</span>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!input}
          aria-label="Copy"
          title="Copy JSON to clipboard"
          className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-md hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
        <span className="text-zinc-300 dark:text-zinc-700 select-none">|</span>
        <button
          type="button"
          onClick={handleBeautify}
          disabled={!formatted || !!error}
          aria-label="Format"
          title="Format / Beautify JSON"
          className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-md hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Format</span>
        </button>
        <span className="text-zinc-300 dark:text-zinc-700 select-none">|</span>
        <button
          type="button"
          onClick={handleMinify}
          disabled={!minified || !!error}
          aria-label="Remove white space"
          title="Remove white space / Minify"
          className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-md hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Remove white space</span>
        </button>
        <span className="text-zinc-300 dark:text-zinc-700 select-none">|</span>
        <button
          type="button"
          onClick={handleClear}
          disabled={!input}
          aria-label="Clear"
          title="Clear JSON input"
          className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-md text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
        <span className="text-zinc-300 dark:text-zinc-700 select-none">|</span>
        <button
          type="button"
          onClick={handleLoadSample}
          aria-label="Load Sample JSON"
          title="Load Sample JSON"
          className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-md hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Load JSON data</span>
        </button>
      </div>

      <CalcTextarea
        id="json-input"
        label="JSON Editor & Workspace"
        value={input}
        onChange={setInput}
        placeholder="Paste your JSON here..."
        rows={8}
      />

      {error ? (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium font-mono">
          ❌ Syntax Error: {error}
        </div>
      ) : (
        stats && (
          <CalcResult
            title="Formatted Output (Valid JSON)"
            primaryValue={formatted}
            copyValue={formatted}
            items={[
              { label: "Root Properties", value: `${stats.keys} keys` },
              { label: "Minified Payload", value: stats.minifiedSize },
              { label: "Whitespace Savings", value: stats.savings, highlight: true },
            ]}
          />
        )
      )}
    </CalcCard>
  );
}
