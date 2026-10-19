"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Scale,
  ArrowRightLeft,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Sliders,
  Copy,
  Check,
} from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSelect,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import * as XLSX from "xlsx";

type Dimension = "length" | "weight" | "temperature" | "speed" | "area" | "volume";

interface DimensionConfig {
  label: string;
  units: { value: string; label: string; symbol: string }[];
  toBase: Record<string, (v: number) => number>;
  fromBase: Record<string, (v: number) => number>;
  sliderRange: { min: number; max: number; step: number };
}

const CONVERSION_FACTORS: Record<Dimension, DimensionConfig> = {
  length: {
    label: "Length & Distance",
    sliderRange: { min: 1, max: 500, step: 1 },
    units: [
      { value: "m", label: "Meters (m)", symbol: "m" },
      { value: "km", label: "Kilometers (km)", symbol: "km" },
      { value: "cm", label: "Centimeters (cm)", symbol: "cm" },
      { value: "mm", label: "Millimeters (mm)", symbol: "mm" },
      { value: "ft", label: "Feet (ft)", symbol: "ft" },
      { value: "in", label: "Inches (in)", symbol: "in" },
      { value: "yd", label: "Yards (yd)", symbol: "yd" },
      { value: "mi", label: "Miles (mi)", symbol: "mi" },
    ],
    toBase: {
      m: (v) => v,
      km: (v) => v * 1000,
      cm: (v) => v / 100,
      mm: (v) => v / 1000,
      ft: (v) => v * 0.3048,
      in: (v) => v * 0.0254,
      yd: (v) => v * 0.9144,
      mi: (v) => v * 1609.344,
    },
    fromBase: {
      m: (v) => v,
      km: (v) => v / 1000,
      cm: (v) => v * 100,
      mm: (v) => v * 1000,
      ft: (v) => v / 0.3048,
      in: (v) => v / 0.0254,
      yd: (v) => v / 0.9144,
      mi: (v) => v / 1609.344,
    },
  },
  weight: {
    label: "Weight & Mass",
    sliderRange: { min: 1, max: 250, step: 1 },
    units: [
      { value: "kg", label: "Kilograms (kg)", symbol: "kg" },
      { value: "g", label: "Grams (g)", symbol: "g" },
      { value: "mg", label: "Milligrams (mg)", symbol: "mg" },
      { value: "lb", label: "Pounds (lbs)", symbol: "lb" },
      { value: "oz", label: "Ounces (oz)", symbol: "oz" },
      { value: "ton", label: "Metric Tons (t)", symbol: "t" },
    ],
    toBase: {
      kg: (v) => v,
      g: (v) => v / 1000,
      mg: (v) => v / 1000000,
      lb: (v) => v * 0.45359237,
      oz: (v) => v * 0.028349523125,
      ton: (v) => v * 1000,
    },
    fromBase: {
      kg: (v) => v,
      g: (v) => v * 1000,
      mg: (v) => v * 1000000,
      lb: (v) => v / 0.45359237,
      oz: (v) => v / 0.028349523125,
      ton: (v) => v / 1000,
    },
  },
  temperature: {
    label: "Temperature",
    sliderRange: { min: -50, max: 300, step: 1 },
    units: [
      { value: "c", label: "Celsius (°C)", symbol: "°C" },
      { value: "f", label: "Fahrenheit (°F)", symbol: "°F" },
      { value: "k", label: "Kelvin (K)", symbol: "K" },
    ],
    toBase: {
      c: (v) => v,
      f: (v) => (v - 32) * (5 / 9),
      k: (v) => v - 273.15,
    },
    fromBase: {
      c: (v) => v,
      f: (v) => v * (9 / 5) + 32,
      k: (v) => v + 273.15,
    },
  },
  speed: {
    label: "Speed & Velocity",
    sliderRange: { min: 1, max: 250, step: 1 },
    units: [
      { value: "kmh", label: "Kilometers per hour (km/h)", symbol: "km/h" },
      { value: "mph", label: "Miles per hour (mph)", symbol: "mph" },
      { value: "ms", label: "Meters per second (m/s)", symbol: "m/s" },
      { value: "knot", label: "Knots (kn)", symbol: "kn" },
    ],
    toBase: {
      kmh: (v) => v / 3.6,
      mph: (v) => v * 0.44704,
      ms: (v) => v,
      knot: (v) => v * 0.514444,
    },
    fromBase: {
      kmh: (v) => v * 3.6,
      mph: (v) => v / 0.44704,
      ms: (v) => v,
      knot: (v) => v / 0.514444,
    },
  },
  area: {
    label: "Area & Land",
    sliderRange: { min: 1, max: 1000, step: 1 },
    units: [
      { value: "sqm", label: "Square Meters (m²)", symbol: "m²" },
      { value: "sqkm", label: "Square Kilometers (km²)", symbol: "km²" },
      { value: "sqft", label: "Square Feet (sq ft)", symbol: "sq ft" },
      { value: "acre", label: "Acres (ac)", symbol: "ac" },
      { value: "hectare", label: "Hectares (ha)", symbol: "ha" },
    ],
    toBase: {
      sqm: (v) => v,
      sqkm: (v) => v * 1000000,
      sqft: (v) => v * 0.092903,
      acre: (v) => v * 4046.8564224,
      hectare: (v) => v * 10000,
    },
    fromBase: {
      sqm: (v) => v,
      sqkm: (v) => v / 1000000,
      sqft: (v) => v / 0.092903,
      acre: (v) => v / 4046.8564224,
      hectare: (v) => v / 10000,
    },
  },
  volume: {
    label: "Volume & Liquid",
    sliderRange: { min: 1, max: 500, step: 1 },
    units: [
      { value: "l", label: "Liters (L)", symbol: "L" },
      { value: "ml", label: "Milliliters (mL)", symbol: "mL" },
      { value: "gal", label: "US Gallons (gal)", symbol: "gal" },
      { value: "floz", label: "US Fluid Ounces (fl oz)", symbol: "fl oz" },
      { value: "cup", label: "US Cups", symbol: "cup" },
    ],
    toBase: {
      l: (v) => v,
      ml: (v) => v / 1000,
      gal: (v) => v * 3.785411784,
      floz: (v) => v * 0.0295735295625,
      cup: (v) => v * 0.2365882365,
    },
    fromBase: {
      l: (v) => v,
      ml: (v) => v * 1000,
      gal: (v) => v / 3.785411784,
      floz: (v) => v / 0.0295735295625,
      cup: (v) => v / 0.2365882365,
    },
  },
};

