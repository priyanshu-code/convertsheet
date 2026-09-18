"use client";

import React, { useState, useMemo } from "react";
import { Home, Table as TableIcon } from "lucide-react";
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

  // Exportable schedule for SheetJS
  const exportData = useMemo(() => {
    const activeSchedule = scheduleView === "yearly" ? mortgage.yearlySchedule : mortgage.monthlySchedule;
    return activeSchedule.map((row) => ({
      Period: row.label,
      Payment: row.payment,
      Principal: row.principal,
      Interest: row.interest,
      "Total Interest": row.totalInterest,
      "Remaining Balance": row.balance,
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
    <div className="space-y-8">
      <CalcCard
        title="Mortgage Calculator with Amortization Schedule"
      subtitle="Calculate your total monthly mortgage payment including principal, interest, taxes, insurance, and PMI with full amortization schedule export."
      icon={Home}
      badge="SheetJS Export"
    >
      <div className="space-y-6">
        {/* Top Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="down-payment" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Down Payment ({downPaymentPercent}%)
              </label>
            </div>
            <CalcInput
              id="down-payment"
              label=""
              value={downPayment}
              onChange={(val) => setDownPayment(Number(val) || 0)}
              type="number"
              min={0}
              max={homePrice}
              step={1000}
              prefix={currencySymbol}
            />
          </div>

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

        {/* Results Summary */}
        <CalcResult
          title="Monthly Payment Breakdown"
          primaryLabel="Total Monthly Payment"
          primaryValue={formatCurrency(mortgage.totalMonthlyPayment)}
          primarySubtext={`Principal & Interest: ${formatCurrency(mortgage.monthlyPrincipalAndInterest)} • Taxes: ${formatCurrency(mortgage.monthlyPropertyTax)} • Insurance: ${formatCurrency(mortgage.monthlyInsurance)}${mortgage.monthlyPmi > 0 ? ` • PMI: ${formatCurrency(mortgage.monthlyPmi)}` : ""}`}
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

        {/* Actions bar: Excel Export + PDF Dossier + ChatGPT Copilot */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
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

        {/* Visual Balance Curve */}
        <CalcChart
          title="Mortgage Balance Payoff & Equity Accumulation"
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
        />

        {/* Amortization Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Amortization Schedule ({scheduleView === "yearly" ? `${mortgage.yearlySchedule.length} Years` : `${mortgage.monthlySchedule.length} Months`})
              </span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing first {Math.min(60, exportData.length)} rows
            </span>
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
      </div>
    </CalcCard>

    <MortgageRatesCard loanAmount={mortgage.loanAmount} />
  </div>
  );
}
