"use client";

import React, { useState, useMemo } from "react";
import { Landmark } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";

export function EmiCalculator() {
  const { currencySymbol, formatCurrency } = useCurrency();
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(15);

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

  return (
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
                className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
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
            {[7.5, 8.5, 9.5, 10.5, 12.0].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setInterestRate(r)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                  interestRate === r
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
          <CalcSlider
            id="loan-rate-slider"
            label="Interest Rate"
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
            {[5, 10, 15, 20, 30].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setLoanTenureYears(y)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
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
  );
}
