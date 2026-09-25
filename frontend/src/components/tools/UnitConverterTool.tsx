"use client";

import React, { useState, useMemo } from "react";
import { Scale, ArrowRightLeft } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSelect,
  CalcToggle,
  CalcResult,
} from "@/components/calculator";

type Dimension = "length" | "weight" | "temperature" | "speed";

const CONVERSION_FACTORS: Record<
  Dimension,
  {
    units: { value: string; label: string }[];
    toBase: Record<string, (v: number) => number>;
    fromBase: Record<string, (v: number) => number>;
  }
> = {
  length: {
    units: [
      { value: "m", label: "Meters (m)" },
      { value: "km", label: "Kilometers (km)" },
      { value: "cm", label: "Centimeters (cm)" },
      { value: "mm", label: "Millimeters (mm)" },
      { value: "ft", label: "Feet (ft)" },
      { value: "in", label: "Inches (in)" },
      { value: "mi", label: "Miles (mi)" },
    ],
    toBase: {
      m: (v) => v,
      km: (v) => v * 1000,
      cm: (v) => v / 100,
      mm: (v) => v / 1000,
      ft: (v) => v * 0.3048,
      in: (v) => v * 0.0254,
      mi: (v) => v * 1609.344,
    },
    fromBase: {
      m: (v) => v,
      km: (v) => v / 1000,
      cm: (v) => v * 100,
      mm: (v) => v * 1000,
      ft: (v) => v / 0.3048,
      in: (v) => v / 0.0254,
      mi: (v) => v / 1609.344,
    },
  },
  weight: {
    units: [
      { value: "kg", label: "Kilograms (kg)" },
      { value: "g", label: "Grams (g)" },
      { value: "mg", label: "Milligrams (mg)" },
      { value: "lb", label: "Pounds (lbs)" },
      { value: "oz", label: "Ounces (oz)" },
      { value: "ton", label: "Metric Tons (t)" },
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
    units: [
      { value: "c", label: "Celsius (°C)" },
      { value: "f", label: "Fahrenheit (°F)" },
      { value: "k", label: "Kelvin (K)" },
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
    units: [
      { value: "kmh", label: "Kilometers per hour (km/h)" },
      { value: "mph", label: "Miles per hour (mph)" },
      { value: "ms", label: "Meters per second (m/s)" },
      { value: "knot", label: "Knots (kn)" },
    ],
    toBase: {
      ms: (v) => v,
      kmh: (v) => v / 3.6,
      mph: (v) => v * 0.44704,
      knot: (v) => v * 0.514444,
    },
    fromBase: {
      ms: (v) => v,
      kmh: (v) => v * 3.6,
      mph: (v) => v / 0.44704,
      knot: (v) => v / 0.514444,
    },
  },
};

export function UnitConverterTool() {
  const [dimension, setDimension] = useState<Dimension>("length");
  const [inputValue, setInputValue] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("ft");

  const dimConfig = CONVERSION_FACTORS[dimension];

  const handleDimensionChange = (newDim: Dimension) => {
    setDimension(newDim);
    const newConfig = CONVERSION_FACTORS[newDim];
    setFromUnit(newConfig.units[0].value);
    setToUnit(newConfig.units[1].value);
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const convertedValue = useMemo(() => {
    try {
      const baseVal = dimConfig.toBase[fromUnit](inputValue);
      const targetVal = dimConfig.fromBase[toUnit](baseVal);
      return Math.round(targetVal * 1000000) / 1000000;
    } catch {
      return 0;
    }
  }, [inputValue, fromUnit, toUnit, dimConfig]);

  const fromLabel = dimConfig.units.find((u) => u.value === fromUnit)?.label || fromUnit;
  const toLabel = dimConfig.units.find((u) => u.value === toUnit)?.label || toUnit;

  const POPULAR_CONVERSIONS = [
    { label: "km ↔ mi", dim: "length" as Dimension, from: "km", to: "mi" },
    { label: "m ↔ ft", dim: "length" as Dimension, from: "m", to: "ft" },
    { label: "cm ↔ in", dim: "length" as Dimension, from: "cm", to: "in" },
    { label: "kg ↔ lbs", dim: "weight" as Dimension, from: "kg", to: "lb" },
    { label: "g ↔ oz", dim: "weight" as Dimension, from: "g", to: "oz" },
    { label: "°C ↔ °F", dim: "temperature" as Dimension, from: "c", to: "f" },
    { label: "km/h ↔ mph", dim: "speed" as Dimension, from: "kmh", to: "mph" },
  ];

  const QUICK_VALUES = [1, 5, 10, 25, 50, 100, 500];

  return (
    <CalcCard
      title="Universal Unit Converter"
      subtitle="Convert length, mass, temperature, and speed measurements between international metric and imperial standards."
      icon={Scale}
      badge="Multi-Dimension"
    >
      <div className="space-y-5">
        <CalcToggle
          value={dimension}
          options={[
            { value: "length", label: "Length" },
            { value: "weight", label: "Weight" },
            { value: "temperature", label: "Temperature" },
            { value: "speed", label: "Speed" },
          ]}
          onChange={(v) => handleDimensionChange(v as Dimension)}
        />

        {/* 1-Tap Popular Conversion Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mr-1">Popular:</span>
          {POPULAR_CONVERSIONS.map((item) => {
            const isActive = dimension === item.dim && fromUnit === item.from && toUnit === item.to;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setDimension(item.dim);
                  setFromUnit(item.from);
                  setToUnit(item.to);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2 space-y-1.5">
            <CalcInput
              id="unit-val"
              label="Value to Convert"
              value={inputValue}
              onChange={(v) => setInputValue(Number(v) || 0)}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_VALUES.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setInputValue(val)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border ${
                    inputValue === val
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-1">
            <CalcSelect
              id="from-unit"
              label="From Unit"
              value={fromUnit}
              options={dimConfig.units}
              onChange={setFromUnit}
            />
          </div>

          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap Units"
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-1">
            <CalcSelect
              id="to-unit"
              label="To Unit"
              value={toUnit}
              options={dimConfig.units}
              onChange={setToUnit}
            />
          </div>
        </div>

        <CalcResult
          title="Unit Conversion Result"
          primaryLabel={`${inputValue} ${fromLabel} =`}
          primaryValue={`${convertedValue.toLocaleString()} ${toLabel}`}
          copyValue={`${inputValue} ${fromUnit} = ${convertedValue.toLocaleString()} ${toUnit}`}
          items={[
            { label: "Source Measurement", value: `${inputValue} ${fromUnit}` },
            { label: "Target Measurement", value: `${convertedValue.toLocaleString()} ${toUnit}`, highlight: true },
          ]}
        />
      </div>
    </CalcCard>
  );
}
