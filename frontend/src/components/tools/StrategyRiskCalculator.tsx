"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  ShieldCheck,
  TrendingUp,
  Percent,
  DollarSign,
  BarChart2,
  AlertTriangle,
  Award,
  Sparkles,
  Download,
} from "lucide-react";
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
import {
  calculateBacktestMetrics,
  calculatePositionSize,
} from "@/lib/engines/quant-engine";
import * as XLSX from "xlsx";

export interface StrategyRiskCalculatorProps {
  initialValues?: Partial<{
    accountBalance: number;
    riskPercentage: number;
    entryPrice: number;
    stopLossPrice: number;
    takeProfitPrice: number;
    winRatePercent: number;
    periodsPerYear: number;
    annualRiskFreeRate: number;
  }>;
}

const STRATEGY_PRESETS = [
  {
    name: "S&P 500 Trend Following",
    returns: [0.015, -0.008, 0.022, 0.011, -0.014, 0.018, 0.025, -0.006, 0.019, 0.008, -0.012, 0.021],
    entry: 520,
    stop: 505,
    tp: 555,
    winRate: 58,
  },
  {
    name: "Tech Momentum Breakout",
    returns: [0.035, -0.022, 0.048, -0.031, 0.052, 0.015, -0.018, 0.041, -0.025, 0.038, 0.029, -0.015],
    entry: 185,
    stop: 176,
    tp: 208,
    winRate: 52,
  },
  {
    name: "Market Neutral Mean Reversion",
    returns: [0.006, 0.008, -0.004, 0.007, 0.005, -0.003, 0.008, 0.006, -0.005, 0.007, 0.004, 0.005],
    entry: 100,
    stop: 98,
    tp: 103,
    winRate: 68,
  },
];

