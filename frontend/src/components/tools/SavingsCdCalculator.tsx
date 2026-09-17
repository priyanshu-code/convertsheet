"use client";

import React, { useState, useMemo } from "react";
import { PiggyBank, Landmark, ShieldCheck, AlertCircle } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSelect,
  CalcResult,
  CalcExportButton,
  CalcPromptButton,
  CalcSaveButton,
  ModernSlider,
} from "@/components/calculator";
import {
  calculateSavingsGrowth,
  CompoundingFrequency,
} from "@/lib/engines/financial-engine";
import { SavingsRatesCard } from "@/components/finance";

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

  // SheetJS formatted export rows
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
    <div className="space-y-8">
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
    </div>
  );
}
