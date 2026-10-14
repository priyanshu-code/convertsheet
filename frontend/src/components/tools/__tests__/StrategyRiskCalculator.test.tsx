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
  it("renders position sizing and risk cards with default values", () => {
    render(<StrategyRiskCalculator />);
    expect(screen.getByText(/Quantitative Strategy Risk & Sizing Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidential Strategy Execution/i)).toBeInTheDocument();
    expect(screen.getByText(/Optimal Position Size/i)).toBeInTheDocument();
  });

  it("switches to backtest tab and renders Sharpe and Sortino ratios", () => {
    render(<StrategyRiskCalculator />);
    const backtestTab = screen.getByRole("button", { name: /2. Backtest Performance/i });
    fireEvent.click(backtestTab);

    expect(screen.getAllByText(/Sharpe Ratio/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sortino Ratio/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Max Drawdown/i).length).toBeGreaterThan(0);
  });

  it("updates position size dynamically when equity or risk percentage changes", () => {
    render(<StrategyRiskCalculator initialValues={{ accountBalance: 100000, riskPercentage: 1, entryPrice: 100, stopLossPrice: 90 }} />);
    // $100,000 * 1% = $1,000 risk. Stop is $10/share -> 100 shares
    expect(screen.getByText(/100 Units \/ Shares/i)).toBeInTheDocument();
  });
});
