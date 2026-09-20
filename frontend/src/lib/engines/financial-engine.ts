import { roundTo, preciseAdd, preciseMultiply, preciseDivide } from "../math-utils";

// ==========================================
// 1. MORTGAGE & AMORTIZATION
// ==========================================

export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  interestRate: number; // Annual % (e.g. 6.5)
  loanTermYears: number; // e.g. 30 or 15
  propertyTaxYearly?: number;
  homeInsuranceYearly?: number;
  pmiPercentYearly?: number; // e.g. 0.5% if down payment < 20%
  extraMonthlyPayment?: number;
}

export interface AmortizationRow {
  period: number;
  label: string;
  payment: number;
  principal: number;
  interest: number;
  totalInterest: number;
  balance: number;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  totalMonthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  payoffMonths: number;
  payoffYears: number;
  interestSavedWithExtra: number;
  monthsSavedWithExtra: number;
  yearlySchedule: AmortizationRow[];
  monthlySchedule: AmortizationRow[];
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const homePrice = Math.max(0, input.homePrice || 0);
  const downPayment = Math.min(homePrice, Math.max(0, input.downPayment || 0));
  const loanAmount = Math.max(0, homePrice - downPayment);
  const annualRate = Math.max(0, input.interestRate || 0);
  const monthlyRate = annualRate > 0 ? annualRate / 100 / 12 : 0;
  const totalMonths = Math.max(1, (input.loanTermYears || 30) * 12);
  const extraPayment = Math.max(0, input.extraMonthlyPayment || 0);

  // Standard Monthly P&I
  let baseMonthlyPI = 0;
  if (monthlyRate === 0) {
    baseMonthlyPI = loanAmount / totalMonths;
  } else if (loanAmount > 0) {
    baseMonthlyPI =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }
  baseMonthlyPI = roundTo(baseMonthlyPI, 2);

  // Taxes, Insurance, PMI
  const monthlyPropertyTax = roundTo((input.propertyTaxYearly || 0) / 12, 2);
  const monthlyInsurance = roundTo((input.homeInsuranceYearly || 0) / 12, 2);

  // PMI applies if down payment is less than 20% of purchase price
  const downPaymentRatio = homePrice > 0 ? downPayment / homePrice : 1;
  const pmiRate = input.pmiPercentYearly !== undefined ? input.pmiPercentYearly : 0.5;
  const hasPmi = downPaymentRatio < 0.2 && loanAmount > 0;
  const initialMonthlyPmi = hasPmi ? roundTo((loanAmount * (pmiRate / 100)) / 12, 2) : 0;

  // Generate Month-by-Month Amortization with Extra Payments
  const monthlySchedule: AmortizationRow[] = [];
  const yearlySchedule: AmortizationRow[] = [];

  let currentBalance = loanAmount;
  let runningTotalInterest = 0;
  let monthCount = 0;

  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  while (currentBalance > 0.01 && monthCount < totalMonths * 2) {
    monthCount++;
    const interestForMonth = roundTo(currentBalance * monthlyRate, 2);
    let principalForMonth = baseMonthlyPI - interestForMonth + extraPayment;

    if (principalForMonth > currentBalance) {
      principalForMonth = currentBalance;
    }

    const actualMonthlyPayment = roundTo(principalForMonth + interestForMonth, 2);
    currentBalance = Math.max(0, roundTo(currentBalance - principalForMonth, 2));
    runningTotalInterest = roundTo(runningTotalInterest + interestForMonth, 2);

    currentYearInterest += interestForMonth;
    currentYearPrincipal += principalForMonth;
    currentYearPayment += actualMonthlyPayment;

    monthlySchedule.push({
      period: monthCount,
      label: `Month ${monthCount}`,
      payment: actualMonthlyPayment,
      principal: principalForMonth,
      interest: interestForMonth,
      totalInterest: runningTotalInterest,
      balance: currentBalance,
    });

    // End of year or payoff
    if (monthCount % 12 === 0 || currentBalance <= 0.01) {
      const yearNumber = Math.ceil(monthCount / 12);
      yearlySchedule.push({
        period: yearNumber,
        label: `Year ${yearNumber}`,
        payment: roundTo(currentYearPayment, 2),
        principal: roundTo(currentYearPrincipal, 2),
        interest: roundTo(currentYearInterest, 2),
        totalInterest: runningTotalInterest,
        balance: currentBalance,
      });
      currentYearInterest = 0;
      currentYearPrincipal = 0;
      currentYearPayment = 0;
    }
  }

