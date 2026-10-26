"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TrendingUp, Table as TableIcon, Briefcase, ShieldCheck, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcToggle,
  CalcResult,
  CalcChart,
  CalcExportButton,
  CalcPromptButton,
  CalcSaveButton,
  CalcShareButton,
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
  const [calcMode, setCalcMode] = useState<"erosion" | "salary">(() => {
    if (initialValues?.mode) return initialValues.mode;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("mode");
      if (q === "erosion" || q === "salary") return q;
    }
    return "erosion";
  });

  const [amount, setAmount] = useState<number>(() => {
    if (initialValues?.amount !== undefined) return Number(initialValues.amount);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("amount");
      if (q) return Number(q);
    }
    return 10000;
  });

  const [inflationRate, setInflationRate] = useState<number>(() => {
    if (initialValues?.inflationRate !== undefined) return Number(initialValues.inflationRate);
    if (typeof window !== "undefined") {
      const q =
        new URLSearchParams(window.location.search).get("inflationRate") ||
        new URLSearchParams(window.location.search).get("rate");
      if (q) return Number(q);
    }
    return 3.2;
  });

  const [years, setYears] = useState<number>(() => {
    if (initialValues?.years !== undefined) return Number(initialValues.years);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("years");
      if (q) return Number(q);
    }
    return 15;
  });

  const isSalaryMode = calcMode === "salary";

  // Real-time URL query permalink synchronization (Habit Loop & Repeat Usage Engine)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("amount", amount.toString());
    params.set("inflationRate", inflationRate.toString());
    params.set("years", years.toString());
    params.set("mode", calcMode);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [amount, inflationRate, years, calcMode]);

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
      [isSalaryMode ? "Target Salary to Match Living Standard ($)" : "Future Needed to Match Value ($)"]:
        row.futureNeeded,
      [isSalaryMode ? "Real Purchasing Power If Stagnant ($)" : "Remaining Purchasing Power ($)"]:
        row.purchasingPower,
    }));
  }, [inflation.yearlyProjection, isSalaryMode]);

  // Formulaic Excel (.xlsx) Export with SheetJS Retention Hook
  const handleExportFormulaicExcel = () => {
    try {
      const summaryRows = [
        ["ConvertSheet - Inflation & Purchasing Power Schedule", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", `https://www.convertsheet.com/tools/inflation-calculator?amount=${amount}&inflationRate=${inflationRate}&years=${years}&mode=${calcMode}`],
        ["Data Sovereignty", "Calculated 100% in-browser on ConvertSheet with zero cloud tracking."],
        ["", ""],
        ["--- CALCULATION PARAMETERS ---", ""],
        [isSalaryMode ? "Current Annual Salary ($)" : "Starting Capital / Price ($)", amount],
        ["Expected Annual Inflation Rate (%)", inflationRate],
        ["Time Horizon (Years)", years],
        ["", ""],
        ["--- SUMMARY OUTCOMES & FORMULAS ---", ""],
        [
          isSalaryMode ? "Target Salary Needed ($)" : "Future Equivalent Needed ($)",
          inflation.futureEquivalentValue,
        ],
        [
          isSalaryMode ? "Real Value If Stagnant ($)" : "Purchasing Power of Today's $",
          inflation.futurePurchasingPower,
        ],
        ["Cumulative Price Drift (%)", `${inflation.cumulativeInflationPercent}%`],
        ["", ""],
        ["Mathematical Model", isSalaryMode ? "Salary Needed = Base * (1 + Rate/100)^Years" : "Future Value = Amount * (1 + Rate/100)^Years | Purchasing Power = Amount / (1 + Rate/100)^Years"],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      // Active transparent Excel cell formulas with canonical recalculation links
      wsSummary["B11"] = { t: "n", f: "B7*(1+B8/100)^B9", v: inflation.futureEquivalentValue };
      wsSummary["B12"] = { t: "n", f: "B7/(1+B8/100)^B9", v: inflation.futurePurchasingPower };
      wsSummary["B13"] = { t: "n", f: "(B11-B7)/B7*100", v: inflation.cumulativeInflationPercent };

      const scheduleHeader = [
        "Year",
        isSalaryMode ? "Target Salary Needed ($)" : "Future Cost Needed ($)",
        isSalaryMode ? "Flat Salary Real Value ($)" : "Purchasing Power of Today ($)",
        "Cumulative Price Drift (%)",
        "ConvertSheet Recalculation Link",
      ];
      const scheduleRows = inflation.yearlyProjection.map((r) => [
        r.year,
        r.futureNeeded,
        r.purchasingPower,
        Number((((r.futureNeeded - amount) / (amount || 1)) * 100).toFixed(1)),
        `https://www.convertsheet.com/tools/inflation-calculator?amount=${amount}&inflationRate=${inflationRate}&years=${r.year}&mode=${calcMode}`,
      ]);
      const wsSchedule = XLSX.utils.aoa_to_sheet([scheduleHeader, ...scheduleRows]);

      // Linked dynamic schedule formulas
      inflation.yearlyProjection.forEach((r, idx) => {
        const rowNum = idx + 2;
        wsSchedule[`B${rowNum}`] = { t: "n", f: `InflationSummary!$B$7*(1+InflationSummary!$B$8/100)^A${rowNum}`, v: r.futureNeeded };
        wsSchedule[`C${rowNum}`] = { t: "n", f: `InflationSummary!$B$7/(1+InflationSummary!$B$8/100)^A${rowNum}`, v: r.purchasingPower };
        wsSchedule[`D${rowNum}`] = { t: "n", f: `(B${rowNum}-InflationSummary!$B$7)/InflationSummary!$B$7*100`, v: Number((((r.futureNeeded - amount) / (amount || 1)) * 100).toFixed(1)) };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSummary, "InflationSummary");
      XLSX.utils.book_append_sheet(wb, wsSchedule, "YearlyProjection");
      XLSX.writeFile(
        wb,
        `ConvertSheet_Inflation_${amount}_${inflationRate}pct_${years}yrs.xlsx`
      );
    } catch (err) {
      console.error("Excel export failed:", err);
    }
  };

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
    <div className="space-y-8 pb-28 sm:pb-0">
      {/* Zero-Knowledge Privacy Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side • Zero Server Storage • Private & Free Forever</span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="font-medium">
          Updated for October 2026: BLS CPI Benchmark 3.0% (Core 3.3%) • Fed Target 2.0% • 10Y Breakeven 2.35% (October 26, 2026)
        </span>
      </div>

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
            <div className="space-y-1.5">
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
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(isSalaryMode
                  ? [50000, 75000, 100000, 125000, 150000, 200000]
                  : [1000, 5000, 10000, 25000, 50000, 100000]
                ).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`min-h-[44px] min-w-[44px] px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer border touch-manipulation ${
                      amount === amt
                        ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                    }`}
                  >
                    ${amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <CalcSlider
                  id="initial-amount-slider"
                  label={isSalaryMode ? "Salary Slider ($30k – $250k)" : "Amount Slider ($1k – $100k)"}
                  value={Math.min(isSalaryMode ? 250000 : 100000, Math.max(isSalaryMode ? 30000 : 1000, amount))}
                  onChange={setAmount}
                  min={isSalaryMode ? 30000 : 1000}
                  max={isSalaryMode ? 250000 : 100000}
                  step={isSalaryMode ? 2500 : 500}
                  unit="$"
                  ariaLabel="Initial Amount Slider"
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
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
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1, 3, 5, 10, 15, 20, 30].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setYears(yr)}
                    className={`min-h-[44px] min-w-[44px] px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer border touch-manipulation ${
                      years === yr
                        ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                    }`}
                  >
                    {yr}y
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick presets for inflation rate with 44px touch targets */}
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
                  className={`min-h-[44px] text-xs px-3.5 py-2 rounded-xl border font-medium transition-colors touch-manipulation ${
                    inflationRate === preset.rate
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold"
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
            ariaLabel="Time Horizon Slider"
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
              copyValue={`Salary Needed: $${inflation.futureEquivalentValue.toLocaleString()} in ${years} yrs (Current: $${amount.toLocaleString()} at ${inflationRate}% inflation, +${inflation.cumulativeInflationPercent}% total)`}
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
              copyValue={`Future Needed: $${inflation.futureEquivalentValue.toLocaleString()} in ${years} yrs (Today: $${amount.toLocaleString()} at ${inflationRate}% inflation | Future Value of Today's Capital: $${inflation.futurePurchasingPower.toLocaleString()})`}
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

          {/* Retention & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <CalcSaveButton
              toolSlug="inflation-calculator"
              toolName="Inflation & Purchasing Power Calculator"
              summaryTitle={`$${amount.toLocaleString()} over ${years}y @ ${inflationRate}%`}
              summaryMetrics={[
                {
                  label: isSalaryMode ? "Salary Needed" : "Future Cost Needed",
                  value: `$${inflation.futureEquivalentValue.toLocaleString()}`,
                },
                {
                  label: "Purchasing Power",
                  value: `$${inflation.futurePurchasingPower.toLocaleString()}`,
                },
                {
                  label: "Cumulative Drift",
                  value: `+${inflation.cumulativeInflationPercent}%`,
                },
              ]}
            />

            <CalcShareButton
              state={{
                amount,
                inflationRate,
                years,
                mode: calcMode,
              }}
              label="Share Plan"
            />

            <button
              type="button"
              onClick={handleExportFormulaicExcel}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xs transition-colors cursor-pointer touch-manipulation"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Formulaic Excel (.xlsx)</span>
            </button>

            <CalcPromptButton
              prompt={aiPrompt}
              label={isSalaryMode ? "Copy AI Salary Prompt" : "Copy AI Inflation Prompt"}
            />
          </div>

          {/* Visual Chart: Future Cost Needed vs Purchasing Power */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {isSalaryMode
                ? `Required Salary vs. Flat Wage Purchasing Power (${years} Years)`
                : `Cost Escalation vs. Purchasing Power Erosion (${years} Years)`}
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

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between text-white">
        <div className="min-w-0 pr-3">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block truncate">
            {isSalaryMode ? `Salary in ${years} Yrs` : `Future Cost (${years} Yrs)`}
          </span>
          <span className="text-base font-extrabold text-emerald-400 font-mono">
            ${inflation.futureEquivalentValue.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CalcSaveButton
            toolSlug="inflation-calculator"
            toolName="Inflation Calculator"
            summaryTitle={`$${amount.toLocaleString()} (${years}y @ ${inflationRate}%)`}
            summaryMetrics={[
              {
                label: isSalaryMode ? "Salary Needed" : "Future Cost",
                value: `$${inflation.futureEquivalentValue.toLocaleString()}`,
              },
              {
                label: "Purchasing Power",
                value: `$${inflation.futurePurchasingPower.toLocaleString()}`,
              },
            ]}
            label="Save"
          />
          <CalcShareButton
            state={{ amount, inflationRate, years, mode: calcMode }}
            label="Share"
          />
        </div>
      </div>
    </div>
  );
}
