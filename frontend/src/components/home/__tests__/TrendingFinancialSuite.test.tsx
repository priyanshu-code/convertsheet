import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrendingFinancialSuite } from "../TrendingFinancialSuite";

describe("TrendingFinancialSuite", () => {
  it("renders trending financial calculator cards with badges, links, and formulas", () => {
    render(<TrendingFinancialSuite />);

    // Section Heading
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Trending Financial & Mortgage Suite/i,
      })
    ).toBeInTheDocument();

    // Cards
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Home Loan Balance Transfer Savings/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Repo Rate Hike EMI Impact/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Standard Loan EMI & Amortization/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /SIP Wealth & Compounding/i,
      })
    ).toBeInTheDocument();

    // Links to tools
    const balanceTransferLink = screen.getByRole("link", {
      name: /Launch Balance Transfer Tool/i,
    });
    expect(balanceTransferLink).toHaveAttribute(
      "href",
      "/tools/home-loan-balance-transfer-calculator"
    );

    const rateHikeLink = screen.getByRole("link", {
      name: /Launch Rate Hike Tool/i,
    });
    expect(rateHikeLink).toHaveAttribute(
      "href",
      "/tools/interest-rate-hike-calculator"
    );

    const emiLink = screen.getByRole("link", {
      name: /Launch EMI Tool/i,
    });
    expect(emiLink).toHaveAttribute("href", "/tools/emi-calculator");

    const sipLink = screen.getByRole("link", {
      name: /Launch SIP Tool/i,
    });
    expect(sipLink).toHaveAttribute("href", "/tools/sip-calculator");
  });
});
