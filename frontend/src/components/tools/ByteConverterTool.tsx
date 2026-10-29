"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  HardDrive,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Binary,
  Layers,
} from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSelect,
  CalcToggle,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import * as XLSX from "xlsx";

const UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;
export type UnitType = (typeof UNITS)[number];

export interface ByteConverterToolProps {
  initialValues?: Partial<{
    fileSize: number;
    sourceUnit: UnitType;
    standard: "binary" | "decimal";
  }>;
}

export function ByteConverterTool({ initialValues }: ByteConverterToolProps = {}) {
  const [fileSize, setFileSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("size");
      if (q && !isNaN(Number(q))) return Number(q);
    }
    return initialValues?.fileSize ?? 1024;
  });

  const [sourceUnit, setSourceUnit] = useState<UnitType>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("unit");
      if (q && UNITS.includes(q as UnitType)) return q as UnitType;
    }
    return initialValues?.sourceUnit ?? "MB";
  });

  const [standard, setStandard] = useState<"binary" | "decimal">(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("standard");
      if (q === "binary" || q === "decimal") return q;
    }
    return initialValues?.standard ?? "binary";
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sharable State Permalinks: sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("size", fileSize.toString());
    params.set("unit", sourceUnit);
    params.set("standard", standard);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [fileSize, sourceUnit, standard]);

  const results = useMemo(() => {
    const val = Math.max(0, fileSize);
    const base = standard === "binary" ? 1024 : 1000;
    const unitIndex = UNITS.indexOf(sourceUnit);

    // Convert to raw bytes first
    const rawBytes = val * Math.pow(base, unitIndex);

    const converted = UNITS.map((unit, idx) => {
      const unitVal = rawBytes / Math.pow(base, idx);
      const formatted =
        unitVal >= 1000
          ? unitVal.toLocaleString(undefined, { maximumFractionDigits: 4 })
          : unitVal >= 1
          ? unitVal.toFixed(2)
          : unitVal.toFixed(4);

      return {
        unit,
        rawNumber: unitVal,
        value: formatted,
      };
    });

    // Equivalent in alternate standard
    const altBase = standard === "binary" ? 1000 : 1024;
    const altConverted = UNITS.map((unit, idx) => {
      const unitVal = rawBytes / Math.pow(altBase, idx);
      return {
        unit,
        value:
          unitVal >= 1000
            ? unitVal.toLocaleString(undefined, { maximumFractionDigits: 4 })
            : unitVal >= 1
            ? unitVal.toFixed(2)
            : unitVal.toFixed(4),
      };
    });

    const primaryUnit = sourceUnit === "MB" ? "GB" : sourceUnit === "GB" ? "TB" : "MB";
    const primaryTarget = converted.find((c) => c.unit === primaryUnit);

    return {
      rawBytes,
      rawBytesFormatted: rawBytes.toLocaleString(),
      converted,
      altConverted,
      primaryUnit,
      primaryTargetValue: primaryTarget?.value || "0",
    };
  }, [fileSize, sourceUnit, standard]);

  // Pre-configured developer capacity presets (min 44px touch targets)
  const PRESETS: { label: string; size: number; unit: UnitType; std: "binary" | "decimal" }[] = [
    { label: "1 MiB (1,048,576 B)", size: 1048576, unit: "B", std: "binary" },
    { label: "50 MB (ConvertSheet Limit)", size: 50, unit: "MB", std: "decimal" },
    { label: "100 MiB (Buffer Cap)", size: 100, unit: "MB", std: "binary" },
    { label: "1 GiB (Heap / RAM)", size: 1, unit: "GB", std: "binary" },
    { label: "1 TB (SSD / Disk)", size: 1, unit: "TB", std: "decimal" },
  ];

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    try {
      const base = standard === "binary" ? 1024 : 1000;
      const unitIndex = UNITS.indexOf(sourceUnit);
      const wb = XLSX.utils.book_new();

      // Tab 1: Storage Summary with active live cell formulas
      const summaryRows: any[][] = [
        ["ConvertSheet Data Size & Storage Capacity Model", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["Calculation Standard", standard === "binary" ? "Binary (Base 1024 - IEC/JEDEC)" : "Decimal (Base 1000 - SI)"],
        ["Recalculate Online", `https://www.convertsheet.com/tools/byte-converter?size=${fileSize}&unit=${sourceUnit}&standard=${standard}`],
        ["Privacy Assurance", "100% Client-Side In-Browser Calculation • Zero Server Storage"],
        ["", ""],
        ["--- INPUT STORAGE PARAMETERS ---", ""],
        ["Source Value", { t: "n", v: fileSize }],
        ["Source Unit", sourceUnit],
        ["Base Standard Mode", standard],
        ["Base Multiplier", { t: "n", f: 'IF(B10="binary",1024,1000)', v: base }],
        ["Unit Power Offset", { t: "n", v: unitIndex }],
        ["", ""],
        ["--- STORAGE CAPACITY BREAKDOWN & LIVE FORMULAS ---", ""],
        ["Total Raw Bytes (B)", { t: "n", f: "B8*(B11^B12)", v: results.rawBytes }],
        ["Kilobytes (KB / KiB)", { t: "n", f: "B15/B11", v: results.rawBytes / base }],
        ["Megabytes (MB / MiB)", { t: "n", f: "B15/(B11^2)", v: results.rawBytes / Math.pow(base, 2) }],
        ["Gigabytes (GB / GiB)", { t: "n", f: "B15/(B11^3)", v: results.rawBytes / Math.pow(base, 3) }],
        ["Terabytes (TB / TiB)", { t: "n", f: "B15/(B11^4)", v: results.rawBytes / Math.pow(base, 4) }],
        ["Petabytes (PB / PiB)", { t: "n", f: "B15/(B11^5)", v: results.rawBytes / Math.pow(base, 5) }],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary["!cols"] = [{ wch: 35 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Storage Summary");

      // Tab 2: Multi-Standard Comparison Matrix (IEC Binary vs SI Decimal)
      const matrixRows: any[][] = [
        ["ConvertSheet - Multi-Standard Storage Comparison Matrix", "", "", ""],
        ["Reference File Size", `${fileSize} ${sourceUnit}`, "", ""],
        ["Canonical Tool", "https://www.convertsheet.com/tools/byte-converter", "", ""],
        ["", "", "", ""],
        ["Storage Unit", "IEC Binary (Base 1024)", "SI Decimal (Base 1000)", "Binary vs Decimal Variance %"],
      ];

      UNITS.forEach((u, idx) => {
        const rowNum = 6 + idx;
        const binVal = results.rawBytes / Math.pow(1024, idx);
        const decVal = results.rawBytes / Math.pow(1000, idx);
        const variance = decVal > 0 ? ((binVal - decVal) / decVal) * 100 : 0;

        matrixRows.push([
          u,
          {
            t: "n",
            f: `'Storage Summary'!$B$15/(1024^${idx})`,
            v: binVal,
          },
          {
            t: "n",
            f: `'Storage Summary'!$B$15/(1000^${idx})`,
            v: decVal,
          },
          {
            t: "n",
            f: `IF(C${rowNum}>0, ((B${rowNum}-C${rowNum})/C${rowNum})*100, 0)`,
            v: variance,
          },
        ]);
      });

      matrixRows.push(["", "", "", ""]);
      matrixRows.push(["Developer Quick Reference Formulas", "", "", ""]);
      matrixRows.push(["Formula Description", "Raw Value Expression", "Resulting Magnitude"]);
      matrixRows.push(["1 MiB in Bytes (1024^2)", { t: "n", f: "1024*1024", v: 1048576 }, "1,048,576 Bytes"]);
      matrixRows.push(["1 GiB in Bytes (1024^3)", { t: "n", f: "1024*1024*1024", v: 1073741824 }, "1,073,741,824 Bytes"]);
      matrixRows.push(["1 TB SI in Bytes (1000^4)", { t: "n", f: "1000*1000*1000*1000", v: 1000000000000 }, "1,000,000,000,000 Bytes"]);

      const wsMatrix = XLSX.utils.aoa_to_sheet(matrixRows);
      wsMatrix["!cols"] = [{ wch: 28 }, { wch: 25 }, { wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsMatrix, "MultiBase Matrix");

      XLSX.writeFile(wb, `ConvertSheet-Byte-Converter-${fileSize}${sourceUnit}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const llmPrompt = `Analyze storage capacity and memory allocation for ${fileSize} ${sourceUnit} (${standard} base):\n- Raw Bytes: ${results.rawBytesFormatted}\n- IEC Binary Standard (Base 1024): ${results.converted.map((c) => `${c.value} ${c.unit}`).join(", ")}\n- SI Decimal Standard (Base 1000): ${results.altConverted.map((c) => `${c.value} ${c.unit}`).join(", ")}\nEvaluate RAM footprint, buffer chunking strategies, network transfer latency over 1 Gbps, and disk partitioning overhead.`;

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      <CalcCard
        title="Data Size & Byte Converter"
        subtitle="Convert digital file and storage capacities between Bytes, KB, MB, GB, TB, and PB in Binary (1024) or Decimal (1000) standards."
        icon={HardDrive}
        badge="Storage Engine"
      >
        {/* 100% Client-Side Privacy Reassurance Badge */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-200">100% Client-Side Privacy:</strong>{" "}
            Zero data leaves your browser. All byte division and calculations run in local browser memory.
          </span>
        </div>

        {/* 2026 Standards Freshness Signal */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <span className="font-medium">
            Updated for 2026 IEC 80000-13 & JEDEC Standards: (October 29, 2026) Binary (1024 - RAM/OS/WASM) vs Decimal (1000 - Disk/Network/SI)
          </span>
        </div>

        {/* Quick Capacity Presets (44px min touch target) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Developer & Storage Presets</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setFileSize(preset.size);
                  setSourceUnit(preset.unit);
                  setStandard(preset.std);
                }}
                className={`min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors touch-manipulation cursor-pointer flex items-center justify-center ${
                  fileSize === preset.size && sourceUnit === preset.unit && standard === preset.std
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Standards & Unit Selection */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CalcToggle
            label="Base Standard"
            value={standard}
            options={[
              { value: "binary", label: "Binary (1024 - RAM / OS / WASM)" },
              { value: "decimal", label: "Decimal (1000 - SI / Disk / Network)" },
            ]}
            onChange={(v) => setStandard(v as any)}
          />

          <div className="w-full sm:w-48">
            <CalcSelect
              id="byte-unit"
              label="Source Unit"
              value={sourceUnit}
              options={UNITS.map((u) => ({ value: u, label: `${u} (${u === "B" ? "Bytes" : u + "B"})` }))}
              onChange={(v) => setSourceUnit(v as UnitType)}
            />
          </div>
        </div>

        {/* Input & Range Slider Pairing */}
        <div className="space-y-3">
          <CalcInput
            id="file-size"
            label="File / Capacity Size"
            value={fileSize}
            min={0}
            step={sourceUnit === "B" ? 1024 : 1}
            onChange={(v) => setFileSize(Math.max(0, Number(v) || 0))}
          />

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Slider Adjustment ({sourceUnit})</span>
              <span>{fileSize.toLocaleString()} {sourceUnit}</span>
            </div>
            <input
              type="range"
              min={sourceUnit === "B" ? 1024 : 1}
              max={sourceUnit === "B" ? 10485760 : sourceUnit === "TB" ? 100 : 2048}
              step={sourceUnit === "B" ? 1024 : 1}
              value={fileSize}
              onChange={(e) => setFileSize(Number(e.target.value))}
              aria-label={`File size slider for ${sourceUnit}`}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400 touch-manipulation"
            />
          </div>
        </div>

        {/* Developer Quick Formulas Breakdown */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs">
          <div className="font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
            <Binary className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Developer Quick Arithmetic</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-400 block font-sans text-[10px]">1048576 / 1024</span>
              1,048,576 B ÷ 1,024 = 1,024 KiB = 1 MiB
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-400 block font-sans text-[10px]">100*1024*1024</span>
              100 × 1024² = 104,857,600 B (100 MiB)
            </div>
          </div>
        </div>

        {/* Action Buttons: Save, Share, Prompt, Excel Export */}
        <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
          <CalcSaveButton
            calculationType="Storage Size Conversion"
            inputs={{ fileSize, sourceUnit, standard }}
            outputs={{
              rawBytes: results.rawBytesFormatted,
              primaryTarget: `${results.primaryTargetValue} ${results.primaryUnit}`,
            }}
          />
          <CalcShareButton
            title="ConvertSheet Storage Size Calculation"
            text={`${fileSize} ${sourceUnit} = ${results.rawBytesFormatted} Bytes (${results.primaryTargetValue} ${results.primaryUnit})`}
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

        {/* Primary Results Display */}
        <CalcResult
          title="Storage Equivalents"
          primaryLabel={`Total Raw Capacity in Bytes (${standard === "binary" ? "Base 1024" : "Base 1000"})`}
          primaryValue={`${results.rawBytesFormatted} Bytes`}
          copyValue={`${results.rawBytesFormatted} B`}
          items={results.converted.map((c, i) => ({
            label: `${c.unit} Equivalent`,
            value: `${c.value} ${c.unit}`,
            highlight: c.unit === sourceUnit,
            badge: standard === "binary" ? "IEC / JEDEC" : "SI Decimal",
          }))}
        />
      </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
            Storage Size ({sourceUnit})
          </span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {results.primaryTargetValue} {results.primaryUnit}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate max-w-[170px]">
            {results.rawBytesFormatted} Bytes
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
