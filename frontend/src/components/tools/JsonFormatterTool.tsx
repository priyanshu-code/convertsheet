"use client";

import React, { useState, useMemo, useCallback } from "react";
import { FileCode2, Minimize2, Maximize2 } from "lucide-react";
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

  const handleMinify = useCallback(() => {
    if (minified) setInput(minified);
  }, [minified]);

  const handleBeautify = useCallback(() => {
    if (formatted) setInput(formatted);
  }, [formatted]);

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
          <button
            type="button"
            onClick={handleBeautify}
            disabled={!formatted || !!error}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Beautify</span>
          </button>
          <button
            type="button"
            onClick={handleMinify}
            disabled={!minified || !!error}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>
        </div>
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
