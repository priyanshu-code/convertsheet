"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Activity,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  HeartPulse,
  Scale,
  Minus,
  Plus,
} from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcResult,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import * as XLSX from "xlsx";

export interface BmiCalculatorProps {
  initialValues?: Partial<{
    unitSystem: "metric" | "imperial";
    weightKg: number;
    heightCm: number;
    weightLbs: number;
    heightFeet: number;
    heightInches: number;
  }>;
}

export function BmiCalculator({ initialValues }: BmiCalculatorProps = {}) {
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("unit");
      if (q === "metric" || q === "imperial") return q;
    }
    return initialValues?.unitSystem ?? "metric";
  });

  // Metric: kg & cm
  const [weightKg, setWeightKg] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("weightKg");
      if (q && !isNaN(Number(q))) return Number(q);
    }
    return initialValues?.weightKg ?? 70;
  });

  const [heightCm, setHeightCm] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("heightCm");
      if (q && !isNaN(Number(q))) return Number(q);
    }
    return initialValues?.heightCm ?? 175;
  });

  // Imperial: lbs & inches
  const [weightLbs, setWeightLbs] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("weightLbs");
      if (q && !isNaN(Number(q))) return Number(q);
    }
    return initialValues?.weightLbs ?? 154;
  });

  const [heightFeet, setHeightFeet] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("feet");
      if (q && !isNaN(Number(q))) return Number(q);
    }
    return initialValues?.heightFeet ?? 5;
  });

  const [heightInches, setHeightInches] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("inches");
      if (q && !isNaN(Number(q))) return Number(q);
    }
    return initialValues?.heightInches ?? 9;
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sharable State Permalinks
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("unit", unitSystem);
    if (unitSystem === "metric") {
      params.set("weightKg", weightKg.toString());
      params.set("heightCm", heightCm.toString());
      params.delete("weightLbs");
      params.delete("feet");
      params.delete("inches");
    } else {
      params.set("weightLbs", weightLbs.toString());
      params.set("feet", heightFeet.toString());
      params.set("inches", heightInches.toString());
      params.delete("weightKg");
      params.delete("heightCm");
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [unitSystem, weightKg, heightCm, weightLbs, heightFeet, heightInches]);

  const handleUnitChange = (newUnit: "metric" | "imperial") => {
    if (newUnit === unitSystem) return;

    if (newUnit === "imperial") {
      // Metric -> Imperial
      const lbs = Math.round(weightKg * 2.20462);
      const totalInches = Math.round(heightCm / 2.54);
      const ft = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      setWeightLbs(lbs);
      setHeightFeet(Math.max(1, ft));
      setHeightInches(inches);
    } else {
      // Imperial -> Metric
      const kg = Math.round((weightLbs / 2.20462) * 10) / 10;
      const totalInches = heightFeet * 12 + heightInches;
      const cm = Math.round(totalInches * 2.54);
      setWeightKg(kg);
      setHeightCm(cm);
    }
    setUnitSystem(newUnit);
  };

  const adjustWeight = (delta: number) => {
    if (unitSystem === "metric") {
      setWeightKg((prev) => Math.max(20, Math.min(300, Math.round((prev + delta) * 10) / 10)));
    } else {
      setWeightLbs((prev) => Math.max(40, Math.min(600, prev + delta)));
    }
  };

  const bmiData = useMemo(() => {
    let bmi = 0;
    let heightInMeters = 0;
    let totalInches = 0;

    if (unitSystem === "metric") {
      const hM = heightCm / 100;
      heightInMeters = hM;
      if (hM > 0 && weightKg > 0) {
        bmi = weightKg / (hM * hM);
      }
    } else {
      totalInches = heightFeet * 12 + heightInches;
      heightInMeters = (totalInches * 2.54) / 100;
      if (totalInches > 0 && weightLbs > 0) {
        bmi = (703 * weightLbs) / (totalInches * totalInches);
      }
    }

    if (bmi <= 0 || isNaN(bmi)) return null;

    let category = "Normal weight";
    let badge = "Healthy";
    let colorClass = "text-emerald-600 dark:text-emerald-400";
    let bgBadge = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";

    if (bmi < 18.5) {
      category = "Underweight";
      badge = "Under";
      colorClass = "text-amber-600 dark:text-amber-400";
      bgBadge = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
    } else if (bmi < 25) {
      category = "Normal (Healthy) weight";
      badge = "Optimal";
      colorClass = "text-emerald-600 dark:text-emerald-400";
      bgBadge = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
    } else if (bmi < 30) {
      category = "Overweight";
      badge = "Moderate Risk";
      colorClass = "text-orange-600 dark:text-orange-400";
      bgBadge = "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300";
    } else if (bmi < 35) {
      category = "Obesity Class I";
      badge = "High Risk";
      colorClass = "text-red-600 dark:text-red-400";
      bgBadge = "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300";
    } else if (bmi < 40) {
      category = "Obesity Class II";
      badge = "Very High Risk";
      colorClass = "text-red-700 dark:text-red-400";
      bgBadge = "bg-red-200 text-red-900 dark:bg-red-950/80 dark:text-red-200";
    } else {
      category = "Obesity Class III (Severe)";
      badge = "Extreme Risk";
      colorClass = "text-purple-600 dark:text-purple-400";
      bgBadge = "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300";
    }

    // BMI Prime = BMI / 25
    const bmiPrime = Math.round((bmi / 25) * 100) / 100;

    // Ponderal Index = mass (kg) / [height (m)]^3
    const massKg = unitSystem === "metric" ? weightKg : weightLbs / 2.20462;
    const ponderalIndex = heightInMeters > 0 ? Math.round((massKg / Math.pow(heightInMeters, 3)) * 10) / 10 : 0;

    // Healthy Weight Range: BMI 18.5 to 24.9
    let healthyMin = 0;
    let healthyMax = 0;
    if (heightInMeters > 0) {
      const minKg = 18.5 * heightInMeters * heightInMeters;
      const maxKg = 24.9 * heightInMeters * heightInMeters;

      if (unitSystem === "metric") {
        healthyMin = Math.round(minKg * 10) / 10;
        healthyMax = Math.round(maxKg * 10) / 10;
      } else {
        healthyMin = Math.round(minKg * 2.20462);
        healthyMax = Math.round(maxKg * 2.20462);
      }
    }

    const currentWeight = unitSystem === "metric" ? weightKg : weightLbs;
    const weightUnit = unitSystem === "metric" ? "kg" : "lbs";

    let targetDiffText = "Within healthy target range";
    if (currentWeight < healthyMin) {
      const gain = Math.round((healthyMin - currentWeight) * 10) / 10;
      targetDiffText = `Gain ${gain} ${weightUnit} to reach normal range`;
    } else if (currentWeight > healthyMax) {
      const lose = Math.round((currentWeight - healthyMax) * 10) / 10;
      targetDiffText = `Lose ${lose} ${weightUnit} to reach normal range`;
    }

    return {
      bmi: Math.round(bmi * 10) / 10,
      category,
      badge,
      colorClass,
      bgBadge,
      bmiPrime,
      ponderalIndex,
      healthyRange: `${healthyMin} – ${healthyMax} ${weightUnit}`,
      targetDiffText,
    };
  }, [unitSystem, weightKg, heightCm, weightLbs, heightFeet, heightInches]);

  const handleExportExcel = () => {
    if (!bmiData) return;
    setIsExportingExcel(true);
    try {
      const wb = XLSX.utils.book_new();
      const currentWeight = unitSystem === "metric" ? `${weightKg} kg` : `${weightLbs} lbs`;
      const currentHeight = unitSystem === "metric" ? `${heightCm} cm` : `${heightFeet} ft ${heightInches} in`;

      const exportData = [
        ["ConvertSheet Body Mass Index (BMI) Clinical Schedule"],
        ["Generated:", new Date().toLocaleDateString(), "Guidelines:", "WHO & NIH 2026 Clinical Spectrum"],
        ["Measurement System:", unitSystem.toUpperCase()],
        ["Height:", currentHeight, "Weight:", currentWeight],
        ["Calculated BMI:", bmiData.bmi, "Category:", bmiData.category],
        ["BMI Prime:", bmiData.bmiPrime, "Ponderal Index:", bmiData.ponderalIndex],
        ["Healthy Target Range:", bmiData.healthyRange, "Goal Guidance:", bmiData.targetDiffText],
        ["Canonical Tool:", "https://www.convertsheet.com/tools/bmi-calculator"],
        [],
        ["WHO Classification Category", "BMI Range (kg/m²)", "BMI Prime", "Health Risk Profile"],
        ["Underweight", "< 18.5", "< 0.74", "Nutritional deficiency risk"],
        ["Normal (Healthy) weight", "18.5 – 24.9", "0.74 – 0.99", "Lowest cardiovascular risk"],
        ["Overweight", "25.0 – 29.9", "1.00 – 1.19", "Moderate risk"],
        ["Obesity Class I", "30.0 – 34.9", "1.20 – 1.39", "High risk"],
        ["Obesity Class II", "35.0 – 39.9", "1.40 – 1.59", "Very high risk"],
        ["Obesity Class III", "≥ 40.0", "≥ 1.60", "Extreme / Severe risk"],
      ];

      const ws = XLSX.utils.aoa_to_sheet(exportData);
      ws["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, ws, "BMI Schedule");
      XLSX.writeFile(wb, `ConvertSheet-BMI-Calculation-${bmiData.bmi}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const llmPrompt = bmiData
    ? `Analyze health and body mass screening: BMI of ${bmiData.bmi} (${bmiData.category}) for ${unitSystem === "metric" ? `${weightKg}kg at ${heightCm}cm` : `${weightLbs}lbs at ${heightFeet}'${heightInches}"`}.\n- BMI Prime: ${bmiData.bmiPrime}\n- Ponderal Index: ${bmiData.ponderalIndex}\n- Healthy target weight range: ${bmiData.healthyRange}\nProvide evidence-based nutritional, strength conditioning, and cardiovascular guidelines citing WHO and NIH guidelines.`
    : "";

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      <CalcCard
        title="Body Mass Index (BMI) Calculator"
        subtitle="Calculate your Body Mass Index (BMI), WHO clinical category, healthy weight target range, and BMI prime ratio with metric or imperial units."
        icon={Activity}
        badge="Health & Biometrics"
      >
        {/* 100% Client-Side Privacy Reassurance Badge */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-200">100% Client-Side Privacy:</strong>{" "}
            Your personal height and weight data never leaves your browser memory. Zero tracking, zero health data sharing.
          </span>
        </div>

        {/* 2026 Guidelines Freshness Signal */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <span className="font-medium">
            Updated for 2026 WHO & NIH Guidelines: Metric & Imperial Screening Spectrum, Prime Ratio & Healthy Target Ranges
          </span>
        </div>

        {/* System of Measurement Toggle (44px min touch target) */}
        <CalcToggle
          label="Measurement System"
          value={unitSystem}
          options={[
            { value: "metric", label: "Metric (kg / cm)" },
            { value: "imperial", label: "Imperial (lbs / ft & in)" },
          ]}
          onChange={(v) => handleUnitChange(v as "metric" | "imperial")}
        />

        {unitSystem === "metric" ? (
          <div className="space-y-4">
            {/* Height (cm) Input + Slider Pairing */}
            <div className="space-y-2">
              <CalcInput
                id="height-cm"
                label="Height (Centimeters)"
                value={heightCm}
                min={100}
                max={250}
                step={1}
                onChange={(v) => setHeightCm(Math.max(100, Math.min(250, Number(v) || 100)))}
              />
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Height Slider</span>
                  <span>{heightCm} cm ({Math.floor(heightCm / 30.48)} ft {Math.round((heightCm % 30.48) / 2.54)} in)</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={230}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  aria-label="Height slider in centimeters"
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400 touch-manipulation"
                />
              </div>
            </div>

            {/* Weight (kg) Input + Slider + 44px Increment Buttons Pairing */}
            <div className="space-y-2">
              <CalcInput
                id="weight-kg"
                label="Weight (Kilograms)"
                value={weightKg}
                min={20}
                max={300}
                step={0.5}
                onChange={(v) => setWeightKg(Math.max(20, Math.min(300, Number(v) || 20)))}
              />
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Weight Slider</span>
                  <span>{weightKg} kg ({Math.round(weightKg * 2.20462)} lbs)</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={200}
                  step={0.5}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  aria-label="Weight slider in kilograms"
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400 touch-manipulation"
                />
              </div>

              {/* Quick Weight Adjustments (44px min touch targets) */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[-5, -1, 1, 5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => adjustWeight(delta)}
                    className="min-h-[44px] min-w-[54px] px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors shadow-xs touch-manipulation cursor-pointer flex items-center justify-center gap-1"
                  >
                    {delta > 0 ? <Plus className="w-3 h-3 text-emerald-600" /> : <Minus className="w-3 h-3 text-amber-600" />}
                    <span>{Math.abs(delta)} kg</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Height (Feet & Inches) Input */}
            <div className="grid grid-cols-2 gap-3">
              <CalcInput
                id="height-ft"
                label="Height (Feet)"
                value={heightFeet}
                min={3}
                max={8}
                onChange={(v) => setHeightFeet(Math.max(3, Math.min(8, Number(v) || 3)))}
              />
              <CalcInput
                id="height-in"
                label="Height (Inches)"
                value={heightInches}
                min={0}
                max={11}
                onChange={(v) => setHeightInches(Math.max(0, Math.min(11, Number(v) || 0)))}
              />
            </div>

            {/* Total Height Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Height Slider</span>
                <span>{heightFeet} ft {heightInches} in ({Math.round((heightFeet * 12 + heightInches) * 2.54)} cm)</span>
              </div>
              <input
                type="range"
                min={48}
                max={88}
                value={heightFeet * 12 + heightInches}
                onChange={(e) => {
                  const total = Number(e.target.value);
                  setHeightFeet(Math.floor(total / 12));
                  setHeightInches(total % 12);
                }}
                aria-label="Height slider in inches"
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400 touch-manipulation"
              />
            </div>

            {/* Weight (lbs) Input + Slider + 44px Increment Buttons */}
            <div className="space-y-2">
              <CalcInput
                id="weight-lbs"
                label="Weight (Pounds)"
                value={weightLbs}
                min={50}
                max={600}
                step={1}
                onChange={(v) => setWeightLbs(Math.max(50, Math.min(600, Number(v) || 50)))}
              />
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Weight Slider</span>
                  <span>{weightLbs} lbs ({Math.round((weightLbs / 2.20462) * 10) / 10} kg)</span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={450}
                  step={1}
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Number(e.target.value))}
                  aria-label="Weight slider in pounds"
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400 touch-manipulation"
                />
              </div>

              {/* Quick Weight Adjustments (44px min touch targets) */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[-10, -5, 5, 10].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => adjustWeight(delta)}
                    className="min-h-[44px] min-w-[54px] px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors shadow-xs touch-manipulation cursor-pointer flex items-center justify-center gap-1"
                  >
                    {delta > 0 ? <Plus className="w-3 h-3 text-emerald-600" /> : <Minus className="w-3 h-3 text-amber-600" />}
                    <span>{Math.abs(delta)} lbs</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {bmiData && (
          <>
            {/* Action Buttons: Save, Share, Prompt, Excel Export */}
            <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
              <CalcSaveButton
                calculationType="BMI Calculation"
                inputs={{
                  unitSystem,
                  weight: unitSystem === "metric" ? `${weightKg}kg` : `${weightLbs}lbs`,
                  height: unitSystem === "metric" ? `${heightCm}cm` : `${heightFeet}ft ${heightInches}in`,
                }}
                outputs={{
                  bmi: bmiData.bmi,
                  category: bmiData.category,
                  healthyRange: bmiData.healthyRange,
                }}
              />
              <CalcShareButton
                title="ConvertSheet BMI Calculation"
                text={`My BMI is ${bmiData.bmi} (${bmiData.category}). Healthy target range: ${bmiData.healthyRange}.`}
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

            {/* Results Display */}
            <CalcResult
              title="BMI & Body Composition"
              primaryLabel="Body Mass Index"
              primaryValue={bmiData.bmi.toString()}
              copyValue={`BMI ${bmiData.bmi} - ${bmiData.category}`}
              items={[
                {
                  label: "WHO Weight Classification",
                  value: bmiData.category,
                  badge: bmiData.badge,
                  highlight: true,
                },
                {
                  label: "BMI Prime Ratio (< 1.0 is healthy)",
                  value: bmiData.bmiPrime.toString(),
                  badge: bmiData.bmiPrime < 1.0 ? "Healthy" : "Elevated",
                },
                {
                  label: "Healthy Weight Target Range",
                  value: bmiData.healthyRange,
                },
                {
                  label: "Target Adjustment Goal",
                  value: bmiData.targetDiffText,
                  highlight: bmiData.targetDiffText !== "Within healthy target range",
                },
                {
                  label: "Ponderal Index (kg/m³)",
                  value: `${bmiData.ponderalIndex} kg/m³`,
                },
              ]}
            />
          </>
        )}
      </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      {bmiData && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
              Body Mass Index
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {bmiData.bmi}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${bmiData.bgBadge}`}>
                {bmiData.badge}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate max-w-[170px]">
              {bmiData.category}
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
      )}
    </div>
  );
}
