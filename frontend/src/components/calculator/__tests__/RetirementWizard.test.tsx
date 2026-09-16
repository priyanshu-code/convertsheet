import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RetirementWizard } from "../RetirementWizard";

describe("RetirementWizard", () => {
  const mockValues = {
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    employerMatchPercent: 50,
    annualReturn: 8,
    inflationRate: 2.5,
    postRetirementAnnualSpend: 60000,
  };

  it("renders Step 1 Timeline initially", () => {
    render(
      <RetirementWizard
        values={mockValues}
        onChange={vi.fn()}
        onFinish={vi.fn()}
      />
    );
    expect(screen.getByText(/Step 1 of 3: Your Timeline/i)).toBeInTheDocument();
    expect(screen.getByText("Current Age")).toBeInTheDocument();
    expect(screen.getByText("Target Retirement Age")).toBeInTheDocument();
    expect(screen.getByText(/35 working years to compound/i)).toBeInTheDocument();
  });

  it("navigates forward through Step 2 and Step 3 and calls onFinish", () => {
    const onFinish = vi.fn();
    render(
      <RetirementWizard
        values={mockValues}
        onChange={vi.fn()}
        onFinish={onFinish}
      />
    );

    // Click Next to Step 2
    const nextBtn1 = screen.getByRole("button", { name: /Next: Savings Foundation/i });
    fireEvent.click(nextBtn1);
    expect(screen.getByText(/Step 2 of 3: Financial Foundation/i)).toBeInTheDocument();
    expect(screen.getByText("Current Retirement Savings")).toBeInTheDocument();

    // Click Next to Step 3
    const nextBtn2 = screen.getByRole("button", { name: /Next: Lifestyle & Outlook/i });
    fireEvent.click(nextBtn2);
    expect(screen.getByText(/Step 3 of 3: Lifestyle & Market Outlook/i)).toBeInTheDocument();
    expect(screen.getByText("Desired Annual Spending in Retirement")).toBeInTheDocument();

    // Finish button
    const finishBtn = screen.getByRole("button", { name: /Finish & View Full Plan/i });
    fireEvent.click(finishBtn);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("supports Back button navigation", () => {
    render(
      <RetirementWizard
        values={mockValues}
        onChange={vi.fn()}
        onFinish={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Next: Savings Foundation/i }));
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
  });

  it("calls onChange when an input value is adjusted", () => {
    const onChange = vi.fn();
    render(
      <RetirementWizard
        values={mockValues}
        onChange={onChange}
        onFinish={vi.fn()}
      />
    );

    const currentAgeInput = screen.getByLabelText("Current Age numeric input");
    fireEvent.change(currentAgeInput, { target: { value: "32" } });
    expect(onChange).toHaveBeenCalledWith("currentAge", 32);
  });
});
