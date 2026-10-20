import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnnualToHourlyCalculator } from "../AnnualToHourlyCalculator";

describe("AnnualToHourlyCalculator", () => {
  it("renders with initial values and calculated hourly/monthly pay", () => {
    render(
      <AnnualToHourlyCalculator
        initialValues={{
          annualSalary: 100000,
          hoursPerWeek: 40,
          weeksPerYear: 52,
          unpaidLeaveDays: 0,
        }}
      />
    );

    expect(screen.getByText("Annual Compensation & Work Schedule")).toBeInTheDocument();
    expect(screen.getAllByText(/48.08/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("$8,333").length).toBeGreaterThanOrEqual(1);

    // Verify privacy badge and freshness signal
    expect(screen.getByText(/100% Client-Side • Zero Server Storage/i)).toBeInTheDocument();
    expect(screen.getByText(/Updated for 2026 Labor Benchmarks/i)).toBeInTheDocument();

    // Verify accessible sliders
    expect(screen.getByLabelText("Annual Salary Slider")).toBeInTheDocument();
    expect(screen.getByLabelText("Hours Per Week Slider")).toBeInTheDocument();
    expect(screen.getByLabelText("Weeks Worked Per Year Slider")).toBeInTheDocument();

    // Verify retention action buttons
    expect(screen.getByRole("button", { name: /Save Scenario/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share Calculation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy Prompt for ChatGPT/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Export/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("updates calculation when clicking quick salary preset", () => {
    render(
      <AnnualToHourlyCalculator
        initialValues={{
          annualSalary: 60000,
          hoursPerWeek: 40,
          weeksPerYear: 52,
          unpaidLeaveDays: 0,
        }}
      />
    );

    const btn125 = screen.getByRole("button", { name: "$125k" });
    fireEvent.click(btn125);

    // $125,000 / 2080 hrs = $60.10/hr
    expect(screen.getAllByText(/60.10/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders mobile sticky bottom summary bar", () => {
    render(
      <AnnualToHourlyCalculator
        initialValues={{
          annualSalary: 80000,
          hoursPerWeek: 40,
          weeksPerYear: 52,
          unpaidLeaveDays: 0,
        }}
      />
    );

    expect(screen.getAllByText("Hourly Wage").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/38.46/i).length).toBeGreaterThanOrEqual(1);
  });
});
