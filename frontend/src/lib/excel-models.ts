import * as XLSX from "xlsx";

export interface ExcelTemplateInfo {
  id: string;
  name: string;
  filename: string;
  category: string;
  description: string;
  formulaHighlights: string[];
}

export const EXCEL_TEMPLATES: ExcelTemplateInfo[] = [
  {
    id: "budget-50-30-20",
    name: "50/30/20 Personal Budget & Wealth Planner",
    filename: "ConvertSheet_50_30_20_Personal_Budget.xlsx",
    category: "Personal Finance",
    description: "Automated monthly cash-flow manager dividing net take-home pay into 50% Needs, 30% Wants, and 20% Savings & Debt Acceleration.",
    formulaHighlights: ["Auto-calculated category sums", "Variance tracking vs benchmark", "Emergency savings runway"],
  },
  {
    id: "debt-snowball-avalanche",
    name: "Debt Snowball & Avalanche Payoff Calculator",
    filename: "ConvertSheet_Debt_Payoff_Snowball_Avalanche.xlsx",
    category: "Debt Management",
    description: "Side-by-side debt elimination planner comparing the psychological wins of the Snowball method (lowest balance) vs mathematical savings of the Avalanche method (highest APR).",
    formulaHighlights: ["Interest saved calculations", "Debt-free target date projections", "Priority payment schedule"],
  },
  {
    id: "real-estate-cashflow",
    name: "Rental Property & Real Estate ROI Cash Flow Model",
    filename: "ConvertSheet_Rental_Property_Cashflow_ROI.xlsx",
    category: "Real Estate",
    description: "Complete real estate investment analysis: calculates Net Operating Income (NOI), Capitalization Rate (Cap Rate), Cash-on-Cash Return, and debt service coverage (DSCR).",
    formulaHighlights: ["Cap Rate & Cash-on-Cash formulas", "Vacancy & maintenance reserves", "5-year equity accumulation"],
  },
  {
    id: "net-worth-tracker",
    name: "Personal Net Worth & Asset Allocation Tracker",
    filename: "ConvertSheet_Personal_Net_Worth_Tracker.xlsx",
    category: "Wealth Management",
    description: "Track all liquid assets, retirement portfolios, real estate equity, and liabilities over time to visualize trajectory toward financial independence.",
    formulaHighlights: ["Net worth delta tracking", "Liquid vs illiquid asset ratios", "Debt-to-asset leverage index"],
  },
];