  // Calculate baseline interest without extra payment
  const baselineTotalInterest = roundTo(baseMonthlyPI * totalMonths - loanAmount, 2);
  const actualTotalInterest = runningTotalInterest;
  const interestSaved = Math.max(0, roundTo(baselineTotalInterest - actualTotalInterest, 2));
  const monthsSaved = Math.max(0, totalMonths - monthCount);

  return {
    loanAmount: roundTo(loanAmount, 2),
    monthlyPrincipalAndInterest: baseMonthlyPI,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPmi: initialMonthlyPmi,
    totalMonthlyPayment: roundTo(
      baseMonthlyPI + monthlyPropertyTax + monthlyInsurance + initialMonthlyPmi + extraPayment,
      2
    ),
    totalInterest: actualTotalInterest,
    totalPayment: roundTo(loanAmount + actualTotalInterest, 2),
    payoffMonths: monthCount,
    payoffYears: roundTo(monthCount / 12, 1),
    interestSavedWithExtra: interestSaved,
    monthsSavedWithExtra: monthsSaved,
    yearlySchedule,
    monthlySchedule,
  };
}

// ==========================================
// 2. AUTO / CAR LOAN CALCULATOR
// ==========================================

export interface CarLoanInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  interestRate: number; // Annual % (e.g. 5.9)
  loanTermMonths: number; // e.g. 36, 48, 60, 72
  salesTaxPercent?: number; // e.g. 7%
  dealerFees?: number; // Doc fees, registration
}

export interface CarLoanResult {
  netLoanAmount: number;
  totalTaxesAndFees: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  yearlySchedule: { year: number; balance: number; interest: number; principal: number }[];
}

export function calculateCarLoan(input: CarLoanInput): CarLoanResult {
  const price = Math.max(0, input.vehiclePrice || 0);
  const down = Math.max(0, input.downPayment || 0);
  const tradeIn = Math.max(0, input.tradeInValue || 0);
  const taxRate = Math.max(0, input.salesTaxPercent || 0) / 100;
  const fees = Math.max(0, input.dealerFees || 0);
  const termMonths = Math.max(1, input.loanTermMonths || 60);
  const annualRate = Math.max(0, input.interestRate || 0);
  const monthlyRate = annualRate > 0 ? annualRate / 100 / 12 : 0;

  // Sales tax is typically applied to price minus trade-in
  const taxableAmount = Math.max(0, price - tradeIn);
  const salesTax = roundTo(taxableAmount * taxRate, 2);
  const totalTaxesAndFees = roundTo(salesTax + fees, 2);

  // Net amount financed
  const netLoanAmount = Math.max(0, roundTo(price - tradeIn - down + totalTaxesAndFees, 2));

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = netLoanAmount / termMonths;
  } else if (netLoanAmount > 0) {
    monthlyPayment =
      (netLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }
  monthlyPayment = roundTo(monthlyPayment, 2);

  const totalPayments = roundTo(monthlyPayment * termMonths, 2);
  const totalInterest = Math.max(0, roundTo(totalPayments - netLoanAmount, 2));
  const totalCost = roundTo(netLoanAmount + totalInterest + down + tradeIn, 2);

  // Yearly amortization projection
  const yearlySchedule: { year: number; balance: number; interest: number; principal: number }[] = [];
  let balance = netLoanAmount;
  let yInterest = 0;
  let yPrincipal = 0;

  for (let m = 1; m <= termMonths; m++) {
    const interestMonth = roundTo(balance * monthlyRate, 2);
    let principalMonth = monthlyPayment - interestMonth;
    if (principalMonth > balance) principalMonth = balance;
    balance = Math.max(0, roundTo(balance - principalMonth, 2));

    yInterest += interestMonth;
    yPrincipal += principalMonth;

    if (m % 12 === 0 || m === termMonths) {
      yearlySchedule.push({
        year: Math.ceil(m / 12),
        balance,
        interest: roundTo(yInterest, 2),
        principal: roundTo(yPrincipal, 2),
      });
      yInterest = 0;
      yPrincipal = 0;
    }
  }

  return {
    netLoanAmount,
    totalTaxesAndFees,
    monthlyPayment,
    totalInterest,
    totalCost,
    yearlySchedule,
  };
}

