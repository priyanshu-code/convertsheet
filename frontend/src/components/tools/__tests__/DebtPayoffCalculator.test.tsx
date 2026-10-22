import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DebtPayoffCalculator } from "../DebtPayoffCalculator";

describe("DebtPayoffCalculator Moat & Mobile UX", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/tools/debt-payoff-calculator");
  });

  it("renders with Zero-Knowledge privacy badge, freshness signals, strategy selector, and computes payoff schedule", () => {
    render(<DebtPayoffCalculator />);

    expect(
      screen.getByText(/Zero-Knowledge Client-Side Engine • No financial data sent to servers • 100% Private & Free/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Updated for October 2026: Avg Credit Card APR/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Debt Elimination Summary")).toBeInTheDocument();
    expect(screen.getAllByText("Export Excel").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Debt-Free In/i).length).toBeGreaterThan(0);
  });

  it("synchronizes strategy and accelerator parameter updates to URL query permalinks", () => {
    render(<DebtPayoffCalculator initialValues={{ extraMonthlyPayment: 250, strategy: "snowball" }} />);

    expect(window.location.search).toContain("strategy=snowball");
    expect(window.location.search).toContain("extraPayment=250");
  });

  it("supports switching strategies, quick APR presets, and accelerator buttons with 44px touch targets", () => {
    render(<DebtPayoffCalculator />);

    const avalancheBtn = screen.getByText(/Debt Avalanche/i);
    const snowballBtn = screen.getByText(/Debt Snowball/i);
    expect(avalancheBtn).toHaveClass("min-h-[44px]");
    expect(snowballBtn).toHaveClass("min-h-[44px]");

    fireEvent.click(snowballBtn);
    expect(window.location.search).toContain("strategy=snowball");

    // Quick APR chips
    const aprChips = screen.getAllByText("28.99%");
    expect(aprChips[0]).toHaveClass("min-h-[44px]");
    fireEvent.click(aprChips[0]);

    const boost500 = screen.getByText("+$500/mo");
    expect(boost500).toHaveClass("min-h-[44px]");
    fireEvent.click(boost500);
    expect(window.location.search).toContain("extraPayment=500");
  });
});
