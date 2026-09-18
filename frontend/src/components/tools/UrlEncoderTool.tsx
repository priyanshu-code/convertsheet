"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Link2, ArrowRightLeft } from "lucide-react";
import {
  CalcCard,
  CalcTextarea,
  CalcToggle,
  CalcResult,
} from "@/components/calculator";

export function UrlEncoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [scope, setScope] = useState<"component" | "full">("component");
  const [input, setInput] = useState("https://www.convertsheet.com/search?query=data format & export=true");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null };
    try {
      if (mode === "encode") {
        return {
          output: scope === "component" ? encodeURIComponent(input) : encodeURI(input),
          error: null,
        };
      } else {
        return {
          output: scope === "component" ? decodeURIComponent(input) : decodeURI(input),
          error: null,
        };
      }
    } catch (e: any) {
      return { output: "", error: e.message || "Invalid percent-encoded URI string" };
    }
  }, [input, mode, scope]);

  const handleSwap = useCallback(() => {
    if (output && !error) {
      setInput(output);
      setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    }
  }, [output, error]);

  return (
    <CalcCard
      title="URL Encoder & Decoder"
      subtitle="Encode special characters into percent-encoded ASCII format or decode percent-encoded URLs back to readable text."
      icon={Link2}
      badge="RFC 3986"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CalcToggle
          value={mode}
          options={[
            { value: "encode", label: "Encode URL" },
            { value: "decode", label: "Decode URL" },
          ]}
          onChange={(val) => setMode(val as "encode" | "decode")}
        />

        <div className="flex items-center gap-3">
          <CalcToggle
            value={scope}
            options={[
              { value: "component", label: "Component (Param)" },
              { value: "full", label: "Full URI" },
            ]}
            onChange={(val) => setScope(val as "component" | "full")}
          />

          {output && !error && (
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>
          )}
        </div>
      </div>

      <CalcTextarea
        id="url-input"
        label={mode === "encode" ? "Raw URL or Query String" : "Percent-Encoded String"}
        value={input}
        onChange={setInput}
        placeholder="Enter URL to encode or decode..."
        rows={5}
      />

      {error ? (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
          ⚠️ {error}
        </div>
      ) : (
        <CalcResult
          title={mode === "encode" ? "Encoded URL" : "Decoded URL"}
          primaryValue={output || "(Waiting for input)"}
          copyValue={output}
          items={[
            { label: "Mode", value: mode.toUpperCase() },
            { label: "Target Scope", value: scope === "component" ? "Query Component" : "Full URI" },
            { label: "Output Length", value: `${output.length} chars` },
          ]}
        />
      )}
    </CalcCard>
  );
}
