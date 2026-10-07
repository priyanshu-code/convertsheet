import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BalanceTransferCalculator } from "../BalanceTransferCalculator";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("BalanceTransferCalculator", () => {
  it("renders balance transfer inputs, verdict card, and yearly amortization schedule", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <BalanceTransferCalculator
          initialValues={{
            currentBalance: 5000000,
            currentRate: 9.10,
            newRate: 8.35,
            remainingTenureYears: 15,
            processingFeePercent: 0.25,
            modtStampDutyPercent: 0.20,
            otherCharges: 5000,
          }}
        />
      </CurrencyProvider>
    );

    expect(screen.getByText("Home Loan Balance Transfer Savings Calculator")).toBeInTheDocument();
    expect(screen.getByText(/HIGHLY RECOMMENDED/i)).toBeInTheDocument();
    expect(screen.getByText(/Break-Even Horizon/i)).toBeInTheDocument();

    // Verify presets exist
    expect(screen.getByText("₹30 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹50 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹75 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹1 Crore")).toBeInTheDocument();

    // Verify export buttons exist
    expect(screen.getByText("Download Balance Transfer Audit (PDF)")).toBeInTheDocument();
    expect(screen.getByText("Export Excel (.xlsx)")).toBeInTheDocument();

    // Verify playbook cards
    expect(screen.getByText("1. The Internal Repricing Hack")).toBeInTheDocument();
    expect(screen.getByText("2. The 50 BPS & 5-Year Rule")).toBeInTheDocument();
  });

  it("updates balance when preset pill is clicked", () => {
    render(
      <CurrencyProvider>
        <BalanceTransferCalculator
          initialValues={{
            currentBalance: 5000000,
            currentRate: 9.10,
            newRate: 8.35,
            remainingTenureYears: 15,
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
