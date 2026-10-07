import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HomeCalculatorSpotlight } from "../HomeCalculatorSpotlight";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("HomeCalculatorSpotlight", () => {
  it("renders calculator switcher tabs and toggles between calculators", () => {
    render(
      <CurrencyProvider>
        <HomeCalculatorSpotlight />
      </CurrencyProvider>
    );

    // Verify tabs
    expect(screen.getByRole("tab", { name: /Home Loan Balance Transfer/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Repo Rate Hike EMI/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Standard Loan EMI/i })).toBeInTheDocument();

    // Default is Balance Transfer
    expect(screen.getByText("Home Loan Balance Transfer Savings Calculator")).toBeInTheDocument();

    // Click Rate Hike tab
    const rateHikeTab = screen.getByRole("tab", { name: /Repo Rate Hike EMI/i });
    fireEvent.click(rateHikeTab);
    expect(screen.getByText("Interest Rate Hike EMI Calculator")).toBeInTheDocument();

    // Click Standard EMI tab
    const emiTab = screen.getByRole("tab", { name: /Standard Loan EMI/i });
    fireEvent.click(emiTab);
    expect(screen.getByText("Loan EMI Calculator")).toBeInTheDocument();
  });
});
