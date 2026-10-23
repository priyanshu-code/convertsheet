import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HourlyToSalaryCalculator } from "../HourlyToSalaryCalculator";

describe("HourlyToSalaryCalculator Moat & Mobile UX", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/tools/hourly-to-salary-calculator");
  });

  it("renders with Zero-Knowledge privacy badge, payroll intervals, and computes gross and take-home pay", () => {
    render(<HourlyToSalaryCalculator initialValues={{ hourlyRate: 35, hoursPerWeek: 40 }} />);

    expect(
      screen.getByText(/Zero-Knowledge Client-Side Engine • No salary data sent to servers • 100% Private & Free/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Converted Salary & Paycheck Intervals")).toBeInTheDocument();
    expect(screen.getAllByText("Export Excel").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Annual Gross Salary").length).toBeGreaterThan(0);
  });

  it("synchronizes hourly rate and hours per week to URL query permalinks", () => {
    render(<HourlyToSalaryCalculator initialValues={{ hourlyRate: 45, hoursPerWeek: 35 }} />);

    expect(window.location.search).toContain("hourlyRate=45");
    expect(window.location.search).toContain("hoursPerWeek=35");
  });

  it("displays October 2026 freshness signal and handles $28/hr quick preset with 44px touch target", () => {
    render(<HourlyToSalaryCalculator />);

    expect(
      screen.getByText(/Updated for October 2026: 2026 Federal Minimum Wage \$7\.25\/hr/i)
    ).toBeInTheDocument();

    const rate28 = screen.getByText("$28/hr");
    expect(rate28).toBeInTheDocument();
    expect(rate28).toHaveClass("min-h-[44px]");

    fireEvent.click(rate28);
    expect(window.location.search).toContain("hourlyRate=28");
    expect(screen.getByText("$58,240")).toBeInTheDocument(); // 28 * 40 * 52 = 58240
  });
});
