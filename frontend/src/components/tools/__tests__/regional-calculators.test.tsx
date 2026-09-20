import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UkSalaryCalculator } from "../UkSalaryCalculator";

describe("UkSalaryCalculator UI Component", () => {
  it("renders UK Salary Calculator with £ symbol and 2024/25 HMRC metadata", () => {
    render(<UkSalaryCalculator initialValues={{ grossSalary: 45000, pensionPercent: 5 }} />);

    expect(
      screen.getByText(/UK Salary & Take-Home Pay Calculator/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/2024\/25 HMRC/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("£")).toBeInTheDocument();
    expect(screen.getByLabelText(/Gross Annual Salary/i)).toHaveValue(45000);
    expect(screen.getByText(/Net Monthly Take-Home/i)).toBeInTheDocument();
  });

  it("calculates take-home pay for £45,000 salary with 5% pension", () => {
    render(
      <UkSalaryCalculator
        initialValues={{
          grossSalary: 45000,
          pensionPercent: 5,
          studentLoanPlan: "none",
        }}
      />
    );

    // £45k with 5% pension (£2,250):
    // netAfterPension = £42,750
    // PA = £12,570 -> Taxable = £30,180
    // Income Tax = 20% on £30,180 = £6,036
    // NI = 8% on (£45,000 - £12,570 = £32,430) = £2,594.40
    // Total deductions = 6036 + 2594.40 + 2250 = 10,880.40
    // Take-home annual = £34,119.60 -> monthly = £2,843.30
    expect(screen.getByText("£2,843.30")).toBeInTheDocument();
    expect(screen.getByText("£34,119.60")).toBeInTheDocument();
    expect(screen.getByText("£6,036.00")).toBeInTheDocument();
    expect(screen.getByText("£2,594.40")).toBeInTheDocument();
  });

  it("updates output when pension or student loan plan changes", () => {
    render(
      <UkSalaryCalculator
        initialValues={{
          grossSalary: 45000,
          pensionPercent: 5,
          studentLoanPlan: "none",
        }}
      />
    );

    expect(screen.getByText("£2,843.30")).toBeInTheDocument();

    // Change student loan plan to Plan 2 (threshold £27,295, 9% on £17,705 = £1,593.45/yr)
    const select = screen.getByLabelText(/Student Loan Plan/i);
    fireEvent.change(select, { target: { value: "plan2" } });

    // With £1,593.45 student loan repayment, net take home reduces:
    // Annual take home = 34,119.60 - 1593.45 = 32,526.15 -> monthly = £2,710.51
    expect(screen.getByText("£2,710.51")).toBeInTheDocument();
    expect(screen.getByText("£1,593.45")).toBeInTheDocument();
  });

  it("renders country cross-link navigation hub", () => {
    render(<UkSalaryCalculator />);

    expect(screen.getByRole("link", { name: /US Paycheck/i })).toHaveAttribute(
      "href",
      "/tools/salary-calculator"
    );
    expect(screen.getByRole("link", { name: /Canada Paycheck/i })).toHaveAttribute(
      "href",
      "/tools/canada-paycheck-calculator"
    );
    expect(screen.getByRole("link", { name: /Australia Pay/i })).toHaveAttribute(
      "href",
      "/tools/australia-pay-calculator"
    );
  });
});
