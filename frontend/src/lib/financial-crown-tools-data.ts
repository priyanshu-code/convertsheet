import { ToolConfig } from "@/types/tool";

export const FINANCIAL_CROWN_TOOLS: Record<string, ToolConfig> = {
  "mortgage-calculator": {
    slug: "mortgage-calculator",
    name: "Mortgage Calculator & Amortization Schedule",
    category: "financial",
    title: "Mortgage Calculator with Amortization Schedule - SheetJS Excel Export",
    subtitle: "Calculate monthly payments with principal, interest, property taxes, home insurance, and PMI. Export complete month-by-month amortization schedules directly to Excel (.xlsx).",
    metaDescription: "Free online mortgage calculator with complete amortization schedule. Compute monthly PITI payments, model extra principal payoff savings, and export amortization schedules to Excel (.xlsx).",
    answerSummary: "Calculate your exact monthly mortgage payment (P&I, taxes, insurance, PMI), visualize loan payoff over time, and export the complete amortization schedule to Excel (.xlsx) with zero sign-up.",
    badge: "High-CPC Crown Jewel",
    featured: true,
    keywords: [
      "mortgage calculator",
      "mortgage amortization schedule excel",
      "home loan calculator",
      "piti calculator",
      "mortgage payment calculator",
      "amortization schedule export xlsx",
      "extra principal payment calculator",
      "fixed rate mortgage calculator",
    ],
    formulaDescription:
      "Monthly P&I = P * [r(1+r)^n] / [(1+r)^n - 1], where P = Principal Loan Amount, r = Monthly Interest Rate (Annual Rate / 12), and n = Total Number of Payments (Months).",
    about:
      "Purchasing real estate is typically the single largest financial transaction in a person's life. ConvertSheet's Mortgage Calculator computes comprehensive PITI (Principal, Interest, Taxes, and Insurance) plus Private Mortgage Insurance (PMI) for loans with down payments below 20%. Unlike static calculators, this tool allows you to simulate extra monthly principal contributions to calculate interest saved and years shaved off your loan, with instant one-click export of the entire amortization table to Microsoft Excel (.xlsx) using SheetJS.",
    howTo: [
      {
        step: 1,
        title: "Home Price & Down Payment",
        description:
          "Input your target purchase price and down payment amount or percentage.",
      },
      {
        step: 2,
        title: "Loan Terms & Escrows",
        description:
          "Set the fixed interest rate, term length (30, 20, 15, or 10 years), annual property taxes, and homeowners insurance.",
      },
      {
        step: 3,
        title: "Simulate & Export",
        description:
          "Test extra principal payments to see interest savings, inspect the visual payoff balance curve, and download the full amortization schedule to Excel (.xlsx).",
      },
    ],
    faqs: [
      {
        question: "What is included in a PITI mortgage payment?",
        answer:
          "PITI stands for Principal, Interest, Taxes, and Insurance. It represents the comprehensive monthly housing payment escrowed by your mortgage servicer, including local property taxes and hazard insurance.",
      },
      {
        question: "When does PMI (Private Mortgage Insurance) drop off?",
        answer:
          "PMI is automatically required on conventional loans when down payment is under 20% (loan-to-value > 80%). Under the Homeowners Protection Act, PMI drops off automatically once principal amortizes down to 78% of the original purchase value.",
      },
      {
        question: "How does an extra monthly principal payment shorten the loan?",
        answer:
          "Every dollar paid in excess of your required monthly payment directly reduces the outstanding loan balance. Because interest is compounded on the remaining balance, paying extra accelerates equity buildup and saves thousands in cumulative interest.",
      },
      {
        question: "Can I open the exported amortization schedule in Microsoft Excel or Google Sheets?",
        answer:
          "Yes! The exported .xlsx file is fully compatible with Microsoft Excel, Apple Numbers, Google Sheets, and LibreOffice Calc.",
      },
    ],
    relatedConverters: ["excel-to-csv", "csv-to-excel"],
    relatedTools: ["car-loan-calculator", "emi-calculator", "compound-interest-calculator"],
  },

  "car-loan-calculator": {
    slug: "car-loan-calculator",
    name: "Auto & Car Loan Calculator",
    category: "financial",
    title: "Car Loan Calculator — Auto Payment, Trade-In Equity & Amortization",
    subtitle: "Calculate monthly auto loan payments factoring in vehicle purchase price, dealer documentation fees, sales tax, trade-in equity, and down payment.",
    metaDescription: "Calculate monthly car loan payments with trade-in value, dealer doc fees, sales tax, and interest. Download complete amortization schedules to Excel (.xlsx).",
    answerSummary: "Determine your exact monthly auto payment, net amount financed after trade-in equity, sales taxes, dealer fees, and total financing interest costs.",
    badge: "Auto Finance",
    featured: true,
    keywords: [
      "car loan calculator",
      "auto loan calculator",
      "vehicle financing calculator",
      "car payment with trade in",
      "auto loan amortization excel",
      "car monthly payment estimator",
    ],
    formulaDescription:
      "Net Financed = Vehicle Price - Trade-In - Down Payment + (Taxable Amount * Tax Rate) + Dealer Fees. Monthly Payment = P * [r(1+r)^n] / [(1+r)^n - 1].",
    about:
      "Financing a new or used vehicle involves more than just the sticker price. Dealership fees, state sales tax, and trade-in allowances significantly impact your out-the-door loan balance. ConvertSheet's Auto Loan Calculator provides a transparent breakdown of total vehicle cost, financing charges, and yearly loan paydown schedule with full Excel export.",
    howTo: [
      {
        step: 1,
        title: "Vehicle Price & Trade-In",
        description:
          "Enter negotiated vehicle selling price, cash down payment, and positive or negative trade-in value.",
      },
      {
        step: 2,
        title: "Taxes & Dealer Fees",
        description:
          "Input your state/local sales tax percentage and estimated dealer documentation/registration fees.",
      },
      {
        step: 3,
        title: "Finance Terms & Export",
        description:
          "Select your loan term in months (36 to 84 months) and interest rate APR, then export your payment schedule to Excel.",
      },
    ],
    faqs: [
      {
        question: "Does trade-in reduce auto sales tax?",
        answer:
          "In most US states and Canadian provinces, trade-in credit reduces the taxable purchase price. For instance, on a $30,000 vehicle with a $10,000 trade-in, sales tax is only levied on the remaining $20,000 difference.",
      },
      {
        question: "What is an ideal auto loan term length?",
        answer:
          "Financial planners recommend limiting new car loans to 48 or 60 months (and used car loans to 36 or 48 months) to prevent becoming 'upside-down' (owing more than the vehicle's depreciating market value).",
      },
      {
        question: "Can I export my car loan amortization to Excel?",
        answer:
          "Yes, click the 'Export to Excel (.xlsx)' button to download the yearly breakdown of principal, interest, and remaining balance.",
      },
    ],
    relatedConverters: ["excel-to-csv"],
    relatedTools: ["mortgage-calculator", "emi-calculator", "compound-interest-calculator"],
  },

  "retirement-calculator": {
    slug: "retirement-calculator",
    name: "Retirement & 401(k) Nest Egg Calculator",
    category: "financial",
    title: "Retirement Calculator - 401(k) Nest Egg & Safe Drawdown Planner",
    subtitle: "Simulate your retirement nest egg growth with employer 401(k) matching, inflation-adjusted purchasing power, and post-retirement safe withdrawal longevity.",
    metaDescription: "Free online retirement and 401(k) calculator. Model compound accumulation, employer matching, inflation-adjusted future values, and safe withdrawal longevity.",
    answerSummary: "Model pre-retirement compound investment growth with 401(k) employer matching, adjust for inflation purchasing power, and project how many years your nest egg will last in retirement.",
    badge: "Wealth Planner",
    featured: true,
    keywords: [
      "retirement calculator",
      "401k calculator",
      "nest egg calculator",
      "fire calculator",
      "safe withdrawal rate calculator",
      "pension planner",
      "retirement drawdown projection",
    ],
    formulaDescription:
      "Future Value = P(1 + r/12)^(12t) + PMT * [((1 + r/12)^(12t) - 1) / (r/12)]. Real Purchasing Power = Nominal Nest Egg / (1 + i)^t.",
    about:
      "Building a secure retirement requires long-term compounding and disciplined savings. ConvertSheet's Retirement & 401(k) Calculator simulates both sides of retirement: the accumulation phase (growing your assets with monthly contributions and employer matching) and the drawdown phase (spending your portfolio safely throughout your golden years). It factors in expected inflation and returns, allowing you to export your comprehensive multi-decade milestone plan directly to Excel.",
    howTo: [
      {
        step: 1,
        title: "Ages & Starting Assets",
        description:
          "Enter your current age, target retirement age, and existing savings or 401(k)/IRA balances.",
      },
      {
        step: 2,
        title: "Contributions & Returns",
        description:
          "Specify monthly personal contributions, employer match percentage, and expected annual stock market return.",
      },
      {
        step: 3,
        title: "Drawdown & Inflation",
        description:
          "Set desired annual retirement living expenses, conservative post-retirement returns, and inflation rate to inspect your portfolio's longevity curve.",
      },
    ],
    faqs: [
      {
        question: "What is the 4% Safe Withdrawal Rule?",
        answer:
          "Derived from the Trinity Study, the 4% rule suggests that withdrawing 4% of your total retirement portfolio in the first year and adjusting subsequent withdrawals for inflation provides a high probability that your money will last at least 30 years.",
      },
      {
        question: "Why is employer 401(k) matching called an instant 50% or 100% return?",
        answer:
          "When an employer matches 50% or 100% of your contributions up to a cap, you immediately receive guaranteed money on top of your contribution before market returns even begin.",
      },
      {
        question: "What is the difference between nominal and inflation-adjusted nest egg?",
        answer:
          "Nominal nest egg is the raw dollar amount you will see in your account in the future. Inflation-adjusted nest egg reflects what that money will actually buy in terms of today's purchasing power.",
      },
    ],
    relatedConverters: ["csv-to-excel", "excel-to-csv"],
    relatedTools: ["compound-interest-calculator", "sip-calculator", "inflation-calculator"],
  },

  "inflation-calculator": {
    slug: "inflation-calculator",
    name: "Inflation & Purchasing Power Calculator",
    category: "financial",
    title: "Inflation Calculator - Purchasing Power Loss & Future Cost Estimator",
    subtitle: "Calculate how inflation erodes purchasing power over time, and determine the exact future dollar amount needed to maintain your standard of living.",
    metaDescription: "Free online inflation and purchasing power calculator. Calculate future equivalent living costs, cumulative inflation percentages, and purchasing power erosion curves with Excel export.",
    answerSummary: "Calculate how inflation erodes cash purchasing power and determine the exact future dollar amount required to match today's standard of living.",
    badge: "Macroeconomics",
    featured: true,
    keywords: [
      "inflation calculator",
      "purchasing power calculator",
      "cpi inflation calculator",
      "future cost of living",
      "cost of goods inflation",
      "currency depreciation calculator",
    ],
    formulaDescription:
      "Future Equivalent Cost = Today's Amount * (1 + r)^t. Purchasing Power Remaining = Today's Amount / (1 + r)^t.",
    about:
      "Inflation is often called the silent wealth tax because it continually diminishes the purchasing power of idle cash. ConvertSheet's Inflation Calculator illustrates the compounding effect of annual price increases over 1 to 50 years. Compare today's purchasing power with historical US CPI benchmarks (such as the 2% Fed target or historical 3.2% average) and export the year-by-year erosion schedule to Excel (.xlsx).",
    howTo: [
      {
        step: 1,
        title: "Starting Capital",
        description:
          "Enter the initial amount of cash, annual salary, or price of goods today.",
      },
      {
        step: 2,
        title: "Inflation Rate",
        description:
          "Select a preset benchmark (2.0% Fed Target, 3.2% Historical, 5% Elevated) or input a custom rate.",
      },
      {
        step: 3,
        title: "Time Horizon & Schedule",
        description:
          "Adjust the slider from 1 to 50 years to view the erosion curve and download the complete year-by-year table to Excel.",
      },
    ],
    faqs: [
      {
        question: "What is the Rule of 72 for inflation?",
        answer:
          "Divide 72 by the annual inflation rate to find approximately how many years it will take for prices to double (or for purchasing power to be cut in half). At 3% inflation, prices double in ~24 years.",
      },
      {
        question: "How can individuals protect against inflation?",
        answer:
          "Assets historically shown to outpace inflation include broad-market equity index funds (S&P 500), Treasury Inflation-Protected Securities (TIPS), real estate with rental yield escalations, and hard commodities.",
      },
      {
        question: "What is the difference between CPI and Core CPI?",
        answer:
          "CPI (Consumer Price Index) measures the broad price change of a basket of consumer goods and services. Core CPI excludes volatile food and energy sectors to provide a more stable reading of underlying macroeconomic inflation trends.",
      },
    ],
    relatedConverters: ["excel-to-csv"],
    relatedTools: ["retirement-calculator", "compound-interest-calculator", "salary-calculator"],
  },

  "hourly-to-salary-calculator": {
    slug: "hourly-to-salary-calculator",
    name: "Hourly to Salary Calculator",
    category: "financial",
    title: "Hourly to Salary Calculator - Convert Hourly Wage to Annual & Monthly Pay",
    subtitle: "Convert your hourly wage into annual salary, monthly pay, bi-weekly, weekly, and daily paycheck intervals with paid time off and overtime adjustments.",
    metaDescription: "Free online hourly to salary calculator. Convert hourly rate ($15, $20, $25, $30, $50/hr) into annual salary, monthly gross pay, and bi-weekly paychecks with Excel export.",
    answerSummary: "Multiply your hourly wage by hours worked per week, then multiply by weeks worked per year. For standard full-time (40 hrs/wk, 52 wks/yr = 2,080 hours), multiply your hourly rate by 2,080. E.g., $25/hour equals $52,000/year or $4,333.33/month.",
    badge: "Omni Favorite",
    featured: true,
    keywords: [
      "hourly to salary calculator",
      "hourly to annual salary",
      "hourly to monthly pay",
      "wage to salary converter",
      "how much is 25 an hour annually",
      "how much is 20 an hour a year",
      "bi weekly paycheck from hourly rate",
      "overtime wage calculator",
    ],
    formulaDescription:
      "Annual Salary = (Hourly Rate * Regular Hours/Week * Weeks/Year) + (Overtime Rate * Overtime Hours/Week * Weeks/Year). Monthly = Annual / 12. Bi-Weekly = Annual / 26.",
    about:
      "Evaluating job offers or requesting a raise requires knowing exactly what an hourly wage translates to on a monthly or annual budget. ConvertSheet's Hourly to Salary Calculator computes earnings across every standard payroll interval: daily, weekly, bi-weekly (26 pay periods), semi-monthly (24 pay periods), monthly, and annual gross pay. Adjust for unpaid time off, paid holidays, and overtime hours (1.5x) with instant export of your entire paycheck schedule to Microsoft Excel (.xlsx).",
    howTo: [
      {
        step: 1,
        title: "Input Hourly Wage",
        description:
          "Enter your base hourly pay rate (e.g. $25/hour) using the input field or interactive slider.",
      },
      {
        step: 2,
        title: "Set Working Schedule",
        description:
          "Configure standard hours worked per week (default 40) and active working weeks per year (default 52).",
      },
      {
        step: 3,
        title: "Adjust Overtime & Export",
        description:
          "Add optional overtime hours to see immediate paycheck increases and download your custom payroll breakdown table to Excel.",
      },
    ],
    faqs: [
      {
        question: "How do you calculate salary from hourly wage?",
        answer:
          "For standard full-time employment (40 hours/week, 52 weeks/year = 2,080 working hours annually), simply multiply your hourly rate by 2,080. For example, $30/hour * 2,080 = $62,400/year.",
      },
      {
        question: "How many working hours are in a standard year?",
        answer:
          "A standard 40-hour work week across 52 weeks contains 2,080 working hours. If you take 2 weeks of unpaid leave, your working hours equal 2,000 hours per year.",
      },
      {
        question: "What is the difference between bi-weekly and semi-monthly pay?",
        answer:
          "Bi-weekly pay occurs every two weeks (resulting in 26 paychecks per year, including two months with three paychecks). Semi-monthly pay occurs twice per month on fixed dates like the 1st and 15th (resulting in 24 paychecks per year).",
      },
    ],
    relatedConverters: ["excel-to-csv", "csv-to-excel"],
    relatedTools: ["annual-to-hourly-calculator", "salary-calculator", "income-tax-calculator"],
  },

  "annual-to-hourly-calculator": {
    slug: "annual-to-hourly-calculator",
    name: "Annual to Hourly Calculator",
    category: "financial",
    title: "Annual to Hourly Salary Calculator - Convert Yearly Income to Hourly Wage",
    subtitle: "Convert your annual gross salary into an equivalent hourly wage, daily earnings, weekly salary, and monthly paycheck with custom work hours and unpaid leave.",
    metaDescription: "Free online annual to hourly calculator. Convert yearly salary ($50k, $75k, $100k, $150k) to hourly wage, monthly pay, and bi-weekly paychecks with instant Excel export.",
    answerSummary: "Divide your annual salary by your total working hours in a year (standard 2,080 hours for 40h/week, 52 weeks/year). E.g., a $100,000 annual salary converts to $48.08/hour, $384.62/day, or $8,333.33/month.",
    badge: "Popular Utility",
    featured: true,
    keywords: [
      "annual to hourly calculator",
      "salary to hourly converter",
      "yearly salary to hourly wage",
      "how much is 100k a year hourly",
      "how much is 75k a year per hour",
      "convert 50000 salary to hourly",
      "salary to daily rate calculator",
    ],
    formulaDescription:
      "Hourly Wage = Annual Salary / (Hours per Week * Weeks per Year - Unpaid Leave Hours). Monthly = Annual / 12.",
    about:
      "When comparing salaried employment offers with 1099 independent contracting or hourly freelance roles, knowing your true equivalent hourly wage is crucial. ConvertSheet's Annual to Hourly Calculator translates your yearly compensation into accurate hourly, daily, weekly, bi-weekly, and monthly wages. Model the impact of unpaid time off or non-standard work weeks (e.g. 35 or 45 hours) and export your full compensation breakdown to Excel (.xlsx).",
    howTo: [
      {
        step: 1,
        title: "Enter Annual Salary",
        description:
          "Input your gross yearly salary (e.g. $75,000) using the numeric input or responsive slider.",
      },
      {
        step: 2,
        title: "Configure Work Schedule",
        description:
          "Set your expected hours per week (typically 40) and working weeks per year (typically 52).",
      },
      {
        step: 3,
        title: "Review & Export",
        description:
          "Instantly view your equivalent hourly rate, daily earnings, and export the entire paycheck comparison to Excel.",
      },
    ],
    faqs: [
      {
        question: "How much is $100,000 a year hourly?",
        answer:
          "At a standard full-time schedule of 40 hours per week (2,080 hours/year), a $100,000 annual salary equals approximately $48.08 per hour.",
      },
      {
        question: "How do I calculate my hourly rate from salary?",
        answer:
          "Divide your annual salary by 2,080 (40 hours * 52 weeks). For quick estimation in your head, drop the last three zeros and divide by 2: a $60,000 salary is roughly $30/hour.",
      },
      {
        question: "Does salary include paid vacation days?",
        answer:
          "Yes, standard exempt salary packages include paid time off (PTO) and paid holidays within the 52-week annual compensation. If taking unpaid leave, your effective hourly rate increases because you work fewer total hours for the base salary.",
      },
    ],
    relatedConverters: ["excel-to-json", "excel-to-csv"],
    relatedTools: ["hourly-to-salary-calculator", "salary-calculator", "mortgage-calculator"],
  },
  "debt-payoff-calculator": {
    slug: "debt-payoff-calculator",
    name: "Debt Payoff & Credit Card Payoff Calculator",
    category: "financial",
    title: "Debt Payoff Calculator: Snowball vs Avalanche with Excel Export",
    subtitle: "Accelerate debt elimination using Debt Avalanche or Debt Snowball strategies. Simulate monthly extra payments and export full payoff amortization schedules to Excel.",
    metaDescription: "Free debt payoff and credit card payoff calculator. Compare Debt Avalanche vs Snowball methods, calculate interest savings, and export amortization schedules to Excel (.xlsx).",
    answerSummary: "Compare Debt Avalanche (saves the most interest) and Debt Snowball (fast psychological wins). Simulate adding an extra monthly accelerator payment and export your full schedule to Excel.",
    badge: "High-Intent Financial Tool",
    featured: true,
    keywords: [
      "debt payoff calculator",
      "credit card payoff calculator",
      "debt avalanche calculator",
      "debt snowball calculator",
      "debt consolidation payoff excel",
      "credit card interest calculator",
      "accelerated debt payoff schedule",
    ],
    formulaDescription:
      "Avalanche sorts by highest APR descending; Snowball sorts by lowest balance ascending. Freed minimum payments rollover automatically into the next target debt.",
    about:
      "Eliminating high-interest consumer debt and credit card balances is one of the highest risk-adjusted returns on capital available. ConvertSheet's Debt Payoff Calculator models your complete debt elimination journey. Switch seamlessly between Debt Avalanche (mathematically optimal, minimizing total interest) and Debt Snowball (behaviorally motivating, maximizing quick wins), simulate custom extra monthly payments, and export your entire month-by-month payoff schedule to Microsoft Excel (.xlsx).",
    howTo: [
      {
        step: 1,
        title: "List Your Debts",
        description:
          "Enter your credit card balances, APR interest rates, and current minimum monthly payments.",
      },
      {
        step: 2,
        title: "Choose Payoff Strategy",
        description:
          "Select Debt Avalanche (highest interest rate first) or Debt Snowball (lowest balance first).",
      },
      {
        step: 3,
        title: "Set Extra Accelerator & Export",
        description:
          "Adjust your extra monthly payment amount, review interest saved and months shaved off, and export the schedule to Excel.",
      },
    ],
    faqs: [
      {
        question: "What is the difference between Debt Avalanche and Debt Snowball?",
        answer:
          "Debt Avalanche targets debts with the highest interest rate (APR) first, which saves you the maximum amount of money in total interest. Debt Snowball targets debts with the smallest balance first, giving you faster psychological wins as accounts reach zero.",
      },
      {
        question: "How does the debt rollover (snowball effect) work?",
        answer:
          "When an individual debt or card is paid off, its required minimum payment is not spent—it is automatically rolled over and added to the payment of the next priority debt, accelerating your progress exponentially over time.",
      },
      {
        question: "Can I download the payoff schedule into Microsoft Excel or Google Sheets?",
        answer:
          "Yes! Click 'Export Payoff Amortization (.xlsx)' to download your complete month-by-month balance breakdown and payoff milestone dates.",
      },
    ],
    relatedConverters: ["excel-to-csv", "csv-to-excel"],
    relatedTools: ["mortgage-calculator", "car-loan-calculator", "hourly-to-salary-calculator"],
  },
  "high-yield-savings-cd-calculator": {
    slug: "high-yield-savings-cd-calculator",
    name: "High-Yield Savings & CD Calculator",
    category: "financial",
    title: "High-Yield Savings & CD Compound Calculator - APY & Early Penalty",
    subtitle: "Compare liquid High-Yield Savings Accounts (HYSA) against Certificate of Deposit (CD) fixed rates. Model daily vs monthly compounding and export growth schedules to Excel.",
    metaDescription: "Free High-Yield Savings (HYSA) and CD calculator. Calculate APY compounding growth, test early withdrawal penalties, and export amortization schedules to Excel (.xlsx).",
    answerSummary: "Model compounding interest for High-Yield Savings Accounts and CDs with daily or monthly compounding. Simulate monthly deposits, APY vs APR yields, and early withdrawal penalties with Excel export.",
    badge: "Wealth Growth Engine",
    featured: true,
    keywords: [
      "high yield savings calculator",
      "cd calculator",
      "certificate of deposit calculator",
      "hysa calculator",
      "apy compound calculator",
      "cd early withdrawal penalty calculator",
      "savings interest calculator excel",
    ],
    formulaDescription:
      "Compound Interest: A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)], where n is compounding frequency per year.",
    about:
      "In a high-interest rate environment, holding idle cash in a traditional bank account paying 0.01% incurs massive purchasing power erosion. ConvertSheet's High-Yield Savings & CD Calculator models your cash yields across both liquid savings accounts and fixed-term CDs. Compare daily versus monthly compounding, test the financial cost of CD early withdrawal penalties (typically 90 to 180 days simple interest), and export your entire month-by-month compounding schedule directly to Microsoft Excel (.xlsx).",
    howTo: [
      {
        step: 1,
        title: "Select Account Type",
        description:
          "Choose between High-Yield Savings (HYSA, supporting monthly recurring deposits) or CD (lump-sum deposit with fixed maturity lockup).",
      },
      {
        step: 2,
        title: "Enter Principal & APY",
        description:
          "Set your initial deposit amount, expected annual APY / APR percentage, and compounding frequency (daily, monthly, quarterly, or annually).",
      },
      {
        step: 3,
        title: "Model Horizon & Export",
        description:
          "Adjust your term length (from 6 months to 5 years), inspect the early withdrawal penalty impact, and download the full schedule to Excel.",
      },
    ],
    faqs: [
      {
        question: "What is the difference between APR and APY?",
        answer:
          "APR (Annual Percentage Rate) reflects the simple annual interest rate without compounding. APY (Annual Percentage Yield) reflects the true annual return taking into account how often interest compounds (daily or monthly), meaning APY is always slightly higher than APR.",
      },
      {
        question: "How do CD early withdrawal penalties work?",
        answer:
          "If you withdraw funds from a Certificate of Deposit before its maturity date, financial institutions penalize you by forfeiting a set number of months of interest (commonly 90 days for short-term CDs or 180 days for multi-year CDs), deducted from earned interest or principal.",
      },
      {
        question: "Is daily compounding significantly better than monthly compounding?",
        answer:
          "Daily compounding yields slightly more interest because accrued interest begins earning its own interest 24 hours later rather than at the end of each month. On a $10,000 balance at 5.0% APY, the difference is approximately $1 to $2 per year.",
      },
    ],
    relatedConverters: ["excel-to-csv", "csv-to-excel"],
    relatedTools: ["mortgage-calculator", "retirement-calculator", "inflation-calculator"],
  },
  "uk-salary-calculator": {
    slug: "uk-salary-calculator",
    name: "UK Salary & Take-Home Pay Calculator",
    category: "financial",
    title: "UK Salary & Take-Home Pay Calculator (2024/25 HMRC PAYE & NI)",
    subtitle: "Calculate your exact UK net take-home pay under 2024/25 HMRC tax bands, 8% National Insurance rates, workplace pensions, and Student Loan repayment plans.",
    metaDescription: "Free UK salary & take-home pay calculator (2024/25). Compute HMRC PAYE income tax, 8% Class 1 National Insurance, Student Loan repayments (Plans 1, 2, 4, 5, PG), workplace pensions, and export your monthly payslip schedule to Excel.",
    answerSummary: "Accurately calculate your 2024/25 UK net take-home salary after HMRC PAYE Income Tax, Class 1 National Insurance (8%), student loans, and salary sacrifice workplace pensions.",
    badge: "HMRC 2024/25",
    featured: true,
    keywords: [
      "uk salary calculator",
      "take home pay calculator uk",
      "paye calculator",
      "hmrc tax calculator",
      "uk wage calculator",
      "national insurance calculator 2024",
      "student loan repayment calculator uk",
      "uk salary after tax excel",
    ],
    formulaDescription:
      "Taxable Income = Gross Salary - Pension Contribution - Personal Allowance (£12,570, tapering by £1 for every £2 earned above £100,000). PAYE Tax: 20% on basic rate (£0 - £37,700), 40% on higher rate, 45% on additional rate (> £125,140). Class 1 NI: 8% on £12,570 to £50,270, 2% above £50,270.",
    about:
      "Navigating United Kingdom personal taxation requires accounting for recent statutory changes, including the reduction of employee National Insurance to 8%, the Personal Allowance freeze at £12,570, the aggressive 60% effective marginal tax trap between £100,000 and £125,140 due to Personal Allowance tapering, and various Student Loan repayment plans. ConvertSheet's UK Salary Calculator accurately models your HMRC PAYE liabilities, workplace pension contributions, and net monthly take-home pay with zero data retention and instant Excel spreadsheet export.",
    howTo: [
      {
        step: 1,
        title: "Enter Annual Salary",
        description:
          "Type your gross annual base salary before tax in GBP (£) or pick one of the quick presets.",
      },
      {
        step: 2,
        title: "Configure Pension & Student Loans",
        description:
          "Set your pre-tax auto-enrolment workplace pension contribution percentage (0–15%) and choose your Student Loan plan (Plan 1, Plan 2, Plan 4 Scotland, Plan 5, or Postgraduate).",
      },
      {
        step: 3,
        title: "Inspect Payslip & Export",
        description:
          "Review your net annual, monthly, and weekly take-home pay, examine the tax breakdown chart, and export the complete payslip breakdown to Microsoft Excel (.xlsx).",
      },
    ],
    faqs: [
      {
        question: "What is the 2024/25 employee National Insurance rate in the UK?",
        answer:
          "Following the Spring Budget, the main employee Class 1 National Insurance rate was reduced to 8% on earnings between the Primary Threshold (£12,570/yr or £1,048/mo) and the Upper Earnings Limit (£50,270/yr or £4,189/mo). Earnings above £50,270 are taxed at 2%.",
      },
      {
        question: "How does the £100k Personal Allowance taper work?",
        answer:
          "Your £12,570 tax-free Personal Allowance reduces by £1 for every £2 of adjusted net income over £100,000. It reaches zero at £125,140. This creates an effective marginal tax rate of 60% (40% higher rate tax + 20% loss of allowance) on income in this bracket.",
      },
      {
        question: "How are UK Student Loan deductions calculated?",
        answer:
          "Repayments are calculated on income above plan-specific statutory thresholds: Plan 1 (9% above £24,990), Plan 2 (9% above £27,295), Plan 4 Scotland (9% above £31,395), Plan 5 (9% above £25,000), and Postgraduate Loans (6% above £21,000).",
      },
    ],
    relatedConverters: ["excel-to-csv", "csv-to-excel"],
    relatedTools: [
      "salary-calculator",
      "canada-paycheck-calculator",
      "australia-pay-calculator",
      "hourly-to-salary-calculator",
    ],
  },
  "canada-paycheck-calculator": {
    slug: "canada-paycheck-calculator",
    name: "Canada Paycheck & Salary Take-Home Calculator",
    category: "financial",
    title: "Canada Paycheck & Salary Calculator (2024 CRA Federal & Provincial)",
    subtitle: "Calculate your Canadian net paycheck across Ontario, British Columbia, Alberta, and Quebec with 2024 CRA tax brackets, CPP/CPP2, EI premiums, and RRSP deductions.",
    metaDescription: "Free Canada paycheck & salary take-home calculator (2024). Calculate CRA Federal and Provincial income taxes, CPP/CPP2 caps, EI statutory deductions, RRSP tax savings, and export bi-weekly pay stubs to Excel.",
    answerSummary: "Accurately compute your net Canadian paycheck across Ontario, BC, Alberta, and Quebec. Includes 2024 CRA progressive brackets, Canada Pension Plan (CPP & CPP2 tier), Employment Insurance (EI), and RRSP deductions.",
    badge: "CRA 2024",
    featured: true,
    keywords: [
      "canada paycheck calculator",
      "canadian salary calculator",
      "cra tax calculator",
      "take home pay ontario",
      "take home pay bc",
      "cpp ei deduction calculator",
      "canadian biweekly paycheck calculator",
      "canada salary after tax excel",
    ],
    formulaDescription:
      "Net Pay = Gross Pay - Federal Tax - Provincial Tax - CPP/CPP2 - EI - RRSP. CRA Federal Tax: 15% on first $55,867, 20.5% up to $111,733, 26% up to $173,205, 29% up to $246,752, 33% above. Basic Personal Amount non-refundable tax credit applied federally ($15,705) and provincially.",
    about:
      "Canadian payroll deductions involve multiple government jurisdictions: the Canada Revenue Agency (CRA) for Federal progressive income tax, provincial ministries of finance (such as Ontario, BC, Alberta, or Revenu Québec), the Canada Pension Plan (with the newly introduced CPP2 second earnings ceiling in 2024), and Employment Insurance (EI) statutory premiums. ConvertSheet's Canada Paycheck Calculator accurately computes each deduction and determines your net bi-weekly, semi-monthly, and annual take-home pay with 1-click Excel export.",
    howTo: [
      {
        step: 1,
        title: "Input Gross Annual Salary",
        description:
          "Type your gross Canadian base salary in CAD ($) or select one of the quick preset buttons.",
      },
      {
        step: 2,
        title: "Select Province & RRSP Contribution",
        description:
          "Choose your province of residence (Ontario, British Columbia, Alberta, or Quebec) and adjust your pre-tax RRSP savings slider.",
      },
      {
        step: 3,
        title: "Review Pay Schedule & Export",
        description:
          "View your bi-weekly (26 pay periods) and semi-monthly (24 pay periods) net paycheck, see the visual tax distribution chart, and download your pay stub summary to Excel (.xlsx).",
      },
    ],
    faqs: [
      {
        question: "What is the new CPP2 second earnings ceiling introduced in 2024?",
        answer:
          "Starting January 1, 2024, the CRA introduced a second earnings ceiling (CPP2). Employees earning between the maximum pensionable earnings ($68,500) and the additional ceiling ($73,200) contribute an additional 4% (capped at $188.00 in 2024) to enhance future retirement benefits.",
      },
      {
        question: "How do RRSP contributions reduce Canadian income tax?",
        answer:
          "Registered Retirement Savings Plan (RRSP) contributions are deducted directly from your gross income prior to calculating both Federal and Provincial income taxes. This lowers your taxable income into lower marginal tax brackets and increases your take-home tax savings.",
      },
      {
        question: "Why do bi-weekly paychecks differ from semi-monthly paychecks in Canada?",
        answer:
          "Bi-weekly pay occurs every two weeks, resulting in 26 pay periods per year (including two months with three paychecks). Semi-monthly pay occurs twice per month (e.g. the 15th and last day of the month), resulting in exactly 24 pay periods per year.",
      },
    ],
    relatedConverters: ["excel-to-csv", "csv-to-excel"],
    relatedTools: [
      "salary-calculator",
      "uk-salary-calculator",
      "australia-pay-calculator",
      "hourly-to-salary-calculator",
    ],
  },
  "australia-pay-calculator": {
    slug: "australia-pay-calculator",
    name: "Australia Pay & Salary Take-Home Calculator",
    category: "financial",
    title: "Australia Pay & Salary Calculator (2024-25 ATO Stage 3 Tax Cuts)",
    subtitle: "Calculate your Australian net take-home pay under 2024-25 ATO Stage 3 tax cuts, 2% Medicare levy, 11.5% Superannuation Guarantee, and HELP/HECS debt repayments.",
    metaDescription: "Free Australia pay & salary take-home calculator (2024-25). Calculate ATO Stage 3 income tax cuts, 2% Medicare levy, 11.5% superannuation guarantee, HELP/HECS student debt repayments, and export fortnightly pay summaries to Excel.",
    answerSummary: "Accurately calculate your 2024-25 Australian net take-home salary. Features the newly enacted ATO Stage 3 tax cuts, 2% Medicare levy, 11.5% compulsory superannuation guarantee, and statutory HELP/HECS debt repayment tiers.",
    badge: "ATO 2024-25",
    featured: true,
    keywords: [
      "australia pay calculator",
      "australian salary calculator",
      "ato tax calculator 2024-25",
      "stage 3 tax cuts calculator",
      "take home pay australia",
      "hecs repayment calculator",
      "medicare levy calculator",
      "australia fortnightly pay calculator",
    ],
    formulaDescription:
      "Stage 3 Tax Cuts (2024-25): $0-$18,200: Nil; $18,201-$45,000: 16%; $45,001-$135,000: 30%; $135,001-$190,000: 37%; >$190,000: 45%. Medicare Levy: 2% of taxable income. Employer Superannuation Guarantee: 11.5% of ordinary time earnings.",
    about:
      "From 1 July 2024, the Australian Taxation Office (ATO) enacted the revised Stage 3 tax cuts, significantly restructuring individual income tax brackets: lowering the 19% rate to 16%, expanding the 30% threshold up to $135,000, and adjusting the top thresholds. In addition, employers are legally required to contribute 11.5% into your superannuation fund. ConvertSheet's Australia Pay Calculator models all ATO statutory obligations, HELP/HECS repayment tiers, and Medicare levy charges to provide your exact fortnightly, monthly, and annual take-home pay.",
    howTo: [
      {
        step: 1,
        title: "Enter Gross Annual Salary",
        description:
          "Type your annual base salary in AUD ($) or click one of the quick preset benchmarks ($60k, $90k, $130k, $180k).",
      },
      {
        step: 2,
        title: "Set Super & Student Debt",
        description:
          "Verify the statutory 11.5% Superannuation rate and toggle the HELP / HECS student debt repayment or Medicare levy exemption checkboxes.",
      },
      {
        step: 3,
        title: "Inspect Fortnightly Pay & Export",
        description:
          "Check your net fortnightly pay (26 pay periods standard in Australia), review employer super contributions, and download your full pay summary to Excel (.xlsx).",
      },
    ],
    faqs: [
      {
        question: "What are the new ATO Stage 3 tax cuts for 2024-25?",
        answer:
          "Effective 1 July 2024, the ATO Stage 3 tax cuts reduced the lowest rate from 19% to 16% (for earnings between $18,200 and $45,000), set the next bracket to 30% (from $45,000 to $135,000), 37% (from $135,000 to $190,000), and 45% for earnings above $190,000.",
      },
      {
        question: "What is the Australian Superannuation Guarantee rate for 2024-25?",
        answer:
          "The statutory Superannuation Guarantee (SG) increased to 11.5% on 1 July 2024. Employers must pay this percentage of your ordinary time earnings directly into your chosen super fund on top of your standard base salary.",
      },
      {
        question: "How do HELP / HECS student debt repayments work?",
        answer:
          "HELP/HECS repayments are automatically withheld by employers based on your worldwide taxable income. For 2024-25, repayments begin at 1.0% once income exceeds $54,435 and progressively scale up to a maximum rate of 10.0% for incomes of $159,664 and above.",
      },
    ],
    relatedConverters: ["excel-to-csv", "csv-to-excel"],
    relatedTools: [
      "salary-calculator",
      "uk-salary-calculator",
      "canada-paycheck-calculator",
      "hourly-to-salary-calculator",
    ],
  },
};
