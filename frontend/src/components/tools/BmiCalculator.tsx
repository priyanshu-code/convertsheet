"use client";

import React, { useState, useMemo } from "react";
import { Activity } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcResult,
} from "@/components/calculator";

export function BmiCalculator() {
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Metric: kg & cm
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);

  // Imperial: lbs & inches
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);

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

    if (unitSystem === "metric") {
      const hM = heightCm / 100;
      heightInMeters = hM;
      if (hM > 0 && weightKg > 0) {
        bmi = weightKg / (hM * hM);
      }
    } else {
      const totalInches = heightFeet * 12 + heightInches;
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
    } else {
      category = "Obesity Range";
      badge = "High Risk";
      colorClass = "text-red-600 dark:text-red-400";
      bgBadge = "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300";
    }

    // Healthy weight range (BMI 18.5 to 24.9)
    let minHealthyWeight = 0;
    let maxHealthyWeight = 0;
    let healthyWeightText = "";
    if (heightInMeters > 0) {
      const minKg = 18.5 * (heightInMeters * heightInMeters);
      const maxKg = 24.9 * (heightInMeters * heightInMeters);
      minHealthyWeight = minKg;
      maxHealthyWeight = maxKg;

      if (unitSystem === "metric") {
        healthyWeightText = `${minKg.toFixed(1)} kg – ${maxKg.toFixed(1)} kg`;
      } else {
        const minLbs = Math.round(minKg * 2.20462);
        const maxLbs = Math.round(maxKg * 2.20462);
        healthyWeightText = `${minLbs} lbs – ${maxLbs} lbs`;
      }
    }

    // Gauge position percentage (map BMI 15-35 to 0-100%)
    const gaugePercent = Math.max(0, Math.min(100, ((bmi - 15) / (35 - 15)) * 100));

    const copySummary = `BMI: ${bmi.toFixed(1)} (${category}) | Healthy Weight Range: ${healthyWeightText}`;

    return {
      score: bmi.toFixed(1),
      category,
      badge,
      colorClass,
      bgBadge,
      primeRange: "18.5 – 24.9 BMI",
      healthyWeightText,
      gaugePercent,
      copySummary,
    };
  }, [unitSystem, weightKg, heightCm, weightLbs, heightFeet, heightInches]);

  return (
    <CalcCard
      title="Body Mass Index (BMI) Calculator"
      subtitle="Calculate your Body Mass Index (BMI) with metric or imperial measurements and official WHO health categories."
      icon={Activity}
      badge="WHO Standard"
    >
      <CalcToggle
        value={unitSystem}
        options={[
          { value: "metric", label: "Metric Units (kg / cm)" },
          { value: "imperial", label: "Imperial Units (lbs / ft / in)" },
        ]}
        onChange={(v) => handleUnitChange(v as any)}
      />

      {unitSystem === "metric" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <CalcInput
                id="weight-kg"
                label="Body Weight"
                value={weightKg}
                min={10}
                max={300}
                suffix="kg"
                onChange={(v) => setWeightKg(Number(v) || 0)}
              />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Quick adjust:</span>
                {[-5, -1, 1, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => adjustWeight(d)}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  >
                    {d > 0 ? `+${d}` : d} kg
                  </button>
                ))}
              </div>
            </div>
            <div>
              <CalcInput
                id="height-cm"
                label="Height"
                value={heightCm}
                min={50}
                max={250}
                suffix="cm"
                onChange={(v) => setHeightCm(Number(v) || 0)}
              />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Preset height:</span>
                {[160, 170, 175, 180, 185].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHeightCm(h)}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded border ${
                      heightCm === h
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {h} cm
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <CalcInput
                id="weight-lbs"
                label="Body Weight"
                value={weightLbs}
                min={20}
                max={600}
                suffix="lbs"
                onChange={(v) => setWeightLbs(Number(v) || 0)}
              />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Adjust:</span>
                {[-10, -2, 2, 10].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => adjustWeight(d)}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  >
                    {d > 0 ? `+${d}` : d} lbs
                  </button>
                ))}
              </div>
            </div>
            <CalcInput
              id="height-ft"
              label="Height (Feet)"
              value={heightFeet}
              min={1}
              max={8}
              suffix="ft"
              onChange={(v) => setHeightFeet(Number(v) || 0)}
            />
            <CalcInput
              id="height-in"
              label="Height (Inches)"
              value={heightInches}
              min={0}
              max={11}
              suffix="in"
              onChange={(v) => setHeightInches(Number(v) || 0)}
            />
          </div>
        </div>
      )}

      {bmiData && (
        <div className="space-y-6">
          {/* Visual BMI Gauge */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>BMI Spectrum</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${bmiData.bgBadge}`}>
                {bmiData.category}
              </span>
            </div>
            
            {/* Visual spectrum bar */}
            <div className="relative h-3 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex">
              <div className="bg-amber-400 h-full" style={{ width: "17.5%" }} title="Underweight (<18.5)" />
              <div className="bg-emerald-500 h-full" style={{ width: "32%" }} title="Normal (18.5-24.9)" />
              <div className="bg-orange-500 h-full" style={{ width: "25.5%" }} title="Overweight (25-29.9)" />
              <div className="bg-red-500 h-full" style={{ width: "25%" }} title="Obese (30+)" />
            </div>

            {/* Scale numbers */}
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-300 font-mono px-0.5">
              <span>15 (Under)</span>
              <span>18.5 (Normal)</span>
              <span>25 (Over)</span>
              <span>30+ (Obese)</span>
            </div>
          </div>

          <CalcResult
            title="Your BMI Score & Classification"
            primaryLabel="Calculated BMI"
            primaryValue={bmiData.score}
            primarySubtext={`WHO Health Classification: ${bmiData.category}`}
            copyValue={bmiData.copySummary}
            items={[
              {
                label: "Health Category",
                value: bmiData.category,
                badge: bmiData.badge,
                highlight: true,
              },
              {
                label: "Healthy Weight for Height",
                value: bmiData.healthyWeightText,
                highlight: true,
              },
              {
                label: "Standard Optimal BMI Range",
                value: bmiData.primeRange,
              },
            ]}
          />
        </div>
      )}
    </CalcCard>
  );
}