// ==========================================
// 3. RETIREMENT & 401(K) CALCULATOR
// ==========================================

export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturn: number; // % during accumulation (e.g. 7.5%)
  employerMatchPercent?: number; // % of employee contribution matched (e.g. 50)
  postRetirementAnnualSpend?: number; // Desired annual spend in retirement
  postRetirementReturn?: number; // % during retirement (e.g. 4.5%)
  inflationRate?: number; // % inflation (e.g. 2.5%)
}

export interface RetirementYearPoint {
  age: number;
  balance: number;
  phase: "accumulation" | "retirement";
  totalContributed: number;
}

export interface RetirementResult {
  nestEggAtRetirement: number;
  inflationAdjustedNestEgg: number;
  totalContributions: number;
  totalInterestEarned: number;
  monthlyRetirementIncome: number;
  yearsNestEggLasts: number;
  yearlyProjection: RetirementYearPoint[];
}

export function calculateRetirement(input: RetirementInput): RetirementResult {
  const currentAge = Math.max(18, input.currentAge || 30);
  const retirementAge = Math.max(currentAge + 1, input.retirementAge || 65);
  let balance = Math.max(0, input.currentSavings || 0);
  const monthlyContrib = Math.max(0, input.monthlyContribution || 0);
  const matchPct = Math.max(0, input.employerMatchPercent || 0) / 100;
  const totalMonthlyAddition = monthlyContrib * (1 + matchPct);

  const accumReturnRate = Math.max(0, input.annualReturn || 7) / 100;
  const postReturnRate = Math.max(0, input.postRetirementReturn || 4.5) / 100;
  const inflation = Math.max(0, input.inflationRate || 2.5) / 100;
  const annualSpend = Math.max(
    0,
    input.postRetirementAnnualSpend || totalMonthlyAddition * 12 * 0.8 || 40000
  );

  const yearlyProjection: RetirementYearPoint[] = [];
  let totalContributed = balance;

  // Initial starting point
  yearlyProjection.push({
    age: currentAge,
    balance: roundTo(balance, 2),
    phase: "accumulation",
    totalContributed: roundTo(totalContributed, 2),
  });

  // Phase 1: Accumulation
  for (let age = currentAge + 1; age <= retirementAge; age++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + accumReturnRate / 12) + totalMonthlyAddition;
      totalContributed += totalMonthlyAddition;
    }
    yearlyProjection.push({
      age,
      balance: roundTo(balance, 2),
      phase: "accumulation",
      totalContributed: roundTo(totalContributed, 2),
    });
  }

  const nestEggAtRetirement = roundTo(balance, 2);
  const accumulationYears = retirementAge - currentAge;
  const inflationDiscount = Math.pow(1 + inflation, accumulationYears);
  const inflationAdjustedNestEgg = roundTo(nestEggAtRetirement / inflationDiscount, 2);
  const totalInterestEarned = Math.max(0, roundTo(nestEggAtRetirement - totalContributed, 2));

  // Safe 4% monthly rule of thumb income
  const monthlyRetirementIncome = roundTo((nestEggAtRetirement * 0.04) / 12, 2);

  // Phase 2: Drawdown until age 100 or balance = 0
  let drawBalance = nestEggAtRetirement;
  let drawdownYears = 0;
  const maxRetirementAge = 100;

  for (let age = retirementAge + 1; age <= maxRetirementAge; age++) {
    if (drawBalance > 0) {
      // Annual growth minus annual spend
      drawBalance = drawBalance * (1 + postReturnRate) - annualSpend;
      if (drawBalance < 0) drawBalance = 0;
      drawdownYears++;
    }
    yearlyProjection.push({
      age,
      balance: roundTo(drawBalance, 2),
      phase: "retirement",
      totalContributed: roundTo(totalContributed, 2),
    });
  }

  return {
    nestEggAtRetirement,
    inflationAdjustedNestEgg,
    totalContributions: roundTo(totalContributed, 2),
    totalInterestEarned,
    monthlyRetirementIncome,
    yearsNestEggLasts: drawdownYears,
    yearlyProjection,
  };
}

// ==========================================
// 4. INFLATION & PURCHASING POWER CALCULATOR
// ==========================================

