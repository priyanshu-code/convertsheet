"use client";

import React, { useState, useCallback } from "react";
import { Fingerprint, RefreshCw, Copy, Check } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcCopyButton,
  CalcPromptButton,
} from "@/components/calculator";

function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback using crypto.getRandomValues
  const rnd = new Uint8Array(16);
  crypto.getRandomValues(rnd);
  rnd[6] = (rnd[6] & 0x0f) | 0x40; // Version 4
  rnd[8] = (rnd[8] & 0x3f) | 0x80; // Variant 10xx
  const hex = Array.from(rnd, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function UuidGeneratorTool() {
  const [count, setCount] = useState<number>(5);
  const [casing, setCasing] = useState<"lower" | "upper">("lower");
  const [hyphens, setHyphens] = useState<"hyphen" | "compact">("hyphen");
  const [uuids, setUuids] = useState<string[]>(() => {
    return Array.from({ length: 5 }, () => generateUuidV4());
  });

  const handleGenerate = useCallback(() => {
    const qty = Math.min(500, Math.max(1, count));
    const items = Array.from({ length: qty }, () => {
      let id = generateUuidV4();
      if (hyphens === "compact") {
        id = id.replace(/-/g, "");
      }
      return casing === "upper" ? id.toUpperCase() : id.toLowerCase();
    });
    setUuids(items);
  }, [count, casing, hyphens]);

  const allUuidsText = uuids.join("\n");

  const llmPrompt = `Here is a set of generated UUID v4 identifiers:
${uuids.slice(0, 10).join("\n")}
${uuids.length > 10 ? `...and ${uuids.length - 10} more` : ""}

Please help me write a SQL or TypeScript migration seeding script using these UUIDs as primary keys.`;

  return (
    <CalcCard
      title="UUID / GUID v4 Batch Generator"
      subtitle="Generate cryptographically secure random Universally Unique Identifiers (UUID v4 / GUID) individually or in bulk."
      icon={Fingerprint}
      badge="RFC 4122"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalcInput
            id="uuid-count"
            label="Quantity (1 to 500)"
            value={count}
            onChange={(val) => setCount(Math.min(500, Math.max(1, val)))}
            min={1}
            max={500}
            step={1}
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Letter Casing
            </label>
            <CalcToggle
              value={casing}
              options={[
                { value: "lower", label: "lowercase" },
                { value: "upper", label: "UPPERCASE" },
              ]}
              onChange={(val) => setCasing(val as "lower" | "upper")}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Format Style
            </label>
            <CalcToggle
              value={hyphens}
              options={[
                { value: "hyphen", label: "With Hyphens" },
                { value: "compact", label: "Compact (No -)" },
              ]}
              onChange={(val) => setHyphens(val as "hyphen" | "compact")}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <RefreshCw className="w-4 h-4" />
            Generate New Batch
          </button>
          <CalcCopyButton text={allUuidsText} label="Copy All UUIDs" />
          <CalcPromptButton prompt={llmPrompt} toolName="UUID" />
        </div>

        {/* Results List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Generated {uuids.length} Identifiers</span>
            <span>Entropy: 122 bits / UUID</span>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 max-h-80 overflow-y-auto font-mono text-xs text-emerald-400 divide-y divide-zinc-800/60">
            {uuids.map((id, idx) => (
              <div key={idx} className="py-1.5 flex items-center justify-between gap-2 group hover:bg-zinc-800/40 px-2 rounded">
                <span className="truncate">{id}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-white"
                  title="Copy UUID"
                  aria-label={`Copy UUID ${id}`}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CalcCard>
  );
}
