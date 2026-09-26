"use client";

import React, { useState, useMemo } from "react";
import { Briefcase } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcSelect,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcExportButton,
  CalcPdfReportButton,
  CalcShareButton,
  CalcSaveButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import { calculateUsSalary, UsSalaryInput } from "@/lib/engines/financial-engine";
import { generateSalaryDossierPdf } from "@/lib/engines/pdf-dossier-engine";
import { RemittancePartnerCard } from "@/components/finance";

export interface SalaryCalculatorProps {
  initialValues?: Partial<{
    regime: "US" | "IN";
    // US fields
    grossSalary: number;
    filingStatus: "single" | "married";
    k401ContributionPercent: number;
    stateTaxPercent: number;
    pretaxDeductionsMonthly: number;
    // India fields
    annualCtc: number;
    epfPercent: number;
    professionalTaxMonthly: number;
  }>;
}

export function SalaryCalculator({ initialValues }: SalaryCalculatorProps = {}) {
  const currencyCtx = useCurrency();
  const detectedMarket = currencyCtx?.market;

  const [regime, setRegime] = useState<"US" | "IN">(() => {
    if (initialValues?.regime) return initialValues.regime;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("regime");
      if (q === "US" || q === "IN") return q;
    }
    return detectedMarket === "IN" ? "IN" : "US";
  });

  // --- US Mode State ---
  const [grossSalary, setGrossSalary] = useState<number>(() => {
    if (initialValues?.grossSalary !== undefined) return initialValues.grossSalary;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("grossSalary");
      if (q) return Number(q);
    }
    return 100000;
  });

  const [filingStatus, setFilingStatus] = useState<"single" | "married">(() => {
    if (initialValues?.filingStatus !== undefined) return initialValues.filingStatus;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("filingStatus");
      if (q === "single" || q === "married") return q;
    }
    return "single";
  });

  const [k401Percent, setK401Percent] = useState<number>(() => {
    if (initialValues?.k401ContributionPercent !== undefined) return initialValues.k401ContributionPercent;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("k401Percent");
      if (q) return Number(q);
    }
    return 5;
  });

  const [stateTaxPercent, setStateTaxPercent] = useState<number>(() => {
    if (initialValues?.stateTaxPercent !== undefined) return initialValues.stateTaxPercent;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("stateTaxPercent");
      if (q) return Number(q);
    }
    return 5;
  });

  const [pretaxDeductionsMonthly, setPretaxDeductionsMonthly] = useState<number>(() => {
    if (initialValues?.pretaxDeductionsMonthly !== undefined) return initialValues.pretaxDeductionsMonthly;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("pretaxDeductionsMonthly");
      if (q) return Number(q);
    }
    return 200;
  });

  // --- India Mode State ---
  const [annualCtc, setAnnualCtc] = useState<number>(() => {
    if (initialValues?.annualCtc !== undefined) return initialValues.annualCtc;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("annualCtc");
      if (q) return Number(q);
    }
    return 1200000;
  });

  const [epfPercent, setEpfPercent] = useState<number>(() => {
    if (initialValues?.epfPercent !== undefined) return initialValues.epfPercent;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("epfPercent");
      if (q) return Number(q);
    }
    return 12;
  });

  const [professionalTaxMonthly, setProfessionalTaxMonthly] = useState<number>(() => {
    if (initialValues?.professionalTaxMonthly !== undefined) return initialValues.professionalTaxMonthly;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("professionalTaxMonthly");
      if (q) return Number(q);
    }
    return 200;
  });

  // --- US Computations ---
  const usResult = useMemo(() => {
    return calculateUsSalary({
      grossSalary,
      filingStatus,
      k401ContributionPercent: k401Percent,
      stateTaxPercent,
      pretaxDeductionsMonthly,
    });
  }, [grossSalary, filingStatus, k401Percent, stateTaxPercent, pretaxDeductionsMonthly]);

  // --- India Computations ---
  const inResult = useMemo(() => {
    const ctc = Math.max(0, annualCtc);
    const mGross = ctc / 12;
    const basicPay = ctc * 0.5;
    const annualEpf = (basicPay * Math.max(0, epfPercent)) / 100;
    const mEpf = annualEpf / 12;
    const mPt = Math.max(0, professionalTaxMonthly);
    const annualPt = mPt * 12;

    const taxable = Math.max(0, ctc - 75000 - annualPt);
    let aTax = 0;
    if (taxable > 1500000) {
      aTax = 150000 + (taxable - 1500000) * 0.3;
    } else if (taxable > 1200000) {
      aTax = 90000 + (taxable - 1200000) * 0.2;
    } else if (taxable > 1000000) {
      aTax = 60000 + (taxable - 1000000) * 0.15;
    } else if (taxable > 700000) {
      aTax = 20000 + (taxable - 700000) * 0.1;
    } else if (taxable > 300000) {
      aTax = (taxable - 300000) * 0.05;
    }
    aTax = aTax * 1.04;

    const mTax = aTax / 12;
    const mTakeHome = Math.max(0, mGross - mEpf - mPt - mTax);
    const aTakeHome = mTakeHome * 12;
    const aDeductions = ctc - aTakeHome;

    return {
      monthlyGross: Math.round(mGross),
      monthlyEpf: Math.round(mEpf),
      monthlyTax: Math.round(mTax),
      monthlyPt: Math.round(mPt),
      monthlyTakeHome: Math.round(mTakeHome),
      annualTakeHome: Math.round(aTakeHome),
      annualDeductions: Math.round(aDeductions),
      annualTax: Math.round(aTax),
      annualPt: Math.round(annualPt),
      annualEpf: Math.round(annualEpf),
      effectiveTaxRate: ctc > 0 ? roundTo2((aTax / ctc) * 100) : 0,
    };
  }, [annualCtc, epfPercent, professionalTaxMonthly]);

  // Chart data
  const chartData = useMemo(() => {
    if (regime === "US") {
      return [
        { label: "Gross Salary", amount: usResult.grossSalary },
        { label: "Take-Home Pay", amount: usResult.netAnnualTakeHome },
        { label: "Federal Tax", amount: usResult.federalIncomeTax },
        { label: "FICA (SS+Med)", amount: roundTo2(usResult.socialSecurityTax + usResult.medicareTax) },
        { label: "State Tax", amount: usResult.stateIncomeTax },
        { label: "401(k) + Pre-tax", amount: roundTo2(usResult.k401Deduction + pretaxDeductionsMonthly * 12) },
      ];
    }
    return [
      { label: "Gross CTC", amount: annualCtc },
      { label: "Take-Home", amount: inResult.annualTakeHome },
      { label: "Total Deductions", amount: inResult.annualDeductions },
      { label: "EPF Saved", amount: inResult.monthlyEpf * 12 },
      { label: "Income Tax", amount: inResult.monthlyTax * 12 },
    ];
  }, [regime, usResult, pretaxDeductionsMonthly, annualCtc, inResult]);

  // Export Schedule
  const exportSchedule = useMemo(() => {
    if (regime === "US") {
      return [
        { Component: "Gross Salary", Monthly: usResult.monthlyGross, Annual: usResult.grossSalary },
        { Component: "Social Security (FICA 6.2%)", Monthly: roundTo2(usResult.socialSecurityTax / 12), Annual: usResult.socialSecurityTax },
        { Component: "Medicare (FICA 1.45% + surtax)", Monthly: roundTo2(usResult.medicareTax / 12), Annual: usResult.medicareTax },
        { Component: "Federal Income Tax", Monthly: roundTo2(usResult.federalIncomeTax / 12), Annual: usResult.federalIncomeTax },
        { Component: "State Income Tax", Monthly: roundTo2(usResult.stateIncomeTax / 12), Annual: usResult.stateIncomeTax },
        { Component: "401(k) Contribution", Monthly: roundTo2(usResult.k401Deduction / 12), Annual: usResult.k401Deduction },
        { Component: "Pre-tax Deductions (Health/Dental/FSA)", Monthly: pretaxDeductionsMonthly, Annual: pretaxDeductionsMonthly * 12 },
        { Component: "Net Bi-Weekly Take-Home", Monthly: roundTo2(usResult.netBiWeeklyTakeHome * 2.16667), Annual: roundTo2(usResult.netBiWeeklyTakeHome * 26) },
        { Component: "Net Take-Home Pay", Monthly: usResult.netMonthlyTakeHome, Annual: usResult.netAnnualTakeHome },
      ];
    }
    return [
      { Component: "Annual Cost to Company (CTC)", Monthly: inResult.monthlyGross, Annual: annualCtc },
      { Component: "Employee Provident Fund (EPF)", Monthly: inResult.monthlyEpf, Annual: inResult.monthlyEpf * 12 },
      { Component: "Professional Tax (PT)", Monthly: inResult.monthlyPt, Annual: inResult.monthlyPt * 12 },
      { Component: "Estimated Income Tax TDS", Monthly: inResult.monthlyTax, Annual: inResult.monthlyTax * 12 },
      { Component: "Net In-Hand Salary", Monthly: inResult.monthlyTakeHome, Annual: inResult.annualTakeHome },
    ];
  }, [regime, usResult, pretaxDeductionsMonthly, inResult, annualCtc]);

  // Prompt for ChatGPT
  const llmPrompt = useMemo(() => {
    if (regime === "US") {
      return `Analyze my US paycheck breakdown:
- Gross Annual Salary: $${usResult.grossSalary.toLocaleString()}
- Filing Status: ${filingStatus}
- Net Monthly Take-Home: $${usResult.netMonthlyTakeHome.toLocaleString()}
- Net Bi-Weekly Take-Home: $${usResult.netBiWeeklyTakeHome.toLocaleString()}
- Social Security Tax: $${usResult.socialSecurityTax.toLocaleString()}
- Medicare Tax: $${usResult.medicareTax.toLocaleString()}
- Federal Income Tax: $${usResult.federalIncomeTax.toLocaleString()}
- State Income Tax: $${usResult.stateIncomeTax.toLocaleString()}
- 401(k) Annual Contribution: $${usResult.k401Deduction.toLocaleString()}
- Pre-tax Deductions (Health/FSA): $${(pretaxDeductionsMonthly * 12).toLocaleString()}/yr
- Effective Tax Rate: ${usResult.effectiveTaxRate}%

Please advise on tax optimization strategies, HSA/FSA contributions, 401(k) company match, and maximizing bi-weekly paycheck in-hand pay.`;
    }
    return `Analyze my salary breakdown:
- Gross Annual CTC: ₹${annualCtc.toLocaleString()}
- Monthly Gross: ₹${inResult.monthlyGross.toLocaleString()}
- Monthly EPF: ₹${inResult.monthlyEpf.toLocaleString()}
- Monthly Professional Tax: ₹${inResult.monthlyPt.toLocaleString()}
- Monthly Tax TDS: ₹${inResult.monthlyTax.toLocaleString()}
- Net Monthly Take-Home: ₹${inResult.monthlyTakeHome.toLocaleString()}

Please advise on tax saving strategies, voluntary PF benefits, and salary restructuring to maximize in-hand pay.`;
  }, [regime, usResult, filingStatus, pretaxDeductionsMonthly, annualCtc, inResult]);

  return (
    <div className="space-y-6">
      <CalcCard
      title={
        regime === "US"
          ? "Salary & Take-Home Paycheck Calculator (US 2024)"
          : "Salary & In-Hand Pay Calculator (India FY 2024-25)"
      }
      subtitle={
        regime === "US"
          ? "Calculate your exact take-home pay after Federal income tax, FICA (Social Security & Medicare), State tax, and 401(k) contributions."
          : "Calculate your exact monthly take-home salary from gross annual CTC after EPF, professional tax, and Indian Income Tax (New Regime)."
      }
      icon={Briefcase}
      badge={regime === "US" ? "United States • 2024" : "India • FY 2024-25"}
    >
      {/* Country pill switcher */}
      <div className="flex items-center justify-start pb-2">
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setRegime("US")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              regime === "US"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <span>🇺🇸</span>
            <span>United States (W-2)</span>
          </button>
          <button
            type="button"
            onClick={() => setRegime("IN")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              regime === "IN"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <span>🇮🇳</span>
            <span>India (CTC / In-Hand)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Inputs */}
        <div className="space-y-6">
          {regime === "US" ? (
            <>
              <div>
                <CalcInput
                  id="gross-salary"
                  label="Gross Annual Salary"
                  value={grossSalary}
                  onChange={setGrossSalary}
                  prefix="$"
                  min={0}
                  step={5000}
                  helpText="Your total base salary or annual wages before any deductions"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Quick:</span>
                  {[
                    { label: "$50k", val: 50000 },
                    { label: "$75k", val: 75000 },
                    { label: "$100k", val: 100000 },
                    { label: "$125k", val: 125000 },
                    { label: "$150k", val: 150000 },
                    { label: "$200k", val: 200000 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setGrossSalary(p.val)}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                        grossSalary === p.val
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <CalcSelect
                id="filing-status"
                label="Tax Filing Status"
                value={filingStatus}
                onChange={(val) => setFilingStatus(val as "single" | "married")}
                options={[
                  { value: "single", label: "Single" },
                  { value: "married", label: "Married Filing Jointly" },
                ]}
                helperText="Standard deduction 2024: $14,600 (Single) / $29,200 (Married)"
              />
              <CalcSlider
                id="k401-percent"
                label="401(k) Contribution"
                value={k401Percent}
                onChange={setK401Percent}
                min={0}
                max={50}
                step={1}
                unit="%"
                helpText="Traditional pre-tax 401(k) contribution reduces federal taxable income"
              />
              <CalcSlider
                id="state-tax-percent"
                label="Estimated State Income Tax"
                value={stateTaxPercent}
                onChange={setStateTaxPercent}
                min={0}
                max={15}
                step={0.1}
                unit="%"
                helpText="Average state tax rate (0% in TX/FL/WA, ~5% in IL/MA, up to 13.3% in CA)"
              />
              <CalcInput
                id="pretax-deductions-monthly"
                label="Pre-tax Deductions (Monthly)"
                value={pretaxDeductionsMonthly}
                onChange={setPretaxDeductionsMonthly}
                prefix="$"
                min={0}
                step={50}
                helpText="Health insurance premiums, HSA, FSA, dental, and vision ($/month)"
              />
            </>
          ) : (
            <>
              <div>
                <CalcInput
                  id="annual-ctc"
                  label="Gross Annual CTC"
                  value={annualCtc}
                  onChange={setAnnualCtc}
                  prefix="₹"
                  min={100000}
                  step={50000}
                  helpText="Total cost-to-company quoted in your offer letter"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Quick:</span>
                  {[
                    { label: "₹6L", val: 600000 },
                    { label: "₹10L", val: 1000000 },
                    { label: "₹12L", val: 1200000 },
                    { label: "₹15L", val: 1500000 },
                    { label: "₹20L", val: 2000000 },
                    { label: "₹25L", val: 2500000 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAnnualCtc(p.val)}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                        annualCtc === p.val
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <CalcSlider
                id="epf-percent"
                label="Employee Provident Fund (EPF % of Basic)"
                value={epfPercent}
                onChange={setEpfPercent}
                min={0}
                max={12}
                step={1}
                unit="%"
                helpText="Standard EPF contribution is 12% of basic salary"
              />
              <CalcInput
                id="professional-tax"
                label="Monthly Professional Tax"
                value={professionalTaxMonthly}
                onChange={setProfessionalTaxMonthly}
                prefix="₹"
                min={0}
                max={2500}
                step={50}
                helpText="State professional tax (typically ₹200/month)"
              />
            </>
          )}

          <div className="pt-2 flex flex-wrap gap-3">
            <CalcSaveButton
              toolSlug="salary-calculator"
              toolName="Salary & Take-Home Calculator"
              summaryTitle={
                regime === "US"
                  ? `Salary: $${grossSalary.toLocaleString()} (Take-Home: $${usResult.netMonthlyTakeHome.toLocaleString()}/mo)`
                  : `Salary: ₹${annualCtc.toLocaleString()} CTC (In-Hand: ₹${inResult.monthlyTakeHome.toLocaleString()}/mo)`
              }
              summaryMetrics={
                regime === "US"
                  ? [
                      { label: "Monthly Take-Home", value: `$${usResult.netMonthlyTakeHome.toLocaleString()}` },
                      { label: "Bi-Weekly Take-Home", value: `$${usResult.netBiWeeklyTakeHome.toLocaleString()}` },
                      { label: "Federal Tax", value: `$${usResult.federalIncomeTax.toLocaleString()}` },
                      { label: "Effective Tax Rate", value: `${usResult.effectiveTaxRate}%` },
                    ]
                  : [
                      { label: "Monthly In-Hand", value: `₹${inResult.monthlyTakeHome.toLocaleString()}` },
                      { label: "Annual In-Hand", value: `₹${inResult.annualTakeHome.toLocaleString()}` },
                      { label: "Monthly EPF", value: `₹${inResult.monthlyEpf.toLocaleString()}` },
                      { label: "Annual Tax", value: `₹${inResult.annualTax.toLocaleString()}` },
                    ]
              }
            />
            <CalcShareButton
              state={
                regime === "US"
                  ? {
                      regime: "US",
                      grossSalary,
                      filingStatus,
                      k401Percent,
                      stateTaxPercent,
                      pretaxDeductionsMonthly,
                    }
                  : {
                      regime: "IN",
                      annualCtc,
                      epfPercent,
                      professionalTaxMonthly,
                    }
              }
              label={regime === "US" ? "Share Paycheck Plan" : "Share Take-Home Plan"}
            />
            <CalcPromptButton promptText={llmPrompt} />
            <CalcExportButton
              data={exportSchedule}
              filename={regime === "US" ? "us-paycheck-breakdown" : "salary-breakdown"}
              sheetName="Salary Summary"
            />
            <CalcPdfReportButton
              filename={regime === "US" ? `us_salary_dossier_${grossSalary}.pdf` : `india_salary_dossier_${annualCtc}.pdf`}
              label="Download Salary Dossier (PDF)"
              onGenerate={() =>
                generateSalaryDossierPdf(
                  regime === "US"
                    ? {
                        grossSalary,
                        netAnnualTakeHome: usResult.netAnnualTakeHome,
                        netMonthlyTakeHome: usResult.netMonthlyTakeHome,
                        netBiWeeklyTakeHome: usResult.netBiWeeklyTakeHome,
                        federalTax: usResult.federalIncomeTax,
                        stateTax: usResult.stateIncomeTax,
                        ficaTax: usResult.socialSecurityTax + usResult.medicareTax,
                        effectiveTaxRate: usResult.effectiveTaxRate,
                        currencySymbol: "$",
                        regimeLabel: "US 2026",
                      }
                    : {
                        grossSalary: annualCtc,
                        netAnnualTakeHome: inResult.annualTakeHome,
                        netMonthlyTakeHome: inResult.monthlyTakeHome,
                        netBiWeeklyTakeHome: Math.round(inResult.annualTakeHome / 26),
                        federalTax: inResult.annualTax,
                        stateTax: inResult.annualPt,
                        ficaTax: inResult.annualEpf,
                        effectiveTaxRate: inResult.effectiveTaxRate,
                        currencySymbol: "₹",
                        regimeLabel: "India FY 2024-25",
                      }
                )
              }
            />
          </div>
        </div>

        {/* Right Results */}
        <div className="space-y-4">
          {regime === "US" ? (
            <CalcResult
              title="Paycheck & Take-Home Summary"
              primaryLabel="Net Monthly Take-Home"
              primaryValue={`$${usResult.netMonthlyTakeHome.toLocaleString()}`}
              primarySubtext={`Bi-Weekly: $${usResult.netBiWeeklyTakeHome.toLocaleString()} (26 paychecks) • Annual: $${usResult.netAnnualTakeHome.toLocaleString()}`}
              copyValue={`US Take-Home Pay: $${usResult.netMonthlyTakeHome.toLocaleString()}/mo ($${usResult.netBiWeeklyTakeHome.toLocaleString()} bi-weekly, $${usResult.netAnnualTakeHome.toLocaleString()}/yr) | Gross: $${grossSalary.toLocaleString()} | Effective Tax: ${usResult.effectiveTaxRate}%`}
              columns={2}
              items={[
                {
                  label: "Bi-Weekly Take-Home",
                  value: `$${usResult.netBiWeeklyTakeHome.toLocaleString()}`,
                  subtext: "Every 2 weeks (26 periods)",
                  highlight: true,
                },
                {
                  label: "Federal Income Tax",
                  value: `$${usResult.federalIncomeTax.toLocaleString()}`,
                  subtext: `Taxable: $${usResult.federalTaxableIncome.toLocaleString()}`,
                },
                {
                  label: "FICA: Social Security",
                  value: `$${usResult.socialSecurityTax.toLocaleString()}`,
                  subtext: "6.2% up to $168,600 cap",
                },
                {
                  label: "FICA: Medicare",
                  value: `$${usResult.medicareTax.toLocaleString()}`,
                  subtext: "1.45% base + 0.9% surtax",
                },
                {
                  label: "State Income Tax",
                  value: `$${usResult.stateIncomeTax.toLocaleString()}`,
                  subtext: `${stateTaxPercent}% estimated`,
                },
                {
                  label: "401(k) Retirement",
                  value: `$${usResult.k401Deduction.toLocaleString()}`,
                  subtext: `${k401Percent}% pre-tax savings`,
                },
                {
                  label: "Effective Tax Rate",
                  value: `${usResult.effectiveTaxRate}%`,
                  subtext: "Taxes / Gross Salary",
                },
              ]}
            />
          ) : (
            <CalcResult
              title="Monthly Take-Home Summary"
              primaryLabel="Net In-Hand Paycheck"
              primaryValue={`₹${inResult.monthlyTakeHome.toLocaleString()}`}
              primarySubtext={`Annual In-Hand: ₹${inResult.annualTakeHome.toLocaleString()}`}
              copyValue={`India In-Hand Salary: ₹${inResult.monthlyTakeHome.toLocaleString()}/mo (₹${inResult.annualTakeHome.toLocaleString()}/yr) | Gross CTC: ₹${annualCtc.toLocaleString()} | Monthly EPF: ₹${inResult.monthlyEpf.toLocaleString()} | Monthly Tax: ₹${inResult.monthlyTax.toLocaleString()}`}
              columns={2}
              items={[
                {
                  label: "Monthly EPF",
                  value: `₹${inResult.monthlyEpf.toLocaleString()}`,
                  subtext: "Retirement savings",
                  highlight: true,
                },
                {
                  label: "Monthly Tax TDS",
                  value: `₹${inResult.monthlyTax.toLocaleString()}`,
                  subtext: "Estimated income tax",
                },
                {
                  label: "Monthly Gross",
                  value: `₹${inResult.monthlyGross.toLocaleString()}`,
                },
                {
                  label: "Annual Deductions",
                  value: `₹${inResult.annualDeductions.toLocaleString()}`,
                },
              ]}
            />
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <CalcChart
          title={
            regime === "US"
              ? "Annual Paycheck & Deductions Distribution"
              : "Salary Distribution & Deductions"
          }
          data={chartData}
          series={[
            {
              key: "amount",
              name: regime === "US" ? "Amount ($)" : "Amount (₹)",
              color: "#10b981",
              gradientId: "salaryGrad",
            },
          ]}
        />
      </div>
      </CalcCard>
      <RemittancePartnerCard
        sourceCurrency={regime === "US" ? "USD" : "INR"}
        targetCurrency={regime === "US" ? "INR" : "USD"}
      />
    </div>
  );
}

function roundTo2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
