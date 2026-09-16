import { describe, it, expect, beforeEach } from "vitest";
import {
  getSavedCalculations,
  saveCalculation,
  removeSavedCalculation,
  clearAllSavedCalculations,
} from "@/lib/calculation-history";

describe("calculation-history", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when no calculations are saved", () => {
    const list = getSavedCalculations();
    expect(list).toEqual([]);
  });

  it("saves a new calculation and retrieves it ordered by most recent", () => {
    saveCalculation({
      toolSlug: "mortgage-calculator",
      toolName: "Mortgage Calculator",
      summaryTitle: "$400k Home @ 6.5%",
      summaryMetrics: [{ label: "Monthly", value: "$2,528" }],
      path: "/tools/mortgage-calculator",
    });

    saveCalculation({
      toolSlug: "high-yield-savings-cd-calculator",
      toolName: "HYSA Calculator",
      summaryTitle: "$25,000 at 4.5% APY",
      summaryMetrics: [{ label: "Yield", value: "$1,125" }],
      path: "/tools/high-yield-savings-cd-calculator",
    });

    const saved = getSavedCalculations();
    expect(saved.length).toBe(2);
    expect(saved[0].summaryTitle).toBe("$25,000 at 4.5% APY");
    expect(saved[1].summaryTitle).toBe("$400k Home @ 6.5%");
  });

  it("deduplicates calculation with identical summaryTitle", () => {
    saveCalculation({
      toolSlug: "mortgage-calculator",
      toolName: "Mortgage Calculator",
      summaryTitle: "$400,000 Loan",
      summaryMetrics: [{ label: "Monthly", value: "$2,000" }],
      path: "/tools/mortgage-calculator",
    });

    saveCalculation({
      toolSlug: "mortgage-calculator",
      toolName: "Mortgage Calculator",
      summaryTitle: "$400,000 Loan",
      summaryMetrics: [{ label: "Monthly", value: "$2,100" }],
      path: "/tools/mortgage-calculator",
    });

    const saved = getSavedCalculations();
    expect(saved.length).toBe(1);
    expect(saved[0].summaryMetrics[0].value).toBe("$2,100");
  });

  it("deletes a calculation by id", () => {
    const created = saveCalculation({
      toolSlug: "credit-card-payoff-calculator",
      toolName: "Debt Payoff",
      summaryTitle: "$10,000 Balance",
      summaryMetrics: [],
      path: "/tools/credit-card-payoff-calculator",
    });

    expect(getSavedCalculations().length).toBe(1);

    removeSavedCalculation(created.id);
    expect(getSavedCalculations().length).toBe(0);
  });

  it("clears all saved calculations", () => {
    saveCalculation({
      toolSlug: "s1",
      toolName: "T1",
      summaryTitle: "Title 1",
      summaryMetrics: [],
      path: "/t1",
    });
    saveCalculation({
      toolSlug: "s2",
      toolName: "T2",
      summaryTitle: "Title 2",
      summaryMetrics: [],
      path: "/t2",
    });

    expect(getSavedCalculations().length).toBe(2);
    clearAllSavedCalculations();
    expect(getSavedCalculations().length).toBe(0);
  });
});
