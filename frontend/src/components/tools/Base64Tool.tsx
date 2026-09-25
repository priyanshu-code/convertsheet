"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Binary,
  ArrowRightLeft,
  Clipboard,
  Copy,
  Check,
  RotateCcw,
  Minimize2,
} from "lucide-react";
import {
  CalcCard,
  CalcTextarea,
  CalcToggle,
  CalcResult,
  CalcCopyButton,
  CalcShareButton,
} from "@/components/calculator";

export function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">(() => {
    if (typeof window !== "undefined") {
      const m = new URLSearchParams(window.location.search).get("mode");
      if (m === "encode" || m === "decode") return m;
    }
    return "encode";
  });

  const [input, setInput] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("input");
      if (q) return q;
    }
    return "Hello ConvertSheet! 🚀";
  });

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

  const [copied, setCopied] = useState(false);

  const handleSwap = useCallback(() => {
    if (output && !error) {
      setInput(output);
      setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    }
  }, [output, error]);

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

  const handleRemoveWhitespace = useCallback(() => {
    if (!input) return;
    setInput(input.replace(/\s+/g, ""));
  }, [input]);

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

        <div className="flex items-center gap-2">
          <CalcShareButton
            state={{
              input,
              mode,
            }}
            label="Share Link"
          />
          {output && !error && (
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Swap Input/Output</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Toolbar: Paste | Copy | Remove white space | Clear */}
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
          aria-label="Copy input text"
          title="Copy input text"
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
          onClick={handleRemoveWhitespace}
          disabled={!input}
          aria-label="Remove white space"
          title="Remove all whitespace and newlines"
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
          title="Clear input"
          className="inline-flex items-center gap-1 px-2 py-1 font-medium rounded-md text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
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
