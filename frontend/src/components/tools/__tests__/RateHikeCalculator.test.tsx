import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RateHikeCalculator } from "../RateHikeCalculator";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("RateHikeCalculator", () => {
  it("renders benchmark matrix matching user specifications", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <RateHikeCalculator
          initialValues={{
            loanAmount: 5000000,
            oldRate: 8.50,
            newRate: 8.75,
            tenureYears: 20,
          }}
        />
      </CurrencyProvider>
    );

    expect(screen.getByText("Interest Rate Hike EMI Calculator")).toBeInTheDocument();
    expect(screen.getByText("Loan Amount Hike Comparison Matrix")).toBeInTheDocument();

    // Verify row brackets exist
    expect(screen.getByText("₹30 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹50 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹75 Lakh")).toBeInTheDocument();
    expect(screen.getByText("₹1 Crore")).toBeInTheDocument();

    // Verify benchmark values for 50L
    expect(screen.getAllByText(/43,391/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/44,186/i).length).toBeGreaterThanOrEqual(1);

    // Verify Silent Tenure Trap section exists
    expect(screen.getByText("The Silent Tenure Trap: Increase EMI or Extend Tenure?")).toBeInTheDocument();
    expect(screen.getByText("Option A: Increase Monthly EMI (Recommended)")).toBeInTheDocument();
    expect(screen.getByText("Option B: Silent Tenure Extension")).toBeInTheDocument();
  });

  it("applies quick delta preset pills dynamically", () => {
    render(
      <CurrencyProvider>
        <RateHikeCalculator
          initialValues={{
            loanAmount: 5000000,
            oldRate: 8.50,
            newRate: 8.75,
            tenureYears: 20,
          }}
        />
      </CurrencyProvider>
    );

    const fiftyBpsBtn = screen.getByRole("button", { name: "+50 bps (+0.50%)" });
    fireEvent.click(fiftyBpsBtn);

    // Delta should update to +50 bps
    expect(screen.getByText("Current Delta: +50 bps (+0.5%)")).toBeInTheDocument();
  });
});
