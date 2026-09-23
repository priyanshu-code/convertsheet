import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CarLeaseVsBuyMatrix } from "../CarLeaseVsBuyMatrix";
import * as XLSX from "xlsx";

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe("CarLeaseVsBuyMatrix Component", () => {
  const defaultProps = {
    vehiclePrice: 35000,
    downPayment: 5000,
    tradeInValue: 3000,
    interestRate: 5.9,
    loanTermMonths: 36,
    salesTaxPercent: 7.0,
    dealerFees: 500,
  };

  it("renders side-by-side comparison with monthly payments and equity", () => {
    render(<CarLeaseVsBuyMatrix {...defaultProps} />);

    expect(screen.getByText(/Lease vs\. Buy Side-by-Side Comparison/i)).toBeInTheDocument();
    expect(screen.getByText("Option A: Purchase (Loan)")).toBeInTheDocument();
    expect(screen.getByText("Option B: Lease (36-Month)")).toBeInTheDocument();

    // Check equity breakdown
    expect(screen.getByText("+$18,200")).toBeInTheDocument(); // Purchase equity
    expect(screen.getByText("$0 (Car Returned)")).toBeInTheDocument(); // Lease equity

    // Check mileage restrictions
    expect(screen.getByText("None (Unlimited)")).toBeInTheDocument();
    expect(screen.getByText("12,000 Miles / Year")).toBeInTheDocument();

    // Check verdict banner
    expect(screen.getByText(/Financial Recommendation:/i)).toBeInTheDocument();
  });

  it("triggers XLSX export when Download Comparison is clicked", () => {
    render(<CarLeaseVsBuyMatrix {...defaultProps} />);

    const downloadBtn = screen.getByRole("button", { name: /Download Comparison \(\.xlsx\)/i });
    fireEvent.click(downloadBtn);

    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalled();
  });
});
