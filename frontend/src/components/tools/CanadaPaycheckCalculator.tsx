"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DollarSign, ShieldCheck, Download } from "lucide-react";
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
import {
  calculateCanadaSalary,
  CanadaSalaryResult,
} from "@/lib/engines/financial-engine";
import * as XLSX from "xlsx";

export interface CanadaPaycheckCalculatorProps {
  initialValues?: Partial<{
    grossSalary: number;
    province: "ON" | "BC" | "AB" | "QC";
    rrspContributionPercent: number;
  }>;
}

const PRESET_SALARIES = [
  { label: "$50k", value: 50000 },
  { label: "$70k", value: 70000 },
  { label: "$85k", value: 85000 },
  { label: "$100k", value: 100000 },
  { label: "$120k", value: 120000 },
  { label: "$150k", value: 150000 },
];

const PROVINCE_OPTIONS = [
  { value: "ON", label: "Ontario (ON)" },
  { value: "BC", label: "British Columbia (BC)" },
  { value: "AB", label: "Alberta (AB)" },
  { value: "QC", label: "Quebec (QC)" },
];

export function CanadaPaycheckCalculator({
  initialValues,
}: CanadaPaycheckCalculatorProps = {}) {
  const [grossSalary, setGrossSalary] = useState<number>(() => {
    if (initialValues?.grossSalary !== undefined) return initialValues.grossSalary;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("grossSalary");
      if (q) return Number(q);
    }
    return 85000;
  });

  const [province, setProvince] = useState<"ON" | "BC" | "AB" | "QC">(() => {
    if (initialValues?.province !== undefined) return initialValues.province;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("province");
      if (q === "ON" || q === "BC" || q === "AB" || q === "QC") {
        return q;
      }
    }
    return "ON";
  });

  const [rrspContributionPercent, setRrspContributionPercent] = useState<number>(
    () => {
      if (initialValues?.rrspContributionPercent !== undefined) {
        return initialValues.rrspContributionPercent;
      }
      if (typeof window !== "undefined") {
        const q = new URLSearchParams(window.location.search).get(
          "rrspContributionPercent"
        );
        if (q) return Number(q);
      }
      return 0;
    }
  );

  const result: CanadaSalaryResult = useMemo(() => {
    return calculateCanadaSalary({
      grossSalary,
      province,
      rrspContributionPercent,
    });
  }, [grossSalary, province, rrspContributionPercent]);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("grossSalary", grossSalary.toString());
    params.set("province", province);
    params.set("rrspContributionPercent", rrspContributionPercent.toString());
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [grossSalary, province, rrspContributionPercent]);

  const chartData = useMemo(() => {
    return [
      { label: "Gross Salary", amount: result.grossSalary },
      { label: "Net Take-Home", amount: result.netAnnualTakeHome },
      { label: "Federal Tax", amount: result.federalTax },
      { label: "Provincial Tax", amount: result.provincialTax },
      { label: "CPP / CPP2", amount: result.cppContribution },
      { label: "EI Premium", amount: result.eiContribution },
      { label: "RRSP Contribution", amount: result.rrspDeduction },
    ];
  }, [result]);

  const formatCurrency = (val: number): string => {
    return `$${val.toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExportExcel = () => {
    try {
      const summaryRows = [
        ["ConvertSheet - Canadian Paycheck & Tax Deduction Breakdown (CRA)", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/canada-paycheck-calculator"],
        ["", ""],
        ["--- INCOME & TAX PARAMETERS ---", ""],
        ["Gross Annual Salary ($ CAD)", grossSalary],
        ["Province / Territory", province],
        ["RRSP Contribution (%)", `${rrspContributionPercent}%`],
        ["RRSP Deduction ($ CAD)", Math.round(result.rrspDeduction)],
        ["", ""],
        ["--- TAX & STATUTORY DEDUCTIONS ---", ""],
        ["Federal Income Tax (CRA)", Math.round(result.federalTax)],
        ["Provincial Income Tax", Math.round(result.provincialTax)],
        ["CPP / CPP2 Contribution", Math.round(result.cppContribution)],
        ["Employment Insurance (EI)", Math.round(result.eiContribution)],
        ["Total Statutory Deductions", Math.round(result.totalDeductions)],
        ["Effective Total Tax Rate", `${result.effectiveTaxRate}%`],
        ["", ""],
        ["--- NET TAKE-HOME PAY INTERVALS ---", ""],
        ["Net Annual Take-Home", Math.round(result.netAnnualTakeHome)],
        ["Net Monthly Take-Home (12x)", Math.round(result.netMonthlyTakeHome)],
        ["Net Semi-Monthly (24x)", Math.round(result.netSemiMonthlyTakeHome)],
        ["Net Bi-Weekly Take-Home (26x)", Math.round(result.netBiWeeklyTakeHome)],
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "CanadaPaycheckSummary");
      XLSX.writeFile(wb, `ConvertSheet_Canada_Paycheck_${grossSalary}_${province}.xlsx`);
    } catch (err) {
      console.error("Excel export failed:", err);
    }
  };

  const llmPrompt = useMemo(() => {
    return `Analyze my Canadian Paycheck & Take-Home breakdown (2024-2026 CRA tax rules):
- Gross Annual Salary: $${result.grossSalary.toLocaleString()} CAD
- Province / Territory: ${province}
- RRSP Contribution: ${rrspContributionPercent}% ($${result.rrspDeduction.toLocaleString()}/yr)
- Federal Income Tax: $${result.federalTax.toLocaleString()}/yr
- Provincial Income Tax: $${result.provincialTax.toLocaleString()}/yr
- CPP / CPP2: $${result.cppContribution.toLocaleString()}/yr
- Employment Insurance (EI): $${result.eiContribution.toLocaleString()}/yr
- Net Bi-Weekly Take-Home: $${result.netBiWeeklyTakeHome.toLocaleString()}/period
- Net Semi-Monthly Take-Home: $${result.netSemiMonthlyTakeHome.toLocaleString()}/period
- Net Monthly Take-Home: $${result.netMonthlyTakeHome.toLocaleString()}/mo
- Net Annual Take-Home: $${result.netAnnualTakeHome.toLocaleString()}/yr
- Effective Tax Rate: ${result.effectiveTaxRate}%

Please advise on tax optimization strategies (RRSP deduction limit, TFSA contributions, FHSA benefits, and provincial tax brackets).`;
  }, [result, province, rrspContributionPercent]);

  return (
    <div className="space-y-6 pb-24 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side • Zero Server Storage • Private & Free Forever</span>
      </div>

      <CalcCard
        title="Canada Paycheck & Salary Take-Home Calculator (CRA)"
        subtitle="Calculate your exact Canadian take-home pay after Federal tax, Provincial tax, CPP/CPP2, EI, and RRSP deductions across Ontario, BC, Alberta, and Quebec."
        icon={DollarSign}
        badge="Canada • CRA 2024 Ready"
      >
        {/* Country cross-link navigation hub */}
        <div className="flex items-center justify-start pb-2">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
            <Link
              href="/tools/salary-calculator"
              className="min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <span>🇺🇸</span>
              <span>US Paycheck</span>
            </Link>
            <Link
              href="/tools/uk-salary-calculator"
              className="min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <span>🇬🇧</span>
              <span>UK Salary</span>
            </Link>
            <div className="min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs flex items-center gap-1.5">
              <span>🇨🇦</span>
              <span>Canada Paycheck</span>
            </div>
            <Link
              href="/tools/australia-pay-calculator"
              className="min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
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
                onChange={(val) => setGrossSalary(Number(val) || 0)}
                prefix="$"
                min={0}
                step={1000}
                helpText="Your total annual pre-tax base salary in Canadian Dollars ($ CAD)"
              />
              {/* Quick presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Presets:</span>
                {PRESET_SALARIES.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setGrossSalary(preset.value)}
                    className={`min-h-[44px] px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
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

            <CalcSelect
              id="province"
              label="Province / Territory"
              value={province}
              onChange={(val) =>
                setProvince(val as "ON" | "BC" | "AB" | "QC")
              }
              options={PROVINCE_OPTIONS}
              helperText="Provincial tax rates and basic personal exemption amounts"
            />

            <CalcSlider
              id="rrsp-contribution-percent"
              label="RRSP Contribution Slider"
              ariaLabel="RRSP Contribution Slider"
              value={rrspContributionPercent}
              onChange={setRrspContributionPercent}
              min={0}
              max={18}
              step={1}
              unit="%"
              helpText="Registered Retirement Savings Plan pre-tax deduction (statutory CRA limit up to 18%)"
            />

            <div className="pt-2 flex flex-wrap gap-2.5">
              <CalcSaveButton
                toolSlug="canada-paycheck-calculator"
                toolName="Canada Paycheck Calculator"
                summaryTitle={`Salary: $${grossSalary.toLocaleString()} CAD (${province})`}
                summaryMetrics={[
                  { label: "Bi-Weekly Pay", value: formatCurrency(result.netBiWeeklyTakeHome) },
                  { label: "Monthly Pay", value: formatCurrency(result.netMonthlyTakeHome) },
                  { label: "Annual Take-Home", value: formatCurrency(result.netAnnualTakeHome) },
                  { label: "Federal Tax", value: formatCurrency(result.federalTax) },
                  { label: "Provincial Tax", value: formatCurrency(result.provincialTax) },
                ]}
              />
              <CalcShareButton
                state={{
                  grossSalary,
                  province,
                  rrspContributionPercent,
                }}
                label="Share Calculation"
              />
              <CalcPromptButton promptText={llmPrompt} />
              <button
                type="button"
                onClick={handleExportExcel}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export to Excel</span>
              </button>
            </div>
          </div>

          {/* Right Results */}
          <div className="space-y-4">
            <CalcResult
              title="Canadian Take-Home Pay Summary"
              primaryLabel="Net Bi-Weekly Take-Home"
              primaryValue={formatCurrency(result.netBiWeeklyTakeHome)}
              primarySubtext={`Monthly: ${formatCurrency(result.netMonthlyTakeHome)} • Annual: ${formatCurrency(result.netAnnualTakeHome)}`}
              copyValue={`Canada Net Pay: ${formatCurrency(result.netBiWeeklyTakeHome)} bi-weekly (${formatCurrency(result.netMonthlyTakeHome)}/mo, ${formatCurrency(result.netAnnualTakeHome)}/yr) | Gross: $${grossSalary.toLocaleString()} (${province}) | Effective Tax: ${result.effectiveTaxRate}%`}
              columns={2}
              items={[
                {
                  label: "Net Annual Take-Home",
                  value: formatCurrency(result.netAnnualTakeHome),
                  subtext: "Total net salary received after all CRA taxes & deductions",
                  highlight: true,
                },
                {
                  label: "Net Semi-Monthly (24 periods)",
                  value: formatCurrency(result.netSemiMonthlyTakeHome),
                  subtext: "Pay per period (15th and end of month)",
                },
                {
                  label: "Federal Tax",
                  value: formatCurrency(result.federalTax),
                  subtext: "CRA progressive federal income tax",
                },
                {
                  label: "Provincial Tax",
                  value: formatCurrency(result.provincialTax),
                  subtext: `${province} provincial income tax`,
                },
                {
                  label: "CPP / CPP2",
                  value: formatCurrency(result.cppContribution),
                  subtext: "Canada Pension Plan Tier 1 + enhanced Tier 2",
                },
                {
                  label: "EI Contribution",
                  value: formatCurrency(result.eiContribution),
                  subtext: "Employment Insurance statutory premium",
                },
                {
                  label: "RRSP Deduction",
                  value: formatCurrency(result.rrspDeduction),
                  subtext: `${rrspContributionPercent}% pre-tax retirement contribution`,
                },
                {
                  label: "Effective Tax Rate",
                  value: `${result.effectiveTaxRate}%`,
                  subtext: "(Total Taxes & Statutory) / Gross Salary",
                },
              ]}
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <CalcChart
            title="Canada Paycheck & Tax Breakdown"
            data={chartData}
            series={[
              {
                key: "amount",
                name: "Amount ($ CAD)",
                color: "#10b981",
                gradientId: "canadaSalaryGrad",
              },
            ]}
            valuePrefix="$"
          />
        </div>
      </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Bi-Weekly Pay</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(result.netBiWeeklyTakeHome)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}