export interface InflationInput {
  amount: number;
  inflationRate: number; // Annual % e.g. 3.2%
  years: number; // Horizon in years
}

export interface InflationResult {
  futureEquivalentValue: number; // Amount needed in future to match purchasing power
  futurePurchasingPower: number; // Value of today's amount eroded by inflation
  cumulativeInflationPercent: number;
  yearlyProjection: { year: number; futureNeeded: number; purchasingPower: number }[];
}

export function calculateInflation(input: InflationInput): InflationResult {
  const amount = Math.max(0, input.amount || 100);
  const rate = Math.max(0, input.inflationRate || 3.0) / 100;
  const years = Math.max(1, Math.min(100, input.years || 10));

  const yearlyProjection: { year: number; futureNeeded: number; purchasingPower: number }[] = [];

  for (let y = 0; y <= years; y++) {
    const factor = Math.pow(1 + rate, y);
    const futureNeeded = roundTo(amount * factor, 2);
    const purchasingPower = roundTo(amount / factor, 2);

    yearlyProjection.push({
      year: y,
      futureNeeded,
      purchasingPower,
    });
  }

  const finalFactor = Math.pow(1 + rate, years);
  const futureEquivalentValue = roundTo(amount * finalFactor, 2);
  const futurePurchasingPower = roundTo(amount / finalFactor, 2);
  const cumulativeInflationPercent = roundTo((finalFactor - 1) * 100, 2);

  return {
    futureEquivalentValue,
    futurePurchasingPower,
    cumulativeInflationPercent,
    yearlyProjection,
  };
}

// ==========================================
// 5. HOURLY TO SALARY & ANNUAL CONVERSIONS
// ==========================================

export interface HourlyToSalaryInput {
  hourlyRate: number;
  hoursPerWeek?: number; // default 40
  weeksPerYear?: number; // default 52
  paidVacationDays?: number; // default 0
  paidHolidays?: number; // default 0
  unpaidLeaveDays?: number; // default 0
  overtimeHoursPerWeek?: number; // default 0
  overtimeMultiplier?: number; // default 1.5
}

export interface HourlyToSalaryResult {
  hourlyRate: number;
  dailyPay: number;
  weeklyPay: number;
  biWeeklyPay: number; // 26 periods
  semiMonthlyPay: number; // 24 periods
  monthlyPay: number; // 12 periods
  annualSalary: number;
  totalWorkHoursYearly: number;
  regularAnnualPay: number;
  overtimeAnnualPay: number;
}

export function calculateHourlyToSalary(input: HourlyToSalaryInput): HourlyToSalaryResult {
  const hourlyRate = Math.max(0, input.hourlyRate || 0);
  const hoursPerWeek = Math.max(0, input.hoursPerWeek ?? 40);
  const weeksPerYear = Math.max(0, Math.min(52, input.weeksPerYear ?? 52));
  const unpaidLeaveDays = Math.max(0, input.unpaidLeaveDays ?? 0);
  const overtimeHours = Math.max(0, input.overtimeHoursPerWeek ?? 0);
  const overtimeMultiplier = Math.max(1, input.overtimeMultiplier ?? 1.5);

  const hoursPerDay = hoursPerWeek > 0 ? hoursPerWeek / 5 : 8;
  const regularHoursYearly = Math.max(0, hoursPerWeek * weeksPerYear - unpaidLeaveDays * hoursPerDay);
  const overtimeHoursYearly = overtimeHours * weeksPerYear;
  const totalWorkHoursYearly = regularHoursYearly + overtimeHoursYearly;

  const regularAnnualPay = roundTo(regularHoursYearly * hourlyRate, 2);
  const overtimeRate = hourlyRate * overtimeMultiplier;
  const overtimeAnnualPay = roundTo(overtimeHoursYearly * overtimeRate, 2);
  const annualSalary = roundTo(regularAnnualPay + overtimeAnnualPay, 2);

  const weeklyPay = weeksPerYear > 0 ? roundTo(annualSalary / weeksPerYear, 2) : 0;
  const dailyPay = hoursPerWeek > 0 ? roundTo(weeklyPay / 5, 2) : 0;
  const biWeeklyPay = roundTo(annualSalary / 26, 2);
  const semiMonthlyPay = roundTo(annualSalary / 24, 2);
  const monthlyPay = roundTo(annualSalary / 12, 2);

  return {
    hourlyRate,
    dailyPay,
    weeklyPay,
    biWeeklyPay,
    semiMonthlyPay,
    monthlyPay,
    annualSalary,
    totalWorkHoursYearly: roundTo(totalWorkHoursYearly, 1),
    regularAnnualPay,
    overtimeAnnualPay,
  };
}