export interface UnitConverterToolProps {
  initialValues?: Partial<{
    dimension: Dimension;
    fromUnit: string;
    toUnit: string;
    value: number;
  }>;
}

export function UnitConverterTool({ initialValues }: UnitConverterToolProps = {}) {
  const [dimension, setDimension] = useState<Dimension>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("dim");
      if (q && q in CONVERSION_FACTORS) return q as Dimension;
    }
    return initialValues?.dimension || "length";
  });

  const [fromUnit, setFromUnit] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("from");
      if (q) return q;
    }
    return initialValues?.fromUnit || "km";
  });

  const [toUnit, setToUnit] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("to");
      if (q) return q;
    }
    return initialValues?.toUnit || "mi";
  });

  const [value, setValue] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("val");
      if (q && !isNaN(Number(q))) return Number(q);
    }
    return initialValues?.value ?? 5;
  });

  const [copied, setCopied] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sharable State Permalinks
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("dim", dimension);
    params.set("from", fromUnit);
    params.set("to", toUnit);
    params.set("val", value.toString());
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [dimension, fromUnit, toUnit, value]);

  const config = CONVERSION_FACTORS[dimension];

  // Safeguard when dimension switches
  useEffect(() => {
    const validUnits = config.units.map((u) => u.value);
    if (!validUnits.includes(fromUnit)) {
      setFromUnit(validUnits[0]);
    }
    if (!validUnits.includes(toUnit)) {
      setToUnit(validUnits[1] || validUnits[0]);
    }
  }, [dimension, config, fromUnit, toUnit]);

  const convertedResult = useMemo(() => {
    if (isNaN(value)) return 0;
    const toBaseFn = config.toBase[fromUnit];
    const fromBaseFn = config.fromBase[toUnit];
    if (!toBaseFn || !fromBaseFn) return 0;

    const baseVal = toBaseFn(value);
    const targetVal = fromBaseFn(baseVal);
    return Math.round(targetVal * 100000) / 100000;
  }, [value, fromUnit, toUnit, config]);

  // Full equivalent breakdown for all units in this dimension
  const allEquivalents = useMemo(() => {
    if (isNaN(value)) return [];
    const toBaseFn = config.toBase[fromUnit];
    if (!toBaseFn) return [];
    const baseVal = toBaseFn(value);

    return config.units.map((u) => {
      const fn = config.fromBase[u.value];
      const val = fn ? Math.round(fn(baseVal) * 100000) / 100000 : 0;
      return {
        unit: u.value,
        label: u.label,
        symbol: u.symbol,
        value: val >= 1000 ? val.toLocaleString(undefined, { maximumFractionDigits: 4 }) : val.toString(),
      };
    });
  }, [value, fromUnit, config]);

  const fromLabel = config.units.find((u) => u.value === fromUnit)?.symbol || fromUnit;
  const toLabel = config.units.find((u) => u.value === toUnit)?.symbol || toUnit;

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${convertedResult} ${toLabel}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Popular conversion shortcuts
  const SHORTCUTS = [
    { label: "km ↔ mi", dim: "length" as const, from: "km", to: "mi", val: 5 },
    { label: "kg ↔ lb", dim: "weight" as const, from: "kg", to: "lb", val: 70 },
    { label: "°C ↔ °F", dim: "temperature" as const, from: "c", to: "f", val: 20 },
    { label: "km/h ↔ mph", dim: "speed" as const, from: "kmh", to: "mph", val: 100 },
    { label: "acre ↔ sq ft", dim: "area" as const, from: "acre", to: "sqft", val: 1 },
    { label: "gal ↔ L", dim: "volume" as const, from: "gal", to: "l", val: 1 },
  ];

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    try {
      const wb = XLSX.utils.book_new();
      const exportData = [
        ["ConvertSheet Universal Unit Conversion Schedule"],
        ["Generated:", new Date().toLocaleDateString(), "Dimension:", config.label],
        ["Source Value:", `${value} ${fromLabel}`],
        ["Converted Value:", `${convertedResult} ${toLabel}`],
        ["Canonical Calculator:", `https://www.convertsheet.com/tools/unit-converter?dim=${dimension}&from=${fromUnit}&to=${toUnit}&val=${value}`],
        [],
        ["Target Unit", "Symbol", "Converted Equivalent", "Formula vs Base"],
        ...allEquivalents.map((e) => [e.label, e.symbol, `${e.value} ${e.symbol}`, `Converted from ${value} ${fromLabel}`]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(exportData);
      ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, ws, "Conversion Schedule");
      XLSX.writeFile(wb, `ConvertSheet-Unit-Conversion-${value}${fromUnit}-to-${toUnit}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const llmPrompt = `Convert and analyze the physical measurement: ${value} ${fromLabel} to ${toLabel} (${config.label}).\n- Converted: ${convertedResult} ${toLabel}\n- Equivalents across all standards: ${allEquivalents.map((e) => `${e.value} ${e.symbol}`).join(", ")}\nProvide dimensional analysis, engineering tolerance considerations, and practical physical analogies.`;

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      <CalcCard
        title="Universal Unit Converter"
        subtitle="Instantly convert between metric and imperial units across length, mass, temperature, area, volume, and speed."
        icon={Scale}
        badge="Universal Engine"
      >
        {/* 100% Client-Side Privacy Reassurance Badge */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-200">100% Client-Side Privacy:</strong>{" "}
            All transformations run entirely in your local browser memory. Zero tracking, zero data transmission.
          </span>
        </div>

        {/* 2026 Standards Freshness Signal */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <span className="font-medium">
            Updated for 2026 BIPM & NIST Standards: High-precision metric & imperial physical conversion constants
          </span>
        </div>

        {/* Popular 1-Tap Conversion Shortcuts (44px min touch target) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Popular 1-Tap Shortcuts
          </label>
          <div className="flex flex-wrap gap-2">
            {SHORTCUTS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setDimension(s.dim);
                  setFromUnit(s.from);
                  setToUnit(s.to);
                  setValue(s.val);
                }}
                className={`min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors touch-manipulation cursor-pointer flex items-center justify-center ${
                  dimension === s.dim && fromUnit === s.from && toUnit === s.to
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension Pill Selector (44px min touch targets) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Physical Dimension
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {(Object.keys(CONVERSION_FACTORS) as Dimension[]).map((dim) => (
              <button
                key={dim}
                type="button"
                onClick={() => setDimension(dim)}
                className={`min-h-[44px] px-3 py-2 text-xs font-medium rounded-xl border transition-all text-center touch-manipulation cursor-pointer flex items-center justify-center ${
                  dimension === dim
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750"
                }`}
              >
                {CONVERSION_FACTORS[dim].label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Selectors & 44px Swap Button */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-end">
          <CalcSelect
            id="from-unit"
            label="Convert From"
            value={fromUnit}
            options={config.units.map((u) => ({ value: u.value, label: u.label }))}
            onChange={(v) => setFromUnit(v)}
          />

          <div className="flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap units"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors shadow-xs flex items-center justify-center touch-manipulation cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>
          </div>

          <CalcSelect
            id="to-unit"
            label="Convert To"
            value={toUnit}
            options={config.units.map((u) => ({ value: u.value, label: u.label }))}
            onChange={(v) => setToUnit(v)}
          />
        </div>

        {/* Value Input & Paired Range Slider */}
        <div className="space-y-3">
          <CalcInput
            id="unit-value"
            label={`Value to Convert (${fromLabel})`}
            value={value}
            step="any"
            onChange={(v) => setValue(Number(v) || 0)}
          />

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Slider Adjustment ({fromLabel})</span>
              <span>{value} {fromLabel}</span>
            </div>
            <input
              type="range"
              min={config.sliderRange.min}
              max={config.sliderRange.max}
              step={config.sliderRange.step}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              aria-label={`Slider for ${fromLabel}`}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400 touch-manipulation"
            />
          </div>

          {/* Quick Value Buttons (44px min touch target) */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[1, 5, 10, 50, 100].map((quickVal) => (
              <button
                key={quickVal}
                type="button"
                onClick={() => setValue(quickVal)}
                className="min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-zinc-200 dark:border-zinc-700 touch-manipulation cursor-pointer flex items-center justify-center shadow-xs"
              >
                {quickVal}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Save, Share, Prompt, Excel Export */}
        <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
          <CalcSaveButton
            calculationType="Unit Conversion"
            inputs={{ dimension, fromUnit, toUnit, value }}
            outputs={{
              converted: `${convertedResult} ${toLabel}`,
              source: `${value} ${fromLabel}`,
            }}
          />
          <CalcShareButton
            title="ConvertSheet Unit Conversion"
            text={`${value} ${fromLabel} = ${convertedResult} ${toLabel}`}
          />
          <CalcPromptButton promptText={llmPrompt} />
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 touch-manipulation"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isExportingExcel ? "Generating .xlsx..." : "Export to Excel (.xlsx)"}</span>
          </button>
        </div>

        {/* Result Display */}
        <CalcResult
          title="Unit Conversion Result"
          primaryLabel={`Converted to ${config.units.find((u) => u.value === toUnit)?.label || toUnit}`}
          primaryValue={`${convertedResult.toLocaleString()} ${toLabel}`}
          copyValue={`${convertedResult} ${toLabel}`}
          items={allEquivalents.map((e) => ({
            label: e.label,
            value: `${e.value} ${e.symbol}`,
            highlight: e.unit === toUnit,
          }))}
        />
      </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
            {value} {fromLabel} Converted
          </span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {convertedResult.toLocaleString()} {toLabel}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate max-w-[170px]">
            {config.label}
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs touch-manipulation"
        >
          <Download className="w-4 h-4" />
          <span>Export .xlsx</span>
        </button>
      </div>
    </div>
  );
}
