import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HomeLoanOverdraftCalculator } from "../HomeLoanOverdraftCalculator";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("HomeLoanOverdraftCalculator", () => {
  it("renders overdraft inputs, verdict metrics, and bank spread presets", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <HomeLoanOverdraftCalculator
          initialValues={{
            loanAmount: 5000000,
            standardRate: 8.50,
            overdraftRate: 8.90,
            tenureYears: 20,
            parkedSurplusAmount: 1000000,
          }}
        />
      </CurrencyProvider>
    );

    expect(screen.getByText("Home Loan Overdraft (SBI MaxGain) Calculator")).toBeInTheDocument();
    expect(screen.getByText(/Total Interest Saved/i)).toBeInTheDocument();
    expect(screen.getByText(/Tenure Shortened/i)).toBeInTheDocument();
    expect(screen.getByText(/Break-Even Surplus/i)).toBeInTheDocument();
    expect(screen.getByText(/Effective Tax-Free Yield/i)).toBeInTheDocument();

    // Verify presets exist
    expect(screen.getByText("₹30 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹50 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹75 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹1 Crore")).toBeInTheDocument();

    // Verify bank spread chips
    expect(screen.getByText("SBI MaxGain (+0.40%)")).toBeInTheDocument();
    expect(screen.getByText("Bank of Baroda (+0.25%)")).toBeInTheDocument();

    // Verify export triggers
    expect(screen.getByText("Export Excel (.xlsx)")).toBeInTheDocument();
  });

  it("updates loan amount when loan preset pill is clicked", () => {
    render(
      <CurrencyProvider>
        <HomeLoanOverdraftCalculator
          initialValues={{
            loanAmount: 5000000,
            standardRate: 8.50,
            overdraftRate: 8.90,
            tenureYears: 20,
            parkedSurplusAmount: 1000000,
          }}
        />
      </CurrencyProvider>
    );

    const preset1Cr = screen.getByRole("button", { name: "₹1 Crore" });
    fireEvent.click(preset1Cr);

    const inputs = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    expect(inputs[0].value).toBe("10000000");
  });
});
