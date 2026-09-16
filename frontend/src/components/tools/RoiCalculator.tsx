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

  return (
    <CalcCard
      title="Return on Investment (ROI) Calculator"
      subtitle="Calculate simple and annualized Return on Investment (ROI) percentage and total capital gains over any time period."
      icon={TrendingUp}
      badge="Business & Stocks"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <CalcInput
            id="initial-investment"
            label="Initial Investment (Cost Basis)"
            value={initialInvestment}
            onChange={setInitialInvestment}
            prefix="$"
            min={1}
            step={500}
            helpText="Initial capital invested or project outlay"
          />
          <CalcInput
            id="final-return"
            label="Final Return Value"
            value={finalReturn}
            onChange={setFinalReturn}
            prefix="$"
            min={0}
            step={500}
            helpText="Total liquidated value or revenue returned"
          />
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
