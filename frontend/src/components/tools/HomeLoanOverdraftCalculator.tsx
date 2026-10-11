"use client";

import React, { useState, useMemo } from "react";
import {
  Wallet,
  Percent,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Download,
  IndianRupee,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import {
  calculateHomeLoanOverdraft,
  HomeLoanOverdraftInput,
} from "@/lib/engines/financial-engine";
import * as XLSX from "xlsx";

export interface HomeLoanOverdraftCalculatorProps {
  initialValues?: Partial<HomeLoanOverdraftInput>;
}

export function HomeLoanOverdraftCalculator({
  initialValues,
}: HomeLoanOverdraftCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  // State
  const [loanAmount, setLoanAmount] = useState<number>(
    () => Number(initialValues?.loanAmount) || 5000000
  );
  const [standardRate, setStandardRate] = useState<number>(
    () => Number(initialValues?.standardRate) || 8.50
  );
  const [spreadPercent, setSpreadPercent] = useState<number>(() => {
    if (initialValues?.overdraftRate && initialValues?.standardRate) {
      return Number((initialValues.overdraftRate - initialValues.standardRate).toFixed(2));
    }
    return 0.40; // Default SBI MaxGain spread
  });
  const [tenureYears, setTenureYears] = useState<number>(
    () => Number(initialValues?.tenureYears) || 20
  );
  const [parkedSurplusAmount, setParkedSurplusAmount] = useState<number>(
    () => Number(initialValues?.parkedSurplusAmount ?? 1000000)
  );
  const [monthlyAddition, setMonthlyAddition] = useState<number>(
    () => Number(initialValues?.monthlySurplusAddition ?? 0)
  );

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Derived overdraft rate
  const overdraftRate = useMemo(() => {
    return Number((standardRate + spreadPercent).toFixed(2));
  }, [standardRate, spreadPercent]);

  // Calculation
  const result = useMemo(() => {
    return calculateHomeLoanOverdraft({
      loanAmount,
      standardRate,
      overdraftRate,
      tenureYears,
      parkedSurplusAmount,
      monthlySurplusAddition: monthlyAddition,
    });
  }, [loanAmount, standardRate, overdraftRate, tenureYears, parkedSurplusAmount, monthlyAddition]);

  // Loan presets for quick Indian mortgage amounts
  const loanPresets = [
    { label: "₹30 Lakh", val: 3000000 },
    { label: "₹50 Lakh", val: 5000000 },
    { label: "₹75 Lakh", val: 7500000 },
    { label: "₹1 Crore", val: 10000000 },
  ];

  // Bank spread presets in India
  const bankSpreadPresets = [
    { label: "SBI MaxGain (+0.40%)", val: 0.40 },
    { label: "Bank of Baroda (+0.25%)", val: 0.25 },
    { label: "PNB Max Saver (+0.35%)", val: 0.35 },
    { label: "Zero Spread Promo (+0.00%)", val: 0.00 },
  ];

  // Excel Export
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["ConvertSheet - Home Loan Overdraft (SBI MaxGain) Audit", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["", ""],
        ["--- LOAN PARAMETERS ---", ""],
        ["Sanctioned Loan Amount", loanAmount],
        ["Standard Term Loan Interest Rate", `${standardRate}%`],
        ["Overdraft Interest Rate", `${overdraftRate}% (+${Math.round(spreadPercent * 100)} bps spread)`],
        ["Loan Tenure (Years)", tenureYears],
        ["Monthly Remittance (Fixed EMI)", result.standardLoan.monthlyEmi],
        ["Parked Surplus Balance in OD Account", parkedSurplusAmount],
        ["", ""],
        ["--- OVERDRAFT VERDICT & SAVINGS ---", ""],
        ["Net Lifetime Interest Saved", result.interestSavedVsStandard],
        ["Loan Tenure Shortened (Years)", result.tenureYearsSaved],
        ["Payoff Horizon (Months)", `${result.overdraftLoan.payoffMonths} of ${result.standardLoan.payoffMonths}`],
        ["Break-Even Average Balance Required", result.breakEvenBalance],
        ["Effective Tax-Free Return on Parked Cash", `${result.effectiveTaxFreeYield}%`],
        ["Equivalent 30% Tax Slab FD Return", `${result.equivalentFdPreTaxYield30Pct}%`],
        ["Recommendation Verdict", result.recommendation],
        ["Recommendation Analysis", result.recommendationReason],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Overdraft Summary");

      // Yearly Schedule Table
      const scheduleHeader = [
        "Year",
        "Standard Loan Balance (₹)",
        "Overdraft Balance (₹)",
        "Standard Cum. Interest (₹)",
        "Overdraft Cum. Interest (₹)",
        "Cum. Interest Saved (₹)",
      ];
      const scheduleRows = result.yearlyComparison.map((pt) => [
        pt.year,
        pt.standardBalance,
        pt.overdraftBalance,
        pt.standardCumulativeInterest,
        pt.overdraftCumulativeInterest,
        pt.cumulativeInterestSaved,
      ]);
      const wsSchedule = XLSX.utils.aoa_to_sheet([scheduleHeader, ...scheduleRows]);
      XLSX.utils.book_append_sheet(wb, wsSchedule, "Yearly Amortization");

      XLSX.writeFile(wb, `ConvertSheet_Home_Loan_Overdraft_Audit_${loanAmount}.xlsx`);
    } catch (err) {
      console.error("Failed to generate Excel export:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <Wallet className="h-3.5 w-3.5" />
                SBI MaxGain &amp; Overdraft Engine
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                RBI EBLR Linked
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Home Loan Overdraft (SBI MaxGain) Calculator
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Model daily interest savings by parking surplus emergency cash in your linked OD account. 
              Factoring in the +40 bps spread premium, break-even thresholds, and 100% liquidity preservation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExportingExcel ? "Generating..." : "Export Excel (.xlsx)"}</span>
          </button>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <CalcCard
            title="Loan & Overdraft Parameters"
            description="Enter your loan amount, standard interest rate, and bank spread"
          >
            <div className="space-y-5">
              {/* Preset Amount Pills */}
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                  Quick Indian Loan Amount Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {loanPresets.map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setLoanAmount(p.val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                        loanAmount === p.val
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sanctioned Loan Amount */}
              <CalcInput
                label="Sanctioned Loan Amount"
                value={loanAmount}
                onChange={setLoanAmount}
                prefix={currencySymbol}
                min={100000}
                max={50000000}
                step={50000}
                helperText="Total principal sanctioned by the lender"
              />

              {/* Standard Loan Interest Rate */}
              <div className="space-y-2">
                <CalcInput
                  label="Standard Home Loan Interest Rate"
                  value={standardRate}
                  onChange={setStandardRate}
                  suffix="%"
                  min={6.0}
                  max={15.0}
                  step={0.05}
                  helperText="Base floating repo-linked rate for standard term loans (e.g. 8.50%)"
                />
                <CalcSlider
                  value={standardRate}
                  onChange={setStandardRate}
                  min={6.5}
                  max={12.0}
                  step={0.05}
                />
              </div>

              {/* Bank Spread Presets */}
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                  Bank Overdraft Spread Premium
                </label>
                <div className="flex flex-wrap gap-2">
                  {bankSpreadPresets.map((sp) => (
                    <button
                      key={sp.val}
                      type="button"
                      onClick={() => setSpreadPercent(sp.val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                        spreadPercent === sp.val
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overdraft Effective Rate Display */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Effective Overdraft Rate:
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    {standardRate}% base + {spreadPercent}% bank spread
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {overdraftRate}% p.a.
                </span>
              </div>

              {/* Remaining Tenure */}
              <div className="space-y-2">
                <CalcInput
                  label="Loan Tenure (Years)"
                  value={tenureYears}
                  onChange={setTenureYears}
                  suffix="years"
                  min={1}
                  max={30}
                  step={1}
                  helperText="Contractual repayment period"
                />
                <CalcSlider
                  value={tenureYears}
                  onChange={setTenureYears}
                  min={5}
                  max={30}
                  step={1}
                />
              </div>

              {/* Parked Surplus in Overdraft Account */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <CalcInput
                  label="Average Parked Surplus Balance in OD Account"
                  value={parkedSurplusAmount}
                  onChange={setParkedSurplusAmount}
                  prefix={currencySymbol}
                  min={0}
                  max={loanAmount}
                  step={25000}
                  helperText="Cash parked in your MaxGain current account (Emergency funds, bonuses, savings)"
                />
                <CalcSlider
                  value={parkedSurplusAmount}
                  onChange={setParkedSurplusAmount}
                  min={0}
                  max={Math.min(loanAmount, 5000000)}
                  step={50000}
                />
              </div>

              {/* Monthly Surplus Addition (Optional) */}
              <CalcInput
                label="Monthly Surplus Addition (Optional)"
                value={monthlyAddition}
                onChange={setMonthlyAddition}
                prefix={currencySymbol}
                min={0}
                max={500000}
                step={5000}
                helperText="Extra salary savings deposited each month into the OD account"
              />
            </div>
          </CalcCard>
        </div>

        {/* Right Column: Results & Verdicts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Verdict Card */}
          <div
            className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
              result.isMaxGainBeneficial
                ? "bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-zinc-900 border-emerald-500/30"
                : "bg-gradient-to-br from-rose-500/10 via-white to-rose-500/5 dark:from-rose-950/40 dark:via-zinc-900 dark:to-zinc-900 border-rose-500/30"
            }`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                {result.isMaxGainBeneficial ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Overdraft Verdict
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  result.isMaxGainBeneficial
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {result.isMaxGainBeneficial ? "Savings Active" : "Spread Drag"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Total Interest Saved vs. Standard Loan:
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
                {result.interestSavedVsStandard >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(result.interestSavedVsStandard))}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                {result.recommendationReason}
              </p>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800 text-xs">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
                <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">
                  Tenure Shortened:
                </span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                  {result.tenureYearsSaved} Years ({result.tenureMonthsSaved} mo)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
                <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">
                  Break-Even Surplus:
                </span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(result.breakEvenBalance)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
                <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">
                  Effective Tax-Free Yield:
                </span>
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                  {result.effectiveTaxFreeYield}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
                <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">
                  Equiv. 30% Slab FD Return:
                </span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                  {result.equivalentFdPreTaxYield30Pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Overdraft vs. Direct Prepayment Comparison Card */}
          <CalcCard
            title="Overdraft vs. Direct Prepayment"
            description="Comparing parked liquidity against permanent principal prepayment"
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>SBI MaxGain OD</span>
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Liquidity: <strong className="text-emerald-600 dark:text-emerald-400">100% Available</strong>
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Tenure: {Math.round(result.overdraftLoan.payoffMonths / 12)} Yrs
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Interest: {formatCurrency(result.overdraftLoan.totalInterest)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Direct Prepayment</span>
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Liquidity: <strong className="text-rose-500">0% (Locked Forever)</strong>
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Tenure: {Math.round(result.directPrepaymentComparison.prepaidTenureMonths / 12)} Yrs
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Saved: {formatCurrency(result.directPrepaymentComparison.prepaidInterestSaved)}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1">
                <span className="font-semibold block text-zinc-900 dark:text-zinc-100">
                  💡 The Liquidity Edge:
                </span>
                <span>
                  With SBI MaxGain, your parked ₹{Math.round(parkedSurplusAmount).toLocaleString("en-IN")} saves compounding interest daily while remaining 100% withdrawable via Net Banking and ATM for hospital emergencies, business inventory, or tax deadlines.
                </span>
              </div>
            </div>
          </CalcCard>

          {/* Amortization Table */}
          <CalcCard
            title="Yearly Balance & Savings Progression"
            description="Comparison of outstanding balances over the loan lifetime"
          >
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 sticky top-0">
                  <tr>
                    <th className="p-2">Yr</th>
                    <th className="p-2">Std Bal</th>
                    <th className="p-2">OD Bal</th>
                    <th className="p-2 text-right">Int. Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {result.yearlyComparison.map((row) => (
                    <tr key={row.year} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2 font-sans font-medium">{row.year}</td>
                      <td className="p-2">{formatCurrency(row.standardBalance)}</td>
                      <td className="p-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatCurrency(row.overdraftBalance)}
                      </td>
                      <td className="p-2 text-right text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(row.cumulativeInterestSaved)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CalcCard>
        </div>
      </div>
    </div>
  );
}
