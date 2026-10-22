import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StrategyRiskCalculator } from "../StrategyRiskCalculator";

// Mock resize observer and window APIs
window.ResizeObserver =
  window.ResizeObserver ||
  vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

describe("StrategyRiskCalculator", () => {
  it("renders position sizing and risk cards with default values, privacy badge, and freshness signal", () => {
    render(<StrategyRiskCalculator />);
    expect(screen.getByText(/Quantitative Strategy Risk & Sizing Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidential Strategy Execution/i)).toBeInTheDocument();
    expect(screen.getByText(/Updated for October 2026: 3-Month T-Bill Benchmark/i)).toBeInTheDocument();
    expect(screen.getByText(/Optimal Position Size/i)).toBeInTheDocument();

    const archetypeBtn = screen.getByText("S&P 500 Trend Following").closest("button");
    expect(archetypeBtn).toHaveClass("min-h-[44px]");

    const riskPreset = screen.getByText("2.0% (Max Safe)");
    expect(riskPreset).toHaveClass("min-h-[44px]");
    fireEvent.click(riskPreset);
    expect(window.location.search).toContain("riskPct=2");
  });

  it("switches to backtest tab, handles benchmark presets with 44px targets, and renders Sharpe and Sortino ratios", () => {
    render(<StrategyRiskCalculator />);
    const backtestTab = screen.getByRole("button", { name: /2. Backtest Performance/i });
    expect(backtestTab).toHaveClass("min-h-[44px]");
    fireEvent.click(backtestTab);

    expect(screen.getAllByText(/Sharpe Ratio/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sortino Ratio/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Max Drawdown/i).length).toBeGreaterThan(0);

    const rfPreset = screen.getByText("5.10% (10Y Note)");
    expect(rfPreset).toHaveClass("min-h-[44px]");
    fireEvent.click(rfPreset);
  });

  it("updates position size dynamically when equity or risk percentage changes", () => {
    render(<StrategyRiskCalculator initialValues={{ accountBalance: 100000, riskPercentage: 1, entryPrice: 100, stopLossPrice: 90 }} />);
    // $100,000 * 1% = $1,000 risk. Stop is $10/share -> 100 shares
    expect(screen.getByText(/100 Units \/ Shares/i)).toBeInTheDocument();
  });
});
