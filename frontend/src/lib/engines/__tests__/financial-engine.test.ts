import { describe, it, expect } from "vitest";
import {
  calculateMortgage,
  calculateCarLoan,
  calculateRetirement,
  calculateInflation,
} from "../financial-engine";

describe("financial-engine", () => {
  describe("calculateMortgage", () => {
    it("computes monthly payment, loan amount, and amortization schedule correctly", () => {
      const res = calculateMortgage({
        homePrice: 400000,
        downPayment: 80000, // 20% down, no PMI
        interestRate: 6.5,
        loanTermYears: 30,
        propertyTaxYearly: 4800, // 400/mo
        homeInsuranceYearly: 1200, // 100/mo
      });

      expect(res.loanAmount).toBe(320000);
      expect(res.monthlyPrincipalAndInterest).toBeGreaterThan(2000);
      expect(res.monthlyPrincipalAndInterest).toBeLessThan(2100);
      expect(res.monthlyPropertyTax).toBe(400);
      expect(res.monthlyInsurance).toBe(100);
      expect(res.monthlyPmi).toBe(0);
      expect(res.payoffMonths).toBe(360);
      expect(res.yearlySchedule).toHaveLength(30);
      expect(res.monthlySchedule).toHaveLength(360);
      expect(res.yearlySchedule[29].balance).toBe(0);
    });

    it("includes PMI when down payment is under 20%", () => {
      const res = calculateMortgage({
        homePrice: 300000,
        downPayment: 30000, // 10% down -> PMI applies
        interestRate: 6.0,
        loanTermYears: 30,
      });

      expect(res.monthlyPmi).toBeGreaterThan(0);
    });

    it("calculates interest and months saved when extra payment is provided", () => {
      const standard = calculateMortgage({
        homePrice: 300000,
        downPayment: 60000,
        interestRate: 7.0,
        loanTermYears: 30,
        extraMonthlyPayment: 0,
      });

      const withExtra = calculateMortgage({
        homePrice: 300000,
        downPayment: 60000,
        interestRate: 7.0,
        loanTermYears: 30,
        extraMonthlyPayment: 200,
      });

      expect(withExtra.payoffMonths).toBeLessThan(standard.payoffMonths);
      expect(withExtra.interestSavedWithExtra).toBeGreaterThan(10000);
      expect(withExtra.monthsSavedWithExtra).toBeGreaterThan(0);
    });
  });

  describe("calculateCarLoan", () => {
    it("computes net financed amount, taxes, and monthly payment", () => {
      const res = calculateCarLoan({
        vehiclePrice: 35000,
        downPayment: 5000,
        tradeInValue: 3000,
        interestRate: 5.9,
        loanTermMonths: 60,
        salesTaxPercent: 7.0,
        dealerFees: 500,
      });

      // Taxable: 35000 - 3000 = 32000 * 7% = 2240 + 500 fees = 2740
      // Net Loan: 35000 - 3000 - 5000 + 2740 = 29740
      expect(res.netLoanAmount).toBe(29740);
      expect(res.monthlyPayment).toBeGreaterThan(500);
      expect(res.monthlyPayment).toBeLessThan(650);
      expect(res.totalInterest).toBeGreaterThan(0);
      expect(res.yearlySchedule.length).toBeGreaterThanOrEqual(5);
    });

    it("handles zero interest rate correctly", () => {
      const res = calculateCarLoan({
        vehiclePrice: 24000,
        downPayment: 0,
        tradeInValue: 0,
        interestRate: 0,
        loanTermMonths: 48,
      });

      expect(res.monthlyPayment).toBe(500);
      expect(res.totalInterest).toBe(0);
    });
  });

  describe("calculateRetirement", () => {
    it("projects nest egg accumulation and retirement drawdown", () => {
      const res = calculateRetirement({
        currentAge: 30,
        retirementAge: 65,
        currentSavings: 25000,
        monthlyContribution: 500,
        annualReturn: 8.0,
        employerMatchPercent: 50, // total $750/mo
        postRetirementAnnualSpend: 45000,
        inflationRate: 2.5,
      });

      expect(res.nestEggAtRetirement).toBeGreaterThan(1000000);
      expect(res.totalContributions).toBeGreaterThan(25000);
      expect(res.totalInterestEarned).toBeGreaterThan(res.totalContributions);
      expect(res.monthlyRetirementIncome).toBeGreaterThan(3000);
      expect(res.yearlyProjection.length).toBeGreaterThan(35);
      expect(res.inflationAdjustedNestEgg).toBeLessThan(res.nestEggAtRetirement);
    });
  });

  describe("calculateInflation", () => {
    it("computes purchasing power erosion and future equivalent needed", () => {
      const res = calculateInflation({
        amount: 1000,
        inflationRate: 3.0,
        years: 10,
      });

      expect(res.futureEquivalentValue).toBeGreaterThan(1300);
      expect(res.futurePurchasingPower).toBeLessThan(800);
      expect(res.cumulativeInflationPercent).toBeGreaterThan(30);
      expect(res.yearlyProjection).toHaveLength(11);
      expect(res.yearlyProjection[0].futureNeeded).toBe(1000);
    });
  });
});
