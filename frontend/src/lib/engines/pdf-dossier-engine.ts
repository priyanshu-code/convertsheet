import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface MortgageDossierInput {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  monthlyPAndI: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  totalMonthlyPayment: number;
  totalInterest: number;
  schedule: Array<{
    year: number;
    balance: number;
    principal: number;
    interest: number;
  }>;
}

export interface CarLoanDossierInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  interestRate: number;
  loanTermMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  schedule: Array<{
    year: number;
    balance: number;
    principal: number;
    interest: number;
  }>;
}

export interface SalaryDossierInput {
  grossSalary: number;
  netAnnualTakeHome: number;
  netMonthlyTakeHome: number;
  netBiWeeklyTakeHome: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  effectiveTaxRate: number;
  currencySymbol?: string;
  regimeLabel?: string;
}

export interface RetirementDossierInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturnPercent: number;
  nestEggAtRetirement: number;
  totalContributions: number;
  compoundGrowthEarned: number;
  monthlyRetirementIncome: number;
}

export async function generateMortgageDossierPdf(input: MortgageDossierInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: Executive Underwriting Summary
  const page1 = pdfDoc.addPage([612, 792]); // Standard US Letter (8.5 x 11 in)
  const { width, height } = page1.getSize();

  // Top Accent Banner
  page1.drawRectangle({
    x: 0,
    y: height - 8,
    width: width,
    height: 8,
    color: rgb(0.06, 0.72, 0.51), // Emerald #10b981
  });

  // Header
  page1.drawText("ConvertSheet Financial Intelligence", {
    x: 50,
    y: height - 40,
    size: 10,
    font: helveticaBold,
    color: rgb(0.06, 0.72, 0.51),
  });

  page1.drawText("MORTGAGE EXECUTIVE DOSSIER", {
    x: 50,
    y: height - 65,
    size: 20,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.12),
  });

  page1.drawText("Underwriting Summary, Amortization Schedule & Financial Breakdown", {
    x: 50,
    y: height - 82,
    size: 9,
    font: helvetica,
    color: rgb(0.45, 0.45, 0.48),
  });

  // Key KPI Box - Monthly Payment
  page1.drawRectangle({
    x: 50,
    y: height - 175,
    width: width - 100,
    height: 75,
    color: rgb(0.96, 0.98, 0.97),
    borderColor: rgb(0.8, 0.9, 0.85),
    borderWidth: 1,
  });

  page1.drawText("ESTIMATED TOTAL MONTHLY PAYMENT", {
    x: 70,
    y: height - 120,
    size: 9,
    font: helveticaBold,
    color: rgb(0.3, 0.4, 0.35),
  });

  page1.drawText("$" + Math.round(input.totalMonthlyPayment).toLocaleString() + "/mo", {
    x: 70,
    y: height - 152,
    size: 26,
    font: helveticaBold,
    color: rgb(0.06, 0.72, 0.51),
  });

  page1.drawText("Principal & Interest: $" + Math.round(input.monthlyPAndI).toLocaleString() + "  |  Taxes & Ins: $" + Math.round(input.monthlyPropertyTax + input.monthlyHomeInsurance).toLocaleString(), {
    x: 70,
    y: height - 168,
    size: 9,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Loan Facts Grid
  let yPos = height - 210;
  page1.drawText("LOAN PARAMETERS & FACT SHEET", {
    x: 50,
    y: yPos,
    size: 11,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.12),
  });

  const facts = [
    ["Home Purchase Price", "$" + input.homePrice.toLocaleString()],
    ["Down Payment Amount", "$" + input.downPayment.toLocaleString() + " (" + Math.round((input.downPayment / input.homePrice) * 100) + "%)"],
    ["Net Loan Amount (Financed)", "$" + (input.homePrice - input.downPayment).toLocaleString()],
    ["Annual Interest Rate", input.interestRate.toFixed(2) + "%"],
    ["Mortgage Loan Term", input.loanTermYears + " Years (" + (input.loanTermYears * 12) + " Months)"],
    ["Total Cumulative Interest Paid", "$" + Math.round(input.totalInterest).toLocaleString()],
    ["Total Cost Over Life of Loan", "$" + Math.round((input.homePrice - input.downPayment) + input.totalInterest).toLocaleString()],
  ];

  yPos -= 20;
  facts.forEach(([label, val], idx) => {
    const rowBg = idx % 2 === 0 ? rgb(0.98, 0.98, 0.99) : rgb(1, 1, 1);
    page1.drawRectangle({
      x: 50,
      y: yPos - 5,
      width: width - 100,
      height: 22,
      color: rowBg,
    });
    page1.drawText(label, { x: 60, y: yPos + 2, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    page1.drawText(val, { x: 380, y: yPos + 2, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    yPos -= 22;
  });

  // Financial Tips & Underwriting Advice
  yPos -= 20;
  page1.drawText("UNDERWRITING TAKEAWAYS & ADVICE", {
    x: 50,
    y: yPos,
    size: 11,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.12),
  });

  const tips = [
    "1. Private Mortgage Insurance (PMI): Can be canceled once principal loan balance reaches 80% LTV.",
    "2. Extra Principal Acceleration: Adding even $100/mo extra pays off loan 4-5 years ahead of schedule.",
    "3. Property Tax & Home Insurance: Escrow estimates adjust annually with municipal property tax reassessments.",
  ];

  yPos -= 18;
  tips.forEach((tip) => {
    page1.drawText(tip, { x: 50, y: yPos, size: 8.5, font: helvetica, color: rgb(0.35, 0.35, 0.38) });
    yPos -= 18;
  });

  // Page 1 Footer
  page1.drawText("Page 1 of 2  •  Generated on convertsheet.com  •  100% In-Browser Financial Engine", {
    x: 50,
    y: 35,
    size: 8,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Page 2: Annual Amortization Table
  const page2 = pdfDoc.addPage([612, 792]);
  page2.drawRectangle({ x: 0, y: height - 8, width: width, height: 8, color: rgb(0.06, 0.72, 0.51) });

  page2.drawText("MORTGAGE AMORTIZATION SCHEDULE", {
    x: 50,
    y: height - 45,
    size: 14,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.12),
  });

  page2.drawText("Annual Principal & Interest Balance Breakdown", {
    x: 50,
    y: height - 60,
    size: 9,
    font: helvetica,
    color: rgb(0.45, 0.45, 0.48),
  });

  // Table Header
  let tableY = height - 95;
  page2.drawRectangle({
    x: 50,
    y: tableY - 5,
    width: width - 100,
    height: 24,
    color: rgb(0.93, 0.94, 0.96),
  });

  page2.drawText("Year", { x: 65, y: tableY + 3, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.25) });
  page2.drawText("Principal Paid", { x: 160, y: tableY + 3, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.25) });
  page2.drawText("Interest Paid", { x: 280, y: tableY + 3, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.25) });
  page2.drawText("Remaining Balance", { x: 410, y: tableY + 3, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.25) });

  tableY -= 24;
  const rowsToShow = input.schedule.slice(0, 25);
  rowsToShow.forEach((row, idx) => {
    const rowColor = idx % 2 === 0 ? rgb(0.98, 0.98, 0.99) : rgb(1, 1, 1);
    page2.drawRectangle({
      x: 50,
      y: tableY - 4,
      width: width - 100,
      height: 20,
      color: rowColor,
    });

    page2.drawText("Year " + row.year, { x: 65, y: tableY + 2, size: 8.5, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    page2.drawText("$" + Math.round(row.principal).toLocaleString(), { x: 160, y: tableY + 2, size: 8.5, font: helvetica, color: rgb(0.1, 0.6, 0.3) });
    page2.drawText("$" + Math.round(row.interest).toLocaleString(), { x: 280, y: tableY + 2, size: 8.5, font: helvetica, color: rgb(0.8, 0.3, 0.2) });
    page2.drawText("$" + Math.round(row.balance).toLocaleString(), { x: 410, y: tableY + 2, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    tableY -= 20;
  });

  // Disclaimer
  page2.drawText("Disclaimer: This document is provided for educational and modeling purposes only. ConvertSheet is an independent software tool", {
    x: 50,
    y: 50,
    size: 7.5,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  page2.drawText("and does not make loan offers or underwriting commitments. Always consult a licensed mortgage originator or financial advisor.", {
    x: 50,
    y: 40,
    size: 7.5,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  page2.drawText("Page 2 of 2  •  convertsheet.com", {
    x: 50,
    y: 25,
    size: 8,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}

export async function generateCarLoanDossierPdf(input: CarLoanDossierInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: height - 8, width: width, height: 8, color: rgb(0.06, 0.72, 0.51) });

  page.drawText("AUTO LOAN FINANCING DOSSIER", {
    x: 50,
    y: height - 50,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.12),
  });

  page.drawText("Monthly Payment, Total Cost & Depreciation Balance Schedule", {
    x: 50,
    y: height - 68,
    size: 9,
    font: helvetica,
    color: rgb(0.45, 0.45, 0.48),
  });

  // Monthly Box
  page.drawRectangle({
    x: 50,
    y: height - 155,
    width: width - 100,
    height: 70,
    color: rgb(0.96, 0.98, 0.97),
    borderColor: rgb(0.8, 0.9, 0.85),
    borderWidth: 1,
  });

  page.drawText("ESTIMATED MONTHLY LOAN PAYMENT", {
    x: 70,
    y: height - 105,
    size: 9,
    font: helveticaBold,
    color: rgb(0.3, 0.4, 0.35),
  });

  page.drawText("$" + Math.round(input.monthlyPayment).toLocaleString() + "/mo", {
    x: 70,
    y: height - 138,
    size: 24,
    font: helveticaBold,
    color: rgb(0.06, 0.72, 0.51),
  });

  let y = height - 185;
  const carFacts = [
    ["Vehicle Purchase Price", "$" + input.vehiclePrice.toLocaleString()],
    ["Down Payment + Trade-In Value", "$" + (input.downPayment + input.tradeInValue).toLocaleString()],
    ["Net Amount Financed", "$" + (input.vehiclePrice - input.downPayment - input.tradeInValue).toLocaleString()],
    ["Annual Interest Rate (APR)", input.interestRate.toFixed(2) + "%"],
    ["Loan Duration", input.loanTermMonths + " Months (" + (input.loanTermMonths / 12).toFixed(1) + " Years)"],
    ["Total Interest Paid", "$" + Math.round(input.totalInterest).toLocaleString()],
    ["Total Purchase Cost", "$" + Math.round(input.totalCost).toLocaleString()],
  ];

  carFacts.forEach(([lbl, val], idx) => {
    const bg = idx % 2 === 0 ? rgb(0.98, 0.98, 0.99) : rgb(1, 1, 1);
    page.drawRectangle({ x: 50, y: y - 5, width: width - 100, height: 22, color: bg });
    page.drawText(lbl, { x: 60, y: y + 2, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(val, { x: 380, y: y + 2, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  });

  page.drawText("Page 1 of 1  •  Generated on convertsheet.com  •  100% In-Browser Privacy", {
    x: 50,
    y: 30,
    size: 8,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}

export async function generateSalaryDossierPdf(input: SalaryDossierInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  const sym = input.currencySymbol || "$";

  // Top Accent Banner
  page.drawRectangle({ x: 0, y: height - 8, width: width, height: 8, color: rgb(0.06, 0.72, 0.51) });

  page.drawText("EXECUTIVE SALARY & TAX DOSSIER", {
    x: 50,
    y: height - 50,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.12),
  });

  page.drawText(
    `${input.regimeLabel || "Annual"} Take-Home Paycheck Analysis & Mandatory Tax Deductions`,
    {
      x: 50,
      y: height - 68,
      size: 9,
      font: helvetica,
      color: rgb(0.45, 0.45, 0.48),
    }
  );

  // Key KPI Box - Net Monthly Take-Home
  page.drawRectangle({
    x: 50,
    y: height - 155,
    width: width - 100,
    height: 70,
    color: rgb(0.96, 0.98, 0.97),
    borderColor: rgb(0.8, 0.9, 0.85),
    borderWidth: 1,
  });

  page.drawText("ESTIMATED NET MONTHLY IN-HAND PAY", {
    x: 70,
    y: height - 105,
    size: 9,
    font: helveticaBold,
    color: rgb(0.3, 0.4, 0.35),
  });

  page.drawText(`${sym}${Math.round(input.netMonthlyTakeHome).toLocaleString()}/mo`, {
    x: 70,
    y: height - 138,
    size: 24,
    font: helveticaBold,
    color: rgb(0.06, 0.72, 0.51),
  });

  let y = height - 185;
  const salaryFacts = [
    ["Gross Annual Earnings", `${sym}${Math.round(input.grossSalary).toLocaleString()}`],
    ["Net Annual Take-Home Pay", `${sym}${Math.round(input.netAnnualTakeHome).toLocaleString()}`],
    ["Bi-Weekly Paycheck (26 Periods)", `${sym}${Math.round(input.netBiWeeklyTakeHome).toLocaleString()}`],
    ["Federal / National Income Tax", `${sym}${Math.round(input.federalTax).toLocaleString()}`],
    ["State / Provincial Tax", `${sym}${Math.round(input.stateTax).toLocaleString()}`],
    ["FICA / Payroll / Pension Deductions", `${sym}${Math.round(input.ficaTax).toLocaleString()}`],
    ["Effective Tax Rate", `${input.effectiveTaxRate.toFixed(2)}%`],
  ];

  salaryFacts.forEach(([lbl, val], idx) => {
    const bg = idx % 2 === 0 ? rgb(0.98, 0.98, 0.99) : rgb(1, 1, 1);
    page.drawRectangle({ x: 50, y: y - 5, width: width - 100, height: 22, color: bg });
    page.drawText(lbl, { x: 60, y: y + 2, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(val, { x: 380, y: y + 2, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  });

  page.drawText("Page 1 of 1  •  Generated on convertsheet.com  •  100% In-Browser Privacy", {
    x: 50,
    y: 30,
    size: 8,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}

export async function generateRetirementDossierPdf(
  input: RetirementDossierInput
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  // Top Accent Banner
  page.drawRectangle({ x: 0, y: height - 8, width: width, height: 8, color: rgb(0.06, 0.72, 0.51) });

  page.drawText("RETIREMENT NEST EGG DOSSIER", {
    x: 50,
    y: height - 50,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.12),
  });

  page.drawText(
    "Compound Wealth Accumulation, Contributions vs Interest & Safe Withdrawal Summary",
    {
      x: 50,
      y: height - 68,
      size: 9,
      font: helvetica,
      color: rgb(0.45, 0.45, 0.48),
    }
  );

  // Key KPI Box - Nest Egg at Retirement
  page.drawRectangle({
    x: 50,
    y: height - 155,
    width: width - 100,
    height: 70,
    color: rgb(0.96, 0.98, 0.97),
    borderColor: rgb(0.8, 0.9, 0.85),
    borderWidth: 1,
  });

  page.drawText("PROJECTED NEST EGG AT RETIREMENT", {
    x: 70,
    y: height - 105,
    size: 9,
    font: helveticaBold,
    color: rgb(0.3, 0.4, 0.35),
  });

  page.drawText("$" + Math.round(input.nestEggAtRetirement).toLocaleString(), {
    x: 70,
    y: height - 138,
    size: 24,
    font: helveticaBold,
    color: rgb(0.06, 0.72, 0.51),
  });

  let y = height - 185;
  const retireFacts = [
    ["Current Age / Target Retirement Age", `${input.currentAge} Years / ${input.retirementAge} Years`],
    ["Accumulation Investment Horizon", `${input.retirementAge - input.currentAge} Years`],
    ["Current Starting Capital", "$" + Math.round(input.currentSavings).toLocaleString()],
    ["Monthly Contribution", "$" + Math.round(input.monthlyContribution).toLocaleString() + "/mo"],
    ["Assumed Annual Rate of Return", `${input.annualReturnPercent.toFixed(2)}%`],
    ["Total Out-of-Pocket Contributions", "$" + Math.round(input.totalContributions).toLocaleString()],
    ["Compound Growth & Interest Earned", "$" + Math.round(input.compoundGrowthEarned).toLocaleString()],
    ["Estimated 4% Safe Monthly Income", "$" + Math.round(input.monthlyRetirementIncome).toLocaleString() + "/mo"],
  ];

  retireFacts.forEach(([lbl, val], idx) => {
    const bg = idx % 2 === 0 ? rgb(0.98, 0.98, 0.99) : rgb(1, 1, 1);
    page.drawRectangle({ x: 50, y: y - 5, width: width - 100, height: 22, color: bg });
    page.drawText(lbl, { x: 60, y: y + 2, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(val, { x: 380, y: y + 2, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  });

  page.drawText("Page 1 of 1  •  Generated on convertsheet.com  •  100% In-Browser Privacy", {
    x: 50,
    y: 30,
    size: 8,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}

