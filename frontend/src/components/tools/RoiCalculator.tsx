"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TrendingUp, ShieldCheck, FileSpreadsheet, Download } from "lucide-react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
  CalcSaveButton,
  CalcShareButton,
  CalcPromptButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";
import * as XLSX from "xlsx";

export interface RoiCalculatorProps {
  initialValues?: Partial<{
    initialInvestment: number;
    finalReturn: number;
    investmentYears: number;
  }>;
}

export function RoiCalculator({ initialValues }: RoiCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  const [initialInvestment, setInitialInvestment] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("initialInvestment");
      if (q) return Number(q);
    }
    return Number(initialValues?.initialInvestment) || 10000;
  });

  const [finalReturn, setFinalReturn] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("finalReturn");
      if (q) return Number(q);
    }
    return Number(initialValues?.finalReturn) || 18000;
  });

  const [investmentYears, setInvestmentYears] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("investmentYears");
      if (q) return Number(q);
    }
    return Number(initialValues?.investmentYears) || 3;
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("initialInvestment", initialInvestment.toString());
    params.set("finalReturn", finalReturn.toString());
    params.set("investmentYears", investmentYears.toString());
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [initialInvestment, finalReturn, investmentYears]);

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

  const llmPrompt = `Analyze this investment return projection:
- Initial Investment: ${currencySymbol}${initialInvestment.toLocaleString()}
- Final Return Value: ${currencySymbol}${finalReturn.toLocaleString()}
- Net Capital Gains: ${currencySymbol}${netProfit.toLocaleString()}
- Simple Total ROI: ${simpleRoi}%
- Annualized ROI (CAGR): ${annualizedRoi}%
- Holding Period: ${investmentYears} years

Please evaluate this performance against the S&P 500 historical baseline (~10% CAGR) and US 10-Year Treasury yield benchmark (~5.10%), assessing risk-adjusted return viability.`;

  const copySummary = `ROI: ${simpleRoi >= 0 ? `+${simpleRoi}%` : `${simpleRoi}%`} | Net Profit: ${formatCurrency(netProfit)} | Initial: ${formatCurrency(initialInvestment)} | Final: ${formatCurrency(finalReturn)} | CAGR: ${annualizedRoi}%/yr over ${investmentYears} years`;

  const INVESTMENT_PRESETS = [1000, 5000, 10000, 25000, 50000, 100000];
  const RETURN_MULTIPLIERS = [
    { label: "+20%", mult: 1.2 },
    { label: "+50%", mult: 1.5 },
    { label: "2x Double", mult: 2.0 },
    { label: "3x Triple", mult: 3.0 },
    { label: "5x", mult: 5.0 },
  ];
  const DURATION_PRESETS = [1, 2, 3, 5, 7, 10];

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["ConvertSheet - Return on Investment (ROI) & CAGR Audit", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        [
          "ConvertSheet Recalculation Model",
          `https://www.convertsheet.com/tools/roi-calculator?initialInvestment=${initialInvestment}&finalReturn=${finalReturn}&investmentYears=${investmentYears}`,
        ],
        ["Macro Benchmark Reference", "2026 Asset Benchmarks (S&P 500 ~10% CAGR • US 10Y Treasury 5.10%)"],
        ["", ""],
        ["--- INVESTMENT PARAMETERS ---", ""],
        ["Initial Capital Invested (Cost Basis)", initialInvestment],
        ["Final Return / Liquidation Value", finalReturn],
        ["Holding Horizon (Years)", investmentYears],
        ["", ""],
        ["--- PERFORMANCE METRICS ---", ""],
        ["Net Capital Gain / Profit", netProfit],
        ["Simple Total ROI (%)", `${simpleRoi}%`],
        ["Annualized Compound Growth (CAGR %)", `${annualizedRoi}%`],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "ROI Summary");

      // Annualized Portfolio Growth Schedule
      const scheduleHeader = ["Year", "Portfolio Valuation ($)", "Cost Basis ($)", "Cumulative Gain ($)"];
      const scheduleRows = chartData.map((d) => [
        d.label,
        d.portfolioValue,
        d.costBasis,
        d.portfolioValue - d.costBasis,
      ]);

      const wsSchedule = XLSX.utils.aoa_to_sheet([scheduleHeader, ...scheduleRows]);
      XLSX.utils.book_append_sheet(wb, wsSchedule, "Valuation Trajectory");

      XLSX.writeFile(wb, `ConvertSheet_ROI_Audit_${initialInvestment}_${simpleRoi}pct.xlsx`);
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
          Updated for 2026 Asset Benchmarks: S&amp;P 500 Historical ~10% CAGR • US 10-Year Treasury 5.10%
        </span>
      </div>

      <CalcCard
        title="Return on Investment (ROI) Calculator"
        subtitle="Calculate simple and annualized Return on Investment (ROI) percentage and total capital gains over any time period."
        icon={TrendingUp}
        badge="Business & Stocks"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Initial Investment */}
            <div className="space-y-2">
              <CalcInput
                id="initial-investment"
                label="Initial Investment (Cost Basis)"
                value={initialInvestment}
                onChange={(v) => setInitialInvestment(Math.max(0, Number(v) || 0))}
                prefix={currencySymbol}
                min={1}
                step={500}
                helpText="Initial capital invested or project outlay"
              />
              <CalcSlider
                id="initial-investment-slider"
                ariaLabel="Initial Investment Slider"
                value={initialInvestment}
                min={500}
                max={250000}
                step={500}
                prefix={currencySymbol}
                onChange={setInitialInvestment}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {INVESTMENT_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInitialInvestment(amt)}
                    className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all touch-manipulation cursor-pointer flex items-center justify-center ${
                      initialInvestment === amt
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                        : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    {currencySymbol}
                    {amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Final Return Value */}
            <div className="space-y-2">
              <CalcInput
                id="final-return"
                label="Final Return Value"
                value={finalReturn}
                onChange={(v) => setFinalReturn(Math.max(0, Number(v) || 0))}
                prefix={currencySymbol}
                min={0}
                step={500}
                helpText="Total liquidated value or revenue returned"
              />
              <CalcSlider
                id="final-return-slider"
                ariaLabel="Final Return Value Slider"
                value={finalReturn}
                min={500}
                max={500000}
                step={500}
                prefix={currencySymbol}
                onChange={setFinalReturn}
              />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] uppercase font-semibold text-zinc-400">
                  Quick Target:
                </span>
                {RETURN_MULTIPLIERS.map(({ label, mult }) => {
                  const targetVal = Math.round(initialInvestment * mult);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setFinalReturn(targetVal)}
                      className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all touch-manipulation cursor-pointer flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
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
              <div className="flex flex-wrap gap-2 pt-1">
                {DURATION_PRESETS.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setInvestmentYears(yr)}
                    className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all touch-manipulation cursor-pointer flex items-center justify-center ${
                      investmentYears === yr
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                        : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    {yr} {yr === 1 ? "Year" : "Years"}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Save, Share, Prompt, Excel Export */}
            <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
              <CalcSaveButton
                calculationType="ROI Investment Projection"
                inputs={{ initialInvestment, finalReturn, investmentYears }}
                outputs={{ netProfit, simpleRoi, annualizedRoi }}
              />
              <CalcShareButton
                title="ConvertSheet Return on Investment (ROI) Calculation"
                text={`ROI: ${simpleRoi >= 0 ? `+${simpleRoi}%` : `${simpleRoi}%`} | Net Profit: ${formatCurrency(netProfit)} | CAGR: ${annualizedRoi}%/yr over ${investmentYears} years`}
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
              title="Return on Investment"
              primaryLabel="Total Return on Investment"
              primaryValue={simpleRoi >= 0 ? `+${simpleRoi}%` : `${simpleRoi}%`}
              primarySubtext={`Annualized CAGR: ${annualizedRoi}% / yr`}
              copyValue={copySummary}
              items={[
                {
                  label: "Net Capital Gain",
                  value: formatCurrency(netProfit),
                  highlight: netProfit >= 0,
                },
                {
                  label: "Holding Period",
                  value: `${investmentYears} yrs`,
                },
                {
                  label: "Initial Cost Basis",
                  value: formatCurrency(initialInvestment),
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

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
            Net Capital Gain
          </span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(netProfit)}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
            Total ROI: {simpleRoi >= 0 ? `+${simpleRoi}%` : `${simpleRoi}%`} ({annualizedRoi}% CAGR)
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
