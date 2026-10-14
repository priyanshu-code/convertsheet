import { roundTo } from "../math-utils";

/**
 * ==========================================
 * QUANTITATIVE & ALGO TRADING ENGINE (WASM / CLIENT-SIDE)
 * ==========================================
 * High-performance statistical metrics, backtest performance,
 * risk-adjusted return ratios, options payoff & Greeks approximations,
 * and position sizing algorithms for quantitative traders.
 */

export interface BacktestPerformanceInput {
  /** Array of periodic returns (e.g. daily, monthly) as decimals: e.g. [0.012, -0.005, 0.02, ...] */
  returns: number[];
  /** Annualized risk-free benchmark rate (e.g. 0.045 for 4.5% US 3-Month T-Bill) */
  riskFreeRate?: number;
  /** Periods per year: 252 for daily trading, 52 for weekly, 12 for monthly */
  periodsPerYear?: number;
  /** Initial capital invested (default 10,000) */
  initialCapital?: number;
}

export interface DrawdownPoint {
  period: number;
  portfolioValue: number;
  peakValue: number;
  drawdownPercent: number;
}

export interface BacktestPerformanceResult {
  totalReturnPercent: number;
  cagrPercent: number;
  annualizedVolatilityPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdownPercent: number;
  maxDrawdownDurationPeriods: number;
  winRatePercent: number;
  profitFactor: number;
  gainToLossRatio: number;
  bestPeriodReturnPercent: number;
  worstPeriodReturnPercent: number;
  totalPeriods: number;
  equityCurve: { period: number; value: number }[];
  drawdownSeries: DrawdownPoint[];
}

/**
 * Computes institutional-grade risk-adjusted performance metrics:
 * Sharpe Ratio = (R_p - R_f) / sigma_p
 * Sortino Ratio = (R_p - R_f) / downside_deviation
 * Calmar Ratio = CAGR / |MaxDrawdown|
 */
export function calculateBacktestMetrics(
  input: BacktestPerformanceInput
): BacktestPerformanceResult {
  const returns = input.returns || [];
  const rf = input.riskFreeRate ?? 0.045; // Default 4.5% risk-free rate
  const periodsPerYear = input.periodsPerYear ?? 252;
  const initialCap = input.initialCapital ?? 10000;

  if (returns.length === 0) {
    return {
      totalReturnPercent: 0,
      cagrPercent: 0,
      annualizedVolatilityPercent: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      maxDrawdownPercent: 0,
      maxDrawdownDurationPeriods: 0,
      winRatePercent: 0,
      profitFactor: 0,
      gainToLossRatio: 0,
      bestPeriodReturnPercent: 0,
      worstPeriodReturnPercent: 0,
      totalPeriods: 0,
      equityCurve: [{ period: 0, value: initialCap }],
      drawdownSeries: [],
    };
  }

  const n = returns.length;
  let capital = initialCap;
  let peak = initialCap;
  let maxDd = 0;
  let currentDdPeriods = 0;
  let maxDdDuration = 0;

  const equityCurve: { period: number; value: number }[] = [{ period: 0, value: initialCap }];
  const drawdownSeries: DrawdownPoint[] = [];

  let sumReturns = 0;
  let positiveGainsSum = 0;
  let negativeLossesSum = 0;
  let winCount = 0;
  let bestReturn = returns[0];
  let worstReturn = returns[0];

  for (let i = 0; i < n; i++) {
    const r = returns[i];
    sumReturns += r;
    capital = capital * (1 + r);
    equityCurve.push({ period: i + 1, value: roundTo(capital, 2) });

    if (capital > peak) {
      peak = capital;
      currentDdPeriods = 0;
    } else {
      currentDdPeriods++;
      if (currentDdPeriods > maxDdDuration) {
        maxDdDuration = currentDdPeriods;
      }
    }

    const dd = peak > 0 ? (peak - capital) / peak : 0;
    if (dd > maxDd) {
      maxDd = dd;
    }

    drawdownSeries.push({
      period: i + 1,
      portfolioValue: roundTo(capital, 2),
      peakValue: roundTo(peak, 2),
      drawdownPercent: roundTo(dd * 100, 2),
    });

    if (r > 0) {
      winCount++;
      positiveGainsSum += r;
    } else if (r < 0) {
      negativeLossesSum += Math.abs(r);
    }

    if (r > bestReturn) bestReturn = r;
    if (r < worstReturn) worstReturn = r;
  }

  const meanReturn = sumReturns / n;
  const totalReturn = (capital - initialCap) / initialCap;

  // Annualized CAGR: (Ending / Beginning) ^ (periodsPerYear / n) - 1
  const years = n / periodsPerYear;
  const cagr = capital > 0 && years > 0 ? Math.pow(capital / initialCap, 1 / years) - 1 : 0;

  // Sample Standard Deviation
  let varianceSum = 0;
  let downsideVarianceSum = 0;
  const periodicRf = rf / periodsPerYear;

  for (let i = 0; i < n; i++) {
    const diff = returns[i] - meanReturn;
    varianceSum += diff * diff;

    // Downside deviation below minimum acceptable return (periodic Rf)
    const downsideDiff = Math.min(0, returns[i] - periodicRf);
    downsideVarianceSum += downsideDiff * downsideDiff;
  }

  const stdDev = n > 1 ? Math.sqrt(varianceSum / (n - 1)) : 0;
  const downsideDev = n > 1 ? Math.sqrt(downsideVarianceSum / (n - 1)) : 0;

  const annVol = stdDev * Math.sqrt(periodsPerYear);
  const annDownsideDev = downsideDev * Math.sqrt(periodsPerYear);

  // Sharpe Ratio: (Ann Return - Rf) / Ann Volatility
  const sharpe = annVol > 0 ? (cagr - rf) / annVol : 0;

  // Sortino Ratio: (Ann Return - Rf) / Ann Downside Dev
  const sortino = annDownsideDev > 0 ? (cagr - rf) / annDownsideDev : 0;

  // Calmar Ratio: CAGR / Max Drawdown
  const calmar = maxDd > 0 ? cagr / maxDd : 0;

  const winRate = (winCount / n) * 100;
  const profitFactor =
    negativeLossesSum > 0
      ? positiveGainsSum / negativeLossesSum
      : positiveGainsSum > 0
      ? 999
      : 0;
  const lossCount = n - winCount;
  const avgGain = winCount > 0 ? positiveGainsSum / winCount : 0;
  const avgLoss = lossCount > 0 ? negativeLossesSum / lossCount : 0;
  const gainToLossRatio = avgLoss > 0 ? avgGain / avgLoss : 0;

  return {
    totalReturnPercent: roundTo(totalReturn * 100, 2),
    cagrPercent: roundTo(cagr * 100, 2),
    annualizedVolatilityPercent: roundTo(annVol * 100, 2),
    sharpeRatio: roundTo(sharpe, 2),
    sortinoRatio: roundTo(sortino, 2),
    calmarRatio: roundTo(calmar, 2),
    maxDrawdownPercent: roundTo(maxDd * 100, 2),
    maxDrawdownDurationPeriods: maxDdDuration,
    winRatePercent: roundTo(winRate, 2),
    profitFactor: roundTo(profitFactor, 2),
    gainToLossRatio: roundTo(gainToLossRatio, 2),
    bestPeriodReturnPercent: roundTo(bestReturn * 100, 2),
    worstPeriodReturnPercent: roundTo(worstReturn * 100, 2),
    totalPeriods: n,
    equityCurve,
    drawdownSeries,
  };
}

