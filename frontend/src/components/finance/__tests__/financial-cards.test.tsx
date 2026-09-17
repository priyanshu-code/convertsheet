import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  MortgageRatesCard,
  RetirementAccountsCard,
  AutoLoanRatesCard,
  InflationHedgeCard,
  SavingsRatesCard,
  DebtConsolidationCard,
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

      // Advertising disclosure rendered via AFFILIATE_DISCLOSURE
      expect(screen.getByText(/Advertising & Affiliate Disclosure/i)).toBeInTheDocument();

      const link = screen.getAllByRole("link", { name: /Check Rates/i })[0];
      expect(link).toHaveAttribute("href", "https://www.bankrate.com/mortgages/mortgage-rates/");
    });

    it("decorates outbound link with affiliate tracking when enabled", () => {
      const originalEnv = process.env.NEXT_PUBLIC_AFFILIATE_ENABLED;
      process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "true";

      render(<MortgageRatesCard loanAmount={450000} />);
      const link = screen.getAllByRole("link", { name: /Check Rates/i })[0];
      const href = link.getAttribute("href") || "";
      const url = new URL(href);

      expect(url.searchParams.get("utm_source")).toBe("convertsheet");
      expect(url.searchParams.get("utm_campaign")).toBe("mortgage");
      expect(url.searchParams.get("loanAmount")).toBe("450000");

      process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = originalEnv;
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

      // Affiliate disclosure rendered via AFFILIATE_DISCLOSURE
      expect(screen.getByText(/Advertising & Affiliate Disclosure/i)).toBeInTheDocument();

      const links = screen.getAllByRole("link", { name: /Compare/i });
      expect(links.length).toBe(3);
      expect(links[0]).toHaveAttribute("href", "https://www.nerdwallet.com/best/banking/high-yield-online-savings-accounts");
    });

    it("decorates outbound links with affiliate tracking when enabled", () => {
      const originalEnv = process.env.NEXT_PUBLIC_AFFILIATE_ENABLED;
      process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "true";

      render(<RetirementAccountsCard monthlySavings={800} />);
      const links = screen.getAllByRole("link", { name: /Compare/i });
      const href = links[0].getAttribute("href") || "";
      const url = new URL(href);

      expect(url.searchParams.get("utm_source")).toBe("convertsheet");
      expect(url.searchParams.get("utm_campaign")).toBe("savings");
      expect(url.searchParams.get("monthlySavings")).toBe("800");

      process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = originalEnv;
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

      // Disclosure rendered via AFFILIATE_DISCLOSURE
      expect(screen.getByText(/Advertising & Affiliate Disclosure/i)).toBeInTheDocument();

      const link = screen.getByRole("link", { name: /Compare Auto Lenders/i });
      expect(link).toHaveAttribute("href", "https://www.bankrate.com/loans/auto-loans/rates/");
    });

    it("decorates outbound link with affiliate tracking when enabled", () => {
      const originalEnv = process.env.NEXT_PUBLIC_AFFILIATE_ENABLED;
      process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "true";

      render(<AutoLoanRatesCard financedAmount={30000} loanTermMonths={72} />);
      const link = screen.getByRole("link", { name: /Compare Auto Lenders/i });
      const href = link.getAttribute("href") || "";
      const url = new URL(href);

      expect(url.searchParams.get("utm_source")).toBe("convertsheet");
      expect(url.searchParams.get("utm_campaign")).toBe("auto_loan");
      expect(url.searchParams.get("loanAmount")).toBe("30000");
      expect(url.searchParams.get("term")).toBe("72");

      process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = originalEnv;
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

  describe("SavingsRatesCard", () => {
    it("renders US & EU benchmark savings yields and annual interest calculations", () => {
      render(<SavingsRatesCard depositAmount={25000} />);

      expect(screen.getByText(/Current High-Yield Savings & CD Benchmarks/i)).toBeInTheDocument();
      expect(screen.getByText(/US & EU Benchmark Yields/i)).toBeInTheDocument();
      expect(screen.getByText(/High-Yield Savings \(HYSA\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Certificate of Deposit \(CD\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Traditional Brick & Mortar/i)).toBeInTheDocument();

      // Interest calculations check
      expect(screen.getByText(/\$1,150\/yr/i)).toBeInTheDocument();
      expect(screen.getByText(/Advertising & Affiliate Disclosure/i)).toBeInTheDocument();
    });
  });

  describe("DebtConsolidationCard", () => {
    it("renders US & EU debt consolidation benchmarks and interest savings", () => {
      render(<DebtConsolidationCard totalDebt={15000} />);

      expect(screen.getByText(/Debt Consolidation & Rate Refinance Options/i)).toBeInTheDocument();
      expect(screen.getByText(/US & EU Refinance & Payoff Benchmarks/i)).toBeInTheDocument();
      expect(screen.getByText(/Balance Transfer Card \(0% Promo\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Fixed Debt Consolidation Loan/i)).toBeInTheDocument();
      expect(screen.getByText(/Unconsolidated Credit Card Average/i)).toBeInTheDocument();
      expect(screen.getByText(/Advertising & Affiliate Disclosure/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Potential Savings:/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
