"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DollarSign, ShieldCheck, FileSpreadsheet } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
  CalcShareButton,
  CalcSaveButton,
  CalcPromptButton,
} from "@/components/calculator";
import {
  calculateAustraliaSalary,
  AustraliaSalaryResult,
} from "@/lib/engines/financial-engine";
import * as XLSX from "xlsx";

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

  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  // Real-time URL query parameter synchronization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("grossSalary", grossSalary.toString());
      params.set("superannuationPercent", superannuationPercent.toString());
      params.set("hasHelpDebt", hasHelpDebt ? "true" : "false");
      params.set("medicareExempt", medicareExempt ? "true" : "false");
      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }, [grossSalary, superannuationPercent, hasHelpDebt, medicareExempt]);

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

  const formatCurrency = (val: number): string => {
    return `$${val.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["ConvertSheet - Australia Pay & Take-Home Audit", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", `https://www.convertsheet.com/tools/australia-pay-calculator?grossSalary=${grossSalary}&superannuationPercent=${superannuationPercent}&hasHelpDebt=${hasHelpDebt}&medicareExempt=${medicareExempt}`],
        ["ATO Tax Regime", "2024-25 & 2026 Stage 3 Tax Cuts (Australian Taxation Office)"],
        ["", ""],
        ["--- COMPENSATION & DEDUCTION PARAMETERS ---", ""],
        ["Gross Annual Base Salary ($ AUD)", grossSalary],
        ["Employer Superannuation Guarantee (%)", `${superannuationPercent}%`],
        ["Annual Statutory Superannuation Contribution ($ AUD)", result.superannuationAmount],
        ["Compulsory HELP / HECS Debt Repayments ($ AUD)", result.helpRepayment],
        ["Medicare Levy Status", medicareExempt ? "Exempt (0%)" : "Standard 2%"],
        ["Medicare Levy Amount ($ AUD)", result.medicareLevy],
        ["Total Compulsory Deductions ($ AUD)", result.totalDeductions],
        ["", ""],
        ["--- NET TAKE-HOME PAY RESULTS ---", ""],
        ["Net Annual Take-Home ($ AUD)", result.netAnnualTakeHome],
        ["Net Monthly Take-Home ($ AUD)", result.netMonthlyTakeHome],
        ["Net Fortnightly Take-Home ($ AUD)", result.netFortnightlyTakeHome],
        ["Net Weekly Take-Home ($ AUD)", result.netWeeklyTakeHome],
        ["Total ATO Income Tax ($ AUD)", result.incomeTax],
        ["Effective Tax Rate (%)", `${result.effectiveTaxRate}%`],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      // Active transparent Excel cell formulas with canonical recalculation links
      wsSummary["B9"] = { t: "n", f: "B7*(B8/100)", v: result.superannuationAmount };
      wsSummary["B12"] = { t: "n", f: medicareExempt ? "0" : "B7*0.02", v: result.medicareLevy };
      wsSummary["B13"] = { t: "n", f: "B20+B12+B10", v: result.totalDeductions };
      wsSummary["B16"] = { t: "n", f: "B7-B13", v: result.netAnnualTakeHome };
      wsSummary["B17"] = { t: "n", f: "B16/12", v: result.netMonthlyTakeHome };
      wsSummary["B18"] = { t: "n", f: "B16/26", v: result.netFortnightlyTakeHome };
      wsSummary["B19"] = { t: "n", f: "B16/52", v: result.netWeeklyTakeHome };
      wsSummary["B21"] = { t: "n", f: "(B13/B7)*100", v: result.effectiveTaxRate };

      XLSX.utils.book_append_sheet(wb, wsSummary, "Australia Pay Summary");

      // Pay frequency breakdown table
      const scheduleHeader = [
        "Component",
        "Weekly (52x)",
        "Fortnightly (26x)",
        "Monthly (12x)",
        "Annual",
        "ConvertSheet Recalculation Model",
      ];
      const modelUrl = `https://www.convertsheet.com/tools/australia-pay-calculator?grossSalary=${grossSalary}&superannuationPercent=${superannuationPercent}&hasHelpDebt=${hasHelpDebt}&medicareExempt=${medicareExempt}`;
      const scheduleRows = [
        ["Gross Base Salary", result.weeklyGross, result.fortnightlyGross, result.monthlyGross, result.grossSalary, modelUrl],
        ["ATO Income Tax", Math.round((result.incomeTax / 52) * 100) / 100, Math.round((result.incomeTax / 26) * 100) / 100, Math.round((result.incomeTax / 12) * 100) / 100, result.incomeTax, modelUrl],
        ["Medicare Levy (2%)", Math.round((result.medicareLevy / 52) * 100) / 100, Math.round((result.medicareLevy / 26) * 100) / 100, Math.round((result.medicareLevy / 12) * 100) / 100, result.medicareLevy, modelUrl],
        ["HELP / HECS Repayment", Math.round((result.helpRepayment / 52) * 100) / 100, Math.round((result.helpRepayment / 26) * 100) / 100, Math.round((result.helpRepayment / 12) * 100) / 100, result.helpRepayment, modelUrl],
        ["Total Deductions", Math.round((result.totalDeductions / 52) * 100) / 100, Math.round((result.totalDeductions / 26) * 100) / 100, Math.round((result.totalDeductions / 12) * 100) / 100, result.totalDeductions, modelUrl],
        ["Net Take-Home Pay", result.netWeeklyTakeHome, result.netFortnightlyTakeHome, result.netMonthlyTakeHome, result.netAnnualTakeHome, modelUrl],
        ["Employer Superannuation", Math.round((result.superannuationAmount / 52) * 100) / 100, Math.round((result.superannuationAmount / 26) * 100) / 100, Math.round((result.superannuationAmount / 12) * 100) / 100, result.superannuationAmount, modelUrl],
      ];
      const wsSchedule = XLSX.utils.aoa_to_sheet([scheduleHeader, ...scheduleRows]);
      // Dynamic frequency column formulas
      [2, 3, 4, 5, 8].forEach((rowNum) => {
        wsSchedule[`B${rowNum}`] = { t: "n", f: `E${rowNum}/52`, v: scheduleRows[rowNum - 2][1] as number };
        wsSchedule[`C${rowNum}`] = { t: "n", f: `E${rowNum}/26`, v: scheduleRows[rowNum - 2][2] as number };
        wsSchedule[`D${rowNum}`] = { t: "n", f: `E${rowNum}/12`, v: scheduleRows[rowNum - 2][3] as number };
      });
      wsSchedule["B6"] = { t: "n", f: "B3+B4+B5", v: Math.round((result.totalDeductions / 52) * 100) / 100 };
      wsSchedule["C6"] = { t: "n", f: "C3+C4+C5", v: Math.round((result.totalDeductions / 26) * 100) / 100 };
      wsSchedule["D6"] = { t: "n", f: "D3+D4+D5", v: Math.round((result.totalDeductions / 12) * 100) / 100 };
      wsSchedule["E6"] = { t: "n", f: "E3+E4+E5", v: result.totalDeductions };

      wsSchedule["B7"] = { t: "n", f: "B2-B6", v: result.netWeeklyTakeHome };
      wsSchedule["C7"] = { t: "n", f: "C2-C6", v: result.netFortnightlyTakeHome };
      wsSchedule["D7"] = { t: "n", f: "D2-D6", v: result.netMonthlyTakeHome };
      wsSchedule["E7"] = { t: "n", f: "E2-E6", v: result.netAnnualTakeHome };

      XLSX.utils.book_append_sheet(wb, wsSchedule, "Pay Frequency Matrix");

      XLSX.writeFile(wb, `ConvertSheet_Australia_Pay_${grossSalary}.xlsx`);
    } catch (err) {
      console.error("Failed to generate Excel export:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const llmPrompt = useMemo(() => {
    return `Analyze my Australian Pay & Take-Home breakdown (2024-25 & 2026 ATO Stage 3 Tax Cuts):
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
      title="Australia Pay & Salary Take-Home Calculator (ATO 2024-25 & 2026 Stage 3)"
      subtitle="Calculate your exact Australian take-home pay under the new Stage 3 tax cuts, including Medicare Levy, HELP/HECS student loan repayments, and superannuation guarantee."
      icon={DollarSign}
      badge="ATO 2024-25 Stage 3 Tax Cuts"
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
            <span>Updated for 2026 ATO Tax Year (October 26, 2026): Stage 3 Tax Cuts in full effect (16% low band / 30% up to $135k), Super Guarantee benchmark 11.5% (scaling to 12%), Medicare Levy 2% (RBA Cash Rate 4.35%)</span>
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
            <div className="space-y-3">
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
              <CalcSlider
                id="gross-salary-slider"
                label="Explore Salary Range ($30k – $300k)"
                value={Math.min(300000, Math.max(30000, grossSalary))}
                onChange={setGrossSalary}
                min={30000}
                max={300000}
                step={1000}
                unit="$"
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
              id="superannuation-percent"
              label="Employer Superannuation Guarantee"
              value={superannuationPercent}
              onChange={setSuperannuationPercent}
              min={9}
              max={15}
              step={0.5}
              unit="%"
              helpText="Statutory employer superannuation contribution (standard 11.5% for 2024-25, scaling to 12%)"
            />
            {/* Quick 44px Superannuation Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">Common Superannuation Presets:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "9.5% Legacy", value: 9.5 },
                  { label: "10.5% Historical", value: 10.5 },
                  { label: "11.5% Statutory", value: 11.5 },
                  { label: "12.0% Target", value: 12.0 },
                  { label: "15.0% Concessional", value: 15.0 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setSuperannuationPercent(preset.value)}
                    className={`min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer touch-manipulation ${
                      superannuationPercent === preset.value
                        ? "bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500 shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

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
                  className="w-5 h-5 text-emerald-600 rounded-sm border-zinc-300 dark:border-zinc-600 focus:ring-emerald-500 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                  className="w-5 h-5 text-emerald-600 rounded-sm border-zinc-300 dark:border-zinc-600 focus:ring-emerald-500 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                />
              </div>
            </div>

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
      </div>

      {/* Mobile Sticky Bottom Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block tracking-wider">
            Net Fortnightly Pay
          </span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(result.netFortnightlyTakeHome)}
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
