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
    expect(screen.getAllByText(/Total Interest Saved/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Tenure Shortened/i)).toBeInTheDocument();
    expect(screen.getByText(/Break-Even Surplus/i)).toBeInTheDocument();
    expect(screen.getByText(/Effective Tax-Free Yield/i)).toBeInTheDocument();

    // Verify privacy badge & market rate freshness signal
    expect(screen.getByText(/Zero-Knowledge/i)).toBeInTheDocument();
    expect(screen.getByText(/Updated for October 2026 RBI Policy/i)).toBeInTheDocument();

    // Verify rate presets exist
    expect(screen.getByText("8.15% (SBI EBLR)")).toBeInTheDocument();
    expect(screen.getByText("8.55% (SBI MaxGain)")).toBeInTheDocument();

    // Verify presets exist
    expect(screen.getByText("₹30 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹50 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹75 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹1 Crore")).toBeInTheDocument();

    // Verify bank spread chips
    expect(screen.getByText("SBI MaxGain (+0.40%)")).toBeInTheDocument();
    expect(screen.getByText("Bank of Baroda (+0.25%)")).toBeInTheDocument();

    // Verify export & MOAT action triggers
    expect(screen.getByText("Export Excel (.xlsx)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share Scenario/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy MaxGain Analysis Prompt/i })).toBeInTheDocument();
    expect(document.getElementById("slider-loan-amount")).toBeInTheDocument();
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

  it("updates standard rate when rate preset pill is clicked", () => {
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

    const ratePreset = screen.getByRole("button", { name: "8.15% (SBI EBLR)" });
    fireEvent.click(ratePreset);

    const inputs = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    expect(inputs[1].value).toBe("8.15");
  });

  it("renders CalcSaveButton for zero-login local persistence and triggers Excel export", () => {
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

    const saveButton = screen.getByRole("button", { name: /Save Scenario/i });
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton);
    expect(screen.getByText(/Saved!/i)).toBeInTheDocument();

    const exportBtn = screen.getByRole("button", { name: /Export Excel/i });
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);
  });
});
