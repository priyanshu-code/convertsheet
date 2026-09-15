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

  const bmiData = useMemo(() => {
    let bmi = 0;
    if (unitSystem === "metric") {
      const hM = heightCm / 100;
      if (hM > 0 && weightKg > 0) {
        bmi = weightKg / (hM * hM);
      }
    } else {
      const totalInches = heightFeet * 12 + heightInches;
      if (totalInches > 0 && weightLbs > 0) {
        bmi = (703 * weightLbs) / (totalInches * totalInches);
      }
    }

    if (bmi <= 0) return null;

    let category = "Normal weight";
    let badge = "Healthy";
    let color = "text-emerald-600";

    if (bmi < 18.5) {
      category = "Underweight";
      badge = "Under";
      color = "text-amber-500";
    } else if (bmi < 25) {
      category = "Normal (Healthy) weight";
      badge = "Optimal";
      color = "text-emerald-600";
    } else if (bmi < 30) {
      category = "Overweight";
      badge = "Moderate Risk";
      color = "text-amber-600";
    } else {
      category = "Obesity Range";
      badge = "High Risk";
      color = "text-red-500";
    }

    return {
      score: bmi.toFixed(1),
      category,
      badge,
      color,
      primeRange: "18.5 – 24.9 BMI",
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
        onChange={(v) => setUnitSystem(v as any)}
      />

      {unitSystem === "metric" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CalcInput
            id="weight-kg"
            label="Body Weight"
            value={weightKg}
            min={10}
            max={300}
            suffix="kg"
            onChange={(v) => setWeightKg(Number(v) || 0)}
          />
          <CalcInput
            id="height-cm"
            label="Height"
            value={heightCm}
            min={50}
            max={250}
            suffix="cm"
            onChange={(v) => setHeightCm(Number(v) || 0)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalcInput
            id="weight-lbs"
            label="Body Weight"
            value={weightLbs}
            min={20}
            max={600}
            suffix="lbs"
            onChange={(v) => setWeightLbs(Number(v) || 0)}
          />
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
      )}

      {bmiData && (
        <CalcResult
          title="Your BMI Score & Classification"
          primaryLabel="Calculated BMI"
          primaryValue={bmiData.score}
          primarySubtext={`WHO Health Classification: ${bmiData.category}`}
          copyValue={`${bmiData.score} BMI (${bmiData.category})`}
          items={[
            {
              label: "Health Category",
              value: bmiData.category,
              badge: bmiData.badge,
              highlight: true,
            },
            {
              label: "Healthy BMI Range",
              value: bmiData.primeRange,
            },
          ]}
        />
      )}
    </CalcCard>
  );
}
