import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SalaryCalculator } from "../SalaryCalculator";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("SalaryCalculator", () => {
  it("renders US W-2 calculation mode with initial parameters and deductions", () => {
    render(
      <CurrencyProvider>
        <SalaryCalculator
          initialValues={{
            regime: "US",
            grossSalary: 100000,
            filingStatus: "single",
            k401ContributionPercent: 5,
            stateTaxPercent: 5,
            pretaxDeductionsMonthly: 200,
          }}
        />
      </CurrencyProvider>
    );

    expect(screen.getByText("Salary & Take-Home Paycheck Calculator (US 2026)")).toBeInTheDocument();
    expect(screen.getByText(/Paycheck & Take-Home Summary/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Net Monthly Take-Home/i).length).toBeGreaterThanOrEqual(1);

    // Verify privacy badge
    expect(screen.getByText(/100% Client-Side • Zero Server Storage/i)).toBeInTheDocument();

    // Verify accessible sliders
    expect(screen.getByLabelText("401(k) Contribution Slider")).toBeInTheDocument();
    expect(screen.getByLabelText("Estimated State Income Tax Slider")).toBeInTheDocument();

    // Verify action buttons
    expect(screen.getByRole("button", { name: /Save Scenario/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share Paycheck Plan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy Prompt for ChatGPT/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Export/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /Download Salary Dossier \(PDF\)/i })).toBeInTheDocument();
  });

  it("switches seamlessly to India CTC regime mode", () => {
    render(
      <CurrencyProvider>
        <SalaryCalculator
          initialValues={{
            regime: "IN",
            annualCtc: 1200000,
            epfPercent: 12,
            professionalTaxMonthly: 200,
          }}
        />
      </CurrencyProvider>
    );

    expect(screen.getByText("Salary & In-Hand Pay Calculator (India FY 2024-26)")).toBeInTheDocument();
    expect(screen.getByText("Monthly Take-Home Summary")).toBeInTheDocument();
    expect(screen.getByLabelText("Employee Provident Fund (EPF % of Basic) Slider")).toBeInTheDocument();
    expect(screen.getAllByText("Monthly In-Hand").length).toBeGreaterThanOrEqual(1);
  });

  it("updates salary dynamically when clicking quick salary preset", () => {
    render(
      <CurrencyProvider>
        <SalaryCalculator
          initialValues={{
            regime: "US",
            grossSalary: 100000,
            filingStatus: "single",
            k401ContributionPercent: 5,
            stateTaxPercent: 5,
            pretaxDeductionsMonthly: 200,
          }}
        />
      </CurrencyProvider>
    );

    const btn150 = screen.getByRole("button", { name: "$150k" });
    fireEvent.click(btn150);

    // Should update gross salary
    expect(screen.getByDisplayValue("150000")).toBeInTheDocument();
  });
});
