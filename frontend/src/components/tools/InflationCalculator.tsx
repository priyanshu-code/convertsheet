"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, Table as TableIcon, Briefcase } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcToggle,
  CalcResult,
  CalcChart,
  CalcExportButton,
  CalcPromptButton,
} from "@/components/calculator";
import { calculateInflation } from "@/lib/engines/financial-engine";
import { InflationHedgeCard } from "@/components/finance";

export interface InflationCalculatorProps {
  initialValues?: Partial<{
    amount: number;
    inflationRate: number;
    years: number;
    mode?: "erosion" | "salary";
  }>;
}

export function InflationCalculator({ initialValues }: InflationCalculatorProps = {}) {
  const [calcMode, setCalcMode] = useState<"erosion" | "salary">(initialValues?.mode || "erosion");
  const [amount, setAmount] = useState<number>(Number(initialValues?.amount) || 10000);
  const [inflationRate, setInflationRate] = useState<number>(Number(initialValues?.inflationRate) || 3.2);
  const [years, setYears] = useState<number>(Number(initialValues?.years) || 15);

  const isSalaryMode = calcMode === "salary";

  const inflation = useMemo(() => {
    return calculateInflation({
      amount,
      inflationRate,
      years,
    });
  }, [amount, inflationRate, years]);

  // Chart data for visual inflation erosion and future needed curve
  const chartData = useMemo(() => {
    return inflation.yearlyProjection.map((row) => ({
      label: `Yr ${row.year}`,
      [isSalaryMode ? "Salary Needed ($)" : "Future Cost Needed ($)"]: row.futureNeeded,
      [isSalaryMode ? "Flat Salary Real Value ($)" : "Purchasing Power ($)"]: row.purchasingPower,
    }));
  }, [inflation.yearlyProjection, isSalaryMode]);

  // Exportable schedule for SheetJS
  const exportData = useMemo(() => {
    return inflation.yearlyProjection.map((row) => ({
      Year: row.year,
      [isSalaryMode ? "Target Salary to Match Living Standard ($)" : "Future Needed to Match Value ($)"]: row.futureNeeded,
      [isSalaryMode ? "Real Purchasing Power If Stagnant ($)" : "Remaining Purchasing Power ($)"]: row.purchasingPower,
    }));
  }, [inflation.yearlyProjection, isSalaryMode]);

  const aiPrompt = useMemo(() => {
    if (isSalaryMode) {
      return `Analyze this career salary & inflation growth scenario:
- Current Annual Salary: $${amount.toLocaleString()}
- Expected Annual Inflation Rate: ${inflationRate}%
- Time Horizon: ${years} years
- Salary Needed to Maintain Current Purchasing Power: $${inflation.futureEquivalentValue.toLocaleString()}
- Real Value If Salary Remains Flat: $${inflation.futurePurchasingPower.toLocaleString()}
- Total Cost-of-Living Increase Over Period: ${inflation.cumulativeInflationPercent}%

Provide actionable career and compensation strategies to outpace this inflation rate, including annual merit raise benchmarks, promotion timing, skill acquisitions, and tax-advantaged retirement contributions.`;
    }
    return `Analyze this inflation and purchasing power erosion scenario:
- Initial Capital / Starting Price: $${amount.toLocaleString()}
- Expected Annual Inflation Rate: ${inflationRate}%
- Time Horizon: ${years} years
- Future Equivalent Amount Needed: $${inflation.futureEquivalentValue.toLocaleString()}
- Future Purchasing Power of Today's Capital: $${inflation.futurePurchasingPower.toLocaleString()}
- Cumulative Inflation Over Period: ${inflation.cumulativeInflationPercent}%

Provide actionable asset allocation advice to protect wealth against this inflation rate (e.g. TIPS, real estate, equities, commodities, and high-yield instruments) and explain how real return is calculated.`;
  }, [amount, inflationRate, years, inflation, isSalaryMode]);

  const presetRates = [
    { label: "Fed Target (2.0%)", rate: 2.0 },
    { label: "US Historical (3.2%)", rate: 3.2 },
    { label: "Elevated (5.0%)", rate: 5.0 },
    { label: "High Inflation (8.0%)", rate: 8.0 },
  ];

  return (
    <div className="space-y-8">
      <CalcCard
        title={isSalaryMode ? "Salary Needed to Beat Inflation Calculator" : "Inflation & Purchasing Power Calculator"}
        subtitle={
          isSalaryMode
            ? "Calculate how much your salary must increase over time to keep pace with inflation and prevent real wage loss."
            : "Calculate how inflation erodes purchasing power over time, and determine the exact future dollar amount needed to maintain your standard of living."
        }
        icon={isSalaryMode ? Briefcase : TrendingUp}
        badge="SheetJS Export"
      >
        <div className="space-y-6">
          {/* Mode Switcher */}
          <CalcToggle
            label="Calculator Mode"
            value={calcMode}
            options={[
              { value: "erosion", label: "Purchasing Power Loss" },
              { value: "salary", label: "Salary Protection" },
            ]}
            onChange={(val) => setCalcMode(val as "erosion" | "salary")}
          />

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CalcInput
              id="initial-amount"
              label={isSalaryMode ? "Current Annual Salary" : "Initial Amount / Price Today"}
              value={amount}
              onChange={(val) => setAmount(Number(val) || 0)}
              type="number"
              min={1}
              step={isSalaryMode ? 2500 : 500}
              prefix="$"
            />

            <CalcInput
              id="inflation-rate"
              label="Annual Inflation Rate (%)"
              value={inflationRate}
              onChange={(val) => setInflationRate(Number(val) || 0)}
              type="number"
              min={0}
              max={30}
              step={0.1}
              suffix="%"
            />

            <CalcInput
              id="time-horizon"
              label="Time Horizon (Years)"
              value={years}
              onChange={(val) => setYears(Math.max(1, Math.min(60, Number(val) || 1)))}
              type="number"
              min={1}
              max={60}
              step={1}
              suffix="yrs"
            />
          </div>

          {/* Quick presets for inflation rate */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Common Inflation Benchmarks:
            </label>
            <div className="flex flex-wrap gap-2">
              {presetRates.map((preset) => (
                <button
                  key={preset.rate}
                  type="button"
                  onClick={() => setInflationRate(preset.rate)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    inflationRate === preset.rate
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slider for Years */}
          <CalcSlider
            id="time-horizon-slider"
            label="Time Horizon Range"
            value={years}
            onChange={setYears}
            min={1}
            max={50}
            step={1}
            unit=" Years"
          />

          {/* Results Summary */}
          {isSalaryMode ? (
            <CalcResult
              title="Salary Inflation Protection Summary"
              primaryLabel={`Salary Needed in ${years} Years`}
              primaryValue={`$${inflation.futureEquivalentValue.toLocaleString()}`}
              primarySubtext={`To maintain the exact standard of living of a $${amount.toLocaleString()} salary today, your compensation must reach $${inflation.futureEquivalentValue.toLocaleString()} in ${years} years.`}
              items={[
                {
                  label: "Annual Merit Raise Required",
                  value: `${inflationRate}% / yr`,
                  highlight: true,
                },
                {
                  label: "Total Salary Increase",
                  value: `+$${(inflation.futureEquivalentValue - amount).toLocaleString()} (+${inflation.cumulativeInflationPercent}%)`,
                  highlight: true,
                },
                {
                  label: "Real Value If Salary Flat",
                  value: `$${inflation.futurePurchasingPower.toLocaleString()}`,
                },
                {
                  label: "Loss of Purchasing Power",
                  value: `-${(
                    ((amount - inflation.futurePurchasingPower) / (amount || 1)) *
                    100
                  ).toFixed(1)}%`,
                },
              ]}
            />
          ) : (
            <CalcResult
              title="Inflation Impact Summary"
              primaryLabel={`Future Cost Needed in ${years} Years`}
              primaryValue={`$${inflation.futureEquivalentValue.toLocaleString()}`}
              primarySubtext={`You will need $${inflation.futureEquivalentValue.toLocaleString()} to purchase what $${amount.toLocaleString()} buys today at a ${inflationRate}% annual inflation rate.`}
              items={[
                {
                  label: "Future Value of Today's $",
                  value: `$${inflation.futurePurchasingPower.toLocaleString()}`,
                  highlight: true,
                },
                {
                  label: "Purchasing Power Loss",
                  value: `-${(
                    ((amount - inflation.futurePurchasingPower) / (amount || 1)) *
                    100
                  ).toFixed(1)}%`,
                  highlight: true,
                },
                {
                  label: "Cumulative Price Increase",
                  value: `+${inflation.cumulativeInflationPercent}%`,
                },
                {
                  label: "Annual Average Inflation",
                  value: `${inflationRate}%`,
                },
              ]}
            />
          )}

          {/* Action Buttons: SheetJS Export & AI Prompt */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <CalcExportButton
              data={exportData}
              filename={isSalaryMode ? `salary-inflation-protection-${years}-years` : `inflation-analysis-${years}-years`}
              sheetName={isSalaryMode ? "Salary Trajectory" : "Inflation Forecast"}
            />

            <CalcPromptButton
              prompt={aiPrompt}
              label={isSalaryMode ? "Ask AI Salary Negotiation Advice" : "Ask AI Inflation Protection Advice"}
            />
          </div>

          {/* Visual Chart: Future Cost Needed vs Purchasing Power */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {isSalaryMode ? `Required Salary vs. Flat Wage Purchasing Power (${years} Years)` : `Cost Escalation vs. Purchasing Power Erosion (${years} Years)`}
            </h3>
            <CalcChart
              data={chartData}
              xAxisKey="label"
              valuePrefix="$"
              series={[
                {
                  key: isSalaryMode ? "Salary Needed ($)" : "Future Cost Needed ($)",
                  name: isSalaryMode ? "Salary Needed ($)" : "Future Cost Needed ($)",
                  color: "#ef4444",
                },
                {
                  key: isSalaryMode ? "Flat Salary Real Value ($)" : "Purchasing Power ($)",
                  name: isSalaryMode ? "Flat Salary Real Value ($)" : "Purchasing Power ($)",
                  color: "#10b981",
                },
              ]}
              height={280}
            />
          </div>

        {/* Table of intervals */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <TableIcon className="w-4 h-4 text-emerald-500" />
            <span>Year-by-Year Inflation Schedule</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-72">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-700 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Future Equivalent Needed</th>
                  <th className="py-2.5 px-3">Purchasing Power of Today&apos;s Amount</th>
                  <th className="py-2.5 px-3">Cumulative Increase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                {inflation.yearlyProjection.map((row) => {
                  const cumPct = (
                    ((row.futureNeeded - amount) / (amount || 1)) *
                    100
                  ).toFixed(1);
                  return (
                    <tr
                      key={row.year}
                      className={
                        row.year === years
                          ? "bg-emerald-50/70 dark:bg-emerald-950/20 font-bold text-emerald-700 dark:text-emerald-400"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      }
                    >
                      <td className="py-2 px-3">Year {row.year}</td>
                      <td className="py-2 px-3">${row.futureNeeded.toLocaleString()}</td>
                      <td className="py-2 px-3">${row.purchasingPower.toLocaleString()}</td>
                      <td className="py-2 px-3">+{cumPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CalcCard>

    <InflationHedgeCard currentAmount={amount} targetYears={years} />
  </div>
  );
}
