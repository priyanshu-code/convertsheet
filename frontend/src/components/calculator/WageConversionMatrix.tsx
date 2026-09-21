"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, DollarSign, Calendar, Clock, FileSpreadsheet, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";

export interface WageConversionMatrixProps {
  initialHourlyRate?: number;
}

export function WageConversionMatrix({
  initialHourlyRate = 25,
}: WageConversionMatrixProps) {
  const [hourlyRate, setHourlyRate] = useState(initialHourlyRate);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);

  const annualHours = hoursPerWeek * 52;
  const annualGross = hourlyRate * annualHours;
  const monthlyGross = annualGross / 12;
  const semiMonthlyGross = annualGross / 24;
  const biWeeklyGross = annualGross / 26;
  const weeklyGross = annualGross / 52;
  const dailyGross = hourlyRate * (hoursPerWeek / 5);
  const overtimeRate = hourlyRate * 1.5;

  const handleExport = () => {
    const rows = [
      { Period: "Hourly Rate", Hours: "1 Hour", GrossPay: `$${hourlyRate.toFixed(2)}` },
      { Period: "Overtime Rate (1.5x)", Hours: "1 Overtime Hour", GrossPay: `$${overtimeRate.toFixed(2)}` },
      { Period: "Daily Pay (Standard)", Hours: `${(hoursPerWeek / 5).toFixed(1)} Hours`, GrossPay: `$${dailyGross.toFixed(2)}` },
      { Period: "Weekly Pay", Hours: `${hoursPerWeek} Hours`, GrossPay: `$${weeklyGross.toFixed(2)}` },
      { Period: "Bi-Weekly Pay (26 checks/yr)", Hours: `${hoursPerWeek * 2} Hours`, GrossPay: `$${biWeeklyGross.toFixed(2)}` },
      { Period: "Semi-Monthly Pay (24 checks/yr)", Hours: `${(annualHours / 24).toFixed(1)} Hours`, GrossPay: `$${semiMonthlyGross.toFixed(2)}` },
      { Period: "Monthly Pay (12 checks/yr)", Hours: `${(annualHours / 12).toFixed(1)} Hours`, GrossPay: `$${monthlyGross.toFixed(2)}` },
      { Period: "Annual Gross Salary", Hours: `${annualHours.toLocaleString()} Hours`, GrossPay: `$${Math.round(annualGross).toLocaleString()}` },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WageMatrix");
    XLSX.writeFile(wb, `${hourlyRate}-an-hour-wage-breakdown.xlsx`);
  };

  const adjacentRates = [15, 20, 22, 25, 28, 30, 35, 40];

  return (
    <section
      aria-labelledby="wage-matrix-heading"
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 inline-block mb-1.5">
            Full Paycheck Breakdown
          </span>
          <h2
            id="wage-matrix-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            ${hourlyRate} an Hour Wage Conversion Matrix
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Exact salary breakdown across all payment frequencies ({hoursPerWeek} hours/week standard).
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition-all self-start sm:self-center"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Export Wage Table (.xlsx)</span>
        </button>
      </div>

      {/* Hourly Benchmarks Selector */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-zinc-500 dark:text-zinc-400 font-medium">Compare Wages:</span>
        {adjacentRates.map((rate) => (
          <button
            key={rate}
            type="button"
            onClick={() => setHourlyRate(rate)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              hourlyRate === rate
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            ${rate}/hr
          </button>
        ))}
      </div>

      {/* Headline Conversion Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800">
        <div>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Annual Salary</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
            ${Math.round(annualGross).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Monthly Pay</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block mt-0.5">
            ${Math.round(monthlyGross).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Bi-Weekly (2 Wks)</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block mt-0.5">
            ${Math.round(biWeeklyGross).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Weekly Pay</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block mt-0.5">
            ${Math.round(weeklyGross).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">Pay Frequency</th>
              <th className="py-3 px-4">Working Hours</th>
              <th className="py-3 px-4 text-right">Gross Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium">
            <tr>
              <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Hourly Rate</td>
              <td className="py-3 px-4 text-zinc-500">1 Hour</td>
              <td className="py-3 px-4 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                ${hourlyRate.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Overtime Rate (1.5x)</td>
              <td className="py-3 px-4 text-zinc-500">1 Overtime Hour</td>
              <td className="py-3 px-4 font-mono text-right font-bold text-amber-600 dark:text-amber-400">
                ${overtimeRate.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Daily Pay (8-Hour Shift)</td>
              <td className="py-3 px-4 text-zinc-500">8 Hours</td>
              <td className="py-3 px-4 font-mono text-right">${dailyGross.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Weekly Pay</td>
              <td className="py-3 px-4 text-zinc-500">40 Hours</td>
              <td className="py-3 px-4 font-mono text-right">${weeklyGross.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Bi-Weekly Pay (26 pay periods)</td>
              <td className="py-3 px-4 text-zinc-500">80 Hours</td>
              <td className="py-3 px-4 font-mono text-right font-semibold text-emerald-700 dark:text-emerald-300">
                ${biWeeklyGross.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Semi-Monthly Pay (24 pay periods)</td>
              <td className="py-3 px-4 text-zinc-500">86.7 Hours</td>
              <td className="py-3 px-4 font-mono text-right">${semiMonthlyGross.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">Monthly Pay (12 months)</td>
              <td className="py-3 px-4 text-zinc-500">173.3 Hours</td>
              <td className="py-3 px-4 font-mono text-right font-semibold text-emerald-700 dark:text-emerald-300">
                ${monthlyGross.toFixed(2)}
              </td>
            </tr>
            <tr className="bg-zinc-50/50 dark:bg-zinc-850/50">
              <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">Annual Gross Salary</td>
              <td className="py-3 px-4 text-zinc-500 font-semibold">2,080 Hours</td>
              <td className="py-3 px-4 font-mono text-right font-extrabold text-emerald-700 dark:text-emerald-300 text-base">
                ${Math.round(annualGross).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tax Notice & Contextual Link */}
      <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
        <div>
          <span className="font-bold block">Want to calculate after-tax take-home pay?</span>
          <span className="text-blue-700 dark:text-blue-300">
            See actual net pay after federal, FICA (Social Security &amp; Medicare), and state tax deductions.
          </span>
        </div>
        <Link
          href={`/tools/salary-calculator`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shrink-0"
        >
          <span>Calculate Take-Home Pay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
