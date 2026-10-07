"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Percent,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
  Layers,
} from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import {
  calculateRateHikeImpact,
  RateHikeInput,
} from "@/lib/engines/financial-engine";

export interface RateHikeCalculatorProps {
  initialValues?: Partial<RateHikeInput>;
}

export function RateHikeCalculator({
  initialValues,
}: RateHikeCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  const [loanAmount, setLoanAmount] = useState<number>(
    () => Number(initialValues?.loanAmount) || 5000000
  );
  const [oldRate, setOldRate] = useState<number>(
    () => Number(initialValues?.oldRate) || 8.5
  );
  const [newRate, setNewRate] = useState<number>(
    () => Number(initialValues?.newRate) || 8.75
  );
  const [tenureYears, setTenureYears] = useState<number>(
    () => Number(initialValues?.tenureYears) || 20
  );
  const [activeStrategyTab, setActiveStrategyTab] = useState<
    "higherEmi" | "extendTenure"
  >("higherEmi");

  const impact = useMemo(() => {
    return calculateRateHikeImpact({
      loanAmount,
      oldRate,
      newRate,
      tenureYears,
    });
  }, [loanAmount, oldRate, newRate, tenureYears]);

  // Set delta helper
  const handleApplyDelta = (deltaBps: number) => {
    const revised = Math.round((oldRate + deltaBps / 100) * 100) / 100;
    setNewRate(revised);
  };

  // Chart comparing cumulative interest over time
  const chartData = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const yrs = Math.max(1, tenureYears);
    const rOld = oldRate / 100 / 12;
    const rNew = newRate / 100 / 12;
    const n = yrs * 12;

    const oldEmi = (P * rOld * Math.pow(1 + rOld, n)) / (Math.pow(1 + rOld, n) - 1);
    const newEmi = (P * rNew * Math.pow(1 + rNew, n)) / (Math.pow(1 + rNew, n) - 1);

    const data = [];
    let bOld = P;
    let bNew = P;
    let cumIntOld = 0;
    let cumIntNew = 0;

    for (let yr = 1; yr <= yrs; yr++) {
      for (let m = 0; m < 12; m++) {
        const intOld = bOld * rOld;
        const princOld = oldEmi - intOld;
        bOld = Math.max(0, bOld - princOld);
        cumIntOld += intOld;

        const intNew = bNew * rNew;
        const princNew = newEmi - intNew;
        bNew = Math.max(0, bNew - princNew);
        cumIntNew += intNew;
      }

      data.push({
        label: `Yr ${yr}`,
        oldCumulativeInterest: Math.round(cumIntOld),
        newCumulativeInterest: Math.round(cumIntNew),
        interestGap: Math.round(Math.max(0, cumIntNew - cumIntOld)),
      });
    }
    return data;
  }, [loanAmount, oldRate, newRate, tenureYears]);

  return (
    <div className="space-y-6">
      <CalcCard
        title="Interest Rate Hike EMI Calculator"
        subtitle="Compare your Old EMI vs. New EMI, calculate additional monthly cost, and see the exact lifetime interest increase."
        icon={TrendingUp}
        badge="RBI & Fed Rate Ready"
      >
        {/* Rate Delta Quick Pill Selector */}
        <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-3.5 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Quick Rate Hike Presets:
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Current Delta: +{impact.rateDeltaBps} bps (+{impact.rateDelta}%)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "+25 bps (+0.25%)", bps: 25 },
              { label: "+50 bps (+0.50%)", bps: 50 },
              { label: "+75 bps (+0.75%)", bps: 75 },
              { label: "+100 bps (+1.00%)", bps: 100 },
            ].map((preset) => {
              const isSelected = impact.rateDeltaBps === preset.bps;
              return (
                <button
                  key={preset.bps}
                  type="button"
                  onClick={() => handleApplyDelta(preset.bps)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-3">
            <CalcInput
              id="hike-loan-amount"
              label="Loan Principal"
              value={loanAmount}
              min={100000}
              step={100000}
              prefix={currencySymbol}
              onChange={(v) => setLoanAmount(Number(v) || 0)}
            />
            <div className="flex flex-wrap gap-1">
              {(currencySymbol === "₹"
                ? [
                    { l: "₹30L", v: 3000000 },
                    { l: "₹50L", v: 5000000 },
                    { l: "₹75L", v: 7500000 },
                    { l: "₹1Cr", v: 10000000 },
                  ]
                : [
                    { l: "$200k", v: 200000 },
                    { l: "$400k", v: 400000 },
                    { l: "$600k", v: 600000 },
                    { l: "$1M", v: 1000000 },
                  ]
              ).map((btn) => (
                <button
                  key={btn.l}
                  type="button"
                  onClick={() => setLoanAmount(btn.v)}
                  className={`text-[11px] px-2 py-0.5 rounded border ${
                    loanAmount === btn.v
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 font-bold"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {btn.l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <CalcInput
              id="hike-old-rate"
              label="Current / Old Rate"
              value={oldRate}
              min={1}
              max={25}
              step={0.05}
              suffix="%"
              onChange={(v) => setOldRate(Number(v) || 0.1)}
            />
            <span className="text-[11px] text-zinc-500 block">
              Baseline interest rate before policy hike
            </span>
          </div>

          <div className="space-y-3">
            <CalcInput
              id="hike-new-rate"
              label="New / Revised Rate"
              value={newRate}
              min={1}
              max={25}
              step={0.05}
              suffix="%"
              onChange={(v) => setNewRate(Number(v) || 0.1)}
            />
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium block">
              +{impact.rateDelta}% ({impact.rateDeltaBps} bps increase)
            </span>
          </div>

          <div className="space-y-3">
            <CalcInput
              id="hike-tenure"
              label="Remaining Tenure"
              value={tenureYears}
              min={1}
              max={30}
              step={1}
              suffix="Years"
              onChange={(v) => setTenureYears(Number(v) || 1)}
            />
            <div className="flex flex-wrap gap-1">
              {[10, 15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTenureYears(yr)}
                  className={`text-[11px] px-2 py-0.5 rounded border ${
                    tenureYears === yr
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 font-bold"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {yr}y
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Highlighted Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Old EMI ({oldRate.toFixed(2)}%)
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(impact.oldEmi)}
              <span className="text-xs font-normal text-zinc-400">/mo</span>
            </div>
            <div className="text-[11px] text-zinc-500">
              Total Interest: {formatCurrency(impact.oldTotalInterest)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
            <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              New EMI ({newRate.toFixed(2)}%)
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(impact.newEmi)}
              <span className="text-xs font-normal text-emerald-600/70">/mo</span>
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
              Total Interest: {formatCurrency(impact.newTotalInterest)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-1">
            <div className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Monthly Hike
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              +{formatCurrency(impact.monthlyHike)}
              <span className="text-xs font-normal text-rose-500/70">/mo</span>
            </div>
            <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
              +{(impact.monthlyHike * 12).toLocaleString()} per year
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
            <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Extra Lifetime Interest
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              +{formatCurrency(impact.extraLifetimeInterest)}
            </div>
            <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
              Paid over {tenureYears} years ({impact.totalMonths} months)
            </div>
          </div>
        </div>

        {/* Amortization Cost Graph */}
        <CalcChart
          title="Lifetime Cumulative Interest Burden (Old vs New Rate)"
          data={chartData}
          series={[
            {
              key: "newCumulativeInterest",
              name: `New Interest (${newRate}%)`,
              color: "#EF4444",
              gradientId: "hikeNewIntGrad",
            },
            {
              key: "oldCumulativeInterest",
              name: `Old Interest (${oldRate}%)`,
              color: "#10B981",
              gradientId: "hikeOldIntGrad",
            },
            {
              key: "interestGap",
              name: "Cumulative Rate Hike Penalty",
              color: "#F59E0B",
              gradientId: "hikeGapGrad",
            },
          ]}
        />
      </CalcCard>

      {/* The Side-by-Side Benchmark Table (Exact Match to Image) */}
      <section
        aria-label="Side-by-Side Loan Hike Benchmark"
        className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Loan Amount Hike Comparison Matrix
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Side-by-side breakdown for standard loan sizes at {oldRate.toFixed(2)}% vs {newRate.toFixed(2)}% over {tenureYears} years:
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            +{impact.rateDeltaBps} bps Rate Shock
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200/90 dark:border-zinc-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-bold">Loan Amount</th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                    Old EMI ({oldRate.toFixed(2)}%)
                  </span>
                </th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                    New EMI ({newRate.toFixed(2)}%)
                  </span>
                </th>
                <th className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                  Monthly Hike
                </th>
                <th className="px-4 py-3 font-bold text-amber-600 dark:text-amber-400">
                  Extra Lifetime Interest
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
              {impact.bracketRows.map((row) => {
                const inrLabel =
                  row.loanAmount === 3000000
                    ? "₹30 Lakh"
                    : row.loanAmount === 5000000
                    ? "₹50 Lakh"
                    : row.loanAmount === 7500000
                    ? "₹75 Lakh"
                    : "₹1 Crore";

                const isCurrent = row.loanAmount === loanAmount;

                return (
                  <tr
                    key={row.loanAmount}
                    className={`transition-colors ${
                      isCurrent
                        ? "bg-emerald-50/30 dark:bg-emerald-950/20 font-bold"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-white">
                      {inrLabel}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300 font-mono">
                      {formatCurrency(row.oldEmi)}/mo
                    </td>
                    <td className="px-4 py-3.5 text-rose-600 dark:text-rose-400 font-mono font-bold">
                      {formatCurrency(row.newEmi)}/mo
                    </td>
                    <td className="px-4 py-3.5 text-rose-600 dark:text-rose-400 font-mono font-semibold">
                      +{formatCurrency(row.monthlyHike)}/mo
                    </td>
                    <td className="px-4 py-3.5 text-amber-600 dark:text-amber-400 font-mono font-bold">
                      +{formatCurrency(row.extraLifetimeInterest)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* The Silent Tenure Trap Decision Simulator */}
      <section
        aria-label="Tenure Trap vs Higher EMI Comparison"
        className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
            The Silent Tenure Trap: Increase EMI or Extend Tenure?
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          When rates rise, most banks silently extend your loan tenure instead of debiting a higher EMI. Here is how both options compare on your {formatCurrency(loanAmount)} loan:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Strategy A: Increase EMI */}
          <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Option A: Increase Monthly EMI (Recommended)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                Save Hundreds of Thousands
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              <p>
                • <strong>Monthly EMI</strong>: {formatCurrency(impact.newEmi)} (+{formatCurrency(impact.monthlyHike)}/mo)
              </p>
              <p>
                • <strong>Total Loan Tenure</strong>: Fixed at {tenureYears} Years ({impact.totalMonths} months)
              </p>
              <p>
                • <strong>Total Lifetime Interest</strong>: {formatCurrency(impact.newTotalInterest)}
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
              ✓ Keeps debt free date unchanged and limits interest loss to baseline rate rise.
            </div>
          </div>

          {/* Strategy B: Silent Tenure Extension */}
          <div className="p-4 rounded-2xl border-2 border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                Option B: Silent Tenure Extension
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                Bank Profit Trap
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              <p>
                • <strong>Monthly EMI</strong>: Stays at {formatCurrency(impact.oldEmi)} (Unchanged)
              </p>
              <p>
                • <strong>Extended Loan Tenure</strong>:{" "}
                <span className="text-rose-600 font-bold">
                  {Math.floor(impact.extendedTenureMonths / 12)} Yrs {impact.extendedTenureMonths % 12} Mos (+{impact.addedMonthsToTenure} extra months!)
                </span>
              </p>
              <p>
                • <strong>Extra Lifetime Penalty</strong>:{" "}
                <span className="text-rose-600 font-bold">
                  +{formatCurrency(impact.extraInterestIfTenureExtended)} extra interest
                </span>
              </p>
            </div>
            <div className="pt-2 border-t border-rose-200/80 dark:border-rose-900/80 text-[11px] font-semibold text-rose-800 dark:text-rose-300">
              ⚠️ You pay the bank significantly more interest just to avoid a small monthly increase.
            </div>
          </div>
        </div>

        {/* Actionable Prepayment Defense Callout */}
        <div className="p-4 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>How to Neutralize This Rate Hike:</span>
            </div>
            <p className="text-xs text-zinc-300">
              Prepaying just <strong>{formatCurrency(impact.monthlyPrepaymentToNeutralize)} extra each month</strong> directly toward principal completely eliminates this +{impact.rateDelta}% rate hike and finishes your loan right on your original schedule.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleApplyDelta(0)}
            className="self-start sm:self-auto px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shrink-0"
          >
            Reset Rates
          </button>
        </div>
      </section>
    </div>
  );
}
