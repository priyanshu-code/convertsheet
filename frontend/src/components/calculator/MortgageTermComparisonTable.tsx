"use client";

import React, { useState } from "react";
import { Check, ArrowDownRight, TrendingDown, DollarSign, Calendar, FileSpreadsheet, Percent } from "lucide-react";
import * as XLSX from "xlsx";

export interface MortgageTermComparisonTableProps {
  initialLoanAmount?: number;
}

export function MortgageTermComparisonTable({
  initialLoanAmount = 320000,
}: MortgageTermComparisonTableProps) {
  const [loanAmount, setLoanAmount] = useState(initialLoanAmount);
  const [rate15, setRate15] = useState(5.8);
  const [rate30, setRate30] = useState(6.5);

  const calculateMonthly = (principal: number, annualRate: number, years: number) => {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    if (r === 0) return principal / n;
    return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  };

  const monthly15 = calculateMonthly(loanAmount, rate15, 15);
  const totalPayment15 = monthly15 * 15 * 12;
  const totalInterest15 = totalPayment15 - loanAmount;

  const monthly30 = calculateMonthly(loanAmount, rate30, 30);
  const totalPayment30 = monthly30 * 30 * 12;
  const totalInterest30 = totalPayment30 - loanAmount;

  const monthlyDiff = monthly15 - monthly30;
  const interestSavings = totalInterest30 - totalInterest15;

  const handleExport = () => {
    const rows = [
      { Metric: "Loan Amount", "15-Year Mortgage": `$${loanAmount.toLocaleString()}`, "30-Year Mortgage": `$${loanAmount.toLocaleString()}`, Difference: "$0" },
      { Metric: "Interest Rate (APR)", "15-Year Mortgage": `${rate15}%`, "30-Year Mortgage": `${rate30}%`, Difference: `${(rate30 - rate15).toFixed(2)}% lower` },
      { Metric: "Monthly P&I Payment", "15-Year Mortgage": `$${Math.round(monthly15).toLocaleString()}`, "30-Year Mortgage": `$${Math.round(monthly30).toLocaleString()}`, Difference: `+$${Math.round(monthlyDiff).toLocaleString()}/mo` },
      { Metric: "Total Interest Paid", "15-Year Mortgage": `$${Math.round(totalInterest15).toLocaleString()}`, "30-Year Mortgage": `$${Math.round(totalInterest30).toLocaleString()}`, Difference: `-$${Math.round(interestSavings).toLocaleString()}` },
      { Metric: "Total Cost of Loan", "15-Year Mortgage": `$${Math.round(totalPayment15).toLocaleString()}`, "30-Year Mortgage": `$${Math.round(totalPayment30).toLocaleString()}`, Difference: `-$${Math.round(interestSavings).toLocaleString()}` },
      { Metric: "Payoff Horizon", "15-Year Mortgage": "15 Years (180 months)", "30-Year Mortgage": "30 Years (360 months)", Difference: "15 Years sooner" },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "15vs30Comparison");
    XLSX.writeFile(wb, `15-vs-30-mortgage-comparison-${loanAmount}.xlsx`);
  };

  return (
    <section
      aria-labelledby="comparison-table-heading"
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 inline-block mb-1.5">
            Side-by-Side Analysis
          </span>
          <h2
            id="comparison-table-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            15-Year vs. 30-Year Mortgage Side-by-Side
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Compare monthly payments against lifetime interest costs on a ${loanAmount.toLocaleString()} loan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition-all self-start sm:self-center"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Export Comparison (.xlsx)</span>
        </button>
      </div>

      {/* Quick Loan Size Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-zinc-500 dark:text-zinc-400 font-medium">Quick Amounts:</span>
        {[200000, 300000, 320000, 400000, 500000, 600000].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setLoanAmount(amt)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              loanAmount === amt
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            ${(amt / 1000).toFixed(0)}k
          </button>
        ))}
      </div>

      {/* Highlight Box: Interest Savings */}
      <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Total Interest Saved with 15-Year
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 font-mono">
              ${Math.round(interestSavings).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="text-xs text-emerald-800/90 dark:text-emerald-300/90 font-medium sm:text-right">
          <div>Save {( (interestSavings / totalInterest30) * 100 ).toFixed(1)}% on total interest</div>
          <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Monthly payment is +${Math.round(monthlyDiff).toLocaleString()} higher</div>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3.5 px-4">Financial Metric</th>
              <th className="py-3.5 px-4 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                15-Year Fixed ({rate15}%)
              </th>
              <th className="py-3.5 px-4">30-Year Fixed ({rate30}%)</th>
              <th className="py-3.5 px-4 text-right">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium">
            <tr>
              <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Monthly P&amp;I Payment</td>
              <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10">
                ${Math.round(monthly15).toLocaleString()}
              </td>
              <td className="py-3.5 px-4 font-mono">${Math.round(monthly30).toLocaleString()}</td>
              <td className="py-3.5 px-4 font-mono text-right text-amber-600 dark:text-amber-400">
                +${Math.round(monthlyDiff).toLocaleString()} /mo
              </td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Total Interest Paid</td>
              <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10">
                ${Math.round(totalInterest15).toLocaleString()}
              </td>
              <td className="py-3.5 px-4 font-mono">${Math.round(totalInterest30).toLocaleString()}</td>
              <td className="py-3.5 px-4 font-mono text-right text-emerald-600 dark:text-emerald-400 font-bold">
                -${Math.round(interestSavings).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Total Cost of Mortgage</td>
              <td className="py-3.5 px-4 font-mono bg-emerald-50/30 dark:bg-emerald-950/10">
                ${Math.round(totalPayment15).toLocaleString()}
              </td>
              <td className="py-3.5 px-4 font-mono">${Math.round(totalPayment30).toLocaleString()}</td>
              <td className="py-3.5 px-4 font-mono text-right text-emerald-600 dark:text-emerald-400">
                -${Math.round(interestSavings).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Payoff Timeframe</td>
              <td className="py-3.5 px-4 bg-emerald-50/30 dark:bg-emerald-950/10">180 Months (15 Yrs)</td>
              <td className="py-3.5 px-4">360 Months (30 Yrs)</td>
              <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                15 Years Sooner
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