export function StrategyRiskCalculator({
  initialValues,
}: StrategyRiskCalculatorProps = {}) {
  const [tab, setTab] = useState<"position" | "backtest">("position");

  // Position Sizing state
  const [accountBalance, setAccountBalance] = useState<number>(() => {
    if (initialValues?.accountBalance !== undefined) return Number(initialValues.accountBalance);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("balance");
      if (q) return Number(q);
    }
    return 50000;
  });

  const [riskPercentage, setRiskPercentage] = useState<number>(() => {
    if (initialValues?.riskPercentage !== undefined) return Number(initialValues.riskPercentage);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("riskPct");
      if (q) return Number(q);
    }
    return 1.5;
  });

  const [entryPrice, setEntryPrice] = useState<number>(() => {
    if (initialValues?.entryPrice !== undefined) return Number(initialValues.entryPrice);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("entry");
      if (q) return Number(q);
    }
    return 150;
  });

  const [stopLossPrice, setStopLossPrice] = useState<number>(() => {
    if (initialValues?.stopLossPrice !== undefined) return Number(initialValues.stopLossPrice);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("stop");
      if (q) return Number(q);
    }
    return 142;
  });

  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(() => {
    if (initialValues?.takeProfitPrice !== undefined) return Number(initialValues.takeProfitPrice);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("tp");
      if (q) return Number(q);
    }
    return 168;
  });

  const [winRatePercent, setWinRatePercent] = useState<number>(() => {
    if (initialValues?.winRatePercent !== undefined) return Number(initialValues.winRatePercent);
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("winRate");
      if (q) return Number(q);
    }
    return 55;
  });

  // Backtest returns input string
  const [returnsInput, setReturnsInput] = useState<string>(
    "1.5, -0.8, 2.2, 1.1, -1.4, 1.8, 2.5, -0.6, 1.9, 0.8, -1.2, 2.1"
  );
  const [riskFreeRate, setRiskFreeRate] = useState<number>(4.5);
  const [periodsPerYear, setPeriodsPerYear] = useState<number>(12); // monthly default

  // Parse returns
  const parsedReturns = useMemo(() => {
    return returnsInput
      .split(/[\s,]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n))
      .map((pct) => pct / 100);
  }, [returnsInput]);

  const positionResult = useMemo(() => {
    return calculatePositionSize({
      accountBalance,
      riskPercentage,
      entryPrice,
      stopLossPrice,
      takeProfitPrice,
      winRatePercent,
    });
  }, [accountBalance, riskPercentage, entryPrice, stopLossPrice, takeProfitPrice, winRatePercent]);

  const backtestResult = useMemo(() => {
    return calculateBacktestMetrics({
      returns: parsedReturns,
      riskFreeRate: riskFreeRate / 100,
      periodsPerYear,
      initialCapital: accountBalance,
    });
  }, [parsedReturns, riskFreeRate, periodsPerYear, accountBalance]);

  // URL Synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("balance", accountBalance.toString());
    params.set("riskPct", riskPercentage.toString());
    params.set("entry", entryPrice.toString());
    params.set("stop", stopLossPrice.toString());
    params.set("tp", takeProfitPrice.toString());
    params.set("winRate", winRatePercent.toString());
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [accountBalance, riskPercentage, entryPrice, stopLossPrice, takeProfitPrice, winRatePercent]);

  const handleExportExcel = () => {
    try {
      const summaryRows = [
        ["ConvertSheet - Quantitative Strategy Risk & Performance Audit", ""],
        ["Generated At", new Date().toISOString().split("T")[0]],
        ["Recalculation Permalink", "https://www.convertsheet.com/tools/strategy-risk-calculator"],
        ["Execution Sandboxing", "100% Client-Side WebAssembly (Zero Cloud Uploads)"],
        ["", ""],
        ["--- POSITION SIZING & RISK PARAMETERS ---", ""],
        ["Account Equity ($)", accountBalance],
        ["Max Risk Allowed per Trade (%)", `${riskPercentage}%`],
        ["Dollar Capital at Risk ($)", positionResult.maxCapitalAtRisk],
        ["Entry Price ($)", entryPrice],
        ["Stop Loss Price ($)", stopLossPrice],
        ["Take Profit Target ($)", takeProfitPrice],
        ["Dollar Risk per Share ($)", positionResult.dollarRiskPerUnit],
        ["Position Size (Units / Shares)", positionResult.positionSizeUnits],
        ["Total Capital Allocated ($)", positionResult.totalPositionValue],
        ["Portfolio Exposure / Leverage Ratio", `${positionResult.leverageRatio}x`],
        ["Risk-to-Reward Ratio (R:R)", `${positionResult.riskRewardRatio} : 1`],
        ["Optimal Full-Kelly Sizing (%)", `${positionResult.kellyFractionPercent}%`],
        ["Conservative Half-Kelly Shares", positionResult.recommendedKellyUnits],
        ["", ""],
        ["--- BACKTEST PERFORMANCE METRICS ---", ""],
        ["Total Strategy Return (%)", `${backtestResult.totalReturnPercent}%`],
        ["Compound Annual Growth Rate (CAGR)", `${backtestResult.cagrPercent}%`],
        ["Annualized Volatility (StdDev)", `${backtestResult.annualizedVolatilityPercent}%`],
        ["Sharpe Ratio", backtestResult.sharpeRatio],
        ["Sortino Ratio (Downside Volatility)", backtestResult.sortinoRatio],
        ["Calmar Ratio (CAGR / Max DD)", backtestResult.calmarRatio],
        ["Maximum Drawdown (%)", `${backtestResult.maxDrawdownPercent}%`],
        ["Profit Factor", backtestResult.profitFactor],
        ["Historical Win Rate (%)", `${backtestResult.winRatePercent}%`],
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "StrategyRiskAudit");
      XLSX.writeFile(wb, `ConvertSheet_Quant_Risk_Audit_${accountBalance}.xlsx`);
    } catch (err) {
      console.error("Excel export error:", err);
    }
  };

  const aiPrompt = useMemo(() => {
    return `Analyze this algorithmic trading risk model:
- Portfolio Balance: $${accountBalance.toLocaleString()}
- Max Risk: ${riskPercentage}% ($${positionResult.maxCapitalAtRisk.toLocaleString()} max loss)
- Setup: Entry $${entryPrice}, Stop Loss $${stopLossPrice}, Take Profit $${takeProfitPrice} (R:R ${positionResult.riskRewardRatio}:1)
- Position Size: ${positionResult.positionSizeUnits} units ($${positionResult.totalPositionValue.toLocaleString()} exposure, ${positionResult.leverageRatio}x portfolio leverage)
- Kelly Criterion: Full Kelly ${positionResult.kellyFractionPercent}%, Half Kelly ${positionResult.recommendedKellyUnits} units
- Performance Profile: Sharpe ${backtestResult.sharpeRatio}, Sortino ${backtestResult.sortinoRatio}, Calmar ${backtestResult.calmarRatio}, Max Drawdown ${backtestResult.maxDrawdownPercent}%
Provide institutional feedback on probability of ruin, position sizing prudence, and risk-adjusted alpha characteristics.`;
  }, [accountBalance, riskPercentage, entryPrice, stopLossPrice, takeProfitPrice, positionResult, backtestResult]);

  const chartData = useMemo(() => {
    return backtestResult.equityCurve.map((point) => ({
      label: point.period === 0 ? "Start" : `P${point.period}`,
      portfolioValue: point.value,
      baselineEquity: accountBalance,
    }));
  }, [backtestResult.equityCurve, accountBalance]);

  return (
    <div className="space-y-6 pb-28 sm:pb-0">
      <CalcCard
        title="Quantitative Strategy Risk & Sizing Calculator"
        subtitle="Calculate exact position sizing, dollar risk per trade, Kelly Criterion limits, Sharpe ratio, Sortino, and Max Drawdown locally in your browser."
        icon={LineChart}
        badge="Quant & Algo Trading"
      >
        {/* Zero-Knowledge Privacy Reassurance Badge & Freshness Signal */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30 text-xs text-emerald-900 dark:text-emerald-200 w-fit">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Confidential Strategy Execution:</strong> 100% Client-Side WebAssembly. Zero alpha data or trade logs transmitted to servers.
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 text-xs w-fit">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span className="font-medium">
              Updated for October 2026: 3-Month T-Bill Benchmark (Rf) 4.50% • Effective Fed Funds 3.88% • 10-Yr Treasury 5.10%
            </span>
          </div>
        </div>

        {/* Preset Strategy Selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
            Preset Quantitative Archetypes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {STRATEGY_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setEntryPrice(p.entry);
                  setStopLossPrice(p.stop);
                  setTakeProfitPrice(p.tp);
                  setWinRatePercent(p.winRate);
                  setReturnsInput(p.returns.map((r) => (r * 100).toFixed(1)).join(", "));
                }}
                className="min-h-[44px] px-3 py-2 text-left rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs transition-colors touch-manipulation cursor-pointer"
              >
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Entry ${p.entry} • Stop ${p.stop} • WR {p.winRate}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-6">
          <button
            type="button"
            onClick={() => setTab("position")}
            className={`min-h-[44px] pb-3 text-sm font-semibold border-b-2 mr-6 transition-colors touch-manipulation cursor-pointer inline-flex items-center ${
              tab === "position"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
            }`}
          >
            1. Position Sizing & Risk of Ruin
          </button>
          <button
            type="button"
            onClick={() => setTab("backtest")}
            className={`min-h-[44px] pb-3 text-sm font-semibold border-b-2 transition-colors touch-manipulation cursor-pointer inline-flex items-center ${
              tab === "backtest"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
            }`}
          >
            2. Backtest Performance & Sharpe / Sortino
          </button>
        </div>

      {tab === "position" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <CalcInput
                id="quant-balance"
                label="Total Trading Capital (Equity)"
                value={accountBalance}
                min={100}
                max={10000000}
                step={500}
                prefix="$"
                onChange={(v) => setAccountBalance(Number(v) || 0)}
              />
              <CalcSlider
                id="quant-balance-slider"
                label="Portfolio Equity"
                ariaLabel="Adjust Total Trading Capital"
                value={accountBalance}
                min={1000}
                max={500000}
                step={1000}
                unit="$"
                onChange={setAccountBalance}
              />
            </div>

            <div>
              <CalcInput
                id="quant-risk"
                label="Max Capital at Risk per Trade (%)"
                value={riskPercentage}
                min={0.1}
                max={10}
                step={0.1}
                suffix="%"
                onChange={(v) => setRiskPercentage(Number(v) || 0.1)}
              />
              <CalcSlider
                id="quant-risk-slider"
                label="Risk Tolerance"
                ariaLabel="Adjust Max Risk Percentage per Trade"
                value={riskPercentage}
                min={0.25}
                max={5}
                step={0.25}
                unit="%"
                onChange={setRiskPercentage}
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Presets:</span>
                {[
                  { label: "0.5% (Conservative)", val: 0.5 },
                  { label: "1.0% (Standard)", val: 1.0 },
                  { label: "1.5% (Swing)", val: 1.5 },
                  { label: "2.0% (Max Safe)", val: 2.0 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setRiskPercentage(p.val)}
                    className={`min-h-[44px] px-2.5 py-1 text-xs rounded-lg border transition-colors touch-manipulation cursor-pointer ${
                      riskPercentage === p.val
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CalcInput
                id="quant-entry"
                label="Entry Price"
                value={entryPrice}
                min={0.01}
                step={0.5}
                prefix="$"
                onChange={(v) => setEntryPrice(Number(v) || 1)}
              />
              <CalcInput
                id="quant-stop"
                label="Stop Loss Price"
                value={stopLossPrice}
                min={0.01}
                step={0.5}
                prefix="$"
                onChange={(v) => setStopLossPrice(Number(v) || 1)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CalcInput
                id="quant-tp"
                label="Take Profit Target"
                value={takeProfitPrice}
                min={0.01}
                step={0.5}
                prefix="$"
                onChange={(v) => setTakeProfitPrice(Number(v) || 1)}
              />
              <CalcInput
                id="quant-winrate"
                label="Estimated Win Rate (%)"
                value={winRatePercent}
                min={1}
                max={99}
                step={1}
                suffix="%"
                onChange={(v) => setWinRatePercent(Number(v) || 50)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <CalcResult
              title="Execution Sizing Recommendation"
              primaryLabel="Optimal Position Size"
              primaryValue={`${positionResult.positionSizeUnits.toLocaleString()} Units / Shares`}
              copyValue={`ConvertSheet Quant Risk Sizing: Position Size: ${positionResult.positionSizeUnits} shares ($${positionResult.totalPositionValue.toLocaleString()}) | Risk Capital: $${positionResult.maxCapitalAtRisk} (${riskPercentage}%) | Stop Loss: $${stopLossPrice} | R:R: ${positionResult.riskRewardRatio}:1`}
              items={[
                {
                  label: "Max Capital at Risk",
                  value: `$${positionResult.maxCapitalAtRisk.toLocaleString()}`,
                  highlight: true,
                },
                {
                  label: "Dollar Loss per Unit",
                  value: `$${positionResult.dollarRiskPerUnit.toFixed(2)} (${positionResult.percentRiskPerUnit.toFixed(1)}%)`,
                },
                {
                  label: "Total Position Value",
                  value: `$${positionResult.totalPositionValue.toLocaleString()}`,
                },
                {
                  label: "Portfolio Exposure (Leverage)",
                  value: `${positionResult.leverageRatio.toFixed(2)}x`,
                },
                {
                  label: "Risk-to-Reward Ratio (R:R)",
                  value: `${positionResult.riskRewardRatio.toFixed(2)} : 1`,
                  highlight: positionResult.riskRewardRatio >= 2,
                },
                {
                  label: "Full Kelly Optimal Sizing",
                  value: `${positionResult.kellyFractionPercent.toFixed(1)}%`,
                },
                {
                  label: "Conservative Half-Kelly Shares",
                  value: `${positionResult.recommendedKellyUnits.toLocaleString()} Units`,
                },
              ]}
            />

            {/* Retention & Export Tools */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <CalcSaveButton
                toolSlug="strategy-risk-calculator"
                toolName="Strategy Risk Calculator"
                summaryTitle={`${positionResult.positionSizeUnits} Shares at $${entryPrice}`}
                summaryMetrics={[
                  { label: "Capital at Risk", value: `$${positionResult.maxCapitalAtRisk}` },
                  { label: "R:R Ratio", value: `${positionResult.riskRewardRatio}:1` },
                ]}
              />
              <CalcShareButton
                state={{
                  balance: accountBalance,
                  riskPct: riskPercentage,
                  entry: entryPrice,
                  stop: stopLossPrice,
                  tp: takeProfitPrice,
                  winRate: winRatePercent,
                }}
              />
              <CalcPromptButton
                prompt={aiPrompt}
                label="AI Quant Audit Prompt"
              />
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Export Audit Model (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="quant-returns-input"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block"
              >
                Historical Periodic Returns (% separated by commas or spaces)
              </label>
              <textarea
                id="quant-returns-input"
                rows={3}
                value={returnsInput}
                onChange={(e) => setReturnsInput(e.target.value)}
                className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="1.2, -0.5, 2.0, 1.4, -0.8, ..."
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Detected {parsedReturns.length} historical return periods.
              </p>
            </div>

            <div className="space-y-3">
              <CalcInput
                id="quant-rf-rate"
                label="Risk-Free Benchmark (%)"
                value={riskFreeRate}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
                onChange={(v) => setRiskFreeRate(Number(v) || 0)}
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">Benchmarks:</span>
                {[
                  { label: "4.50% (3M T-Bill)", val: 4.5 },
                  { label: "3.88% (Fed Funds)", val: 3.88 },
                  { label: "5.10% (10Y Note)", val: 5.1 },
                  { label: "0.0% (Zero-Rf)", val: 0.0 },
                ].map((b) => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => setRiskFreeRate(b.val)}
                    className={`min-h-[44px] px-2.5 py-1 text-xs rounded-lg border transition-colors touch-manipulation cursor-pointer ${
                      riskFreeRate === b.val
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <CalcInput
                id="quant-periods-yr"
                label="Periods per Year"
                value={periodsPerYear}
                min={1}
                max={365}
                step={1}
                helpText="252 for daily, 52 for weekly, 12 for monthly"
                onChange={(v) => setPeriodsPerYear(Number(v) || 12)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">Sharpe Ratio</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {backtestResult.sharpeRatio}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Benchmark: {riskFreeRate}%</span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">Sortino Ratio</span>
              <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {backtestResult.sortinoRatio}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Downside Vol Only</span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">Max Drawdown</span>
              <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                -{backtestResult.maxDrawdownPercent}%
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Peak-to-Trough Loss</span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">Calmar Ratio</span>
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {backtestResult.calmarRatio}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">CAGR / Max DD</span>
            </div>
          </div>

          <CalcChart
            title="Equity Curve Trajectory"
            data={chartData}
            series={[
              {
                key: "portfolioValue",
                name: "Strategy Portfolio Equity",
                color: "#10B981",
                gradientId: "quantEquityGrad",
              },
            ]}
          />
        </div>
      )}

      {/* Sticky Mobile Summary Bar (<640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">Recommended Size</span>
          <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {positionResult.positionSizeUnits} Units (${positionResult.maxCapitalAtRisk} Risk)
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors touch-manipulation cursor-pointer"
        >
          Export .xlsx
        </button>
      </div>
    </CalcCard>
    </div>
  );
}
