"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Binary, ArrowRightLeft } from "lucide-react";
import {
  CalcCard,
  CalcTextarea,
  CalcToggle,
  CalcResult,
  CalcCopyButton,
} from "@/components/calculator";

export function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Hello ConvertSheet! 🚀");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null };
    try {
      if (mode === "encode") {
        // UTF-8 safe encode
        const bytes = new TextEncoder().encode(input);
        const binString = Array.from(bytes, (byte) =>
          String.fromCharCode(byte)
        ).join("");
        return { output: btoa(binString), error: null };
      } else {
        // UTF-8 safe decode
        const binString = atob(input.trim());
        const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
        return { output: new TextDecoder().decode(bytes), error: null };
      }
    } catch (e: any) {
      return { output: "", error: e.message || "Invalid Base64 string format" };
    }
  }, [input, mode]);

  const handleSwap = useCallback(() => {
    if (output && !error) {
      setInput(output);
      setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    }
  }, [output, error]);

  return (
    <CalcCard
      title="Base64 Encoder & Decoder"
      subtitle="Encode text or binary data into Base64 format or decode Base64 strings with full UTF-8 Unicode support."
      icon={Binary}
      badge="100% Client-Side"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CalcToggle
          value={mode}
          options={[
            { value: "encode", label: "Encode to Base64" },
            { value: "decode", label: "Decode from Base64" },
          ]}
          onChange={(val) => setMode(val as "encode" | "decode")}
        />

        {output && !error && (
          <button
            type="button"
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap Input/Output</span>
          </button>
        )}
      </div>

      <CalcTextarea
        id="base64-input"
        label={mode === "encode" ? "Plain Text Input (UTF-8)" : "Base64 Encoded Input"}
        value={input}
        onChange={setInput}
        placeholder={
          mode === "encode"
            ? "Enter raw text, JSON, or characters to encode..."
            : "Paste Base64 string here (e.g. SGVsbG8gQ29udmVydFNoZWV0IQ==)..."
        }
        rows={6}
      />

      {error ? (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
          ⚠️ {error}
        </div>
      ) : (
        <CalcResult
          title={mode === "encode" ? "Base64 Encoded Result" : "Decoded Text"}
          primaryValue={output || "(Waiting for input)"}
          copyValue={output}
          items={[
            {
              label: "Input Size",
              value: `${input.length} characters`,
            },
            {
              label: "Output Size",
              value: `${output.length} characters`,
            },
            {
              label: "Ratio",
              value: input.length > 0 ? `${((output.length / input.length) * 100).toFixed(0)}%` : "0%",
            },
          ]}
        />
      )}
    </CalcCard>
  );
}
