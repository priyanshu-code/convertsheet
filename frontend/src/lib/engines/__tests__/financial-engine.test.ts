import { describe, it, expect } from "vitest";
import {
  calculateMortgage,
  calculateCarLoan,
  calculateCarLeaseVsBuy,
  calculateCarLoanEarlyPayoff,
  calculateRetirement,
  calculateInflation,
  calculateHourlyToSalary,
  calculateAnnualToHourly,
  calculateDebtPayoff,
  calculateSavingsGrowth,
  calculateUsSalary,
  calculateUkSalary,
  calculateCanadaSalary,
  calculateAustraliaSalary,
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

  describe("calculateCarLeaseVsBuy", () => {
    it("compares loan purchase and lease options side-by-side with residual equity", () => {
      const res = calculateCarLeaseVsBuy({
        vehiclePrice: 35000,
        downPayment: 5000,
        tradeInValue: 3000,
        interestRate: 5.9,
        loanTermMonths: 36,
        salesTaxPercent: 7.0,
        dealerFees: 500,
      });

      expect(res.termMonths).toBe(36);
      expect(res.purchaseMonthlyPayment).toBeGreaterThan(0);
      expect(res.leaseMonthlyPayment).toBeGreaterThan(0);
      expect(res.purchaseEstimatedEndingEquity).toBe(18200); // 52% of 35,000
      expect(res.leaseEstimatedEndingEquity).toBe(0); // vehicle returned
      expect(res.purchaseNetCostOfOwnership).toBeLessThan(res.leaseNetCostOfOwnership);
      expect(res.longTermFinancialAdvantage).toBe("buy");
      expect(res.verdictSummary).toContain("Buying saves");
    });
  });

  describe("calculateCarLoanEarlyPayoff", () => {
    it("computes interest saved and months shaved off with extra monthly payments", () => {
      const res = calculateCarLoanEarlyPayoff({
        loanAmount: 30000,
        interestRate: 6.0,
        originalTermMonths: 60,
        extraMonthlyPayment: 100,
      });

      expect(res.originalMonthlyPayment).toBe(579.98);
      expect(res.acceleratedMonthlyPayment).toBe(679.98);
      expect(res.originalTotalInterest).toBeGreaterThan(4790);
      expect(res.acceleratedTotalInterest).toBeLessThan(res.originalTotalInterest);
      expect(res.totalInterestSaved).toBeGreaterThan(700);
      expect(res.monthsSaved).toBeGreaterThan(8);
      expect(res.yearsSaved).toBeGreaterThan(0.5);
      expect(res.payoffScheduleComparison.length).toBeGreaterThanOrEqual(5);
    });

    it("handles zero extra payments cleanly with 0 months saved", () => {
      const res = calculateCarLoanEarlyPayoff({
        loanAmount: 20000,
        interestRate: 5.0,
        originalTermMonths: 48,
        extraMonthlyPayment: 0,
      });

      expect(res.monthsSaved).toBe(0);
      expect(res.totalInterestSaved).toBe(0);
      expect(res.newPayoffMonths).toBe(48);
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


  describe("calculateUkSalary", () => {
    it("calculates take-home pay and tax for £40,000 basic earner", () => {
      const res = calculateUkSalary({
        grossSalary: 40000,
        pensionPercent: 5,
        studentLoanPlan: "none",
      });

      // Gross
      expect(res.grossSalary).toBe(40000);
      expect(res.monthlyGross).toBeCloseTo(3333.33, 2);
      expect(res.weeklyGross).toBeCloseTo(769.23, 2);

      // Pension: 5% of 40,000 = 2,000
      expect(res.pensionContribution).toBe(2000);

      // Personal allowance: 12,570 (no taper under 100k)
      expect(res.personalAllowance).toBe(12570);

      // Taxable income: 40000 - 2000 pension = 38000; 38000 - 12570 = 25430
      expect(res.taxableIncome).toBe(25430);

      // Income tax: 20% on 25430 = 5086
      expect(res.incomeTax).toBe(5086);

      // National insurance: 8% on (40000 - 12570) = 2194.40
      expect(res.nationalInsurance).toBe(2194.4);

      // Total deductions: 5086 + 2194.40 + 2000 = 9280.40
      expect(res.totalDeductions).toBe(9280.4);
      expect(res.netAnnualTakeHome).toBe(40000 - 9280.4);
      expect(res.netMonthlyTakeHome).toBeCloseTo((40000 - 9280.4) / 12, 2);
      expect(res.netWeeklyTakeHome).toBeCloseTo((40000 - 9280.4) / 52, 2);
      expect(res.effectiveTaxRate).toBeCloseTo(((5086 + 2194.4) / 40000) * 100, 2);
    });

    it("applies personal allowance taper for £120,000 earner", () => {
      const res = calculateUkSalary({
        grossSalary: 120000,
        pensionPercent: 0,
        studentLoanPlan: "none",
      });

      // Allowance reduced by £1 for every £2 above £100,000 -> reduction of £10,000
      // 12,570 - 10,000 = 2,570
      expect(res.personalAllowance).toBe(2570);
      expect(res.taxableIncome).toBe(120000 - 2570); // 117430

      // Basic band is £37,700 above Personal Allowance (£2,570 to £40,270) @ 20% = £7,540
      // Higher band is (£120,000 - £40,270) = £79,730 @ 40% = £31,892
      // Total income tax: 7540 + 31892 = 39432 (correctly reflecting 60% marginal trap)
      expect(res.incomeTax).toBe(39432);

      // NI: 8% on (50270 - 12570 = 37700) = 3016; 2% on (120000 - 50270 = 69730) = 1394.60 -> 4410.60
      expect(res.nationalInsurance).toBe(4410.6);
    });
  });

  describe("calculateCanadaSalary", () => {
    it("calculates federal, provincial tax, CPP, and EI for $80,000 Ontario earner", () => {
      const res = calculateCanadaSalary({
        grossSalary: 80000,
        province: "ON",
        rrspContributionPercent: 0,
      });

      expect(res.grossSalary).toBe(80000);
      expect(res.monthlyGross).toBeCloseTo(80000 / 12, 2);
      expect(res.biWeeklyGross).toBeCloseTo(80000 / 26, 2);
      expect(res.semiMonthlyGross).toBeCloseTo(80000 / 24, 2);

      // CPP: Tier 1: (68500 - 3500) * 0.0595 = 3867.50 (max)
      // Tier 2: (73200 - 68500) * 0.04 = 188.00 (max)
      // Total CPP = 3867.50 + 188 = 4055.50
      expect(res.cppContribution).toBe(4055.5);

      // EI: 80000 capped at 63200 * 0.0166 = 1049.12 (max)
      expect(res.eiContribution).toBe(1049.12);

      // Federal tax after Basic Personal Amount (BPA $15,705 @ 15% = $2,355.75):
      // Gross federal tax: 8380.05 + 4947.265 = 13327.315
      // Net federal tax: 13327.315 - 2355.75 = 10971.565 -> 10971.57
      expect(res.federalTax).toBeCloseTo(10971.57, 2);

      // Ontario provincial tax after BPA ($12,399 @ 5.05% = $626.15):
      // Gross provincial tax: 2598.023 + 2612.691 = 5210.714
      // Net provincial tax: 5210.714 - 626.15 = 4584.564 -> 4584.56
      expect(res.provincialTax).toBeCloseTo(4584.56, 2);

      expect(res.totalDeductions).toBeCloseTo(
        res.federalTax + res.provincialTax + res.cppContribution + res.eiContribution,
        2
      );
      expect(res.netAnnualTakeHome).toBe(80000 - res.totalDeductions);
      expect(res.netMonthlyTakeHome).toBeCloseTo(res.netAnnualTakeHome / 12, 2);
      expect(res.netBiWeeklyTakeHome).toBeCloseTo(res.netAnnualTakeHome / 26, 2);
      expect(res.netSemiMonthlyTakeHome).toBeCloseTo(res.netAnnualTakeHome / 24, 2);
    });
  });

  describe("calculateAustraliaSalary", () => {
    it("calculates income tax under Stage 3 cuts and 11.5% super for $90,000 earner", () => {
      const res = calculateAustraliaSalary({
        grossSalary: 90000,
        superannuationPercent: 11.5,
        hasHelpDebt: false,
        medicareExempt: false,
      });

      expect(res.grossSalary).toBe(90000);
      expect(res.monthlyGross).toBeCloseTo(90000 / 12, 2);
      expect(res.fortnightlyGross).toBeCloseTo(90000 / 26, 2);
      expect(res.weeklyGross).toBeCloseTo(90000 / 52, 2);

      // Superannuation: 11.5% of 90,000 = 10,350
      expect(res.superannuationAmount).toBe(10350);

      // Stage 3 Tax Cuts:
      // $0 - $18,200: 0
      // $18,201 - $45,000: (45000 - 18200) * 0.16 = 26800 * 0.16 = 4288
      // $45,001 - $90,000: (90000 - 45000) * 0.30 = 45000 * 0.30 = 13500
      // Total tax: 4288 + 13500 = 17788
      expect(res.incomeTax).toBe(17788);

      // Medicare levy: 2% of 90,000 = 1,800
      expect(res.medicareLevy).toBe(1800);
      expect(res.helpRepayment).toBe(0);

      // Total deductions: 17788 + 1800 = 19588
      expect(res.totalDeductions).toBe(19588);
      expect(res.netAnnualTakeHome).toBe(70412);
      expect(res.netMonthlyTakeHome).toBeCloseTo(70412 / 12, 2);
      expect(res.netFortnightlyTakeHome).toBeCloseTo(70412 / 26, 2);
      expect(res.netWeeklyTakeHome).toBeCloseTo(70412 / 52, 2);
      expect(res.effectiveTaxRate).toBeCloseTo((19588 / 90000) * 100, 2);
    });
  });
});
