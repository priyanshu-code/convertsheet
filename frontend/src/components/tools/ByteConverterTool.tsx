"use client";

import React, { useState, useMemo } from "react";
import { HardDrive } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSelect,
  CalcToggle,
  CalcResult,
} from "@/components/calculator";

const UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;
type UnitType = (typeof UNITS)[number];

export function ByteConverterTool() {
  const [fileSize, setFileSize] = useState<number>(1024);
  const [sourceUnit, setSourceUnit] = useState<UnitType>("MB");
  const [standard, setStandard] = useState<"binary" | "decimal">("binary");

  const results = useMemo(() => {
    const val = Math.max(0, fileSize);
    const base = standard === "binary" ? 1024 : 1000;
    const unitIndex = UNITS.indexOf(sourceUnit);

    // Convert to raw bytes first
    const rawBytes = val * Math.pow(base, unitIndex);

    const converted = UNITS.map((unit, idx) => {
      const unitVal = rawBytes / Math.pow(base, idx);
      return {
        unit,
        value: unitVal >= 1000 ? unitVal.toLocaleString(undefined, { maximumFractionDigits: 2 }) : unitVal.toFixed(2),
      };
    });

    return {
      rawBytes: rawBytes.toLocaleString(),
      converted,
    };
  }, [fileSize, sourceUnit, standard]);

  return (
    <CalcCard
      title="Data Size & Byte Converter"
      subtitle="Convert digital file and storage capacities between Bytes, KB, MB, GB, TB, and PB in Binary (1024) or Decimal (1000) standards."
      icon={HardDrive}
      badge="Storage Math"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CalcToggle
          label="Base Standard"
          value={standard}
          options={[
            { value: "binary", label: "Binary Base (1024 - RAM / OS)" },
            { value: "decimal", label: "Decimal Base (1000 - SI / Disk)" },
          ]}
          onChange={(v) => setStandard(v as any)}
        />

        <div className="w-44">
          <CalcSelect
            id="byte-unit"
            label="Source Unit"
            value={sourceUnit}
            options={UNITS.map((u) => ({ value: u, label: u }))}
            onChange={(v) => setSourceUnit(v as UnitType)}
          />
        </div>
      </div>

      <CalcInput
        id="file-size"
        label="File / Capacity Size"
        value={fileSize}
        min={0}
        onChange={(v) => setFileSize(Number(v) || 0)}
      />

      <CalcResult
        title="Storage Equivalents"
        primaryLabel={`Total Raw Capacity in Bytes (${standard === "binary" ? "Base 1024" : "Base 1000"})`}
        primaryValue={`${results.rawBytes} Bytes`}
        copyValue={`${results.rawBytes} B`}
        items={results.converted.map((c) => ({
          label: `${c.unit} Equivalent`,
          value: `${c.value} ${c.unit}`,
          highlight: c.unit === sourceUnit,
        }))}
      />
    </CalcCard>
  );
}
