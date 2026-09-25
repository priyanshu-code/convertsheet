"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcExportButton,
} from "@/components/calculator";

export function RoiCalculator() {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [finalReturn, setFinalReturn] = useState<number>(18000);
  const [investmentYears, setInvestmentYears] = useState<number>(3);

  const { netProfit, simpleRoi, annualizedRoi } = useMemo(() => {
    const cost = Math.max(0, initialInvestment);
    const payout = Math.max(0, finalReturn);
    const yrs = Math.max(0.1, investmentYears);

    const profit = payout - cost;
    const sRoi = cost > 0 ? (profit / cost) * 100 : 0;
    let aRoi = 0;
    if (cost > 0 && payout > 0) {
      aRoi = (Math.pow(payout / cost, 1 / yrs) - 1) * 100;
    }

    return {
      netProfit: Math.round(profit * 100) / 100,
      simpleRoi: Math.round(sRoi * 100) / 100,
      annualizedRoi: Math.round(aRoi * 100) / 100,
    };
  }, [initialInvestment, finalReturn, investmentYears]);

  const chartData = useMemo(() => {
    const cost = Math.max(1, initialInvestment);
    const payout = Math.max(1, finalReturn);
    const yrs = Math.max(1, Math.round(investmentYears));
    const rate = Math.pow(payout / cost, 1 / yrs);

    const data = [];
    for (let yr = 0; yr <= yrs; yr++) {
      const val = cost * Math.pow(rate, yr);
      data.push({
        label: yr === 0 ? "Initial" : `Yr ${yr}`,
        portfolioValue: Math.round(val),
        costBasis: cost,
      });
    }
    return data;
  }, [initialInvestment, finalReturn, investmentYears]);

  const exportSchedule = useMemo(() => {
    return [
      { Metric: "Initial Capital Invested", Value: initialInvestment },
      { Metric: "Final Return Value", Value: finalReturn },
      { Metric: "Net Capital Gain", Value: netProfit },
      { Metric: "Simple ROI (%)", Value: `${simpleRoi}%` },
      { Metric: "Annualized Compound ROI (%)", Value: `${annualizedRoi}%` },
      { Metric: "Holding Period (Years)", Value: investmentYears },
    ];
  }, [initialInvestment, finalReturn, netProfit, simpleRoi, annualizedRoi, investmentYears]);

  const llmPrompt = `Analyze this investment return projection:
- Initial Investment: $${initialInvestment.toLocaleString()}
- Final Return Value: $${finalReturn.toLocaleString()}
- Net Capital Gains: $${netProfit.toLocaleString()}
- Simple Total ROI: ${simpleRoi}%
- Annualized ROI (CAGR): ${annualizedRoi}%
- Holding Period: ${investmentYears} years

Please evaluate this performance against the S&P 500 index baseline (~10% CAGR) and assess risk-adjusted return viability.`;

  const INVESTMENT_PRESETS = [1000, 5000, 10000, 25000, 50000, 100000];
  const RETURN_MULTIPLIERS = [
    { label: "+20%", mult: 1.2 },
    { label: "+50%", mult: 1.5 },
    { label: "2x Double", mult: 2.0 },
    { label: "3x Triple", mult: 3.0 },
    { label: "5x", mult: 5.0 },
  ];
  const DURATION_PRESETS = [1, 2, 3, 5, 7, 10];

  return (
    <CalcCard
      title="Return on Investment (ROI) Calculator"
      subtitle="Calculate simple and annualized Return on Investment (ROI) percentage and total capital gains over any time period."
      icon={TrendingUp}
      badge="Business & Stocks"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <CalcInput
              id="initial-investment"
              label="Initial Investment (Cost Basis)"
              value={initialInvestment}
              onChange={(v) => setInitialInvestment(Math.max(0, Number(v) || 0))}
              prefix="$"
              min={1}
              step={500}
              helpText="Initial capital invested or project outlay"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {INVESTMENT_PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInitialInvestment(amt)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border ${
                    initialInvestment === amt
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                  }`}
                >
                  ${amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <CalcInput
              id="final-return"
              label="Final Return Value"
              value={finalReturn}
              onChange={(v) => setFinalReturn(Math.max(0, Number(v) || 0))}
              prefix="$"
              min={0}
              step={500}
              helpText="Total liquidated value or revenue returned"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Quick Target:</span>
              {RETURN_MULTIPLIERS.map(({ label, mult }) => {
                const targetVal = Math.round(initialInvestment * mult);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFinalReturn(targetVal)}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <CalcSlider
              id="investment-years"
              label="Investment Duration"
              value={investmentYears}
              onChange={setInvestmentYears}
              min={0.5}
              max={30}
              step={0.5}
              unit="years"
              helpText="Holding horizon for annualized CAGR computation"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {DURATION_PRESETS.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setInvestmentYears(yr)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border ${
                    investmentYears === yr
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                  }`}
                >
                  {yr} {yr === 1 ? "Year" : "Years"}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <CalcPromptButton promptText={llmPrompt} />
            <CalcExportButton
              data={exportSchedule}
              filename="roi-investment-projection"
              sheetName="ROI Summary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <CalcResult
            title="Return on Investment"
            primaryLabel="Total Return on Investment"
            primaryValue={simpleRoi >= 0 ? `+${simpleRoi}%` : `${simpleRoi}%`}
            primarySubtext={`Annualized CAGR: ${annualizedRoi}% / yr`}
            copyValue={`ROI: ${simpleRoi >= 0 ? `+${simpleRoi}%` : `${simpleRoi}%`} | Net Profit: $${netProfit.toLocaleString()} | Initial: $${initialInvestment.toLocaleString()} | Final: $${finalReturn.toLocaleString()} | CAGR: ${annualizedRoi}%/yr over ${investmentYears} years`}
            items={[
              {
                label: "Net Capital Gain",
                value: `$${netProfit.toLocaleString()}`,
                highlight: netProfit >= 0,
              },
              {
                label: "Holding Period",
                value: `${investmentYears} yrs`,
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <CalcChart
          title="Portfolio Valuation Trajectory"
          data={chartData}
          series={[
            {
              key: "portfolioValue",
              name: "Portfolio ($)",
              color: "#10b981",
              gradientId: "roiGrad",
            },
          ]}
        />
      </div>
    </CalcCard>
  );
}
