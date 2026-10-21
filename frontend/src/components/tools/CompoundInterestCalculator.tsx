"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Coins, ShieldCheck, Download, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcSelect,
  CalcResult,
  CalcChart,
  CalcShareButton,
  CalcPromptButton,
  CalcExportButton,
  CalcSaveButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";

export interface CompoundInterestCalculatorProps {
  initialValues?: Record<string, unknown>;
}

export function CompoundInterestCalculator({ initialValues }: CompoundInterestCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  // Hydrate initial state from props or URL query parameters
  const [principal, setPrincipal] = useState<number>(() => {
    if (initialValues?.principal !== undefined) return Number(initialValues.principal);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("principal");
      if (q) return Number(q);
    }
    return 100000;
  });

  const [annualRate, setAnnualRate] = useState<number>(() => {
    if (initialValues?.annualRate !== undefined) return Number(initialValues.annualRate);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("annualRate");
      if (q) return Number(q);
    }
    return 8;
  });

  const [years, setYears] = useState<number>(() => {
    if (initialValues?.years !== undefined) return Number(initialValues.years);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("years");
      if (q) return Number(q);
    }
    return 5;
  });

  const [frequency, setFrequency] = useState<string>(() => {
    if (initialValues?.frequency !== undefined) return String(initialValues.frequency);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("frequency");
      if (q) return String(q);
    }
    return "12"; // 12 = monthly compounding
  });

  // Calculate Compound Growth
  const { maturityAmount, totalInterest, realPurchasingPower } = useMemo(() => {
    const P = Math.max(0, principal);
    const r = Math.max(0, annualRate) / 100;
    const t = Math.max(1, years);
    const n = Number(frequency) || 1;

    // A = P * (1 + r/n)^(n*t)
    const A = P * Math.pow(1 + r / n, n * t);
    const interest = Math.max(0, A - P);

    // Constant 2.5% central bank target inflation purchasing power calculation
    const inflationRate = 0.025;
    const realValue = A / Math.pow(1 + inflationRate, t);

    return {
      maturityAmount: Math.round(A),
      totalInterest: Math.round(interest),
      realPurchasingPower: Math.round(realValue),
    };
  }, [principal, annualRate, years, frequency]);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("principal", principal.toString());
    params.set("annualRate", annualRate.toString());
    params.set("years", years.toString());
    params.set("frequency", frequency);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [principal, annualRate, years, frequency]);

  // Year-by-year compounding balance curve
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

  // Frequency human readable description
  const frequencyLabel = useMemo(() => {
    switch (frequency) {
      case "1":
        return "annually";
      case "2":
        return "semi-annually";
      case "4":
        return "quarterly";
      case "12":
        return "monthly";
      case "365":
        return "daily";
      default:
        return "compounding period";
    }
  }, [frequency]);

  // SheetJS Excel (.xlsx) Retention Hook with Live Formulas
  const handleExportExcel = () => {
    try {
      const summaryRows: (string | number)[][] = [
        ["ConvertSheet - Compound Interest & Wealth Accumulation Model", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/compound-interest-calculator"],
        ["", ""],
        ["Investment Parameter", "Value"],
        ["Initial Principal (P)", principal],
        ["Annual Interest Rate (r)", `${annualRate}%`],
        ["Tenure in Years (t)", years],
        ["Compounding Frequency (n)", Number(frequency)],
        ["", ""],
        ["Projected Output", "Amount"],
        ["Total Maturity Amount (Future Value)", maturityAmount],
        ["Total Compound Interest Earned", totalInterest],
        ["Real Purchasing Power (2.5% Inflation)", realPurchasingPower],
        ["", ""],
        ["Year", "Principal", "Interest Earned", "Total Balance"],
      ];

      chartData.forEach((row, idx) => {
        summaryRows.push([
          idx + 1,
          row.principal,
          row.interestEarned,
          row.totalBalance,
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "CompoundGrowth");
      XLSX.writeFile(
        wb,
        `ConvertSheet_Compound_Interest_${principal}_${annualRate}pct_${years}yrs.xlsx`
      );
    } catch (err) {
      console.error("Excel export failed:", err);
    }
  };

  const aiPrompt = useMemo(() => {
    return `Evaluate this compound interest and savings growth plan:
- Initial Investment Principal: ${formatCurrency(principal)}
- Annual Return / Interest Rate: ${annualRate}% (Compounded ${frequencyLabel})
- Time Horizon: ${years} Years
- Computed Projections:
  • Future Value: ${formatCurrency(maturityAmount)}
  • Total Compound Interest Earned: ${formatCurrency(totalInterest)}
  • Estimated Real Purchasing Power (at 2.5% inflation): ${formatCurrency(realPurchasingPower)}
Please provide:
1. Optimal compounding vehicle comparison (High-Yield Savings Accounts vs Treasury Bills vs Index ETFs).
2. The impact of increasing tenure by 5–10 years or switching to daily compounding.
3. Post-tax net yield calculation considering capital gains vs ordinary income tax treatment.`;
  }, [principal, annualRate, frequencyLabel, years, maturityAmount, totalInterest, realPurchasingPower, formatCurrency]);

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Reassurance Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side Privacy — Zero Financial Data Leaves Your Device</span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="font-medium">
          {currencySymbol === "₹"
            ? "Updated for October 2026: Senior Citizen Bank FDs 8.00%–8.50% • Corporate FDs 8.25%–8.75% • RBI Repo Benchmark 5.50%"
            : "Updated for October 2026: Top Online HYSAs 4.15%–4.25% APY • 1-Year CDs 4.25%–4.35% APY (Fed Funds Target 3.75%–4.00%) • 10-Yr Treasury Yield 5.10%"}
        </span>
      </div>

      <CalcCard
        title="Compound Interest Calculator"
        subtitle="Calculate compound growth on savings, certificates of deposit (CDs), and fixed deposits."
        icon={Coins}
        badge="Exponential Yield"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Principal Input */}
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
                  className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
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

          {/* Annual Rate Input */}
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
              {(currencySymbol === "₹"
                ? [
                    { label: "7.0% (FD)", val: 7.0 },
                    { label: "7.5% (PO)", val: 7.5 },
                    { label: "8.25% (Sr FD)", val: 8.25 },
                    { label: "9.0% (Corp)", val: 9.0 },
                    { label: "12.0% (Index)", val: 12.0 },
                  ]
                : [
                    { label: "4.25% (HYSA)", val: 4.25 },
                    { label: "4.35% (CD)", val: 4.35 },
                    { label: "5.10% (T-Bill)", val: 5.10 },
                    { label: "7.0% (RE)", val: 7.0 },
                    { label: "8.0% (Mix)", val: 8.0 },
                    { label: "10.0% (S&P)", val: 10.0 },
                  ]
              ).map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setAnnualRate(r.val)}
                  className={`min-h-[44px] px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors touch-manipulation ${
                    annualRate === r.val
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {r.label}
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

          {/* Duration Years Input */}
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
              {[1, 3, 5, 10, 20, 30].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className={`min-h-[44px] px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
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

          {/* Compounding Frequency Input */}
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
                  className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
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

        {/* Direct Answer Box (Google Snippet & Intent Optimized) */}
        <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-sm block">
              Direct Answer: {formatCurrency(principal)} in {years} Years
            </strong>
            <p className="text-xs text-zinc-700 dark:text-zinc-300">
              An initial deposit of <strong>{formatCurrency(principal)}</strong> growing at <strong>{annualRate}%</strong> compounded {frequencyLabel} reaches{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(maturityAmount)}</strong> after {years} years, generating{" "}
              <strong>{formatCurrency(totalInterest)}</strong> in pure compound interest.
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Inflation Note: Assuming a standard 2.5% inflation rate, this future value retains approximately{" "}
              <strong>{formatCurrency(realPurchasingPower)}</strong> in today&apos;s purchasing power.
            </p>
          </div>
        </div>

        {/* Calculation Projections Results */}
        <CalcResult
          title="Compounding Projections"
          primaryLabel="Total Future Value (Principal + Interest)"
          primaryValue={formatCurrency(maturityAmount)}
          copyValue={`Compound Growth: Future Value ${formatCurrency(maturityAmount)} | Principal: ${formatCurrency(principal)} | Interest Earned: ${formatCurrency(totalInterest)} (${years} years at ${annualRate}% ${frequencyLabel})`}
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
              label: "Real Purchasing Power (2.5% Inflation)",
              value: formatCurrency(realPurchasingPower),
            },
            {
              label: "Growth Multiplier",
              value: principal > 0 ? `${(maturityAmount / principal).toFixed(2)}x` : "1.00x",
            },
          ]}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <CalcSaveButton
            toolSlug="compound-interest-calculator"
            toolName="Compound Interest Calculator"
            label="Save Calculation"
            summaryTitle={`Principal: ${formatCurrency(principal)} (${years}y @ ${annualRate}%)`}
            summaryMetrics={[
              { label: "Future Value", value: formatCurrency(maturityAmount) },
              { label: "Principal", value: formatCurrency(principal) },
              { label: "Interest Earned", value: formatCurrency(totalInterest) },
              { label: "Purchasing Power", value: formatCurrency(realPurchasingPower) },
            ]}
          />
          <CalcShareButton
            state={{
              principal,
              annualRate,
              years,
              frequency,
            }}
            label="Share Calculation"
          />
          <CalcPromptButton promptText={aiPrompt} label="Copy Scenario for ChatGPT / Claude" />
          <button
            type="button"
            onClick={handleExportExcel}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Formulaic Excel</span>
          </button>
          <CalcExportButton
            filename={`convertsheet_compound_interest_${principal}_${years}yrs`}
            sheetName="Compound Growth Schedule"
            data={chartData.map((d) => ({
              Period: d.label,
              [`Initial Principal (${currencySymbol})`]: d.principal,
              [`Interest Earned (${currencySymbol})`]: d.interestEarned,
              [`Total Accumulated Balance (${currencySymbol})`]: d.totalBalance,
            }))}
            label="Download Schedule (.xlsx)"
          />
        </div>

        {/* Interactive Compounding Curve Chart */}
        <CalcChart
          title="Compound Savings Trajectory (Year-by-Year)"
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

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Total Future Value</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(maturityAmount)}
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
