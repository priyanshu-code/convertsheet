"use client";

import React, { useState, useMemo, useEffect } from "react";
import { PiggyBank, Table as TableIcon, Sparkles, SlidersHorizontal, ShieldCheck } from "lucide-react";
import * as XLSX from "xlsx";
import {
  CalcCard,
  CalcResult,
  CalcChart,
  CalcExportButton,
  CalcPdfReportButton,
  CalcPromptButton,
  CalcSaveButton,
  CalcShareButton,
  ModernSlider,
  SliderPreset,
  RetirementDonutBreakdown,
  RetirementWizard,
  RetirementWizardValues,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import { calculateRetirement } from "@/lib/engines/financial-engine";
import { generateRetirementDossierPdf } from "@/lib/engines/pdf-dossier-engine";
import { RetirementAccountsCard } from "@/components/finance";

export interface RetirementCalculatorProps {
  initialValues?: Partial<{
    currentAge: number;
    retirementAge: number;
    currentSavings: number;
    monthlyContribution: number;
    employerMatchPercent: number;
    annualReturn: number;
    postRetirementReturn: number;
    postRetirementAnnualSpend: number;
    inflationRate: number;
  }>;
}

const CURRENT_AGE_PRESETS: SliderPreset[] = [
  { label: "25", value: 25 },
  { label: "30", value: 30 },
  { label: "35", value: 35 },
  { label: "45", value: 45 },
];

const RETIREMENT_AGE_PRESETS: SliderPreset[] = [
  { label: "55", value: 55 },
  { label: "60", value: 60 },
  { label: "65", value: 65 },
  { label: "70", value: 70 },
];

const SAVINGS_PRESETS: SliderPreset[] = [
  { label: "$25k", value: 25000 },
  { label: "$50k", value: 50000 },
  { label: "$100k", value: 100000 },
  { label: "$250k", value: 250000 },
];

const MONTHLY_PRESETS: SliderPreset[] = [
  { label: "$250", value: 250 },
  { label: "$500", value: 500 },
  { label: "$1,000", value: 1000 },
  { label: "$2,000", value: 2000 },
];

const MATCH_PRESETS: SliderPreset[] = [
  { label: "0%", value: 0 },
  { label: "50%", value: 50 },
  { label: "100%", value: 100 },
];

const RETURN_PRESETS: SliderPreset[] = [
  { label: "6%", value: 6 },
  { label: "7%", value: 7 },
  { label: "8%", value: 8 },
  { label: "10%", value: 10 },
];

const SPEND_PRESETS: SliderPreset[] = [
  { label: "$40k", value: 40000 },
  { label: "$60k", value: 60000 },
  { label: "$80k", value: 80000 },
  { label: "$100k", value: 100000 },
];

const POST_RETURN_PRESETS: SliderPreset[] = [
  { label: "4%", value: 4 },
  { label: "5%", value: 5 },
  { label: "6%", value: 6 },
  { label: "7%", value: 7 },
];

const INFLATION_PRESETS: SliderPreset[] = [
  { label: "2%", value: 2 },
  { label: "2.5%", value: 2.5 },
  { label: "3%", value: 3 },
  { label: "4%", value: 4 },
];

export function RetirementCalculator({ initialValues }: RetirementCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();
  const [mode, setMode] = useState<"playground" | "wizard">("playground");
  const [currentAge, setCurrentAge] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("currentAge");
      if (q) return Number(q);
    }
    return initialValues?.currentAge ?? 30;
  });
  const [retirementAge, setRetirementAge] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("retirementAge");
      if (q) return Number(q);
    }
    return initialValues?.retirementAge ?? 65;
  });
  const [currentSavings, setCurrentSavings] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("currentSavings");
      if (q) return Number(q);
    }
    return initialValues?.currentSavings ?? 40000;
  });
  const [monthlyContribution, setMonthlyContribution] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("monthlyContribution");
      if (q) return Number(q);
    }
    return initialValues?.monthlyContribution ?? 750;
  });
  const [employerMatchPercent, setEmployerMatchPercent] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("employerMatchPercent");
      if (q) return Number(q);
    }
    return initialValues?.employerMatchPercent ?? 50;
  });
  const [annualReturn, setAnnualReturn] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("annualReturn");
      if (q) return Number(q);
    }
    return initialValues?.annualReturn ?? 8.0;
  });
  const [postRetirementReturn, setPostRetirementReturn] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("postRetirementReturn");
      if (q) return Number(q);
    }
    return initialValues?.postRetirementReturn ?? 5.0;
  });
  const [postRetirementAnnualSpend, setPostRetirementAnnualSpend] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("postRetirementAnnualSpend");
      if (q) return Number(q);
    }
    return initialValues?.postRetirementAnnualSpend ?? 60000;
  });
  const [inflationRate, setInflationRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("inflationRate");
      if (q) return Number(q);
    }
    return initialValues?.inflationRate ?? 2.5;
  });

  const handleWizardChange = (key: keyof RetirementWizardValues, val: number) => {
    switch (key) {
      case "currentAge":
        setCurrentAge(val);
        break;
      case "retirementAge":
        setRetirementAge(val);
        break;
      case "currentSavings":
        setCurrentSavings(val);
        break;
      case "monthlyContribution":
        setMonthlyContribution(val);
        break;
      case "employerMatchPercent":
        setEmployerMatchPercent(val);
        break;
      case "annualReturn":
        setAnnualReturn(val);
        break;
      case "inflationRate":
        setInflationRate(val);
        break;
      case "postRetirementAnnualSpend":
        setPostRetirementAnnualSpend(val);
        break;
    }
  };

  const retirement = useMemo(() => {
    return calculateRetirement({
      currentAge,
      retirementAge,
      currentSavings,
      monthlyContribution,
      employerMatchPercent,
      annualReturn,
      postRetirementReturn,
      postRetirementAnnualSpend,
      inflationRate,
    });
  }, [
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    employerMatchPercent,
    annualReturn,
    postRetirementReturn,
    postRetirementAnnualSpend,
    inflationRate,
  ]);

  // Working years and breakdown calculation
  const workingYears = Math.max(1, retirementAge - currentAge);
  const employerMatchFraction = (employerMatchPercent || 0) / 100;
  const employerMatchAmount = Math.round(monthlyContribution * employerMatchFraction * 12 * workingYears);
  const personalPrincipal = Math.max(0, retirement.totalContributions - employerMatchAmount);

  // Chart data: sample every 2-5 years to keep chart tidy
  const chartData = useMemo(() => {
    return retirement.yearlyProjection
      .filter((p) => p.age % 2 === 0 || p.age === retirementAge || p.age === currentAge)
      .map((row) => ({
        label: `Age ${row.age}`,
        Balance: Math.round(row.balance),
        Contributions: Math.round(row.totalContributed),
      }));
  }, [retirement.yearlyProjection, retirementAge, currentAge]);

  // Dynamic State Serialization (URL Permalink Engine)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (currentAge > 0) params.set("currentAge", currentAge.toString());
    if (retirementAge > 0) params.set("retirementAge", retirementAge.toString());
    if (currentSavings >= 0) params.set("currentSavings", currentSavings.toString());
    if (monthlyContribution >= 0) params.set("monthlyContribution", monthlyContribution.toString());
    if (annualReturn > 0) params.set("annualReturn", annualReturn.toString());
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn]);

  // Branded SheetJS Excel Export with live recalculation retention hook
  const handleExportExcel = () => {
    try {
      const summaryRows: (string | number)[][] = [
        ["ConvertSheet - Retirement Portfolio Nest Egg & Longevity Model", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/retirement-calculator"],
        ["", ""],
        ["--- RETIREMENT PLANNING PARAMETERS ---", ""],
        ["Current Age", currentAge],
        ["Target Retirement Age", retirementAge],
        ["Years to Retirement", workingYears],
        [`Current Retirement Savings (${currencySymbol})`, currentSavings],
        [`Monthly Contribution (${currencySymbol})`, monthlyContribution],
        ["Employer Match (%)", employerMatchPercent],
        ["Pre-Retirement Annual Return (%)", annualReturn],
        ["Post-Retirement Annual Return (%)", postRetirementReturn],
        ["Expected Inflation Rate (%)", inflationRate],
        [`Desired Annual Spend in Retirement (${currencySymbol})`, postRetirementAnnualSpend],
        ["", ""],
        ["--- NEST EGG & WITHDRAWAL OUTCOMES ---", ""],
        [`Nominal Nest Egg at Retirement (${currencySymbol})`, retirement.nestEggAtRetirement],
        [`Inflation-Adjusted Nest Egg (${currencySymbol})`, retirement.inflationAdjustedNestEgg],
        [`Total Personal Contributions (${currencySymbol})`, personalPrincipal],
        [`Employer Match Contributions (${currencySymbol})`, employerMatchAmount],
        [`Total Compound Growth Earned (${currencySymbol})`, retirement.totalInterestEarned],
        [`Sustainable 4% Rule Monthly Income (${currencySymbol})`, retirement.monthlyRetirementIncome],
        ["Portfolio Longevity (Years in Retirement)", retirement.yearsNestEggLasts],
        ["", ""],
        ["--- YEAR-BY-YEAR ACCUMULATION & DRAWDOWN SCHEDULE ---", "", "", ""],
        ["Age", "Phase", `Total Invested (${currencySymbol})`, `Portfolio Balance (${currencySymbol})`],
        ...retirement.yearlyProjection.map((r) => [
          `Age ${r.age}`,
          r.phase === "accumulation" ? "Accumulation" : "Drawdown",
          r.totalContributed,
          r.balance,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RetirementPlan");
      XLSX.writeFile(
        wb,
        `ConvertSheet_Retirement_Plan_Age${currentAge}_to_${retirementAge}.xlsx`
      );
    } catch (err) {
      console.error("Retirement Excel export failed:", err);
    }
  };

  // Exportable schedule for SheetJS
  const exportData = useMemo(() => {
    return retirement.yearlyProjection.map((row) => ({
      Age: row.age,
      Phase: row.phase === "accumulation" ? "Accumulation" : "Drawdown",
      "Total Contributed": row.totalContributed,
      "Portfolio Balance": row.balance,
    }));
  }, [retirement.yearlyProjection]);

  const aiPrompt = useMemo(() => {
    return `Analyze this comprehensive retirement planning scenario:
- Current Age: ${currentAge}
- Retirement Age: ${retirementAge} (${retirementAge - currentAge} years away)
- Current Savings: $${currentSavings.toLocaleString()}
- Monthly Contribution: $${monthlyContribution.toLocaleString()} (with ${employerMatchPercent}% employer match)
- Expected Growth Rate: ${annualReturn}% pre-retirement, ${postRetirementReturn}% post-retirement
- Expected Inflation Rate: ${inflationRate}%
- Desired Annual Retirement Spend: $${postRetirementAnnualSpend.toLocaleString()}/yr
- Projected Nest Egg at Age ${retirementAge}: $${retirement.nestEggAtRetirement.toLocaleString()}
- Inflation-Adjusted Purchasing Power: $${retirement.inflationAdjustedNestEgg.toLocaleString()}
- Total Personal Contributions: $${personalPrincipal.toLocaleString()}
- Employer Match Contributions: $${employerMatchAmount.toLocaleString()}
- Total Investment Growth: $${retirement.totalInterestEarned.toLocaleString()}
- Safe 4% Monthly Income: $${retirement.monthlyRetirementIncome.toLocaleString()}/mo
- Portfolio Longevity: Lasts ${retirement.yearsNestEggLasts} years in retirement

Assess my readiness for retirement, whether my withdrawal rate is sustainable, and suggest asset allocation or tax-advantaged strategies (e.g. Mega-backdoor Roth, HSA, 401(k) maximization).`;
  }, [
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    employerMatchPercent,
    annualReturn,
    postRetirementReturn,
    inflationRate,
    postRetirementAnnualSpend,
    retirement,
    personalPrincipal,
    employerMatchAmount,
  ]);

  return (
    <div className="space-y-8 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Reassurance Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300 w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Zero-Knowledge Client-Side Engine • No net worth or retirement data sent to servers • 100% Private</span>
      </div>

      {/* Mode Switcher Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Select your planning experience:</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/80 border border-zinc-300/40 dark:border-zinc-700/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMode("playground")}
            className={`flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all touch-manipulation cursor-pointer ${
              mode === "playground"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Playground</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("wizard")}
            className={`flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all touch-manipulation cursor-pointer ${
              mode === "wizard"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3-Step Guided Journey</span>
          </button>
        </div>
      </div>

      {mode === "wizard" ? (
        <div className="space-y-6 animate-fadeIn">
          <RetirementWizard
            values={{
              currentAge,
              retirementAge,
              currentSavings,
              monthlyContribution,
              employerMatchPercent,
              annualReturn,
              inflationRate,
              postRetirementAnnualSpend,
            }}
            onChange={handleWizardChange}
            onFinish={() => setMode("playground")}
            onSkip={() => setMode("playground")}
          />

          <RetirementDonutBreakdown
            totalNestEgg={retirement.nestEggAtRetirement}
            totalContributions={personalPrincipal}
            totalInterestEarned={retirement.totalInterestEarned}
            employerMatchAmount={employerMatchAmount}
            retirementAge={retirementAge}
          />
        </div>
      ) : (
        <CalcCard
          title="Retirement & 401(k) Nest Egg Calculator"
          subtitle="Model compound interest accumulation, employer match contributions, inflation-adjusted purchasing power, and post-retirement drawdowns."
          icon={PiggyBank}
          badge="SheetJS Export"
        >
          <div className="space-y-8">
            {/* Primary Interactive Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-6 rounded-3xl bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-800">
              <ModernSlider
                id="current-age"
                label="Current Age"
                value={currentAge}
                min={18}
                max={80}
                step={1}
                suffix="yrs"
                presets={CURRENT_AGE_PRESETS}
                onChange={setCurrentAge}
              />

              <ModernSlider
                id="retirement-age"
                label="Retirement Age"
                value={retirementAge}
                min={Math.max(30, currentAge + 1)}
                max={90}
                step={1}
                suffix="yrs"
                presets={RETIREMENT_AGE_PRESETS}
                onChange={setRetirementAge}
              />

              <ModernSlider
                id="current-savings"
                label="Current Retirement Savings"
                value={currentSavings}
                min={0}
                max={500000}
                step={5000}
                prefix={currencySymbol}
                presets={SAVINGS_PRESETS}
                onChange={setCurrentSavings}
              />

              <ModernSlider
                id="monthly-contribution"
                label="Monthly Contribution"
                value={monthlyContribution}
                min={0}
                max={10000}
                step={50}
                prefix={currencySymbol}
                suffix="/mo"
                presets={MONTHLY_PRESETS}
                onChange={setMonthlyContribution}
              />

              <ModernSlider
                id="employer-match"
                label="Employer Match"
                value={employerMatchPercent}
                min={0}
                max={100}
                step={5}
                suffix="%"
                presets={MATCH_PRESETS}
                helpText={`Matches 50% = +${currencySymbol}0.50 per ${currencySymbol}1 contributed`}
                onChange={setEmployerMatchPercent}
              />

              <ModernSlider
                id="annual-return"
                label="Expected Annual Return"
                value={annualReturn}
                min={1}
                max={15}
                step={0.5}
                suffix="%"
                presets={RETURN_PRESETS}
                helpText="Historical S&P 500 average is ~8-10%"
                onChange={setAnnualReturn}
              />
            </div>

            {/* Post-Retirement & Inflation Assumptions */}
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-3">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Retirement Drawdown & Inflation Assumptions
                </h3>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Withdrawal Phase
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ModernSlider
                  id="retirement-spend"
                  label="Desired Annual Spend"
                  value={postRetirementAnnualSpend}
                  min={10000}
                  max={250000}
                  step={5000}
                  prefix={currencySymbol}
                  presets={SPEND_PRESETS}
                  helpText="Target spending per year in retirement"
                  onChange={setPostRetirementAnnualSpend}
                />

                <ModernSlider
                  id="post-return"
                  label="Post-Retirement Return"
                  value={postRetirementReturn}
                  min={1}
                  max={12}
                  step={0.5}
                  suffix="%"
                  presets={POST_RETURN_PRESETS}
                  helpText="Typically lower risk/bonds (4-6%)"
                  onChange={setPostRetirementReturn}
                />

                <ModernSlider
                  id="inflation-rate"
                  label="Expected Inflation Rate"
                  value={inflationRate}
                  min={0}
                  max={10}
                  step={0.1}
                  suffix="%"
                  presets={INFLATION_PRESETS}
                  helpText="Historical US CPI average is ~2.5-3%"
                  onChange={setInflationRate}
                />
              </div>
            </div>

            {/* Visual Donut Breakdown */}
            <RetirementDonutBreakdown
              totalNestEgg={retirement.nestEggAtRetirement}
              totalContributions={personalPrincipal}
              totalInterestEarned={retirement.totalInterestEarned}
              employerMatchAmount={employerMatchAmount}
              retirementAge={retirementAge}
            />

            {/* Results Summary */}
            <CalcResult
              title="Projected Nest Egg & Income"
              primaryLabel="Portfolio at Retirement"
              primaryValue={formatCurrency(retirement.nestEggAtRetirement)}
              primarySubtext={`Equal to ${formatCurrency(retirement.inflationAdjustedNestEgg)} in today's purchasing power (adjusted for ${inflationRate}% inflation over ${retirementAge - currentAge} years)`}
              copyValue={`Retirement Nest Egg: ${formatCurrency(retirement.nestEggAtRetirement)} at age ${retirementAge} (${formatCurrency(retirement.monthlyRetirementIncome)}/mo safe income, Total Growth: ${formatCurrency(retirement.totalInterestEarned)})`}
              items={[
                {
                  label: "Safe Monthly Income (4% Rule)",
                  value: `${formatCurrency(retirement.monthlyRetirementIncome)}/mo`,
                  highlight: true,
                },
                {
                  label: "Personal Principal",
                  value: formatCurrency(personalPrincipal),
                },
                {
                  label: "Employer Match Contributed",
                  value: formatCurrency(employerMatchAmount),
                },
                {
                  label: "Compound Interest Growth",
                  value: formatCurrency(retirement.totalInterestEarned),
                  highlight: true,
                },
                {
                  label: "Portfolio Longevity",
                  value:
                    retirement.yearsNestEggLasts >= 35
                      ? "35+ Years (Indefinite)"
                      : `${retirement.yearsNestEggLasts} Years`,
                  badge:
                    retirement.yearsNestEggLasts >= 30 ? "Fully Funded" : "Shortfall Warning",
                },
              ]}
            />

            {/* Action Buttons: SheetJS Export & AI Prompt */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 touch-manipulation cursor-pointer"
                >
                  <span>Export to Excel (.xlsx)</span>
                </button>

                <CalcPdfReportButton
                  filename={`retirement_dossier_age_${retirementAge}.pdf`}
                  label="Download Retirement Dossier (PDF)"
                  onGenerate={() =>
                    generateRetirementDossierPdf({
                      currentAge,
                      retirementAge,
                      currentSavings,
                      monthlyContribution,
                      annualReturnPercent: annualReturn,
                      nestEggAtRetirement: retirement.nestEggAtRetirement,
                      totalContributions: retirement.totalContributions,
                      compoundGrowthEarned: retirement.totalInterestEarned,
                      monthlyRetirementIncome: retirement.monthlyRetirementIncome,
                    })
                  }
                />

                <CalcSaveButton
                  toolSlug="retirement-calculator"
                  toolName="Retirement Calculator"
                  summaryTitle={`Retire at age ${retirementAge} (${retirement.yearsNestEggLasts >= 35 ? "Fully Funded" : `${retirement.yearsNestEggLasts} yrs`})`}
                  summaryMetrics={[
                    { label: "Nest Egg", value: formatCurrency(retirement.nestEggAtRetirement) },
                    { label: "Safe Income", value: `${formatCurrency(retirement.monthlyRetirementIncome)}/mo` },
                    { label: "Retire Age", value: `Age ${retirementAge}` },
                    { label: "Monthly Save", value: formatCurrency(monthlyContribution) },
                  ]}
                />

                <CalcShareButton
                  state={{
                    currentAge,
                    retirementAge,
                    currentSavings,
                    monthlyContribution,
                    employerMatchPercent,
                    annualReturn,
                    postRetirementReturn,
                    postRetirementAnnualSpend,
                    inflationRate,
                  }}
                  label="Share Plan"
                />
              </div>

              <CalcPromptButton
                prompt={aiPrompt}
                label="Ask AI to Analyze Plan"
              />
            </div>

            {/* Visual Accumulation & Drawdown Curve */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Portfolio Growth & Drawdown Curve (Age {currentAge} to 100)
              </h3>
              <CalcChart
                data={chartData}
                xAxisKey="label"
                valuePrefix="$"
                series={[
                  {
                    key: "Balance",
                    name: "Portfolio Balance ($)",
                    color: "#10b981",
                  },
                  {
                    key: "Contributions",
                    name: "Total Contributions ($)",
                    color: "#6366f1",
                  },
                ]}
                height={280}
              />
            </div>

            {/* Projected Milestone Table */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <TableIcon className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold">5-Year Portfolio Milestones</h3>
              </div>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th className="py-2.5 px-3">Age</th>
                      <th className="py-2.5 px-3">Phase</th>
                      <th className="py-2.5 px-3">Total Invested</th>
                      <th className="py-2.5 px-3">Portfolio Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {retirement.yearlyProjection
                      .filter((p) => p.age % 5 === 0 || p.age === retirementAge)
                      .map((row) => (
                        <tr
                          key={row.age}
                          className={
                            row.age === retirementAge
                              ? "bg-emerald-50/70 dark:bg-emerald-950/20 font-bold text-emerald-700 dark:text-emerald-400"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                          }
                        >
                          <td className="py-2 px-3">Age {row.age}</td>
                          <td className="py-2 px-3 capitalize">
                            {row.age === retirementAge ? "★ Retirement Target" : row.phase}
                          </td>
                          <td className="py-2 px-3">${row.totalContributed.toLocaleString()}</td>
                          <td className="py-2 px-3">${row.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CalcCard>
      )}

      <RetirementAccountsCard monthlySavings={monthlyContribution} />

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Nest Egg at Age {retirementAge}</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(retirement.nestEggAtRetirement)}
          </span>
          <span className="text-[11px] text-zinc-500 block">
            Safe Income: {formatCurrency(retirement.monthlyRetirementIncome)}/mo
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors touch-manipulation cursor-pointer"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}
