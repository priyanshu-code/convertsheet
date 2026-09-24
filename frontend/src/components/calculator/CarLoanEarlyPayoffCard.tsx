"use client";

import React, { useState, useMemo } from "react";
import { Zap, Download, Sparkles, Clock, DollarSign, CalendarCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { calculateCarLoanEarlyPayoff } from "@/lib/engines/financial-engine";

export interface CarLoanEarlyPayoffCardProps {
  loanAmount: number;
  interestRate: number;
  loanTermMonths: number;
  className?: string;
}

const PRESET_EXTRA_PAYMENTS = [50, 100, 150, 200, 300];

export function CarLoanEarlyPayoffCard({
  loanAmount,
  interestRate,
  loanTermMonths,
  className = "",
}: CarLoanEarlyPayoffCardProps) {
  const [extraMonthly, setExtraMonthly] = useState<number>(100);
  const [lumpSum, setLumpSum] = useState<number>(0);

  const payoff = useMemo(() => {
    return calculateCarLoanEarlyPayoff({
      loanAmount,
      interestRate,
      originalTermMonths: loanTermMonths,
      extraMonthlyPayment: extraMonthly,
      oneTimeLumpSum: lumpSum,
    });
  }, [loanAmount, interestRate, loanTermMonths, extraMonthly, lumpSum]);

  const handleExportXlsx = () => {
    try {
      const rows = payoff.payoffScheduleComparison.map((item) => ({
        Year: `Year ${item.year}`,
        "Standard Remaining Balance ($)": Math.round(item.standardBalance),
        "Accelerated Remaining Balance ($)": Math.round(item.acceleratedBalance),
        "Accelerated Principal Advantage ($)": Math.round(
          Math.max(0, item.standardBalance - item.acceleratedBalance)
        ),
      }));

      // Append summary meta row
      rows.push({
        Year: "--- SUMMARY ---",
        "Standard Remaining Balance ($)": 0,
        "Accelerated Remaining Balance ($)": 0,
        "Accelerated Principal Advantage ($)": Math.round(payoff.totalInterestSaved),
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "EarlyPayoffPlan");
      XLSX.writeFile(workbook, `car-loan-early-payoff-plan-$${Math.round(loanAmount)}.xlsx`);
    } catch (err) {
      console.error("Failed to export early payoff schedule:", err);
    }
  };

  const hasSavings = payoff.totalInterestSaved > 0 && payoff.monthsSaved > 0;

  return (
    <div
      className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Early Loan Payoff Engine</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Pay Extra &amp; Eliminate Your Car Loan Faster
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            See how much interest you save and how many months you eliminate with extra principal payments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportXlsx}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm transition-all shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Early Payoff (.xlsx)</span>
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 pb-4">
        {/* Extra Monthly Payment */}
        <div className="space-y-2">
          <label
            htmlFor="extra-monthly-payment"
            className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Extra Monthly Principal Payment
          </label>
          <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <span className="pl-3.5 pr-1 text-sm font-medium text-zinc-400 select-none">$</span>
            <input
              id="extra-monthly-payment"
              type="number"
              min={0}
              max={5000}
              step={25}
              value={extraMonthly}
              onChange={(e) => setExtraMonthly(Math.max(0, Number(e.target.value) || 0))}
              className="w-full py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-transparent placeholder:text-zinc-400 focus:outline-none pr-3"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {PRESET_EXTRA_PAYMENTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setExtraMonthly(amt)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  extraMonthly === amt
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                +${amt}/mo
              </button>
            ))}
          </div>
        </div>

        {/* One-Time Lump Sum Payment */}
        <div className="space-y-2">
          <label
            htmlFor="lump-sum-payment"
            className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            One-Time Lump Sum Payment (Tax Refund / Bonus)
          </label>
          <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <span className="pl-3.5 pr-1 text-sm font-medium text-zinc-400 select-none">$</span>
            <input
              id="lump-sum-payment"
              type="number"
              min={0}
              max={loanAmount}
              step={500}
              value={lumpSum}
              onChange={(e) => setLumpSum(Math.max(0, Number(e.target.value) || 0))}
              className="w-full py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-transparent placeholder:text-zinc-400 focus:outline-none pr-3"
              placeholder="e.g. 1000"
            />
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Applied directly to the starting principal balance.
          </p>
        </div>
      </div>

      {/* High-Impact Result Highlight Banner */}
      <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 my-3 text-xs leading-relaxed text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          {hasSavings ? (
            <>
              By contributing an extra <strong>${extraMonthly}/month</strong>
              {lumpSum > 0 ? ` plus a $${lumpSum.toLocaleString()} lump sum` : ""}, you will pay off
              your vehicle <strong>{payoff.monthsSaved} months early</strong> (in just{" "}
              <strong>{payoff.newPayoffMonths} months</strong> instead of {payoff.originalTermMonths})
              and save a total of <strong>${payoff.totalInterestSaved.toLocaleString()}</strong> in loan
              interest!
            </>
          ) : (
            <>
              Enter an extra monthly payment or one-time lump sum above to calculate your early debt-free
              date and exact interest savings.
            </>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>Interest Saved</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ${payoff.totalInterestSaved.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Direct money back in your pocket</div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Time Shaved Off</span>
          </div>
          <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
            {payoff.monthsSaved} mo ({payoff.yearsSaved} yrs)
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Shorter debt obligation</div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-violet-500" />
            <span>New Payoff Horizon</span>
          </div>
          <div className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {payoff.newPayoffMonths} Months
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">vs {payoff.originalTermMonths} mo standard</div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            <span>Accelerated Monthly</span>
          </div>
          <div className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
            ${payoff.acceleratedMonthlyPayment.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            Standard: ${payoff.originalMonthlyPayment.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
