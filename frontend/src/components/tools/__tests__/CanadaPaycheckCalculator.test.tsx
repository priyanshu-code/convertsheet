import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CanadaPaycheckCalculator } from "../CanadaPaycheckCalculator";

describe("CanadaPaycheckCalculator", () => {
  it("renders with initial values and calculated net pay across CRA tiers", () => {
    render(
      <CanadaPaycheckCalculator
        initialValues={{
          grossSalary: 85000,
          province: "ON",
          rrspContributionPercent: 0,
        }}
      />
    );

    expect(screen.getByText("Canada Paycheck & Salary Take-Home Calculator (CRA)")).toBeInTheDocument();
    expect(screen.getByText(/Canadian Take-Home Pay Summary/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Net Bi-Weekly Take-Home/i).length).toBeGreaterThanOrEqual(1);

    // Verify privacy badge and freshness signal
    expect(screen.getByText(/100% Client-Side • Zero Server Storage/i)).toBeInTheDocument();
    expect(screen.getByText(/Updated for 2026 CRA Tax Rules/i)).toBeInTheDocument();

    // Verify accessible RRSP slider
    expect(screen.getByLabelText("RRSP Contribution Slider")).toBeInTheDocument();

    // Verify retention action buttons
    expect(screen.getByRole("button", { name: /Save Scenario/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share Calculation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy Prompt for ChatGPT/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Export/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("updates take-home when switching province to BC", () => {
    render(
      <CanadaPaycheckCalculator
        initialValues={{
          grossSalary: 100000,
          province: "ON",
          rrspContributionPercent: 0,
        }}
      />
    );

    const provinceSelect = screen.getByLabelText(/Province \/ Territory/i);
    fireEvent.change(provinceSelect, { target: { value: "BC" } });

    expect(screen.getByText(/BC provincial income tax/i)).toBeInTheDocument();
  });

  it("renders mobile sticky summary bar with bi-weekly pay", () => {
    render(
      <CanadaPaycheckCalculator
        initialValues={{
          grossSalary: 90000,
          province: "AB",
          rrspContributionPercent: 5,
        }}
      />
    );

    expect(screen.getAllByText("Bi-Weekly Pay").length).toBeGreaterThanOrEqual(1);
  });
});
