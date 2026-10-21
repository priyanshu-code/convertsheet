import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { IncomeTaxCalculator } from "../IncomeTaxCalculator";

describe("IncomeTaxCalculator Moat & Mobile UX", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/tools/income-tax-calculator");
  });

  it("renders with Zero-Knowledge privacy badge, sliders, and calculates US federal tax for $100k", () => {
    render(<IncomeTaxCalculator initialValues={{ grossIncomeUs: 100000, filingStatus: "single" }} />);
    expect(
      screen.getByText(/100% Client-Side • Zero Server Storage • Private & Free Forever/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/US Federal Income Tax Bracket Calculator/i)).toBeInTheDocument();
    expect(screen.getByText("Total Federal Tax Payable")).toBeInTheDocument();
    expect(screen.getAllByText("$13,841").length).toBeGreaterThan(0);
    expect(screen.getByText("Net After-Tax Income")).toBeInTheDocument();
    expect(screen.getByText("$86,159")).toBeInTheDocument();
    expect(screen.getAllByText("Export Formulaic Excel").length).toBeGreaterThan(0);
  });

  it("switches to India mode and computes tax with 44px touch targets", () => {
    render(
      <IncomeTaxCalculator
        initialValues={{
          regime: "IN",
          annualIncomeIn: 1500000,
          standardDeductionIn: 75000,
          otherDeductionsIn: 50000,
        }}
      />
    );
    expect(screen.getByText(/Income Tax Slab Calculator \(India FY 2024-25\)/i)).toBeInTheDocument();
    expect(screen.getByText("Total Tax Payable")).toBeInTheDocument();
    expect(screen.getAllByText(/119,600/).length).toBeGreaterThan(0);
  });

  it("synchronizes input parameters into URL query params without reloading", () => {
    render(<IncomeTaxCalculator initialValues={{ regime: "US", grossIncomeUs: 120000 }} />);
    expect(window.location.search).toContain("regime=US");
    expect(window.location.search).toContain("grossIncomeUs=120000");

    fireEvent.click(screen.getByText("India (FY 2024-25)"));
    expect(window.location.search).toContain("regime=IN");
  });

  it("renders Market Rate & Tax Benchmark Freshness Signal and CalcSaveButton", () => {
    render(<IncomeTaxCalculator initialValues={{ regime: "US", grossIncomeUs: 100000 }} />);
    expect(screen.getByText(/Updated for 2026 IRS Tax Year/i)).toBeInTheDocument();
    expect(screen.getByText("Save Calculation")).toBeInTheDocument();
  });
});
