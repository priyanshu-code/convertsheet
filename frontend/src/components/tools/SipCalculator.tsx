"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TrendingUp, ShieldCheck, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcResult,
  CalcChart,
  CalcPromptButton,
  CalcExportButton,
  CalcShareButton,
  CalcSaveButton,
} from "@/components/calculator";
import { useCurrency } from "@/context/CurrencyContext";

export interface SipCalculatorProps {
  initialValues?: Record<string, unknown>;
}

export function SipCalculator({ initialValues }: SipCalculatorProps = {}) {
  const { currencySymbol, formatCurrency } = useCurrency();

  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(() => {
    if (initialValues?.monthlyInvestment !== undefined) return Number(initialValues.monthlyInvestment);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("monthlyInvestment");
      if (q) return Number(q);
    }
    return 5000;
  });

  const [annualReturnRate, setAnnualReturnRate] = useState<number>(() => {
    if (initialValues?.annualReturnRate !== undefined) return Number(initialValues.annualReturnRate);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("annualReturnRate");
      if (q) return Number(q);
    }
    return 12;
  });

  const [timeYears, setTimeYears] = useState<number>(() => {
    if (initialValues?.timeYears !== undefined) return Number(initialValues.timeYears);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("timeYears");
      if (q) return Number(q);
    }
    return 10;
  });

  const { totalInvested, wealthGained, totalMaturity, realPurchasingPower } = useMemo(() => {
    const P = Math.max(0, monthlyInvestment);
    const r = Math.max(0, annualReturnRate);
    const t = Math.max(1, timeYears);

    const i = r / 12 / 100;
    const n = t * 12;

    const invested = P * n;
    let maturity = 0;

    if (i === 0) {
      maturity = invested;
    } else {
      // SIP Formula: P * [((1 + i)^n - 1) / i] * (1 + i)
      maturity = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }

    const gains = Math.max(0, maturity - invested);
    const inflationRate = 0.055; // 5.5% baseline inflation
    const realMaturity = maturity / Math.pow(1 + inflationRate, t);

    return {
      totalInvested: Math.round(invested),
      wealthGained: Math.round(gains),
      totalMaturity: Math.round(maturity),
      realPurchasingPower: Math.round(realMaturity),
    };
  }, [monthlyInvestment, annualReturnRate, timeYears]);

  // Sharable State Permalinks: smoothly sync parameters into URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("monthlyInvestment", monthlyInvestment.toString());
    params.set("annualReturnRate", annualReturnRate.toString());
    params.set("timeYears", timeYears.toString());
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [monthlyInvestment, annualReturnRate, timeYears]);

  // Year by year trajectory for interactive Recharts area graph
  const chartData = useMemo(() => {
    const P = Math.max(0, monthlyInvestment);
    const r = Math.max(0, annualReturnRate);
    const t = Math.max(1, timeYears);
    const i = r / 12 / 100;

    const data = [];
    for (let yr = 1; yr <= t; yr++) {
      const n = yr * 12;
      const inv = P * n;
      const mat = i === 0 ? inv : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      data.push({
        label: `Yr ${yr}`,
        invested: Math.round(inv),
        wealthGained: Math.round(Math.max(0, mat - inv)),
        totalValue: Math.round(mat),
      });
    }
    return data;
  }, [monthlyInvestment, annualReturnRate, timeYears]);

  const handleExportExcel = () => {
    try {
      const summaryRows = [
        ["ConvertSheet - Mutual Fund Systematic Investment Plan (SIP) Projections", ""],
        ["Report Generated At", new Date().toISOString().split("T")[0]],
        ["ConvertSheet Recalculation Model", "https://www.convertsheet.com/tools/sip-calculator"],
        ["Formula Reference", "=FV(annualRate/12, years*12, -monthlyPmt, 0, 1)"],
        ["", ""],
        ["--- INVESTMENT PARAMETERS ---", ""],
        [`Monthly Contribution (${currencySymbol})`, monthlyInvestment],
        ["Expected Annual Return Rate (%)", annualReturnRate],
        ["Investment Horizon (Years)", timeYears],
        ["Total Investment Months", timeYears * 12],
        ["Estimated Annual Inflation Benchmark (%)", "5.5%"],
        ["", ""],
        ["--- MATURITY & WEALTH SUMMARY ---", ""],
        [`Total Invested Capital (${currencySymbol})`, totalInvested],
        [`Estimated Wealth Gained (${currencySymbol})`, wealthGained],
        [`Nominal Maturity Corpus (${currencySymbol})`, totalMaturity],
        [`Inflation-Adjusted Real Purchasing Power (${currencySymbol})`, realPurchasingPower],
        ["Wealth Multiplier", totalInvested > 0 ? `${(totalMaturity / totalInvested).toFixed(2)}x` : "1.00x"],
        ["", ""],
        ["--- YEAR-BY-YEAR COMPOUNDING TRAJECTORY ---", "", "", ""],
        ["Year", `Invested Capital (${currencySymbol})`, `Estimated Wealth Gained (${currencySymbol})`, `Total Portfolio Value (${currencySymbol})`],
        ...chartData.map((d) => [d.label, d.invested, d.wealthGained, d.totalValue]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SIPProjections");
      XLSX.writeFile(
        wb,
        `ConvertSheet_SIP_${monthlyInvestment}_pm_${timeYears}yrs_${annualReturnRate}pct.xlsx`
      );
    } catch (err) {
      console.error("Excel export failed:", err);
    }
  };

  const aiPrompt = useMemo(() => {
    return `Analyze this SIP investment strategy:
- Monthly Contribution: ${formatCurrency(monthlyInvestment)}/month
- Expected Annual Return: ${annualReturnRate}%
- Investment Horizon: ${timeYears} years (${timeYears * 12} installments)
- Projected Corpus:
  • Total Invested Capital: ${formatCurrency(totalInvested)}
  • Estimated Capital Gains: ${formatCurrency(wealthGained)}
  • Total Maturity Value: ${formatCurrency(totalMaturity)} (${totalInvested > 0 ? (totalMaturity / totalInvested).toFixed(2) : "1"}x multiplier)
Please evaluate:
1. Real inflation-adjusted purchasing power (assuming 5.5% annual inflation).
2. Asset allocation strategy across Large Cap, Flexi Cap, Mid Cap, and Arbitrage funds.
3. Step-up SIP impact (e.g. increasing contribution by 10% each year).`;
  }, [monthlyInvestment, annualReturnRate, timeYears, totalInvested, wealthGained, totalMaturity, formatCurrency]);

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      {/* Zero-Knowledge Client-Side Privacy Badge & Rate Freshness Signals */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Client-Side • Zero Server Storage • Private & Free Forever</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 text-xs w-fit">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <span className="font-medium">
            Updated for October 2026: Equity SIP CAGR (12.0%–14.5%) • Debt SIPs (7.0%–7.5%) • RBI Repo 5.50% • Fed Funds 3.75%–4.00%
          </span>
        </div>
      </div>

      <CalcCard
        title="SIP Calculator (Mutual Funds)"
        subtitle="Forecast your mutual fund systematic investment wealth generation with compound growth projections."
        icon={TrendingUp}
        badge="Wealth Builder"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <CalcInput
              id="sip-amount"
              label="Monthly Investment"
              value={monthlyInvestment}
              min={100}
              step={100}
              prefix={currencySymbol}
              onChange={(val) => setMonthlyInvestment(Number(val) || 0)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Quick:</span>
              {(currencySymbol === "₹"
                ? [1000, 2500, 5000, 10000, 25000]
                : [100, 250, 500, 1000, 2500]
              ).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMonthlyInvestment(amt)}
                  className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors touch-manipulation cursor-pointer ${
                    monthlyInvestment === amt
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {currencySymbol}{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
            <CalcSlider
              id="sip-amount-slider"
              label="Adjust Monthly Contribution"
              ariaLabel="Monthly SIP Contribution Slider"
              value={monthlyInvestment}
              min={100}
              max={100000}
              step={100}
              prefix={currencySymbol}
              onChange={setMonthlyInvestment}
            />
          </div>

          <div className="space-y-4">
            <CalcInput
              id="sip-rate"
              label="Expected Annual Return (%)"
              value={annualReturnRate}
              min={1}
              max={30}
              step={0.5}
              suffix="%"
              onChange={(val) => setAnnualReturnRate(Number(val) || 0)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Presets:</span>
              {[
                { rate: 7.5, label: "7.5% (Debt)" },
                { rate: 10, label: "10% (Hybrid)" },
                { rate: 12, label: "12% (Index)" },
                { rate: 14.5, label: "14.5% (Flexi)" },
                { rate: 16, label: "16% (SmallCap)" },
              ].map((p) => (
                <button
                  key={p.rate}
                  type="button"
                  onClick={() => setAnnualReturnRate(p.rate)}
                  className={`min-h-[44px] px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors touch-manipulation cursor-pointer ${
                    annualReturnRate === p.rate
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <CalcSlider
              id="sip-rate-slider"
              label="Return Rate Range"
              ariaLabel="Expected Annual Return Rate Slider"
              value={annualReturnRate}
              min={1}
              max={30}
              step={0.5}
              unit="%"
              onChange={setAnnualReturnRate}
            />
          </div>

          <div className="space-y-4">
            <CalcInput
              id="sip-tenure"
              label="Investment Time Horizon"
              value={timeYears}
              min={1}
              max={40}
              step={1}
              suffix="Years"
              onChange={(val) => setTimeYears(Number(val) || 1)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Tenure:</span>
              {[3, 5, 10, 15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTimeYears(yr)}
                  className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors touch-manipulation cursor-pointer ${
                    timeYears === yr
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {yr}y
                </button>
              ))}
            </div>
            <CalcSlider
              id="sip-tenure-slider"
              label="Tenure (Years)"
              ariaLabel="Investment Horizon Tenure Slider"
              value={timeYears}
              min={1}
              max={40}
              unit="Yrs"
              onChange={setTimeYears}
            />
          </div>
        </div>

        <CalcResult
          title="Maturity Breakdown"
          primaryLabel="Total Expected Maturity Value"
          primaryValue={formatCurrency(totalMaturity)}
          copyValue={`SIP Maturity: ${formatCurrency(totalMaturity)} | Total Invested: ${formatCurrency(totalInvested)} | Wealth Gained: ${formatCurrency(wealthGained)} (${timeYears} years at ${annualReturnRate}%) | Real Purchasing Power (5.5% infl): ${formatCurrency(realPurchasingPower)}`}
          items={[
            {
              label: "Total Invested Capital",
              value: formatCurrency(totalInvested),
            },
            {
              label: "Estimated Wealth Gained",
              value: formatCurrency(wealthGained),
              highlight: true,
            },
            {
              label: "Wealth Multiplier",
              value: totalInvested > 0 ? `${(totalMaturity / totalInvested).toFixed(2)}x` : "1x",
              badge: "Growth",
            },
            {
              label: "Inflation-Adjusted Purchasing Power",
              value: formatCurrency(realPurchasingPower),
              subtext: `Real value at ~5.5% annual inflation over ${timeYears} years`,
            },
          ]}
        />

        {/* Action Bar */}
        <div className="pt-2 flex flex-wrap gap-3">
          <CalcSaveButton
            toolSlug="sip-calculator"
            toolName="SIP Calculator"
            summaryTitle={`SIP: ${formatCurrency(monthlyInvestment)}/mo (${timeYears}y @ ${annualReturnRate}%)`}
            summaryMetrics={[
              { label: "Maturity Value", value: formatCurrency(totalMaturity) },
              { label: "Invested", value: formatCurrency(totalInvested) },
              { label: "Wealth Gained", value: formatCurrency(wealthGained) },
              { label: "Multiplier", value: totalInvested > 0 ? `${(totalMaturity / totalInvested).toFixed(2)}x` : "1x" },
            ]}
          />
          <CalcShareButton
            state={{
              monthlyInvestment,
              annualReturnRate,
              timeYears,
            }}
            label="Share Calculation"
          />
          <CalcPromptButton promptText={aiPrompt} label="Copy Prompt for ChatGPT / Claude" />
          <button
            type="button"
            onClick={handleExportExcel}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Formulaic Excel</span>
          </button>
          <CalcExportButton
            filename={`convertsheet_sip_${monthlyInvestment}_pm_${timeYears}yrs`}
            sheetName="SIP Projections"
            data={chartData.map((d) => ({
              Year: d.label,
              [`Invested Capital (${currencySymbol})`]: d.invested,
              [`Wealth Gained (${currencySymbol})`]: d.wealthGained,
              [`Total Portfolio Value (${currencySymbol})`]: d.totalValue,
            }))}
            label="Download Schedule (.xlsx)"
          />
        </div>

        {/* Interactive Growth Curve Chart */}
        <CalcChart
          title="SIP Compounding Wealth Curve (Year-by-Year)"
          data={chartData}
          series={[
            {
              key: "invested",
              name: "Invested Capital",
              color: "#3B82F6",
              gradientId: "sipInvestedGrad",
            },
            {
              key: "wealthGained",
              name: "Estimated Gains",
              color: "#10B981",
              gradientId: "sipGainsGrad",
            },
          ]}
        />
      </CalcCard>

      {/* Sticky Bottom Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Expected Maturity</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalMaturity)}
          </span>
          <span className="text-[11px] text-zinc-500 block">
            Gains: {formatCurrency(wealthGained)}
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
