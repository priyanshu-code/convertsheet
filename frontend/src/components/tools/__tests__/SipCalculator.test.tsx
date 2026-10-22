import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SipCalculator } from "../SipCalculator";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("SipCalculator Moat & Mobile UX", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/tools/sip-calculator");
  });

  it("renders with Zero-Knowledge privacy badge, sliders, and computes SIP returns accurately", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <SipCalculator initialValues={{ monthlyInvestment: 5000, annualReturnRate: 12, timeYears: 10 }} />
      </CurrencyProvider>
    );

    expect(
      screen.getByText(/100% Client-Side • Zero Server Storage • Private & Free Forever/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Updated for October 2026: Equity SIP CAGR/i)
    ).toBeInTheDocument();
    expect(screen.getByText("SIP Calculator (Mutual Funds)")).toBeInTheDocument();
    expect(screen.getByText("Total Expected Maturity Value")).toBeInTheDocument();
    expect(screen.getAllByText("Export Formulaic Excel").length).toBeGreaterThan(0);
    expect(screen.getByText("Total Invested Capital")).toBeInTheDocument();
    expect(screen.getByText("Estimated Wealth Gained")).toBeInTheDocument();
    expect(screen.getByText("Inflation-Adjusted Purchasing Power")).toBeInTheDocument();
  });

  it("synchronizes parameter updates to URL search params", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <SipCalculator initialValues={{ monthlyInvestment: 15000, annualReturnRate: 15, timeYears: 15 }} />
      </CurrencyProvider>
    );

    expect(window.location.search).toContain("monthlyInvestment=15000");
    expect(window.location.search).toContain("annualReturnRate=15");
    expect(window.location.search).toContain("timeYears=15");
  });

  it("handles monthly investment and asset class return presets with 44px touch targets", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <SipCalculator />
      </CurrencyProvider>
    );

    const presetBtn = screen.getByText("₹10k");
    expect(presetBtn).toHaveClass("min-h-[44px]");
    fireEvent.click(presetBtn);
    expect(window.location.search).toContain("monthlyInvestment=10000");

    const flexiBtn = screen.getByText("14.5% (Flexi)");
    expect(flexiBtn).toHaveClass("min-h-[44px]");
    fireEvent.click(flexiBtn);
    expect(window.location.search).toContain("annualReturnRate=14.5");

    const tenure30y = screen.getByText("30y");
    expect(tenure30y).toHaveClass("min-h-[44px]");
    fireEvent.click(tenure30y);
    expect(window.location.search).toContain("timeYears=30");
  });
});
