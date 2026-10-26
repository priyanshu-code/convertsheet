"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PoundSterling, ShieldCheck, FileSpreadsheet } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcSelect,
  CalcResult,
  CalcChart,
  CalcShareButton,
  CalcSaveButton,
  CalcPromptButton,
} from "@/components/calculator";
import { calculateUkSalary, UkSalaryResult } from "@/lib/engines/financial-engine";
import * as XLSX from "xlsx";

export interface UkSalaryCalculatorProps {
  initialValues?: Partial<{
    grossSalary: number;
    pensionPercent: number;
    studentLoanPlan: "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";
  }>;
}

const PRESET_SALARIES = [
  { label: "£30k", value: 30000 },
  { label: "£45k", value: 45000 },
  { label: "£60k", value: 60000 },
  { label: "£80k", value: 80000 },
  { label: "£100k", value: 100000 },
  { label: "£125k", value: 125000 },
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

  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  // Real-time URL query parameter synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("grossSalary", grossSalary.toString());
    params.set("pensionPercent", pensionPercent.toString());
    params.set("studentLoanPlan", studentLoanPlan);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [grossSalary, pensionPercent, studentLoanPlan]);

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

  const formatCurrency = (val: number): string => {
    return `£${val.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["ConvertSheet - UK Salary & Take-Home Pay Audit", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", `https://www.convertsheet.com/tools/uk-salary-calculator?grossSalary=${grossSalary}&pensionPercent=${pensionPercent}&studentLoanPlan=${studentLoanPlan}`],
        ["HMRC Tax Baseline", "2024/25 & 2026/27 HMRC Standards (England, Wales, NI)"],
        ["", ""],
        ["--- SALARY & DEDUCTIONS PARAMETERS ---", ""],
        ["Gross Annual Base Salary (£)", grossSalary],
        ["Employee Pension Contribution (%)", `${pensionPercent}%`],
        ["Annual Pension Salary Sacrifice (£)", result.pensionContribution],
        ["Student Loan Plan", studentLoanPlan === "none" ? "None" : studentLoanPlan.toUpperCase()],
        ["Student Loan Repayments (£)", result.studentLoanRepayment],
        ["Personal Allowance (Tax-Free) (£)", result.personalAllowance],
        ["Taxable Income (£)", result.taxableIncome],
        ["", ""],
        ["--- NET TAKE-HOME PAY RESULTS ---", ""],
        ["Net Annual Take-Home (£)", result.netAnnualTakeHome],
        ["Net Monthly Take-Home (£)", result.netMonthlyTakeHome],
        ["Net Weekly Take-Home (£)", result.netWeeklyTakeHome],
        ["Total Income Tax (PAYE) (£)", result.incomeTax],
        ["National Insurance (Class 1 NIC) (£)", result.nationalInsurance],
        ["Effective Combined Tax Rate (%)", `${result.effectiveTaxRate}%`],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      // Active transparent Excel cell formulas with canonical recalculation links
      wsSummary["B9"] = { t: "n", f: "B7*(B8/100)", v: result.pensionContribution };
      wsSummary["B13"] = { t: "n", f: "MAX(0, B7-B9-B12)", v: result.taxableIncome };
      wsSummary["B16"] = { t: "n", f: "B7-B9-B19-B20-B11", v: result.netAnnualTakeHome };
      wsSummary["B17"] = { t: "n", f: "B16/12", v: result.netMonthlyTakeHome };
      wsSummary["B18"] = { t: "n", f: "B16/52", v: result.netWeeklyTakeHome };
      wsSummary["B21"] = { t: "n", f: "(B19+B20)/B7*100", v: result.effectiveTaxRate };

      XLSX.utils.book_append_sheet(wb, wsSummary, "UK Salary Summary");

      // Pay frequency comparison table
      const scheduleHeader = [
        "Component",
        "Weekly (52x)",
        "Monthly (12x)",
        "Annual",
        "ConvertSheet Recalculation Model",
      ];
      const modelUrl = `https://www.convertsheet.com/tools/uk-salary-calculator?grossSalary=${grossSalary}&pensionPercent=${pensionPercent}&studentLoanPlan=${studentLoanPlan}`;
      const scheduleRows = [
        ["Gross Base Salary", Math.round((grossSalary / 52) * 100) / 100, result.monthlyGross, grossSalary, modelUrl],
        ["Personal Allowance (Tax-Free)", Math.round((result.personalAllowance / 52) * 100) / 100, Math.round((result.personalAllowance / 12) * 100) / 100, result.personalAllowance, modelUrl],
        ["Income Tax (PAYE)", Math.round((result.incomeTax / 52) * 100) / 100, Math.round((result.incomeTax / 12) * 100) / 100, result.incomeTax, modelUrl],
        ["National Insurance (NIC)", Math.round((result.nationalInsurance / 52) * 100) / 100, Math.round((result.nationalInsurance / 12) * 100) / 100, result.nationalInsurance, modelUrl],
        ["Pension Contribution", Math.round((result.pensionContribution / 52) * 100) / 100, Math.round((result.pensionContribution / 12) * 100) / 100, result.pensionContribution, modelUrl],
        ["Student Loan Repayment", Math.round((result.studentLoanRepayment / 52) * 100) / 100, Math.round((result.studentLoanRepayment / 12) * 100) / 100, result.studentLoanRepayment, modelUrl],
        ["Net Take-Home Pay", result.netWeeklyTakeHome, result.netMonthlyTakeHome, result.netAnnualTakeHome, modelUrl],
      ];
      const wsSchedule = XLSX.utils.aoa_to_sheet([scheduleHeader, ...scheduleRows]);
      // Dynamic frequency column formulas
      [2, 3, 4, 5, 6, 7].forEach((rowNum) => {
        wsSchedule[`B${rowNum}`] = { t: "n", f: `D${rowNum}/52`, v: scheduleRows[rowNum - 2][1] as number };
        wsSchedule[`C${rowNum}`] = { t: "n", f: `D${rowNum}/12`, v: scheduleRows[rowNum - 2][2] as number };
      });
      wsSchedule["B8"] = { t: "n", f: "B2-B4-B5-B6-B7", v: result.netWeeklyTakeHome };
      wsSchedule["C8"] = { t: "n", f: "C2-C4-C5-C6-C7", v: result.netMonthlyTakeHome };
      wsSchedule["D8"] = { t: "n", f: "D2-D4-D5-D6-D7", v: result.netAnnualTakeHome };

      XLSX.utils.book_append_sheet(wb, wsSchedule, "Pay Frequency Matrix");

      XLSX.writeFile(wb, `ConvertSheet_UK_Salary_${grossSalary}.xlsx`);
    } catch (err) {
      console.error("Failed to generate Excel export:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const llmPrompt = useMemo(() => {
    return `Analyze my UK Salary & Take-Home breakdown (2024/25 & 2026/27 HMRC tax rules):
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
      title="UK Salary & Take-Home Pay Calculator (2024/25 & 2026/27 HMRC)"
      subtitle="Calculate your exact UK monthly take-home pay after PAYE income tax, Class 1 National Insurance, pension deductions, and student loans."
      icon={PoundSterling}
      badge="United Kingdom • 2024/25 & 2026/27 HMRC"
    >
      <div className="space-y-6 pb-28 sm:pb-0">
        {/* Zero-Knowledge Privacy Badge & Freshness Signal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>100% Client-Side • No server data transfer • Private &amp; Free Forever</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Updated for 2026/27 HMRC (October 26, 2026): £12,570 Personal Allowance frozen • 8% Class 1 Employee NIC • £100k taper threshold (BoE Rate 3.75%)</span>
          </div>
        </div>

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
            <div className="space-y-3">
              <CalcInput
                id="gross-salary"
                label="Gross Annual Salary"
                value={grossSalary}
                onChange={(val) => setGrossSalary(Number(val) || 0)}
                prefix="£"
                min={0}
                step={1000}
                helpText="Your total annual pre-tax base salary before deductions"
              />
              <CalcSlider
                id="gross-salary-slider"
                label="Explore Salary Range (£10k – £250k)"
                value={Math.min(250000, Math.max(10000, grossSalary))}
                onChange={setGrossSalary}
                min={10000}
                max={250000}
                step={1000}
                unit="£"
                ariaLabel="Gross Annual Base Salary Slider"
              />
              {/* Quick presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">Common Salary Benchmarks:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SALARIES.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setGrossSalary(preset.value)}
                      className={`min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer touch-manipulation ${
                        grossSalary === preset.value
                          ? "bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500 shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
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
            {/* Quick 44px Pension Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">Common Pension Contribution Presets:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "0% Opt-out", value: 0 },
                  { label: "3% Minimum", value: 3 },
                  { label: "5% Standard", value: 5 },
                  { label: "8% Matched", value: 8 },
                  { label: "10% High", value: 10 },
                  { label: "15% Max", value: 15 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setPensionPercent(preset.value)}
                    className={`min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer touch-manipulation ${
                      pensionPercent === preset.value
                        ? "bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500 shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

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

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer min-h-[44px] touch-manipulation"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isExportingExcel ? "Generating..." : "Export Excel (.xlsx)"}</span>
              </button>
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
            </div>
          </div>

          {/* Right Results */}
          <div className="space-y-4">
            <CalcResult
              title="UK Take-Home Pay Summary"
              primaryLabel="Net Monthly Take-Home"
              primaryValue={formatCurrency(result.netMonthlyTakeHome)}
              primarySubtext={`Weekly: ${formatCurrency(result.netWeeklyTakeHome)} • Annual: ${formatCurrency(result.netAnnualTakeHome)}`}
              copyValue={`UK Take-Home: ${formatCurrency(result.netMonthlyTakeHome)}/mo (${formatCurrency(result.netAnnualTakeHome)}/yr) | Gross: £${grossSalary.toLocaleString()} | Tax: ${formatCurrency(result.incomeTax)} | NI: ${formatCurrency(result.nationalInsurance)} | Effective Rate: ${result.effectiveTaxRate}%`}
              columns={2}
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
      </div>

      {/* Mobile Sticky Bottom Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block tracking-wider">
            Net Monthly Pay
          </span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(result.netMonthlyTakeHome)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 touch-manipulation disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isExportingExcel ? "Exporting..." : "Export .xlsx"}</span>
        </button>
      </div>
    </CalcCard>
  );
}
