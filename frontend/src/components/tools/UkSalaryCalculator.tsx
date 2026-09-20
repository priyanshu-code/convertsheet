"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PoundSterling } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcSelect,
  CalcResult,
  CalcChart,
  CalcExportButton,
  CalcShareButton,
  CalcSaveButton,
  CalcPromptButton,
} from "@/components/calculator";
import { calculateUkSalary, UkSalaryResult } from "@/lib/engines/financial-engine";

export interface UkSalaryCalculatorProps {
  initialValues?: Partial<{
    grossSalary: number;
    pensionPercent: number;
    studentLoanPlan: "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";
  }>;
}

const PRESET_SALARIES = [
  { label: "£30k", value: 30000 },
  { label: "£50k", value: 50000 },
  { label: "£80k", value: 80000 },
  { label: "£120k", value: 120000 },
];

const STUDENT_LOAN_OPTIONS = [
  { value: "none", label: "No Student Loan" },
  { value: "plan1", label: "Plan 1 (Pre-2012 / NI, threshold £24,990)" },
  { value: "plan2", label: "Plan 2 (Post-2012 England/Wales, threshold £27,295)" },
  { value: "plan4", label: "Plan 4 (Scotland, threshold £31,395)" },
  { value: "plan5", label: "Plan 5 (Courses starting Aug 2023+, threshold £25,000)" },
  { value: "postgrad", label: "Postgraduate Loan (Threshold £21,000, 6%)" },
];

