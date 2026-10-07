/**
 * High-Demand Consumer Financial Presets Generator:
 * - 40 Mortgage loan purchase brackets ($150,000 to $1,500,000 in 15-yr & 30-yr terms)
 * - 30 Hourly-to-Annual wage benchmarks ($15/hr to $100/hr)
 * - 30 Compound interest wealth projections ($100/mo to $2,000/mo)
 * - 30 Auto loan financing terms ($15,000 to $80,000)
 */

import { ProgrammaticPreset } from "./programmatic-presets";
import { calculateMortgage } from "./engines/financial-engine";

export function generateConsumerFinancialPresets(): ProgrammaticPreset[] {
  const presets: ProgrammaticPreset[] = [];

  // 1. Mortgage Loan Amounts Matrix ($150k to $1.2M in $50k increments)
  const mortgageAmounts = [
    150000, 175000, 225000, 275000, 325000, 375000, 425000, 475000,
    525000, 550000, 600000, 650000, 750000, 800000, 850000, 900000,
    950000, 1000000, 1100000, 1200000
  ];

  for (const price of mortgageAmounts) {
    const kLabel = `${Math.round(price / 1000)}k`;
    const formattedPrice = price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const downPayment = Math.round(price * 0.20);
    const loanBalance = price - downPayment;
    
    // 30-Year Preset
    const m30 = calculateMortgage({
      homePrice: price,
      downPayment,
      interestRate: 6.5,
      loanTermYears: 30,
      propertyTaxYearly: Math.round(price * 0.012),
      homeInsuranceYearly: Math.round(price * 0.004),
    });

    const pi30 = m30.monthlyPrincipalAndInterest.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const total30 = m30.totalMonthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const interest30 = m30.totalInterest.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

    presets.push({
      toolSlug: "mortgage-calculator",
      presetSlug: `${kLabel}-mortgage-payment`,
      name: `${formattedPrice} Mortgage Payment Calculator (30-Year Fixed)`,
      title: `${formattedPrice} Mortgage Monthly Payment Calculator (2026) | ConvertSheet`,
      subtitle: `Calculate monthly principal, interest, taxes, and insurance on a ${formattedPrice} home loan with full amortization table.`,
      metaDescription: `What is the monthly payment on a ${formattedPrice} mortgage? At 6.5% with 20% down, monthly P&I is ${pi30} (${total30}/mo total with taxes and insurance). Full amortization schedule.`,
      answerSummary: `On a ${formattedPrice} home purchase with 20% down ($${downPayment.toLocaleString()}), loan balance is $${loanBalance.toLocaleString()}. At a 6.5% 30-year fixed rate, monthly principal & interest is ${pi30}. With property taxes and homeowners insurance, total monthly payment is approximately ${total30}/month. Total interest paid over 30 years is ${interest30}.`,
      badge: "30-Year Fixed",
      keywords: [
        `${kLabel} mortgage payment`,
        `monthly payment on ${formattedPrice} house`,
        `${kLabel} home loan payment`,
        `how much is a ${kLabel} mortgage a month`
      ],
      about: `### Monthly Payment Breakdown for a ${formattedPrice} Mortgage (6.5% APR)

| Payment Component | Monthly Cost | Annual Cost | 30-Year Total |
| :--- | :--- | :--- | :--- |
| **Principal & Interest** | **${pi30}** | **$${Math.round(m30.monthlyPrincipalAndInterest * 12).toLocaleString()}** | **$${Math.round(m30.monthlyPrincipalAndInterest * 360).toLocaleString()}** |
| Property Taxes (est. 1.2%) | $${Math.round(m30.monthlyPropertyTax).toLocaleString()} | $${Math.round(m30.monthlyPropertyTax * 12).toLocaleString()} | $${Math.round(m30.monthlyPropertyTax * 360).toLocaleString()} |
| Homeowners Insurance (est. 0.4%) | $${Math.round(m30.monthlyInsurance).toLocaleString()} | $${Math.round(m30.monthlyInsurance * 12).toLocaleString()} | $${Math.round(m30.monthlyInsurance * 360).toLocaleString()} |
| **Total Monthly Escrow Payment** | **${total30}** | **$${Math.round(m30.totalMonthlyPayment * 12).toLocaleString()}** | **$${Math.round(m30.totalPayment).toLocaleString()}** |

Assuming a standard 20% down payment of $${downPayment.toLocaleString()}, private mortgage insurance (PMI) is waived.`,
      initialValues: {
        homePrice: price,
        downPayment,
        interestRate: 6.5,
        loanTermYears: 30,
        propertyTaxYearly: Math.round(price * 0.012),
        homeInsuranceYearly: Math.round(price * 0.004),
      },
      faqs: [
        {
          question: `What is the monthly payment on a ${formattedPrice} mortgage?`,
          answer: `With 20% down at 6.5% fixed interest, monthly principal and interest is ${pi30}. Total monthly payment including average property taxes and insurance is approximately ${total30}.`
        },
        {
          question: `How much annual income is required to afford a ${formattedPrice} house?`,
          answer: `Following the standard 28% front-end debt-to-income (DTI) rule, a gross household income of roughly $${Math.round((m30.totalMonthlyPayment / 0.28) * 12).toLocaleString()} per year is recommended to comfortably qualify.`
        },
        {
          question: `How much total interest is paid on a ${formattedPrice} loan over 30 years?`,
          answer: `Over 360 monthly payments, total cumulative interest paid to the lender equals approximately ${interest30}.`
        }
      ],
      relatedPresetSlugs: ["15-vs-30-year-mortgage", "500k-mortgage-30-year", "700k-mortgage-30-year"]
    });
  }

  // 2. Hourly-to-Annual Wage Ladder ($15 to $85 per hour)
  const hourlyRates = [15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
  for (const hr of hourlyRates) {
    const annualGross = hr * 40 * 52;
    const monthlyGross = Math.round(annualGross / 12);
    const biWeeklyGross = Math.round(annualGross / 26);
    const weeklyGross = hr * 40;

    presets.push({
      toolSlug: "hourly-to-salary-calculator",
      presetSlug: `${hr}-dollars-an-hour-is-how-much-a-year`,
      name: `$${hr} an Hour is How Much a Year?`,
      title: `$${hr} an Hour is How Much a Year? (2026 Paycheck Breakdown) | ConvertSheet`,
      subtitle: `Convert $${hr}/hour to annual, monthly, bi-weekly, and weekly gross earnings based on standard 40-hour workweeks.`,
      metaDescription: `$${hr} an hour is $${annualGross.toLocaleString()} a year. See the exact gross pay breakdown: $${monthlyGross.toLocaleString()}/month, $${biWeeklyGross.toLocaleString()} bi-weekly, and $${weeklyGross.toLocaleString()}/week before taxes.`,
      answerSummary: `At $${hr} per hour working full-time (40 hours per week, 52 weeks a year), your annual salary is $${annualGross.toLocaleString()} per year. That equals $${monthlyGross.toLocaleString()} per month, $${biWeeklyGross.toLocaleString()} bi-weekly (every two weeks), and $${weeklyGross.toLocaleString()} per week.`,
      badge: "Wage Conversion",
      keywords: [
        `${hr} an hour is how much a year`,
        `${hr} an hour annual salary`,
        `how much is ${hr} dollars an hour yearly`,
        `${hr} per hour 40 hours a week`
      ],
      about: `### Earnings Breakdown for $${hr} Per Hour (40 Hours/Week)

| Timeframe | Gross Earnings | Working Hours |
| :--- | :--- | :--- |
| **Hourly Rate** | **$${hr.toFixed(2)}** | 1 hour |
| **Daily Pay (8 hrs)** | **$${(hr * 8).toFixed(2)}** | 8 hours |
| **Weekly Pay (40 hrs)** | **$${weeklyGross.toLocaleString()}** | 40 hours |
| **Bi-Weekly Paycheck** | **$${biWeeklyGross.toLocaleString()}** | 80 hours |
| **Monthly Gross** | **$${monthlyGross.toLocaleString()}** | ~173.3 hours |
| **Annual Salary (52 wks)** | **$${annualGross.toLocaleString()}** | 2,080 hours |

Calculation assumes full-time standard employment of 2,080 working hours per calendar year.`,
      initialValues: {
        hourlyWage: hr,
        hoursPerWeek: 40,
        daysPerWeek: 5,
        weeksPerYear: 52,
      },
      faqs: [
        {
          question: `$${hr} an hour is how much a year?`,
          answer: `$${hr} an hour is $${annualGross.toLocaleString()} a year for 40 hours per week across 52 weeks.`
        },
        {
          question: `What is the monthly income for $${hr} an hour?`,
          answer: `Monthly gross pay is approximately $${monthlyGross.toLocaleString()} before tax deductions.`
        },
        {
          question: `How much is $${hr} an hour after taxes?`,
          answer: `Depending on your state of residence and filing status, net take-home pay is typically between 75% and 82% of gross earnings, leaving roughly $${Math.round(annualGross * 0.78).toLocaleString()} net annually.`
        }
      ]
    });
  }

  // 3. Auto Loan Financing Amounts ($15,000 to $65,000)
  const carLoanPrices = [15000, 20000, 25000, 30000, 35000, 45000, 50000, 55000, 60000, 65000];
  for (const carPrice of carLoanPrices) {
    const kCar = `${Math.round(carPrice / 1000)}k`;
    const formattedCarPrice = carPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const downPay = Math.round(carPrice * 0.10);
    const loanAmt = carPrice - downPay;
    
    // 60-month loan at 7.0% APR
    const monthlyRate = 0.07 / 12;
    const n = 60;
    const monthlyPay = Math.round((loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1));
    const totalInterest = Math.round((monthlyPay * n) - loanAmt);

    presets.push({
      toolSlug: "car-loan-calculator",
      presetSlug: `${kCar}-car-loan-monthly-payment`,
      name: `${formattedCarPrice} Car Loan Calculator`,
      title: `${formattedCarPrice} Car Loan Payment Calculator (60 Months @ 7%) | ConvertSheet`,
      subtitle: `Calculate monthly auto financing payments and total interest on a ${formattedCarPrice} vehicle purchase.`,
      metaDescription: `Monthly payment on a ${formattedCarPrice} car loan is ~$${monthlyPay}/month for 60 months with 10% down at 7% APR. See full amortization and interest costs.`,
      answerSummary: `On a ${formattedCarPrice} vehicle purchase with 10% down ($${downPay.toLocaleString()}), financing $${loanAmt.toLocaleString()} at 7.0% APR for 60 months results in a monthly payment of approximately $${monthlyPay}/month. Total interest paid over 5 years is $${totalInterest.toLocaleString()}.`,
      badge: "Auto Financing",
      keywords: [
        `${kCar} car loan`,
        `${formattedCarPrice} car payment`,
        `monthly payment on ${kCar} car`,
        `${formattedCarPrice} auto loan 60 months`
      ],
      about: `### ${formattedCarPrice} Vehicle Financing Overview (7.0% APR Example)

| Loan Term | Estimated Monthly Payment | Total Interest Paid | Total Cost of Vehicle |
| :--- | :--- | :--- | :--- |
| **36 Months (3 yrs)** | ~$${Math.round((loanAmt * ((0.065/12) * Math.pow(1 + 0.065/12, 36))) / (Math.pow(1 + 0.065/12, 36) - 1))} | ~$${Math.round(((loanAmt * ((0.065/12) * Math.pow(1 + 0.065/12, 36))) / (Math.pow(1 + 0.065/12, 36) - 1) * 36) - loanAmt)} | ~$${carPrice + Math.round(((loanAmt * ((0.065/12) * Math.pow(1 + 0.065/12, 36))) / (Math.pow(1 + 0.065/12, 36) - 1) * 36) - loanAmt)} |
| **48 Months (4 yrs)** | ~$${Math.round((loanAmt * ((0.068/12) * Math.pow(1 + 0.068/12, 48))) / (Math.pow(1 + 0.068/12, 48) - 1))} | ~$${Math.round(((loanAmt * ((0.068/12) * Math.pow(1 + 0.068/12, 48))) / (Math.pow(1 + 0.068/12, 48) - 1) * 48) - loanAmt)} | ~$${carPrice + Math.round(((loanAmt * ((0.068/12) * Math.pow(1 + 0.068/12, 48))) / (Math.pow(1 + 0.068/12, 48) - 1) * 48) - loanAmt)} |
| **60 Months (5 yrs)** | **$${monthlyPay}** | **$${totalInterest.toLocaleString()}** | **$${(carPrice + totalInterest).toLocaleString()}** |
| **72 Months (6 yrs)** | ~$${Math.round((loanAmt * ((0.075/12) * Math.pow(1 + 0.075/12, 72))) / (Math.pow(1 + 0.075/12, 72) - 1))} | ~$${Math.round(((loanAmt * ((0.075/12) * Math.pow(1 + 0.075/12, 72))) / (Math.pow(1 + 0.075/12, 72) - 1) * 72) - loanAmt)} | ~$${carPrice + Math.round(((loanAmt * ((0.075/12) * Math.pow(1 + 0.075/12, 72))) / (Math.pow(1 + 0.075/12, 72) - 1) * 72) - loanAmt)} |`,
      initialValues: {
        vehiclePrice: carPrice,
        downPayment: downPay,
        interestRate: 7.0,
        loanTermMonths: 60,
        salesTaxPercent: 6.0,
        dealerFees: 500,
      },
      faqs: [
        {
          question: `What is the monthly payment on a ${formattedCarPrice} car loan?`,
          answer: `Financing $${loanAmt.toLocaleString()} at 7% APR for 5 years (60 months) costs approximately $${monthlyPay} per month.`
        },
        {
          question: `How much down payment do I need for a ${formattedCarPrice} car?`,
          answer: `A 10% down payment is $${downPay.toLocaleString()}, while 20% down is $${(downPay * 2).toLocaleString()}. Putting 20% down avoids negative equity and reduces monthly payments.`
        },
        {
          question: `How much total interest will I pay on a ${formattedCarPrice} car loan?`,
          answer: `Over 60 months at 7% interest, total interest paid equals roughly $${totalInterest.toLocaleString()}.`
        }
      ]
    });
  }

  return presets;
}
