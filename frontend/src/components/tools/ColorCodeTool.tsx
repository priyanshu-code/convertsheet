"use client";

import React, { useState, useMemo } from "react";
import { Palette } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcResult,
} from "@/components/calculator";

export function ColorCodeTool() {
  const [hex, setHex] = useState("#10B981");

  const colorData = useMemo(() => {
    let clean = hex.trim().replace(/^#/, "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
      return { error: "Enter a valid 6-character HEX color (e.g. #10B981)" };
    }

    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    // HSL Conversion
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    return {
      error: null,
      hex: `#${clean.toUpperCase()}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, 1)`,
      hsl: `hsl(${hDeg}, ${sPct}%, ${lPct}%)`,
      cssVar: `--color-primary: #${clean.toUpperCase()};`,
    };
  }, [hex]);

  return (
    <CalcCard
      title="Color Code Converter (HEX, RGB, HSL)"
      subtitle="Convert web colors across HEX, RGB, and HSL formats with live visual preview swatch and instant CSS exports."
      icon={Palette}
      badge="CSS3 Ready"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-4">
          <CalcInput
            id="hex-input"
            label="HEX Color Code"
            value={hex}
            type="text"
            onChange={setHex}
            placeholder="#10B981"
            prefix="#"
          />
        </div>

        {/* Live Color Swatch */}
        {!colorData.error && (
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
            <div
              className="w-24 h-24 rounded-2xl shadow-md border-2 border-white dark:border-zinc-900 transition-colors"
              style={{ backgroundColor: colorData.hex }}
            />
            <span className="font-mono font-bold text-xs text-zinc-600 dark:text-zinc-300">
              {colorData.hex}
            </span>
          </div>
        )}
      </div>

      {colorData.error ? (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
          ⚠️ {colorData.error}
        </div>
      ) : (
        <CalcResult
          title="Color Code Transformations"
          primaryLabel="HEX Code"
          primaryValue={colorData.hex || ""}
          copyValue={colorData.hex}
          items={[
            { label: "RGB Format", value: colorData.rgb || "" },
            { label: "HSL Format", value: colorData.hsl || "" },
            { label: "CSS Variable", value: colorData.cssVar || "", highlight: true },
          ]}
        />
      )}
    </CalcCard>
  );
}
