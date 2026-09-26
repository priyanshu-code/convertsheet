import { describe, it, expect } from "vitest";
import {
  generateMortgageDossierPdf,
  generateCarLoanDossierPdf,
  generateSalaryDossierPdf,
  generateRetirementDossierPdf,
} from "@/lib/engines/pdf-dossier-engine";
import { PDFDocument } from "pdf-lib";

describe("PDF Dossier Engine", () => {
  it("generates a valid mortgage PDF dossier with 2 pages", async () => {
    const pdfBytes = await generateMortgageDossierPdf({
      homePrice: 400000,
      downPayment: 80000,
      interestRate: 6.5,
      loanTermYears: 30,
      monthlyPAndI: 2023,
      monthlyPropertyTax: 400,
      monthlyHomeInsurance: 100,
      totalMonthlyPayment: 2523,
      totalInterest: 408170,
      schedule: [
        { year: 1, balance: 315000, principal: 5000, interest: 20000 },
        { year: 2, balance: 309000, principal: 6000, interest: 19000 },
      ],
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getPageCount()).toBe(2);
  });

  it("generates a valid car loan PDF dossier", async () => {
    const pdfBytes = await generateCarLoanDossierPdf({
      vehiclePrice: 35000,
      downPayment: 5000,
      tradeInValue: 2000,
      interestRate: 5.9,
      loanTermMonths: 60,
      monthlyPayment: 562,
      totalInterest: 4720,
      totalCost: 38720,
      schedule: [
        { year: 1, balance: 23000, principal: 5000, interest: 1740 },
        { year: 2, balance: 17500, principal: 5500, interest: 1240 },
      ],
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("generates a valid salary PDF dossier", async () => {
    const pdfBytes = await generateSalaryDossierPdf({
      grossSalary: 100000,
      netAnnualTakeHome: 78090,
      netMonthlyTakeHome: 6507,
      netBiWeeklyTakeHome: 3003,
      federalTax: 14260,
      stateTax: 0,
      ficaTax: 7650,
      effectiveTaxRate: 21.91,
      currencySymbol: "$",
      regimeLabel: "US 2026",
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getPageCount()).toBe(1);
  });

  it("generates a valid retirement nest egg PDF dossier", async () => {
    const pdfBytes = await generateRetirementDossierPdf({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      annualReturnPercent: 8.0,
      nestEggAtRetirement: 2478000,
      totalContributions: 470000,
      compoundGrowthEarned: 2008000,
      monthlyRetirementIncome: 8260,
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getPageCount()).toBe(1);
  });
});

