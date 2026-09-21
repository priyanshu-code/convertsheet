"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DollarSign } from "lucide-react";
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
import {
  calculateCanadaSalary,
  CanadaSalaryResult,
} from "@/lib/engines/financial-engine";

export interface CanadaPaycheckCalculatorProps {
  initialValues?: Partial<{
    grossSalary: number;
    province: "ON" | "BC" | "AB" | "QC";
    rrspContributionPercent: number;
  }>;
}

const PRESET_SALARIES = [
  { label: "$50k", value: 50000 },
  { label: "$75k", value: 75000 },
  { label: "$100k", value: 100000 },
  { label: "$140k", value: 140000 },
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

  const exportSchedule = useMemo(() => {
    return [
      {
        Component: "Gross Salary",
        BiWeekly: result.biWeeklyGross,
        SemiMonthly: result.semiMonthlyGross,
        Monthly: result.monthlyGross,
        Annual: result.grossSalary,
      },
      {
        Component: "Federal Income Tax",
        BiWeekly: Math.round((result.federalTax / 26) * 100) / 100,
        SemiMonthly: Math.round((result.federalTax / 24) * 100) / 100,
        Monthly: Math.round((result.federalTax / 12) * 100) / 100,
        Annual: result.federalTax,
      },
      {
        Component: "Provincial Income Tax",
        BiWeekly: Math.round((result.provincialTax / 26) * 100) / 100,
        SemiMonthly: Math.round((result.provincialTax / 24) * 100) / 100,
        Monthly: Math.round((result.provincialTax / 12) * 100) / 100,
        Annual: result.provincialTax,
      },
      {
        Component: "CPP / CPP2 Contribution",
        BiWeekly: Math.round((result.cppContribution / 26) * 100) / 100,
        SemiMonthly: Math.round((result.cppContribution / 24) * 100) / 100,
        Monthly: Math.round((result.cppContribution / 12) * 100) / 100,
        Annual: result.cppContribution,
      },
      {
        Component: "Employment Insurance (EI)",
        BiWeekly: Math.round((result.eiContribution / 26) * 100) / 100,
        SemiMonthly: Math.round((result.eiContribution / 24) * 100) / 100,
        Monthly: Math.round((result.eiContribution / 12) * 100) / 100,
        Annual: result.eiContribution,
      },
      {
        Component: "RRSP Deduction",
        BiWeekly: Math.round((result.rrspDeduction / 26) * 100) / 100,
        SemiMonthly: Math.round((result.rrspDeduction / 24) * 100) / 100,
        Monthly: Math.round((result.rrspDeduction / 12) * 100) / 100,
        Annual: result.rrspDeduction,
      },
      {
        Component: "Net Take-Home Pay",
        BiWeekly: result.netBiWeeklyTakeHome,
        SemiMonthly: result.netSemiMonthlyTakeHome,
        Monthly: result.netMonthlyTakeHome,
        Annual: result.netAnnualTakeHome,
      },
    ];
  }, [result]);

  const formatCurrency = (val: number): string => {
    return `$${val.toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const llmPrompt = useMemo(() => {
    return `Analyze my Canadian Paycheck & Take-Home breakdown (2024 CRA tax year):
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
    <CalcCard
      title="Canada Paycheck & Salary Take-Home Calculator (CRA 2024)"
      subtitle="Calculate your exact Canadian take-home pay after Federal tax, Provincial tax, CPP/CPP2, EI, and RRSP deductions across Ontario, BC, Alberta, and Quebec."
      icon={DollarSign}
      badge="Canada • CRA 2024"
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
          <div className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs flex items-center gap-1.5">
            <span>🇨🇦</span>
            <span>Canada Paycheck</span>
          </div>
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
              onChange={(val) => setGrossSalary(Number(val) || 0)}
              prefix="$"
              min={0}
              step={1000}
              helpText="Your total annual pre-tax base salary in Canadian Dollars ($ CAD)"
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

          <CalcSelect
            id="province"
            label="Province / Territory"
            value={province}
            onChange={(val) =>
              setProvince(val as "ON" | "BC" | "AB" | "QC")
            }
            options={PROVINCE_OPTIONS}
            helperText="Provincial tax rates and basic personal exemption amounts for 2024"
          />

          <CalcSlider
            id="rrsp-contribution-percent"
            label="RRSP Contribution"
            value={rrspContributionPercent}
            onChange={setRrspContributionPercent}
            min={0}
            max={18}
            step={1}
            unit="%"
            helpText="Registered Retirement Savings Plan pre-tax deduction (statutory CRA limit up to 18%)"
          />

          <div className="pt-2 flex flex-wrap gap-3">
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
              label="Share Canada Paycheck Plan"
            />
            <CalcPromptButton promptText={llmPrompt} />
            <CalcExportButton
              data={exportSchedule}
              filename="canada-paycheck-take-home-breakdown"
              sheetName="Canada Paycheck Breakdown"
            />
          </div>
        </div>

        {/* Right Results */}
        <div className="space-y-4">
          <CalcResult
            title="Canadian Take-Home Pay Summary"
            primaryLabel="Net Bi-Weekly Take-Home"
            primaryValue={formatCurrency(result.netBiWeeklyTakeHome)}
            primarySubtext={`Monthly: ${formatCurrency(result.netMonthlyTakeHome)} • Annual: ${formatCurrency(result.netAnnualTakeHome)}`}
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
  );
}
