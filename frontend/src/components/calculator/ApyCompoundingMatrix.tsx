"use client";

import React, { useState } from "react";
import { Download, Landmark, TrendingUp, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";

export interface ApyCompoundingMatrixProps {
  initialDeposit?: number;
  className?: string;
}

const PRESET_DEPOSITS = [10000, 25000, 50000, 100000, 250000];
const APY_RATES = [
  { apy: 0.035, label: "3.5% APY", desc: "Conservative Savings / MMF" },
  { apy: 0.04, label: "4.0% APY", desc: "Top National Bank Rate" },
  { apy: 0.045, label: "4.5% APY", desc: "Competitive High-Yield (HYSA)" },
  { apy: 0.05, label: "5.0% APY", desc: "Top Tier Online Bank / CD" },
  { apy: 0.055, label: "5.5% APY", desc: "Peak Promotional / Treasury Bill" },
];

const PERIODS = [
  { label: "1 Month", years: 1 / 12 },
  { label: "3 Months", years: 3 / 12 },
  { label: "6 Months", years: 6 / 12 },
  { label: "1 Year", years: 1 },
  { label: "2 Years", years: 2 },
  { label: "3 Years", years: 3 },
  { label: "5 Years", years: 5 },
];

export function ApyCompoundingMatrix({
  initialDeposit = 50000,
  className = "",
}: ApyCompoundingMatrixProps) {
  const [deposit, setDeposit] = useState<number>(initialDeposit);

  // Daily compounding: A = P * (1 + r/365)^(365 * t)
  const calculateCompoundBalance = (p: number, apy: number, years: number) => {
    return p * Math.pow(1 + apy / 365, 365 * years);
  };

  const handleExportXlsx = () => {
    try {
      const rows: Record<string, string | number>[] = [];

      PERIODS.forEach((period) => {
        APY_RATES.forEach((rateTier) => {
          const endBalance = calculateCompoundBalance(deposit, rateTier.apy, period.years);
          const interestEarned = endBalance - deposit;

          rows.push({
            "Initial Deposit ($)": deposit,
            "Duration": period.label,
            "APY Rate": rateTier.label,
            "Interest Earned ($)": Math.round(interestEarned),
            "Ending Balance ($)": Math.round(endBalance),
            "Compounding Frequency": "Daily (365x)",
          });
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "APYCompoundingMatrix");
      XLSX.writeFile(workbook, `high-yield-apy-matrix-${deposit}.xlsx`);
    } catch (err) {
      console.error("Failed to export APY matrix:", err);
    }
  };

  // 1-year earnings at 4.5%
  const oneYearInterest = calculateCompoundBalance(deposit, 0.045, 1) - deposit;
  const fiveYearInterest = calculateCompoundBalance(deposit, 0.045, 5) - deposit;

  return (
    <div
      className={`my-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1.5">
            <Landmark className="w-3.5 h-3.5" />
            <span>High-Yield Savings &amp; CD Matrix</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            How Much Interest Does ${deposit.toLocaleString()} Earn at 3.5% to 5.5% APY?
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Instant compounding breakdown across daily compounding high-yield savings accounts and fixed certificates of deposit.
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

      {/* Quick Deposit Selector */}
      <div className="py-4 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
          Deposit Balance:
        </span>
        {PRESET_DEPOSITS.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setDeposit(val)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
              deposit === val
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            ${val.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Direct Answer Box (AEO & Featured Snippet) */}
      <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 my-3 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Direct Earnings Answer (4.5% APY Benchmark):</strong> Depositing{" "}
          <strong>${deposit.toLocaleString()}</strong> in a 4.5% APY high-yield savings account earns{" "}
          <strong>${Math.round(oneYearInterest).toLocaleString()}</strong> in total interest after 1 year (
          <strong>${Math.round(oneYearInterest / 12).toLocaleString()}/month</strong>). Over 5 years with
          daily compounding, you will earn{" "}
          <strong>${Math.round(fiveYearInterest).toLocaleString()}</strong> in risk-free interest, growing
          your balance to <strong>${Math.round(deposit + fiveYearInterest).toLocaleString()}</strong>.
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/60 text-zinc-600 dark:text-zinc-300 font-semibold">
              <th className="py-2.5 px-3">Duration</th>
              {APY_RATES.map((tier) => (
                <th key={tier.apy} className="py-2.5 px-3">
                  <div>{tier.label}</div>
                  <div className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
                    {tier.desc}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {PERIODS.map((period) => (
              <tr
                key={period.label}
                className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  {period.label}
                </td>
                {APY_RATES.map((tier) => {
                  const endBalance = calculateCompoundBalance(deposit, tier.apy, period.years);
                  const interestEarned = endBalance - deposit;

                  return (
                    <td key={tier.apy} className="py-3 px-3">
                      <div className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                        +${Math.round(interestEarned).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        Balance: ${Math.round(endBalance).toLocaleString()}
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
          <span>Daily compounding model: A = P × (1 + r/365)^(365 × t)</span>
        </span>
        <span className="hidden sm:inline font-mono">Export directly into Excel</span>
      </div>
    </div>
  );
}
