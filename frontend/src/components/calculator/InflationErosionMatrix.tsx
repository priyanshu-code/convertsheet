"use client";

import React, { useState } from "react";
import { Download, TrendingDown, ShieldAlert, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";

export interface InflationErosionMatrixProps {
  initialAmount?: number;
  className?: string;
}

const PRESET_AMOUNTS = [25000, 50000, 100000, 250000, 500000, 1000000];
const TIME_HORIZONS = [5, 10, 15, 20, 25, 30];
const INFLATION_TIERS = [
  { rate: 0.02, label: "2.0% (Fed Target)", desc: "Ideal central bank target" },
  { rate: 0.03, label: "3.0% (Historical Avg)", desc: "US long-term inflation average" },
  { rate: 0.04, label: "4.0% (Elevated)", desc: "Moderate inflationary pressure" },
  { rate: 0.05, label: "5.0% (High Inflation)", desc: "High cost-of-living regime" },
];

export function InflationErosionMatrix({
  initialAmount = 100000,
  className = "",
}: InflationErosionMatrixProps) {
  const [amount, setAmount] = useState<number>(initialAmount);

  const calculateRealValue = (principal: number, rate: number, years: number) => {
    return principal / Math.pow(1 + rate, years);
  };

  const calculateFutureCost = (principal: number, rate: number, years: number) => {
    return principal * Math.pow(1 + rate, years);
  };

  const handleExportXlsx = () => {
    try {
      const rows: Record<string, string | number>[] = [];

      TIME_HORIZONS.forEach((years) => {
        INFLATION_TIERS.forEach((tier) => {
          const realValue = calculateRealValue(amount, tier.rate, years);
          const futureCost = calculateFutureCost(amount, tier.rate, years);
          const percentLoss = ((amount - realValue) / amount) * 100;

          rows.push({
            "Starting Cash": amount,
            "Horizon (Years)": `${years} Years`,
            "Inflation Rate": tier.label,
            "Real Purchasing Power": Math.round(realValue),
            "Loss of Value ($)": Math.round(amount - realValue),
            "Purchasing Power Lost (%)": `${percentLoss.toFixed(1)}%`,
            "Future Dollars Needed": Math.round(futureCost),
          });
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "InflationErosionMatrix");
      XLSX.writeFile(workbook, `inflation-purchasing-power-matrix-${amount}.xlsx`);
    } catch (err) {
      console.error("Failed to export inflation matrix:", err);
    }
  };

  // Benchmark stats for the 20-year horizon at 3%
  const benchmarkRealValue = calculateRealValue(amount, 0.03, 20);
  const benchmarkFutureCost = calculateFutureCost(amount, 0.03, 20);
  const benchmarkLossPercent = ((amount - benchmarkRealValue) / amount) * 100;

  return (
    <div
      className={`my-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Purchasing Power Erosion Matrix</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            What Will ${amount.toLocaleString()} Be Worth in 5 to 30 Years?
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Compare how uninvested cash loses value across central bank inflation scenarios.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportXlsx}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm transition-all shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Matrix (.xlsx)</span>
        </button>
      </div>

      {/* Quick Amount Selector */}
      <div className="py-4 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
          Quick Amount:
        </span>
        {PRESET_AMOUNTS.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setAmount(val)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
              amount === val
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            ${val.toLocaleString()}
          </button>
        ))}
      </div>

      {/* High-Impact Direct Answer Box (AEO & Featured Snippet Optimization) */}
      <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 my-3 text-xs leading-relaxed text-rose-900 dark:text-rose-200 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">20-Year Reality Check (3% Historical Inflation):</strong> In 20
          years, <strong>${amount.toLocaleString()}</strong> will only buy what{" "}
          <strong>${Math.round(benchmarkRealValue).toLocaleString()}</strong> buys today—a devastating{" "}
          <strong>{benchmarkLossPercent.toFixed(1)}% loss</strong> in real living standard. To maintain the
          exact same purchasing power in 20 years, you will need{" "}
          <strong>${Math.round(benchmarkFutureCost).toLocaleString()}</strong>.
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/60 text-zinc-600 dark:text-zinc-300 font-semibold">
              <th className="py-2.5 px-3">Horizon</th>
              {INFLATION_TIERS.map((tier) => (
                <th key={tier.rate} className="py-2.5 px-3">
                  <div>{tier.label}</div>
                  <div className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
                    {tier.desc}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {TIME_HORIZONS.map((years) => (
              <tr
                key={years}
                className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  {years} Years
                </td>
                {INFLATION_TIERS.map((tier) => {
                  const realValue = calculateRealValue(amount, tier.rate, years);
                  const futureCost = calculateFutureCost(amount, tier.rate, years);
                  const percentLoss = ((amount - realValue) / amount) * 100;

                  return (
                    <td key={tier.rate} className="py-3 px-3">
                      <div className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                        ${Math.round(realValue).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                        -{percentLoss.toFixed(0)}% (${Math.round(amount - realValue).toLocaleString()} lost)
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        Target: ${Math.round(futureCost).toLocaleString()}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer takeaway */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Formula: Real Value = Cash / (1 + r)^t • Target = Cash × (1 + r)^t</span>
        </span>
        <span className="hidden sm:inline font-mono">100% Client-Side In-Browser Calculation</span>
      </div>
    </div>
  );
}
