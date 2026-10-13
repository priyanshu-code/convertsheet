import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SavingsCdCalculator } from "../SavingsCdCalculator";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("SavingsCdCalculator", () => {
  it("renders privacy badge, controls, and default HYSA projections", () => {
    render(
      <CurrencyProvider>
        <SavingsCdCalculator
          initialValues={{
            initialDeposit: 10000,
            monthlyContribution: 250,
            annualInterestRate: 4.5,
            termMonths: 12,
            compoundingFrequency: "daily",
          }}
        />
      </CurrencyProvider>
    );

    // Zero-knowledge privacy badge
    expect(screen.getByText(/100% Client-Side • Zero Server Storage • Private & Free Forever/i)).toBeInTheDocument();

    // Mode toggles
    expect(screen.getByText(/High-Yield Savings \(Liquid \+ Ongoing Deposits\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Certificate of Deposit \(Fixed Rate \+ Lockup\)/i)).toBeInTheDocument();

    // Results & Highlights
    expect(screen.getAllByText("Final Balance").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Total Interest Earned")).toBeInTheDocument();
    expect(screen.getByText(/Effective APY/i)).toBeInTheDocument();

    // Retention action buttons
    expect(screen.getByRole("button", { name: /Export Schedule to Excel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Scenario/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share Calculation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Analyze Yield with AI/i })).toBeInTheDocument();

    // Mobile sticky bar
    expect(screen.getAllByText("Final Balance").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("button", { name: "Export Excel" })).toBeInTheDocument();
  });

  it("switches to CD mode and reveals early withdrawal penalty rules", () => {
    render(
      <CurrencyProvider>
        <SavingsCdCalculator
          initialValues={{
            initialDeposit: 25000,
            annualInterestRate: 5.0,
            termMonths: 12,
          }}
        />
      </CurrencyProvider>
    );

    const cdButton = screen.getByText(/Certificate of Deposit \(Fixed Rate \+ Lockup\)/i);
    fireEvent.click(cdButton);

    // CD specific elements
    expect(screen.getByText(/CD Early Withdrawal Penalty Rule/i)).toBeInTheDocument();
    expect(screen.getByText("Early Withdrawal Penalty")).toBeInTheDocument();
    expect(screen.getByText("Net Balance If Broken Early")).toBeInTheDocument();

    // Sticky summary bar updates label
    expect(screen.getByText("CD Maturity Balance")).toBeInTheDocument();
  });
});
