import { describe, it, expect } from "vitest";
import {
  EXCEL_TEMPLATES,
  generateBudgetWorkbook,
  generateDebtPayoffWorkbook,
  generateRealEstateWorkbook,
  generateNetWorthWorkbook,
} from "../excel-models";

describe("Excel Financial Models Generator", () => {
  it("provides 4 pre-configured financial templates", () => {
    expect(EXCEL_TEMPLATES.length).toBe(4);
    expect(EXCEL_TEMPLATES.map((t) => t.id)).toEqual([
      "budget-50-30-20",
      "debt-snowball-avalanche",
      "real-estate-cashflow",
      "net-worth-tracker",
    ]);
  });

  it("generates 50/30/20 budget workbook with multiple sheets", () => {
    const wb = generateBudgetWorkbook();
    expect(wb.SheetNames).toContain("Budget Summary");
    expect(wb.SheetNames).toContain("Expense Breakdown");

    const summarySheet = wb.Sheets["Budget Summary"];
    expect(summarySheet).toBeDefined();
  });

  it("generates debt payoff workbook", () => {
    const wb = generateDebtPayoffWorkbook();
    expect(wb.SheetNames).toContain("Debt Payoff Plan");
    expect(wb.Sheets["Debt Payoff Plan"]).toBeDefined();
  });

  it("generates real estate investment cashflow workbook", () => {
    const wb = generateRealEstateWorkbook();
    expect(wb.SheetNames).toContain("Rental Property Model");
    expect(wb.Sheets["Rental Property Model"]).toBeDefined();
  });

  it("generates personal net worth tracker workbook", () => {
    const wb = generateNetWorthWorkbook();
    expect(wb.SheetNames).toContain("Net Worth Tracker");
    expect(wb.Sheets["Net Worth Tracker"]).toBeDefined();
  });
});
