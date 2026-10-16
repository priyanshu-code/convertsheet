"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Home, Table as TableIcon, ShieldCheck } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcSelect,
  CalcResult,
  CalcChart,
  CalcExportButton,
  CalcPromptButton,
  CalcPdfReportButton,
  CalcSaveButton,
  CalcShareButton,
  MortgageTermComparisonTable,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import { calculateMortgage } from "@/lib/engines/financial-engine";
import { generateMortgageDossierPdf } from "@/lib/engines/pdf-dossier-engine";
import { formatDecimals } from "@/lib/math-utils";
import { MortgageRatesCard } from "@/components/finance";

export interface MortgageCalculatorProps {
  initialValues?: Partial<{
    homePrice: number;
    downPayment: number;
    interestRate: number;
    loanTermYears: number;
    propertyTaxYearly: number;
    homeInsuranceYearly: number;
    extraPayment: number;
  }>;
}

export function MortgageCalculator({ initialValues }: MortgageCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();
  const [homePrice, setHomePrice] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("homePrice");
      if (p) return Number(p);
    }
    return Number(initialValues?.homePrice) || 400000;
  });

  const [downPayment, setDownPayment] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const d = new URLSearchParams(window.location.search).get("downPayment");
      if (d) return Number(d);
    }
    return Number(initialValues?.downPayment) || 80000;
  });

  const [interestRate, setInterestRate] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const r = new URLSearchParams(window.location.search).get("interestRate");
      if (r) return Number(r);
    }
    return Number(initialValues?.interestRate) || 6.5;
  });

  const [loanTermYears, setLoanTermYears] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get("loanTermYears");
      if (t) return Number(t);
    }
    return Number(initialValues?.loanTermYears) || 30;
  });

  const [propertyTaxYearly, setPropertyTaxYearly] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const tx = new URLSearchParams(window.location.search).get("propertyTaxYearly");
      if (tx) return Number(tx);
    }
    return Number(initialValues?.propertyTaxYearly) || 4800;
  });

  const [homeInsuranceYearly, setHomeInsuranceYearly] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const ins = new URLSearchParams(window.location.search).get("homeInsuranceYearly");
      if (ins) return Number(ins);
    }
    return Number(initialValues?.homeInsuranceYearly) || 1200;
  });

  const [extraPayment, setExtraPayment] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const ex = new URLSearchParams(window.location.search).get("extraPayment");
      if (ex) return Number(ex);
    }
    return Number(initialValues?.extraPayment) || 0;
  });

  const [scheduleView, setScheduleView] = useState<"yearly" | "monthly">("yearly");

  const downPaymentPercent = homePrice > 0 ? Math.round((downPayment / homePrice) * 100) : 0;

  const handleDownPaymentPercentChange = (pct: number) => {
    setDownPayment(Math.round((homePrice * pct) / 100));
  };

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("homePrice", homePrice.toString());
    params.set("downPayment", downPayment.toString());
    params.set("interestRate", interestRate.toString());
    params.set("loanTermYears", loanTermYears.toString());
    params.set("propertyTaxYearly", propertyTaxYearly.toString());
    params.set("homeInsuranceYearly", homeInsuranceYearly.toString());
    if (extraPayment > 0) {
      params.set("extraPayment", extraPayment.toString());
    } else {
      params.delete("extraPayment");
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [homePrice, downPayment, interestRate, loanTermYears, propertyTaxYearly, homeInsuranceYearly, extraPayment]);

  const mortgage = useMemo(() => {
    return calculateMortgage({
      homePrice,
      downPayment,
      interestRate,
      loanTermYears,
      propertyTaxYearly,
      homeInsuranceYearly,
      extraMonthlyPayment: extraPayment,
    });
  }, [
    homePrice,
    downPayment,
    interestRate,
    loanTermYears,
    propertyTaxYearly,
    homeInsuranceYearly,
    extraPayment,
  ]);

  // Chart data for visual payoff curve
  const chartData = useMemo(() => {
    let cumPrincipal = 0;
    return mortgage.yearlySchedule.map((row) => {
      cumPrincipal += row.principal;
      return {
        label: `Yr ${row.period}`,
        balance: row.balance,
        principalPaid: Math.round(cumPrincipal),
        interestPaid: Math.round(row.totalInterest),
      };
    });
  }, [mortgage.yearlySchedule]);

  // Exportable schedule for SheetJS with live brand retention hook
  const exportData = useMemo(() => {
    const activeSchedule = scheduleView === "yearly" ? mortgage.yearlySchedule : mortgage.monthlySchedule;
    return activeSchedule.map((row) => ({
      Period: row.label,
      Payment: row.payment,
      Principal: row.principal,
      Interest: row.interest,
      "Total Interest": row.totalInterest,
      "Remaining Balance": row.balance,
      "ConvertSheet Model": "https://www.convertsheet.com/tools/mortgage-calculator",
    }));
  }, [scheduleView, mortgage.yearlySchedule, mortgage.monthlySchedule]);

  const aiPrompt = useMemo(() => {
    return `Analyze this mortgage financing scenario:
- Home Purchase Price: $${homePrice.toLocaleString()}
- Down Payment: $${downPayment.toLocaleString()} (${downPaymentPercent}%)
- Loan Amount: $${mortgage.loanAmount.toLocaleString()}
- Interest Rate: ${interestRate}%
- Loan Term: ${loanTermYears} years
- Property Tax: $${propertyTaxYearly.toLocaleString()}/yr
- Home Insurance: $${homeInsuranceYearly.toLocaleString()}/yr
- Extra Principal Payment: $${extraPayment.toLocaleString()}/mo
- Total Monthly Payment: $${mortgage.totalMonthlyPayment.toLocaleString()}
- Total Interest Paid: $${mortgage.totalInterest.toLocaleString()}
${extraPayment > 0 ? `- Total Interest Saved: $${mortgage.interestSavedWithExtra.toLocaleString()} (Paid off ${mortgage.monthsSavedWithExtra} months early)` : ""}

Provide financial advice on whether refinancing or making extra principal payments would optimize my long-term equity and tax deductions.`;
  }, [
    homePrice,
    downPayment,
    downPaymentPercent,
    mortgage,
    interestRate,
    loanTermYears,
    propertyTaxYearly,
    homeInsuranceYearly,
    extraPayment,
  ]);

  return (
    <div className="space-y-8 pb-24 sm:pb-0">
      <CalcCard
        title="Mortgage Calculator with Amortization Schedule"
      subtitle="Calculate your total monthly mortgage payment including principal, interest, taxes, insurance, and PMI with full amortization schedule export."
      icon={Home}
      badge="SheetJS Export"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Inputs, Sliders, Terms, Taxes & Insurance */}
        <div className="lg:col-span-7 space-y-6">
          {/* Zero-Knowledge Privacy Reassurance Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">100% Client-Side In-Browser Computation • No loan or financial data leaves your browser</span>
          </div>

          {/* Market Rate Freshness Signal */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span className="font-medium">Updated for October 2026 Freddie Mac PMMS: 30-Year Fixed at 7.40%, 15-Year Fixed at 6.71%</span>
          </div>

        {/* Top Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <CalcInput
              id="home-price"
              label="Home Purchase Price"
              value={homePrice}
              onChange={(val) => {
                const p = Number(val) || 0;
                setHomePrice(p);
                setDownPayment(Math.round((p * downPaymentPercent) / 100));
              }}
              type="number"
              min={10000}
              step={5000}
              prefix={currencySymbol}
            />
            <CalcSlider
              id="home-price-slider"
              ariaLabel="Home price slider"
              value={homePrice}
              min={50000}
              max={2000000}
              step={5000}
              prefix={currencySymbol}
              onChange={(val) => {
                setHomePrice(val);
                setDownPayment(Math.round((val * downPaymentPercent) / 100));
              }}
            />
          </div>

          <div className="space-y-2">
            <CalcInput
              id="down-payment"
              label={`Down Payment (${downPaymentPercent}%)`}
              value={downPayment}
              onChange={(val) => setDownPayment(Number(val) || 0)}
              type="number"
              min={0}
              max={homePrice}
              step={1000}
              prefix={currencySymbol}
            />
            <CalcSlider
              id="down-payment-slider"
              ariaLabel="Down payment percentage slider"
              value={downPaymentPercent}
              min={0}
              max={50}
              step={1}
              unit="%"
              onChange={(pct) => handleDownPaymentPercentChange(pct)}
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[5, 10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleDownPaymentPercentChange(pct)}
                  className={`min-h-[44px] px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    downPaymentPercent === pct
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {pct}%{pct >= 20 ? " (No PMI)" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <CalcInput
              id="interest-rate"
              label="Interest Rate (Annual %)"
              value={interestRate}
              onChange={(val) => setInterestRate(Number(val) || 0)}
              type="number"
              min={0.1}
              max={25}
              step={0.1}
              suffix="%"
            />
            <CalcSlider
              id="interest-rate-slider"
              ariaLabel="Mortgage interest rate slider"
              value={interestRate}
              min={2.0}
              max={14.0}
              step={0.1}
              unit="%"
              onChange={(val) => setInterestRate(val)}
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { label: "7.40% (30Y Fixed)", rate: 7.4 },
                { label: "6.71% (15Y Fixed)", rate: 6.71 },
                { label: "6.85% (FHA/VA)", rate: 6.85 },
                { label: "6.50%", rate: 6.5 },
              ].map((preset) => (
                <button
                  key={preset.rate}
                  type="button"
                  onClick={() => setInterestRate(preset.rate)}
                  className={`min-h-[44px] px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    interestRate === preset.rate
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <CalcSelect
              id="loan-term"
              label="Loan Term"
              value={loanTermYears.toString()}
              onChange={(val) => setLoanTermYears(Number(val))}
              options={[
                { label: "30 Years (Fixed)", value: "30" },
                { label: "20 Years (Fixed)", value: "20" },
                { label: "15 Years (Fixed)", value: "15" },
                { label: "10 Years (Fixed)", value: "10" },
              ]}
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[15, 20, 30].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLoanTermYears(term)}
                  className={`min-h-[44px] px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    loanTermYears === term
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {term} Years
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Taxes, Insurance & Extra Payment Accordion/Grid */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
            Taxes, Insurance &amp; Extra Payments
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CalcInput
              id="property-tax"
              label="Property Tax (Yearly)"
              value={propertyTaxYearly}
              onChange={(val) => setPropertyTaxYearly(Number(val) || 0)}
              type="number"
              min={0}
              step={100}
              prefix={currencySymbol}
            />

            <CalcInput
              id="home-insurance"
              label="Home Insurance (Yearly)"
              value={homeInsuranceYearly}
              onChange={(val) => setHomeInsuranceYearly(Number(val) || 0)}
              type="number"
              min={0}
              step={50}
              prefix={currencySymbol}
            />

            <CalcInput
              id="extra-payment"
              label="Extra Monthly Principal"
              value={extraPayment}
              onChange={(val) => setExtraPayment(Number(val) || 0)}
              type="number"
              min={0}
              step={50}
              prefix={currencySymbol}
              helpText="Shortens loan term & saves interest"
            />
          </div>
        </div>

        </div>
        {/* End Left Column */}

        {/* Right Column: Sticky Results Summary, Chart & Actions */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* Results Summary */}
          <CalcResult
            title="Monthly Payment Breakdown"
            primaryLabel="Total Monthly Payment"
            primaryValue={formatCurrency(mortgage.totalMonthlyPayment)}
            primarySubtext={`Principal & Interest: ${formatCurrency(mortgage.monthlyPrincipalAndInterest)} • Taxes: ${formatCurrency(mortgage.monthlyPropertyTax)} • Insurance: ${formatCurrency(mortgage.monthlyInsurance)}${mortgage.monthlyPmi > 0 ? ` • PMI: ${formatCurrency(mortgage.monthlyPmi)}` : ""}`}
            copyValue={`Monthly Payment: ${formatCurrency(mortgage.totalMonthlyPayment)}/mo | Loan: ${formatCurrency(mortgage.loanAmount)} | Total Interest: ${formatCurrency(mortgage.totalInterest)} (${loanTermYears}yr fixed @ ${interestRate}%)`}
            items={[
              {
                label: "Loan Amount Financed",
                value: formatCurrency(mortgage.loanAmount),
              },
              {
                label: "Total Interest Paid",
                value: formatCurrency(mortgage.totalInterest),
                highlight: true,
              },
              {
                label: "Total Loan Cost (P+I)",
                value: formatCurrency(mortgage.totalPayment),
              },
              {
                label: "Payoff Time",
                value: `${mortgage.payoffYears} Years (${mortgage.payoffMonths} mos)`,
              },
              ...(extraPayment > 0
                ? [
                    {
                      label: "Interest Saved by Extra Payment",
                      value: formatCurrency(mortgage.interestSavedWithExtra),
                      highlight: true,
                      badge: `${Math.round(mortgage.monthsSavedWithExtra / 12)} yrs early`,
                    },
                  ]
                : []),
            ]}
          />

          {/* Visual Balance Curve */}
          <CalcChart
            title="Balance Payoff & Equity Projection"
            data={chartData}
            series={[
              {
                key: "balance",
                name: "Remaining Principal",
                color: "#EF4444",
                gradientId: "mortBalanceGrad",
              },
              {
                key: "principalPaid",
                name: "Cumulative Equity Paid",
                color: "#10B981",
                gradientId: "mortPrincGrad",
              },
              {
                key: "interestPaid",
                name: "Cumulative Interest Paid",
                color: "#F59E0B",
                gradientId: "mortIntGrad",
              },
            ]}
            height={200}
            valuePrefix="$"
          />

          {/* Actions bar: Excel Export + PDF Dossier + ChatGPT Copilot */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <CalcExportButton
              data={exportData}
              filename={`mortgage_amortization_${homePrice}`}
              sheetName="Amortization"
              label={`Export ${scheduleView === "yearly" ? "Annual" : "Monthly"} Amortization (.xlsx)`}
            />
            <CalcPdfReportButton
              filename={`mortgage_dossier_${homePrice}.pdf`}
              label="Download Bank-Ready PDF"
              onGenerate={() =>
                generateMortgageDossierPdf({
                  homePrice,
                  downPayment,
                  interestRate,
                  loanTermYears,
                  monthlyPAndI: mortgage.monthlyPrincipalAndInterest,
                  monthlyPropertyTax: mortgage.monthlyPropertyTax,
                  monthlyHomeInsurance: mortgage.monthlyInsurance,
                  totalMonthlyPayment: mortgage.totalMonthlyPayment,
                  totalInterest: mortgage.totalInterest,
                  schedule: mortgage.yearlySchedule.map((row) => ({
                    year: row.period,
                    balance: row.balance,
                    principal: row.principal,
                    interest: row.interest,
                  })),
                })
              }
            />
            <CalcSaveButton
              toolSlug="mortgage-calculator"
              toolName="Mortgage & Amortization Calculator"
              summaryTitle={`$${homePrice.toLocaleString()} Home (${loanTermYears}yr @ ${interestRate}%)`}
              summaryMetrics={[
                { label: "Monthly Payment", value: `$${mortgage.totalMonthlyPayment.toLocaleString()}/mo` },
                { label: "Principal & Interest", value: `$${mortgage.monthlyPrincipalAndInterest.toLocaleString()}/mo` },
                { label: "Loan Amount", value: `$${mortgage.loanAmount.toLocaleString()}` },
                { label: "Total Interest", value: `$${mortgage.totalInterest.toLocaleString()}` },
              ]}
            />
            <CalcShareButton
              state={{
                homePrice,
                downPayment,
                interestRate,
                loanTermYears,
                propertyTaxYearly,
                homeInsuranceYearly,
                extraPayment,
              }}
              label="Share Scenario"
            />
            <CalcPromptButton prompt={aiPrompt} toolName="Mortgage Analysis" />
          </div>
        </div>
        {/* End Right Column */}
      </div>
      {/* End 12-Column Grid */}

      {/* Full-Width Amortization Schedule */}
      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Amortization Schedule ({scheduleView === "yearly" ? `${mortgage.yearlySchedule.length} Years` : `${mortgage.monthlySchedule.length} Months`})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing first {Math.min(60, exportData.length)} rows
            </span>
            <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setScheduleView("yearly")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  scheduleView === "yearly"
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Yearly Breakdown
              </button>
              <button
                type="button"
                onClick={() => setScheduleView("monthly")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  scheduleView === "monthly"
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Monthly Breakdown
              </button>
            </div>
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-700/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="max-h-80 overflow-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700/60 text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-zinc-700 dark:text-zinc-300">Period</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-zinc-700 dark:text-zinc-300">Payment</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-zinc-700 dark:text-zinc-300">Principal</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-zinc-700 dark:text-zinc-300">Interest</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-zinc-700 dark:text-zinc-300">Total Interest</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-zinc-700 dark:text-zinc-300">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 font-mono">
                {exportData.slice(0, 60).map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200 whitespace-nowrap font-sans">{row.Period}</td>
                    <td className="px-4 py-2 text-right text-zinc-800 dark:text-zinc-200 whitespace-nowrap">${Number(row.Payment).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">${Number(row.Principal).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-amber-600 dark:text-amber-400 whitespace-nowrap">${Number(row.Interest).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-zinc-500 whitespace-nowrap">${Number(row["Total Interest"]).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">${Number(row["Remaining Balance"]).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CalcCard>

    <MortgageRatesCard loanAmount={mortgage.loanAmount} />
    <MortgageTermComparisonTable initialLoanAmount={mortgage.loanAmount} />

    {/* Sticky Bottom Mobile Summary Bar (<640px) */}
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
      <div>
        <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Total Monthly Payment</span>
        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(mortgage.totalMonthlyPayment)}/mo
        </span>
      </div>
      <CalcExportButton
        data={exportData}
        filename={`mortgage_amortization_${homePrice}`}
        sheetName="Amortization"
        label="Export (.xlsx)"
      />
    </div>
  </div>
  );
}
