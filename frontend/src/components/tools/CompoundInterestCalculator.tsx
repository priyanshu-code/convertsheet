"use client";

import React, { useState, useMemo } from "react";
import { Coins } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcSelect,
  CalcResult,
  CalcChart,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";

export function CompoundInterestCalculator() {
  const { currencySymbol, formatCurrency } = useCurrency();
  const [principal, setPrincipal] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(8);
  const [years, setYears] = useState<number>(5);
  const [frequency, setFrequency] = useState<string>("12"); // 12 = monthly

  const { maturityAmount, totalInterest } = useMemo(() => {
    const P = Math.max(0, principal);
    const r = Math.max(0, annualRate) / 100;
    const t = Math.max(1, years);
    const n = Number(frequency) || 1;

    // A = P * (1 + r/n)^(n*t)
    const A = P * Math.pow(1 + r / n, n * t);
    const interest = Math.max(0, A - P);

    return {
      maturityAmount: Math.round(A),
      totalInterest: Math.round(interest),
    };
  }, [principal, annualRate, years, frequency]);

  // Year by year compounding balance curve
  const chartData = useMemo(() => {
    const P = Math.max(0, principal);
    const r = Math.max(0, annualRate) / 100;
    const t = Math.max(1, years);
    const n = Number(frequency) || 1;

    const data = [];
    for (let yr = 1; yr <= t; yr++) {
      const A = P * Math.pow(1 + r / n, n * yr);
      const interest = Math.max(0, A - P);
      data.push({
        label: `Yr ${yr}`,
        principal: Math.round(P),
        interestEarned: Math.round(interest),
        totalBalance: Math.round(A),
      });
    }
    return data;
  }, [principal, annualRate, years, frequency]);

  return (
    <CalcCard
      title="Compound Interest Calculator"
      subtitle="Calculate compound growth on savings, certificates of deposit (CDs), and fixed deposits."
      icon={Coins}
      badge="Exponential Yield"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <CalcInput
            id="ci-principal"
            label="Initial Deposit / Principal"
            value={principal}
            min={1000}
            step={1000}
            prefix={currencySymbol}
            onChange={(val) => setPrincipal(Number(val) || 0)}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Quick:</span>
            {(currencySymbol === "₹"
              ? [
                  { label: "₹25k", val: 25000 },
                  { label: "₹50k", val: 50000 },
                  { label: "₹1L", val: 100000 },
                  { label: "₹5L", val: 500000 },
                  { label: "₹10L", val: 1000000 },
                ]
              : [
                  { label: "$5k", val: 5000 },
                  { label: "$10k", val: 10000 },
                  { label: "$25k", val: 25000 },
                  { label: "$50k", val: 50000 },
                  { label: "$100k", val: 100000 },
                ]
            ).map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPrincipal(p.val)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                  principal === p.val
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <CalcSlider
            id="ci-principal-slider"
            label="Principal Amount"
            value={principal}
            min={5000}
            max={2000000}
            step={5000}
            prefix={currencySymbol}
            onChange={setPrincipal}
          />
        </div>

        <div className="space-y-4">
          <CalcInput
            id="ci-rate"
            label="Annual Interest Rate (%)"
            value={annualRate}
            min={0.5}
            max={30}
            step={0.25}
            suffix="%"
            onChange={(val) => setAnnualRate(Number(val) || 0)}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Presets:</span>
            {[5, 7, 8, 10, 12].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setAnnualRate(r)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                  annualRate === r
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
          <CalcSlider
            id="ci-rate-slider"
            label="Interest Rate"
            value={annualRate}
            min={1}
            max={25}
            step={0.5}
            unit="%"
            onChange={setAnnualRate}
          />
        </div>

        <div className="space-y-4">
          <CalcInput
            id="ci-years"
            label="Duration (Years)"
            value={years}
            min={1}
            max={40}
            step={1}
            suffix="Years"
            onChange={(val) => setYears(Number(val) || 1)}
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Tenure:</span>
            {[1, 3, 5, 10, 20].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYears(y)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                  years === y
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {y}y
              </button>
            ))}
          </div>
          <CalcSlider
            id="ci-years-slider"
            label="Years"
            value={years}
            min={1}
            max={40}
            unit="Yrs"
            onChange={setYears}
          />
        </div>

        <div className="space-y-4">
          <CalcSelect
            id="ci-frequency"
            label="Compounding Frequency"
            value={frequency}
            options={[
              { value: "1", label: "Annually (1/yr)" },
              { value: "2", label: "Semi-Annually (2/yr)" },
              { value: "4", label: "Quarterly (4/yr)" },
              { value: "12", label: "Monthly (12/yr)" },
              { value: "365", label: "Daily (365/yr)" },
            ]}
            onChange={setFrequency}
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[
              { val: "1", label: "Annual" },
              { val: "4", label: "Quarterly" },
              { val: "12", label: "Monthly" },
              { val: "365", label: "Daily" },
            ].map((f) => (
              <button
                key={f.val}
                type="button"
                onClick={() => setFrequency(f.val)}
                className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                  frequency === f.val
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CalcResult
        title="Compounding Projections"
        primaryLabel="Total Future Value (Principal + Interest)"
        primaryValue={formatCurrency(maturityAmount)}
        copyValue={`Compound Growth: Future Value ${formatCurrency(maturityAmount)} | Principal: ${formatCurrency(principal)} | Interest Earned: ${formatCurrency(totalInterest)} (${years} years at ${annualRate}%)`}
        items={[
          {
            label: "Initial Principal",
            value: formatCurrency(principal),
          },
          {
            label: "Compound Interest Earned",
            value: formatCurrency(totalInterest),
            highlight: true,
          },
          {
            label: "Growth Rate",
            value: principal > 0 ? `${((totalInterest / principal) * 100).toFixed(1)}%` : "0%",
          },
        ]}
      />

      {/* Interactive Compounding Curve Chart */}
      <CalcChart
        title="Compound Savings Trajectory"
        data={chartData}
        series={[
          {
            key: "principal",
            name: "Initial Principal",
            color: "#6366F1",
            gradientId: "ciPrincipalGrad",
          },
          {
            key: "interestEarned",
            name: "Compound Interest Earned",
            color: "#10B981",
            gradientId: "ciInterestGrad",
          },
        ]}
      />
    </CalcCard>
  );
}
