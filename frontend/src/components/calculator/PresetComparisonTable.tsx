"use client";

import React from "react";
import { Table, FileSpreadsheet, ArrowRight, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";

export interface PresetComparisonTableProps {
  toolSlug: string;
  presetSlug: string;
  presetName: string;
  initialValues?: Record<string, unknown>;
}

export function PresetComparisonTable({
  toolSlug,
  presetSlug,
  presetName,
  initialValues = {},
}: PresetComparisonTableProps) {
  // 1. Mortgage comparison (15 vs 20 vs 30 year)
  if (toolSlug === "mortgage-calculator") {
    const homePrice = Number(initialValues.homePrice) || 400000;
    const downPayment = Number(initialValues.downPayment) || homePrice * 0.2;
    const loanAmount = Math.max(1000, homePrice - downPayment);
    const baseRate = Number(initialValues.interestRate) || 6.5;

    const calcMonthly = (principal: number, annualRate: number, years: number) => {
      const r = annualRate / 100 / 12;
      const n = years * 12;
      if (r === 0) return principal / n;
      return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    };

    const terms = [
      { years: 15, rate: Number((baseRate - 0.6).toFixed(2)), label: "15-Year Fixed" },
      { years: 20, rate: Number((baseRate - 0.3).toFixed(2)), label: "20-Year Fixed" },
      { years: 30, rate: baseRate, label: "30-Year Fixed (Standard)" },
    ];

    const data = terms.map((t) => {
      const monthly = calcMonthly(loanAmount, t.rate, t.years);
      const totalPayment = monthly * t.years * 12;
      const totalInterest = totalPayment - loanAmount;
      return {
        term: t.label,
        rate: `${t.rate}%`,
        monthlyPayment: Math.round(monthly),
        totalInterest: Math.round(totalInterest),
        totalCost: Math.round(totalPayment),
        years: t.years,
      };
    });

    const exportRows = data.map((d) => ({
      "Loan Term": d.term,
      "Interest Rate (APR)": d.rate,
      "Monthly Principal & Interest": `$${d.monthlyPayment.toLocaleString()}`,
      "Total Lifetime Interest": `$${d.totalInterest.toLocaleString()}`,
      "Total Cost of Loan": `$${d.totalCost.toLocaleString()}`,
    }));

    const handleExport = () => {
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "MortgageComparison");
      XLSX.writeFile(wb, `mortgage-comparison-${loanAmount}.xlsx`);
    };

    return (
      <section
        aria-labelledby="comparison-table-heading"
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2
              id="comparison-table-heading"
              className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100"
            >
              Side-by-Side Term Comparison: {presetName}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition-all self-start sm:self-auto cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Comparison (.xlsx)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Loan Term</th>
                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Est. APR</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">Monthly Payment</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">Total Interest</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">Total Loan Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {data.map((row) => (
                <tr key={row.term} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                    {row.term}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {row.rate}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ${row.monthlyPayment.toLocaleString()}/mo
                  </td>
                  <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">
                    ${row.totalInterest.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-900 dark:text-zinc-100 font-bold">
                    ${row.totalCost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  // 2. Salary / Take-Home Pay Frequency Breakdown
  if (toolSlug === "salary-calculator" || toolSlug === "hourly-to-salary-calculator" || toolSlug === "annual-to-hourly-calculator") {
    const isIndia = presetSlug.includes("india") || presetSlug.includes("lakh");
    const currency = isIndia ? "₹" : "$";
    const grossAnnual = Number(initialValues.grossSalary) || Number(initialValues.annualCtc) || (Number(initialValues.hourlyRate) ? Number(initialValues.hourlyRate) * 2080 : 100000);
    const taxRate = isIndia ? 0.15 : 0.22;

    const periods = [
      { label: "Annual (1 Year)", divisor: 1, hours: 2080 },
      { label: "Monthly (12 Paychecks)", divisor: 12, hours: 173.33 },
      { label: "Semi-Monthly (24 Paychecks)", divisor: 24, hours: 86.67 },
      { label: "Bi-Weekly (26 Paychecks)", divisor: 26, hours: 80 },
      { label: "Weekly (52 Paychecks)", divisor: 52, hours: 40 },
      { label: "Hourly (40 hrs/wk)", divisor: 2080, hours: 1 },
    ];

    const data = periods.map((p) => {
      const gross = Math.round(grossAnnual / p.divisor);
      const estTax = Math.round(gross * taxRate);
      const net = gross - estTax;
      return {
        period: p.label,
        gross,
        estTax,
        net,
      };
    });

    const exportRows = data.map((d) => ({
      "Pay Period": d.period,
      "Gross Pay": `${currency}${d.gross.toLocaleString()}`,
      "Est. Taxes & Deductions": `${currency}${d.estTax.toLocaleString()}`,
      "Net Take-Home": `${currency}${d.net.toLocaleString()}`,
    }));

    const handleExport = () => {
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SalaryBreakdown");
      XLSX.writeFile(wb, `salary-breakdown-${grossAnnual}.xlsx`);
    };

    return (
      <section
        aria-labelledby="comparison-table-heading"
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2
              id="comparison-table-heading"
              className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100"
            >
              Pay Frequency Breakdown: {presetName}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition-all self-start sm:self-auto cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Table (.xlsx)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Pay Frequency</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">Gross Pay</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">Est. Taxes (TDS/FICA)</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">Net Take-Home Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {data.map((row) => (
                <tr key={row.period} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                    {row.period}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                    {currency}{row.gross.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">
                    -{currency}{row.estTax.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {currency}{row.net.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  // 3. Percentage Calculator Preset Table
  if (toolSlug === "percentage-calculator") {
    const baseValue = Number(initialValues.value) || Number(initialValues.total) || 100;
    const percentages = [5, 10, 15, 20, 25, 30, 40, 50, 75];

    return (
      <section
        aria-labelledby="comparison-table-heading"
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs"
      >
        <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
          <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2
            id="comparison-table-heading"
            className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100"
          >
            Quick Percentage Matrix: {presetName}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Percentage</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">Calculated Value</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">Base + % (Increase)</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">Base - % (Discount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {percentages.map((pct) => {
                const part = (baseValue * pct) / 100;
                const increase = baseValue + part;
                const discount = baseValue - part;
                return (
                  <tr key={pct} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                      {pct}%
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {part.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                      {increase.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                      {discount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return null;
}