export interface AnnualToHourlyInput {
  annualSalary: number;
  hoursPerWeek?: number; // default 40
  weeksPerYear?: number; // default 52
  unpaidLeaveDays?: number; // default 0
}

export interface AnnualToHourlyResult {
  annualSalary: number;
  monthlySalary: number;
  semiMonthlySalary: number;
  biWeeklySalary: number;
  weeklySalary: number;
  dailyWage: number;
  hourlyRate: number;
  totalWorkHoursYearly: number;
}

export function calculateAnnualToHourly(input: AnnualToHourlyInput): AnnualToHourlyResult {
  const annualSalary = Math.max(0, input.annualSalary || 0);
  const hoursPerWeek = Math.max(1, input.hoursPerWeek ?? 40);
  const weeksPerYear = Math.max(1, Math.min(52, input.weeksPerYear ?? 52));
  const unpaidLeaveDays = Math.max(0, input.unpaidLeaveDays ?? 0);

  const hoursPerDay = hoursPerWeek / 5;
  const totalWorkHoursYearly = Math.max(1, hoursPerWeek * weeksPerYear - unpaidLeaveDays * hoursPerDay);

  const hourlyRate = roundTo(annualSalary / totalWorkHoursYearly, 2);
  const weeklySalary = roundTo(annualSalary / weeksPerYear, 2);
  const dailyWage = roundTo(weeklySalary / 5, 2);
  const biWeeklySalary = roundTo(annualSalary / 26, 2);
  const semiMonthlySalary = roundTo(annualSalary / 24, 2);
  const monthlySalary = roundTo(annualSalary / 12, 2);

  return {
    annualSalary,
    monthlySalary,
    semiMonthlySalary,
    biWeeklySalary,
    weeklySalary,
    dailyWage,
    hourlyRate,
    totalWorkHoursYearly: roundTo(totalWorkHoursYearly, 1),
  };
}

// ==========================================
// 6. DEBT PAYOFF & CREDIT CARD ACCELERATOR
// ==========================================

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // Annual %
  minimumPayment: number;
}

export interface DebtPayoffInput {
  debts: DebtItem[];
  extraMonthlyPayment?: number;
  strategy?: "snowball" | "avalanche";
}

export interface DebtPayoffMonthlyScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  debtsPaidOff: string[];
}

export interface DebtPayoffResult {
  strategy: "snowball" | "avalanche";
  totalOriginalBalance: number;
  totalMonthlyPayment: number;
  totalInterestPaid: number;
  totalPayment: number;
  payoffMonths: number;
  payoffYears: number;
  interestSavedComparedToMinOnly: number;
  monthsSavedComparedToMinOnly: number;
  monthlySchedule: DebtPayoffMonthlyScheduleRow[];
}

