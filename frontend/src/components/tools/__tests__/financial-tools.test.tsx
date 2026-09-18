import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SipCalculator } from "../SipCalculator";
import { EmiCalculator } from "../EmiCalculator";
import { CompoundInterestCalculator } from "../CompoundInterestCalculator";
import { GstCalculator } from "../GstCalculator";
import { PercentageCalculator } from "../PercentageCalculator";
import { DiscountCalculator } from "../DiscountCalculator";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("Financial Calculators Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("SipCalculator computes maturity value, invested amount, and wealth gained", () => {
    // Render within CurrencyProvider with India market selected via localStorage
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <SipCalculator />
      </CurrencyProvider>
    );
    expect(screen.getByText(/SIP Calculator/i)).toBeInTheDocument();

    const monthlyInput = screen.getByLabelText(/Monthly Investment/i);
    fireEvent.change(monthlyInput, { target: { value: "10000" } });

    // With 10,000 for 10 years at 12%, invested capital = ₹12,00,000 in IN locale
    expect(screen.getByText("₹12,00,000")).toBeInTheDocument();
  });

  it("EmiCalculator computes loan installment and total interest", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <EmiCalculator />
      </CurrencyProvider>
    );
    expect(screen.getByText(/Loan EMI Calculator/i)).toBeInTheDocument();

    const loanInput = screen.getByLabelText(/Total Loan Principal/i);
    fireEvent.change(loanInput, { target: { value: "500000" } });
    expect(screen.getByText("₹5,00,000")).toBeInTheDocument();
  });

  it("CompoundInterestCalculator computes compounding returns", () => {
    render(<CompoundInterestCalculator />);
    expect(screen.getByText(/Compound Interest Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Compounding Projections/i)).toBeInTheDocument();
  });

  it("GstCalculator computes tax amounts in exclusive and inclusive modes", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <GstCalculator />
      </CurrencyProvider>
    );
    expect(screen.getByText("GST Calculator")).toBeInTheDocument();

    // In 18% mode on 10,000 base, total is 11,800 and GST is 1,800
    expect(screen.getByText("₹11,800")).toBeInTheDocument();
    expect(screen.getByText("₹1,800")).toBeInTheDocument();
  });

  it("PercentageCalculator computes all 3 percentage problem types", () => {
    render(<PercentageCalculator />);
    expect(screen.getByText("Percentage Calculator")).toBeInTheDocument();

    // Mode 1: 15% of 200 = 30
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("DiscountCalculator computes single and stacked discounts", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <DiscountCalculator />
      </CurrencyProvider>
    );
    expect(screen.getByText(/Discount & Sale Price Calculator/i)).toBeInTheDocument();

    // 20% off on 2,000 = final 1,600 and savings 400
    expect(screen.getByText("₹1,600")).toBeInTheDocument();
    expect(screen.getByText("₹400")).toBeInTheDocument();
  });

  it("Dynamic currency switching updates symbols when market changes", () => {
    localStorage.setItem("convertsheet-target-market", "US");
    render(
      <CurrencyProvider>
        <DiscountCalculator />
      </CurrencyProvider>
    );

    // In US mode, 20% off on $2,000 = final $1,600
    expect(screen.getByText("$1,600")).toBeInTheDocument();
    expect(screen.getByText("$400")).toBeInTheDocument();
  });
});
