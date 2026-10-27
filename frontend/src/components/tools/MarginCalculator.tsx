"use client";

import React, { useState, useMemo, useEffect } from "react";
import { BadgePercent, ShieldCheck, FileSpreadsheet, Download } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcToggle,
  CalcResult,
  CalcChart,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import * as XLSX from "xlsx";

export interface MarginCalculatorProps {
  initialValues?: Partial<{
    cost: number;
    revenue: number;
    targetMargin: number;
    calcMode: "findMargin" | "findPrice";
  }>;
}

export function MarginCalculator({ initialValues }: MarginCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  const [calcMode, setCalcMode] = useState<"findMargin" | "findPrice">(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("calcMode");
      if (q === "findMargin" || q === "findPrice") return q;
    }
    return initialValues?.calcMode || "findMargin";
  });

  const [cost, setCost] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("cost");
      if (q) return Number(q);
    }
    return Number(initialValues?.cost) || 60;
  });

  const [revenue, setRevenue] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("revenue");
      if (q) return Number(q);
    }
    return Number(initialValues?.revenue) || 100;
  });

  const [targetMargin, setTargetMargin] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("targetMargin");
      if (q) return Number(q);
    }
    return Number(initialValues?.targetMargin) || 40;
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("calcMode", calcMode);
    params.set("cost", cost.toString());
    if (calcMode === "findMargin") {
      params.set("revenue", revenue.toString());
      params.delete("targetMargin");
    } else {
      params.set("targetMargin", targetMargin.toString());
      params.delete("revenue");
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [calcMode, cost, revenue, targetMargin]);

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
      // Find Selling Price from Cost and Target Margin:
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

  const llmPrompt = `Analyze this product pricing model:
- Cost of Goods Sold (COGS): ${currencySymbol}${cost}
- Selling Price: ${currencySymbol}${effectiveRevenue}
- Gross Profit: ${currencySymbol}${grossProfit}
- Profit Margin: ${marginPercent}%
- Markup: ${markupPercent}%

Please advise on pricing power, price elasticity, volume discounting thresholds, and benchmark profitability against 2026 e-commerce and retail margins.`;

  const copySummary = `Cost: ${formatCurrency(cost)} | Selling Price: ${formatCurrency(effectiveRevenue)} | Gross Profit: ${formatCurrency(grossProfit)} (Margin: ${marginPercent}%, Markup: ${markupPercent}%)`;

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      // Tab 1: Margin Summary with active transparent Excel formulas
      const summaryData: any[][] = [
        ["ConvertSheet - Profit Margin & Markup Analysis", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        [
          "ConvertSheet Recalculation Model",
          `https://www.convertsheet.com/tools/margin-calculator?cost=${cost}&revenue=${effectiveRevenue}&calcMode=${calcMode}`,
        ],
        ["Industry Standard", "2026 Commercial Pricing & Retail Margin Framework"],
        ["", ""],
        ["--- UNIT ECONOMICS & PRICING (FORMULAS) ---", ""],
        ["Cost of Goods Sold (COGS)", cost],
        ["Selling Price / Revenue", effectiveRevenue],
        ["", ""],
        ["Gross Profit ($)", { t: "n", f: "B8-B7", v: grossProfit }],
        ["Profit Margin (%)", { t: "n", f: "IF(B8>0,(B10/B8)*100,0)", v: marginPercent }],
        ["Markup Percentage (%)", { t: "n", f: "IF(B7>0,(B10/B7)*100,0)", v: markupPercent }],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Margin Summary");

      // Tab 2: Sensitivity Benchmark Matrix across margins 10% to 80% with live row formulas
      const matrixHeader = [
        "Target Margin %",
        "Cost of Goods",
        "Required Selling Price",
        "Gross Profit ($)",
        "Equivalent Markup %",
      ];
      const benchmarkMargins = [10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80];
      const matrixRows = benchmarkMargins.map((m, idx) => {
        const row = idx + 2;
        const rate = m / 100;
        const price = rate < 1 ? cost / (1 - rate) : cost;
        const profit = price - cost;
        const markup = cost > 0 ? (profit / cost) * 100 : 0;
        return [
          m,
          { t: "n", f: "'Margin Summary'!$B$7", v: cost },
          { t: "n", f: `IF(A${row}<100,B${row}/(1-A${row}/100),B${row})`, v: Math.round(price * 100) / 100 },
          { t: "n", f: `C${row}-B${row}`, v: Math.round(profit * 100) / 100 },
          { t: "n", f: `IF(B${row}>0,(D${row}/B${row})*100,0)`, v: Math.round(markup * 10) / 10 },
        ];
      });

      const wsMatrix = XLSX.utils.aoa_to_sheet([matrixHeader, ...matrixRows]);
      XLSX.utils.book_append_sheet(wb, wsMatrix, "Pricing Sensitivity");

      XLSX.writeFile(wb, `ConvertSheet_Margin_Analysis_${cost}_${marginPercent}pct.xlsx`);
    } catch (err) {
      console.error("Failed to generate Excel export:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>100% Client-Side • Zero Server Storage • Private &amp; Confidential</span>
      </div>

      {/* Market Rate Freshness Signal */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="font-medium">
          Updated for 2026 E-Commerce &amp; Commercial Margins (October 27, 2026): SaaS 75–85%, E-Commerce 35–50%, Wholesale 15–25%
        </span>
      </div>

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
              {/* Cost of Goods Sold */}
              <div className="space-y-2">
                <CalcInput
                  id="product-cost"
                  label="Cost of Goods (COGS)"
                  value={cost}
                  onChange={(v) => setCost(Number(v) || 0)}
                  prefix={currencySymbol}
                  min={0}
                  step={1}
                  helpText="Wholesale cost or manufacturing expense per unit"
                />
                <CalcSlider
                  id="product-cost-slider"
                  ariaLabel="Cost of Goods Slider"
                  value={cost}
                  min={0}
                  max={1000}
                  step={5}
                  prefix={currencySymbol}
                  onChange={setCost}
                />
              </div>

              {calcMode === "findMargin" ? (
                <div className="space-y-2">
                  <CalcInput
                    id="selling-price"
                    label="Selling Price (Revenue)"
                    value={revenue}
                    onChange={(v) => setRevenue(Number(v) || 0)}
                    prefix={currencySymbol}
                    min={0}
                    step={1}
                    helpText="Retail price charged to customers"
                  />
                  <CalcSlider
                    id="selling-price-slider"
                    ariaLabel="Selling Price Slider"
                    value={revenue}
                    min={0}
                    max={2000}
                    step={5}
                    prefix={currencySymbol}
                    onChange={setRevenue}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <CalcInput
                    id="target-margin"
                    label="Target Profit Margin (%)"
                    value={targetMargin}
                    onChange={(v) => setTargetMargin(Number(v) || 0)}
                    suffix="%"
                    min={0}
                    max={99}
                    step={1}
                    helpText="Desired margin percentage of revenue"
                  />
                  <CalcSlider
                    id="target-margin-slider"
                    ariaLabel="Target Margin Slider"
                    value={targetMargin}
                    min={1}
                    max={95}
                    step={1}
                    unit="%"
                    onChange={setTargetMargin}
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {QUICK_MARGINS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTargetMargin(m)}
                        className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all touch-manipulation cursor-pointer flex items-center justify-center ${
                          targetMargin === m
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                            : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                        }`}
                      >
                        {m}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Save, Share, Prompt, Excel Export */}
              <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
                <CalcSaveButton
                  calculationType="Profit Margin Model"
                  inputs={{ cost, revenue: effectiveRevenue, targetMargin, calcMode }}
                  outputs={{ grossProfit, marginPercent, markupPercent }}
                />
                <CalcShareButton
                  title="ConvertSheet Profit Margin & Markup Calculation"
                  text={`Cost: ${formatCurrency(cost)} | Price: ${formatCurrency(effectiveRevenue)} | Margin: ${marginPercent}% | Markup: ${markupPercent}%`}
                />
                <CalcPromptButton promptText={llmPrompt} />
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={isExportingExcel}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isExportingExcel ? "Generating .xlsx..." : "Export to Excel (.xlsx)"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <CalcResult
                title="Profitability Breakdown"
                primaryLabel={calcMode === "findPrice" ? "Recommended Selling Price" : "Gross Profit"}
                primaryValue={
                  calcMode === "findPrice"
                    ? formatCurrency(effectiveRevenue, { maxDecimals: 2 })
                    : formatCurrency(grossProfit, { maxDecimals: 2 })
                }
                primarySubtext={
                  calcMode === "findPrice"
                    ? `Generates a ${marginPercent}% margin`
                    : "Profit generated per unit sold"
                }
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
                    value:
                      calcMode === "findPrice"
                        ? formatCurrency(grossProfit, { maxDecimals: 2 })
                        : formatCurrency(effectiveRevenue, { maxDecimals: 2 }),
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

        {/* Action Buttons: Save, Share, Prompt, Excel Export */}
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer min-h-[44px] touch-manipulation"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExportingExcel ? "Generating .xlsx..." : "Export Excel (.xlsx)"}</span>
          </button>
          <CalcSaveButton
            toolSlug="margin-calculator"
            toolName="Profit Margin & Markup Calculator"
            summaryTitle={`Margin: ${marginPercent}% (Cost: ${formatCurrency(cost)}, Price: ${formatCurrency(effectiveRevenue)})`}
            summaryMetrics={[
              { label: "Gross Profit", value: formatCurrency(grossProfit) },
              { label: "Profit Margin", value: `${marginPercent}%` },
              { label: "Markup", value: `${markupPercent}%` },
              { label: "Selling Price", value: formatCurrency(effectiveRevenue) },
            ]}
            inputs={{ cost, revenue: effectiveRevenue, targetMargin, calcMode }}
            outputs={{ grossProfit, marginPercent, markupPercent, effectiveRevenue }}
          />
          <CalcShareButton
            state={{
              cost,
              revenue: effectiveRevenue,
              targetMargin,
              calcMode,
            }}
            label="Share Pricing Model"
          />
          <CalcPromptButton promptText={llmPrompt} />
        </div>
      </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
            {calcMode === "findPrice" ? "Target Price" : "Gross Profit"}
          </span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {calcMode === "findPrice"
              ? formatCurrency(effectiveRevenue, { maxDecimals: 2 })
              : formatCurrency(grossProfit, { maxDecimals: 2 })}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
            Margin: {marginPercent}% • Markup: {markupPercent}%
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export .xlsx</span>
        </button>
      </div>
    </div>
  );
}
