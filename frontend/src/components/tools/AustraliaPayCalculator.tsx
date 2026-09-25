"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DollarSign } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
  CalcExportButton,
  CalcShareButton,
  CalcSaveButton,
  CalcPromptButton,
} from "@/components/calculator";
import {
  calculateAustraliaSalary,
  AustraliaSalaryResult,
} from "@/lib/engines/financial-engine";

export interface AustraliaPayCalculatorProps {
  initialValues?: Partial<{
    grossSalary: number;
    superannuationPercent: number;
    hasHelpDebt: boolean;
    medicareExempt: boolean;
  }>;
}

const PRESET_SALARIES = [
  { label: "$60k", value: 60000 },
  { label: "$75k", value: 75000 },
  { label: "$90k", value: 90000 },
  { label: "$120k", value: 120000 },
  { label: "$150k", value: 150000 },
  { label: "$180k", value: 180000 },
];

export function AustraliaPayCalculator({
  initialValues,
}: AustraliaPayCalculatorProps = {}) {
  const [grossSalary, setGrossSalary] = useState<number>(() => {
    if (initialValues?.grossSalary !== undefined) return initialValues.grossSalary;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("grossSalary");
      if (q) return Number(q);
    }
    return 90000;
  });

  const [superannuationPercent, setSuperannuationPercent] = useState<number>(
    () => {
      if (initialValues?.superannuationPercent !== undefined) {
        return initialValues.superannuationPercent;
      }
      if (typeof window !== "undefined") {
        const q = new URLSearchParams(window.location.search).get(
          "superannuationPercent"
        );
        if (q) return Number(q);
      }
      return 11.5;
    }
  );

  const [hasHelpDebt, setHasHelpDebt] = useState<boolean>(() => {
    if (initialValues?.hasHelpDebt !== undefined) {
      return initialValues.hasHelpDebt;
    }
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("hasHelpDebt");
      if (q !== null) return q === "true" || q === "1";
    }
    return false;
  });

  const [medicareExempt, setMedicareExempt] = useState<boolean>(() => {
    if (initialValues?.medicareExempt !== undefined) {
      return initialValues.medicareExempt;
    }
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("medicareExempt");
      if (q !== null) return q === "true" || q === "1";
    }
    return false;
  });

  const result: AustraliaSalaryResult = useMemo(() => {
    return calculateAustraliaSalary({
      grossSalary,
      superannuationPercent,
      hasHelpDebt,
      medicareExempt,
    });
  }, [grossSalary, superannuationPercent, hasHelpDebt, medicareExempt]);

  const chartData = useMemo(() => {
    const data = [
      { label: "Net Take-Home", amount: result.netAnnualTakeHome },
      { label: "ATO Income Tax", amount: result.incomeTax },
      { label: "Medicare Levy", amount: result.medicareLevy },
    ];
    if (result.helpRepayment > 0) {
      data.push({ label: "HELP Repayment", amount: result.helpRepayment });
    }
    data.push({ label: "Employer Super", amount: result.superannuationAmount });
    return data;
  }, [result]);

  const exportSchedule = useMemo(() => {
    return [
      {
        Category: "Gross Salary",
        "Annual ($ AUD)": result.grossSalary,
        Monthly: result.monthlyGross,
        "Fortnightly (26x)": result.fortnightlyGross,
        "Weekly (52x)": result.weeklyGross,
      },
      {
        Category: "ATO Income Tax",
        "Annual ($ AUD)": result.incomeTax,
        Monthly: Math.round((result.incomeTax / 12) * 100) / 100,
        "Fortnightly (26x)": Math.round((result.incomeTax / 26) * 100) / 100,
        "Weekly (52x)": Math.round((result.incomeTax / 52) * 100) / 100,
      },
      {
        Category: "Medicare Levy (2%)",
        "Annual ($ AUD)": result.medicareLevy,
        Monthly: Math.round((result.medicareLevy / 12) * 100) / 100,
        "Fortnightly (26x)": Math.round((result.medicareLevy / 26) * 100) / 100,
        "Weekly (52x)": Math.round((result.medicareLevy / 52) * 100) / 100,
      },
      ...(result.helpRepayment > 0
        ? [
            {
              Category: "HELP / HECS Repayment",
              "Annual ($ AUD)": result.helpRepayment,
              Monthly: Math.round((result.helpRepayment / 12) * 100) / 100,
              "Fortnightly (26x)":
                Math.round((result.helpRepayment / 26) * 100) / 100,
              "Weekly (52x)":
                Math.round((result.helpRepayment / 52) * 100) / 100,
            },
          ]
        : []),
      {
        Category: "Total Deductions",
        "Annual ($ AUD)": result.totalDeductions,
        Monthly: Math.round((result.totalDeductions / 12) * 100) / 100,
        "Fortnightly (26x)":
          Math.round((result.totalDeductions / 26) * 100) / 100,
        "Weekly (52x)": Math.round((result.totalDeductions / 52) * 100) / 100,
      },
      {
        Category: "Net Take-Home Pay",
        "Annual ($ AUD)": result.netAnnualTakeHome,
        Monthly: result.netMonthlyTakeHome,
        "Fortnightly (26x)": result.netFortnightlyTakeHome,
        "Weekly (52x)": result.netWeeklyTakeHome,
      },
      {
        Category: `Employer Superannuation (${superannuationPercent}%)`,
        "Annual ($ AUD)": result.superannuationAmount,
        Monthly: Math.round((result.superannuationAmount / 12) * 100) / 100,
        "Fortnightly (26x)":
          Math.round((result.superannuationAmount / 26) * 100) / 100,
        "Weekly (52x)":
          Math.round((result.superannuationAmount / 52) * 100) / 100,
      },
    ];
  }, [result, superannuationPercent]);

  const formatCurrency = (val: number): string => {
    return `$${val.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const llmPrompt = useMemo(() => {
    return `Analyze my Australian Pay & Take-Home breakdown (2024-25 ATO Stage 3 Tax Cuts):
- Gross Annual Salary: $${result.grossSalary.toLocaleString()} AUD
- Employer Superannuation: ${superannuationPercent}% ($${result.superannuationAmount.toLocaleString()}/yr)
- HELP / HECS Debt Repayment: ${hasHelpDebt ? `$${result.helpRepayment.toLocaleString()}/yr` : "None"}
- Medicare Levy: $${result.medicareLevy.toLocaleString()}/yr ${medicareExempt ? "(Exempt)" : ""}
- ATO Income Tax: $${result.incomeTax.toLocaleString()}/yr
- Total Deductions: $${result.totalDeductions.toLocaleString()}/yr
- Net Fortnightly Take-Home: $${result.netFortnightlyTakeHome.toLocaleString()}/fortnight
- Net Monthly Take-Home: $${result.netMonthlyTakeHome.toLocaleString()}/mo
- Net Annual Take-Home: $${result.netAnnualTakeHome.toLocaleString()}/yr
- Effective Tax Rate: ${result.effectiveTaxRate}%

Please advise on Australian tax strategies (concessional super contributions, salary sacrifice, deductions, and division 293 / Medicare levy surcharge considerations).`;
  }, [result, superannuationPercent, hasHelpDebt, medicareExempt]);

  return (
    <CalcCard
      title="Australia Pay & Salary Take-Home Calculator (ATO 2024-25)"
      subtitle="Calculate your exact Australian take-home pay under the new Stage 3 tax cuts, including Medicare Levy, HELP/HECS student loan repayments, and superannuation guarantee."
      icon={DollarSign}
      badge="ATO 2024-25 Stage 3 Tax Cuts"
    >
      {/* Country cross-link navigation hub */}
      <div className="flex items-center justify-start pb-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          <Link
            href="/tools/salary-calculator"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <span>🇺🇸</span>
            <span>US Paycheck</span>
          </Link>
          <Link
            href="/tools/uk-salary-calculator"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <span>🇬🇧</span>
            <span>UK Salary</span>
          </Link>
          <Link
            href="/tools/canada-paycheck-calculator"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <span>🇨🇦</span>
            <span>Canada Paycheck</span>
          </Link>
          <div className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs flex items-center gap-1.5">
            <span>🇦🇺</span>
            <span>Australia Pay</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <CalcInput
              id="gross-salary"
              label="Gross Annual Salary"
              value={grossSalary}
              onChange={(val) => setGrossSalary(Number(val) || 0)}
              prefix="$"
              min={0}
              max={2000000}
              step={1000}
              helpText="Your total annual base taxable income in Australian Dollars ($ AUD)"
            />
            {/* Quick presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Presets:</span>
              {PRESET_SALARIES.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setGrossSalary(preset.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    grossSalary === preset.value
                      ? "bg-emerald-500 text-white border-emerald-500 dark:border-emerald-600"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <CalcSlider
            id="superannuation-percent"
            label="Employer Superannuation Guarantee"
            value={superannuationPercent}
            onChange={setSuperannuationPercent}
            min={9}
            max={15}
            step={0.5}
            unit="%"
            helpText="Statutory employer superannuation contribution (standard 11.5% for 2024-25)"
          />

          <div className="space-y-4 pt-1">
            {/* HELP / HECS Student Debt Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 shadow-xs">
              <div className="space-y-0.5">
                <label
                  htmlFor="has-help-debt"
                  className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  HELP / HECS Student Debt
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Include compulsory Higher Education Loan repayment
                </p>
              </div>
              <input
                id="has-help-debt"
                type="checkbox"
                checked={hasHelpDebt}
                onChange={(e) => setHasHelpDebt(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm border-zinc-300 dark:border-zinc-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Medicare Levy Exemption Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 shadow-xs">
              <div className="space-y-0.5">
                <label
                  htmlFor="medicare-exempt"
                  className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Exempt from 2% Medicare Levy
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Full exemption for eligible medical, diplomatic, or non-resident status
                </p>
              </div>
              <input
                id="medicare-exempt"
                type="checkbox"
                checked={medicareExempt}
                onChange={(e) => setMedicareExempt(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm border-zinc-300 dark:border-zinc-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <CalcSaveButton
              toolSlug="australia-pay-calculator"
              toolName="Australia Pay Calculator"
              summaryTitle={`Salary: $${grossSalary.toLocaleString()} AUD`}
              summaryMetrics={[
                { label: "Fortnightly Pay", value: formatCurrency(result.netFortnightlyTakeHome) },
                { label: "Monthly Pay", value: formatCurrency(result.netMonthlyTakeHome) },
                { label: "Annual Take-Home", value: formatCurrency(result.netAnnualTakeHome) },
                { label: "Income Tax", value: formatCurrency(result.incomeTax) },
                { label: "Medicare Levy", value: formatCurrency(result.medicareLevy) },
                { label: "Super (11.5%)", value: formatCurrency(result.superannuationAmount) },
              ]}
            />
            <CalcShareButton
              state={{
                grossSalary,
                superannuationPercent,
                hasHelpDebt,
                medicareExempt,
              }}
              label="Share Australia Pay Plan"
            />
            <CalcPromptButton promptText={llmPrompt} />
            <CalcExportButton
              data={exportSchedule}
              filename="australia-pay-take-home-breakdown"
              sheetName="Australia Pay Breakdown"
            />
          </div>
        </div>

        {/* Right Results */}
        <div className="space-y-4">
          <CalcResult
            title="Australian Take-Home Pay Summary"
            primaryLabel="Net Fortnightly Take-Home"
            primaryValue={formatCurrency(result.netFortnightlyTakeHome)}
            primarySubtext={`Monthly: ${formatCurrency(result.netMonthlyTakeHome)} • Annual: ${formatCurrency(result.netAnnualTakeHome)}`}
            copyValue={`Australia Take-Home Pay: ${formatCurrency(result.netFortnightlyTakeHome)}/fortnight (${formatCurrency(result.netMonthlyTakeHome)}/mo, ${formatCurrency(result.netAnnualTakeHome)}/yr) | Gross: $${grossSalary.toLocaleString()} | Tax: ${formatCurrency(result.incomeTax)} | Medicare: ${formatCurrency(result.medicareLevy)} | Effective Rate: ${result.effectiveTaxRate}%`}
            columns={2}
            items={[
              {
                label: "Net Annual Take-Home",
                value: formatCurrency(result.netAnnualTakeHome),
                subtext: "Total net salary in pocket after all ATO income taxes and levies",
                highlight: true,
              },
              {
                label: "Net Monthly Take-Home",
                value: formatCurrency(result.netMonthlyTakeHome),
                subtext: "Monthly net salary payment",
              },
              {
                label: "Net Weekly Take-Home",
                value: formatCurrency(result.netWeeklyTakeHome),
                subtext: "Weekly net salary (52 weeks)",
              },
              {
                label: "ATO Income Tax",
                value: formatCurrency(result.incomeTax),
                subtext: "Stage 3 tax cuts (effective July 2024)",
              },
              {
                label: "Medicare Levy (2%)",
                value: formatCurrency(result.medicareLevy),
                subtext: medicareExempt ? "Exempt" : "Standard 2% levy for public health cover",
              },
              ...(result.helpRepayment > 0
                ? [
                    {
                      label: "HELP / HECS Repayment",
                      value: formatCurrency(result.helpRepayment),
                      subtext: "Compulsory higher education loan repayment",
                    },
                  ]
                : []),
              {
                label: `Employer Superannuation (${superannuationPercent}%)`,
                value: formatCurrency(result.superannuationAmount),
                subtext: "Statutory employer super contribution into your chosen super fund",
              },
              {
                label: "Effective Tax Rate",
                value: `${result.effectiveTaxRate}%`,
                subtext: "(Total Tax + Medicare + HELP) / Gross Salary",
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <CalcChart
          title="Australia Pay & Tax Breakdown"
          data={chartData}
          series={[
            {
              key: "amount",
              name: "Amount ($ AUD)",
              color: "#10b981",
              gradientId: "australiaSalaryGrad",
            },
          ]}
          valuePrefix="$"
        />
      </div>
    </CalcCard>
  );
}
