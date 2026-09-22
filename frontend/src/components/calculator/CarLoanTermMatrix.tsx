"use client";

import React, { useState } from "react";
import { Download, Car, AlertTriangle, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";

export interface CarLoanTermMatrixProps {
  initialLoanAmount?: number;
  className?: string;
}

const PRESET_AMOUNTS = [15000, 25000, 35000, 45000, 60000, 80000];
const LOAN_TERMS = [
  { months: 36, label: "36 Months (3 Yrs)", desc: "Lowest total interest, aggressive payoff" },
  { months: 48, label: "48 Months (4 Yrs)", desc: "Recommended balance of payment & interest" },
  { months: 60, label: "60 Months (5 Yrs)", desc: "Most common new car loan term" },
  { months: 72, label: "72 Months (6 Yrs)", desc: "Lower payment, elevated interest cost" },
  { months: 84, label: "84 Months (7 Yrs)", desc: "Long term: risk of negative equity (underwater)" },
];

export function CarLoanTermMatrix({
  initialLoanAmount = 35000,
  className = "",
}: CarLoanTermMatrixProps) {
  const [loanAmount, setLoanAmount] = useState<number>(initialLoanAmount);
  const [rate, setRate] = useState<number>(6.5); // standard 6.5% auto APR

  const calculateLoanMetrics = (principal: number, annualApr: number, months: number) => {
    const monthlyRate = annualApr / 100 / 12;
    if (monthlyRate === 0) {
      return {
        monthlyPayment: principal / months,
        totalInterest: 0,
        totalCost: principal,
      };
    }
    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalCost = monthlyPayment * months;
    const totalInterest = totalCost - principal;
    return {
      monthlyPayment,
      totalInterest,
      totalCost,
    };
  };

  const handleExportXlsx = () => {
    try {
      const rows = LOAN_TERMS.map((t) => {
        const { monthlyPayment, totalInterest, totalCost } = calculateLoanMetrics(
          loanAmount,
          rate,
          t.months
        );
        return {
          "Loan Amount ($)": loanAmount,
          "Interest Rate (APR)": `${rate}%`,
          "Term Length": t.label,
          "Monthly Payment ($)": Math.round(monthlyPayment),
          "Total Interest Paid ($)": Math.round(totalInterest),
          "Total Vehicle Cost ($)": Math.round(totalCost),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "CarLoanTermMatrix");
      XLSX.writeFile(workbook, `car-loan-term-comparison-${loanAmount}.xlsx`);
    } catch (err) {
      console.error("Failed to export car loan matrix:", err);
    }
  };

  const term60 = calculateLoanMetrics(loanAmount, rate, 60);
  const term84 = calculateLoanMetrics(loanAmount, rate, 84);
  const interestDifference = term84.totalInterest - term60.totalInterest;

  return (
    <div
      className={`my-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-1.5">
            <Car className="w-3.5 h-3.5" />
            <span>Auto Financing Term Matrix</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            ${loanAmount.toLocaleString()} Car Loan: 36 vs 48 vs 60 vs 72 vs 84 Months
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Compare monthly payments vs lifetime interest cost across loan terms at {rate}% APR.
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

      {/* Quick Loan Amount Selector */}
      <div className="py-4 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
          Loan Amount:
        </span>
        {PRESET_AMOUNTS.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setLoanAmount(val)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
              loanAmount === val
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            ${val.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Direct Answer Box (AEO & Featured Snippet) */}
      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 my-3 text-xs leading-relaxed text-amber-950 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Financing Trade-off (60 vs 84 Months):</strong> Financing{" "}
          <strong>${loanAmount.toLocaleString()}</strong> over 60 months costs{" "}
          <strong>${Math.round(term60.monthlyPayment).toLocaleString()}/month</strong> with{" "}
          <strong>${Math.round(term60.totalInterest).toLocaleString()}</strong> in interest. Extending to
          84 months lowers your payment to{" "}
          <strong>${Math.round(term84.monthlyPayment).toLocaleString()}/month</strong>, but adds{" "}
          <strong className="text-rose-600 dark:text-rose-400">
            +${Math.round(interestDifference).toLocaleString()} in extra finance charges
          </strong>{" "}
          and increases the risk of being underwater on your vehicle.
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/60 text-zinc-600 dark:text-zinc-300 font-semibold">
              <th className="py-2.5 px-3">Loan Term</th>
              <th className="py-2.5 px-3">Monthly Payment</th>
              <th className="py-2.5 px-3">Total Interest</th>
              <th className="py-2.5 px-3">Total Cost</th>
              <th className="py-2.5 px-3">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {LOAN_TERMS.map((t) => {
              const { monthlyPayment, totalInterest, totalCost } = calculateLoanMetrics(
                loanAmount,
                rate,
                t.months
              );

              return (
                <tr
                  key={t.months}
                  className={`hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                    t.months === 60 ? "bg-emerald-50/40 dark:bg-emerald-950/20 font-medium" : ""
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {t.label}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    ${Math.round(monthlyPayment).toLocaleString()}
                    <span className="text-[10px] text-zinc-400 font-normal">/mo</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-zinc-700 dark:text-zinc-300">
                    ${Math.round(totalInterest).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    ${Math.round(totalCost).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {t.desc}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer takeaway */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Calculated at {rate}% APR standard auto loan rate</span>
        </span>
        <span className="hidden sm:inline font-mono">1-Click Excel (.xlsx) Export</span>
      </div>
    </div>
  );
}
