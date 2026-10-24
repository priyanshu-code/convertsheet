"use client";

import React, { useState, useMemo, useEffect } from "react";
import { PiggyBank, Landmark, ShieldCheck, AlertCircle, FileSpreadsheet } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSelect,
  CalcResult,
  CalcExportButton,
  CalcPromptButton,
  CalcSaveButton,
  CalcShareButton,
  ModernSlider,
} from "@/components/calculator";
import {
  calculateSavingsGrowth,
  CompoundingFrequency,
} from "@/lib/engines/financial-engine";
import { SavingsRatesCard } from "@/components/finance";
import * as XLSX from "xlsx";

export interface SavingsCdCalculatorProps {
  initialValues?: Partial<{
    initialDeposit: number;
    monthlyContribution: number;
    annualInterestRate: number;
    termMonths: number;
    compoundingFrequency: CompoundingFrequency;
    cdEarlyPenaltyMonths: number;
  }>;
}

export function SavingsCdCalculator({
  initialValues,
}: SavingsCdCalculatorProps = {}) {
  const [mode, setMode] = useState<"hysa" | "cd">("hysa");
  const [initialDeposit, setInitialDeposit] = useState<number>(
    Number(initialValues?.initialDeposit) || 10000
  );
  const [monthlyContribution, setMonthlyContribution] = useState<number>(
    Number(initialValues?.monthlyContribution) || 250
  );
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(
    Number(initialValues?.annualInterestRate) || 4.5
  );
  const [termMonths, setTermMonths] = useState<number>(
    Number(initialValues?.termMonths) || 12
  );
  const [compoundingFrequency, setCompoundingFrequency] =
    useState<CompoundingFrequency>(
      initialValues?.compoundingFrequency || "daily"
    );
  const [cdEarlyPenaltyMonths, setCdEarlyPenaltyMonths] = useState<number>(
    Number(initialValues?.cdEarlyPenaltyMonths) || 3
  );

  const result = useMemo(() => {
    return calculateSavingsGrowth({
      initialDeposit,
      monthlyContribution: mode === "cd" ? 0 : monthlyContribution,
      annualInterestRate,
      termMonths,
      compoundingFrequency,
      cdEarlyPenaltyMonths: mode === "cd" ? cdEarlyPenaltyMonths : 0,
    });
  }, [
    initialDeposit,
    monthlyContribution,
    annualInterestRate,
    termMonths,
    compoundingFrequency,
    cdEarlyPenaltyMonths,
    mode,
  ]);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("mode", mode);
    params.set("initialDeposit", initialDeposit.toString());
    params.set("monthlyContribution", monthlyContribution.toString());
    params.set("annualInterestRate", annualInterestRate.toString());
    params.set("termMonths", termMonths.toString());
    params.set("compoundingFrequency", compoundingFrequency);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [mode, initialDeposit, monthlyContribution, annualInterestRate, termMonths, compoundingFrequency]);

  // Branded SheetJS Excel Export with Retention Hook
  const handleExportExcel = () => {
    try {
      const summaryRows = [
        ["ConvertSheet - Savings Growth & CD Yield Audit", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/high-yield-savings-cd-calculator"],
        ["", ""],
        ["--- ACCOUNT CONFIGURATION ---", ""],
        ["Account Type", mode === "hysa" ? "High-Yield Savings Account (HYSA)" : "Certificate of Deposit (CD)"],
        ["Initial Principal Deposit", initialDeposit],
        ["Monthly Contribution", mode === "hysa" ? monthlyContribution : 0],
        ["Quoted Interest Rate", `${annualInterestRate}%`],
        ["Effective APY", `${result.effectiveApy}%`],
        ["Compounding Frequency", compoundingFrequency],
        ["Term Horizon", `${termMonths} Months (${(termMonths / 12).toFixed(1)} Years)`],
        ["", ""],
        ["--- GROWTH & YIELD SUMMARY ---", ""],
        ["Total Principal Invested", result.initialDeposit + result.totalContributions],
        ["Total Interest Earned", Math.round(result.totalInterestEarned)],
        ["Final Ending Balance", Math.round(result.finalBalance)],
        ...(mode === "cd"
          ? [
              ["Early Withdrawal Penalty", Math.round(result.earlyWithdrawalPenalty)],
              ["Net Balance If Broken Early", Math.round(result.netBalanceAfterEarlyPenalty)],
            ]
          : []),
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      // Transparent Excel formulas with retention links
      wsSummary["B15"] = { t: "n", f: `B7+(B8*${termMonths})`, v: result.initialDeposit + result.totalContributions };
      wsSummary["B17"] = { t: "n", f: "B15+B16", v: Math.round(result.finalBalance) };

      const scheduleHeader = [
        "Month",
        "Starting Balance ($)",
        "Monthly Deposit ($)",
        "Interest Earned ($)",
        "Cumulative Interest ($)",
        "Ending Balance ($)",
      ];
      const scheduleRows = result.monthlySchedule.map((row) => [
        row.month,
        row.startingBalance,
        row.contribution,
        row.interestEarned,
        row.totalInterestEarned,
        row.endingBalance,
      ]);
      const wsSchedule = XLSX.utils.aoa_to_sheet([scheduleHeader, ...scheduleRows]);

      // Add dynamic formula links across monthly rows
      result.monthlySchedule.forEach((row, idx) => {
        const rowNum = idx + 2;
        wsSchedule[`F${rowNum}`] = { t: "n", f: `B${rowNum}+C${rowNum}+D${rowNum}`, v: row.endingBalance };
        if (idx > 0) {
          wsSchedule[`B${rowNum}`] = { t: "n", f: `F${rowNum - 1}`, v: row.startingBalance };
          wsSchedule[`E${rowNum}`] = { t: "n", f: `E${rowNum - 1}+D${rowNum}`, v: row.totalInterestEarned };
        }
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSummary, "YieldSummary");
      XLSX.utils.book_append_sheet(wb, wsSchedule, "GrowthSchedule");
      XLSX.writeFile(wb, `ConvertSheet_${mode.toUpperCase()}_Growth_${initialDeposit}.xlsx`);
    } catch (err) {
      console.error("Export to Excel failed:", err);
    }
  };

  // SheetJS formatted export rows for backwards compatibility
  const exportData = useMemo(() => {
    return result.monthlySchedule.map((row) => ({
      Month: row.month,
      "Starting Balance": `$${row.startingBalance.toFixed(2)}`,
      Contribution: `$${row.contribution.toFixed(2)}`,
      "Interest Earned": `$${row.interestEarned.toFixed(2)}`,
      "Cumulative Interest": `$${row.totalInterestEarned.toFixed(2)}`,
      "Ending Balance": `$${row.endingBalance.toFixed(2)}`,
    }));
  }, [result]);

  const aiPrompt = useMemo(() => {
    return `Evaluate this savings growth scenario:
- Account Type: ${mode === "hysa" ? "High-Yield Savings Account (HYSA)" : "Certificate of Deposit (CD)"}
- Initial Balance: $${initialDeposit.toLocaleString()}
${mode === "hysa" ? `- Monthly Deposits: $${monthlyContribution}/month` : ""}
- Quoted Rate: ${annualInterestRate}% (Effective APY: ${result.effectiveApy}%)
- Compounding: ${compoundingFrequency}
- Term Horizon: ${termMonths} months (${(termMonths / 12).toFixed(1)} years)
- Results:
  • Total Interest Earned: $${result.totalInterestEarned.toLocaleString()}
  • Ending Balance: $${result.finalBalance.toLocaleString()}
${mode === "cd" ? `  • Early Withdrawal Penalty: $${result.earlyWithdrawalPenalty.toLocaleString()}` : ""}
Please analyze inflation-adjusted real returns, rate-cut protection strategies, and CD laddering recommendations.`;
  }, [mode, initialDeposit, monthlyContribution, annualInterestRate, compoundingFrequency, termMonths, result]);

  return (
    <div className="space-y-8 pb-32 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side • Zero Server Storage • Private & Free Forever</span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="font-medium">
          Updated for October 2026: Top Online HYSAs 4.15%–4.60% APY • 1-Year CDs 4.25%–4.85% APY • 10-Year US Treasury 5.00% (Fed Funds 4.00%)
        </span>
      </div>

      {/* Account Type Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {mode === "hysa" ? (
            <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          )}
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Account Structure:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("hysa")}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === "hysa"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
            }`}
          >
            High-Yield Savings (Liquid + Ongoing Deposits)
          </button>
          <button
            type="button"
            onClick={() => setMode("cd")}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === "cd"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
            }`}
          >
            Certificate of Deposit (Fixed Rate + Lockup)
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Inputs */}
        <div className="space-y-6 lg:col-span-6">
          <CalcCard
            title={mode === "hysa" ? "Savings Deposits & Rate" : "CD Deposit & Fixed Term"}
            subtitle="Configure your initial principal, interest rate, and compounding intervals."
          >
            <div className="space-y-6">
              {/* Initial Deposit */}
              <div className="space-y-3">
                <CalcInput
                  id="initialDeposit"
                  label="Initial Principal Deposit"
                  value={initialDeposit}
                  onChange={(val) => setInitialDeposit(Number(val) || 0)}
                  prefix="$"
                  min={100}
                  max={2000000}
                  step={500}
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Quick:</span>
                  {[
                    { label: "$5k", val: 5000 },
                    { label: "$10k", val: 10000 },
                    { label: "$25k", val: 25000 },
                    { label: "$50k", val: 50000 },
                    { label: "$100k", val: 100000 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setInitialDeposit(p.val)}
                      className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-all touch-manipulation ${
                        initialDeposit === p.val
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <ModernSlider
                  id="initialDepositSlider"
                  label="Initial Deposit"
                  value={initialDeposit}
                  min={500}
                  max={100000}
                  step={500}
                  prefix="$"
                  onChange={setInitialDeposit}
                />
              </div>

              {/* Monthly Contribution (Only for HYSA) */}
              {mode === "hysa" && (
                <div className="space-y-3">
                  <CalcInput
                    id="monthlyContribution"
                    label="Monthly Recurring Contribution"
                    value={monthlyContribution}
                    onChange={(val) => setMonthlyContribution(Number(val) || 0)}
                    prefix="$"
                    min={0}
                    max={20000}
                    step={50}
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Deposit:</span>
                    {[0, 100, 250, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMonthlyContribution(amt)}
                        className={`min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-all touch-manipulation ${
                          monthlyContribution === amt
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <ModernSlider
                    id="monthlyContributionSlider"
                    label="Monthly Contribution"
                    value={monthlyContribution}
                    min={0}
                    max={2500}
                    step={25}
                    prefix="$"
                    onChange={setMonthlyContribution}
                  />
                </div>
              )}

              {/* Annual Interest Rate (APY) */}
              <div className="space-y-3">
                <CalcInput
                  id="annualInterestRate"
                  label="Annual Interest Rate (APY / APR)"
                  value={annualInterestRate}
                  onChange={(val) => setAnnualInterestRate(Number(val) || 0)}
                  suffix="%"
                  min={0.1}
                  max={20}
                  step={0.05}
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Institutional Benchmarks:</span>
                  {[
                    { label: "4.15% (Top HYSA)", r: 4.15 },
                    { label: "4.25% (1-Yr CD)", r: 4.25 },
                    { label: "3.75% (T-Bill)", r: 3.75 },
                    { label: "4.50% (Promo APY)", r: 4.50 },
                    { label: "4.85% (Peak CD)", r: 4.85 },
                    { label: "5.00% (10Y Yield)", r: 5.00 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAnnualInterestRate(p.r)}
                      className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-all touch-manipulation ${
                        annualInterestRate === p.r
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <ModernSlider
                  id="annualInterestRateSlider"
                  label="Interest Rate"
                  value={annualInterestRate}
                  min={1}
                  max={8}
                  step={0.1}
                  suffix="%"
                  onChange={setAnnualInterestRate}
                />
              </div>

              {/* Term Horizon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CalcSelect
                  id="termMonths"
                  label="Growth Horizon"
                  value={String(termMonths)}
                  onChange={(val) => setTermMonths(Number(val))}
                  options={[
                    { value: "6", label: "6 Months" },
                    { value: "12", label: "12 Months (1 Year)" },
                    { value: "24", label: "24 Months (2 Years)" },
                    { value: "36", label: "36 Months (3 Years)" },
                    { value: "60", label: "60 Months (5 Years)" },
                  ]}
                />
                <CalcSelect
                  id="compoundingFrequency"
                  label="Compounding Frequency"
                  value={compoundingFrequency}
                  onChange={(val) => setCompoundingFrequency(val as CompoundingFrequency)}
                  options={[
                    { value: "daily", label: "Daily (Standard HYSA)" },
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "annually", label: "Annually" },
                  ]}
                />
              </div>

              {/* CD Early Withdrawal Penalty Selector */}
              {mode === "cd" && (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>CD Early Withdrawal Penalty Rule</span>
                  </div>
                  <CalcSelect
                    id="cdEarlyPenaltyMonths"
                    label=""
                    value={String(cdEarlyPenaltyMonths)}
                    onChange={(v) => setCdEarlyPenaltyMonths(Number(v))}
                    options={[
                      { value: "1", label: "1 Month of Simple Interest" },
                      { value: "3", label: "3 Months of Simple Interest (90 Days)" },
                      { value: "6", label: "6 Months of Simple Interest (180 Days)" },
                      { value: "12", label: "12 Months of Simple Interest" },
                    ]}
                  />
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                    If cashed out prior to maturity, most banks penalize principal or earned interest by 90 to 180 days of simple interest.
                  </p>
                </div>
              )}
            </div>
          </CalcCard>
        </div>

        {/* Right Column: Results & Highlights */}
        <div className="space-y-6 lg:col-span-6">
          <CalcCard
            title="Projected Compound Growth"
            subtitle="Principal accumulation, interest yield, and final balance."
          >
            <div className="space-y-6">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-950/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Final Balance
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
                    ${Math.round(result.finalBalance).toLocaleString()}
                  </div>
                  <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    After {termMonths} months
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Total Interest Earned
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-zinc-900 dark:text-white">
                    +${Math.round(result.totalInterestEarned).toLocaleString()}
                  </div>
                  <span className="mt-1 block text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {result.effectiveApy}% Effective APY
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="pt-2">
                <CalcResult
                  columns={2}
                  copyValue={`${mode === "hysa" ? "HYSA" : "CD"} Final Balance: $${Math.round(result.finalBalance).toLocaleString()} | Total Interest Earned: +$${Math.round(result.totalInterestEarned).toLocaleString()} | APY: ${result.effectiveApy}% (${termMonths} months)`}
                  items={[
                    {
                      label: "Initial Deposit",
                      value: `$${Math.round(result.initialDeposit).toLocaleString()}`,
                      subtext: "Starting principal",
                    },
                    ...(mode === "hysa"
                      ? [
                          {
                            label: "Total Additional Contributions",
                            value: `$${Math.round(result.totalContributions).toLocaleString()}`,
                            subtext: `${termMonths} monthly deposits of $${monthlyContribution}`,
                          },
                        ]
                      : []),
                    {
                      label: "Total Principal Invested",
                      value: `$${Math.round(result.initialDeposit + result.totalContributions).toLocaleString()}`,
                      subtext: "Your total out-of-pocket savings",
                    },
                    ...(mode === "cd"
                      ? [
                          {
                            label: "Early Withdrawal Penalty",
                            value: `-$${Math.round(result.earlyWithdrawalPenalty).toLocaleString()}`,
                            subtext: `${cdEarlyPenaltyMonths} months interest forfeit if broken early`,
                          },
                          {
                            label: "Net Balance If Broken Early",
                            value: `$${Math.round(result.netBalanceAfterEarlyPenalty).toLocaleString()}`,
                            subtext: "Guaranteed minimum liquid cash",
                          },
                        ]
                      : []),
                  ]}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
                <CalcExportButton
                  filename={`savings-growth-schedule-${mode}`}
                  sheetName="GrowthSchedule"
                  data={exportData}
                  label="Export Schedule to Excel (.xlsx)"
                />
                <CalcSaveButton
                  toolSlug="high-yield-savings-cd-calculator"
                  toolName="High-Yield Savings & CD Calculator"
                  summaryTitle={`${mode === "hysa" ? "HYSA" : "CD"}: $${initialDeposit.toLocaleString()} at ${annualInterestRate}% APY`}
                  summaryMetrics={[
                    { label: "Final Balance", value: `$${Math.round(result.finalBalance).toLocaleString()}` },
                    { label: "Interest Earned", value: `+$${Math.round(result.totalInterestEarned).toLocaleString()}` },
                    { label: "APY", value: `${result.effectiveApy}%` },
                    { label: "Horizon", value: `${termMonths} mos` },
                  ]}
                />
                <CalcShareButton
                  state={{
                    mode,
                    initialDeposit,
                    monthlyContribution,
                    annualInterestRate,
                    termMonths,
                    compoundingFrequency,
                  }}
                />
                <CalcPromptButton prompt={aiPrompt} label="Analyze Yield with AI" />
              </div>
            </div>
          </CalcCard>
        </div>
      </div>

      {/* Benchmark Rates & High-Yield Yields Card */}
      <div className="mt-8">
        <SavingsRatesCard depositAmount={initialDeposit} />
      </div>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
            {mode === "hysa" ? "Final Balance" : "CD Maturity Balance"}
          </span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            ${Math.round(result.finalBalance).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-xs"
          >
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}
