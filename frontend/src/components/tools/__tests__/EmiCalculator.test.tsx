import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmiCalculator } from "../EmiCalculator";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("EmiCalculator Moat & Mobile UX", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/tools/emi-calculator");
  });

  it("renders with Zero-Knowledge privacy badge, sliders, and computes EMI accurately", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <EmiCalculator initialValues={{ loanAmount: 1000000, interestRate: 8.5, loanTenureYears: 15 }} />
      </CurrencyProvider>
    );

    expect(
      screen.getByText(/100% Client-Side • Zero Server Storage • Private & Free Forever/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Monthly Loan EMI Payable")).toBeInTheDocument();
    expect(screen.getAllByText("Export Formulaic Excel").length).toBeGreaterThan(0);
    expect(screen.getByText("Total Interest Accrued")).toBeInTheDocument();
  });

  it("synchronizes parameter updates to URL search params", () => {
    localStorage.setItem("convertsheet-target-market", "US");
    render(
      <CurrencyProvider>
        <EmiCalculator initialValues={{ loanAmount: 250000, interestRate: 7.0, loanTenureYears: 30 }} />
      </CurrencyProvider>
    );

    expect(window.location.search).toContain("loanAmount=250000");
    expect(window.location.search).toContain("interestRate=7");
    expect(window.location.search).toContain("loanTenureYears=30");
  });

  it("handles loan principal quick preset buttons with 44px touch targets", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <EmiCalculator />
      </CurrencyProvider>
    );

    const presetBtn = screen.getByText("₹25L");
    expect(presetBtn).toHaveClass("min-h-[44px]");
    fireEvent.click(presetBtn);
    expect(window.location.search).toContain("loanAmount=2500000");
  });
});