export function calculateDebtPayoff(input: DebtPayoffInput): DebtPayoffResult {
  const strategy = input.strategy || "avalanche";
  const extraMonthly = Math.max(0, input.extraMonthlyPayment || 0);

  const initialDebts = (input.debts || [])
    .filter((d) => d.balance > 0)
    .map((d) => ({
      ...d,
      balance: Math.max(0, d.balance),
      interestRate: Math.max(0, d.interestRate),
      minimumPayment: Math.max(0, d.minimumPayment),
    }));

  const totalOriginalBalance = roundTo(
    initialDebts.reduce((sum, d) => sum + d.balance, 0),
    2
  );

  const baseMinMonthlyPayment = roundTo(
    initialDebts.reduce((sum, d) => sum + d.minimumPayment, 0),
    2
  );

  // Helper simulation
  function simulate(withExtra: number, sortStrategy: "snowball" | "avalanche") {
    let currentDebts = initialDebts.map((d) => ({ ...d }));
    let month = 0;
    let totalInterest = 0;
    let totalPaid = 0;
    const schedule: DebtPayoffMonthlyScheduleRow[] = [];
    const MAX_MONTHS = 600; // 50 years sanity limit

    while (currentDebts.some((d) => d.balance > 0.01) && month < MAX_MONTHS) {
      month++;
      let monthlyInterest = 0;
      let monthlyPrincipal = 0;
      let monthlyTotalPaid = 0;
      const debtsPaidThisMonth: string[] = [];

      // Accrue monthly interest on each active debt
      currentDebts.forEach((debt) => {
        if (debt.balance > 0) {
          const mRate = debt.interestRate / 100 / 12;
          const interest = roundTo(debt.balance * mRate, 2);
          debt.balance = roundTo(debt.balance + interest, 2);
          monthlyInterest = roundTo(monthlyInterest + interest, 2);
        }
      });

      // Pay minimum payments first
      let leftoverExtra = withExtra;
      currentDebts.forEach((debt) => {
        if (debt.balance > 0) {
          const toPay = Math.min(debt.balance, debt.minimumPayment);
          debt.balance = roundTo(debt.balance - toPay, 2);
          monthlyTotalPaid = roundTo(monthlyTotalPaid + toPay, 2);
          if (debt.balance <= 0.01) {
            debt.balance = 0;
            debtsPaidThisMonth.push(debt.name);
            leftoverExtra += debt.minimumPayment; // Rollover freed cashflow
          }
        }
      });

      // Sort remaining active debts by strategy for extra accelerated payment
      const activeDebts = currentDebts.filter((d) => d.balance > 0);
      if (activeDebts.length > 0 && leftoverExtra > 0) {
        if (sortStrategy === "snowball") {
          activeDebts.sort((a, b) => a.balance - b.balance);
        } else {
          // Avalanche: highest interest rate first
          activeDebts.sort((a, b) => b.interestRate - a.interestRate);
        }

        let remainingExtraToApply = leftoverExtra;
        for (const targetDebt of activeDebts) {
          if (remainingExtraToApply <= 0) break;
          const extraToPay = Math.min(targetDebt.balance, remainingExtraToApply);
          targetDebt.balance = roundTo(targetDebt.balance - extraToPay, 2);
          monthlyTotalPaid = roundTo(monthlyTotalPaid + extraToPay, 2);
          remainingExtraToApply = roundTo(remainingExtraToApply - extraToPay, 2);

          if (targetDebt.balance <= 0.01) {
            targetDebt.balance = 0;
            if (!debtsPaidThisMonth.includes(targetDebt.name)) {
              debtsPaidThisMonth.push(targetDebt.name);
            }
          }
        }
      }

      monthlyPrincipal = roundTo(Math.max(0, monthlyTotalPaid - monthlyInterest), 2);
      totalInterest = roundTo(totalInterest + monthlyInterest, 2);
      totalPaid = roundTo(totalPaid + monthlyTotalPaid, 2);

      const remainingBalance = roundTo(
        currentDebts.reduce((sum, d) => sum + d.balance, 0),
        2
      );

      schedule.push({
        month,
        payment: monthlyTotalPaid,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        remainingBalance,
        debtsPaidOff: debtsPaidThisMonth,
      });
    }

    return {
      month,
      totalInterest,
      totalPaid,
      schedule,
    };
  }

  const baseline = simulate(0, strategy);
  const accelerated = simulate(extraMonthly, strategy);

  const interestSaved = Math.max(
    0,
    roundTo(baseline.totalInterest - accelerated.totalInterest, 2)
  );
  const monthsSaved = Math.max(0, baseline.month - accelerated.month);

  return {
    strategy,
    totalOriginalBalance,
    totalMonthlyPayment: roundTo(baseMinMonthlyPayment + extraMonthly, 2),
    totalInterestPaid: accelerated.totalInterest,
    totalPayment: accelerated.totalPaid,
    payoffMonths: accelerated.month,
    payoffYears: roundTo(accelerated.month / 12, 1),
    interestSavedComparedToMinOnly: interestSaved,
    monthsSavedComparedToMinOnly: monthsSaved,
    monthlySchedule: accelerated.schedule,
  };
}

// ==========================================
// 7. HIGH-YIELD SAVINGS & CD COMPOUND ENGINE
// ==========================================

export type CompoundingFrequency = "daily" | "monthly" | "quarterly" | "annually";

export interface SavingsGrowthInput {
  initialDeposit: number;
  monthlyContribution?: number;
  annualInterestRate: number; // APY or APR %
  termMonths: number;
  compoundingFrequency?: CompoundingFrequency;
  cdEarlyPenaltyMonths?: number; // E.g. 3 or 6 months interest penalty
}

