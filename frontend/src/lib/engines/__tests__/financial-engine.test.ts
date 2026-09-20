import { describe, it, expect } from "vitest";
import {
  calculateMortgage,
  calculateCarLoan,
  calculateRetirement,
  calculateInflation,
  calculateHourlyToSalary,
  calculateAnnualToHourly,
  calculateDebtPayoff,
  calculateSavingsGrowth,
  calculateUsSalary,
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

  describe("calculateHourlyToSalary", () => {
    it("converts standard $25/hr to exact daily, weekly, bi-weekly, monthly, and annual salaries", () => {
      // @ts-expect-error test before implementation
      const res = calculateHourlyToSalary({
        hourlyRate: 25,
        hoursPerWeek: 40,
        weeksPerYear: 52,
      });

      expect(res.hourlyRate).toBe(25);
      expect(res.dailyPay).toBe(200); // 25 * 8
      expect(res.weeklyPay).toBe(1000); // 25 * 40
      expect(res.biWeeklyPay).toBe(2000); // 25 * 80
      expect(res.semiMonthlyPay).toBeCloseTo(2166.67, 1); // 52000 / 24
      expect(res.monthlyPay).toBeCloseTo(4333.33, 1); // 52000 / 12
      expect(res.annualSalary).toBe(52000); // 25 * 2080
      expect(res.totalWorkHoursYearly).toBe(2080);
    });

    it("factors in unpaid holidays and overtime hours", () => {
      // @ts-expect-error test before implementation
      const res = calculateHourlyToSalary({
        hourlyRate: 30,
        hoursPerWeek: 40,
        weeksPerYear: 50, // 2 weeks unpaid
        overtimeHoursPerWeek: 5,
        overtimeMultiplier: 1.5,
      });

      // Regular: 30 * 40 * 50 = 60,000
      // Overtime: (30 * 1.5 = 45) * 5 * 50 = 11,250
      // Total annual: 71,250
      expect(res.annualSalary).toBe(71250);
      expect(res.weeklyPay).toBe(1425);
    });
  });

  describe("calculateAnnualToHourly", () => {
    it("converts standard $100,000 annual salary to equivalent intervals", () => {
      // @ts-expect-error test before implementation
      const res = calculateAnnualToHourly({
        annualSalary: 100000,
        hoursPerWeek: 40,
        weeksPerYear: 52,
      });

      expect(res.annualSalary).toBe(100000);
      expect(res.monthlySalary).toBeCloseTo(8333.33, 1);
      expect(res.semiMonthlySalary).toBeCloseTo(4166.67, 1);
      expect(res.biWeeklySalary).toBeCloseTo(3846.15, 1);
      expect(res.weeklySalary).toBeCloseTo(1923.08, 1);
      expect(res.dailyWage).toBeCloseTo(384.62, 1);
      expect(res.hourlyRate).toBeCloseTo(48.08, 1);
    });
  });

  describe("calculateDebtPayoff", () => {
    const sampleDebts = [
      { id: "1", name: "Credit Card A", balance: 5000, interestRate: 22.0, minimumPayment: 150 },
      { id: "2", name: "Credit Card B", balance: 2000, interestRate: 15.0, minimumPayment: 60 },
      { id: "3", name: "Auto Loan", balance: 8000, interestRate: 6.5, minimumPayment: 200 },
    ];

    it("simulates debt payoff with avalanche strategy and extra payments", () => {
      const res = calculateDebtPayoff({
        debts: sampleDebts,
        extraMonthlyPayment: 200,
        strategy: "avalanche",
      });

      expect(res.totalOriginalBalance).toBe(15000);
      expect(res.totalMonthlyPayment).toBe(610); // 150 + 60 + 200 + 200 extra
      expect(res.payoffMonths).toBeGreaterThan(0);
      expect(res.interestSavedComparedToMinOnly).toBeGreaterThan(0);
      expect(res.monthsSavedComparedToMinOnly).toBeGreaterThan(0);
      expect(res.monthlySchedule.length).toBe(res.payoffMonths);
      expect(res.monthlySchedule[res.payoffMonths - 1].remainingBalance).toBe(0);
    });

    it("supports snowball strategy paying smallest balance first", () => {
      const res = calculateDebtPayoff({
        debts: sampleDebts,
        extraMonthlyPayment: 200,
        strategy: "snowball",
      });

      expect(res.strategy).toBe("snowball");
      expect(res.totalOriginalBalance).toBe(15000);
      expect(res.payoffMonths).toBeGreaterThan(0);
    });
  });

  describe("calculateSavingsGrowth", () => {
    it("computes compound interest with monthly contributions correctly", () => {
      const res = calculateSavingsGrowth({
        initialDeposit: 10000,
        monthlyContribution: 500,
        annualInterestRate: 5.0, // 5% APY
        termMonths: 12,
        compoundingFrequency: "daily",
      });

      expect(res.initialDeposit).toBe(10000);
      expect(res.totalContributions).toBe(6000);
      expect(res.totalInterestEarned).toBeGreaterThan(500);
      expect(res.finalBalance).toBeGreaterThan(16500);
      expect(res.effectiveApy).toBeCloseTo(5.12, 1);
      expect(res.monthlySchedule).toHaveLength(12);
    });

    it("calculates CD early withdrawal penalty correctly", () => {
      const res = calculateSavingsGrowth({
        initialDeposit: 25000,
        annualInterestRate: 5.0,
        termMonths: 12,
        cdEarlyPenaltyMonths: 3, // 90 days penalty
      });

      expect(res.earlyWithdrawalPenalty).toBeGreaterThan(0);
      expect(res.netBalanceAfterEarlyPenalty).toBeLessThan(res.finalBalance);
    });
  });

  describe("calculateUsSalary", () => {
    it("calculates take-home pay and tax deductions for a standard $100,000 Single salary", () => {
      const res = calculateUsSalary({
        grossSalary: 100000,
        filingStatus: "single",
        stateTaxPercent: 5,
        k401ContributionPercent: 0,
        pretaxDeductionsMonthly: 0,
      });

      expect(res.grossSalary).toBe(100000);
      expect(res.monthlyGross).toBeCloseTo(8333.33, 2);
      expect(res.biWeeklyGross).toBeCloseTo(3846.15, 2);
      // Social Security: 6.2% of $100k = $6,200
      expect(res.socialSecurityTax).toBe(6200);
      // Medicare: 1.45% of $100k = $1,450 (under $200k surtax)
      expect(res.medicareTax).toBe(1450);
      // Standard deduction: $14,600 -> Taxable federal: $85,400
      expect(res.federalTaxableIncome).toBe(85400);
      // Federal brackets for Single 2024:
      // 10% on 11,600 = 1,160
      // 12% on (47,150 - 11,600 = 35,550) = 4,266
      // 22% on (85,400 - 47,150 = 38,250) = 8,415
      // Total federal = 1,160 + 4,266 + 8,415 = 13,841
      expect(res.federalIncomeTax).toBe(13841);
      // State tax: 5% of $100k = $5,000
      expect(res.stateIncomeTax).toBe(5000);
      // Total annual taxes = 6,200 + 1,450 + 13,841 + 5,000 = 26,491
      expect(res.totalAnnualTaxes).toBe(26491);
      expect(res.netAnnualTakeHome).toBe(100000 - 26491);
      expect(res.netMonthlyTakeHome).toBeCloseTo((100000 - 26491) / 12, 2);
      expect(res.netBiWeeklyTakeHome).toBeCloseTo((100000 - 26491) / 26, 2);
      expect(res.effectiveTaxRate).toBeCloseTo(26.49, 1);
    });

    it("applies Additional Medicare Tax surtax and Social Security wage cap for high earners", () => {
      const res = calculateUsSalary({
        grossSalary: 300000,
        filingStatus: "single",
        stateTaxPercent: 0,
        k401ContributionPercent: 0,
      });

      // SS wage cap $168,600: 168600 * 0.062 = 10,453.20
      expect(res.socialSecurityTax).toBe(10453.2);
      // Medicare: 1.45% of 300k = 4,350 + 0.9% on (300k - 200k = 100k) = 900 -> 5,250
      expect(res.medicareTax).toBe(5250);
      expect(res.federalTaxableIncome).toBe(300000 - 14600);
    });

    it("reduces taxable income when 401(k) and pre-tax deductions are present", () => {
      const withoutPretax = calculateUsSalary({
        grossSalary: 120000,
        filingStatus: "single",
        k401ContributionPercent: 0,
        pretaxDeductionsMonthly: 0,
      });

      const withPretax = calculateUsSalary({
        grossSalary: 120000,
        filingStatus: "single",
        k401ContributionPercent: 10, // $12,000
        pretaxDeductionsMonthly: 500, // $6,000/yr
      });

      expect(withPretax.k401Deduction).toBe(12000);
      expect(withPretax.federalTaxableIncome).toBe(withoutPretax.federalTaxableIncome - 18000);
      expect(withPretax.federalIncomeTax).toBeLessThan(withoutPretax.federalIncomeTax);
      expect(withPretax.totalAnnualDeductions).toBeGreaterThan(withPretax.totalAnnualTaxes);
    });
  });

});
