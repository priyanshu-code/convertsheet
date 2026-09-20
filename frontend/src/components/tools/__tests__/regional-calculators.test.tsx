import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UkSalaryCalculator } from "../UkSalaryCalculator";
import { CanadaPaycheckCalculator } from "../CanadaPaycheckCalculator";
import { AustraliaPayCalculator } from "../AustraliaPayCalculator";

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

describe("CanadaPaycheckCalculator UI Component", () => {
  it("renders Canada Paycheck Calculator with $ CAD symbol, CRA 2024 badge, and Ontario default", () => {
    render(<CanadaPaycheckCalculator />);

    expect(
      screen.getByText(/Canada Paycheck & Salary Take-Home Calculator/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/CRA 2024/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByLabelText(/Gross Annual Salary/i)).toHaveValue(85000);
    expect(screen.getByLabelText(/Province \/ Territory/i)).toHaveValue("ON");
    expect(screen.getByText(/Net Bi-Weekly Take-Home/i)).toBeInTheDocument();
  });

  it("calculates take-home pay for $85,000 salary in Ontario", () => {
    render(
      <CanadaPaycheckCalculator
        initialValues={{
          grossSalary: 85000,
          province: "ON",
          rrspContributionPercent: 0,
        }}
      />
    );

    // 85k in Ontario (2024):
    // Federal tax: $11,996.57
    // Provincial tax: $5,042.06
    // CPP/CPP2: $4,055.50
    // EI: $1,049.12
    // Total deductions: $22,143.25
    // Net Annual: $62,856.75
    // Net Bi-Weekly (26): $2,417.57
    // Net Semi-Monthly (24): $2,619.03
    expect(screen.getByText("$2,417.57")).toBeInTheDocument();
    expect(screen.getByText("$62,856.75")).toBeInTheDocument();
    expect(screen.getByText("$11,996.57")).toBeInTheDocument();
    expect(screen.getByText("$5,042.06")).toBeInTheDocument();
    expect(screen.getByText("$4,055.50")).toBeInTheDocument();
    expect(screen.getByText("$1,049.12")).toBeInTheDocument();
  });

  it("updates output when province changes (e.g. to BC or AB) and when RRSP contribution is added", () => {
    render(
      <CanadaPaycheckCalculator
        initialValues={{
          grossSalary: 85000,
          province: "ON",
          rrspContributionPercent: 0,
        }}
      />
    );

    expect(screen.getByText("$2,417.57")).toBeInTheDocument();

    // Change province to British Columbia (BC)
    const provinceSelect = screen.getByLabelText(/Province \/ Territory/i);
    fireEvent.change(provinceSelect, { target: { value: "BC" } });

    // BC provincial tax is lower ($4,642.92 vs $5,042.06 in ON), net bi-weekly is $2,432.92
    expect(screen.getByText("$2,432.92")).toBeInTheDocument();
    expect(screen.getByText("$4,642.92")).toBeInTheDocument();

    // Change province to Alberta (AB)
    fireEvent.change(provinceSelect, { target: { value: "AB" } });

    // AB provincial tax is $6,311.50, net bi-weekly is $2,368.74
    expect(screen.getByText("$2,368.74")).toBeInTheDocument();
    expect(screen.getByText("$6,311.50")).toBeInTheDocument();

    // Switch back to ON and add 10% RRSP contribution ($8,500 pre-tax deduction)
    fireEvent.change(provinceSelect, { target: { value: "ON" } });
    const rrspSlider = screen.getByLabelText(/RRSP Contribution/i);
    fireEvent.change(rrspSlider, { target: { value: "10" } });

    // With 10% RRSP ($8,500), Net Bi-Weekly is $2,187.58, RRSP deduction is $8,500.00
    expect(screen.getByText("$2,187.58")).toBeInTheDocument();
    expect(screen.getByText("$8,500.00")).toBeInTheDocument();
  });

  it("renders country cross-link navigation hub", () => {
    render(<CanadaPaycheckCalculator />);

    expect(screen.getByRole("link", { name: /US Paycheck/i })).toHaveAttribute(
      "href",
      "/tools/salary-calculator"
    );
    expect(screen.getByRole("link", { name: /UK Salary/i })).toHaveAttribute(
      "href",
      "/tools/uk-salary-calculator"
    );
    expect(screen.getByRole("link", { name: /Australia Pay/i })).toHaveAttribute(
      "href",
      "/tools/australia-pay-calculator"
    );
  });
});


describe("AustraliaPayCalculator UI Component", () => {
  it("renders Australia Pay Calculator with $ AUD symbol, ATO 2024-25 Stage 3 badge, and $90,000 default", () => {
    render(<AustraliaPayCalculator />);

    expect(
      screen.getByText(/Australia Pay & Salary Take-Home Calculator/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/ATO 2024-25 Stage 3/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByLabelText(/Gross Annual Salary/i)).toHaveValue(90000);
    expect(screen.getByText(/Net Fortnightly Take-Home/i)).toBeInTheDocument();
  });

  it("calculates take-home pay for $95,000 salary under Stage 3 tax cuts (no HELP debt, standard 11.5% super)", () => {
    render(
      <AustraliaPayCalculator
        initialValues={{
          grossSalary: 95000,
          superannuationPercent: 11.5,
          hasHelpDebt: false,
          medicareExempt: false,
        }}
      />
    );

    // Gross: $95,000
    // Income Tax: 18200-45000 @ 16% = $4,288; 45000-95000 = 50000 @ 30% = $15,000 -> Total Tax = $19,288.00
    // Medicare Levy: 2% on 95,000 = $1,900.00
    // Total deductions = $21,188.00
    // Net Annual Take Home = $73,812.00
    // Net Monthly Take Home = $6,151.00
    // Net Fortnightly Take Home = $2,838.92
    // Net Weekly Take Home = $1,419.46
    // Employer Superannuation (11.5%) = $10,925.00
    expect(screen.getByText("$2,838.92")).toBeInTheDocument();
    expect(screen.getByText("$73,812.00")).toBeInTheDocument();
    expect(screen.getByText("$6,151.00")).toBeInTheDocument();
    expect(screen.getByText("$1,419.46")).toBeInTheDocument();
    expect(screen.getByText("$19,288.00")).toBeInTheDocument();
    expect(screen.getByText("$1,900.00")).toBeInTheDocument();
    expect(screen.getByText("$10,925.00")).toBeInTheDocument();
  });

  it("updates output when HELP/HECS debt is toggled ON", () => {
    render(
      <AustraliaPayCalculator
        initialValues={{
          grossSalary: 95000,
          superannuationPercent: 11.5,
          hasHelpDebt: false,
          medicareExempt: false,
        }}
      />
    );

    expect(screen.getByText("$2,838.92")).toBeInTheDocument();

    // Toggle HELP/HECS debt ON
    const helpToggle = screen.getByLabelText(/HELP \/ HECS Student Debt/i);
    fireEvent.click(helpToggle);

    // For $95,000, tier >= 94504 is 5.5% = $5,225.00 repayment
    // Total deductions = 21,188 + 5,225 = $26,413.00
    // Net Annual = $68,587.00
    // Net Fortnightly = 68587 / 26 = $2,637.96
    expect(screen.getByText("$5,225.00")).toBeInTheDocument();
    expect(screen.getByText("$2,637.96")).toBeInTheDocument();
    expect(screen.getByText("$68,587.00")).toBeInTheDocument();
  });

  it("updates output when Superannuation rate or Medicare exempt is changed", () => {
    render(
      <AustraliaPayCalculator
        initialValues={{
          grossSalary: 95000,
          superannuationPercent: 11.5,
          hasHelpDebt: false,
          medicareExempt: false,
        }}
      />
    );

    expect(screen.getByText("$10,925.00")).toBeInTheDocument();

    // Change superannuation slider to 12% ($11,400.00)
    const superSlider = screen.getByLabelText(/Employer Superannuation Guarantee/i);
    fireEvent.change(superSlider, { target: { value: "12" } });
    expect(screen.getByText("$11,400.00")).toBeInTheDocument();

    // Toggle Medicare exempt ON
    const exemptCheckbox = screen.getByLabelText(/Exempt from 2% Medicare Levy/i);
    fireEvent.click(exemptCheckbox);

    // When Medicare exempt is ON:
    // Total deductions = Income Tax ($19,288.00)
    // Net Annual = 95,000 - 19,288 = $75,712.00
    // Net Fortnightly = 75,712 / 26 = $2,912.00
    expect(screen.getByText("$75,712.00")).toBeInTheDocument();
    expect(screen.getByText("$2,912.00")).toBeInTheDocument();
  });

  it("renders country cross-link navigation hub", () => {
    render(<AustraliaPayCalculator />);

    expect(screen.getByRole("link", { name: /US Paycheck/i })).toHaveAttribute(
      "href",
      "/tools/salary-calculator"
    );
    expect(screen.getByRole("link", { name: /UK Salary/i })).toHaveAttribute(
      "href",
      "/tools/uk-salary-calculator"
    );
    expect(screen.getByRole("link", { name: /Canada Paycheck/i })).toHaveAttribute(
      "href",
      "/tools/canada-paycheck-calculator"
    );
  });
});
