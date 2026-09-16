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
