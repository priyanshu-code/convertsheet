"use client";

import React, { useState, useMemo } from "react";
import { BadgePercent } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcExportButton,
} from "@/components/calculator";

export function MarginCalculator() {
  const [cost, setCost] = useState<number>(60);
  const [revenue, setRevenue] = useState<number>(100);

  const { grossProfit, marginPercent, markupPercent } = useMemo(() => {
    const c = Math.max(0, cost);
    const r = Math.max(0, revenue);
    const profit = r - c;
    const margin = r > 0 ? (profit / r) * 100 : 0;
    const markup = c > 0 ? (profit / c) * 100 : 0;

    return {
      grossProfit: Math.round(profit * 100) / 100,
      marginPercent: Math.round(margin * 100) / 100,
      markupPercent: Math.round(markup * 100) / 100,
    };
  }, [cost, revenue]);

  const chartData = useMemo(() => {
    return [
      { label: "Cost of Goods", amount: cost },
      { label: "Gross Profit", amount: Math.max(0, grossProfit) },
      { label: "Total Revenue", amount: revenue },
    ];
  }, [cost, grossProfit, revenue]);

  const exportSchedule = [
    { Metric: "Cost of Goods Sold (COGS)", Value: cost },
    { Metric: "Selling Price / Revenue", Value: revenue },
    { Metric: "Gross Profit ($)", Value: grossProfit },
    { Metric: "Profit Margin (%)", Value: `${marginPercent}%` },
    { Metric: "Markup (%)", Value: `${markupPercent}%` },
  ];

  const llmPrompt = `Analyze this product pricing model:
- Cost of Goods Sold (COGS): $${cost}
- Selling Price: $${revenue}
- Gross Profit: $${grossProfit}
- Margin: ${marginPercent}%
- Markup: ${markupPercent}%

Please advise on price sensitivity, volume discounts, and benchmark profitability against standard e-commerce margins.`;

  return (
    <CalcCard
      title="Profit Margin & Markup Calculator"
      subtitle="Calculate gross profit dollar amount, profit margin percentage, and markup percentage from wholesale cost and revenue."
      icon={BadgePercent}
      badge="E-Commerce"
    >
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
            primaryLabel="Gross Profit"
            primaryValue={`$${grossProfit.toLocaleString()}`}
            primarySubtext="Profit generated per unit sold"
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
            ]}
          />
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