export interface SavingsGrowthScheduleRow {
  month: number;
  startingBalance: number;
  contribution: number;
  interestEarned: number;
  totalInterestEarned: number;
  endingBalance: number;
}

export interface SavingsGrowthResult {
  initialDeposit: number;
  totalContributions: number;
  totalInterestEarned: number;
  finalBalance: number;
  effectiveApy: number;
  earlyWithdrawalPenalty: number;
  netBalanceAfterEarlyPenalty: number;
  monthlySchedule: SavingsGrowthScheduleRow[];
}

export function calculateSavingsGrowth(input: SavingsGrowthInput): SavingsGrowthResult {
  const initialDeposit = Math.max(0, input.initialDeposit || 0);
  const monthlyContribution = Math.max(0, input.monthlyContribution || 0);
  const ratePercent = Math.max(0, input.annualInterestRate || 0);
  const termMonths = Math.max(1, input.termMonths || 12);
  const frequency = input.compoundingFrequency || "monthly";
  const penaltyMonths = Math.max(0, input.cdEarlyPenaltyMonths || 0);

  // Periods per year
  const periodsPerYear =
    frequency === "daily"
      ? 365
      : frequency === "monthly"
      ? 12
      : frequency === "quarterly"
      ? 4
      : 1;

  // Nominal annual rate r
  const r = ratePercent / 100;
  // Effective APY = (1 + r/n)^n - 1
  const effectiveApy =
    r > 0 ? roundTo((Math.pow(1 + r / periodsPerYear, periodsPerYear) - 1) * 100, 3) : 0;

  let currentBalance = initialDeposit;
  let cumulativeInterest = 0;
  let cumulativeContributions = 0;
  const schedule: SavingsGrowthScheduleRow[] = [];

  // Monthly breakdown simulation
  for (let m = 1; m <= termMonths; m++) {
    const startingBalance = currentBalance;
    // Add contribution at beginning or end of month
    const contribution = monthlyContribution;
    cumulativeContributions = roundTo(cumulativeContributions + contribution, 2);

    // Monthly interest factor based on compounding frequency
    // Effective monthly rate = (1 + r/periodsPerYear)^(periodsPerYear/12) - 1
    const effectiveMonthlyRate = Math.pow(1 + r / periodsPerYear, periodsPerYear / 12) - 1;
    const interest = roundTo((startingBalance + contribution / 2) * effectiveMonthlyRate, 2);

    cumulativeInterest = roundTo(cumulativeInterest + interest, 2);
    currentBalance = roundTo(startingBalance + contribution + interest, 2);

    schedule.push({
      month: m,
      startingBalance,
      contribution,
      interestEarned: interest,
      totalInterestEarned: cumulativeInterest,
      endingBalance: currentBalance,
    });
  }

  // Early withdrawal penalty calculation (e.g. 90 days / 3 months simple interest)
  const monthlyInterestRate = r / 12;
  const earlyWithdrawalPenalty = roundTo(
    currentBalance * monthlyInterestRate * penaltyMonths,
    2
  );
  const netBalanceAfterEarlyPenalty = roundTo(
    Math.max(initialDeposit, currentBalance - earlyWithdrawalPenalty),
    2
  );

  return {
    initialDeposit,
    totalContributions: cumulativeContributions,
    totalInterestEarned: cumulativeInterest,
    finalBalance: currentBalance,
    effectiveApy,
    earlyWithdrawalPenalty,
    netBalanceAfterEarlyPenalty,
    monthlySchedule: schedule,
  };
}

// ==========================================
// 10. US SALARY & TAKE-HOME ENGINE
// ==========================================

export interface UsSalaryInput {
  grossSalary: number;
  filingStatus?: "single" | "married";
  k401ContributionPercent?: number; // 0-100%
  stateTaxPercent?: number; // Estimated state tax rate e.g. 5%
  pretaxDeductionsMonthly?: number; // Health/Dental/FSA
}

