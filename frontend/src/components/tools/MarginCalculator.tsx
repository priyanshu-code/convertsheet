"use client";

import React, { useState, useMemo } from "react";
import { BadgePercent } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcToggle,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcExportButton,
} from "@/components/calculator";

export function MarginCalculator() {
  const [calcMode, setCalcMode] = useState<"findMargin" | "findPrice">("findMargin");
  const [cost, setCost] = useState<number>(60);
  const [revenue, setRevenue] = useState<number>(100);
  const [targetMargin, setTargetMargin] = useState<number>(40);

  const QUICK_MARGINS = [15, 20, 25, 30, 35, 40, 50, 60, 75];

  const { effectiveRevenue, grossProfit, marginPercent, markupPercent } = useMemo(() => {
    const c = Math.max(0, cost);

    if (calcMode === "findMargin") {
      const r = Math.max(0, revenue);
      const profit = r - c;
      const margin = r > 0 ? (profit / r) * 100 : 0;
      const markup = c > 0 ? (profit / c) * 100 : 0;

      return {
        effectiveRevenue: r,
        grossProfit: Math.round(profit * 100) / 100,
        marginPercent: Math.round(margin * 100) / 100,
        markupPercent: Math.round(markup * 100) / 100,
      };
    } else {
      // Find Selling Price from Cost and Target Margin
      // Margin = (Price - Cost) / Price => Price = Cost / (1 - Margin/100)
      const m = Math.min(99.9, Math.max(0, targetMargin)) / 100;
      const calculatedPrice = m < 1 ? c / (1 - m) : c;
      const profit = calculatedPrice - c;
      const markup = c > 0 ? (profit / c) * 100 : 0;

      return {
        effectiveRevenue: Math.round(calculatedPrice * 100) / 100,
        grossProfit: Math.round(profit * 100) / 100,
        marginPercent: targetMargin,
        markupPercent: Math.round(markup * 100) / 100,
      };
    }
  }, [calcMode, cost, revenue, targetMargin]);

  const chartData = useMemo(() => {
    return [
      { label: "Cost of Goods", amount: cost },
      { label: "Gross Profit", amount: Math.max(0, grossProfit) },
      { label: "Selling Price", amount: effectiveRevenue },
    ];
  }, [cost, grossProfit, effectiveRevenue]);

  const exportSchedule = [
    { Metric: "Cost of Goods Sold (COGS)", Value: cost },
    { Metric: "Selling Price / Revenue", Value: effectiveRevenue },
    { Metric: "Gross Profit ($)", Value: grossProfit },
    { Metric: "Profit Margin (%)", Value: `${marginPercent}%` },
    { Metric: "Markup (%)", Value: `${markupPercent}%` },
  ];

  const llmPrompt = `Analyze this product pricing model:
- Cost of Goods Sold (COGS): $${cost}
- Selling Price: $${effectiveRevenue}
- Gross Profit: $${grossProfit}
- Margin: ${marginPercent}%
- Markup: ${markupPercent}%

Please advise on price sensitivity, volume discounts, and benchmark profitability against standard e-commerce margins.`;

  const copySummary = `Cost: $${cost} | Selling Price: $${effectiveRevenue} | Gross Profit: $${grossProfit} (Margin: ${marginPercent}%, Markup: ${markupPercent}%)`;

  return (
    <CalcCard
      title="Profit Margin & Markup Calculator"
      subtitle="Calculate gross profit dollar amount, profit margin percentage, and markup percentage from wholesale cost and revenue."
      icon={BadgePercent}
      badge="E-Commerce & Retail"
    >
      <div className="space-y-6">
        <CalcToggle
          value={calcMode}
          options={[
            { value: "findMargin", label: "Calculate Margin from Selling Price" },
            { value: "findPrice", label: "Calculate Selling Price from Target Margin %" },
          ]}
          onChange={(v) => setCalcMode(v as any)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CalcInput
              id="product-cost"
              label="Cost of Goods (COGS)"
              value={cost}
              onChange={setCost}
              prefix="$"
              min={0}
              step={1}
              helpText="Wholesale cost or manufacturing expense per unit"
            />

            {calcMode === "findMargin" ? (
              <CalcInput
                id="selling-price"
                label="Selling Price (Revenue)"
                value={revenue}
                onChange={setRevenue}
                prefix="$"
                min={0}
                step={1}
                helpText="Retail price charged to customers"
              />
            ) : (
              <div className="space-y-2">
                <CalcInput
                  id="target-margin"
                  label="Target Profit Margin (%)"
                  value={targetMargin}
                  onChange={setTargetMargin}
                  suffix="%"
                  min={0}
                  max={99}
                  step={1}
                  helpText="Desired margin percentage of revenue"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_MARGINS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTargetMargin(m)}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer border ${
                        targetMargin === m
                          ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                          : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                      }`}
                    >
                      {m}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              <CalcPromptButton promptText={llmPrompt} />
              <CalcExportButton
                data={exportSchedule}
                filename="profit-margin-analysis"
                sheetName="Margin & Markup"
              />
            </div>
          </div>

          <div className="space-y-4">
            <CalcResult
              title="Profitability Breakdown"
              primaryLabel={calcMode === "findPrice" ? "Recommended Selling Price" : "Gross Profit"}
              primaryValue={calcMode === "findPrice" ? `$${effectiveRevenue.toLocaleString()}` : `$${grossProfit.toLocaleString()}`}
              primarySubtext={calcMode === "findPrice" ? `Generates a ${marginPercent}% margin` : "Profit generated per unit sold"}
              copyValue={copySummary}
              items={[
                {
                  label: "Profit Margin",
                  value: `${marginPercent}%`,
                  highlight: true,
                  subtext: "Profit / Revenue",
                },
                {
                  label: "Markup",
                  value: `${markupPercent}%`,
                  subtext: "Profit / Cost",
                },
                {
                  label: calcMode === "findPrice" ? "Dollar Profit" : "Selling Price",
                  value: calcMode === "findPrice" ? `$${grossProfit.toLocaleString()}` : `$${effectiveRevenue.toLocaleString()}`,
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <CalcChart
          title="Revenue vs Cost vs Profit Breakdown"
          data={chartData}
          series={[
            {
              key: "amount",
              name: "Amount ($)",
              color: "#10b981",
              gradientId: "marginGrad",
            },
          ]}
        />
      </div>
    </CalcCard>
  );
}
