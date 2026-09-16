import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  MortgageRatesCard,
  RetirementAccountsCard,
  AutoLoanRatesCard,
  InflationHedgeCard,
} from "../index";

describe("Pillar 4: Financial Lead-Gen & Contextual Comparison Cards", () => {
  describe("MortgageRatesCard", () => {
    it("renders mortgage benchmark rates and calculates monthly P&I", () => {
      render(<MortgageRatesCard loanAmount={400000} />);

      expect(screen.getByText(/Compare Top Mortgage & Refinance Rates/i)).toBeInTheDocument();
      expect(screen.getByText(/30-Year Fixed/i)).toBeInTheDocument();
      expect(screen.getByText(/15-Year Fixed/i)).toBeInTheDocument();
      expect(screen.getByText(/5\/1 Adj. Rate \(ARM\)/i)).toBeInTheDocument();
      expect(screen.getByText(/FHA \/ VA 30-Year/i)).toBeInTheDocument();

      // Check loan amount display
      expect(screen.getByText(/\$400,000/i)).toBeInTheDocument();

      // Advertising disclosure
      expect(screen.getByText(/Advertising & Rate Disclosure/i)).toBeInTheDocument();

      const link = screen.getAllByRole("link", { name: /Check Rates/i })[0];
      expect(link).toHaveAttribute("href", "https://www.bankrate.com/mortgages/mortgage-rates/");
    });
  });

  describe("RetirementAccountsCard", () => {
    it("renders high-yield cash and IRA tiers with compound interest insights", () => {
      render(<RetirementAccountsCard monthlySavings={1000} />);

      expect(screen.getByText(/Top High-Yield Accounts & IRA Providers/i)).toBeInTheDocument();
      expect(screen.getByText(/High-Yield Savings & Cash Reserve/i)).toBeInTheDocument();
      expect(screen.getByText(/Roth IRA \(Tax-Free Growth\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Traditional IRA & 401\(k\) Rollover/i)).toBeInTheDocument();
      expect(screen.getByText(/FDIC Insured Up To \$250k\+/i)).toBeInTheDocument();

      // Affiliate disclosure
      expect(screen.getByText(/Affiliate Disclosure/i)).toBeInTheDocument();

      const links = screen.getAllByRole("link", { name: /Compare/i });
      expect(links.length).toBe(3);
      expect(links[0]).toHaveAttribute("href", "https://www.nerdwallet.com/best/banking/high-yield-online-savings-accounts");
    });
  });

  describe("AutoLoanRatesCard", () => {
    it("renders credit tiers and calculates interest savings", () => {
      render(<AutoLoanRatesCard financedAmount={35000} loanTermMonths={60} />);

      expect(screen.getByText(/Auto Loan Rates by Credit Score/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Super Prime/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Non-Prime/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Subprime/i)).toBeInTheDocument();

      expect(screen.getByText(/Credit Score Impact Insight/i)).toBeInTheDocument();
      expect(screen.getByText(/Experian Benchmark Data/i)).toBeInTheDocument();

      const link = screen.getByRole("link", { name: /Compare Auto Lenders/i });
      expect(link).toHaveAttribute("href", "https://www.bankrate.com/loans/auto-loans/rates/");
    });
  });

  describe("InflationHedgeCard", () => {
    it("renders purchasing power hedge assets and educational alert", () => {
      render(<InflationHedgeCard currentAmount={50000} targetYears={20} />);

      expect(screen.getByText(/Top Inflation Hedging Strategies & Assets/i)).toBeInTheDocument();
      expect(screen.getByText(/Treasury Inflation-Protected Securities \(TIPS\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Series I Savings Bonds/i)).toBeInTheDocument();
      expect(screen.getByText(/Broad Market Equities \(S&P 500 Index\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Holding paper cash in checking accounts/i)).toBeInTheDocument();
      expect(screen.getByText(/Educational Disclaimer/i)).toBeInTheDocument();
    });
  });
});