export interface UsSalaryResult {
  grossSalary: number;
  monthlyGross: number;
  biWeeklyGross: number;
  socialSecurityTax: number; // 6.2% up to $168,600 wage base cap (2024)
  medicareTax: number; // 1.45% (+ 0.9% additional for wages > $200,000 single / $250,000 married)
  k401Deduction: number;
  federalTaxableIncome: number;
  federalIncomeTax: number;
  stateIncomeTax: number;
  totalAnnualTaxes: number;
  totalAnnualDeductions: number;
  netAnnualTakeHome: number;
  netMonthlyTakeHome: number;
  netBiWeeklyTakeHome: number;
  effectiveTaxRate: number;
}

export function calculateUsSalary(input: UsSalaryInput): UsSalaryResult {
  const grossSalary = Math.max(0, input.grossSalary || 0);
  const filingStatus = input.filingStatus || "single";
  const k401Percent = Math.max(0, Math.min(100, input.k401ContributionPercent || 0));
  const stateTaxPercent = Math.max(0, Math.min(100, input.stateTaxPercent || 0));
  const pretaxDeductionsMonthly = Math.max(0, input.pretaxDeductionsMonthly || 0);

  const monthlyGross = roundTo(grossSalary / 12, 2);
  const biWeeklyGross = roundTo(grossSalary / 26, 2);

  // FICA Taxes
  // Social Security: 6.2% up to $168,600 wage base cap (2024)
  const ssWageCap = 168600;
  const socialSecurityTax = roundTo(Math.min(grossSalary, ssWageCap) * 0.062, 2);

  // Medicare: 1.45% + 0.9% additional for wages > $200k single / $250k married
  const baseMedicare = grossSalary * 0.0145;
  const surtaxThreshold = filingStatus === "married" ? 250000 : 200000;
  const excessIncome = Math.max(0, grossSalary - surtaxThreshold);
  const surtaxMedicare = excessIncome * 0.009;
  const medicareTax = roundTo(baseMedicare + surtaxMedicare, 2);

  // 401(k) and Pre-tax deductions
  const k401Deduction = roundTo(grossSalary * (k401Percent / 100), 2);
  const annualPretaxDeductions = roundTo(pretaxDeductionsMonthly * 12, 2);

  // Standard deduction 2024
  const standardDeduction = filingStatus === "married" ? 29200 : 14600;

  // Federal taxable income: gross minus 401k, pretax deductions, and standard deduction
  const federalTaxableIncome = Math.max(
    0,
    roundTo(grossSalary - k401Deduction - annualPretaxDeductions - standardDeduction, 2)
  );

  // 2024 Federal Tax Brackets
  const singleBrackets = [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ];

  const marriedBrackets = [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ];

  const brackets = filingStatus === "married" ? marriedBrackets : singleBrackets;

  let federalIncomeTaxCalc = 0;
  for (const bracket of brackets) {
    if (federalTaxableIncome > bracket.min) {
      const taxableInBracket = Math.min(federalTaxableIncome, bracket.max) - bracket.min;
      federalIncomeTaxCalc += taxableInBracket * bracket.rate;
    }
  }
  const federalIncomeTax = roundTo(federalIncomeTaxCalc, 2);

  // State Tax
  const stateTaxableIncome = Math.max(0, grossSalary - k401Deduction - annualPretaxDeductions);
  const stateIncomeTax = roundTo(stateTaxableIncome * (stateTaxPercent / 100), 2);

  const totalAnnualTaxes = roundTo(
    socialSecurityTax + medicareTax + federalIncomeTax + stateIncomeTax,
    2
  );
  const totalAnnualDeductions = roundTo(
    totalAnnualTaxes + k401Deduction + annualPretaxDeductions,
    2
  );
  const netAnnualTakeHome = roundTo(
    Math.max(0, grossSalary - totalAnnualDeductions),
    2
  );
  const netMonthlyTakeHome = roundTo(netAnnualTakeHome / 12, 2);
  const netBiWeeklyTakeHome = roundTo(netAnnualTakeHome / 26, 2);
  const effectiveTaxRate =
    grossSalary > 0 ? roundTo((totalAnnualTaxes / grossSalary) * 100, 2) : 0;

  return {
    grossSalary,
    monthlyGross,
    biWeeklyGross,
    socialSecurityTax,
    medicareTax,
    k401Deduction,
    federalTaxableIncome,
    federalIncomeTax,
    stateIncomeTax,
    totalAnnualTaxes,
    totalAnnualDeductions,
    netAnnualTakeHome,
    netMonthlyTakeHome,
    netBiWeeklyTakeHome,
    effectiveTaxRate,
  };
}

