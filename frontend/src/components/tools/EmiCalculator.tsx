"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Landmark, ShieldCheck, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcShareButton,
  CalcSaveButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";

export interface EmiCalculatorProps {
  initialValues?: Record<string, unknown>;
}

export function EmiCalculator({ initialValues }: EmiCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  const [loanAmount, setLoanAmount] = useState<number>(() => {
    if (initialValues?.loanAmount !== undefined) return Number(initialValues.loanAmount);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("loanAmount");
      if (q) return Number(q);
    }
    return 1000000;
  });

  const [interestRate, setInterestRate] = useState<number>(() => {
    if (initialValues?.interestRate !== undefined) return Number(initialValues.interestRate);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("interestRate");
      if (q) return Number(q);
    }
    return 8.5;
  });

  const [loanTenureYears, setLoanTenureYears] = useState<number>(() => {
    if (initialValues?.loanTenureYears !== undefined) return Number(initialValues.loanTenureYears);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("loanTenureYears");
      if (q) return Number(q);
    }
    return 15;
  });

  const { monthlyEmi, totalInterest, totalPayment } = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const annualR = Math.max(0.1, interestRate);
    const years = Math.max(1, loanTenureYears);

    const r = annualR / 12 / 100;
    const n = years * 12;

    // EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emi * n;
    const totalInt = Math.max(0, totalPay - P);

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInt),
      totalPayment: Math.round(totalPay),
    };
  }, [loanAmount, interestRate, loanTenureYears]);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("loanAmount", loanAmount.toString());
    params.set("interestRate", interestRate.toString());
    params.set("loanTenureYears", loanTenureYears.toString());
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [loanAmount, interestRate, loanTenureYears]);

  // Loan balance amortization curve year by year
  const chartData = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const annualR = Math.max(0.1, interestRate);
    const years = Math.max(1, loanTenureYears);
    const r = annualR / 12 / 100;
    const n = years * 12;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const data = [];
    let balance = P;
    let cumInterest = 0;
    let cumPrincipal = 0;

    for (let yr = 1; yr <= years; yr++) {
      for (let m = 0; m < 12; m++) {
        const intPayment = balance * r;
        const princPayment = emi - intPayment;
        balance = Math.max(0, balance - princPayment);
        cumInterest += intPayment;
        cumPrincipal += princPayment;
      }
      data.push({
        label: `Yr ${yr}`,
        remainingBalance: Math.round(balance),
        principalPaid: Math.round(cumPrincipal),
        interestPaid: Math.round(cumInterest),
      });
    }
    return data;
  }, [loanAmount, interestRate, loanTenureYears]);

  const handleExportExcel = () => {
    try {
      const summaryRows = [
        ["ConvertSheet - Loan EMI & Amortization Schedule", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/emi-calculator"],
        ["", ""],
        ["--- LOAN TERMS & PARAMETERS ---", ""],
        [`Total Loan Principal (${currencySymbol})`, loanAmount],
        ["Annual Interest Rate (%)", interestRate],
        ["Loan Tenure (Years)", loanTenureYears],
        ["Total Installments (Months)", loanTenureYears * 12],
        ["", ""],
        ["--- REPAYMENT SUMMARY ---", ""],
        [`Monthly EMI Payable (${currencySymbol})`, monthlyEmi],
        [`Total Interest Payable (${currencySymbol})`, totalInterest],
        [`Total Repayment (P + I) (${currencySymbol})`, totalPayment],
        ["Interest to Principal Ratio", `${((totalInterest / loanAmount) * 100).toFixed(1)}%`],
        ["", ""],
        ["--- ANNUAL AMORTIZATION SCHEDULE ---", "", "", ""],
        ["Year", `Principal Paid (${currencySymbol})`, `Interest Paid (${currencySymbol})`, `Remaining Balance (${currencySymbol})`],
        ...chartData.map((d) => [d.label, d.principalPaid, d.interestPaid, d.remainingBalance]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "EMISchedule");
      XLSX.writeFile(
        wb,
        `ConvertSheet_Loan_EMI_${loanAmount}_${interestRate}pct_${loanTenureYears}yrs.xlsx`
      );
    } catch (err) {
      console.error("Excel export failed:", err);
    }
  };

  const aiPrompt = useMemo(() => {
    return `Analyze this loan repayment scenario:
- Total Loan Principal: ${formatCurrency(loanAmount)}
- Annual Interest Rate: ${interestRate}%
- Loan Tenure: ${loanTenureYears} years (${loanTenureYears * 12} monthly installments)
- Computed Metrics:
  • Monthly EMI: ${formatCurrency(monthlyEmi)}
  • Total Interest Payable: ${formatCurrency(totalInterest)}
  • Total Repayment: ${formatCurrency(totalPayment)}
Please evaluate:
1. Impact of making 1 extra EMI payment per year or a 5% annual prepayment.
2. Refinancing or balance transfer break-even if rates drop by 50 bps to 100 bps.
3. Affordability and debt-to-income (DTI) ratio guidance for this loan burden.`;
  }, [loanAmount, interestRate, loanTenureYears, monthlyEmi, totalInterest, totalPayment, formatCurrency]);

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side • Zero Server Storage • Private & Free Forever</span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="font-medium">
          {currencySymbol === "₹"
            ? "Updated for October 2026: RBI Repo Rate 5.50% • Prime Home Loans 8.15%–8.50% (SBI EBLR 8.15%) • Auto Loans 8.85%–9.50%"
            : "Updated for October 2026: 30-Year Mortgages 7.40% • 15-Year Mortgages 6.71% (Freddie Mac PMMS) • Auto Financing 6.90%–7.50%"}
        </span>
      </div>

      <CalcCard
        title="Loan EMI Calculator"
        subtitle="Calculate your monthly installment, total interest expenses, and loan repayment schedule."
        icon={Landmark}
        badge="Bank Approved"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <CalcInput
              id="loan-amount"
              label="Total Loan Principal"
              value={loanAmount}
              min={10000}
              step={50000}
              prefix={currencySymbol}
              onChange={(val) => setLoanAmount(Number(val) || 0)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Quick:</span>
              {(currencySymbol === "₹"
                ? [
                    { label: "₹5L", val: 500000 },
                    { label: "₹10L", val: 1000000 },
                    { label: "₹25L", val: 2500000 },
                    { label: "₹50L", val: 5000000 },
                    { label: "₹1Cr", val: 10000000 },
                  ]
                : [
                    { label: "$25k", val: 25000 },
                    { label: "$50k", val: 50000 },
                    { label: "$100k", val: 100000 },
                    { label: "$250k", val: 250000 },
                    { label: "$500k", val: 500000 },
                  ]
              ).map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setLoanAmount(p.val)}
                  className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    loanAmount === p.val
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <CalcSlider
              id="loan-amount-slider"
              label="Principal Amount"
              ariaLabel="Total Loan Principal Slider"
              value={loanAmount}
              min={50000}
              max={10000000}
              step={50000}
              prefix={currencySymbol}
              onChange={setLoanAmount}
            />
          </div>

          <div className="space-y-4">
            <CalcInput
              id="loan-rate"
              label="Annual Interest Rate (%)"
              value={interestRate}
              min={1}
              max={25}
              step={0.1}
              suffix="%"
              onChange={(val) => setInterestRate(Number(val) || 0.1)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Presets:</span>
              {(currencySymbol === "₹"
                ? [
                    { label: "8.15% (SBI)", val: 8.15 },
                    { label: "8.40% (HDFC)", val: 8.40 },
                    { label: "8.85% (Car)", val: 8.85 },
                    { label: "9.50% (Biz)", val: 9.50 },
                    { label: "10.5% (PL)", val: 10.50 },
                  ]
                : [
                    { label: "6.71% (15-Yr)", val: 6.71 },
                    { label: "7.0% (Auto)", val: 7.0 },
                    { label: "7.40% (30-Yr)", val: 7.40 },
                    { label: "8.50% (HELOC)", val: 8.50 },
                    { label: "10.5% (PL)", val: 10.50 },
                  ]
              ).map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setInterestRate(r.val)}
                  className={`min-h-[44px] px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors touch-manipulation ${
                    interestRate === r.val
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <CalcSlider
              id="loan-rate-slider"
              label="Interest Rate"
              ariaLabel="Annual Interest Rate Slider"
              value={interestRate}
              min={5}
              max={20}
              step={0.1}
              unit="%"
              onChange={setInterestRate}
            />
          </div>

          <div className="space-y-4">
            <CalcInput
              id="loan-tenure"
              label="Repayment Tenure"
              value={loanTenureYears}
              min={1}
              max={30}
              step={1}
              suffix="Years"
              onChange={(val) => setLoanTenureYears(Number(val) || 1)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Tenure:</span>
              {[5, 10, 15, 20, 25, 30].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setLoanTenureYears(y)}
                  className={`min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors touch-manipulation ${
                    loanTenureYears === y
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {y}y
                </button>
              ))}
            </div>
            <CalcSlider
              id="loan-tenure-slider"
              label="Tenure Duration"
              ariaLabel="Repayment Tenure Slider"
              value={loanTenureYears}
              min={1}
              max={30}
              unit="Yrs"
              onChange={setLoanTenureYears}
            />
          </div>
        </div>

        <CalcResult
          title="Loan Repayment Schedule"
          primaryLabel="Monthly Loan EMI Payable"
          primaryValue={formatCurrency(monthlyEmi)}
          copyValue={`Monthly EMI: ${formatCurrency(monthlyEmi)} | Loan Principal: ${formatCurrency(loanAmount)} | Interest: ${formatCurrency(totalInterest)} | Total Repayment: ${formatCurrency(totalPayment)} (${loanTenureYears} yrs @ ${interestRate}%)`}
          items={[
            {
              label: "Total Principal Amount",
              value: formatCurrency(loanAmount),
            },
            {
              label: "Total Interest Accrued",
              value: formatCurrency(totalInterest),
              highlight: true,
            },
            {
              label: "Total Repayment (P + I)",
              value: formatCurrency(totalPayment),
            },
          ]}
        />

        {/* Action bar */}
        <div className="pt-2 flex flex-wrap gap-3">
          <CalcSaveButton
            toolSlug="emi-calculator"
            toolName="Loan EMI Calculator"
            summaryTitle={`Loan: ${formatCurrency(loanAmount)} (${loanTenureYears}y @ ${interestRate}%)`}
            summaryMetrics={[
              { label: "Monthly EMI", value: formatCurrency(monthlyEmi) },
              { label: "Principal", value: formatCurrency(loanAmount) },
              { label: "Total Interest", value: formatCurrency(totalInterest) },
              { label: "Total Payable", value: formatCurrency(totalPayment) },
            ]}
          />
          <CalcShareButton
            state={{
              loanAmount,
              interestRate,
              loanTenureYears,
            }}
            label="Share Calculation"
          />
          <CalcPromptButton promptText={aiPrompt} />
          <button
            type="button"
            onClick={handleExportExcel}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Formulaic Excel</span>
          </button>
        </div>

        {/* Interactive Amortization Chart */}
        <CalcChart
          title="Loan Amortization & Balance Payoff Curve"
          data={chartData}
          series={[
            {
              key: "remainingBalance",
              name: "Remaining Principal",
              color: "#EF4444",
              gradientId: "emiBalanceGrad",
            },
            {
              key: "principalPaid",
              name: "Cumulative Principal Paid",
              color: "#10B981",
              gradientId: "emiPrincGrad",
            },
            {
              key: "interestPaid",
              name: "Cumulative Interest Paid",
              color: "#F59E0B",
              gradientId: "emiIntGrad",
            },
          ]}
        />
      </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Monthly EMI</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(monthlyEmi)}
          </span>
          <span className="text-[11px] text-zinc-500 block">
            Interest: {formatCurrency(totalInterest)}
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
