import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompoundInterestCalculator } from "../CompoundInterestCalculator";
import * as XLSX from "xlsx";

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    aoa_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe("CompoundInterestCalculator Component Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/tools/compound-interest-calculator");
  });

  it("renders with Zero-Knowledge privacy badge and default 5-year compounding metrics", () => {
    render(<CompoundInterestCalculator />);
    expect(
      screen.getByText(/100% Client-Side Privacy — Zero Financial Data Leaves Your Device/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Compound Interest Calculator")).toBeInTheDocument();
    expect(screen.getByText(/Exponential Yield/i)).toBeInTheDocument();
    expect(screen.getByText(/Compounding Projections/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Total Future Value/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Compound Interest Earned/i)).toBeInTheDocument();
    expect(screen.getByText(/Real Purchasing Power/i)).toBeInTheDocument();
  });

  it("hydrates from initialValues prop ($100k in 20 years) satisfying high-intent search query", () => {
    render(
      <CompoundInterestCalculator
        initialValues={{
          principal: 100000,
          annualRate: 8,
          years: 20,
          frequency: "12",
        }}
      />
    );

    // Direct Answer Box
    expect(screen.getByText(/Direct Answer: \$100,000 in 20 Years/i)).toBeInTheDocument();
    expect(screen.getByText(/retains approximately/i)).toBeInTheDocument();
  });

  it("triggers branded SheetJS Excel export with formulas on click", () => {
    render(<CompoundInterestCalculator />);
    const exportButtons = screen.getAllByRole("button", { name: /Export Formulaic Excel/i });
    expect(exportButtons.length).toBeGreaterThan(0);
    fireEvent.click(exportButtons[0]);

    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalled();
  });

  it("renders Market Rate Freshness Signal, 44px rate presets, and CalcSaveButton", () => {
    render(<CompoundInterestCalculator />);
    expect(screen.getByText(/Updated for October 2026/i)).toBeInTheDocument();
    
    // Check 44px preset touch targets
    const hysaPreset = screen.getByText("4.25% (HYSA)");
    expect(hysaPreset).toHaveClass("min-h-[44px]");
    fireEvent.click(hysaPreset);
    expect(window.location.search).toContain("annualRate=4.25");

    // Check CalcSaveButton presence
    expect(screen.getByText("Save Calculation")).toBeInTheDocument();
  });
});
