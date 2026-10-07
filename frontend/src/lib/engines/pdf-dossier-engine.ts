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

export interface RateHikeDossierInput {
  loanAmount: number;
  oldRate: number;
  newRate: number;
  rateDeltaBps: number;
  tenureYears: number;
  oldEmi: number;
  newEmi: number;
  monthlyHike: number;
  extraLifetimeInterest: number;
  addedMonthsToTenure: number;
  extraInterestIfTenureExtended: number;
  monthlyPrepaymentToNeutralize: number;
  currencySymbol?: string;
}

export async function generateRateHikeDossierPdf(input: RateHikeDossierInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  const rawSym = input.currencySymbol || "INR";
  const sym = rawSym === "₹" ? "Rs." : rawSym;

  // Top Accent Banner
  page.drawRectangle({
    x: 0,
    y: height - 8,
    width: width,
    height: 8,
    color: rgb(0.85, 0.15, 0.25), // Red / Rose accent
  });

  // Header
  page.drawText("ConvertSheet Financial Intelligence", {
    x: 50,
    y: height - 40,
    size: 10,
    font: helveticaBold,
    color: rgb(0.06, 0.72, 0.51),
  });

  page.drawText("INTEREST RATE HIKE IMPACT DOSSIER", {
    x: 50,
    y: height - 65,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.12),
  });

  page.drawText(`Loan Amortization Delta, Monthly EMI Hike & Silent Tenure Trap Audit`, {
    x: 50,
    y: height - 82,
    size: 9,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Highlight Box: Monthly Hike & Lifetime Extra Interest
  page.drawRectangle({
    x: 50,
    y: height - 150,
    width: width - 100,
    height: 55,
    color: rgb(0.99, 0.94, 0.95), // Light rose
    borderColor: rgb(0.9, 0.6, 0.65),
    borderWidth: 1,
  });

  page.drawText("MONTHLY EMI HIKE", {
    x: 70,
    y: height - 110,
    size: 8,
    font: helveticaBold,
    color: rgb(0.6, 0.1, 0.2),
  });

  page.drawText(`+${sym} ${Math.round(input.monthlyHike).toLocaleString()} /mo`, {
    x: 70,
    y: height - 135,
    size: 18,
    font: helveticaBold,
    color: rgb(0.85, 0.15, 0.25),
  });

  page.drawText("CUMULATIVE EXTRA INTEREST", {
    x: 320,
    y: height - 110,
    size: 8,
    font: helveticaBold,
    color: rgb(0.6, 0.1, 0.2),
  });

  page.drawText(`+${sym} ${Math.round(input.extraLifetimeInterest).toLocaleString()}`, {
    x: 320,
    y: height - 135,
    size: 18,
    font: helveticaBold,
    color: rgb(0.85, 0.15, 0.25),
  });

  // Table of Parameters
  let y = height - 180;
  const auditFacts = [
    ["Loan Principal Outstanding", `${sym} ${Math.round(input.loanAmount).toLocaleString()}`],
    ["Original Rate & New Benchmark Rate", `${input.oldRate.toFixed(2)}% -> ${input.newRate.toFixed(2)}% (+${input.rateDeltaBps} bps)`],
    ["Original Repayment Tenure", `${input.tenureYears} Years (${input.tenureYears * 12} Months)`],
    ["Old Monthly Installment (Previous EMI)", `${sym} ${Math.round(input.oldEmi).toLocaleString()} /mo`],
    ["Revised Monthly Installment (New EMI)", `${sym} ${Math.round(input.newEmi).toLocaleString()} /mo`],
    ["Monthly EMI Increase (Option A)", `+${sym} ${Math.round(input.monthlyHike).toLocaleString()} /mo`],
    ["Silent Tenure Trap Penalty (Option B)", `+${input.addedMonthsToTenure} Months added (Extra Int: +${sym} ${Math.round(input.extraInterestIfTenureExtended).toLocaleString()})`],
    ["Prepayment Countermeasure to Neutralize", `Prepay +${sym} ${Math.round(input.monthlyPrepaymentToNeutralize).toLocaleString()} /mo to preserve original term`],
  ];

  auditFacts.forEach(([lbl, val], idx) => {
    const bg = idx % 2 === 0 ? rgb(0.97, 0.98, 0.98) : rgb(1, 1, 1);
    page.drawRectangle({ x: 50, y: y - 5, width: width - 100, height: 22, color: bg });
    page.drawText(lbl, { x: 60, y: y + 2, size: 8.5, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(val, { x: 290, y: y + 2, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  });

  // Strategic Advisory Box
  y -= 15;
  page.drawRectangle({
    x: 50,
    y: y - 80,
    width: width - 100,
    height: 85,
    color: rgb(0.95, 0.98, 0.96),
    borderColor: rgb(0.5, 0.8, 0.6),
    borderWidth: 1,
  });

  page.drawText("EXECUTIVE BORROWER ADVISORY:", {
    x: 65,
    y: y - 15,
    size: 9,
    font: helveticaBold,
    color: rgb(0.1, 0.5, 0.3),
  });

  const recommendations = [
    "1. Instruct your bank in writing to absorb the hike via revised EMI rather than tenure extension.",
    `2. Prepay ${sym} ${Math.round(input.monthlyPrepaymentToNeutralize).toLocaleString()}/month to keep total loan interest identical to pre-hike levels.`,
    "3. Check your lender's spread margin; pay a nominal conversion fee if new borrowers receive lower rates.",
    "4. Under RBI guidelines, individual floating-rate home loans carry 0% prepayment penalties.",
  ];

  recommendations.forEach((rec, rIdx) => {
    page.drawText(rec, {
      x: 65,
      y: y - 32 - (rIdx * 13),
      size: 7.5,
      font: helvetica,
      color: rgb(0.2, 0.25, 0.2),
    });
  });

  // Footer
  page.drawText("Generated locally via ConvertSheet (convertsheet.com)  •  100% In-Browser Private Computation", {
    x: 50,
    y: 30,
    size: 7.5,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}

// ==========================================
// 8. HOME LOAN BALANCE TRANSFER DOSSIER
// ==========================================

export interface BalanceTransferDossierData {
  currentBalance: number;
  currentRate: number;
  newRate: number;
  rateCutPercent: number;
  rateCutBps: number;
  remainingTenureYears: number;
  currentEmi: number;
  newEmi: number;
  monthlySavings: number;
  annualSavings: number;
  grossLifetimeSavings: number;
  processingFeeAmount: number;
  modtStampDutyAmount: number;
  otherCharges: number;
  totalSwitchingCost: number;
  netLifetimeSavings: number;
  breakEvenMonths: number;
  recommendation: string;
  recommendationReason: string;
  currencySymbol?: string;
}

export async function generateBalanceTransferDossierPdf(input: BalanceTransferDossierData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  const rawSym = input.currencySymbol || "INR";
  const sym = rawSym === "₹" ? "Rs." : rawSym;

  // Top header bar
  page.drawRectangle({
    x: 0,
    y: height - 10,
    width: width,
    height: 10,
    color: rgb(0.06, 0.72, 0.51), // Emerald
  });

  // Header
  page.drawText("CONVERTSHEET MORTGAGE LABS", {
    x: 50,
    y: height - 42,
    size: 10,
    font: helveticaBold,
    color: rgb(0.06, 0.72, 0.51),
  });

  page.drawText("Home Loan Balance Transfer Audit Dossier", {
    x: 50,
    y: height - 64,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.12),
  });

  page.drawText(`Confidential Switching Feasibility Report  |  Generated ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, {
    x: 50,
    y: height - 80,
    size: 8.5,
    font: helvetica,
    color: rgb(0.45, 0.45, 0.48),
  });

  // Primary Net Savings Banner
  const isPositive = input.netLifetimeSavings > 0;
  page.drawRectangle({
    x: 50,
    y: height - 150,
    width: width - 100,
    height: 55,
    color: isPositive ? rgb(0.92, 0.98, 0.94) : rgb(0.99, 0.94, 0.94),
    borderColor: isPositive ? rgb(0.3, 0.75, 0.45) : rgb(0.85, 0.35, 0.35),
    borderWidth: 1,
  });

  page.drawText("NET LIFETIME SAVINGS (AFTER ALL FEES & STAMP DUTY):", {
    x: 65,
    y: height - 114,
    size: 9,
    font: helveticaBold,
    color: isPositive ? rgb(0.1, 0.5, 0.3) : rgb(0.7, 0.2, 0.2),
  });

  page.drawText(`${sym} ${Math.round(input.netLifetimeSavings).toLocaleString()}`, {
    x: 65,
    y: height - 140,
    size: 22,
    font: helveticaBold,
    color: isPositive ? rgb(0.06, 0.55, 0.32) : rgb(0.8, 0.15, 0.15),
  });

  page.drawText(`Break-Even: ${input.breakEvenMonths} Months  |  Monthly EMI Cut: ${sym} ${Math.round(input.monthlySavings).toLocaleString()}/mo`, {
    x: 310,
    y: height - 134,
    size: 8.5,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.25),
  });

  // Comparison Parameters Table
  let y = height - 180;
  const auditFacts = [
    ["Outstanding Loan Principal", `${sym} ${Math.round(input.currentBalance).toLocaleString()}`],
    ["Interest Rate Reduction", `${input.currentRate.toFixed(2)}% -> ${input.newRate.toFixed(2)}% (-${input.rateCutBps} bps / -${input.rateCutPercent.toFixed(2)}%)`],
    ["Remaining Loan Tenure", `${input.remainingTenureYears} Years (${input.remainingTenureYears * 12} Months)`],
    ["Current Monthly EMI", `${sym} ${Math.round(input.currentEmi).toLocaleString()} /mo`],
    ["New Monthly EMI (After Transfer)", `${sym} ${Math.round(input.newEmi).toLocaleString()} /mo`],
    ["Gross Lifetime Interest Saved", `${sym} ${Math.round(input.grossLifetimeSavings).toLocaleString()}`],
    ["Switching Costs (MODT + Processing + Legal)", `${sym} ${Math.round(input.totalSwitchingCost).toLocaleString()} (Proc: ${sym}${Math.round(input.processingFeeAmount).toLocaleString()}, MODT: ${sym}${Math.round(input.modtStampDutyAmount).toLocaleString()})`],
    ["Break-Even Payback Period", `${input.breakEvenMonths} Months to recover all upfront switching charges`],
  ];

  auditFacts.forEach(([lbl, val], idx) => {
    const bg = idx % 2 === 0 ? rgb(0.97, 0.98, 0.98) : rgb(1, 1, 1);
    page.drawRectangle({ x: 50, y: y - 5, width: width - 100, height: 22, color: bg });
    page.drawText(lbl, { x: 60, y: y + 2, size: 8.5, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(val, { x: 280, y: y + 2, size: 8, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  });

  // Verdict Box
  y -= 15;
  page.drawRectangle({
    x: 50,
    y: y - 85,
    width: width - 100,
    height: 90,
    color: rgb(0.95, 0.98, 0.96),
    borderColor: rgb(0.5, 0.8, 0.6),
    borderWidth: 1,
  });

  page.drawText(`VERDICT: ${input.recommendation.toUpperCase()}`, {
    x: 65,
    y: y - 16,
    size: 10,
    font: helveticaBold,
    color: rgb(0.1, 0.5, 0.3),
  });

  const cleanReason = (input.recommendationReason || "")
    .replace(/₹/g, "Rs.")
    .replace(/–/g, "-")
    .replace(/—/g, "-");

  page.drawText(cleanReason, {
    x: 65,
    y: y - 32,
    size: 8,
    font: helvetica,
    color: rgb(0.2, 0.25, 0.2),
  });

  const tips = [
    "Step 1: Request an internal rate reduction from your current bank first (usually costs only Rs.1,000-5,000 repricing fee).",
    "Step 2: If moving to a new bank, ask them to waive processing fees under festive or balance transfer campaigns.",
    "Step 3: Ensure your original title deed and Encumbrance Certificate (EC) can be released within 15-30 days.",
  ];

  tips.forEach((tip, tIdx) => {
    page.drawText(tip, {
      x: 65,
      y: y - 48 - (tIdx * 12),
      size: 7.5,
      font: helvetica,
      color: rgb(0.25, 0.3, 0.25),
    });
  });

  // Footer
  page.drawText("Generated locally via ConvertSheet (convertsheet.com)  •  100% In-Browser Private Computation", {
    x: 50,
    y: 30,
    size: 7.5,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}



