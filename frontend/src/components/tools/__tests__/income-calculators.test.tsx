import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HourlyToSalaryCalculator } from "../HourlyToSalaryCalculator";
import { AnnualToHourlyCalculator } from "../AnnualToHourlyCalculator";

describe("Income & Salary Calculators UI", () => {
  it("renders HourlyToSalaryCalculator with initial values and intervals", () => {
    render(
      <HourlyToSalaryCalculator
        initialValues={{
          hourlyRate: 25,
          hoursPerWeek: 40,
          weeksPerYear: 52,
        }}
      />
    );

    expect(screen.getByText("Hourly Wage & Hours Worked")).toBeInTheDocument();
    expect(screen.getByText("$52,000")).toBeInTheDocument();
    expect(screen.getByText("$4,333")).toBeInTheDocument();
    expect(screen.getByText("$2,000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export to Excel/i })).toBeInTheDocument();
  });

  it("renders AnnualToHourlyCalculator with initial values and calculated hourly rate", () => {
    render(
      <AnnualToHourlyCalculator
        initialValues={{
          annualSalary: 100000,
          hoursPerWeek: 40,
          weeksPerYear: 52,
        }}
      />
    );

    expect(screen.getByText("Annual Compensation & Work Schedule")).toBeInTheDocument();
    expect(screen.getByText(/48.08/i)).toBeInTheDocument();
    expect(screen.getByText("$8,333")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export to Excel/i })).toBeInTheDocument();
  });
});
