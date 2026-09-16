"use client";

import React, { useState, useMemo } from "react";
import { PiggyBank, Table as TableIcon } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcResult,
  CalcChart,
  CalcExportButton,
  CalcPromptButton,
} from "@/components/calculator";
import { calculateRetirement } from "@/lib/engines/financial-engine";
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

export function RetirementCalculator({ initialValues }: RetirementCalculatorProps = {}) {
  const [currentAge, setCurrentAge] = useState<number>(Number(initialValues?.currentAge) || 30);
  const [retirementAge, setRetirementAge] = useState<number>(Number(initialValues?.retirementAge) || 65);
  const [currentSavings, setCurrentSavings] = useState<number>(Number(initialValues?.currentSavings) ?? 40000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(Number(initialValues?.monthlyContribution) ?? 750);
  const [employerMatchPercent, setEmployerMatchPercent] = useState<number>(Number(initialValues?.employerMatchPercent) ?? 50);
  const [annualReturn, setAnnualReturn] = useState<number>(Number(initialValues?.annualReturn) || 8.0);
  const [postRetirementReturn, setPostRetirementReturn] = useState<number>(Number(initialValues?.postRetirementReturn) || 5.0);
  const [postRetirementAnnualSpend, setPostRetirementAnnualSpend] = useState<number>(Number(initialValues?.postRetirementAnnualSpend) || 60000);
  const [inflationRate, setInflationRate] = useState<number>(Number(initialValues?.inflationRate) || 2.5);

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
- Total Personal Contributions: $${retirement.totalContributions.toLocaleString()}
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
  ]);

  return (
    <div className="space-y-8">
      <CalcCard
        title="Retirement &amp; 401(k) Nest Egg Calculator"
      subtitle="Model compound interest accumulation, employer match contributions, inflation-adjusted purchasing power, and post-retirement drawdowns."
      icon={PiggyBank}
      badge="SheetJS Export"
    >
      <div className="space-y-6">
        {/* Accumulation Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CalcInput
            id="current-age"
            label="Current Age"
            value={currentAge}
            onChange={(val) => setCurrentAge(Number(val) || 18)}
            type="number"
            min={18}
            max={80}
            step={1}
            suffix="yrs"
          />

          <CalcInput
            id="retirement-age"
            label="Retirement Age"
            value={retirementAge}
            onChange={(val) => setRetirementAge(Number(val) || 65)}
            type="number"
            min={currentAge + 1}
            max={90}
            step={1}
            suffix="yrs"
          />

          <CalcInput
            id="current-savings"
            label="Current Savings / 401(k)"
            value={currentSavings}
            onChange={(val) => setCurrentSavings(Number(val) || 0)}
            type="number"
            min={0}
            step={5000}
            prefix="$"
          />

          <CalcInput
            id="monthly-contribution"
            label="Monthly Contribution"
            value={monthlyContribution}
            onChange={(val) => setMonthlyContribution(Number(val) || 0)}
            type="number"
            min={0}
            step={50}
            prefix="$"
          />

          <CalcInput
            id="employer-match"
            label="Employer Match"
            value={employerMatchPercent}
            onChange={(val) => setEmployerMatchPercent(Number(val) || 0)}
            type="number"
            min={0}
            max={100}
            step={5}
            suffix="%"
            helpText="Matches 50% = +$0.50 per $1 contributed"
          />

          <CalcInput
            id="annual-return"
            label="Expected Annual Return"
            value={annualReturn}
            onChange={(val) => setAnnualReturn(Number(val) || 0)}
            type="number"
            min={1}
            max={15}
            step={0.5}
            suffix="%"
            helpText="Historical S&P 500 average is ~8-10%"
          />
        </div>

        {/* Post-Retirement & Inflation Assumptions */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
            Retirement Drawdown &amp; Inflation Assumptions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CalcInput
              id="retirement-spend"
              label="Desired Annual Spend"
              value={postRetirementAnnualSpend}
              onChange={(val) => setPostRetirementAnnualSpend(Number(val) || 0)}
              type="number"
              min={10000}
              step={5000}
              prefix="$"
              helpText="Target spending per year in retirement"
            />

            <CalcInput
              id="post-return"
              label="Post-Retirement Return"
              value={postRetirementReturn}
              onChange={(val) => setPostRetirementReturn(Number(val) || 0)}
              type="number"
              min={1}
              max={12}
              step={0.5}
              suffix="%"
              helpText="Typically lower risk/bonds (4-6%)"
            />

            <CalcInput
              id="inflation-rate"
              label="Expected Inflation Rate"
              value={inflationRate}
              onChange={(val) => setInflationRate(Number(val) || 0)}
              type="number"
              min={0}
              max={10}
              step={0.1}
              suffix="%"
              helpText="Historical US CPI average is ~2.5-3%"
            />
          </div>
        </div>

        {/* Results Summary */}
        <CalcResult
          title="Projected Nest Egg &amp; Income"
          primaryLabel="Portfolio at Retirement"
          primaryValue={`$${retirement.nestEggAtRetirement.toLocaleString()}`}
          primarySubtext={`Equal to $${retirement.inflationAdjustedNestEgg.toLocaleString()} in today's purchasing power (adjusted for ${inflationRate}% inflation over ${retirementAge - currentAge} years)`}
          items={[
            {
              label: "Safe Monthly Income (4% Rule)",
              value: `$${retirement.monthlyRetirementIncome.toLocaleString()}/mo`,
              highlight: true,
            },
            {
              label: "Total Principal Contributed",
              value: `$${retirement.totalContributions.toLocaleString()}`,
            },
            {
              label: "Compound Interest Growth",
              value: `$${retirement.totalInterestEarned.toLocaleString()}`,
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
          <CalcExportButton
            data={exportData}
            filename={`retirement-plan-age-${retirementAge}`}
            sheetName="Retirement Projection"
          />

          <CalcPromptButton
            prompt={aiPrompt}
            label="Ask AI to Analyze Plan"
          />
        </div>

        {/* Visual Accumulation & Drawdown Curve */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Portfolio Growth &amp; Drawdown Curve (Age {currentAge} to 100)
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
            <span>5-Year Portfolio Milestones</span>
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

    <RetirementAccountsCard monthlySavings={monthlyContribution} />
  </div>
  );
}
