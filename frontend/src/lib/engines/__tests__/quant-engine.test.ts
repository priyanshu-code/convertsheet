import { describe, it, expect } from "vitest";
import {
  calculateBacktestMetrics,
  calculatePositionSize,
} from "../quant-engine";

describe("quant-engine", () => {
  describe("calculateBacktestMetrics", () => {
    it("handles empty returns safely", () => {
      const res = calculateBacktestMetrics({ returns: [] });
      expect(res.totalReturnPercent).toBe(0);
      expect(res.sharpeRatio).toBe(0);
      expect(res.sortinoRatio).toBe(0);
      expect(res.maxDrawdownPercent).toBe(0);
      expect(res.equityCurve).toHaveLength(1);
    });

    it("calculates Sharpe, Sortino, and Drawdown accurately on steady profitable strategy", () => {
      // 10 periods with positive returns and slight variance
      const returns = [0.01, 0.02, -0.005, 0.015, 0.03, -0.01, 0.025, 0.01, 0.02, 0.005];
      const res = calculateBacktestMetrics({
        returns,
        riskFreeRate: 0.04,
        periodsPerYear: 252,
        initialCapital: 10000,
      });

      expect(res.totalReturnPercent).toBeGreaterThan(10);
      expect(res.cagrPercent).toBeGreaterThan(0);
      expect(res.sharpeRatio).toBeGreaterThan(0);
      expect(res.sortinoRatio).toBeGreaterThan(res.sharpeRatio); // Downside dev < total std dev
      expect(res.maxDrawdownPercent).toBeGreaterThan(0);
      expect(res.winRatePercent).toBe(80); // 8 out of 10 wins
      expect(res.profitFactor).toBeGreaterThan(1);
      expect(res.equityCurve).toHaveLength(11);
      expect(res.drawdownSeries).toHaveLength(10);
    });

    it("tracks maximum drawdown and duration correctly during a steep decline", () => {
      // Down 10%, down 10%, up 5%
      const returns = [-0.10, -0.10, 0.05];
      const res = calculateBacktestMetrics({
        returns,
        periodsPerYear: 252,
        initialCapital: 10000,
      });

      // 10,000 -> 9,000 -> 8,100 -> 8,505. Peak was 10,000, trough was 8,100 => 19% max drawdown
      expect(res.maxDrawdownPercent).toBe(19);
      expect(res.maxDrawdownDurationPeriods).toBeGreaterThanOrEqual(2);
    });
  });

  describe("calculatePositionSize", () => {
    it("calculates exact shares and dollar risk under 1% rule", () => {
      const res = calculatePositionSize({
        accountBalance: 100000,
        riskPercentage: 1, // $1,000 risk
        entryPrice: 150,
        stopLossPrice: 140, // $10 risk/share
        takeProfitPrice: 170, // $20 profit/share -> 2.0 R:R
      });

      expect(res.maxCapitalAtRisk).toBe(1000);
      expect(res.dollarRiskPerUnit).toBe(10);
      expect(res.positionSizeUnits).toBe(100); // 1,000 / 10 = 100 shares
      expect(res.totalPositionValue).toBe(15000); // 100 * 150
      expect(res.riskRewardRatio).toBe(2);
      expect(res.leverageRatio).toBe(0.15);
    });

    it("evaluates Kelly Criterion fraction correctly", () => {
      const res = calculatePositionSize({
        accountBalance: 50000,
        riskPercentage: 2,
        entryPrice: 50,
        stopLossPrice: 48,
        takeProfitPrice: 54, // 2:1 R:R
        winRatePercent: 60, // 60% win rate
      });

      // Kelly: f* = p - (1-p)/b = 0.60 - (0.40 / 2) = 0.60 - 0.20 = 0.40 (40%)
      expect(res.kellyFractionPercent).toBe(40);
      expect(res.recommendedKellyUnits).toBeGreaterThan(0);
    });
  });
});