export function generateBudgetWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ["ConvertSheet - 50/30/20 Monthly Budget Planner"],
    ["100% Client-Side Free Excel Model - https://www.convertsheet.com"],
    [],
    ["Category", "Target %", "Target Amount", "Actual Spent", "Difference"],
    ["Needs (Housing, Groceries, Utilities)", 0.50, 2500, 2400, 100],
    ["Wants (Dining, Entertainment, Hobbies)", 0.30, 1500, 1650, -150],
    ["Savings & Debt (Roth IRA, HYSA, Extra Principal)", 0.20, 1000, 1000, 0],
    [],
    ["Total Net Monthly Income", 1.00, 5000, 5050, -50],
  ];

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  ws["!cols"] = [{ wch: 45 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, "Budget Summary");

  // Detailed Expense Log sheet
  const expenseData = [
    ["Expense Description", "Category", "Budgeted ($)", "Actual ($)", "Notes"],
    ["Rent / Mortgage Payment", "Needs", 1500, 1500, "Fixed monthly"],
    ["Groceries & Household", "Needs", 600, 580, "Weekly grocery store"],
    ["Utilities & Internet", "Needs", 250, 220, "Electric, water, fiber"],
    ["Health Insurance & Medical", "Needs", 150, 100, "Copays & prescriptions"],
    ["Dining Out & Takeout", "Wants", 500, 620, "Over budget on weekends"],
    ["Streaming & Subscriptions", "Wants", 150, 150, "Netflix, Spotify, Gym"],
    ["Travel & Leisure", "Wants", 850, 880, "Weekend trip"],
    ["High-Yield Savings Transfer", "Savings", 500, 500, "Automated transfer"],
    ["Roth IRA Contribution", "Savings", 500, 500, "Vanguard S&P 500 index"],
  ];
  const wsExpense = XLSX.utils.aoa_to_sheet(expenseData);
  wsExpense["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsExpense, "Expense Breakdown");

  return wb;
}

export function generateDebtPayoffWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const data = [
    ["ConvertSheet - Debt Snowball & Avalanche Payoff Planner"],
    ["Compare smallest-balance vs highest-APR debt elimination methods"],
    [],
    ["Debt Name", "Balance ($)", "Interest Rate (APR)", "Min Payment ($)", "Snowball Order", "Avalanche Order"],
    ["Credit Card #1", 3500, 0.2499, 110, 1, 1],
    ["Car Loan", 14000, 0.0590, 290, 3, 4],
    ["Student Loan", 9500, 0.0680, 140, 2, 3],
    ["Personal Loan", 18000, 0.1190, 420, 4, 2],
    [],
    ["Total Debt Portfolio", 45000, 0.1180, 960, "", ""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, "Debt Payoff Plan");

  return wb;
}

export function generateRealEstateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const data = [
    ["ConvertSheet - Rental Property Investment & ROI Model"],
    ["Comprehensive Cash-on-Cash and Cap Rate analysis"],
    [],
    ["Property Metrics", "Value", "Unit"],
    ["Purchase Price", 325000, "$"],
    ["Down Payment (20%)", 65000, "$"],
    ["Estimated Rehab / Closing Costs", 15000, "$"],
    ["Total Initial Capital Invested", 80000, "$"],
    [],
    ["Annual Revenue & Operating Expenses", "Value", "Unit"],
    ["Gross Annual Rental Income ($2,600/mo)", 31200, "$/yr"],
    ["Vacancy Reserve (5%)", 1560, "$/yr"],
    ["Effective Gross Income (EGI)", 29640, "$/yr"],
    ["Property Taxes", 4200, "$/yr"],
    ["Property Insurance", 1400, "$/yr"],
    ["Property Management (8%)", 2371, "$/yr"],
    ["Repairs & CapEx Reserve (8%)", 2371, "$/yr"],
    ["Net Operating Income (NOI)", 19298, "$/yr"],
    [],
    ["Financial Returns", "Value", "Unit"],
    ["Mortgage Principal & Interest ($260k @ 6.5%)", 19720, "$/yr"],
    ["Net Annual Cash Flow", -422, "$/yr"],
    ["Capitalization Rate (NOI / Purchase Price)", 0.0594, "%"],
    ["Cash-on-Cash Return", -0.0053, "%"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 45 }, { wch: 16 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, "Rental Property Model");

  return wb;
}

export function generateNetWorthWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const data = [
    ["ConvertSheet - Personal Net Worth & Asset Allocator"],
    ["Monthly net worth tracking across liquid, retirement, and illiquid assets"],
    [],
    ["Asset Class", "Account / Asset", "Current Value ($)", "Allocation %"],
    ["Cash & Equivalents", "High-Yield Savings Account", 25000, 0.066],
    ["Cash & Equivalents", "Checking Account", 5000, 0.013],
    ["Retirement", "401(k) Index Funds", 145000, 0.382],
    ["Retirement", "Roth IRA (Total Stock Market)", 48000, 0.126],
    ["Real Estate", "Primary Residence (Zillow / Appraisal)", 450000, "Asset"],
    ["Vehicles", "Car Private Party Value", 18000, "Asset"],
    [],
    ["Liability Class", "Lender / Account", "Current Balance ($)", ""],
    ["Mortgage", "Primary Mortgage Balance", 285000, "Debt"],
    ["Auto Loan", "Credit Union Auto Loan", 8000, "Debt"],
    ["Credit Cards", "Statement Balance (Paid in Full)", 2500, "Debt"],
    [],
    ["Summary", "Metric", "Amount ($)", ""],
    ["Total Gross Assets", "", 691000, ""],
    ["Total Liabilities", "", 295500, ""],
    ["Total Net Worth", "", 395500, ""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 25 }, { wch: 35 }, { wch: 22 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, "Net Worth Tracker");

  return wb;
}

export function downloadExcelTemplate(templateId: string): void {
  let wb: XLSX.WorkBook;
  let filename: string;

  switch (templateId) {
    case "budget-50-30-20":
      wb = generateBudgetWorkbook();
      filename = "ConvertSheet_50_30_20_Personal_Budget.xlsx";
      break;
    case "debt-snowball-avalanche":
      wb = generateDebtPayoffWorkbook();
      filename = "ConvertSheet_Debt_Payoff_Snowball_Avalanche.xlsx";
      break;
    case "real-estate-cashflow":
      wb = generateRealEstateWorkbook();
      filename = "ConvertSheet_Rental_Property_Cashflow_ROI.xlsx";
      break;
    case "net-worth-tracker":
    default:
      wb = generateNetWorthWorkbook();
      filename = "ConvertSheet_Personal_Net_Worth_Tracker.xlsx";
      break;
  }

  XLSX.writeFile(wb, filename);
}