/**
 * ==========================================
 * POSITION SIZING & RISK ENGINE (KELLY CRITERION & FIXED FRACTIONAL)
 * ==========================================
 */
export interface PositionSizingInput {
  accountBalance: number;
  riskPercentage: number; // e.g. 1% or 2% risk of ruin per trade
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
  contractMultiplier?: number; // 1 for stocks, 100 for options, 1000 for futures etc.
  winRatePercent?: number; // e.g. 55% for Kelly
}

export interface PositionSizingResult {
  maxCapitalAtRisk: number;
  dollarRiskPerUnit: number;
  percentRiskPerUnit: number;
  positionSizeUnits: number;
  totalPositionValue: number;
  leverageRatio: number;
  riskRewardRatio: number;
  kellyFractionPercent: number;
  recommendedKellyUnits: number;
}

export function calculatePositionSize(input: PositionSizingInput): PositionSizingResult {
  const balance = Math.max(0, input.accountBalance || 0);
  const riskPct = Math.max(0.01, Math.min(100, input.riskPercentage || 1)) / 100;
  const entry = Math.max(0.0001, input.entryPrice || 1);
  const stop = Math.max(0.0001, input.stopLossPrice || 1);
  const tp = input.takeProfitPrice ? Math.max(0.0001, input.takeProfitPrice) : 0;
  const multiplier = Math.max(1, input.contractMultiplier || 1);
  const winRate = Math.min(99.9, Math.max(0.1, (input.winRatePercent ?? 50))) / 100;

  const maxRisk = balance * riskPct;
  const riskPerUnit = Math.abs(entry - stop) * multiplier;
  const percentRiskPerUnit = (Math.abs(entry - stop) / entry) * 100;

  const rawUnits = riskPerUnit > 0 ? maxRisk / riskPerUnit : 0;
  const units = Math.floor(rawUnits);
  const totalValue = units * entry * multiplier;
  const leverage = balance > 0 ? totalValue / balance : 0;

  let rrr = 0;
  if (tp > 0 && Math.abs(entry - stop) > 0) {
    const profitPerUnit = Math.abs(tp - entry);
    rrr = profitPerUnit / Math.abs(entry - stop);
  }

  // Kelly Criterion formula: f* = p - (1 - p) / b, where b is payoff ratio (win/loss ratio)
  const b = rrr > 0 ? rrr : 1.5;
  const q = 1 - winRate;
  const rawKelly = winRate - q / b;
  const kellyPct = Math.max(0, Math.min(1, rawKelly)) * 100;
  // Half-Kelly recommendation for capital preservation
  const halfKellyRiskCapital = balance * (kellyPct / 2 / 100);
  const kellyUnits = riskPerUnit > 0 ? Math.floor(halfKellyRiskCapital / riskPerUnit) : 0;

  return {
    maxCapitalAtRisk: roundTo(maxRisk, 2),
    dollarRiskPerUnit: roundTo(riskPerUnit, 4),
    percentRiskPerUnit: roundTo(percentRiskPerUnit, 2),
    positionSizeUnits: units,
    totalPositionValue: roundTo(totalValue, 2),
    leverageRatio: roundTo(leverage, 2),
    riskRewardRatio: roundTo(rrr, 2),
    kellyFractionPercent: roundTo(kellyPct, 2),
    recommendedKellyUnits: kellyUnits,
  };
}
