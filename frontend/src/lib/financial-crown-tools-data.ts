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
    title: "Car Loan Calculator - Auto Financing, Trade-In & Taxes",
    subtitle: "Calculate monthly auto loan payments factoring in vehicle purchase price, dealer documentation fees, sales tax, trade-in equity, and down payment.",
    metaDescription: "Free online car loan calculator. Calculate monthly auto financing payments with trade-in value, dealer doc fees, sales tax, and download repayment schedules to Excel.",
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
};
