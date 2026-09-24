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
    expect(screen.getByText(/Estimated Net Take-Home Pay/i)).toBeInTheDocument();
    expect(screen.getByText(/Single Filer • US Fed \+ FICA/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /35h \(35h Workweek\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export to Excel/i })).toBeInTheDocument();
  });

  it("updates calculation when clicking 35h workweek quick preset", () => {
    const { fireEvent } = require("@testing-library/react");
    render(
      <HourlyToSalaryCalculator
        initialValues={{
          hourlyRate: 20,
          hoursPerWeek: 40,
          weeksPerYear: 52,
        }}
      />
    );

    const btn35 = screen.getByRole("button", { name: /35h \(35h Workweek\)/i });
    fireEvent.click(btn35);

    // 20 * 35 * 52 = 36,400
    expect(screen.getByText("$36,400")).toBeInTheDocument();
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
