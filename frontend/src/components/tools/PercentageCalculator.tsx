"use client";

import React, { useState, useMemo } from "react";
import { Percent } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcResult,
} from "@/components/calculator";

export function PercentageCalculator() {
  const [calcMode, setCalcMode] = useState<"whatIs" | "isWhatPercent" | "change">("whatIs");

  // Mode 1: What is X% of Y?
  const [valX1, setValX1] = useState<number>(15);
  const [valY1, setValY1] = useState<number>(200);

  // Mode 2: X is what % of Y?
  const [valX2, setValX2] = useState<number>(30);
  const [valY2, setValY2] = useState<number>(150);

  // Mode 3: Percentage increase/decrease from X to Y
  const [valX3, setValX3] = useState<number>(100);
  const [valY3, setValY3] = useState<number>(125);

  const result1 = useMemo(() => {
    const res = (valX1 / 100) * valY1;
    return {
      value: res.toLocaleString(),
      formula: `${valX1}% × ${valY1} = ${res}`,
    };
  }, [valX1, valY1]);

  const result2 = useMemo(() => {
    if (valY2 === 0) return { value: "Undefined (div by 0)", formula: "" };
    const res = (valX2 / valY2) * 100;
    return {
      value: `${res.toFixed(2)}%`,
      formula: `(${valX2} / ${valY2}) × 100 = ${res.toFixed(2)}%`,
    };
  }, [valX2, valY2]);

  const result3 = useMemo(() => {
    if (valX3 === 0) return { value: "Undefined (initial value is 0)", formula: "", type: "neutral" };
    const diff = valY3 - valX3;
    const pct = (diff / valX3) * 100;
    const isIncrease = diff >= 0;
    return {
      value: `${isIncrease ? "+" : ""}${pct.toFixed(2)}%`,
      formula: `((${valY3} - ${valX3}) / ${valX3}) × 100 = ${pct.toFixed(2)}%`,
      type: isIncrease ? "increase" : "decrease",
      diff: diff.toLocaleString(),
    };
  }, [valX3, valY3]);

  return (
    <CalcCard
      title="Percentage Calculator"
      subtitle="Solve all percentage problems: find a percent of a number, find the percentage ratio, or calculate percentage growth/decline."
      icon={Percent}
      badge="3-in-1 Math Tool"
    >
      <CalcToggle
        value={calcMode}
        options={[
          { value: "whatIs", label: "What is X% of Y?" },
          { value: "isWhatPercent", label: "X is what % of Y?" },
          { value: "change", label: "% Increase / Decrease" },
        ]}
        onChange={(val) => setCalcMode(val as any)}
      />

      {calcMode === "whatIs" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalcInput
              id="val-x1"
              label="Percentage (X)"
              value={valX1}
              suffix="%"
              onChange={(v) => setValX1(Number(v) || 0)}
            />
            <CalcInput
              id="val-y1"
              label="Total Number (Y)"
              value={valY1}
              onChange={(v) => setValY1(Number(v) || 0)}
            />
          </div>

          <CalcResult
            title="Percentage Output"
            primaryLabel={`What is ${valX1}% of ${valY1}?`}
            primaryValue={result1.value}
            items={[
              { label: "Mathematical Formula", value: result1.formula },
              { label: "Decimal Equivalent", value: (valX1 / 100).toString() },
            ]}
          />
        </div>
      )}

      {calcMode === "isWhatPercent" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalcInput
              id="val-x2"
              label="Part Number (X)"
              value={valX2}
              onChange={(v) => setValX2(Number(v) || 0)}
            />
            <CalcInput
              id="val-y2"
              label="Whole Number (Y)"
              value={valY2}
              onChange={(v) => setValY2(Number(v) || 0)}
            />
          </div>

          <CalcResult
            title="Percentage Ratio"
            primaryLabel={`${valX2} is what percent of ${valY2}?`}
            primaryValue={result2.value}
            items={[
              { label: "Mathematical Formula", value: result2.formula },
              { label: "Fraction Representation", value: `${valX2}/${valY2}` },
            ]}
          />
        </div>
      )}

      {calcMode === "change" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalcInput
              id="val-x3"
              label="Initial Value (From)"
              value={valX3}
              onChange={(v) => setValX3(Number(v) || 0)}
            />
            <CalcInput
              id="val-y3"
              label="Final Value (To)"
              value={valY3}
              onChange={(v) => setValY3(Number(v) || 0)}
            />
          </div>

          <CalcResult
            title="Relative Change"
            primaryLabel={`Percentage change from ${valX3} to ${valY3}`}
            primaryValue={result3.value}
            items={[
              { label: "Absolute Difference", value: result3.diff || "0" },
              { label: "Trend Direction", value: result3.type === "increase" ? "Growth (Increase)" : "Decline (Decrease)", highlight: true },
            ]}
          />
        </div>
      )}
    </CalcCard>
  );
}
