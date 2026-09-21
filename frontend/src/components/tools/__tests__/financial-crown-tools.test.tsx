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
      expect(screen.getByRole("button", { name: /Share Auto Loan/i })).toBeInTheDocument();
    });

    it("factors trade-in credit into net financing", () => {
      render(<CarLoanCalculator />);

      const tradeInInput = screen.getByLabelText(/Trade-In Value/i);
      fireEvent.change(tradeInInput, { target: { value: "10000" } });

      expect(tradeInInput).toHaveValue(10000);
    });
  });

  describe("RetirementCalculator", () => {
    it("renders retirement nest egg calculator with dual-phase metrics and donut breakdown", () => {
      render(<RetirementCalculator />);

      expect(
        screen.getByText(/Retirement & 401\(k\) Nest Egg Calculator/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Portfolio at Retirement/i)).toBeInTheDocument();
      expect(screen.getByText(/Safe Monthly Income \(4% Rule\)/i)).toBeInTheDocument();

      expect(screen.getByText(/Export to Excel/i)).toBeInTheDocument();
      expect(screen.getByText(/Ask AI to Analyze Plan/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Share Plan/i })).toBeInTheDocument();

      // Donut breakdown & results summary
      expect(screen.getByText(/from Compounding/i)).toBeInTheDocument();
      expect(screen.getAllByText("Personal Principal").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Compound Growth").length).toBeGreaterThanOrEqual(1);
    });

    it("allows adjusting monthly contribution and employer match via modern numeric inputs", () => {
      render(<RetirementCalculator />);

      const contribInput = screen.getByLabelText("Monthly Contribution numeric input");
      fireEvent.change(contribInput, { target: { value: "1500" } });
      expect(contribInput).toHaveValue(1500);

      const matchInput = screen.getByLabelText("Employer Match numeric input");
      fireEvent.change(matchInput, { target: { value: "100" } });
      expect(matchInput).toHaveValue(100);
    });

    it("toggles seamlessly between Interactive Playground and 3-Step Guided Journey", () => {
      render(<RetirementCalculator />);

      // Switch to Guided Journey
      const wizardToggle = screen.getByRole("button", { name: /3-Step Guided Journey/i });
      fireEvent.click(wizardToggle);

      expect(screen.getByText(/Step 1 of 3: Your Timeline/i)).toBeInTheDocument();

      // Switch back to Playground
      const playgroundToggle = screen.getByRole("button", { name: /Interactive Playground/i });
      fireEvent.click(playgroundToggle);

      expect(screen.getByText(/Retirement & 401\(k\) Nest Egg Calculator/i)).toBeInTheDocument();
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

  describe("DebtPayoffCalculator", () => {
    it("renders debt payoff calculator with strategy selector and debt cards", async () => {
      const { DebtPayoffCalculator } = await import("../DebtPayoffCalculator");
      render(<DebtPayoffCalculator />);

      expect(screen.getByText(/Payoff Acceleration Strategy:/i)).toBeInTheDocument();
      expect(screen.getByText(/Debt Avalanche \(Save Most Interest\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Debt Snowball \(Quick Wins\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Debt Elimination Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Export Payoff Amortization/i)).toBeInTheDocument();
    });

    it("allows switching strategies between Avalanche and Snowball", async () => {
      const { DebtPayoffCalculator } = await import("../DebtPayoffCalculator");
      render(<DebtPayoffCalculator />);

      const snowballBtn = screen.getByText(/Debt Snowball \(Quick Wins\)/i);
      fireEvent.click(snowballBtn);

      expect(screen.getByText(/Debt Elimination Summary/i)).toBeInTheDocument();
    });

    it("renders single extra monthly accelerator slider and breakdown metrics without duplicate inputs", async () => {
      const { DebtPayoffCalculator } = await import("../DebtPayoffCalculator");
      render(<DebtPayoffCalculator />);

      // Exactly one accelerator slider input
      expect(screen.getByLabelText(/Extra Monthly Accelerator numeric input/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Extra Monthly Accelerator Payment/i)).not.toBeInTheDocument();

      // Breakdown metrics display clearly
      expect(screen.getByText("Total Starting Debt")).toBeInTheDocument();
      expect(screen.getByText("Monthly Commitment")).toBeInTheDocument();
      expect(screen.getByText("Total Interest Paid")).toBeInTheDocument();
      expect(screen.getByText("Total Cumulative Payments")).toBeInTheDocument();
    });
  });

  describe("SavingsCdCalculator", () => {
    it("renders savings & CD calculator with toggle and compound projection", async () => {
      const { SavingsCdCalculator } = await import("../SavingsCdCalculator");
      render(<SavingsCdCalculator />);

      expect(screen.getByText(/Account Structure:/i)).toBeInTheDocument();
      expect(screen.getByText(/High-Yield Savings \(Liquid \+ Ongoing Deposits\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Certificate of Deposit \(Fixed Rate \+ Lockup\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Projected Compound Growth/i)).toBeInTheDocument();
      expect(screen.getByText(/Export Schedule to Excel/i)).toBeInTheDocument();
    });

    it("allows switching between HYSA and CD mode and shows detailed breakdown metrics", async () => {
      const { SavingsCdCalculator } = await import("../SavingsCdCalculator");
      render(<SavingsCdCalculator />);

      // HYSA metrics
      expect(screen.getAllByText("Initial Deposit").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Total Additional Contributions")).toBeInTheDocument();
      expect(screen.getByText("Total Principal Invested")).toBeInTheDocument();

      const cdBtn = screen.getByText(/Certificate of Deposit \(Fixed Rate \+ Lockup\)/i);
      fireEvent.click(cdBtn);

      expect(screen.getByText(/CD Early Withdrawal Penalty Rule/i)).toBeInTheDocument();
      expect(screen.getByText("Early Withdrawal Penalty")).toBeInTheDocument();
      expect(screen.getByText("Net Balance If Broken Early")).toBeInTheDocument();
    });
  });
});
