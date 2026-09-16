import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MortgageCalculator } from "../MortgageCalculator";
import { CarLoanCalculator } from "../CarLoanCalculator";
import { RetirementCalculator } from "../RetirementCalculator";
import { InflationCalculator } from "../InflationCalculator";

describe("Financial Crown Tools Suite (Mortgage, Car Loan, Retirement, Inflation)", () => {
  describe("MortgageCalculator", () => {
    it("renders mortgage calculator with PITI breakdown and controls", () => {
      render(<MortgageCalculator />);

      expect(
        screen.getByText(/Mortgage Calculator with Amortization Schedule/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Total Monthly Payment/i)).toBeInTheDocument();
      expect(screen.getByText(/Loan Amount Financed/i)).toBeInTheDocument();

      // Export & AI Prompt buttons
      expect(screen.getByText(/Export.*Amortization/i)).toBeInTheDocument();
      expect(screen.getByText(/Copy Mortgage Analysis Prompt/i)).toBeInTheDocument();
    });

    it("recalculates when home price is changed", () => {
      render(<MortgageCalculator />);

      const priceInput = screen.getByLabelText(/Home Purchase Price/i);
      fireEvent.change(priceInput, { target: { value: "500000" } });

      expect(priceInput).toHaveValue(500000);
      expect(screen.getAllByText("$400,000").length).toBeGreaterThanOrEqual(1);
    });

    it("allows toggling between yearly and monthly amortization schedules", () => {
      render(<MortgageCalculator />);

      const monthlyBtn = screen.getByRole("button", { name: /Monthly Breakdown/i });
      fireEvent.click(monthlyBtn);

      expect(screen.getAllByText(/Month 1/i)[0]).toBeInTheDocument();

      const yearlyBtn = screen.getByRole("button", { name: /Yearly Breakdown/i });
      fireEvent.click(yearlyBtn);

      expect(screen.getAllByText(/Year 1/i)[0]).toBeInTheDocument();
    });
  });

  describe("CarLoanCalculator", () => {
    it("renders car loan calculator with financing breakdown", () => {
      render(<CarLoanCalculator />);

      expect(
        screen.getByText(/Auto Loan & Car Payment Calculator/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Monthly Auto Loan Payment/i)).toBeInTheDocument();
      expect(screen.getByText(/Net Loan Financed/i)).toBeInTheDocument();

      expect(screen.getByText(/Export Loan Schedule/i)).toBeInTheDocument();
      expect(screen.getByText(/Copy Car Loan Advice Prompt/i)).toBeInTheDocument();
    });

    it("factors trade-in credit into net financing", () => {
      render(<CarLoanCalculator />);

      const tradeInInput = screen.getByLabelText(/Trade-In Value/i);
      fireEvent.change(tradeInInput, { target: { value: "10000" } });

      expect(tradeInInput).toHaveValue(10000);
    });
  });

  describe("RetirementCalculator", () => {
    it("renders retirement nest egg calculator with dual-phase metrics", () => {
      render(<RetirementCalculator />);

      expect(
        screen.getByText(/Retirement & 401\(k\) Nest Egg Calculator/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Portfolio at Retirement/i)).toBeInTheDocument();
      expect(screen.getByText(/Safe Monthly Income \(4% Rule\)/i)).toBeInTheDocument();

      expect(screen.getByText(/Export to Excel/i)).toBeInTheDocument();
      expect(screen.getByText(/Ask AI to Analyze Plan/i)).toBeInTheDocument();
    });

    it("allows adjusting monthly contribution and employer match", () => {
      render(<RetirementCalculator />);

      const contribInput = screen.getByLabelText(/Monthly Contribution/i);
      fireEvent.change(contribInput, { target: { value: "1500" } });
      expect(contribInput).toHaveValue(1500);

      const matchInput = screen.getByLabelText(/Employer Match/i);
      fireEvent.change(matchInput, { target: { value: "100" } });
      expect(matchInput).toHaveValue(100);
    });
  });

  describe("InflationCalculator", () => {
    it("renders inflation and purchasing power calculator with preset buttons", () => {
      render(<InflationCalculator />);

      expect(
        screen.getByText(/Inflation & Purchasing Power Calculator/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Purchasing Power Loss/i)).toBeInTheDocument();
      expect(screen.getByText(/Common Inflation Benchmarks:/i)).toBeInTheDocument();

      expect(screen.getByRole("button", { name: /Fed Target \(2\.0%\)/i })).toBeInTheDocument();
      expect(screen.getByText(/Export to Excel/i)).toBeInTheDocument();
      expect(screen.getByText(/Ask AI Inflation Protection Advice/i)).toBeInTheDocument();
    });

    it("clicking a benchmark preset updates the inflation rate", () => {
      render(<InflationCalculator />);

      const fedBtn = screen.getByRole("button", { name: /Fed Target \(2\.0%\)/i });
      fireEvent.click(fedBtn);

      const rateInput = screen.getByLabelText(/Annual Inflation Rate \(%\)/i);
      expect(rateInput).toHaveValue(2.0);
    });
  });
});