export function UkSalaryCalculator({ initialValues }: UkSalaryCalculatorProps = {}) {
  const [grossSalary, setGrossSalary] = useState<number>(() => {
    if (initialValues?.grossSalary !== undefined) return initialValues.grossSalary;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("grossSalary");
      if (q) return Number(q);
    }
    return 45000;
  });

  const [pensionPercent, setPensionPercent] = useState<number>(() => {
    if (initialValues?.pensionPercent !== undefined) return initialValues.pensionPercent;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("pensionPercent");
      if (q) return Number(q);
    }
    return 5;
  });

  const [studentLoanPlan, setStudentLoanPlan] = useState<
    "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad"
  >(() => {
    if (initialValues?.studentLoanPlan !== undefined) return initialValues.studentLoanPlan;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("studentLoanPlan");
      if (
        q === "none" ||
        q === "plan1" ||
        q === "plan2" ||
        q === "plan4" ||
        q === "plan5" ||
        q === "postgrad"
      ) {
        return q;
      }
    }
    return "none";
  });

  const result: UkSalaryResult = useMemo(() => {
    return calculateUkSalary({
      grossSalary,
      pensionPercent,
      studentLoanPlan,
    });
  }, [grossSalary, pensionPercent, studentLoanPlan]);

  const chartData = useMemo(() => {
    return [
      { label: "Gross Salary", amount: result.grossSalary },
      { label: "Net Take-Home", amount: result.netAnnualTakeHome },
      { label: "Income Tax (PAYE)", amount: result.incomeTax },
      { label: "National Insurance", amount: result.nationalInsurance },
      { label: "Pension", amount: result.pensionContribution },
      { label: "Student Loan", amount: result.studentLoanRepayment },
    ];
  }, [result]);

  const exportSchedule = useMemo(() => {
    return [
      {
        Component: "Gross Salary",
        Monthly: result.monthlyGross,
        Annual: result.grossSalary,
      },
      {
        Component: "Personal Allowance (Tax-free)",
        Monthly: Math.round((result.personalAllowance / 12) * 100) / 100,
        Annual: result.personalAllowance,
      },
      {
        Component: "Income Tax (PAYE)",
        Monthly: Math.round((result.incomeTax / 12) * 100) / 100,
        Annual: result.incomeTax,
      },
      {
        Component: "National Insurance (NIC)",
        Monthly: Math.round((result.nationalInsurance / 12) * 100) / 100,
        Annual: result.nationalInsurance,
      },
      {
        Component: "Pension Contribution",
        Monthly: Math.round((result.pensionContribution / 12) * 100) / 100,
        Annual: result.pensionContribution,
      },
      {
        Component: "Student Loan Repayment",
        Monthly: Math.round((result.studentLoanRepayment / 12) * 100) / 100,
        Annual: result.studentLoanRepayment,
      },
      {
        Component: "Net Weekly Take-Home",
        Monthly: Math.round((result.netWeeklyTakeHome * 4.3333) * 100) / 100,
        Annual: Math.round(result.netWeeklyTakeHome * 52 * 100) / 100,
      },
      {
        Component: "Net Take-Home Pay",
        Monthly: result.netMonthlyTakeHome,
        Annual: result.netAnnualTakeHome,
      },
    ];
  }, [result]);

  const formatCurrency = (val: number): string => {
    return `£${val.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const llmPrompt = useMemo(() => {
    return `Analyze my UK Salary & Take-Home breakdown (2024/25 HMRC tax year):
- Gross Annual Salary: £${result.grossSalary.toLocaleString()}
- Pension Contribution: ${pensionPercent}% (£${result.pensionContribution.toLocaleString()}/yr)
- Student Loan Plan: ${studentLoanPlan} (£${result.studentLoanRepayment.toLocaleString()}/yr)
- Income Tax (PAYE): £${result.incomeTax.toLocaleString()}/yr
- National Insurance: £${result.nationalInsurance.toLocaleString()}/yr
- Net Monthly Take-Home: £${result.netMonthlyTakeHome.toLocaleString()}/mo
- Net Weekly Take-Home: £${result.netWeeklyTakeHome.toLocaleString()}/wk
- Net Annual Take-Home: £${result.netAnnualTakeHome.toLocaleString()}/yr
- Effective Tax Rate: ${result.effectiveTaxRate}%

Please advise on salary sacrifice pension contributions, ISA allowances, tax brackets optimization, and maximizing take-home pay.`;
  }, [result, pensionPercent, studentLoanPlan]);

  return (
    <CalcCard
      title="UK Salary & Take-Home Pay Calculator (2024/25 HMRC)"
      subtitle="Calculate your exact UK monthly take-home pay after PAYE income tax, Class 1 National Insurance, pension deductions, and student loans."
      icon={PoundSterling}
      badge="United Kingdom • 2024/25 HMRC"
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
          <div className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs flex items-center gap-1.5">
            <span>🇬🇧</span>
            <span>UK Salary</span>
          </div>
          <Link
            href="/tools/canada-paycheck-calculator"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <span>🇨🇦</span>
            <span>Canada Paycheck</span>
          </Link>
          <Link
            href="/tools/australia-pay-calculator"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <span>🇦🇺</span>
            <span>Australia Pay</span>
          </Link>
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
              onChange={setGrossSalary}
              prefix="£"
              min={0}
              step={1000}
              helpText="Your total annual pre-tax base salary before deductions"
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
            id="pension-percent"
            label="Pension Contribution"
            value={pensionPercent}
            onChange={setPensionPercent}
            min={0}
            max={15}
            step={1}
            unit="%"
            helpText="Auto-enrolment employee pension contribution (typically pre-tax salary sacrifice)"
          />

          <CalcSelect
            id="student-loan-plan"
            label="Student Loan Plan"
            value={studentLoanPlan}
            onChange={(val) =>
              setStudentLoanPlan(val as "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad")
            }
            options={STUDENT_LOAN_OPTIONS}
            helperText="UK Student Loans Company repayments (deducted above income thresholds)"
          />

          <div className="pt-2 flex flex-wrap gap-3">
            <CalcSaveButton
              toolSlug="uk-salary-calculator"
              toolName="UK Salary & Take-Home Calculator"
              summaryTitle={`Salary: £${grossSalary.toLocaleString()} (Take-Home: ${formatCurrency(result.netMonthlyTakeHome)}/mo)`}
              summaryMetrics={[
                { label: "Monthly Take-Home", value: formatCurrency(result.netMonthlyTakeHome) },
                { label: "Annual Take-Home", value: formatCurrency(result.netAnnualTakeHome) },
                { label: "Income Tax", value: formatCurrency(result.incomeTax) },
                { label: "National Insurance", value: formatCurrency(result.nationalInsurance) },
              ]}
            />
            <CalcShareButton
              state={{
                grossSalary,
                pensionPercent,
                studentLoanPlan,
              }}
              label="Share UK Salary Plan"
            />
            <CalcPromptButton promptText={llmPrompt} />
            <CalcExportButton
              data={exportSchedule}
              filename="uk-salary-take-home-breakdown"
              sheetName="UK Salary Breakdown"
            />
          </div>
        </div>

        {/* Right Results */}
        <div className="space-y-4">
          <CalcResult
            title="UK Take-Home Pay Summary"
            primaryLabel="Net Monthly Take-Home"
            primaryValue={formatCurrency(result.netMonthlyTakeHome)}
            primarySubtext={`Weekly: ${formatCurrency(result.netWeeklyTakeHome)} • Annual: ${formatCurrency(result.netAnnualTakeHome)}`}
            items={[
              {
                label: "Annual Take-Home",
                value: formatCurrency(result.netAnnualTakeHome),
                subtext: "Total net pay after all taxes & deductions",
                highlight: true,
              },
              {
                label: "Total Income Tax (PAYE)",
                value: formatCurrency(result.incomeTax),
                subtext: `Taxable Income: £${result.taxableIncome.toLocaleString()}`,
              },
              {
                label: "National Insurance (NIC)",
                value: formatCurrency(result.nationalInsurance),
                subtext: "Class 1 employee rate (8% / 2%)",
              },
              {
                label: "Pension Contribution",
                value: formatCurrency(result.pensionContribution),
                subtext: `${pensionPercent}% employee deduction`,
              },
              {
                label: "Student Loan Repayment",
                value: formatCurrency(result.studentLoanRepayment),
                subtext: studentLoanPlan === "none" ? "No repayments active" : `Plan: ${studentLoanPlan.toUpperCase()}`,
              },
              {
                label: "Effective Tax Rate",
                value: `${result.effectiveTaxRate}%`,
                subtext: "(Income Tax + NIC) / Gross",
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <CalcChart
          title="UK Salary & Progressive Tax Breakdown"
          data={chartData}
          series={[
            {
              key: "amount",
              name: "Amount (£)",
              color: "#10b981",
              gradientId: "ukSalaryGrad",
            },
          ]}
        />
      </div>
    </CalcCard>
  );
}
