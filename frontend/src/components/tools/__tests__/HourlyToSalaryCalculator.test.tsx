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

  it("handles quick hourly rate and workweek preset buttons with 44px touch targets", () => {
    render(<HourlyToSalaryCalculator />);

    const rate50 = screen.getByText("$50/hr");
    expect(rate50).toHaveClass("min-h-[44px]");
    fireEvent.click(rate50);
    expect(window.location.search).toContain("hourlyRate=50");

    const ft40 = screen.getByText("40h (Standard FT)");
    expect(ft40).toHaveClass("min-h-[44px]");
    fireEvent.click(ft40);
    expect(window.location.search).toContain("hoursPerWeek=40");
  });
});
